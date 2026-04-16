"use client";

import { useState, useMemo, useEffect } from "react";
import { calculateBill, explainBillShock, DEFAULT_FPA_RATE } from "@/lib/tariff";
import type { MeterType, CustomerType } from "@/lib/tariff";
import { useTheme } from "@/lib/theme";
import { useLang } from "@/lib/i18n";
import { fetchUpgradeRecs, type UpgradeRec } from "@/lib/db";

// ─── Shared meter settings strip ─────────────────────────────────────────────
function MeterStrip({
  meterType, setMeterType, sanctionedLoad, setSanctionedLoad, fpaRate, setFpaRate,
}: {
  meterType: MeterType; setMeterType: (m: MeterType) => void;
  sanctionedLoad: number; setSanctionedLoad: (n: number) => void;
  fpaRate: number; setFpaRate: (n: number) => void;
}) {
  const { t } = useLang();
  return (
    <div className="bb-card p-4 space-y-3">
      <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{t("meterSettings")}</p>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex gap-2">
          {(["single", "three"] as MeterType[]).map((m) => (
            <button key={m} onClick={() => setMeterType(m)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: meterType === m ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "var(--bg-subtle)",
                color: meterType === m ? "#fff" : "var(--text-muted)",
                border: meterType === m ? "none" : "1px solid var(--border-default)",
              }}>
              {m === "single" ? `🔌 ${t("singlePhase")}` : `⚡ ${t("threePhase")}`}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("sanctionedLoad")}</label>
            <input type="number" value={sanctionedLoad}
              onChange={(e) => setSanctionedLoad(Number(e.target.value))}
              min={1} max={100} className="bb-input w-20 px-2 py-1.5 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>{t("fcaRate")} (PKR/unit)</label>
            <input type="number" value={fpaRate}
              onChange={(e) => setFpaRate(parseFloat(e.target.value) || 0)}
              step={0.01} min={0} className="bb-input w-20 px-2 py-1.5 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tools page ───────────────────────────────────────────────────────────────
export default function ToolsPage() {
  const { t } = useLang();
  const [meterType, setMeterType]       = useState<MeterType>("single");
  const [sanctionedLoad, setSanctionedLoad] = useState(5);
  const [fpaRate, setFpaRate]           = useState(DEFAULT_FPA_RATE);

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-6 pb-16 space-y-5">
      <div className="mb-2">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>🔧 {t("navTools")}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {t("toolsSubtitle")}
        </p>
      </div>

      <MeterStrip
        meterType={meterType} setMeterType={setMeterType}
        sanctionedLoad={sanctionedLoad} setSanctionedLoad={setSanctionedLoad}
        fpaRate={fpaRate} setFpaRate={setFpaRate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          <BillShockSection meterType={meterType} sanctionedLoad={sanctionedLoad} fpaRate={fpaRate} />
          <WhatIfSimulator meterType={meterType} customerType="non-protected" sanctionedLoad={sanctionedLoad} fpaRate={fpaRate} />
        </div>
        <div className="space-y-5">
          <UpgradeRecommendations />
        </div>
      </div>
    </div>
  );
}

// ─── BillShockSection ─────────────────────────────────────────────────────────
function BillShockSection({ meterType, sanctionedLoad, fpaRate }: {
  meterType: MeterType; sanctionedLoad: number; fpaRate: number;
}) {
  const { t } = useLang();
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
    <div className="bb-card p-5 space-y-4">
      <div>
        <p className="bb-label">😱 {t("billShock")}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("billShockSub")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t("lastMonth"), value: lastUnits, setter: setLastUnits, placeholder: "e.g. 280" },
          { label: t("thisMonth"), value: thisUnits, setter: setThisUnits, placeholder: "e.g. 420" },
        ].map((field) => (
          <div key={field.label} className="space-y-1.5">
            <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{field.label}</label>
            <input type="number" value={field.value} placeholder={field.placeholder}
              onChange={(e) => { field.setter(e.target.value); setShockResult(null); }}
              className="bb-input w-full px-3 py-2.5 text-sm" />
          </div>
        ))}
      </div>
      <button onClick={handleExplain} disabled={!lastUnits || !thisUnits}
        className="w-full py-3.5 rounded-xl text-sm font-extrabold transition-all disabled:cursor-not-allowed"
        style={{
          background: lastUnits && thisUnits ? "linear-gradient(135deg,#ea580c,#c2410c)" : "var(--bg-subtle)",
          color: lastUnits && thisUnits ? "#fff" : "var(--text-muted)",
          border: lastUnits && thisUnits ? "none" : "1px solid var(--border-default)",
          boxShadow: lastUnits && thisUnits ? "0 4px 20px rgba(234,88,12,0.3)" : "none",
          opacity: lastUnits && thisUnits ? 1 : 0.6,
        }}>
        {t("explainJump")}
      </button>
      {shockResult && (
        <div className="space-y-3 animate-slide-up">
          <div className="text-center p-4 rounded-xl"
            style={{
              background: shockResult.difference > 0 ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
              border: shockResult.difference > 0 ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(16,185,129,0.2)",
            }}>
            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>{t("billChangedBy")}</p>
            <p className="font-extrabold text-3xl"
              style={{ color: shockResult.difference > 0 ? "#ef4444" : "#10b981" }}>
              {shockResult.difference > 0 ? "+" : ""}PKR {Math.abs(shockResult.difference).toLocaleString()}
            </p>
          </div>
          {shockResult.reasons.map((r, i) => (
            <div key={i} className="flex gap-3 p-3.5 rounded-xl"
              style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-default)" }}>
              <span className="text-base shrink-0" style={{ color: r.impact > 0 ? "#ef4444" : "#10b981" }}>
                {r.impact > 0 ? "▲" : "▼"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{r.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{r.description}</p>
                <p className="text-sm font-extrabold mt-1" style={{ color: r.impact > 0 ? "#ef4444" : "#10b981" }}>
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

// ─── WhatIfSimulator ──────────────────────────────────────────────────────────
function WhatIfSimulator({ meterType, customerType, sanctionedLoad, fpaRate }: {
  meterType: MeterType; customerType: CustomerType;
  sanctionedLoad: number; fpaRate: number;
}) {
  const { t } = useLang();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [baseUnitsStr, setBaseUnitsStr] = useState("");
  const [delta, setDelta] = useState(0);

  const baseUnits = parseFloat(baseUnitsStr) || 0;

  const baseBill = useMemo(() => {
    if (baseUnits <= 0) return 0;
    return calculateBill({ totalUnits: baseUnits, meterType, customerType, sanctionedLoad, fpaRate }).totalBill;
  }, [baseUnits, meterType, customerType, sanctionedLoad, fpaRate]);

  const newUnits = Math.max(0, baseUnits + delta);
  const newResult = useMemo(() => {
    if (newUnits <= 0) return null;
    return calculateBill({ totalUnits: newUnits, meterType, customerType, sanctionedLoad, fpaRate });
  }, [newUnits, meterType, customerType, sanctionedLoad, fpaRate]);

  const saving = baseBill - (newResult?.totalBill ?? baseBill);
  const isPositive = saving > 0;
  const isNeutral = delta === 0;
  const maxDelta = Math.max(50, Math.min(200, baseUnits));

  return (
    <div className="bb-card p-5 space-y-5">
      <div>
        <p className="bb-label">🎛️ {t("whatIfTitle")}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("whatIfSub")}</p>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("yourCurrentUnits")}</label>
        <input type="number" value={baseUnitsStr} onChange={(e) => { setBaseUnitsStr(e.target.value); setDelta(0); }}
          placeholder="e.g. 350" min={0}
          className="bb-input w-full px-3 py-2.5 text-sm" />
      </div>
      {baseUnits > 0 && (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("whatIfAdjust")}</span>
              <span className="text-sm font-extrabold px-3 py-1 rounded-full"
                style={{
                  background: delta < 0 ? "rgba(16,185,129,0.12)" : delta > 0 ? "rgba(239,68,68,0.12)" : "var(--bg-subtle)",
                  color: delta < 0 ? "#10b981" : delta > 0 ? "#ef4444" : "var(--text-muted)",
                  border: delta < 0 ? "1px solid rgba(16,185,129,0.25)" : delta > 0 ? "1px solid rgba(239,68,68,0.25)" : "1px solid var(--border-default)",
                }}>
                {delta > 0 ? `+${delta}` : delta} units
              </span>
            </div>
            <input type="range" min={-maxDelta} max={maxDelta} step={5} value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right,${delta < 0 ? "#10b981" : "#2563eb"} 0%,${delta < 0 ? "#10b981" : "#2563eb"} ${((delta + maxDelta) / (maxDelta * 2)) * 100}%,var(--bg-subtle) ${((delta + maxDelta) / (maxDelta * 2)) * 100}%,var(--bg-subtle) 100%)`,
                accentColor: delta < 0 ? "#10b981" : "#2563eb",
              }} />
            <div className="flex justify-between text-[10px]" style={{ color: "var(--text-hint)" }}>
              <span>−{maxDelta}</span><span>0</span><span>+{maxDelta}</span>
            </div>
          </div>
          {!isNeutral && newResult && (
            <div className="rounded-2xl p-4 space-y-3 animate-slide-up"
              style={{
                background: isPositive ? (isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)") : (isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)"),
                border: isPositive ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(239,68,68,0.2)",
              }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    {isPositive ? t("whatIfSave") : t("whatIfCost")}
                  </p>
                  <p className="text-2xl font-extrabold mt-0.5" style={{ color: isPositive ? "#10b981" : "#ef4444" }}>
                    PKR {Math.abs(saving).toLocaleString()}
                    <span className="text-sm font-semibold ml-1" style={{ opacity: 0.7 }}>/{t("whatIfPerMonth")}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t("whatIfNewBill")}</p>
                  <p className="text-lg font-extrabold mt-0.5" style={{ color: "var(--text-primary)" }}>
                    PKR {newResult.totalBill.toLocaleString()}
                  </p>
                </div>
              </div>
              {isPositive && (
                <p className="text-xs font-semibold" style={{ color: "#10b981" }}>
                  💡 {t("annualSaving")}: PKR {(saving * 12).toLocaleString()}
                </p>
              )}
            </div>
          )}
          {!isNeutral && (
            <button onClick={() => setDelta(0)} className="text-xs font-semibold" style={{ color: "var(--text-hint)" }}>
              {t("resetSlider")}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── UpgradeRecommendations ───────────────────────────────────────────────────
function UpgradeRecommendations() {
  const { t } = useLang();
  const [recs, setRecs] = useState<UpgradeRec[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpgradeRecs().then((data) => { setRecs(data); setLoading(false); });
  }, []);

  return (
    <div className="bb-card p-5 flex flex-col" style={{ height: "520px" }}>
      <div className="shrink-0 mb-4">
        <p className="bb-label">⚡ {t("upgradeTitle")}</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{t("upgradeSub")}</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: "thin" }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: "var(--text-hint)" }}>Loading...</p>
          </div>
        ) : recs.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>{t("upgradeNoRecs")}</p>
        ) : (
          recs.map((rec) => (
            <div key={rec.id} className="rounded-2xl p-4 space-y-2 shrink-0"
              style={{ background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.12)" }}>
              <div className="flex items-start gap-2">
                <span className="text-2xl shrink-0">{rec.icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{rec.title}</p>
                  <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{rec.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs font-bold" style={{ color: "#10b981" }}>
                  {t("upgradeSavings").replace("{pct}", String(rec.saving_pct))}
                </p>
                {rec.daraz_url && (
                  <a href={rec.daraz_url} target="_blank" rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all text-white shrink-0"
                    style={{ background: "linear-gradient(135deg,#f97316,#ea580c)", boxShadow: "0 2px 12px rgba(249,115,22,0.3)" }}>
                    {t("upgradeViewDaraz")}
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
