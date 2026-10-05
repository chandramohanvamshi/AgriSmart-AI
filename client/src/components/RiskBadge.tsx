import React from "react";
import { AlertCircle, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

interface RiskBadgeProps {
  level: "Low" | "Medium" | "High" | "Critical" | string;
  className?: string;
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className = "", showIcon = true }) => {
  const normalized = (level || "Low").toLowerCase();

  let styles = "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800";
  let Icon = CheckCircle;
  let label = level;

  if (normalized.includes("critical")) {
    styles = "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800 font-bold";
    Icon = ShieldAlert;
    label = "Critical";
  } else if (normalized.includes("high")) {
    styles = "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800 font-semibold";
    Icon = AlertTriangle;
    label = "High Risk";
  } else if (normalized.includes("medium")) {
    styles = "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-medium";
    Icon = AlertCircle;
    label = "Medium Risk";
  } else {
    styles = "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 font-medium";
    Icon = CheckCircle;
    label = "Low Risk";
  }

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs border tracking-tight ${styles} ${className}`}>
      {showIcon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
