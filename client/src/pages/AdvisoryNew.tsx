import React from "react";
import { Link, useSearch } from "wouter";
import { AdvisoryWizard } from "../components/AdvisoryWizard";
import { useLanguage } from "../lib/i18n";
import { ArrowLeft, Sparkles, Sprout } from "lucide-react";

export const AdvisoryNew: React.FC = () => {
  const { t } = useLanguage();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const farmIdParam = params.get("farmId");
  const preselectedFarmId = farmIdParam ? parseInt(farmIdParam, 10) : undefined;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin-slow" />
          <span>Multi-Step Soil & Crop Engine</span>
        </span>
      </div>

      {/* Page Title & Context */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t("wiz.title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("wiz.subtitle")}
        </p>
      </div>

      {/* Render Multi-Step Interactive Form */}
      <div className="mt-8">
        <AdvisoryWizard preselectedFarmId={preselectedFarmId} />
      </div>
    </div>
  );
};
