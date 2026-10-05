import React from "react";
import { Link } from "wouter";
import type { FarmProfile } from "@shared/schema";
import { MapPin, Layers, Droplets, ArrowRight, Gauge, Activity } from "lucide-react";

interface FarmProfileCardProps {
  farm: FarmProfile;
  advisoriesCount?: number;
}

export const FarmProfileCard: React.FC<FarmProfileCardProps> = ({ farm, advisoriesCount = 0 }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />

      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
              {farm.farmName}
            </h3>
            <p className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{farm.locationRegion}</span>
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 flex-shrink-0">
            {farm.farmSizeAcres} Acres
          </span>
        </div>

        {/* Spec Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
              Soil Composition
            </span>
            <div className="flex items-center space-x-1 font-bold text-slate-800 dark:text-slate-200">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>{farm.soilType} {farm.soilPh ? `(pH ${farm.soilPh})` : ""}</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
              Irrigation Infrastructure
            </span>
            <div className="flex items-center space-x-1 font-bold text-slate-800 dark:text-slate-200">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>{farm.primaryIrrigation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>Active Field Record</span>
        </span>

        <Link
          href={`/advisory/new?farmId=${farm.id}`}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all"
        >
          <span>Get Advisory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
