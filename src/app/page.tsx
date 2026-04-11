"use client";

import { useState, useMemo } from "react";
import { calculateBill, explainBillShock, DEFAULT_FPA_RATE, isCurrentlyPeakHour } from "@/lib/tariff";
import type { MeterType, CustomerType, ApplianceInput } from "@/lib/tariff";
import { APPLIANCE_TEMPLATES, CATEGORIES } from "@/lib/appliances";
import { Separator } from "@/components/ui/separator";

const PP = "var(--font-poppins)";

interface UserAppliance {
  id: string;
  templateId: string;
  name: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
  dutyCycle: number;
}

type InputMode = "units" | "appliances";

function formatPKR(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

function getBarColor(pct: number) {
  if (pct >= 40) return "from-red-500 to-rose-600";
  if (pct >= 20) return "from-amber-400 to-orange-500";
  return "from-emerald-400 to-teal-500";
}

function getPctColor(pct: number) {
  if (pct >= 40) return "text-red-400";
  if (pct >= 20) return "text-amber-400";
  return "text-emerald-400";
}

const glass = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.09)",
} as React.CSSProperties;

const glassStrong = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.12)",
} as React.CSSProperties;

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("units");
  const [manualUnits, setManualUnits] = useState<string>("");
  // Three-phase: enter peak and off-peak separately
  const [peakUnitsInput, setPeakUnitsInput] = useState<string>("");
  const [offPeakUnitsInput, setOffPeakUnitsInput] = useState<string>("");
  const [meterType, setMeterType] = useState<MeterType>("single");
  const [customerType, setCustomerType] = useState<CustomerType>("non-protected");
  const [sanctionedLoad, setSanctionedLoad] = useState<number>(5);
  const [fpaRate, setFpaRate] = useState<number>(DEFAULT_FPA_RATE);
  const [userAppliances, setUserAppliances] = useState<UserAppliance[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const applianceInputs: ApplianceInput[] = userAppliances.map((a) => ({
    name: a.name, watts: a.watts, quantity: a.quantity,
    hoursPerDay: a.hoursPerDay, dutyCycle: a.dutyCycle,
  }));

  const totalUnitsFromAppliances = applianceInputs.reduce((total, a) => {
    return total + ((a.watts * a.quantity * a.hoursPerDay * (a.dutyCycle ?? 1)) / 1000) * 30;
  }, 0);

  // For three-phase in "units" mode: use separate peak + off-peak fields
  const peakUnitsVal = parseFloat(peakUnitsInput) || 0;
  const offPeakUnitsVal = parseFloat(offPeakUnitsInput) || 0;
  const threePhaseTotal = peakUnitsVal + offPeakUnitsVal;
  const peakPercent = threePhaseTotal > 0 ? Math.round((peakUnitsVal / threePhaseTotal) * 100) : 0;

  const totalUnits = inputMode === "units"
    ? meterType === "three"
      ? threePhaseTotal
      : parseFloat(manualUnits) || 0
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

  const isPeak = isCurrentlyPeakHour();

  function handleShare() {
    if (!result) return;
    const topAppliance = result.applianceBreakdown[0];
    const applianceLine = topAppliance
      ? `\n🔴 ${topAppliance.name}: ${topAppliance.percentage}% of bill` : "";
    const text = `⚡ My K-Electric Bill (BijliBuddy)\n\n📊 Units: ${result.totalUnits} kWh\n💰 Bill: ${formatPKR(result.totalBill)}${applianceLine}\n\nCalculate yours FREE 👇\nbijlibuddy.vercel.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function addAppliance(templateId: string) {
    const template = APPLIANCE_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const existing = userAppliances.find((a) => a.templateId === templateId);
    if (existing) {
      setUserAppliances((prev) => prev.map((a) => a.id === existing.id ? { ...a, quantity: a.quantity + 1 } : a));
      return;
    }
    setUserAppliances((prev) => [...prev, {
      id: `${templateId}-${Date.now()}`, templateId, name: template.name,
      watts: template.defaultWatts, quantity: 1,
      hoursPerDay: template.defaultHours, dutyCycle: template.dutyCycle,
    }]);
    setShowAddAppliance(false);
  }

  function removeAppliance(id: string) {
    setUserAppliances((prev) => prev.filter((a) => a.id !== id));
  }

  function updateAppliance(id: string, field: "quantity" | "hoursPerDay", value: number) {
    setUserAppliances((prev) => prev.map((a) => a.id === id ? { ...a, [field]: Math.max(0, value) } : a));
  }

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: PP, background: "linear-gradient(160deg, #060d1f 0%, #0a1628 40%, #0d1f4a 70%, #08132e 100%)" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50" style={{ background: "rgba(6,13,31,0.85)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40"
              style={{ background: "linear-gradient(135deg, #2563eb, #06b6d4)" }}>
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h1 className="font-bold text-[15px] leading-tight" style={{ fontFamily: PP }}>BijliBuddy</h1>
              <p className="text-[11px] font-medium" style={{ color: "#38bdf8" }}>K-Electric Calculator</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide ${isPeak
            ? "text-red-300" : "text-emerald-300"}`}
            style={{
              background: isPeak ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
              border: isPeak ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(16,185,129,0.25)",
            }}>
            <span className={`w-2 h-2 rounded-full ${isPeak ? "bg-red-400" : "bg-emerald-400"}`}
              style={{ boxShadow: isPeak ? "0 0 6px #f87171" : "0 0 6px #34d399" }} />
            {isPeak ? "Peak Hours" : "Off-Peak"}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* ── HERO ── */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-4"
            style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }}>
            ⚡ Free · No Login · Instant Results
          </div>
          <h2 className="text-[2.2rem] font-extrabold leading-tight mb-3"
            style={{ fontFamily: PP, background: "linear-gradient(135deg, #ffffff 0%, #93c5fd 60%, #67e8f9 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Why is your K-Electric<br />bill so high?
          </h2>
          <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: "rgba(147,197,253,0.7)" }}>
            Enter your units — get an instant breakdown of every charge on your bill.
          </p>
        </div>

        {/* ── MODE TOGGLE ── */}
        <div className="rounded-2xl p-1.5 flex gap-1.5" style={glassStrong}>
          {(["units", "appliances"] as InputMode[]).map((mode) => (
            <button key={mode} onClick={() => setInputMode(mode)}
              style={{
                fontFamily: PP,
                ...(inputMode === mode
                  ? { background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 4px 16px rgba(37,99,235,0.4)" }
                  : { background: "transparent" })
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${inputMode === mode ? "text-white" : "hover:bg-white/5"}`}>
              <span style={{ color: inputMode === mode ? "#fff" : "rgba(147,197,253,0.6)" }}>
                {mode === "units" ? "📄  Enter Units" : "🏠  Add Appliances"}
              </span>
            </button>
          ))}
        </div>

        {/* ── METER SETTINGS ── */}
        <div className="rounded-2xl p-5 space-y-5" style={glass}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[11px]"
              style={{ background: "rgba(59,130,246,0.2)" }}>⚙️</div>
            <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "rgba(147,197,253,0.5)" }}>Meter Settings</p>
          </div>

          {/* Meter Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>Meter Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["single", "three"] as MeterType[]).map((m) => (
                <button key={m} onClick={() => setMeterType(m)}
                  className="py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    fontFamily: PP,
                    background: meterType === m ? "linear-gradient(135deg, #1d4ed8, #1e40af)" : "rgba(255,255,255,0.04)",
                    border: meterType === m ? "1px solid rgba(59,130,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
                    color: meterType === m ? "#fff" : "rgba(255,255,255,0.35)",
                    boxShadow: meterType === m ? "0 4px 16px rgba(29,78,216,0.3)" : "none",
                  }}>
                  {m === "single" ? "🔌 Single Phase" : "⚡ Three Phase"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>Sanctioned Load (kW)</label>
              <input type="number" value={sanctionedLoad}
                onChange={(e) => setSanctionedLoad(Number(e.target.value))}
                min={1} max={100}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none transition-all"
                style={{ fontFamily: PP, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.45)" }}>
                FCA Rate <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400 }}>(PKR/unit)</span>
              </label>
              <input type="number" value={fpaRate}
                onChange={(e) => setFpaRate(parseFloat(e.target.value) || 0)}
                step={0.01} min={0}
                className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none transition-all"
                style={{ fontFamily: PP, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          </div>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            💡 Find FCA on your bill slip under &quot;Fuel Cost Adjustment&quot;. Default: {DEFAULT_FPA_RATE} PKR/unit
          </p>
        </div>

        {/* ── UNITS INPUT ── */}
        {inputMode === "units" && (
          <div className="rounded-2xl p-5 space-y-5" style={glass}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[11px]"
                style={{ background: "rgba(59,130,246,0.2)" }}>📊</div>
              <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "rgba(147,197,253,0.5)" }}>
                {meterType === "three" ? "Peak & Off-Peak Units" : "Units This Month"}
              </p>
            </div>

            {meterType === "single" ? (
              /* Single phase — one big input */
              <>
                <div className="relative text-center">
                  <input type="number" value={manualUnits}
                    onChange={(e) => setManualUnits(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent text-center font-extrabold text-white placeholder-white/10 focus:outline-none py-4"
                    style={{ fontSize: "4rem", fontFamily: PP }}
                  />
                  <span className="block text-[11px] font-semibold tracking-widest uppercase -mt-2" style={{ color: "rgba(255,255,255,0.18)" }}>kWh / month</span>
                </div>
                <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
                <p className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Find &quot;Units Consumed&quot; on your K-Electric bill slip
                </p>
              </>
            ) : (
              /* Three phase — separate peak + off-peak */
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-4 text-center space-y-2"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p className="text-xs font-bold" style={{ color: "#fca5a5" }}>🔴 Peak Units</p>
                    <p className="text-[10px]" style={{ color: "rgba(252,165,165,0.5)" }}>7 PM – 11 PM</p>
                    <input type="number" value={peakUnitsInput}
                      onChange={(e) => setPeakUnitsInput(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent text-center font-extrabold text-white placeholder-white/10 focus:outline-none"
                      style={{ fontSize: "2.2rem", fontFamily: PP }}
                    />
                    <span className="text-[10px] font-semibold" style={{ color: "rgba(252,165,165,0.4)" }}>kWh</span>
                  </div>
                  <div className="rounded-xl p-4 text-center space-y-2"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <p className="text-xs font-bold" style={{ color: "#6ee7b7" }}>🟢 Off-Peak Units</p>
                    <p className="text-[10px]" style={{ color: "rgba(110,231,183,0.5)" }}>All other hours</p>
                    <input type="number" value={offPeakUnitsInput}
                      onChange={(e) => setOffPeakUnitsInput(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent text-center font-extrabold text-white placeholder-white/10 focus:outline-none"
                      style={{ fontSize: "2.2rem", fontFamily: PP }}
                    />
                    <span className="text-[10px] font-semibold" style={{ color: "rgba(110,231,183,0.4)" }}>kWh</span>
                  </div>
                </div>
                {threePhaseTotal > 0 && (
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Total units</span>
                    <span className="text-sm font-bold" style={{ color: "#93c5fd" }}>{threePhaseTotal} kWh</span>
                  </div>
                )}
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.22)" }}>
                  📋 Find &quot;Energy - Peak&quot; and &quot;Energy - Off Peak&quot; readings on your bill slip
                </p>
              </>
            )}

            {/* Protected tariff toggle */}
            {meterType === "single" && parseFloat(manualUnits) > 0 && parseFloat(manualUnits) <= 200 && (
              <div className="rounded-xl p-4 space-y-3"
                style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)" }}>
                <p className="text-xs font-bold" style={{ color: "#6ee7b7" }}>✅ You may qualify for Protected (Lifeline) tariff</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["non-protected", "protected"] as CustomerType[]).map((ct) => (
                    <button key={ct} onClick={() => setCustomerType(ct)}
                      className="py-2 rounded-xl text-xs font-bold transition-all"
                      style={{
                        fontFamily: PP,
                        background: customerType === ct ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.04)",
                        border: customerType === ct ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.08)",
                        color: customerType === ct ? "#6ee7b7" : "rgba(255,255,255,0.3)",
                      }}>
                      {ct === "non-protected" ? "Non-Protected" : "Protected"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── APPLIANCES ── */}
        {inputMode === "appliances" && (
          <div className="rounded-2xl p-5 space-y-4" style={glass}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "rgba(147,197,253,0.5)" }}>My Appliances</p>
              </div>
              <button onClick={() => setShowAddAppliance(!showAddAppliance)}
                className="text-xs font-bold px-4 py-2 rounded-xl transition-all"
                style={{
                  fontFamily: PP,
                  background: showAddAppliance ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  color: "#fff",
                  boxShadow: showAddAppliance ? "none" : "0 4px 12px rgba(37,99,235,0.35)",
                }}>
                {showAddAppliance ? "✕ Close" : "+ Add Appliance"}
              </button>
            </div>

            {showAddAppliance && (
              <div className="rounded-xl p-3 space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((cat) => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)}
                      className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
                      style={{
                        fontFamily: PP,
                        background: selectedCategory === cat ? "linear-gradient(135deg, #2563eb, #1d4ed8)" : "rgba(255,255,255,0.06)",
                        color: selectedCategory === cat ? "#fff" : "rgba(255,255,255,0.35)",
                        border: selectedCategory === cat ? "1px solid rgba(59,130,246,0.4)" : "1px solid rgba(255,255,255,0.08)",
                      }}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {APPLIANCE_TEMPLATES.filter((t) => t.category === selectedCategory).map((t) => (
                    <button key={t.id} onClick={() => addAppliance(t.id)}
                      className="w-full flex items-center justify-between text-left px-3 py-3 rounded-xl transition-all group"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div>
                        <p className="text-sm font-semibold">{t.icon} {t.name}</p>
                        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>{t.defaultWatts}W · {t.defaultHours}h/day</p>
                      </div>
                      <span className="text-blue-400 text-xl font-light group-hover:scale-110 transition-transform">+</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {userAppliances.length === 0 ? (
              <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.18)" }}>
                <p className="text-5xl mb-3">🏠</p>
                <p className="text-sm font-semibold">No appliances added yet</p>
                <p className="text-xs mt-1">Tap &quot;+ Add Appliance&quot; to get started</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {userAppliances.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{a.name}</p>
                        <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>{a.watts}W each</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.28)" }}>Qty</p>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateAppliance(a.id, "quantity", a.quantity - 1)} className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all" style={{ background: "rgba(255,255,255,0.1)" }}>−</button>
                            <span className="w-5 text-center text-sm font-bold">{a.quantity}</span>
                            <button onClick={() => updateAppliance(a.id, "quantity", a.quantity + 1)} className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition-all" style={{ background: "rgba(255,255,255,0.1)" }}>+</button>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-semibold mb-1" style={{ color: "rgba(255,255,255,0.28)" }}>Hrs/day</p>
                          <input type="number" value={a.hoursPerDay}
                            onChange={(e) => updateAppliance(a.id, "hoursPerDay", Math.min(24, parseFloat(e.target.value) || 0))}
                            min={0} max={24} step={0.5}
                            className="w-14 rounded-lg px-1.5 py-0.5 text-sm text-white text-center focus:outline-none"
                            style={{ fontFamily: PP, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.08)" }}
                          />
                        </div>
                        <button onClick={() => removeAppliance(a.id)} className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.2)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center px-1 pt-1">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>Estimated monthly units</span>
                  <span className="text-sm font-bold" style={{ color: "#93c5fd" }}>{totalUnits} kWh</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── BILL RESULT ── */}
        {result && (
          <div className="space-y-4">

            {/* Total Bill Hero Card */}
            <div className="relative rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #1e3a8a 100%)", boxShadow: "0 8px 40px rgba(29,78,216,0.45), 0 0 80px rgba(29,78,216,0.15)" }}>
              {/* Decorative orbs */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(circle at 15% 85%, rgba(96,165,250,0.25) 0%, transparent 55%), radial-gradient(circle at 85% 15%, rgba(147,197,253,0.2) 0%, transparent 55%)" }} />
              <div className="relative p-7 text-center">
                <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "rgba(147,197,253,0.6)" }}>
                  Estimated Monthly Bill
                </p>
                <p className="font-extrabold leading-none mb-2"
                  style={{ fontSize: "3.8rem", fontFamily: PP, textShadow: "0 2px 20px rgba(255,255,255,0.2)" }}>
                  {formatPKR(result.totalBill)}
                </p>
                <p className="text-sm mb-1" style={{ color: "rgba(147,197,253,0.55)" }}>
                  {result.totalUnits} kWh consumed this month
                </p>
                {/* Tariff notice */}
                <p className="text-[11px] mt-2" style={{ color: "rgba(147,197,253,0.4)" }}>
                  (Based on K-Electric tariff — SRO 279/2026, effective Feb 12, 2026)
                </p>
                {result.isProtected && (
                  <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.35)", color: "#6ee7b7" }}>
                    ✅ Protected Tariff Applied
                  </span>
                )}
                {meterType === "three" && result.peakUnits > 0 && (
                  <div className="mt-3 flex justify-center gap-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>
                      🔴 Peak: {result.peakUnits} kWh
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(16,185,129,0.15)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.2)" }}>
                      🟢 Off-Peak: {result.offPeakUnits} kWh
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bill Breakdown */}
            <div className="rounded-2xl p-5 space-y-4" style={glass}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "rgba(147,197,253,0.5)" }}>Bill Breakdown</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(59,130,246,0.12)", color: "rgba(147,197,253,0.6)", border: "1px solid rgba(59,130,246,0.15)" }}>
                  SRO 279/2026 rates
                </span>
              </div>

              {/* Energy slab rows */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                  ⚡ Energy Charges
                  {meterType === "three" && <span style={{ color: "rgba(255,255,255,0.18)" }}> (off-peak @ 34.53 · peak @ 46.85)</span>}
                </p>
                {result.slabBreakdown.map((slab, i) => (
                  <div key={i} className="flex justify-between items-center py-2 rounded-lg px-3"
                    style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.025)" : "transparent" }}>
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {meterType === "three" && slab.ratePerUnit === 46.85
                        ? <span className="text-xs font-semibold" style={{ color: "#fca5a5" }}>🔴 Peak &nbsp;</span>
                        : null}
                      {Math.round(slab.fromUnit)}–{Math.round(slab.toUnit)} units
                      <span className="text-xs ml-2" style={{ color: "rgba(255,255,255,0.25)" }}>@ {slab.ratePerUnit}/kWh</span>
                    </span>
                    <span className="text-sm font-bold">{formatPKR(Math.round(slab.cost))}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 px-1">
                  <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>Energy Total</span>
                  <span className="text-sm font-extrabold" style={{ color: "#93c5fd" }}>{formatPKR(result.energyCost)}</span>
                </div>
              </div>

              <Separator style={{ background: "rgba(255,255,255,0.07)" }} />

              {/* Other charges */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.25)" }}>📋 Levies & Taxes</p>
                {[
                  { label: "Fixed Charges", value: result.fixedCharges, note: `${meterType === "single" ? "Single" : "Three"}-phase, ${sanctionedLoad}kW load` },
                  { label: "Fuel Cost Adj. (FCA)", value: result.fuelPriceAdjustment, note: `${fpaRate} PKR × ${result.totalUnits} units` },
                  { label: "Additional Surcharge (PHL)", value: result.additionalSurcharge, note: `3.23 PKR × ${result.totalUnits} units` },
                  { label: "Electricity Duty", value: result.electricityDuty, note: "1.5% on energy + fixed" },
                  { label: "MUCT (KMC)", value: result.muct, note: "Municipal tax — Karachi" },
                  { label: "GST / Sales Tax", value: result.gst, note: "18% on all charges + ED" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{row.label}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.22)" }}>{row.note}</p>
                    </div>
                    <span className="text-sm font-bold ml-4 shrink-0">{formatPKR(row.value)}</span>
                  </div>
                ))}
              </div>

              <Separator style={{ background: "rgba(255,255,255,0.07)" }} />

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-base font-extrabold">Total Estimated Bill</span>
                  <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                    Based on current K-Electric slab rates (SRO 279/2026)
                  </p>
                </div>
                <span className="font-extrabold text-xl" style={{ fontFamily: PP, color: "#60a5fa" }}>
                  {formatPKR(result.totalBill)}
                </span>
              </div>
            </div>

            {/* Appliance Breakdown */}
            {inputMode === "appliances" && result.applianceBreakdown.length > 0 && (
              <div className="rounded-2xl p-5 space-y-4" style={glass}>
                <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "rgba(147,197,253,0.5)" }}>
                  🔍 Which Appliance Costs Most?
                </p>
                <div className="space-y-4">
                  {result.applianceBreakdown.sort((a, b) => b.percentage - a.percentage).map((a, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{a.name}</span>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${getPctColor(a.percentage)}`}
                            style={{ background: a.percentage >= 40 ? "rgba(239,68,68,0.12)" : a.percentage >= 20 ? "rgba(251,191,36,0.12)" : "rgba(16,185,129,0.12)" }}>
                            {a.percentage}%
                          </span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.65)" }}>{formatPKR(a.cost)}</span>
                      </div>
                      <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className={`h-2 rounded-full bg-gradient-to-r ${getBarColor(a.percentage)} transition-all duration-700`}
                          style={{ width: `${a.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Insights */}
            <div className="rounded-2xl p-5 space-y-3" style={glass}>
              <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "rgba(147,197,253,0.5)" }}>💡 Smart Insights</p>
              <div className="space-y-2.5">
                {result.totalBill > 20000 && (
                  <InsightCard color="yellow" icon="☀️"
                    text={<>Your bill qualifies for <strong>solar savings</strong>. A 5kW system in Karachi pays for itself in under 3 years.</>} />
                )}
                {result.totalBill >= 8000 && result.totalBill <= 20000 && (
                  <InsightCard color="blue" icon="❄️"
                    text={<>Switching to <strong>inverter AC</strong> could save approx. <strong>{formatPKR(Math.round(result.totalBill * 0.25))}</strong> per month.</>} />
                )}
                {isPeak && (
                  <InsightCard color="red" icon="⚡"
                    text={<><strong>Peak hours active (7–11 PM).</strong> Shift heavy appliances after 11 PM to avoid surcharges.</>} />
                )}
                {result.slabBreakdown.length >= 4 && (
                  <InsightCard color="orange" icon="📊"
                    text={<>You&apos;re in <strong>Slab {result.slabBreakdown.length}</strong>. Cutting 50 units drops you a slab — big savings.</>} />
                )}
                <InsightCard color="green" icon="🌙"
                  text={<>No peak surcharge after <strong>11 PM</strong>. Run washing machines, water motors &amp; irons at night.</>} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleShare}
                className="flex items-center justify-center gap-2 font-bold py-4 px-4 rounded-2xl text-sm transition-all active:scale-95"
                style={{ fontFamily: PP, background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 4px 20px rgba(22,163,74,0.35)" }}>
                📱 Share on WhatsApp
              </button>
              <a href="#solar-cta"
                className="flex items-center justify-center gap-2 font-bold py-4 px-4 rounded-2xl text-sm transition-all active:scale-95 text-center"
                style={{ fontFamily: PP, background: "linear-gradient(135deg, #d97706, #b45309)", boxShadow: "0 4px 20px rgba(217,119,6,0.35)" }}>
                ☀️ Get Solar Quote
              </a>
            </div>
          </div>
        )}

        {/* ── BILL SHOCK ── */}
        <BillShockSection meterType={meterType} sanctionedLoad={sanctionedLoad} fpaRate={fpaRate} />

        {/* ── SOLAR CTA ── */}
        <div id="solar-cta">
          <SolarCTA bill={result?.totalBill ?? 0} />
        </div>

        {/* ── EMAIL CAPTURE ── */}
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: "linear-gradient(135deg, rgba(29,78,216,0.18), rgba(88,28,135,0.18))", border: "1px solid rgba(99,102,241,0.18)" }}>
          <div className="text-center">
            <p className="font-extrabold text-base" style={{ fontFamily: PP }}>📬 Get Tariff Update Alerts</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Know when K-Electric rates change so your estimates stay accurate.</p>
          </div>
          {emailSubmitted ? (
            <div className="text-center py-3 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <p className="font-bold" style={{ color: "#6ee7b7" }}>✅ You&apos;re on the list!</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>We&apos;ll email you when tariffs update</p>
            </div>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!email) return;
              setEmailLoading(true);
              try {
                await fetch("/api/notify-lead", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });
              } catch (_) { /* still mark submitted even if network fails */ }
              setEmailLoading(false);
              setEmailSubmitted(true);
            }} className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" required
                className="flex-1 rounded-xl px-3 py-3 text-sm text-white focus:outline-none transition-all"
                style={{ fontFamily: PP, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              <button type="submit" disabled={emailLoading}
                className="px-4 py-3 rounded-xl text-sm font-bold text-white whitespace-nowrap transition-all disabled:opacity-60"
                style={{ fontFamily: PP, background: "linear-gradient(135deg, #3b82f6, #2563eb)", boxShadow: "0 4px 12px rgba(59,130,246,0.35)" }}>
                {emailLoading ? "..." : "Notify Me"}
              </button>
            </form>
          )}
        </div>


        <footer className="text-center pb-8 pt-2 space-y-1" style={{ color: "rgba(255,255,255,0.12)", fontSize: "11px" }}>
          <p className="font-semibold" style={{ fontFamily: PP }}>BijliBuddy · K-Electric Bill Estimator · Karachi</p>
          <p>Rates per SRO 279(I)/2026, effective Feb 12, 2026. Results are estimates only.</p>
          <p>Not affiliated with K-Electric or NEPRA.</p>
        </footer>

      </main>
    </div>
  );
}

// ── Insight Card ──────────────────────────────────────────────────────────────
function InsightCard({ color, icon, text }: { color: string; icon: string; text: React.ReactNode }) {
  const styles: Record<string, React.CSSProperties> = {
    yellow: { background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.18)", color: "#fef08a" },
    blue:   { background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)", color: "#bfdbfe" },
    red:    { background: "rgba(239,68,68,0.08)",  border: "1px solid rgba(239,68,68,0.18)",  color: "#fecaca" },
    orange: { background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.18)", color: "#fed7aa" },
    green:  { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)", color: "#d1fae5" },
  };
  return (
    <div className="flex gap-3 p-3.5 rounded-xl text-sm leading-relaxed" style={styles[color]}>
      <span className="shrink-0 text-base">{icon}</span>
      <p>{text}</p>
    </div>
  );
}

// ── Bill Shock ────────────────────────────────────────────────────────────────
function BillShockSection({ meterType, sanctionedLoad, fpaRate }: { meterType: MeterType; sanctionedLoad: number; fpaRate: number }) {
  const [lastUnits, setLastUnits] = useState("");
  const [thisUnits, setThisUnits] = useState("");
  const [shockResult, setShockResult] = useState<ReturnType<typeof explainBillShock> | null>(null);

  function handleExplain() {
    const last = parseFloat(lastUnits);
    const current = parseFloat(thisUnits);
    if (last > 0 && current > 0)
      setShockResult(explainBillShock(last, current, meterType, sanctionedLoad, fpaRate, fpaRate));
  }

  return (
    <div className="rounded-2xl p-5 space-y-4"
      style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div>
        <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "rgba(147,197,253,0.5)" }}>😱 Bill Shock Explainer</p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>Why did your bill jump this month?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Last Month (units)", value: lastUnits, setter: setLastUnits, placeholder: "e.g. 280" },
          { label: "This Month (units)", value: thisUnits, setter: setThisUnits, placeholder: "e.g. 420" },
        ].map((field) => (
          <div key={field.label} className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.38)" }}>{field.label}</label>
            <input type="number" value={field.value} placeholder={field.placeholder}
              onChange={(e) => { field.setter(e.target.value); setShockResult(null); }}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition-all"
              style={{ fontFamily: "var(--font-poppins)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }}
            />
          </div>
        ))}
      </div>
      <button onClick={handleExplain} disabled={!lastUnits || !thisUnits}
        className="w-full py-3.5 rounded-xl text-sm font-extrabold transition-all disabled:opacity-25 disabled:cursor-not-allowed"
        style={{
          fontFamily: "var(--font-poppins)",
          background: lastUnits && thisUnits ? "linear-gradient(135deg, #ea580c, #c2410c)" : "rgba(255,255,255,0.07)",
          boxShadow: lastUnits && thisUnits ? "0 4px 20px rgba(234,88,12,0.35)" : "none",
        }}>
        Explain My Bill Jump →
      </button>

      {shockResult && (
        <div className="space-y-3">
          <div className="text-center p-4 rounded-xl" style={{
            background: shockResult.difference > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
            border: shockResult.difference > 0 ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(16,185,129,0.2)",
          }}>
            <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>Bill Changed By</p>
            <p className="font-extrabold text-3xl" style={{ fontFamily: "var(--font-poppins)", color: shockResult.difference > 0 ? "#fca5a5" : "#6ee7b7" }}>
              {shockResult.difference > 0 ? "+" : ""}PKR {Math.abs(shockResult.difference).toLocaleString()}
            </p>
          </div>
          {shockResult.reasons.map((r, i) => (
            <div key={i} className="flex gap-3 p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-base shrink-0" style={{ color: r.impact > 0 ? "#f87171" : "#34d399" }}>{r.impact > 0 ? "▲" : "▼"}</span>
              <div className="flex-1">
                <p className="text-sm font-bold">{r.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{r.description}</p>
                <p className="text-sm font-extrabold mt-1" style={{ color: r.impact > 0 ? "#fca5a5" : "#6ee7b7" }}>
                  {r.impact > 0 ? "+" : ""}PKR {Math.abs(r.impact).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Solar CTA ─────────────────────────────────────────────────────────────────
function SolarCTA({ bill }: { bill: number }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [solarFeedback, setSolarFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.55), rgba(146,64,14,0.35))", border: "1px solid rgba(251,191,36,0.18)", boxShadow: "0 8px 32px rgba(251,191,36,0.06)" }}>
      <div className="p-6 space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">☀️</div>
          <h3 className="text-lg font-extrabold" style={{ fontFamily: "var(--font-poppins)" }}>Cut Your Bill by 70% with Solar</h3>
          <p className="text-sm mt-1.5" style={{ color: "rgba(253,230,138,0.65)" }}>
            {bill > 0
              ? <>With a bill of <strong style={{ color: "#fde68a" }}>{formatPKR(bill)}</strong>, solar pays for itself in Karachi in under 3 years.</>
              : "Get 3 free quotes from verified solar installers in Karachi."}
          </p>
        </div>
        {submitted ? (
          <div className="text-center py-4 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <p className="font-bold text-lg" style={{ color: "#6ee7b7" }}>✅ Request Received!</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>3 verified installers will contact you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!name || !phone) return;
            setLoading(true);
            try {
              await fetch("/api/solar-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, bill, feedback: solarFeedback.trim() }),
              });
            } catch (_) { /* still mark submitted */ }
            setLoading(false);
            setSubmitted(true);
          }} className="space-y-2.5">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Your name" required
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
              style={{ fontFamily: "var(--font-poppins)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number (0312-1234567)" required
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
              style={{ fontFamily: "var(--font-poppins)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <textarea value={solarFeedback} onChange={(e) => setSolarFeedback(e.target.value)}
              placeholder="Any feedback? (optional — kya acha laga, kya missing hai...)"
              rows={2}
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none resize-none transition-all"
              style={{ fontFamily: "var(--font-poppins)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-extrabold text-black text-sm transition-all active:scale-95 disabled:opacity-60"
              style={{ fontFamily: "var(--font-poppins)", background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 4px 20px rgba(251,191,36,0.35)" }}>
              {loading ? "Sending..." : "Get 3 Free Solar Quotes →"}
            </button>
            <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.28)" }}>Free. No obligation. Verified installers only.</p>
          </form>
        )}
      </div>
    </div>
  );
}
