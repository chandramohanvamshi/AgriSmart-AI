import type { Express, Request, Response } from "express";
import multer from "multer";
import { 
  createFarmSchema, 
  createAdvisorySchema, 
  diagnosticUploadSchema 
} from "../shared/schema.js";
import { storage } from "./storage.js";
import { 
  generateCropAdvisory, 
  analyzePlantDisease, 
  isGeminiConfigured 
} from "./lib/gemini.js";

// Multer memory storage with 5MB bound and strictly restricted MIME types
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."));
    }
  }
});

export async function registerRoutes(app: Express) {
  // System Status Check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      system: "AgriSmart AI: Decision Support System",
      geminiConfigured: isGeminiConfigured,
      timestamp: new Date().toISOString()
    });
  });

  // Current User / Preference Profile
  app.get("/api/user/current", async (_req, res) => {
    try {
      let user = await storage.getUser(1);
      if (!user) {
        user = await storage.createUser({
          email: "farmer@agrismart.ai",
          fullName: "Primary Field Operator",
          preferredLanguage: "en",
        });
      }
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/user/language", async (req, res) => {
    try {
      const { language } = req.body;
      if (!language || typeof language !== "string") {
        return res.status(400).json({ error: "Language code required" });
      }
      const updated = await storage.updateUserLanguage(1, language);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Farms: POST /api/farms
  app.post("/api/farms", async (req, res) => {
    try {
      const parsed = createFarmSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: parsed.error.flatten().fieldErrors 
        });
      }

      const farm = await storage.createFarmProfile({
        ...parsed.data,
        userId: 1,
        farmSizeAcres: String(parsed.data.farmSizeAcres),
        soilPh: parsed.data.soilPh !== undefined && parsed.data.soilPh !== null ? String(parsed.data.soilPh) : null,
      });

      res.status(201).json(farm);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Farms: GET /api/farms
  app.get("/api/farms", async (_req, res) => {
    try {
      const farms = await storage.getFarmProfiles();
      res.json(farms);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Farms: GET /api/farms/:id
  app.get("/api/farms/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid farm ID" });
      }
      const farm = await storage.getFarmProfile(id);
      if (!farm) {
        return res.status(404).json({ error: "Farm not found" });
      }
      res.json(farm);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Advisory: POST /api/advisory/generate
  app.post("/api/advisory/generate", async (req, res) => {
    try {
      const parsed = createAdvisorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: parsed.error.flatten().fieldErrors 
        });
      }

      const farm = await storage.getFarmProfile(parsed.data.farmProfileId);
      if (!farm) {
        return res.status(404).json({ error: "Associated farm profile not found" });
      }

      // Check user language preference
      const user = await storage.getUser(1);
      const language = user?.preferredLanguage || "en";

      // 1. Save Advisory Request
      const requestRecord = await storage.createAdvisoryRequest({
        farmProfileId: parsed.data.farmProfileId,
        targetSeason: parsed.data.targetSeason,
        budgetLevel: parsed.data.budgetLevel,
        nitrogenLevelPpm: parsed.data.nitrogenLevelPpm ? String(parsed.data.nitrogenLevelPpm) : null,
        phosphorusLevelPpm: parsed.data.phosphorusLevelPpm ? String(parsed.data.phosphorusLevelPpm) : null,
        potassiumLevelPpm: parsed.data.potassiumLevelPpm ? String(parsed.data.potassiumLevelPpm) : null,
        rawUserNotes: parsed.data.rawUserNotes || null,
      });

      // 2. Call Gemini AI reasoning engine with JSON schema enforcement
      const aiAdvisory = await generateCropAdvisory(farm, parsed.data, language);

      // 3. Persist AI Output to Storage
      const outputRecord = await storage.createAdvisoryOutput({
        advisoryRequestId: requestRecord.id,
        recommendedCrop: aiAdvisory.recommendedCrop,
        reasoningSummary: aiAdvisory.reasoningSummary,
        secondaryCropOptions: aiAdvisory.secondaryCropOptions,
        suitabilityScore: aiAdvisory.suitabilityScore,
        fertilizerSchedule: aiAdvisory.fertilizerSchedule,
        irrigationPlan: aiAdvisory.irrigationPlan,
        pestDiseaseRisks: aiAdvisory.pestDiseaseRisks,
        financialProjections: aiAdvisory.financialProjections,
        rawAiResponse: {
          aiAdvisory,
          geminiConfigured: isGeminiConfigured,
          generatedAt: new Date().toISOString()
        },
      });

      // 4. Return Full Result with joined relationships
      const fullDetails = await storage.getAdvisoryWithDetails(outputRecord.id);
      res.status(201).json(fullDetails);
    } catch (err: any) {
      console.error("Advisory generation error:", err);
      res.status(500).json({ error: err.message || "Failed to generate advisory" });
    }
  });

  // Advisory: GET /api/advisory/:id
  app.get("/api/advisory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid advisory ID" });
      }
      const advisory = await storage.getAdvisoryWithDetails(id);
      if (!advisory) {
        return res.status(404).json({ error: "Advisory report not found" });
      }
      res.json(advisory);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Advisory History: GET /api/advisory/history
  app.get("/api/advisory/history", async (req, res) => {
    try {
      const farmId = req.query.farmId ? parseInt(String(req.query.farmId), 10) : undefined;
      const history = await storage.getAdvisoriesHistory(farmId);
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Diagnostics: POST /api/diagnostics/analyze
  // Supports both multipart/form-data upload and JSON base64 payloads
  app.post("/api/diagnostics/analyze", upload.single("image"), async (req, res) => {
    try {
      let imageBase64 = "";
      let mimeType = "image/jpeg";
      let imageUrl = "";

      if (req.file) {
        imageBase64 = req.file.buffer.toString("base64");
        mimeType = req.file.mimetype;
        imageUrl = `data:${mimeType};base64,${imageBase64}`;
      } else if (req.body.imageBase64) {
        imageBase64 = req.body.imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
        mimeType = req.body.mimeType || "image/jpeg";
        imageUrl = req.body.imageBase64.startsWith("data:") ? req.body.imageBase64 : `data:${mimeType};base64,${imageBase64}`;
      } else if (req.body.imageUrl) {
        imageUrl = req.body.imageUrl;
      } else {
        return res.status(400).json({ error: "Please provide an image file or base64 photo." });
      }

      const cropHint = req.body.cropType || req.body.cropHint;
      const symptomsHint = req.body.observedSymptoms || req.body.symptomsHint;
      const farmProfileId = req.body.farmProfileId ? parseInt(String(req.body.farmProfileId), 10) : undefined;
      const language = req.body.language || "en";

      // Multimodal Gemini analysis
      const analysisResult = await analyzePlantDisease(
        imageBase64,
        mimeType,
        cropHint,
        symptomsHint,
        language
      );

      // Persist diagnostic record
      const record = await storage.createDiagnosticRecord({
        farmProfileId: farmProfileId ?? null,
        imageUrl: imageUrl.length > 500000 ? "data:image/jpeg;base64,uploaded_scanned_specimen" : imageUrl,
        detectedIssue: analysisResult.detectedIssue,
        severityLevel: analysisResult.severityLevel,
        treatmentPlan: analysisResult.treatmentPlan,
      });

      res.status(201).json(record);
    } catch (err: any) {
      console.error("Diagnostic analysis error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze image" });
    }
  });

  // Diagnostics History: GET /api/diagnostics/history
  app.get("/api/diagnostics/history", async (req, res) => {
    try {
      const farmId = req.query.farmId ? parseInt(String(req.query.farmId), 10) : undefined;
      const records = await storage.getDiagnosticRecords(farmId);
      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Diagnostics: GET /api/diagnostics/:id
  app.get("/api/diagnostics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid diagnostic record ID" });
      }
      const record = await storage.getDiagnosticRecord(id);
      if (!record) {
        return res.status(404).json({ error: "Diagnostic record not found" });
      }
      res.json(record);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}
