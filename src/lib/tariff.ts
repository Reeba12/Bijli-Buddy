// K-Electric Tariff Engine
// Rates effective per SRO 279(I)/2026, February 12, 2026
// Source: K-Electric bill breakdown (Mar-2026 verified)

export type MeterType = "single" | "three";
export type CustomerType = "protected" | "non-protected";

export interface ApplianceInput {
  name: string;
  kw: number;          // kilowatts (e.g. 1.5 for a 1500W AC)
  quantity: number;
  hoursPerDay: number;
  dutyCycle?: number;  // 0-1, for fridge/AC etc.
}

export interface SlabResult {
  fromUnit: number;
  toUnit: number;
  units: number;
  ratePerUnit: number;
  cost: number;
}

export interface BillResult {
  totalUnits: number;
  peakUnits: number;
  offPeakUnits: number;
  slabBreakdown: SlabResult[];
  energyCost: number;
  fixedCharges: number;
  fuelPriceAdjustment: number;
  additionalSurcharge: number;
  electricityDuty: number;
  muct: number;
  gst: number;
  totalBill: number;
  isProtected: boolean;
  applianceBreakdown: ApplianceBreakdown[];
}

export interface ApplianceBreakdown {
  name: string;
  units: number;
  cost: number;
  percentage: number;
}

// ─── K-Electric Slab Rates ────────────────────────────────────────────────────
// Per SRO 279(I)/2026 (effective Feb 12, 2026)
// Single-phase / Off-Peak (non-protected):
const NON_PROTECTED_SLABS = [
  { from: 0,   to: 100,  rate: 34.53 },  // Slab 1
  { from: 100, to: 200,  rate: 34.53 },  // Slab 2
  { from: 200, to: 300,  rate: 34.53 },  // Slab 3 — flat off-peak rate post SRO
  { from: 300, to: 400,  rate: 34.53 },
  { from: 400, to: 500,  rate: 34.53 },
  { from: 500, to: 600,  rate: 34.53 },
  { from: 600, to: 700,  rate: 34.53 },
  { from: 700, to: Infinity, rate: 34.53 },
];

// Protected customers: households consuming ≤200 units/month (lifeline)
// Protected rates unchanged
const PROTECTED_SLABS = [
  { from: 0,   to: 100,  rate: 5.79  },
  { from: 100, to: 200,  rate: 9.34  },
];

// ─── Fixed Charges (PKR/month) ─────────────────────────────────────────────────
// Per SRO 279(I)/2026 — new fixed charges
// Single phase by sanctioned load (kW)
const FIXED_CHARGES_SINGLE_PHASE: { maxLoad: number; charge: number }[] = [
  { maxLoad: 5,        charge: 675  },
  { maxLoad: 10,       charge: 675  },
  { maxLoad: Infinity, charge: 675  },
];

// Three phase by sanctioned load (kW) — per SRO 279(I)/2026
// Estimated from Mar-2026 K-Electric bill (prorated new rate 1386.16 for 16/28 days → ~2426/month)
const FIXED_CHARGES_THREE_PHASE: { maxLoad: number; charge: number }[] = [
  { maxLoad: 5,        charge: 2426 },
  { maxLoad: 10,       charge: 3000 },
  { maxLoad: Infinity, charge: 4000 },
];

// ─── Peak Hour Surcharge (Three Phase only) ───────────────────────────────────
// Peak rate: 46.85 PKR/unit (vs off-peak 34.53), so surcharge = 46.85 - 34.53 = 12.32
// Peak: 7PM – 11PM
const PEAK_RATE_PER_UNIT = 46.85;
// Off-peak rate = 34.53; peak surcharge = 46.85 - 34.53 = 12.32 PKR/unit

// ─── Tax & Levy Rates ─────────────────────────────────────────────────────────
const GST_RATE = 0.18;             // 18% Sales Tax
const ELECTRICITY_DUTY_RATE = 0.015; // 1.5% on energy charges only
const MUCT_PER_BILL = 40;          // KMC/MUCT fixed PKR 40/month (Karachi)

// ─── Surcharges ───────────────────────────────────────────────────────────────
// FCA (Fuel Cost Adjustment) — varies monthly, shown on bill. Default = recent avg
export const DEFAULT_FCA_RATE = 1.63; // PKR/unit — from Jan-26 bill (1.6274)
// Additional Surcharge (PHL) — fixed by NEPRA
export const ADDITIONAL_SURCHARGE_RATE = 3.23; // PKR/unit

// Keep old export name for backward compat with page.tsx
export const DEFAULT_FPA_RATE = DEFAULT_FCA_RATE;

// ─── Peak Hours ───────────────────────────────────────────────────────────────
export const PEAK_START_HOUR = 19; // 7 PM
export const PEAK_END_HOUR = 23;   // 11 PM

export function isCurrentlyPeakHour(): boolean {
  const hour = new Date().getHours();
  return hour >= PEAK_START_HOUR && hour < PEAK_END_HOUR;
}

export function getFixedCharges(meterType: MeterType, sanctionedLoad: number): number {
  const table = meterType === "single" ? FIXED_CHARGES_SINGLE_PHASE : FIXED_CHARGES_THREE_PHASE;
  const entry = table.find((t) => sanctionedLoad <= t.maxLoad);
  return entry ? entry.charge : table[table.length - 1].charge;
}

export function applySlabs(units: number, customerType: CustomerType): SlabResult[] {
  const slabs = customerType === "protected" ? PROTECTED_SLABS : NON_PROTECTED_SLABS;
  const results: SlabResult[] = [];
  let remaining = units;

  for (const slab of slabs) {
    if (remaining <= 0) break;
    const slabCapacity = slab.to === Infinity ? remaining : slab.to - slab.from;
    const unitsInSlab = Math.min(remaining, slabCapacity);
    if (unitsInSlab <= 0) continue;

    results.push({
      fromUnit: slab.from,
      toUnit: Math.min(slab.to === Infinity ? slab.from + unitsInSlab : slab.to, slab.from + unitsInSlab),
      units: unitsInSlab,
      ratePerUnit: slab.rate,
      cost: unitsInSlab * slab.rate,
    });

    remaining -= unitsInSlab;
  }

  return results;
}

export function calculateUnitsFromAppliances(appliances: ApplianceInput[]): number {
  return appliances.reduce((total, a) => {
    const duty = a.dutyCycle ?? 1;
    const dailyKwh = a.kw * a.quantity * a.hoursPerDay * duty;
    return total + dailyKwh * 30;
  }, 0);
}

export function calculateBill(params: {
  totalUnits: number;
  meterType: MeterType;
  customerType: CustomerType;
  sanctionedLoad: number;
  fpaRate: number;           // FCA rate (Fuel Cost Adjustment) from bill
  peakUnitsPercent?: number; // 0-100, only meaningful for three-phase
  appliances?: ApplianceInput[];
}): BillResult {
  const {
    totalUnits,
    meterType,
    customerType,
    sanctionedLoad,
    fpaRate,
    peakUnitsPercent = 19, // ~19% peak based on real bill (39/206)
    appliances = [],
  } = params;

  // Force non-protected if units > 200
  const effectiveCustomerType: CustomerType =
    totalUnits > 200 ? "non-protected" : customerType;

  // For three-phase: split peak/off-peak
  const peakUnits = meterType === "three" ? Math.round((totalUnits * peakUnitsPercent) / 100) : 0;
  const offPeakUnits = totalUnits - peakUnits;

  // Energy charges:
  // - Single phase: all units at off-peak rate via slabs
  // - Three phase off-peak: off-peak units at slab rates
  // - Three phase peak: peak units at peak rate (not slab, flat peak rate)
  let energyCost: number;
  let slabBreakdown: SlabResult[];

  if (meterType === "three" && effectiveCustomerType !== "protected") {
    // Off-peak units through slabs
    slabBreakdown = applySlabs(offPeakUnits, effectiveCustomerType);
    const offPeakCost = slabBreakdown.reduce((s, r) => s + r.cost, 0);
    // Peak units at flat peak rate
    const peakCost = peakUnits * PEAK_RATE_PER_UNIT;
    energyCost = offPeakCost + peakCost;
    // Add a synthetic slab entry for peak to show in breakdown
    if (peakUnits > 0) {
      slabBreakdown.push({
        fromUnit: 0,
        toUnit: peakUnits,
        units: peakUnits,
        ratePerUnit: PEAK_RATE_PER_UNIT,
        cost: peakCost,
      });
    }
  } else {
    slabBreakdown = applySlabs(totalUnits, effectiveCustomerType);
    energyCost = slabBreakdown.reduce((s, r) => s + r.cost, 0);
  }

  // Fixed charges
  const fixedCharges = getFixedCharges(meterType, sanctionedLoad);

  // FCA (Fuel Cost Adjustment) — user-provided rate, billed on all units
  const fuelPriceAdjustment = totalUnits * fpaRate;

  // Additional Surcharge (PHL) — fixed NEPRA levy
  const additionalSurcharge = totalUnits * ADDITIONAL_SURCHARGE_RATE;

  // Electricity Duty — 1.5% on energy + fixed charges (not FCA, not surcharge)
  const electricityDuty = (energyCost + fixedCharges) * ELECTRICITY_DUTY_RATE;

  // MUCT — fixed PKR 40
  const muct = MUCT_PER_BILL;

  // Electricity charges subtotal (before taxes)
  const electricityCharges = energyCost + fixedCharges + fuelPriceAdjustment + additionalSurcharge;

  // GST base = electricity charges + ED (MUCT is exempt from GST)
  const gstBase = electricityCharges + electricityDuty;
  const gst = gstBase * GST_RATE;

  // MUCT added after GST (not subject to GST)
  const totalBill = electricityCharges + electricityDuty + gst + muct;

  // Appliance breakdown
  const totalApplianceUnits = calculateUnitsFromAppliances(appliances);
  const applianceBreakdown: ApplianceBreakdown[] = appliances.map((a) => {
    const duty = a.dutyCycle ?? 1;
    const units = a.kw * a.quantity * a.hoursPerDay * duty * 30;
    const percentage = totalApplianceUnits > 0 ? (units / totalApplianceUnits) * 100 : 0;
    const cost = totalBill > 0 ? (percentage / 100) * totalBill : 0;
    return { name: a.name, units: Math.round(units), cost: Math.round(cost), percentage: Math.round(percentage) };
  });

  return {
    totalUnits: Math.round(totalUnits),
    peakUnits: Math.round(peakUnits),
    offPeakUnits: Math.round(offPeakUnits),
    slabBreakdown,
    energyCost: Math.round(energyCost),
    fixedCharges,
    fuelPriceAdjustment: Math.round(fuelPriceAdjustment),
    additionalSurcharge: Math.round(additionalSurcharge),
    electricityDuty: Math.round(electricityDuty),
    muct,
    gst: Math.round(gst),
    totalBill: Math.round(totalBill),
    isProtected: effectiveCustomerType === "protected",
    applianceBreakdown,
  };
}

// ─── Bill Shock Explainer ─────────────────────────────────────────────────────
export interface BillShockResult {
  difference: number;
  reasons: { label: string; impact: number; description: string }[];
}

export function explainBillShock(
  lastUnits: number,
  thisUnits: number,
  meterType: MeterType,
  sanctionedLoad: number,
  lastFpa: number,
  thisFpa: number
): BillShockResult {
  const lastBill = calculateBill({ totalUnits: lastUnits, meterType, customerType: "non-protected", sanctionedLoad, fpaRate: lastFpa });
  const thisBill = calculateBill({ totalUnits: thisUnits, meterType, customerType: "non-protected", sanctionedLoad, fpaRate: thisFpa });

  const difference = thisBill.totalBill - lastBill.totalBill;

  const unitImpact = thisBill.energyCost - lastBill.energyCost;
  const fpaImpact = thisBill.fuelPriceAdjustment - lastBill.fuelPriceAdjustment;
  const taxImpact = (thisBill.gst + thisBill.electricityDuty) - (lastBill.gst + lastBill.electricityDuty);

  // Slab crossing detection
  const crossedSlabs: string[] = [];
  const lastMaxSlab = NON_PROTECTED_SLABS.findIndex((s) => lastUnits <= s.to);
  const thisMaxSlab = NON_PROTECTED_SLABS.findIndex((s) => thisUnits <= s.to);
  if (thisMaxSlab > lastMaxSlab) {
    crossedSlabs.push(`You crossed into a higher price slab (Slab ${thisMaxSlab + 1})`);
  }

  const reasons = [
    unitImpact !== 0 && {
      label: "Extra units consumed",
      impact: Math.round(unitImpact),
      description: `${Math.abs(thisUnits - lastUnits)} more units than last month${crossedSlabs.length ? ` — ${crossedSlabs[0]}` : ""}`,
    },
    fpaImpact !== 0 && {
      label: "Fuel Cost Adjustment change",
      impact: Math.round(fpaImpact),
      description: `FCA changed from PKR ${lastFpa}/unit to PKR ${thisFpa}/unit`,
    },
    taxImpact !== 0 && {
      label: "Tax impact",
      impact: Math.round(taxImpact),
      description: "GST and electricity duty on the higher bill amount",
    },
  ].filter(Boolean) as BillShockResult["reasons"];

  return { difference: Math.round(difference), reasons };
}
