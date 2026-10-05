import React from "react";
import type { FertilizerStep } from "@shared/schema";
import { Clock, Beaker, Layers, CheckCircle, ArrowRight } from "lucide-react";

interface FertilizerTimelineProps {
  steps: FertilizerStep[];
}

export const FertilizerTimeline: React.FC<FertilizerTimelineProps> = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return <p className="text-sm text-slate-500 italic">No fertilizer schedule data provided.</p>;
  }

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-200 dark:before:bg-emerald-900">
      {steps.map((step, idx) => (
        <div key={idx} className="relative group">
          {/* Milestone Circle Pin */}
          <div className="absolute -left-6 sm:-left-8 top-1.5 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-white dark:ring-slate-900 group-hover:scale-110 transition-transform">
            <span className="text-xs font-bold">{idx + 1}</span>
          </div>

          {/* Timeline Card */}
          <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/90 dark:border-slate-700/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/50">
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{step.stage}</span>
              </h4>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                <Clock className="w-3.5 h-3.5" />
                <span>{step.timingWeeks}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {/* Fertilizer & Dosage */}
              <div className="bg-emerald-50/50 dark:bg-slate-900/40 rounded-lg p-3 border border-emerald-100 dark:border-slate-700/50">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1">
                  <Beaker className="w-3.5 h-3.5" />
                  <span>Formula & Recommended Dosage</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {step.fertilizerType}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
                  Rate: {step.applicationRatePerAcre}
                </p>
              </div>

              {/* Application Method */}
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-lg p-3 border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Soil Incorporation / Spray Method</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {step.method}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
