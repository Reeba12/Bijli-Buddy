"use client";

import { useState, useMemo, useEffect } from "react";
import { calculateBill, DEFAULT_FPA_RATE, isCurrentlyPeakHour } from "@/lib/tariff";
import type { MeterType, CustomerType, ApplianceInput } from "@/lib/tariff";
import { APPLIANCE_TEMPLATES, CATEGORIES, type ApplianceTemplate } from "@/lib/appliances";
import { fetchApplianceTemplates } from "@/lib/db";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";

interface UserAppliance {
  id: string;
  templateId: string;
  name: string;
  kw: number;
  defaultKw: number;
  quantity: number;
  hoursPerDay: number;
  dutyCycle: number;
}
type InputMode = "units" | "appliances";

function formatPKR(amount: number) {
  return `PKR ${Math.round(amount).toLocaleString("en-PK")}`;
}

function getBarColor(pct: number) {
  if (pct >= 40) return "#ef4444";
  if (pct >= 20) return "#f59e0b";
  return "#10b981";
}

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLang();

  const [inputMode, setInputMode]               = useState<InputMode>("units");
  const [manualUnits, setManualUnits]           = useState<string>("");
  const [peakUnitsInput, setPeakUnitsInput]     = useState<string>("");
  const [offPeakUnitsInput, setOffPeakUnitsInput] = useState<string>("");
  const [meterType, setMeterType]               = useState<MeterType>("single");
  const [customerType, setCustomerType]         = useState<CustomerType>("non-protected");
  const [sanctionedLoad, setSanctionedLoad]     = useState<number>(5);
  const [fpaRate, setFpaRate]                   = useState<number>(DEFAULT_FPA_RATE);
  const [userAppliances, setUserAppliances]     = useState<UserAppliance[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [applianceTemplates, setApplianceTemplates] = useState<ApplianceTemplate[]>(APPLIANCE_TEMPLATES);

  useEffect(() => {
    fetchApplianceTemplates().then(setApplianceTemplates);
  }, []);

  const applianceInputs: ApplianceInput[] = userAppliances.map((a) => ({
    name: a.name, kw: a.kw, quantity: a.quantity,
    hoursPerDay: a.hoursPerDay, dutyCycle: a.dutyCycle,
  }));

  const totalUnitsFromAppliances = applianceInputs.reduce((total, a) =>
    total + a.kw * a.quantity * a.hoursPerDay * (a.dutyCycle ?? 1) * 30, 0);

  const peakUnitsVal    = parseFloat(peakUnitsInput) || 0;
  const offPeakUnitsVal = parseFloat(offPeakUnitsInput) || 0;
  const threePhaseTotal = peakUnitsVal + offPeakUnitsVal;
  const peakPercent     = threePhaseTotal > 0 ? Math.round((peakUnitsVal / threePhaseTotal) * 100) : 0;

  const totalUnits = inputMode === "units"
    ? meterType === "three" ? threePhaseTotal : parseFloat(manualUnits) || 0
    : Math.round(totalUnitsFromAppliances);

  const result = useMemo(() => {
    if (totalUnits <= 0) return null;
    return calculateBill({
      totalUnits, meterType, customerType, sanctionedLoad, fpaRate,
      peakUnitsPercent: meterType === "three" ? peakPercent : 0,
      appliances: inputMode === "appliances" ? applianceInputs : [],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalUnits, meterType, customerType, sanctionedLoad, fpaRate, peakPercent, userAppliances, inputMode]);

  const [isPeak, setIsPeak] = useState(false);
  useEffect(() => { setIsPeak(isCurrentlyPeakHour()); }, []);
  const isDark = theme === "dark";

  function handleShare() {
    if (!result) return;
    const top = result.applianceBreakdown[0];
    const appLine = top ? `\n🔴 ${top.name}: ${top.percentage}% of bill` : "";
    const text = `⚡ My K-Electric Bill (BijliBuddy)\n\n📊 Units: ${result.totalUnits} kWh\n💰 Bill: ${formatPKR(result.totalBill)}${appLine}\n\nCalculate yours FREE 👇\nbijlibuddy.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function addAppliance(templateId: string) {
    const template = applianceTemplates.find((t) => t.id === templateId);
    if (!template) return;
    const existing = userAppliances.find((a) => a.templateId === templateId);
    if (existing) {
      setUserAppliances((prev) => prev.map((a) => a.id === existing.id ? { ...a, quantity: a.quantity + 1 } : a));
      return;
    }
    setUserAppliances((prev) => [...prev, {
      id: `${templateId}-${Date.now()}`, templateId, name: template.name,
      kw: template.defaultKw, defaultKw: template.defaultKw, quantity: 1,
      hoursPerDay: template.defaultHours, dutyCycle: template.dutyCycle,
    }]);
    setShowAddAppliance(false);
  }

  function removeAppliance(id: string) {
    setUserAppliances((prev) => prev.filter((a) => a.id !== id));
  }

  function updateAppliance(id: string, field: "quantity" | "hoursPerDay" | "kw", value: number) {
    setUserAppliances((prev) => prev.map((a) => a.id === id ? { ...a, [field]: Math.max(0, value) } : a));
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-5 pb-16">

      {/* Hero banner */}
      <div className="text-center py-5 mb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-3"
          style={{
            background: isDark ? "rgba(37,99,235,0.15)" : "rgba(37,99,235,0.08)",
            border: "1px solid rgba(37,99,235,0.2)",
            color: "#2563eb",
          }}>
          ⚡ {t("heroBadge")}
        </div>
        <h1 className="text-[1.8rem] sm:text-[2.2rem] font-extrabold leading-tight mb-2"
          style={{
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            whiteSpace: "pre-line",
          }}>
          {t("heroTitle")}
        </h1>
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
          {t("heroSub")}
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* ── LEFT: Inputs ─────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Mode toggle */}
          <div className="bb-segment">
            {(["units", "appliances"] as InputMode[]).map((mode) => (
              <button key={mode} onClick={() => setInputMode(mode)}
                className={`bb-segment-item${inputMode === mode ? " active" : ""}`}>
                {mode === "units" ? `📄  ${t("enterUnits")}` : `🏠  ${t("addAppliances")}`}
              </button>
            ))}
          </div>

          {/* Meter settings */}
          <div className="bb-card p-5 space-y-5">
            <p className="bb-label">{t("meterSettings")}</p>
            <div className="space-y-2">
              <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("meterType")}</label>
              <div className="grid grid-cols-2 gap-2">
                {(["single", "three"] as MeterType[]).map((m) => (
                  <button key={m} onClick={() => setMeterType(m)}
                    className="py-3 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: meterType === m ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "var(--bg-subtle)",
                      border: meterType === m ? "1px solid rgba(37,99,235,0.5)" : "1px solid var(--border-default)",
                      color: meterType === m ? "#fff" : "var(--text-muted)",
                      boxShadow: meterType === m ? "var(--shadow-blue)" : "none",
                    }}>
                    {m === "single" ? `🔌 ${t("singlePhase")}` : `⚡ ${t("threePhase")}`}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("sanctionedLoad")}</label>
                <input type="number" value={sanctionedLoad}
                  onChange={(e) => setSanctionedLoad(Number(e.target.value))}
                  min={1} max={100} className="bb-input w-full px-3 py-2.5 text-sm font-semibold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  {t("fcaRate")} <span style={{ color: "var(--text-hint)", fontWeight: 400 }}>(PKR/unit)</span>
                </label>
                <input type="number" value={fpaRate}
                  onChange={(e) => setFpaRate(parseFloat(e.target.value) || 0)}
                  step={0.01} min={0} className="bb-input w-full px-3 py-2.5 text-sm font-semibold" />
              </div>
            </div>
            <p className="text-[11px]" style={{ color: "var(--text-hint)" }}>
              💡 {t("fcaHint")} {t("defaultFca")}: {DEFAULT_FPA_RATE} PKR/unit
            </p>
          </div>

          {/* Units input */}
          {inputMode === "units" && (
            <div className="bb-card p-5 space-y-5">
              <p className="bb-label">
                {meterType === "three" ? t("peakOffPeakUnits") : t("unitsThisMonth")}
              </p>
              {meterType === "single" ? (
                <>
                  <div className="relative text-center">
                    <input type="number" value={manualUnits}
                      onChange={(e) => setManualUnits(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent text-center font-extrabold focus:outline-none py-4"
                      style={{ fontSize: "4.5rem", color: "var(--text-primary)", caretColor: "#2563eb" }} />
                    <span className="block text-[11px] font-bold tracking-widest uppercase -mt-2"
                      style={{ color: "var(--text-hint)" }}>{t("kwhMonth")}</span>
                  </div>
                  <div className="h-px" style={{ background: "var(--border-default)" }} />
                  <p className="text-[11px] text-center" style={{ color: "var(--text-hint)" }}>{t("findUnitsHint")}</p>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4 text-center space-y-2"
                      style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                      <p className="text-xs font-bold" style={{ color: "#ef4444" }}>🔴 {t("peakUnits")}</p>
                      <p className="text-[10px]" style={{ color: "rgba(239,68,68,0.5)" }}>7 PM – 11 PM</p>
                      <input type="number" value={peakUnitsInput}
                        onChange={(e) => setPeakUnitsInput(e.target.value)} placeholder="0"
                        className="w-full bg-transparent text-center font-extrabold focus:outline-none"
                        style={{ fontSize: "2.2rem", color: "var(--text-primary)", caretColor: "#ef4444" }} />
                      <span className="text-[10px] font-semibold" style={{ color: "rgba(239,68,68,0.4)" }}>kWh</span>
                    </div>
                    <div className="rounded-2xl p-4 text-center space-y-2"
                      style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)" }}>
                      <p className="text-xs font-bold" style={{ color: "#10b981" }}>🟢 {t("offPeakUnits")}</p>
                      <p className="text-[10px]" style={{ color: "rgba(16,185,129,0.5)" }}>{t("allOtherHours")}</p>
                      <input type="number" value={offPeakUnitsInput}
                        onChange={(e) => setOffPeakUnitsInput(e.target.value)} placeholder="0"
                        className="w-full bg-transparent text-center font-extrabold focus:outline-none"
                        style={{ fontSize: "2.2rem", color: "var(--text-primary)", caretColor: "#10b981" }} />
                      <span className="text-[10px] font-semibold" style={{ color: "rgba(16,185,129,0.4)" }}>kWh</span>
                    </div>
                  </div>
                  {threePhaseTotal > 0 && (
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t("totalUnits")}</span>
                      <span className="text-sm font-bold" style={{ color: "#2563eb" }}>{threePhaseTotal} kWh</span>
                    </div>
                  )}
                  <p className="text-[11px]" style={{ color: "var(--text-hint)" }}>📋 {t("findThreePhaseHint")}</p>
                </>
              )}
              {meterType === "single" && parseFloat(manualUnits) > 0 && parseFloat(manualUnits) <= 200 && (
                <div className="rounded-xl p-4 space-y-3"
                  style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <p className="text-xs font-bold" style={{ color: "#10b981" }}>✅ {t("protectedQualify")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(["non-protected", "protected"] as CustomerType[]).map((ct) => (
                      <button key={ct} onClick={() => setCustomerType(ct)}
                        className="py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: customerType === ct ? "rgba(16,185,129,0.2)" : "var(--bg-subtle)",
                          border: customerType === ct ? "1px solid rgba(16,185,129,0.4)" : "1px solid var(--border-default)",
                          color: customerType === ct ? "#10b981" : "var(--text-muted)",
                        }}>
                        {ct === "non-protected" ? t("nonProtected") : t("protected")}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Appliances */}
          {inputMode === "appliances" && (
            <div className="bb-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="bb-label">{t("myAppliances")}</p>
                <button onClick={() => setShowAddAppliance(!showAddAppliance)}
                  className="text-xs font-bold px-4 py-2 rounded-xl transition-all"
                  style={{
                    background: showAddAppliance ? "var(--bg-subtle)" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: showAddAppliance ? "var(--text-secondary)" : "#fff",
                    border: showAddAppliance ? "1px solid var(--border-default)" : "none",
                    boxShadow: showAddAppliance ? "none" : "var(--shadow-blue)",
                  }}>
                  {showAddAppliance ? t("close") : t("addAppliance")}
                </button>
              </div>

              {showAddAppliance && (
                <div className="rounded-xl p-3 space-y-3"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)" }}>
                  <div className="flex gap-2 flex-wrap">
                    {[...new Set(applianceTemplates.map((t) => t.category))].map((cat) => (
                      <button key={cat} onClick={() => setSelectedCategory(cat)}
                        className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                        style={{
                          background: selectedCategory === cat ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "var(--bg-card)",
                          color: selectedCategory === cat ? "#fff" : "var(--text-muted)",
                          border: selectedCategory === cat ? "1px solid rgba(37,99,235,0.4)" : "1px solid var(--border-default)",
                          boxShadow: selectedCategory === cat ? "var(--shadow-blue)" : "none",
                        }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {applianceTemplates.filter((tpl) => tpl.category === selectedCategory).map((tpl) => (
                      <button key={tpl.id} onClick={() => addAppliance(tpl.id)}
                        className="w-full flex items-center justify-between text-left px-3 py-3 rounded-xl transition-all group"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{tpl.icon} {tpl.name}</p>
                          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{tpl.defaultKw} kW · {tpl.defaultHours}h/day</p>
                        </div>
                        <span className="text-xl font-light group-hover:scale-125 transition-transform" style={{ color: "#2563eb" }}>+</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {userAppliances.length === 0 ? (
                <div className="text-center py-12" style={{ color: "var(--text-hint)" }}>
                  <p className="text-5xl mb-3">🏠</p>
                  <p className="text-sm font-semibold">{t("noAppliances")}</p>
                  <p className="text-xs mt-1">{t("noAppliancesHint")}</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {userAppliances.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)" }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{a.name}</p>
                          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{a.kw} kW each</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-center">
                            <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>kW</p>
                            <input type="number" value={a.kw}
                              onChange={(e) => updateAppliance(a.id, "kw", parseFloat(e.target.value) || a.defaultKw)}
                              min={0.001} max={50} step={0.001}
                              className="w-16 rounded-lg px-1.5 py-0.5 text-sm text-center focus:outline-none"
                              style={{
                                background: a.kw !== a.defaultKw ? "rgba(37,99,235,0.08)" : "var(--bg-input)",
                                border: a.kw !== a.defaultKw ? "1px solid rgba(37,99,235,0.4)" : "1px solid var(--border-default)",
                                color: "var(--text-primary)",
                              }} />
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{t("qty")}</p>
                            <div className="flex items-center gap-1">
                              <button onClick={() => updateAppliance(a.id, "quantity", a.quantity - 1)}
                                className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>−</button>
                              <span className="w-5 text-center text-sm font-bold" style={{ color: "var(--text-primary)" }}>{a.quantity}</span>
                              <button onClick={() => updateAppliance(a.id, "quantity", a.quantity + 1)}
                                className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>+</button>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{t("hrsDay")}</p>
                            <input type="number" value={a.hoursPerDay}
                              onChange={(e) => updateAppliance(a.id, "hoursPerDay", Math.min(24, parseFloat(e.target.value) || 0))}
                              min={0} max={24} step={0.5}
                              className="w-14 rounded-lg px-1.5 py-0.5 text-sm text-center focus:outline-none"
                              style={{ background: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
                          </div>
                          <button onClick={() => removeAppliance(a.id)}
                            className="text-sm transition-colors w-6 h-6 flex items-center justify-center rounded-lg"
                            style={{ color: "var(--text-hint)", background: "var(--bg-subtle)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-hint)")}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center px-1 pt-1">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t("estimatedUnits")}</span>
                    <span className="text-sm font-bold" style={{ color: "#2563eb" }}>{totalUnits} kWh</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Peak hours alert signup */}
          <PeakAlertSignup />
        </div>

        {/* ── RIGHT: Results ────────────────────────────────────────────────── */}
        <div className="space-y-4">
          {result ? (
            <div className="space-y-4 animate-slide-up">

              {/* Hero bill card */}
              <div className="relative rounded-3xl overflow-hidden bill-hero-glow"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%)"
                    : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)",
                }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 15% 85%, rgba(96,165,250,0.3) 0%, transparent 55%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.12) 0%, transparent 55%)" }} />
                <div className="relative p-7 text-center text-white">
                  <p className="text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {t("estimatedBill")}
                  </p>
                  <p className="font-extrabold leading-none mb-2"
                    style={{ fontSize: "3.8rem", textShadow: "0 2px 20px rgba(0,0,0,0.2)" }}>
                    {formatPKR(result.totalBill)}
                  </p>
                  <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {result.totalUnits} kWh {t("kwhConsumed")}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {t("tariffNotice")}
                  </p>
                  {result.isProtected && (
                    <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "rgba(16,185,129,0.25)", border: "1px solid rgba(16,185,129,0.4)", color: "#6ee7b7" }}>
                      ✅ {t("protectedApplied")}
                    </span>
                  )}
                  {meterType === "three" && result.peakUnits > 0 && (
                    <div className="mt-3 flex justify-center gap-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: "rgba(239,68,68,0.2)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }}>
                        🔴 Peak: {result.peakUnits} kWh
                      </span>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.25)" }}>
                        🟢 Off-Peak: {result.offPeakUnits} kWh
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Breakdown */}
              <div className="bb-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="bb-label">{t("billBreakdown")}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.2)" }}>
                    {t("sroRates")}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                    ⚡ {t("energyCharges")}
                    {meterType === "three" && (
                      <span style={{ color: "var(--text-hint)" }}> (off-peak @ 34.53 · peak @ 46.85)</span>
                    )}
                  </p>
                  {result.slabBreakdown.map((slab, i) => (
                    <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg"
                      style={{ background: i % 2 === 0 ? "var(--bg-subtle)" : "transparent" }}>
                      <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {meterType === "three" && slab.ratePerUnit === 46.85 && (
                          <span className="text-xs font-semibold mr-1" style={{ color: "#ef4444" }}>🔴 Peak</span>
                        )}
                        {Math.round(slab.fromUnit)}–{Math.round(slab.toUnit)} units
                        <span className="text-xs ml-1" style={{ color: "var(--text-hint)" }}>@ {slab.ratePerUnit}/kWh</span>
                      </span>
                      <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{formatPKR(Math.round(slab.cost))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 px-1">
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{t("energyTotal")}</span>
                    <span className="text-sm font-extrabold" style={{ color: "#2563eb" }}>{formatPKR(result.energyCost)}</span>
                  </div>
                </div>
                <Separator style={{ background: "var(--border-default)" }} />
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold" style={{ color: "var(--text-muted)" }}>📋 {t("leviesTaxes")}</p>
                  {[
                    { label: t("fixedCharges"), value: result.fixedCharges, note: `${meterType === "single" ? "Single" : "Three"}-phase, ${sanctionedLoad}kW load` },
                    { label: t("fuelCostAdj"), value: result.fuelPriceAdjustment, note: `${fpaRate} PKR × ${result.totalUnits} units` },
                    { label: t("additionalSurcharge"), value: result.additionalSurcharge, note: `3.23 PKR × ${result.totalUnits} units` },
                    { label: t("electricityDuty"), value: result.electricityDuty, note: "1.5% on energy + fixed" },
                    { label: t("muct"), value: result.muct, note: "Municipal tax — Karachi" },
                    { label: t("gst"), value: result.gst, note: "18% on all charges + ED" },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{row.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-hint)" }}>{row.note}</p>
                      </div>
                      <span className="text-sm font-bold ml-4 shrink-0" style={{ color: "var(--text-primary)" }}>{formatPKR(row.value)}</span>
                    </div>
                  ))}
                </div>
                <Separator style={{ background: "var(--border-default)" }} />
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>{t("totalEstimatedBill")}</span>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-hint)" }}>{t("basedOnSlab")}</p>
                  </div>
                  <span className="font-extrabold text-xl" style={{ color: "#2563eb" }}>{formatPKR(result.totalBill)}</span>
                </div>
              </div>

              {/* Appliance cost breakdown */}
              {inputMode === "appliances" && result.applianceBreakdown.length > 0 && (
                <div className="bb-card p-5 space-y-4">
                  <p className="bb-label">🔍 {t("whichCostsMost")}</p>
                  <div className="space-y-4">
                    {result.applianceBreakdown.sort((a, b) => b.percentage - a.percentage).map((a, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{a.name}</span>
                            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full"
                              style={{
                                color: getBarColor(a.percentage),
                                background: a.percentage >= 40 ? "rgba(239,68,68,0.1)" : a.percentage >= 20 ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)",
                              }}>
                              {a.percentage}%
                            </span>
                          </div>
                          <span className="text-sm font-bold" style={{ color: "var(--text-secondary)" }}>{formatPKR(a.cost)}</span>
                        </div>
                        <div className="bb-bar-track">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${a.percentage}%`, background: getBarColor(a.percentage) }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Smart Insights */}
              <div className="bb-card p-5 space-y-3">
                <p className="bb-label">💡 {t("smartInsights")}</p>
                <div className="space-y-2.5">
                  {result.totalBill > 20000 && (
                    <InsightCard color="yellow" icon="☀️" text={<>{t("insightSolar")}</>} />
                  )}
                  {result.totalBill >= 8000 && result.totalBill <= 20000 && (
                    <InsightCard color="blue" icon="❄️"
                      text={<>{t("insightInverter")} <strong>{formatPKR(Math.round(result.totalBill * 0.25))}</strong> {t("insightInverterSuffix")}</>} />
                  )}
                  {isPeak && (
                    <InsightCard color="red" icon="⚡" text={<>{t("insightPeak")}</>} />
                  )}
                  {result.slabBreakdown.length >= 4 && (
                    <InsightCard color="orange" icon="📊"
                      text={<>{t("insightSlab")} <strong>{result.slabBreakdown.length}</strong>. {t("insightSlabSuffix")}</>} />
                  )}
                  <InsightCard color="green" icon="🌙" text={<>{t("insightNight")}</>} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleShare}
                  className="flex items-center justify-center gap-2 font-bold py-4 px-4 rounded-2xl text-sm transition-all active:scale-95 text-white"
                  style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "var(--shadow-green)" }}>
                  📱 {t("shareWhatsApp")}
                </button>
                <a href="/solar"
                  className="flex items-center justify-center gap-2 font-bold py-4 px-4 rounded-2xl text-sm transition-all active:scale-95 text-center text-white"
                  style={{ background: "linear-gradient(135deg, #d97706, #b45309)", boxShadow: "var(--shadow-yellow)" }}>
                  ☀️ {t("getSolarQuote")}
                </a>
              </div>
            </div>
          ) : (
            <div className="bb-card p-10 text-center space-y-3">
              <p className="text-5xl">⚡</p>
              <p className="font-bold" style={{ color: "var(--text-secondary)" }}>
                {t("emptyStateLine1")}
              </p>
              <p className="text-xs" style={{ color: "var(--text-hint)" }}>
                {t("emptyStateLine2")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PeakAlertSignup() {
  const { t } = useLang();
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const value = contact.trim();
    if (!value) return;
    setLoading(true);
    const isEmail = value.includes("@");
    try {
      await fetch("/api/tariff-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEmail ? { email: value } : { phone: value }),
      });
    } catch { /* still show success */ }
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="bb-card p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <span className="text-lg">⏰</span>
        </div>
        <div>
          <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>{t("peakAlertTitle")}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t("peakAlertSub")}</p>
        </div>
      </div>
      {submitted ? (
        <div className="rounded-xl p-4 text-center"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <p className="font-bold text-sm" style={{ color: "#10b981" }}>✅ {t("peakAlertSuccess")}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("peakAlertSuccessSub")}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={t("peakAlertContact")}
            className="bb-input flex-1 px-3 py-2.5 text-sm"
          />
          <button type="submit" disabled={!contact.trim() || loading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40 shrink-0"
            style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 16px rgba(239,68,68,0.3)" }}>
            {loading ? "..." : t("peakAlertBtn")}
          </button>
        </form>
      )}
      <p className="text-[10px]" style={{ color: "var(--text-hint)" }}>⚡ {t("peakAlertNote")}</p>
    </div>
  );
}

function InsightCard({ color, icon, text }: { color: string; icon: string; text: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const lightStyles: Record<string, React.CSSProperties> = {
    yellow: { background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#92400e" },
    blue:   { background: "rgba(37,99,235,0.07)",  border: "1px solid rgba(37,99,235,0.18)",  color: "#1e40af" },
    red:    { background: "rgba(239,68,68,0.07)",  border: "1px solid rgba(239,68,68,0.18)",  color: "#991b1b" },
    orange: { background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.18)", color: "#9a3412" },
    green:  { background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)", color: "#065f46" },
  };
  const darkStyles: Record<string, React.CSSProperties> = {
    yellow: { background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#fde68a" },
    blue:   { background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)", color: "#bfdbfe" },
    red:    { background: "rgba(239,68,68,0.08)",  border: "1px solid rgba(239,68,68,0.18)",  color: "#fecaca" },
    orange: { background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)", color: "#fed7aa" },
    green:  { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)", color: "#d1fae5" },
  };
  return (
    <div className="flex gap-3 p-3.5 rounded-xl text-sm leading-relaxed"
      style={isDark ? darkStyles[color] : lightStyles[color]}>
      <span className="shrink-0 text-base">{icon}</span>
      <p>{text}</p>
    </div>
  );
}
