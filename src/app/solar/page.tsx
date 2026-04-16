"use client";

import { useState, useEffect } from "react";
import { fetchSolarPanels, fetchSolarInverters, type SolarPanel, type SolarInverter } from "@/lib/db";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";

// ─── Solar constants ──────────────────────────────────────────────────────────
const PEAK_SUN_HRS  = 5.5;
const SYS_EFF       = 0.80;
const INSTALL_FIXED = 80_000;
const PANEL_W       = 400;
const PANEL_SQ_FT   = 17;
const PANEL_PRICE   = 14_000; // PKR per 400W panel

export default function SolarPage() {
  const { t } = useLang();
  const [panels, setPanels]       = useState<SolarPanel[]>([]);
  const [inverters, setInverters] = useState<SolarInverter[]>([]);

  useEffect(() => {
    fetchSolarPanels().then(setPanels);
    fetchSolarInverters().then(setInverters);
  }, []);

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-6 pb-16 space-y-5">
      <div className="mb-2">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>☀️ {t("navSolar")}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {t("solarPageSubtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          <SolarSizingTool />
          <SolarROICalculator panels={panels} inverters={inverters} />
        </div>
        <div className="space-y-5">
          <SolarComparison panels={panels} inverters={inverters} />
          <SolarCTA />
        </div>
      </div>
    </div>
  );
}

// ─── SolarSizingTool ──────────────────────────────────────────────────────────
function SolarSizingTool() {
  const { t } = useLang();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [roofArea, setRoofArea] = useState("");
  const [budget, setBudget]     = useState("");
  const [result, setResult]     = useState<{
    panelCount: number; systemKw: number; monthlyGen: number;
    roofNeeded: number; coverage: number; totalCost: number;
  } | null>(null);

  function calculate() {
    const roofSqFt  = parseFloat(roofArea);
    const budgetPkr = parseFloat(budget);
    if (!roofSqFt || roofSqFt <= 0) return;
    const maxByRoof   = Math.floor(roofSqFt / PANEL_SQ_FT);
    const panelBudget = budgetPkr > INSTALL_FIXED ? budgetPkr - INSTALL_FIXED : 0;
    const maxByBudget = budgetPkr > 0 ? Math.floor(panelBudget / PANEL_PRICE) : maxByRoof;
    const panelCount  = Math.max(1, Math.min(maxByRoof, maxByBudget));
    const systemKw    = (panelCount * PANEL_W) / 1000;
    const monthlyGen  = Math.round(systemKw * PEAK_SUN_HRS * SYS_EFF * 30);
    const roofNeeded  = panelCount * PANEL_SQ_FT;
    const totalCost   = panelCount * PANEL_PRICE + INSTALL_FIXED;
    const coverage    = 0; // can't infer bill here without context
    setResult({ panelCount, systemKw, monthlyGen, roofNeeded, coverage, totalCost });
  }

  return (
    <div className="bb-card p-5 space-y-5">
      <div>
        <p className="bb-label">🏠 {t("solarSizeTitle")}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("solarSizeSub")}</p>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("solarSizeRoofArea")}</label>
          <input type="number" value={roofArea} onChange={(e) => setRoofArea(e.target.value)}
            placeholder="e.g. 200" min={0} className="bb-input w-full px-3 py-2.5 text-sm" />
          <p className="text-[10px]" style={{ color: "var(--text-hint)" }}>{t("solarSizeRoofHint")}</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("solarSizeBudget")}</label>
          <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 500000" min={0} className="bb-input w-full px-3 py-2.5 text-sm" />
          <p className="text-[10px]" style={{ color: "var(--text-hint)" }}>{t("solarSizeBudgetHint")}</p>
        </div>
        <button onClick={calculate} disabled={!roofArea}
          className="w-full py-3 rounded-xl text-sm font-extrabold transition-all disabled:opacity-30 text-white"
          style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
          ☀️ {t("solarSizeCalculate")}
        </button>
      </div>
      {result && (
        <div className="rounded-2xl p-4 space-y-4 animate-slide-up"
          style={{ background: isDark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <p className="text-sm font-extrabold" style={{ color: "#f59e0b" }}>✅ {t("solarSizeResult")}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("solarSizePanels"),    value: `${result.panelCount} ${t("solarSizePanelCount")}`, style: { color: "var(--text-primary)" } },
              { label: t("solarSizeSystemKw"),  value: `${result.systemKw.toFixed(1)} kW`,                 style: { color: "#2563eb" } },
              { label: t("solarSizeMonthlyGen"),value: `${result.monthlyGen} units/month`,                  style: { color: "#10b981" } },
              { label: t("solarSizeRoofNeeded"),value: `${result.roofNeeded} sq ft`,                        style: { color: "var(--text-secondary)" } },
              { label: "Total System Cost", value: `PKR ${result.totalCost.toLocaleString()}`, style: { color: "var(--text-primary)" } },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3 text-center"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)" }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                <p className="text-sm font-extrabold" style={item.style}>{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-center" style={{ color: "var(--text-hint)" }}>{t("solarSizeNote")}</p>
        </div>
      )}
    </div>
  );
}

// ─── SolarROICalculator ───────────────────────────────────────────────────────
function SolarROICalculator({ panels, inverters }: { panels: SolarPanel[]; inverters: SolarInverter[] }) {
  const { t } = useLang();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [systemKw, setSystemKw]       = useState(5);
  const [selectedPanel, setSelectedPanel] = useState<SolarPanel | null>(null);
  const [selectedInv, setSelectedInv]     = useState<SolarInverter | null>(null);
  const [billInput, setBillInput]     = useState("");
  const [result, setResult] = useState<{
    totalCost: number; monthlyGen: number; monthlySaving: number;
    paybackYears: number; lifetimeSaving: number;
  } | null>(null);

  function calculate() {
    if (!selectedPanel || !selectedInv) return;
    const bill = parseFloat(billInput) || 0;
    const panelCost   = selectedPanel.price_per_kw * systemKw;
    const invCost     = selectedInv.price_pkr;
    const totalCost   = panelCost + invCost + INSTALL_FIXED;
    const monthlyGen  = systemKw * PEAK_SUN_HRS * SYS_EFF * 30;
    const avgRate     = 55; // effective PKR/unit after taxes
    const monthlySaving = Math.min(bill, monthlyGen * avgRate);
    const paybackYears  = monthlySaving > 0 ? totalCost / (monthlySaving * 12) : 999;
    const lifetimeSaving = (monthlySaving * 12 * 25) - totalCost;
    setResult({ totalCost, monthlyGen: Math.round(monthlyGen), monthlySaving: Math.round(monthlySaving), paybackYears, lifetimeSaving: Math.round(lifetimeSaving) });
  }

  const accentGreen = { color: "#10b981" };
  const accentBlue  = { color: "#2563eb" };

  return (
    <div className="bb-card p-5 space-y-5">
      <div>
        <p className="bb-label">📈 {t("solarRoiTitle")}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("solarRoiSub")}</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("solarRoiSystemSize")}</label>
          <div className="flex gap-2">
            {[3, 5, 8, 10, 15].map((kw) => (
              <button key={kw} onClick={() => setSystemKw(kw)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: systemKw === kw ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "var(--bg-subtle)",
                  color: systemKw === kw ? "#fff" : "var(--text-muted)",
                  border: systemKw === kw ? "none" : "1px solid var(--border-default)",
                  boxShadow: systemKw === kw ? "var(--shadow-blue)" : "none",
                }}>
                {kw}kW
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("solarRoiPanel")}</label>
          <select value={selectedPanel?.id ?? ""}
            onChange={(e) => setSelectedPanel(panels.find((p) => p.id === Number(e.target.value)) ?? null)}
            className="bb-input w-full px-3 py-2.5 text-sm">
            <option value="">{panels.length ? t("solarRoiSelectPanel") : t("solarNoData")}</option>
            {panels.map((p) => (
              <option key={p.id} value={p.id}>{p.brand} {p.model ?? ""} — PKR {p.price_per_kw.toLocaleString()}/kW</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("solarRoiInverter")}</label>
          <select value={selectedInv?.id ?? ""}
            onChange={(e) => setSelectedInv(inverters.find((i) => i.id === Number(e.target.value)) ?? null)}
            className="bb-input w-full px-3 py-2.5 text-sm">
            <option value="">{inverters.length ? t("solarRoiSelectInverter") : t("solarNoData")}</option>
            {inverters.map((inv) => (
              <option key={inv.id} value={inv.id}>{inv.brand} {inv.capacity_kw}kW {inv.type} — PKR {inv.price_pkr.toLocaleString()}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("solarRoiMonthlyBill")}</label>
          <input type="number" value={billInput} onChange={(e) => setBillInput(e.target.value)}
            placeholder="e.g. 15000" min={0} className="bb-input w-full px-3 py-2.5 text-sm" />
        </div>
        <button onClick={calculate} disabled={!selectedPanel || !selectedInv || !billInput}
          className="w-full py-3.5 rounded-xl text-sm font-extrabold transition-all disabled:opacity-30 text-white"
          style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
          ☀️ {t("solarRoiCalculate")}
        </button>
      </div>
      {result && (
        <div className="rounded-2xl p-4 space-y-4 animate-slide-up"
          style={{ background: isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <p className="text-sm font-extrabold" style={{ color: "#10b981" }}>✅ {t("solarRoiResult")}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("solarRoiCost"),         value: `PKR ${result.totalCost.toLocaleString()}`,                       style: { color: "var(--text-primary)" } },
              { label: t("solarRoiGeneration"),    value: `${result.monthlyGen} ${t("solarRoiUnits")}`,                    style: accentBlue },
              { label: t("solarRoiMonthlySaving"), value: `PKR ${result.monthlySaving.toLocaleString()}`,                  style: accentGreen },
              { label: t("solarRoiPayback"),       value: `${result.paybackYears.toFixed(1)} ${t("solarRoiYears")}`,       style: result.paybackYears <= 4 ? accentGreen : { color: "#f59e0b" } },
            ].map((item) => (
              <div key={item.label} className="rounded-xl p-3 text-center"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)" }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                <p className="text-sm font-extrabold" style={item.style}>{item.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3 text-center"
            style={{ background: result.lifetimeSaving > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.06)", border: `1px solid ${result.lifetimeSaving > 0 ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}` }}>
            <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{t("solarRoiLifetimeSaving")}</p>
            <p className="text-xl font-extrabold" style={{ color: result.lifetimeSaving > 0 ? "#10b981" : "#ef4444" }}>
              {result.lifetimeSaving > 0 ? "+" : ""}PKR {Math.abs(result.lifetimeSaving).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SolarComparison ─────────────────────────────────────────────────────────
function SolarComparison({ panels, inverters }: { panels: SolarPanel[]; inverters: SolarInverter[] }) {
  const { t } = useLang();
  const [tab, setTab] = useState<"panels" | "inverters">("panels");

  const tierColor = (tier: number) =>
    tier === 1 ? "#10b981" : tier === 2 ? "#2563eb" : "#f59e0b";

  return (
    <div className="bb-card p-5 space-y-4">
      <div>
        <p className="bb-label">📊 {t("solarCompareTitle")}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("solarCompareSub")}</p>
      </div>
      <div className="bb-segment">
        <button onClick={() => setTab("panels")} className={`bb-segment-item${tab === "panels" ? " active" : ""}`}>
          🌞 {t("solarPanels")}
        </button>
        <button onClick={() => setTab("inverters")} className={`bb-segment-item${tab === "inverters" ? " active" : ""}`}>
          ⚡ {t("solarInverters")}
        </button>
      </div>

      {tab === "panels" && (
        panels.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>{t("solarNoData")}</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {panels.map((p) => (
              <div key={p.id} className="rounded-xl p-3 flex items-center justify-between gap-3"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)" }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                      {p.brand} {p.model ?? ""}
                    </p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: `${tierColor(p.tier)}18`, color: tierColor(p.tier), border: `1px solid ${tierColor(p.tier)}33` }}>
                      T{p.tier}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {p.technology ?? "Monocrystalline"} · {p.efficiency_pct ? `${p.efficiency_pct}% eff` : ""} · {p.warranty_years ?? "—"}yr warranty
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold" style={{ color: "#2563eb" }}>
                    PKR {p.price_per_kw.toLocaleString()}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-hint)" }}>per kW</p>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "inverters" && (
        inverters.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>{t("solarNoData")}</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {inverters.map((inv) => {
              const typeColor = inv.type === "on-grid" ? "#2563eb" : inv.type === "hybrid" ? "#10b981" : "#f59e0b";
              return (
                <div key={inv.id} className="rounded-xl p-3 flex items-center justify-between gap-3"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)" }}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        {inv.brand} {inv.capacity_kw}kW
                      </p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}33` }}>
                        {inv.type}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {inv.warranty_years ?? "—"}yr warranty
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold" style={{ color: "#2563eb" }}>
                      PKR {inv.price_pkr.toLocaleString()}
                    </p>
                    {inv.daraz_url && (
                      <a href={inv.daraz_url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] font-semibold" style={{ color: "#f97316" }}>
                        Daraz →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

// ─── SolarCTA ─────────────────────────────────────────────────────────────────
function SolarCTA() {
  const { t } = useLang();
  const [name, setName]             = useState("");
  const [phone, setPhone]           = useState("");
  const [email, setEmail]           = useState("");
  const [feedback, setFeedback]     = useState("");
  const [submitted, setSubmitted]   = useState(false);
  const [loading, setLoading]       = useState(false);

  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: "linear-gradient(135deg,#78350f 0%,#92400e 50%,#78350f 100%)", border: "1px solid rgba(251,191,36,0.2)", boxShadow: "0 8px 32px rgba(245,158,11,0.15)" }}>
      <div className="p-6 space-y-4">
        <div className="text-center text-white">
          <div className="text-4xl mb-2">☀️</div>
          <h3 className="text-lg font-extrabold">{t("solarTitle")}</h3>
          <p className="text-sm mt-1.5" style={{ color: "rgba(253,230,138,0.75)" }}>{t("solarSubDefault")}</p>
        </div>
        {submitted ? (
          <div className="text-center py-4 rounded-xl"
            style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <p className="font-bold text-lg text-white">✅ {t("solarSuccess")}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{t("solarSuccessSub")}</p>
          </div>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!name || !phone || !email) return;
            setLoading(true);
            try {
              await fetch("/api/solar-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, email: email.trim(), bill: 0, feedback: feedback.trim() }),
              });
            } catch (_) { /* still submit */ }
            setLoading(false);
            setSubmitted(true);
          }} className="space-y-2.5">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder={t("yourName")} required
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }} />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phoneNumber")} required
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailAddress")} required
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }} />
            <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)}
              placeholder={t("feedbackPlaceholder")} rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }} />
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-sm transition-all active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)", color: "#451a03", boxShadow: "var(--shadow-yellow)" }}>
              {loading ? t("sending") : t("getSolarBtn")}
            </button>
            <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.35)" }}>{t("noObligation")}</p>
          </form>
        )}
      </div>
    </div>
  );
}
