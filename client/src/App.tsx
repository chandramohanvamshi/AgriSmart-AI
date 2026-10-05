import React from "react";
import { Switch, Route, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { LanguageProvider } from "./lib/i18n";
import { Navbar } from "./components/Navbar";

// Pages
import { Dashboard } from "./pages/Dashboard";
import { AdvisoryNew } from "./pages/AdvisoryNew";
import { AdvisoryDetail } from "./pages/AdvisoryDetail";
import { Diagnostics } from "./pages/Diagnostics";
import { History } from "./pages/History";
import { Settings } from "./pages/Settings";
import { Sprout, ShieldCheck } from "lucide-react";

function NotFound() {
  return (
    <div className="py-24 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
        <Sprout className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm mx-auto">
        The requested agricultural advisory resource does not exist or has been relocated.
      </p>
      <Link
        href="/"
        className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          {/* Main Top Header Navbar */}
          <Navbar />

          {/* Main Content Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/advisory/new" component={AdvisoryNew} />
              <Route path="/advisory/:id" component={AdvisoryDetail} />
              <Route path="/diagnostics" component={Diagnostics} />
              <Route path="/history" component={History} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </main>

          {/* Platform Footer (Hidden during PDF print) */}
          <footer className="no-print border-t border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 mt-12 py-8 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Sprout className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  AgriSmart AI
                </span>
                <span>• Agricultural Crop Advisory & Decision Support System</span>
              </div>

              <div className="flex items-center space-x-4 text-[11px]">
                <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Powered by @google/genai SDK</span>
                </span>
                <span className="text-slate-400">|</span>
                <span>Deterministic Agronomic Intelligence</span>
              </div>
            </div>
          </footer>
        </div>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
