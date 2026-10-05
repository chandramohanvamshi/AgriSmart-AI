import {
  type User,
  type InsertUser,
  type FarmProfile,
  type InsertFarmProfile,
  type AdvisoryRequest,
  type InsertAdvisoryRequest,
  type AdvisoryOutput,
  type InsertAdvisoryOutput,
  type DiagnosticRecord,
  type InsertDiagnosticRecord,
  type AdvisoryWithDetails,
  users,
  farmProfiles,
  advisoryRequests,
  advisoryOutputs,
  diagnosticRecords
} from "../shared/schema.js";
import { db, pool } from "./lib/db.js";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLanguage(id: number, lang: string): Promise<User>;

  // Farm profiles
  getFarmProfiles(userId?: number): Promise<FarmProfile[]>;
  getFarmProfile(id: number): Promise<FarmProfile | undefined>;
  createFarmProfile(farm: InsertFarmProfile): Promise<FarmProfile>;

  // Advisory
  createAdvisoryRequest(request: InsertAdvisoryRequest): Promise<AdvisoryRequest>;
  getAdvisoryRequest(id: number): Promise<AdvisoryRequest | undefined>;
  createAdvisoryOutput(output: InsertAdvisoryOutput): Promise<AdvisoryOutput>;
  getAdvisoryOutput(id: number): Promise<AdvisoryOutput | undefined>;
  getAdvisoryWithDetails(outputId: number): Promise<AdvisoryWithDetails | undefined>;
  getAdvisoriesHistory(farmProfileId?: number): Promise<AdvisoryWithDetails[]>;

  // Diagnostics
  createDiagnosticRecord(record: InsertDiagnosticRecord): Promise<DiagnosticRecord>;
  getDiagnosticRecords(farmProfileId?: number): Promise<DiagnosticRecord[]>;
  getDiagnosticRecord(id: number): Promise<DiagnosticRecord | undefined>;

  // Analytics
  getDashboardStats(): Promise<{
    totalAdvisories: number;
    activeFarmsCount: number;
    diagnosticsCount: number;
    avgSuitabilityScore: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private farms: Map<number, FarmProfile> = new Map();
  private requests: Map<number, AdvisoryRequest> = new Map();
  private outputs: Map<number, AdvisoryOutput> = new Map();
  private diagnostics: Map<number, DiagnosticRecord> = new Map();

  private userIdSeq = 1;
  private farmIdSeq = 1;
  private requestIdSeq = 1;
  private outputIdSeq = 1;
  private diagnosticIdSeq = 1;

  constructor() {
    this.seedDemoData();
  }

  private seedDemoData() {
    // 1. Default demo user
    const defaultUser: User = {
      id: this.userIdSeq++,
      email: "agronomist@agrismart.ai",
      fullName: "Kishan Rao (Farm Lead)",
      preferredLanguage: "en",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // 2. Default farm profiles
    const farm1: FarmProfile = {
      id: this.farmIdSeq++,
      userId: defaultUser.id,
      farmName: "Krishna River Valley Fields",
      locationRegion: "Andhra Pradesh / Telangana (Semi-Arid Basin)",
      farmSizeAcres: "12.50",
      soilType: "Clay",
      soilPh: "7.2",
      primaryIrrigation: "Drip",
      createdAt: new Date(Date.now() - 15 * 86400000),
    };
    this.farms.set(farm1.id, farm1);

    const farm2: FarmProfile = {
      id: this.farmIdSeq++,
      userId: defaultUser.id,
      farmName: "Punjab Agro Green Acres",
      locationRegion: "Punjab (Indo-Gangetic Alluvial Plain)",
      farmSizeAcres: "28.00",
      soilType: "Loam",
      soilPh: "6.8",
      primaryIrrigation: "Canal/Flood",
      createdAt: new Date(Date.now() - 30 * 86400000),
    };
    this.farms.set(farm2.id, farm2);

    const farm3: FarmProfile = {
      id: this.farmIdSeq++,
      userId: defaultUser.id,
      farmName: "Deccan Plateau Agroforestry",
      locationRegion: "Maharashtra Dryland Zone",
      farmSizeAcres: "6.50",
      soilType: "Sandy",
      soilPh: "6.2",
      primaryIrrigation: "Rainfed",
      createdAt: new Date(Date.now() - 60 * 86400000),
    };
    this.farms.set(farm3.id, farm3);

    // 3. Pre-seeded advisory for Farm 1
    const req1: AdvisoryRequest = {
      id: this.requestIdSeq++,
      farmProfileId: farm1.id,
      targetSeason: "Kharif Monsoon 2026",
      budgetLevel: "Moderate (Standard Inputs)",
      nitrogenLevelPpm: "245.00",
      phosphorusLevelPpm: "28.50",
      potassiumLevelPpm: "185.00",
      rawUserNotes: "Focusing on disease-resistant long-grain paddy or commercial cotton with optimized drip fertigation.",
      createdAt: new Date(Date.now() - 5 * 86400000),
    };
    this.requests.set(req1.id, req1);

    const out1: AdvisoryOutput = {
      id: this.outputIdSeq++,
      advisoryRequestId: req1.id,
      recommendedCrop: "Paddy Rice (BPT 5204 / Samba Mahsuri)",
      reasoningSummary: "Clay soil with high water-holding capacity and optimal pH 7.2 provides ideal nutrient exchange for long-grain Samba Mahsuri paddy.",
      secondaryCropOptions: ["Bt Cotton (Bollgard II)", "Soybean (JS 335)", "Black Gram (Urad)"],
      suitabilityScore: 94,
      fertilizerSchedule: [
        {
          stage: "Basal Soil Incorporation",
          timingWeeks: "Week 0 (Final puddling)",
          fertilizerType: "DAP (18-46-0) + MOP + Zinc Sulphate",
          applicationRatePerAcre: "50 kg DAP + 20 kg MOP + 10 kg ZnSO4",
          method: "Deep uniform broadcasting before transplanting"
        },
        {
          stage: "Active Tillering Boost",
          timingWeeks: "Week 3 - 4",
          fertilizerType: "Neem Coated Urea (46% N)",
          applicationRatePerAcre: "30 kg Urea (split dose 1)",
          method: "Top dress into 2-3 cm standing water film"
        },
        {
          stage: "Panicle Initiation",
          timingWeeks: "Week 7 - 8",
          fertilizerType: "Urea + MOP (Muriate of Potash)",
          applicationRatePerAcre: "25 kg Urea + 15 kg MOP",
          method: "Even side-dressing across seedling beds"
        },
        {
          stage: "Grain Milky Dough Stage",
          timingWeeks: "Week 11 - 12",
          fertilizerType: "0:0:50 Potassium Schoenite + 1% Boron foliar",
          applicationRatePerAcre: "1.5 kg per 200 Litres water",
          method: "Fine mist spray during morning hours (8 AM - 10 AM)"
        }
      ],
      irrigationPlan: {
        frequency: "Alternate Wetting and Drying (AWD) cycle every 3 - 5 days",
        criticalGrowthStages: [
          "Transplanting to Root Establishment (Day 1 - 10)",
          "Panicle Primordia Development (Day 50 - 65)",
          "Flowering & Milk Stage (Day 75 - 90)"
        ],
        waterConservationTip: "Use a 15cm perforated field water tube to practice Alternate Wetting and Drying (AWD). This cuts water usage by 28% without reducing grain yield."
      },
      pestDiseaseRisks: [
        {
          pathogenOrPest: "Yellow Stem Borer (Scirpophaga incertulas)",
          riskLevel: "High",
          preventativeAction: "Install 4 pheromone traps/acre; release Trichogramma chilonis egg parasitoids @ 40,000/acre at 30 days."
        },
        {
          pathogenOrPest: "Bacterial Leaf Blight (Xanthomonas oryzae)",
          riskLevel: "Medium",
          preventativeAction: "Spray Copper Oxychloride 50 WP @ 2.5g/L + Plantomycin @ 0.1g/L; reduce top-dressing nitrogen."
        },
        {
          pathogenOrPest: "Brown Planthopper (BPH)",
          riskLevel: "Low",
          preventativeAction: "Maintain alleyways of 30 cm after every 2 meters for aeration and predator movement."
        }
      ],
      financialProjections: {
        estimatedCostPerAcre: "$290 - $340 (₹24,000 - ₹28,000)",
        projectedYieldRange: "26 - 32 Quintals/Acre",
        estimatedRevenuePerAcre: "$720 - $880 (Net Margin: +145%)"
      },
      rawAiResponse: { source: "gemini-2.5-pro", timestamp: new Date().toISOString() },
      createdAt: new Date(Date.now() - 5 * 86400000),
    };
    this.outputs.set(out1.id, out1);

    // Pre-seeded diagnostic record
    const diag1: DiagnosticRecord = {
      id: this.diagnosticIdSeq++,
      farmProfileId: farm1.id,
      imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80",
      detectedIssue: "Early Blight (Alternaria solani) with Chlorotic Halos",
      severityLevel: "High",
      treatmentPlan: {
        cropAffected: "Tomato / Solanaceae",
        pathogenOrIssue: "Alternaria solani fungal pathogen",
        confidenceScore: 94,
        symptoms: [
          "Dark brown bullseye concentric rings on lower leaves",
          "Surrounding leaf tissue showing acute chlorosis and yellowing",
          "Lower canopy leaf drop accelerating under humid conditions"
        ],
        immediateRemedies: [
          "Manually remove all lower foliage touching the mulch or soil",
          "Immediately suspend sprinkler irrigation in favor of basal drip line",
          "Burn or solarize pruned diseased leaves away from cultivated plots"
        ],
        organicAlternatives: [
          "Cold-pressed neem oil (Azadirachtin 10,000 PPM) at 3ml/L water with wetting agent",
          "Foliar spray with biological antagonist Trichoderma harzianum @ 5g/L"
        ],
        chemicalInterventions: [
          "Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L",
          "Mancozeb 75% WP @ 2.5g/L as protective barrier spray"
        ],
        preventativeMeasures: [
          "Follow a strict 3-year solanaceous crop rotation",
          "Ensure wide 60cm row spacing to facilitate swift canopy drying",
          "Apply silver reflective polyethylene mulching"
        ]
      },
      createdAt: new Date(Date.now() - 2 * 86400000),
    };
    this.diagnostics.set(diag1.id, diag1);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdSeq++;
    const user: User = {
      id,
      email: insertUser.email,
      fullName: insertUser.fullName,
      preferredLanguage: insertUser.preferredLanguage || "en",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLanguage(id: number, lang: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      const newUser: User = {
        id,
        email: "farmer@agrismart.ai",
        fullName: "Primary Operator",
        preferredLanguage: lang,
        createdAt: new Date(),
      };
      this.users.set(id, newUser);
      return newUser;
    }
    user.preferredLanguage = lang;
    return user;
  }

  async getFarmProfiles(userId?: number): Promise<FarmProfile[]> {
    const all = Array.from(this.farms.values());
    if (userId) {
      return all.filter((f) => f.userId === userId);
    }
    return all.sort((a, b) => b.id - a.id);
  }

  async getFarmProfile(id: number): Promise<FarmProfile | undefined> {
    return this.farms.get(id);
  }

  async createFarmProfile(farm: InsertFarmProfile): Promise<FarmProfile> {
    const id = this.farmIdSeq++;
    const newFarm: FarmProfile = {
      id,
      userId: farm.userId ?? 1,
      farmName: farm.farmName,
      locationRegion: farm.locationRegion,
      farmSizeAcres: String(farm.farmSizeAcres),
      soilType: farm.soilType,
      soilPh: farm.soilPh ? String(farm.soilPh) : null,
      primaryIrrigation: farm.primaryIrrigation,
      createdAt: new Date(),
    };
    this.farms.set(id, newFarm);
    return newFarm;
  }

  async createAdvisoryRequest(request: InsertAdvisoryRequest): Promise<AdvisoryRequest> {
    const id = this.requestIdSeq++;
    const newRequest: AdvisoryRequest = {
      id,
      farmProfileId: request.farmProfileId,
      targetSeason: request.targetSeason,
      budgetLevel: request.budgetLevel,
      nitrogenLevelPpm: request.nitrogenLevelPpm ? String(request.nitrogenLevelPpm) : null,
      phosphorusLevelPpm: request.phosphorusLevelPpm ? String(request.phosphorusLevelPpm) : null,
      potassiumLevelPpm: request.potassiumLevelPpm ? String(request.potassiumLevelPpm) : null,
      rawUserNotes: request.rawUserNotes ?? null,
      createdAt: new Date(),
    };
    this.requests.set(id, newRequest);
    return newRequest;
  }

  async getAdvisoryRequest(id: number): Promise<AdvisoryRequest | undefined> {
    return this.requests.get(id);
  }

  async createAdvisoryOutput(output: InsertAdvisoryOutput): Promise<AdvisoryOutput> {
    const id = this.outputIdSeq++;
    const newOutput: AdvisoryOutput = {
      id,
      advisoryRequestId: output.advisoryRequestId,
      recommendedCrop: output.recommendedCrop,
      reasoningSummary: output.reasoningSummary ?? null,
      secondaryCropOptions: output.secondaryCropOptions,
      suitabilityScore: output.suitabilityScore,
      fertilizerSchedule: output.fertilizerSchedule,
      irrigationPlan: output.irrigationPlan,
      pestDiseaseRisks: output.pestDiseaseRisks,
      financialProjections: output.financialProjections,
      rawAiResponse: output.rawAiResponse,
      createdAt: new Date(),
    };
    this.outputs.set(id, newOutput);
    return newOutput;
  }

  async getAdvisoryOutput(id: number): Promise<AdvisoryOutput | undefined> {
    return this.outputs.get(id);
  }

  async getAdvisoryWithDetails(outputId: number): Promise<AdvisoryWithDetails | undefined> {
    const output = this.outputs.get(outputId);
    if (!output) return undefined;
    const request = this.requests.get(output.advisoryRequestId);
    if (!request) return undefined;
    const farm = this.farms.get(request.farmProfileId);
    if (!farm) return undefined;

    return {
      ...output,
      request,
      farm,
    };
  }

  async getAdvisoriesHistory(farmProfileId?: number): Promise<AdvisoryWithDetails[]> {
    const results: AdvisoryWithDetails[] = [];
    for (const output of Array.from(this.outputs.values())) {
      const request = this.requests.get(output.advisoryRequestId);
      if (!request) continue;
      if (farmProfileId && request.farmProfileId !== farmProfileId) continue;
      const farm = this.farms.get(request.farmProfileId);
      if (!farm) continue;

      results.push({
        ...output,
        request,
        farm,
      });
    }
    return results.sort((a, b) => b.id - a.id);
  }

  async createDiagnosticRecord(record: InsertDiagnosticRecord): Promise<DiagnosticRecord> {
    const id = this.diagnosticIdSeq++;
    const newDiag: DiagnosticRecord = {
      id,
      farmProfileId: record.farmProfileId ?? null,
      imageUrl: record.imageUrl,
      detectedIssue: record.detectedIssue,
      severityLevel: record.severityLevel,
      treatmentPlan: record.treatmentPlan,
      createdAt: new Date(),
    };
    this.diagnostics.set(id, newDiag);
    return newDiag;
  }

  async getDiagnosticRecords(farmProfileId?: number): Promise<DiagnosticRecord[]> {
    const all = Array.from(this.diagnostics.values());
    if (farmProfileId) {
      return all.filter((d) => d.farmProfileId === farmProfileId).sort((a, b) => b.id - a.id);
    }
    return all.sort((a, b) => b.id - a.id);
  }

  async getDiagnosticRecord(id: number): Promise<DiagnosticRecord | undefined> {
    return this.diagnostics.get(id);
  }

  async getDashboardStats() {
    const allOutputs = Array.from(this.outputs.values());
    const totalAdvisories = allOutputs.length;
    const avgSuitabilityScore = totalAdvisories > 0
      ? Math.round(allOutputs.reduce((acc, curr) => acc + curr.suitabilityScore, 0) / totalAdvisories)
      : 85;

    return {
      totalAdvisories,
      activeFarmsCount: this.farms.size,
      diagnosticsCount: this.diagnostics.size,
      avgSuitabilityScore,
    };
  }
}

export const storage = new MemStorage();
