import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency: string = "USD") {
  const num = typeof amount === "string" ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export function getSeverityColor(severity: string) {
  switch (severity?.toLowerCase()) {
    case 'low':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
        badge: 'bg-emerald-500',
        label: 'Low (Preventative)'
      };
    case 'medium':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
        badge: 'bg-amber-500',
        label: 'Medium (Action Required)'
      };
    case 'high':
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
        badge: 'bg-orange-500',
        label: 'High (Urgent Intervention)'
      };
    case 'critical':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
        badge: 'bg-rose-600',
        label: 'Critical (Crop Threat)'
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
        badge: 'bg-slate-500',
        label: severity
      };
  }
}
