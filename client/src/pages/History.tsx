import React, { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useLanguage } from "../lib/i18n";
import type { FarmProfile, AdvisoryWithDetails } from "@shared/schema";
import { SuitabilityGauge } from "../components/SuitabilityGauge";
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Calendar, 
  Layers, 
  Droplets, 
  ArrowRight, 
  Scale, 
  X, 
  CheckSquare, 
  Square,
  Sparkles,
  TrendingUp
} from "lucide-react";

export const History: React.FC = () => {
  const { t } = useLanguage();

  const [selectedFarmId, setSelectedFarmId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Fetch farm profiles for filter
  const { data: farms = [] } = useQuery<FarmProfile[]>({
    queryKey: ["/api/farms"],
    queryFn: () => apiRequest("/api/farms"),
  });

  // Fetch advisories history
  const { data: advisories = [], isLoading } = useQuery<AdvisoryWithDetails[]>({
    queryKey: ["/api/advisory/history"],
    queryFn: () => apiRequest("/api/advisory/history"),
  });

  // Filtered advisories
  const filtered = advisories.filter((item) => {
    const matchesFarm = selectedFarmId === "all" || item.farm?.id === Number(selectedFarmId);
    const matchesSearch = item.recommendedCrop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.farm?.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.request.targetSeason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFarm && matchesSearch;
  });

  const toggleSelectForComparison = (id: number) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((i) => i !== id));
    } else {
      if (selectedForComparison.length >= 3) {
        alert("You can compare up to 3 advisories simultaneously.");
        return;
      }
      setSelectedForComparison([...selectedForComparison, id]);
    }
  };

  const comparedItems = advisories.filter((a) => selectedForComparison.includes(a.id));

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Advisory Archive & Comparative Analytics
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full dark:bg-emerald-950 dark:text-emerald-300">
              {filtered.length} Reports
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical seasonal recommendations, crop rotation logs, and comparative yield indices.
          </p>
        </div>

        {/* Multi-Crop Comparison Trigger */}
        {selectedForComparison.length >= 2 && (
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-md transition-all animate-bounce"
          >
            <Scale className="w-4 h-4 text-emerald-300" />
            <span>Compare {selectedForComparison.length} Selected Crops</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop, field, or season..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Farm Filter Dropdown */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="all">All Registered Fields</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.farmName} ({f.farmSizeAcres} ac)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advisories Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Loading advisory archive...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            No advisory reports matched your criteria.
          </p>
          <Link
            href="/advisory/new"
            className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Generate New Advisory
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((advisory) => {
            const isSelected = selectedForComparison.includes(advisory.id);
            const secondaryList = (advisory.secondaryCropOptions as string[]) || [];

            return (
              <div
                key={advisory.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all p-5 shadow-sm flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                    : "border-slate-200/90 dark:border-slate-800 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Comparison Checkbox */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {advisory.farm?.farmName}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleSelectForComparison(advisory.id)}
                    className="flex items-center space-x-1 text-[11px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
                    title="Select to compare with other crops"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                    <span>Compare</span>
                  </button>
                </div>

                {/* Crop & Suitability Gauge */}
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {advisory.recommendedCrop}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {advisory.request.targetSeason}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 text-xs font-extrabold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 flex-shrink-0">
                    {advisory.suitabilityScore}% Match
                  </span>
                </div>

                {/* Secondary Alternatives */}
                {secondaryList.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {secondaryList.slice(0, 2).map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metadata summary */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Soil / pH</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {advisory.farm?.soilType} {advisory.farm?.soilPh ? `(${advisory.farm.soilPh})` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Budget Tier</span>
                    <span className="font-semibold text-emerald-600">
                      {advisory.request.budgetLevel.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center space-x-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(advisory.createdAt).toLocaleDateString()}</span>
                  </span>

                  <Link
                    href={`/advisory/${advisory.id}`}
                    className="inline-flex items-center space-x-1 font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  >
                    <span>Full Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-Crop Comparison Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <span>Comparative Agronomic Analysis</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side-by-side evaluation of soil compatibility, economics, and yield potential.
                </p>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedItems.map((item) => {
                const fin = item.financialProjections as any;
                return (
                  <div
                    key={item.id}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        {item.farm?.farmName}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {item.recommendedCrop}
                      </h4>
                      <div className="mt-2">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {item.suitabilityScore}% Suitability Match
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Estimated Cost:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {fin?.estimatedCostPerAcre || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Projected Yield:</span>
                        <span className="font-semibold text-emerald-600">
                          {fin?.projectedYieldRange || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Gross Revenue:</span>
                        <span className="font-semibold text-teal-600">
                          {fin?.estimatedRevenuePerAcre || "N/A"}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/advisory/${item.id}`}
                      className="block text-center py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                    >
                      View Report #{item.id}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
