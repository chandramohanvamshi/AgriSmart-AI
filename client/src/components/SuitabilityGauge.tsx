import React from "react";
import { Sparkles, Award } from "lucide-react";

interface SuitabilityGaugeProps {
  score: number; // 0 to 100
  size?: number; // size in px
  showLabel?: boolean;
}

export const SuitabilityGauge: React.FC<SuitabilityGaugeProps> = ({ 
  score, 
  size = 180, 
  showLabel = true 
}) => {
  const safeScore = Math.min(100, Math.max(0, Math.round(score || 0)));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Animate from 0 to percentage
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  let color = "#10b981"; // emerald
  let gradientId = "gauge-emerald";
  let ratingLabel = "Optimal Agronomic Fit";
  let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";

  if (safeScore >= 85) {
    color = "#10b981";
    gradientId = "gauge-emerald";
    ratingLabel = "Exceptional Soil Match";
    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
  } else if (safeScore >= 70) {
    color = "#0ea5e9";
    gradientId = "gauge-teal";
    ratingLabel = "High Viability";
    badgeColor = "bg-cyan-100 text-cyan-800 border-cyan-300";
  } else if (safeScore >= 50) {
    color = "#f59e0b";
    gradientId = "gauge-amber";
    ratingLabel = "Moderate (Requires Inputs)";
    badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
  } else {
    color = "#f43f5e";
    gradientId = "gauge-rose";
    ratingLabel = "High Agronomic Risk";
    badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90 filter drop-shadow-sm"
        >
          <defs>
            <linearGradient id="gauge-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gauge-teal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="gauge-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="gauge-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />

          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {safeScore}
            </span>
            <span className="text-lg font-bold text-slate-400 dark:text-slate-500">
              %
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Suitability
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="mt-3 text-center">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{ratingLabel}</span>
          </span>
        </div>
      )}
    </div>
  );
};
