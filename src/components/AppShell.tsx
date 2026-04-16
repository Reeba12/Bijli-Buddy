"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";
import { isCurrentlyPeakHour } from "@/lib/tariff";

const NAV_ITEMS = [
  { href: "/",               icon: "⚡", labelKey: "navCalculator" as const },
  { href: "/tools",          icon: "🔧", labelKey: "navTools"      as const },
  { href: "/solar",          icon: "☀️", labelKey: "navSolar"      as const },
  { href: "/load-shedding",  icon: "🔌", labelKey: "navLoadshed"   as const },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, setLang, t, dir }      = useLang();
  const pathname  = usePathname();
  const isDark    = theme === "dark";
  const isPeak    = isCurrentlyPeakHour();

  return (
    <div className="bb-page-bg min-h-screen flex flex-col" dir={dir}>

      {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50"
        style={{
          background: isDark ? "rgba(6,13,31,0.92)" : "rgba(240,244,255,0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-default)",
        }}>
        <div className="w-full max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)", boxShadow: "0 2px 12px rgba(37,99,235,0.4)" }}>
              <span className="text-lg">⚡</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-extrabold text-sm leading-tight" style={{ color: "var(--text-primary)" }}>
                {t("appName")}
              </p>
              <p className="text-[10px] font-semibold" style={{ color: "var(--brand-blue)" }}>
                {t("tagline")}
              </p>
            </div>
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Peak badge */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${isPeak ? "peak-pulse" : ""}`}
              style={{
                background: isPeak ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                border: isPeak ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(16,185,129,0.3)",
                color: isPeak ? "#ef4444" : "#10b981",
              }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: isPeak ? "#ef4444" : "#10b981" }} />
              {isPeak ? t("peak") : t("offPeak")}
            </div>

            {/* Language toggle */}
            <button onClick={() => setLang(lang === "en" ? "ur" : "en")}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}>
              {lang === "en" ? "اردو" : "EN"}
            </button>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all"
              style={{
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
              aria-label="Toggle theme">
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* ── NAV TABS ─────────────────────────────────────────────────────── */}
        <nav className="w-full max-w-screen-xl mx-auto px-4 pb-0 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-1 min-w-max">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap rounded-t-xl relative"
                  style={{
                    color: active ? "var(--brand-blue)" : "var(--text-muted)",
                    background: active
                      ? isDark ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.07)"
                      : "transparent",
                    borderBottom: active ? "2px solid var(--brand-blue)" : "2px solid transparent",
                  }}>
                  <span>{item.icon}</span>
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* ── PAGE CONTENT ───────────────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="text-center pb-6 pt-4 space-y-1 px-4"
        style={{ color: "var(--text-hint)", fontSize: "11px", borderTop: "1px solid var(--border-default)" }}>
        <p className="font-semibold">{t("footerLine1")}</p>
        <p>{t("footerLine2")}</p>
        <p>{t("footerLine3")}</p>
      </footer>

    </div>
  );
}
