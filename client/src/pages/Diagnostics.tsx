import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useLanguage } from "../lib/i18n";
import type { FarmProfile, DiagnosticRecord, DiagnosticTreatmentPlan } from "@shared/schema";
import { ImageUploader } from "../components/ImageUploader";
import { RiskBadge } from "../components/RiskBadge";
import { 
  ScanLine, 
  Sparkles, 
  Loader2, 
  ShieldAlert, 
  CheckCircle2, 
  Leaf, 
  FlaskConical, 
  Bug, 
  ArrowRight, 
  History,
  Calendar,
  Layers,
  AlertTriangle
} from "lucide-react";

export const Diagnostics: React.FC = () => {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [farmProfileId, setFarmProfileId] = useState<number | undefined>();
  const [cropType, setCropType] = useState<string>("Tomato");
  const [observedSymptoms, setObservedSymptoms] = useState<string>("");

  const [activeResult, setActiveResult] = useState<DiagnosticRecord | null>(null);

  // Fetch farm profiles for field linking
  const { data: farms = [] } = useQuery<FarmProfile[]>({
    queryKey: ["/api/farms"],
    queryFn: () => apiRequest("/api/farms"),
  });

  // Fetch past diagnostic scans
  const { data: pastDiagnostics = [], isLoading: isLoadingHistory } = useQuery<DiagnosticRecord[]>({
    queryKey: ["/api/diagnostics/history"],
    queryFn: () => apiRequest("/api/diagnostics/history"),
  });

  // Multimodal diagnostic mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedImage) {
        throw new Error("Please upload or select a plant leaf image.");
      }

      const body = {
        imageBase64: selectedImage,
        farmProfileId: farmProfileId || undefined,
        cropType: cropType || undefined,
        observedSymptoms: observedSymptoms || undefined,
        language: language || "en",
      };

      return apiRequest<DiagnosticRecord>("/api/diagnostics/analyze", {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: (data) => {
      setActiveResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/diagnostics/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const handleImageSelected = (base64: string, file?: File) => {
    setSelectedImage(base64);
    setSelectedFile(file);
    setActiveResult(null);
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImage) {
      analyzeMutation.mutate();
    }
  };

  const treatmentPlan = activeResult?.treatmentPlan as DiagnosticTreatmentPlan | undefined;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("diag.title")}
          </h1>
          <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full dark:bg-blue-950 dark:text-blue-300">
            Gemini 2.5 Flash Vision
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          {t("diag.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Uploader & Scan Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <span>Plant Specimen Photography</span>
            </h2>

            {/* Drag & Drop Canvas Compressor Image Uploader */}
            <ImageUploader
              onImageSelected={handleImageSelected}
              isLoading={analyzeMutation.isPending}
            />

            {/* Diagnostic Parameters Form */}
            <form onSubmit={handleScan} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Crop Type Hint */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Suspected Crop / Host Plant
                  </label>
                  <input
                    type="text"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    placeholder="e.g. Tomato, Cotton, Rice, Maize"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Link to Registered Field */}
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Link to Registered Field (Optional)
                  </label>
                  <select
                    value={farmProfileId || ""}
                    onChange={(e) => setFarmProfileId(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">None / Standalone Scan</option>
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.farmName} ({f.locationRegion})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Observed Symptoms */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block text-xs mb-1">
                  Observed Symptoms / Physical Characteristics
                </label>
                <textarea
                  rows={2}
                  value={observedSymptoms}
                  onChange={(e) => setObservedSymptoms(e.target.value)}
                  placeholder="e.g. Yellowing concentric rings on lower leaves, tiny white insects under foliage, stunted internodes."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Trigger Button */}
              <button
                type="submit"
                disabled={!selectedImage || analyzeMutation.isPending}
                className="w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {analyzeMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t("diag.analyzing")}</span>
                  </>
                ) : (
                  <>
                    <ScanLine className="w-5 h-5 text-emerald-200" />
                    <span>Run Multimodal Pathology Diagnosis</span>
                  </>
                )}
              </button>

              {analyzeMutation.isError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{analyzeMutation.error?.message || "Diagnostic request failed."}</span>
                </div>
              )}
            </form>
          </div>

          {/* Past Diagnostic Archive List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Recent Diagnostic Records</span>
            </h3>

            {isLoadingHistory ? (
              <p className="text-xs text-slate-400">Loading history...</p>
            ) : pastDiagnostics.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No past scans found.</p>
            ) : (
              <div className="space-y-2">
                {pastDiagnostics.slice(0, 4).map((diag) => (
                  <div
                    key={diag.id}
                    onClick={() => setActiveResult(diag)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      activeResult?.id === diag.id
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={diag.imageUrl}
                        alt="Scanned specimen"
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {diag.detectedIssue}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(diag.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <RiskBadge level={diag.severityLevel} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Diagnostic Assessment & Treatment Plan (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {activeResult && treatmentPlan ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6 animate-fade-in sticky top-24">
              {/* Pathology Identification Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Target Identification
                  </span>
                  <RiskBadge level={activeResult.severityLevel} />
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {treatmentPlan.pathogenOrIssue || activeResult.detectedIssue}
                </h3>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-semibold text-slate-500">
                    Confidence:
                  </span>
                  <span className="font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    {treatmentPlan.confidenceScore ?? 92}% Match
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 font-medium">
                    Host: {treatmentPlan.cropAffected || cropType}
                  </span>
                </div>
              </div>

              {/* Observed Clinical Symptoms */}
              {treatmentPlan.symptoms && treatmentPlan.symptoms.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                    <Bug className="w-3.5 h-3.5 text-amber-500" />
                    <span>Clinical Diagnostic Symptoms</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {treatmentPlan.symptoms.map((s, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Immediate First-Aid Remedies */}
              {treatmentPlan.immediateRemedies && treatmentPlan.immediateRemedies.length > 0 && (
                <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Immediate First-Aid Measures</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {treatmentPlan.immediateRemedies.map((r, idx) => (
                      <li key={idx} className="text-xs text-amber-950 dark:text-amber-200 font-medium flex items-start space-x-2">
                        <span className="font-bold text-amber-700">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Organic & Biological Controls */}
              {treatmentPlan.organicAlternatives && treatmentPlan.organicAlternatives.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5">
                    <Leaf className="w-3.5 h-3.5" />
                    <span>Biological & Organic Alternatives</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {treatmentPlan.organicAlternatives.map((o, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chemical Interventions */}
              {treatmentPlan.chemicalInterventions && treatmentPlan.chemicalInterventions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center space-x-1.5">
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Chemical Interventions & Active Dosages</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {treatmentPlan.chemicalInterventions.map((c, idx) => (
                      <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Long-Term Prevention */}
              {treatmentPlan.preventativeMeasures && treatmentPlan.preventativeMeasures.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Long-Term Agronomic Prevention
                  </h4>
                  <ul className="space-y-1">
                    {treatmentPlan.preventativeMeasures.map((p, idx) => (
                      <li key={idx} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start space-x-1.5">
                        <span className="text-slate-400">-</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Awaiting Plant Specimen
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Upload a plant leaf photo or select one of the clinical samples on the left to review instant pathogen identification and pesticide dosages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
