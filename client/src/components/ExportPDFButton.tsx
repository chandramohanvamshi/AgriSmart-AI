import React, { useState } from "react";
import { Printer, Share2, Check, Download } from "lucide-react";

interface ExportPDFButtonProps {
  reportTitle?: string;
}

export const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ reportTitle = "AgriSmart Advisory" }) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex items-center space-x-2 no-print">
      {/* Share / Copy Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 shadow-sm transition-all"
        title="Copy shareable link for agricultural extension agents"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 dark:text-emerald-400">Link Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4 text-slate-500" />
            <span>Share Report</span>
          </>
        )}
      </button>

      {/* Print / Save as PDF Button */}
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-sm transition-all"
        title="Print or Save Advisory Report as PDF"
      >
        <Printer className="w-4 h-4" />
        <span>Export PDF / Print</span>
      </button>
    </div>
  );
};
