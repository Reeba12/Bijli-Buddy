"use client";

import { supabase } from "./supabase";
import { APPLIANCE_TEMPLATES, type ApplianceTemplate } from "./appliances";

// ─── Types matching DB schema ──────────────────────────────────────────────────

export interface DbApplianceTemplate {
  id: string;
  name: string;
  name_urdu: string | null;
  category: string;
  default_kw: number;
  default_hours: number;
  duty_cycle: number;
  icon: string | null;
  tip: string | null;
  sort_order: number;
  active: boolean;
}

export interface SolarPanel {
  id: number;
  brand: string;
  model: string | null;
  tier: number;
  technology: string | null;
  efficiency_pct: number | null;
  price_per_kw: number;
  warranty_years: number | null;
  origin: string | null;
  daraz_url: string | null;
  active: boolean;
}

export interface SolarInverter {
  id: number;
  brand: string;
  type: string;           // "on-grid" | "hybrid" | "off-grid"
  capacity_kw: number;
  price_pkr: number;
  warranty_years: number | null;
  daraz_url: string | null;
  active: boolean;
}

// ─── Map DB row → ApplianceTemplate ───────────────────────────────────────────

function dbToTemplate(row: DbApplianceTemplate): ApplianceTemplate {
  return {
    id: row.id,
    name: row.name,
    nameUrdu: row.name_urdu ?? "",
    category: row.category,
    defaultKw: row.default_kw,
    defaultHours: row.default_hours,
    dutyCycle: row.duty_cycle,
    icon: row.icon ?? "⚡",
    tip: row.tip ?? undefined,
  };
}

// ─── Fetch appliance templates ─────────────────────────────────────────────────
// Falls back to hardcoded list if Supabase is unavailable.

let _appliancesCache: ApplianceTemplate[] | null = null;

export async function fetchApplianceTemplates(): Promise<ApplianceTemplate[]> {
  if (_appliancesCache) return _appliancesCache;

  try {
    const { data, error } = await supabase
      .from("appliance_templates")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("[db] appliance_templates fetch failed, using fallback", error?.message);
      return APPLIANCE_TEMPLATES;
    }

    _appliancesCache = (data as DbApplianceTemplate[]).map(dbToTemplate);
    return _appliancesCache;
  } catch {
    return APPLIANCE_TEMPLATES;
  }
}

// ─── Upgrade recommendations ──────────────────────────────────────────────────

export interface UpgradeRec {
  id: number;
  icon: string;
  title: string;
  description: string;
  saving_pct: number;
  daraz_url: string | null;
  sort_order: number;
  active: boolean;
}

let _upgradeCache: UpgradeRec[] | null = null;

export async function fetchUpgradeRecs(): Promise<UpgradeRec[]> {
  if (_upgradeCache) return _upgradeCache;

  try {
    const { data, error } = await supabase
      .from("upgrade_recs")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("[db] upgrade_recs fetch failed, using fallback", error?.message);
      return FALLBACK_UPGRADE_RECS;
    }

    _upgradeCache = data as UpgradeRec[];
    return _upgradeCache;
  } catch {
    return FALLBACK_UPGRADE_RECS;
  }
}

const FALLBACK_UPGRADE_RECS: UpgradeRec[] = [
  { id: 1, icon: "❄️", title: "Inverter Split AC",        description: "Saves 30–50% vs non-inverter. A 1.5-ton inverter AC uses ~1,200W vs ~2,000W.", saving_pct: 40, daraz_url: "https://www.daraz.pk/catalog/?q=inverter+split+ac+1.5+ton",    sort_order: 1, active: true },
  { id: 2, icon: "💡", title: "LED Bulbs",                description: "LED uses 8–12W vs 60W halogen. Saves up to 80% on lighting.",                   saving_pct: 75, daraz_url: "https://www.daraz.pk/catalog/?q=led+bulb+energy+saving",         sort_order: 2, active: true },
  { id: 3, icon: "🌀", title: "Inverter Ceiling Fan",     description: "Inverter fans use 15–35W vs 75W. Runs longer at lower cost.",                   saving_pct: 55, daraz_url: "https://www.daraz.pk/catalog/?q=inverter+ceiling+fan",            sort_order: 3, active: true },
  { id: 4, icon: "🧊", title: "Inverter Refrigerator",   description: "Inverter compressor saves 30–40% vs conventional fridge.",                       saving_pct: 35, daraz_url: "https://www.daraz.pk/catalog/?q=inverter+refrigerator",            sort_order: 4, active: true },
  { id: 5, icon: "🌀", title: "Inverter Washing Machine", description: "Uses ~40% less energy vs conventional. Also gentler on clothes.",               saving_pct: 40, daraz_url: "https://www.daraz.pk/catalog/?q=inverter+washing+machine",         sort_order: 5, active: true },
];

// ─── Fetch solar panels ────────────────────────────────────────────────────────

let _panelsCache: SolarPanel[] | null = null;

export async function fetchSolarPanels(): Promise<SolarPanel[]> {
  if (_panelsCache) return _panelsCache;

  try {
    const { data, error } = await supabase
      .from("solar_panels")
      .select("*")
      .eq("active", true)
      .order("price_per_kw", { ascending: true });

    if (error || !data) {
      console.warn("[db] solar_panels fetch failed", error?.message);
      return [];
    }

    _panelsCache = data as SolarPanel[];
    return _panelsCache;
  } catch {
    return [];
  }
}

// ─── Fetch solar inverters ─────────────────────────────────────────────────────

let _invertersCache: SolarInverter[] | null = null;

export async function fetchSolarInverters(): Promise<SolarInverter[]> {
  if (_invertersCache) return _invertersCache;

  try {
    const { data, error } = await supabase
      .from("solar_inverters")
      .select("*")
      .eq("active", true)
      .order("price_pkr", { ascending: true });

    if (error || !data) {
      console.warn("[db] solar_inverters fetch failed", error?.message);
      return [];
    }

    _invertersCache = data as SolarInverter[];
    return _invertersCache;
  } catch {
    return [];
  }
}
