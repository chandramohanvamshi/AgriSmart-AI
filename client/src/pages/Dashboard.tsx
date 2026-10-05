import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useLanguage } from "../lib/i18n";
import { type FarmProfile, type AdvisoryWithDetails } from "@shared/schema";
import { FarmProfileCard } from "../components/FarmProfileCard";
import { SeasonalAlertBanner } from "../components/SeasonalAlertBanner";
import {
  FileSpreadsheet,
  ScanLine,
  Sprout,
  TrendingUp,
  Activity,
  ShieldCheck,
  ArrowRight,
  Calendar,
  Layers,
  Sparkles,
  Award,
  AlertCircle
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { t } = useLanguage();

  // Fetch dashboard aggregate metrics
  const { data: stats } = useQuery<{
    totalAdvisories: number;
    activeFarmsCount: number;
    diagnosticsCount: number;
    avgSuitabilityScore: number;
  }>({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("/api/stats"),
  });

  // Fetch registered farm fields
  const { data: farms = [], isLoading: isLoadingFarms } = useQuery<FarmProfile[]>({
    queryKey: ["/api/farms"],
    queryFn: () => apiRequest("/api/farms"),
  });

  // Fetch recent advisories
  const { data: recentAdvisories = [], isLoading: isLoadingAdvisories } = useQuery<AdvisoryWithDetails[]>({
    queryKey: ["/api/advisory/history"],
    queryFn: () => apiRequest("/api/advisory/history"),
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("dash.title")}
            </h1>
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
              v2.5 Pro
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            {t("dash.subtitle")}
          </p>
        </div>

        {/* Quick Launch Action CTAs */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <Link
            href="/diagnostics"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all"
          >
            <ScanLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t("dash.quickScanBtn")}</span>
          </Link>

          <Link
            href="/advisory/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            <span>{t("dash.newAdvisoryBtn")}</span>
          </Link>
        </div>
      </div>

      {/* Seasonal Climate & Pest Alert Banner */}
      <SeasonalAlertBanner />

      {/* System Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t("dash.totalAdvisories")}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.totalAdvisories ?? recentAdvisories.length}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Active Records</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t("dash.farmsMonitored")}
            </span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.activeFarmsCount ?? farms.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Parcels</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t("dash.scansCompleted")}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <ScanLine className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.diagnosticsCount ?? 3}
            </span>
            <span className="text-xs text-blue-600 font-semibold">Gemini Flash</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t("dash.avgSuitability")}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats?.avgSuitabilityScore ?? 92}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">+4.2% yield lift</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Fields & Recent Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Registered Farm Profiles (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <span>{t("dash.activeFields")}</span>
              </h2>
              <p className="text-xs text-slate-500">
                Calibrated field plots with persistent soil parameters and irrigation channels.
              </p>
            </div>
            <Link
              href="/advisory/new"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              {t("dash.addNewFarm")}
            </Link>
          </div>

          {isLoadingFarms ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading field configurations...</div>
          ) : farms.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-dashed border-slate-300">
              <p className="text-sm font-semibold text-slate-700">No active fields registered.</p>
              <Link
                href="/advisory/new"
                className="mt-3 inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
              >
                Register Field Profile
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farms.map((farm) => (
                <FarmProfileCard key={farm.id} farm={farm} />
              ))}
            </div>
          )}

          {/* Multimodal Diagnostics CTA Box */}
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-lg space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Plant Doctor AI
              </span>
              <h3 className="text-xl font-bold text-white">
                Detected abnormal leaf discoloration or insect infestation?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take or upload a leaf photo. Gemini 2.5 Flash analyzes pathogen morphology and delivers actionable first-aid chemical and organic prescriptions in under 3 seconds.
              </p>
              <div className="pt-2">
                <Link
                  href="/diagnostics"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all"
                >
                  <ScanLine className="w-4 h-4" />
                  <span>Launch Diagnostic Scanner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Generated Advisory Reports */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>{t("dash.recentAdvisories")}</span>
            </h2>
            <Link
              href="/history"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              {t("dash.viewAll")}
            </Link>
          </div>

          {isLoadingAdvisories ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading recent reports...</div>
          ) : recentAdvisories.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 text-center border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500">No advisories generated yet.</p>
              <Link
                href="/advisory/new"
                className="mt-3 inline-block px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg"
              >
                Create First Advisory
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAdvisories.slice(0, 4).map((advisory) => (
                <Link
                  key={advisory.id}
                  href={`/advisory/${advisory.id}`}
                  className="block bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-4 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {advisory.farm?.farmName || "Field"}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {advisory.recommendedCrop}
                      </h4>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-2 py-0.5 text-xs font-extrabold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                        {advisory.suitabilityScore}% Match
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {advisory.reasoningSummary || "Soil-crop nutrition schedule and pest risk assessment complete."}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(advisory.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                      <span>View Report</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
