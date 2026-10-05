import React, { useState } from "react";
import { CloudRain, AlertTriangle, ShieldCheck, ChevronRight, X, Sparkles, Wind } from "lucide-react";

export const SeasonalAlertBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-300/60 dark:border-amber-700/40 p-4 sm:p-5 shadow-sm transition-all animate-fade-in">
      {/* Decorative background glow */}
      <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 flex-shrink-0 mt-0.5 sm:mt-0 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Seasonal Agro-Climatic Warning
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                Fall Armyworm & Humid Blight Surge
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 leading-snug">
              Elevated relative humidity (&gt;82%) detected across regional belts. Farmers are advised to initiate preventive neem-based foliar sprays on maize, cotton, and solanaceous crops before peak vegetative phase.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                <span>Intermittent Showers Expected</span>
              </span>
              <span className="flex items-center space-x-1">
                <Wind className="w-3.5 h-3.5 text-teal-500" />
                <span>Optimal Soil Incorporation Window</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
          <a
            href="/diagnostics"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Scan Foliage</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
