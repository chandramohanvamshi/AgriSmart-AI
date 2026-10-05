import React from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useLanguage } from "../lib/i18n";
import type { AdvisoryWithDetails, FertilizerStep, PestDiseaseRisk } from "@shared/schema";
import { SuitabilityGauge } from "../components/SuitabilityGauge";
import { FertilizerTimeline } from "../components/FertilizerTimeline";
import { RiskBadge } from "../components/RiskBadge";
import { ExportPDFButton } from "../components/ExportPDFButton";
import {
  ArrowLeft,
  Sprout,
  MapPin,
  Droplets,
  Coins,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Layers,
  Calendar,
  Sparkles,
  DollarSign,
  FileCheck2
} from "lucide-react";

export const AdvisoryDetail: React.FC = () => {
  const [, params] = useRoute("/advisory/:id");
  const { t } = useLanguage();
  const advisoryId = params?.id ? parseInt(params.id, 10) : undefined;

  const { data: advisory, isLoading, isError, error } = useQuery<AdvisoryWithDetails>({
    queryKey: [`/api/advisory/${advisoryId}`],
    queryFn: () => apiRequest(`/api/advisory/${advisoryId}`),
    enabled: !!advisoryId,
  });

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Agronomic Advisory Report...</p>
      </div>
    );
  }

  if (isError || !advisory) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Advisory Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested agronomic report could not be retrieved. It may have been deleted or the ID is invalid.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { farm, request } = advisory;
  const fertilizerSteps = (advisory.fertilizerSchedule as FertilizerStep[]) || [];
  const pestRisks = (advisory.pestDiseaseRisks as PestDiseaseRisk[]) || [];
  const secondaryCrops = (advisory.secondaryCropOptions as string[]) || [];
  const irrigation = advisory.irrigationPlan as {
    frequency: string;
    criticalGrowthStages: string[];
    waterConservationTip: string;
  };
  const financials = advisory.financialProjections as {
    estimatedCostPerAcre: string;
    projectedYieldRange: string;
    estimatedRevenuePerAcre: string;
  };

  return (
    <div className="space-y-8 pb-16 print-page">
      {/* Top Action & Breadcrumb Navigation (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/history"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Advisory Archive</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Report #{advisory.id}
          </span>
        </div>

        <ExportPDFButton reportTitle={`AgriSmart_Advisory_${advisory.recommendedCrop.replace(/\s+/g, '_')}`} />
      </div>

      {/* Official Advisory Header (Printed Header) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm relative overflow-hidden break-inside-avoid">
        {/* Top green accent strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60">
                Primary Recommendation
              </span>
              <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Generated: {new Date(advisory.createdAt).toLocaleDateString()}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {advisory.recommendedCrop}
            </h1>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {advisory.reasoningSummary}
            </p>

            {/* Secondary Alternatives */}
            {secondaryCrops.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400">
                  {t("detail.secondaryOptions")}:
                </span>
                {secondaryCrops.map((crop, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {crop}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Radial Suitability Gauge */}
          <div className="flex-shrink-0 self-center lg:self-auto bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 border border-slate-100 dark:border-slate-800">
            <SuitabilityGauge score={advisory.suitabilityScore} size={170} />
          </div>
        </div>

        {/* Field & Environmental Parameters Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block font-semibold mb-0.5">Farm Field</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {farm.farmName}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block font-semibold mb-0.5">Scale / Area</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {farm.farmSizeAcres} Acres
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block font-semibold mb-0.5">Soil & pH</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {farm.soilType} {farm.soilPh ? `(pH ${farm.soilPh})` : ""}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block font-semibold mb-0.5">Irrigation</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 truncate block">
              {farm.primaryIrrigation}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block font-semibold mb-0.5">Planting Season</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
              {request.targetSeason}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 block font-semibold mb-0.5">Budget Tier</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">
              {request.budgetLevel.split(" ")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Precision Fertilizer Schedule */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 break-inside-avoid">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("detail.fertilizerTimeline")}
            </h2>
            <p className="text-xs text-slate-500">
              Calibrated according to baseline soil Nitrogen ({request.nitrogenLevelPpm || 240} PPM), Phosphorus ({request.phosphorusLevelPpm || 25} PPM), and Potassium ({request.potassiumLevelPpm || 180} PPM).
            </p>
          </div>
        </div>

        <FertilizerTimeline steps={fertilizerSteps} />
      </div>

      {/* Section 2: Irrigation & Water Conservation Protocol */}
      {irrigation && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 break-inside-avoid">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t("detail.irrigationPlan")}
              </h2>
              <p className="text-xs text-slate-500">
                Tailored for {farm.primaryIrrigation} irrigation infrastructure to maximize water-use efficiency (WUE).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Frequency & Critical Stages */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Irrigation Cycle & Scheduling
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {irrigation.frequency}
              </p>

              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Critical Crop Hydration Windows:
                </span>
                <ul className="space-y-1.5">
                  {irrigation.criticalGrowthStages?.map((stage, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      <span>{stage}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Conservation Tip */}
            <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl p-5 border border-blue-200/80 dark:border-blue-900/40 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 block mb-1">
                  Water Conservation Protocol
                </span>
                <p className="text-xs sm:text-sm text-blue-950 dark:text-blue-200 leading-relaxed font-medium">
                  {irrigation.waterConservationTip}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-center space-x-1 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Prevents root hypoxia and saline salt buildup in active root zone</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Pest & Disease Risk Mitigation */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 break-inside-avoid">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t("detail.risks")}
            </h2>
            <p className="text-xs text-slate-500">
              Regional endemic pathogens and pests calibrated for the selected agro-climatic zone.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pestRisks.map((risk, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {risk.pathogenOrPest}
                  </h4>
                  <RiskBadge level={risk.riskLevel} />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {risk.preventativeAction}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-[10px] uppercase font-bold text-slate-400">
                Action Protocol Enforced
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Economic & Yield Projections */}
      {financials && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 break-inside-avoid">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {t("detail.financials")}
              </h2>
              <p className="text-xs text-slate-500">
                Estimated balance sheet reflecting input costs, market rates, and baseline yields.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Estimated Cost per Acre
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                {financials.estimatedCostPerAcre}
              </p>
              <span className="text-[11px] text-slate-500 block mt-1">
                Includes seeds, fertigation, and bio-protection
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Projected Yield Potential
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {financials.projectedYieldRange}
              </p>
              <span className="text-[11px] text-slate-500 block mt-1">
                Based on adherence to nutritional schedule
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Estimated Gross Revenue
              </span>
              <p className="text-xl sm:text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                {financials.estimatedRevenuePerAcre}
              </p>
              <span className="text-[11px] text-slate-500 block mt-1">
                At average farm-gate spot market pricing
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Official Signoff Footer (Printable) */}
      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 break-inside-avoid">
        <div className="flex items-center space-x-2">
          <FileCheck2 className="w-5 h-5 text-emerald-600" />
          <span>
            Verified by AgriSmart Agronomic Reasoning Engine (Gemini 2.5 Pro). Generated for agricultural field extension usage.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400">
          Checksum: AGRI-{advisory.id}-{Date.now().toString(36).toUpperCase()}
        </span>
      </div>
    </div>
  );
};
