import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage, LANGUAGES, type SupportedLanguage } from "../lib/i18n";
import { 
  Sprout, 
  LayoutDashboard, 
  FileSpreadsheet, 
  ScanLine, 
  History, 
  Settings, 
  Globe, 
  Menu, 
  X, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";

export const Navbar: React.FC = () => {
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/advisory/new", label: t("nav.newAdvisory"), icon: FileSpreadsheet, highlight: true },
    { href: "/diagnostics", label: t("nav.diagnostics"), icon: ScanLine },
    { href: "/history", label: t("nav.history"), icon: History },
    { href: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 dark:bg-slate-900/90 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-800 dark:from-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
                  AgriSmart
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded border border-emerald-300/60 dark:bg-emerald-950 dark:text-emerald-300">
                  AI 2.5
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide -mt-0.5">
                CROP ADVISORY & DECISION SUPPORT
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              
              if (link.highlight) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                      isActive
                        ? "bg-emerald-700 text-white shadow-emerald-700/20"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
                    <span>{link.label}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-900 font-semibold dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Actions: AI Status & Language Selector */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Status indicator */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium tracking-tight">Gemini 2.5 Active</span>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors"
                title="Change Platform Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentLang.flag} {currentLang.nativeName}</span>
              </button>

              {langMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 dark:bg-slate-900 dark:border-slate-700 animate-fade-in"
                  onMouseLeave={() => setLangMenuOpen(false)}
                >
                  <div className="px-3 py-1 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Select Language / भाषा
                  </div>
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        language === l.code ? "text-emerald-700 font-bold bg-emerald-50/60 dark:bg-emerald-950/30" : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{l.flag}</span>
                        <span>{l.nativeName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({l.name})</span>
                      </div>
                      {language === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <span>{currentLang.flag}</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 dark:bg-slate-900 dark:border-slate-800 animate-fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};
