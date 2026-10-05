import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  type FarmProfile, 
  type CreateAdvisoryInput, 
  BUDGET_LEVELS, 
  SOIL_TYPES, 
  IRRIGATION_TYPES 
} from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useLanguage } from "../lib/i18n";
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Layers, 
  Droplets, 
  Coins, 
  FileText, 
  FlaskConical,
  PlusCircle
} from "lucide-react";

interface AdvisoryWizardProps {
  preselectedFarmId?: number;
}

export const AdvisoryWizard: React.FC<AdvisoryWizardProps> = ({ preselectedFarmId }) => {
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch registered farm profiles
  const { data: farms = [], isLoading: isLoadingFarms } = useQuery<FarmProfile[]>({
    queryKey: ["/api/farms"],
    queryFn: () => apiRequest("/api/farms"),
  });

  // State for new farm inline creation
  const [showNewFarmModal, setShowNewFarmModal] = useState(false);
  const [newFarmName, setNewFarmName] = useState("");
  const [newFarmRegion, setNewFarmRegion] = useState("");
  const [newFarmSize, setNewFarmSize] = useState("5.0");
  const [newFarmSoil, setNewFarmSoil] = useState<(typeof SOIL_TYPES)[number]>("Loam");
  const [newFarmIrrigation, setNewFarmIrrigation] = useState<(typeof IRRIGATION_TYPES)[number]>("Drip");
  const [newFarmPh, setNewFarmPh] = useState("6.8");

  // Wizard Form State
  const [formData, setFormData] = useState<CreateAdvisoryInput>({
    farmProfileId: preselectedFarmId || 0,
    targetSeason: "Kharif / Monsoon Season 2026",
    budgetLevel: "Moderate (Standard Inputs)",
    nitrogenLevelPpm: 240,
    phosphorusLevelPpm: 25,
    potassiumLevelPpm: 180,
    rawUserNotes: "",
  });

  // Automatically select first farm when loaded if none selected
  useEffect(() => {
    if (farms.length > 0 && !formData.farmProfileId) {
      const selected = preselectedFarmId && farms.some(f => f.id === preselectedFarmId)
        ? preselectedFarmId
        : farms[0].id;
      setFormData((prev) => ({ ...prev, farmProfileId: selected }));
    }
  }, [farms, preselectedFarmId]);

  // Mutation to create new farm inline
  const createFarmMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<FarmProfile>("/api/farms", {
        method: "POST",
        body: JSON.stringify({
          farmName: newFarmName,
          locationRegion: newFarmRegion,
          farmSizeAcres: parseFloat(newFarmSize) || 1,
          soilType: newFarmSoil,
          soilPh: parseFloat(newFarmPh) || 6.5,
          primaryIrrigation: newFarmIrrigation,
        }),
      });
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["/api/farms"] });
      setFormData((prev) => ({ ...prev, farmProfileId: created.id }));
      setShowNewFarmModal(false);
      // Reset form
      setNewFarmName("");
      setNewFarmRegion("");
    },
  });

  // Mutation to generate advisory
  const generateAdvisoryMutation = useMutation({
    mutationFn: async (payload: CreateAdvisoryInput) => {
      return apiRequest("/api/advisory/generate", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/advisory/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      navigate(`/advisory/${data.id}`);
    },
  });

  const selectedFarm = farms.find((f) => f.id === formData.farmProfileId);

  // Step Validation
  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.farmProfileId) {
        errors.farmProfileId = "Please select or create a farm profile.";
      }
      if (!formData.targetSeason.trim()) {
        errors.targetSeason = "Target planting season is required.";
      }
    } else if (step === 2) {
      if (formData.nitrogenLevelPpm !== undefined && formData.nitrogenLevelPpm !== null && formData.nitrogenLevelPpm < 0) {
        errors.nitrogenLevelPpm = "Nitrogen must be positive.";
      }
    } else if (step === 3) {
      if (!formData.budgetLevel) {
        errors.budgetLevel = "Please specify your budget tier.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      generateAdvisoryMutation.mutate(formData);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Step Progress Header */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, label: t("wiz.step1"), icon: Layers },
            { step: 2, label: t("wiz.step2"), icon: FlaskConical },
            { step: 3, label: t("wiz.step3"), icon: Coins },
            { step: 4, label: t("wiz.step4"), icon: Sparkles },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            const Icon = item.icon;

            return (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                    isCompleted
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : isCurrent
                      ? "bg-emerald-700 text-white ring-4 ring-emerald-500/20 shadow-md"
                      : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                <span className="text-[10px] sm:text-xs font-semibold mt-1.5 text-slate-700 dark:text-slate-300 truncate max-w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Body Form */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* STEP 1: Farm & Region */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 1: Select Field & Planting Season
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Choose the registered agricultural parcel to calibrate soil-crop compatibility models.
              </p>
            </div>

            {/* Farm Profile Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {t("wiz.farmSelect")} *
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewFarmModal(true)}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Register New Field</span>
                </button>
              </div>

              {isLoadingFarms ? (
                <div className="p-4 text-center text-slate-500 text-sm">Loading field profiles...</div>
              ) : farms.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed rounded-2xl border-slate-300">
                  <p className="text-sm font-semibold text-slate-600">No farms registered yet.</p>
                  <button
                    type="button"
                    onClick={() => setShowNewFarmModal(true)}
                    className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Register First Field
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {farms.map((farm) => (
                    <div
                      key={farm.id}
                      onClick={() => setFormData({ ...formData, farmProfileId: farm.id })}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        formData.farmProfileId === farm.id
                          ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {farm.farmName}
                        </span>
                        {formData.farmProfileId === farm.id && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{farm.locationRegion}</p>
                      <div className="flex items-center gap-2 mt-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                          {farm.soilType} {farm.soilPh ? `(pH ${farm.soilPh})` : ""}
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                          {farm.farmSizeAcres} Acres
                        </span>
                        <span className="bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded">
                          {farm.primaryIrrigation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {formErrors.farmProfileId && (
                <p className="text-xs text-rose-600 mt-1.5">{formErrors.farmProfileId}</p>
              )}
            </div>

            {/* Target Season Selection */}
            <div>
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-2">
                {t("wiz.season")} *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  "Kharif / Monsoon Season 2026",
                  "Rabi / Winter Season 2026",
                  "Zaid / Summer Cash Cycle 2026",
                  "Perennial / Agroforestry 2026-27",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetSeason: s })}
                    className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      formData.targetSeason === s
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {formErrors.targetSeason && (
                <p className="text-xs text-rose-600 mt-1.5">{formErrors.targetSeason}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Soil Chemistry & Lab Metrics */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 2: Soil Chemistry & NPK Testing Metrics
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter recent soil test report baseline levels (in Parts Per Million - PPM). If unmeasured, typical regional values will be used.
              </p>
            </div>

            {selectedFarm && (
              <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-300">
                    Selected Field: {selectedFarm.farmName}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 ml-2">
                    ({selectedFarm.soilType} Soil, pH: {selectedFarm.soilPh || "6.5"})
                  </span>
                </div>
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  {selectedFarm.farmSizeAcres} Acres
                </span>
              </div>
            )}

            {/* NPK Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Nitrogen */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Nitrogen (N)
                  </label>
                  <span className="text-xs font-bold text-emerald-600">
                    {formData.nitrogenLevelPpm} PPM
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="600"
                  step="10"
                  value={formData.nitrogenLevelPpm || 240}
                  onChange={(e) => setFormData({ ...formData, nitrogenLevelPpm: Number(e.target.value) })}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Deficient (&lt;150)</span>
                  <span>Optimal (200-350)</span>
                  <span>Excess (&gt;450)</span>
                </div>
              </div>

              {/* Phosphorus */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Phosphorus (P)
                  </label>
                  <span className="text-xs font-bold text-amber-600">
                    {formData.phosphorusLevelPpm} PPM
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="2"
                  value={formData.phosphorusLevelPpm || 25}
                  onChange={(e) => setFormData({ ...formData, phosphorusLevelPpm: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Low (&lt;15)</span>
                  <span>Adequate (20-40)</span>
                  <span>High (&gt;50)</span>
                </div>
              </div>

              {/* Potassium */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Potassium (K)
                  </label>
                  <span className="text-xs font-bold text-blue-600">
                    {formData.potassiumLevelPpm} PPM
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="400"
                  step="10"
                  value={formData.potassiumLevelPpm || 180}
                  onChange={(e) => setFormData({ ...formData, potassiumLevelPpm: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Low (&lt;100)</span>
                  <span>Optimal (150-250)</span>
                  <span>High (&gt;300)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Budget & Inputs */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 3: Budget Tier & Agronomic Notes
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                AgriSmart strictly tailors fertilizer recipes, seeds, and mechanization recommendations to your exact economic tier.
              </p>
            </div>

            {/* Budget Levels */}
            <div>
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-2">
                {t("wiz.budget")} *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BUDGET_LEVELS.map((tier) => (
                  <div
                    key={tier}
                    onClick={() => setFormData({ ...formData, budgetLevel: tier })}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.budgetLevel === tier
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {tier.split(" ")[0]}
                      </span>
                      {formData.budgetLevel === tier && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">
                      {tier}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Farmer's Specific Notes */}
            <div>
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 block mb-2">
                {t("wiz.notes")}
              </label>
              <textarea
                rows={3}
                value={formData.rawUserNotes || ""}
                onChange={(e) => setFormData({ ...formData, rawUserNotes: e.target.value })}
                placeholder="e.g. Previous crop was Cotton, heavy stem borer history in neighboring plots, planning for organic certification or looking for drought-resilient varieties."
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Review & Synthesis */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Step 4: Final Advisory Review & AI Execution
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please verify the collected parameters. Clicking synthesize will trigger Gemini 2.5 Pro deep agronomic reasoning with deterministic JSON structuring.
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Target Field</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {selectedFarm?.farmName || "Field #1"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Agro-Climatic Zone</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedFarm?.locationRegion}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Soil & pH</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedFarm?.soilType} (pH {selectedFarm?.soilPh || "6.5"})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Irrigation Mode</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedFarm?.primaryIrrigation}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Planting Season</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formData.targetSeason}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Budget Tier</span>
                  <span className="font-bold text-emerald-600">
                    {formData.budgetLevel.split(" ")[0]}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Soil N-P-K (PPM)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formData.nitrogenLevelPpm} - {formData.phosphorusLevelPpm} - {formData.potassiumLevelPpm}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">AI Engine</span>
                  <span className="font-bold text-purple-600">
                    Gemini 2.5 Pro JSON
                  </span>
                </div>
              </div>

              {formData.rawUserNotes && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-slate-400 block font-semibold">Farmer's Constraints:</span>
                  <p className="text-slate-700 dark:text-slate-300 italic mt-0.5">
                    "{formData.rawUserNotes}"
                  </p>
                </div>
              )}
            </div>

            {/* Error Message if mutation fails */}
            {generateAdvisoryMutation.isError && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Generation Error: {generateAdvisoryMutation.error?.message || "Failed to generate advisory."}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={generateAdvisoryMutation.isPending}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("common.back")}</span>
            </button>
          ) : <div />}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
            >
              <span>{t("common.next")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={generateAdvisoryMutation.isPending}
              className="inline-flex items-center space-x-2 px-7 py-3 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
            >
              {generateAdvisoryMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t("wiz.generating")}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>{t("wiz.submit")}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Modal: Inline Register Farm Profile */}
      {showNewFarmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Register New Agricultural Field
            </h4>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Field / Farm Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. North Ridge Organic Field"
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Agro-Climatic Location / Region *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra Semi-Arid Plateau"
                  value={newFarmRegion}
                  onChange={(e) => setNewFarmRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Acreage (Scale) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFarmSize}
                    onChange={(e) => setNewFarmSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Soil pH
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFarmPh}
                    onChange={(e) => setNewFarmPh(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Soil Classification
                  </label>
                  <select
                    value={newFarmSoil}
                    onChange={(e) => setNewFarmSoil(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {SOIL_TYPES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Primary Irrigation
                  </label>
                  <select
                    value={newFarmIrrigation}
                    onChange={(e) => setNewFarmIrrigation(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                  >
                    {IRRIGATION_TYPES.map((it) => (
                      <option key={it} value={it}>{it}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setShowNewFarmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => createFarmMutation.mutate()}
                disabled={!newFarmName || !newFarmRegion || createFarmMutation.isPending}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
              >
                {createFarmMutation.isPending ? "Saving..." : "Save Field"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
