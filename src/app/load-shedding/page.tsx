"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n";
import type { TKey } from "@/lib/i18n";

const CITY_I18N_KEY: Record<string, TKey> = {
  Karachi:    "cityKarachi",
  Lahore:     "cityLahore",
  Islamabad:  "cityIslamabad",
  Faisalabad: "cityFaisalabad",
  Multan:     "cityMultan",
  Peshawar:   "cityPeshawar",
  Quetta:     "cityQuetta",
  Hyderabad:  "cityHyderabad",
  Sukkur:     "citySukkur",
  Gujranwala: "cityGujranwala",
};

interface FeederEntry {
  city: string;
  disco: string;
  feeder: string;
  area: string;
  hoursPerDay: number;
  schedule: string;
}

const FEEDER_DATA: FeederEntry[] = [
  // ── KARACHI (K-Electric) ──────────────────────────────────────────────────
  { city: "Karachi", disco: "K-Electric", feeder: "Baloch Colony",       area: "Lyari / Kemari",             hoursPerDay: 6,  schedule: "7am–10am, 2pm–5pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Orangi Town",         area: "Orangi / SITE",              hoursPerDay: 8,  schedule: "6am–10am, 3pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Bilal Colony",        area: "Korangi",                    hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Landhi Industrial",   area: "Landhi / Korangi",           hoursPerDay: 4,  schedule: "7am–9am, 5pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "North Karachi",       area: "North Karachi",              hoursPerDay: 6,  schedule: "7am–10am, 2pm–5pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Gulshan-e-Iqbal",     area: "Gulshan / Johar",            hoursPerDay: 2,  schedule: "4pm–6pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Gulistan-e-Johar",    area: "Gulshan / Johar",            hoursPerDay: 2,  schedule: "5pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "DHA Phase 2",         area: "DHA / Defence",              hoursPerDay: 0,  schedule: "No scheduled load shedding" },
  { city: "Karachi", disco: "K-Electric", feeder: "DHA Phase 5",         area: "DHA / Defence",              hoursPerDay: 0,  schedule: "No scheduled load shedding" },
  { city: "Karachi", disco: "K-Electric", feeder: "Clifton",             area: "Clifton / Bath Island",      hoursPerDay: 0,  schedule: "No scheduled load shedding" },
  { city: "Karachi", disco: "K-Electric", feeder: "Garden East",         area: "Garden / Saddar",            hoursPerDay: 4,  schedule: "9am–11am, 5pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "PECHS",               area: "PECHS / Block 2",            hoursPerDay: 2,  schedule: "6pm–8pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Liaquatabad",         area: "Liaquatabad",                hoursPerDay: 6,  schedule: "8am–11am, 3pm–6pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Nazimabad",           area: "Nazimabad / New Karachi",    hoursPerDay: 4,  schedule: "9am–11am, 4pm–6pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Federal B Area",      area: "FB Area / Nagan Chowrangi",  hoursPerDay: 4,  schedule: "7am–9am, 6pm–8pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Surjani Town",        area: "Surjani / New Karachi",      hoursPerDay: 8,  schedule: "6am–10am, 3pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Banaras Colony",      area: "Orangi / Banaras",           hoursPerDay: 8,  schedule: "7am–11am, 4pm–8pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Malir",               area: "Malir / Landhi",             hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Shah Faisal Colony",  area: "Shah Faisal / Gulshan",      hoursPerDay: 4,  schedule: "10am–12pm, 5pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Korangi Creek",       area: "Korangi / Creek",            hoursPerDay: 4,  schedule: "9am–11am, 5pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Manghopir",           area: "Manghopir / Wazir Mansion",  hoursPerDay: 8,  schedule: "5am–9am, 2pm–6pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Gadap",               area: "Gadap / Hub River Road",     hoursPerDay: 10, schedule: "5am–10am, 2pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Bin Qasim",           area: "Bin Qasim / Port Qasim",     hoursPerDay: 6,  schedule: "6am–9am, 4pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Kemari",              area: "Kemari / Harbour",           hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "North Nazimabad",     area: "North Nazimabad",            hoursPerDay: 4,  schedule: "9am–11am, 5pm–7pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Gulberg",             area: "Gulberg / Shershah",         hoursPerDay: 6,  schedule: "7am–10am, 3pm–6pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "New Karachi",         area: "New Karachi / Papri",        hoursPerDay: 6,  schedule: "8am–11am, 3pm–6pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Buffer Zone",         area: "Buffer Zone / North Karachi",hoursPerDay: 6,  schedule: "7am–10am, 3pm–6pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Pak Colony",          area: "Pak Colony / Baldia",        hoursPerDay: 8,  schedule: "6am–10am, 4pm–8pm" },
  { city: "Karachi", disco: "K-Electric", feeder: "Sadar",               area: "Saddar / Soldier Bazaar",    hoursPerDay: 2,  schedule: "11am–1pm" },

  // ── LAHORE (LESCO) ────────────────────────────────────────────────────────
  { city: "Lahore", disco: "LESCO", feeder: "Model Town",         area: "Model Town / Garden Town",     hoursPerDay: 4,  schedule: "9am–11am, 5pm–7pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Gulberg",            area: "Gulberg I–III",                 hoursPerDay: 4,  schedule: "10am–12pm, 6pm–8pm" },
  { city: "Lahore", disco: "LESCO", feeder: "DHA Lahore",         area: "DHA Phase 1–5",                 hoursPerDay: 0,  schedule: "No scheduled load shedding" },
  { city: "Lahore", disco: "LESCO", feeder: "Johar Town",         area: "Johar Town / Township",         hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Iqbal Town",         area: "Iqbal Town / Muslim Town",      hoursPerDay: 6,  schedule: "7am–10am, 3pm–6pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Shadman",            area: "Shadman / Faisal Town",         hoursPerDay: 2,  schedule: "7pm–9pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Samnabad",           area: "Samnabad / Rehmanpura",         hoursPerDay: 8,  schedule: "6am–10am, 3pm–7pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Shahdara",           area: "Shahdara / Badami Bagh",        hoursPerDay: 8,  schedule: "7am–11am, 4pm–8pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Raiwind Road",       area: "Raiwind / Manga Mandi",         hoursPerDay: 10, schedule: "5am–10am, 2pm–7pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Baghbanpura",        area: "Baghbanpura / GT Road",         hoursPerDay: 8,  schedule: "6am–10am, 3pm–7pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Samanabad",          area: "Samanabad / Azam Town",         hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Cantonment",         area: "Lahore Cantt / Walton",         hoursPerDay: 2,  schedule: "6pm–8pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Green Town",         area: "Green Town / Shaukat Town",     hoursPerDay: 6,  schedule: "9am–12pm, 5pm–8pm" },
  { city: "Lahore", disco: "LESCO", feeder: "Thokar Niaz Baig",   area: "Thokar / Lahore Ring Road",     hoursPerDay: 8,  schedule: "7am–11am, 4pm–8pm" },

  // ── ISLAMABAD / RAWALPINDI (IESCO) ────────────────────────────────────────
  { city: "Islamabad", disco: "IESCO", feeder: "F-7 / F-8",          area: "F-7, F-8 Markaz",            hoursPerDay: 0,  schedule: "No scheduled load shedding" },
  { city: "Islamabad", disco: "IESCO", feeder: "G-9 / G-10",         area: "G-9, G-10 Sector",           hoursPerDay: 2,  schedule: "11am–1pm" },
  { city: "Islamabad", disco: "IESCO", feeder: "I-8 / I-9",          area: "I-8, I-9 Industrial",        hoursPerDay: 4,  schedule: "9am–11am, 5pm–7pm" },
  { city: "Islamabad", disco: "IESCO", feeder: "Bahria Town Isb",    area: "Bahria Town / Phase 7",       hoursPerDay: 0,  schedule: "No scheduled load shedding" },
  { city: "Islamabad", disco: "IESCO", feeder: "Tarlai / Koral",     area: "Tarlai, Koral Chowk",        hoursPerDay: 8,  schedule: "6am–10am, 3pm–7pm" },
  { city: "Islamabad", disco: "IESCO", feeder: "Rawalpindi City",    area: "Raja Bazaar / Saddar",        hoursPerDay: 6,  schedule: "7am–10am, 3pm–6pm" },
  { city: "Islamabad", disco: "IESCO", feeder: "Dhoke Hassu",        area: "Dhoke Hassu / Chaklala",      hoursPerDay: 8,  schedule: "7am–11am, 4pm–8pm" },
  { city: "Islamabad", disco: "IESCO", feeder: "Satellite Town",     area: "Satellite Town / Rawalpindi", hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Islamabad", disco: "IESCO", feeder: "PWD Colony",         area: "PWD / Media Town",            hoursPerDay: 4,  schedule: "10am–12pm, 5pm–7pm" },

  // ── FAISALABAD (FESCO) ────────────────────────────────────────────────────
  { city: "Faisalabad", disco: "FESCO", feeder: "D-Ground",          area: "D-Ground / Clock Tower",      hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Faisalabad", disco: "FESCO", feeder: "Susan Road",        area: "Susan Road / Millat Chowk",   hoursPerDay: 6,  schedule: "7am–10am, 3pm–6pm" },
  { city: "Faisalabad", disco: "FESCO", feeder: "Jaranwala Road",    area: "Jaranwala / Chak 9",          hoursPerDay: 10, schedule: "5am–10am, 2pm–7pm" },
  { city: "Faisalabad", disco: "FESCO", feeder: "People's Colony",   area: "People's Colony / Ghulam Muhammadabad", hoursPerDay: 6, schedule: "9am–12pm, 4pm–7pm" },
  { city: "Faisalabad", disco: "FESCO", feeder: "Satiana Road",      area: "Satiana / Chak Jhumra",       hoursPerDay: 8,  schedule: "6am–10am, 3pm–7pm" },
  { city: "Faisalabad", disco: "FESCO", feeder: "Canal Road",        area: "Canal Road / Gulberg",        hoursPerDay: 4,  schedule: "10am–12pm, 5pm–7pm" },
  { city: "Faisalabad", disco: "FESCO", feeder: "Lyallpur Town",     area: "Lyallpur Town / Kohinoor",    hoursPerDay: 6,  schedule: "8am–11am, 3pm–6pm" },
  { city: "Faisalabad", disco: "FESCO", feeder: "Chiniot Road",      area: "Chiniot Road / Dijkot",       hoursPerDay: 10, schedule: "5am–9am, 2pm–6pm" },

  // ── MULTAN (MEPCO) ────────────────────────────────────────────────────────
  { city: "Multan", disco: "MEPCO", feeder: "Gulgasht",           area: "Gulgasht Colony / MDA",        hoursPerDay: 8,  schedule: "7am–11am, 3pm–7pm" },
  { city: "Multan", disco: "MEPCO", feeder: "Cantt Multan",       area: "Cantonment / Khanewal Road",   hoursPerDay: 4,  schedule: "9am–11am, 5pm–7pm" },
  { city: "Multan", disco: "MEPCO", feeder: "Shah Rukne Alam",    area: "Shah Rukne Alam / Peri Wala",  hoursPerDay: 10, schedule: "5am–10am, 2pm–7pm" },
  { city: "Multan", disco: "MEPCO", feeder: "Vehari Road",        area: "Vehari Road / Chungi No. 9",   hoursPerDay: 10, schedule: "5am–10am, 2pm–7pm" },
  { city: "Multan", disco: "MEPCO", feeder: "Bosan Road",         area: "Bosan Road / New Multan",      hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Multan", disco: "MEPCO", feeder: "Sahiwal City",       area: "Sahiwal / Farid Town",         hoursPerDay: 8,  schedule: "6am–10am, 3pm–7pm" },
  { city: "Multan", disco: "MEPCO", feeder: "Bahawalpur City",    area: "Bahawalpur / Model Town",      hoursPerDay: 8,  schedule: "7am–11am, 4pm–8pm" },
  { city: "Multan", disco: "MEPCO", feeder: "Rahim Yar Khan",     area: "Rahim Yar Khan / Sadiqabad",   hoursPerDay: 10, schedule: "5am–9am, 2pm–6pm" },

  // ── PESHAWAR (PESCO) ─────────────────────────────────────────────────────
  { city: "Peshawar", disco: "PESCO", feeder: "Hayatabad",         area: "Hayatabad Phase 1–6",          hoursPerDay: 4,  schedule: "10am–12pm, 5pm–7pm" },
  { city: "Peshawar", disco: "PESCO", feeder: "Gulbahar",          area: "Gulbahar / Nauthia",           hoursPerDay: 8,  schedule: "7am–11am, 3pm–7pm" },
  { city: "Peshawar", disco: "PESCO", feeder: "University Town",   area: "University Town / Warsak Rd",  hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Peshawar", disco: "PESCO", feeder: "Peshawar Cantt",    area: "Cantt / Hospital Road",        hoursPerDay: 4,  schedule: "9am–11am, 6pm–8pm" },
  { city: "Peshawar", disco: "PESCO", feeder: "Tehkal",            area: "Tehkal / Dalazak Road",        hoursPerDay: 8,  schedule: "6am–10am, 3pm–7pm" },
  { city: "Peshawar", disco: "PESCO", feeder: "Mardan City",       area: "Mardan / Rustam Road",         hoursPerDay: 10, schedule: "5am–10am, 2pm–7pm" },
  { city: "Peshawar", disco: "PESCO", feeder: "Swabi",             area: "Swabi / Topi",                 hoursPerDay: 10, schedule: "5am–9am, 2pm–6pm" },
  { city: "Peshawar", disco: "PESCO", feeder: "Abbottabad",        area: "Abbottabad / Havelian",        hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Peshawar", disco: "PESCO", feeder: "Mansehra",          area: "Mansehra / Shinkiari",         hoursPerDay: 6,  schedule: "7am–10am, 3pm–6pm" },

  // ── QUETTA (QESCO) ────────────────────────────────────────────────────────
  { city: "Quetta", disco: "QESCO", feeder: "Satellite Town Qta",  area: "Satellite Town / Jinnah Town", hoursPerDay: 8,  schedule: "7am–11am, 3pm–7pm" },
  { city: "Quetta", disco: "QESCO", feeder: "Quetta Cantt",        area: "Cantt / Staff College Road",   hoursPerDay: 4,  schedule: "9am–11am, 5pm–7pm" },
  { city: "Quetta", disco: "QESCO", feeder: "Sariab Road",         area: "Sariab / Brewary Road",        hoursPerDay: 10, schedule: "5am–10am, 2pm–7pm" },
  { city: "Quetta", disco: "QESCO", feeder: "Kirani Road",         area: "Kirani / Hazara Town",         hoursPerDay: 8,  schedule: "6am–10am, 3pm–7pm" },
  { city: "Quetta", disco: "QESCO", feeder: "Turbat",              area: "Turbat / Kech",                hoursPerDay: 12, schedule: "4am–10am, 12pm–6pm" },
  { city: "Quetta", disco: "QESCO", feeder: "Khuzdar",             area: "Khuzdar City",                 hoursPerDay: 12, schedule: "5am–11am, 1pm–7pm" },

  // ── HYDERABAD / SUKKUR (HESCO / SEPCO) ────────────────────────────────────
  { city: "Hyderabad", disco: "HESCO", feeder: "Latifabad",         area: "Latifabad / Qasimabad",       hoursPerDay: 8,  schedule: "7am–11am, 3pm–7pm" },
  { city: "Hyderabad", disco: "HESCO", feeder: "Hirabad",           area: "Hirabad / Auto Bhan Road",    hoursPerDay: 8,  schedule: "6am–10am, 4pm–8pm" },
  { city: "Hyderabad", disco: "HESCO", feeder: "Hyderabad City",    area: "Shahi Bazaar / Saddar",       hoursPerDay: 6,  schedule: "8am–11am, 3pm–6pm" },
  { city: "Hyderabad", disco: "HESCO", feeder: "Jamshoro",          area: "Jamshoro / Kotri",            hoursPerDay: 10, schedule: "5am–10am, 2pm–7pm" },
  { city: "Hyderabad", disco: "HESCO", feeder: "Nawabshah",         area: "Nawabshah / Benazirabad",     hoursPerDay: 10, schedule: "5am–10am, 1pm–6pm" },
  { city: "Sukkur",    disco: "SEPCO", feeder: "Sukkur City",       area: "Sukkur / Rohri",              hoursPerDay: 10, schedule: "5am–10am, 2pm–7pm" },
  { city: "Sukkur",    disco: "SEPCO", feeder: "Khairpur",          area: "Khairpur / Gambat",           hoursPerDay: 12, schedule: "4am–10am, 12pm–6pm" },
  { city: "Sukkur",    disco: "SEPCO", feeder: "Larkana",           area: "Larkana / Ratodero",          hoursPerDay: 10, schedule: "5am–9am, 2pm–6pm" },

  // ── GUJRANWALA (GEPCO) ────────────────────────────────────────────────────
  { city: "Gujranwala", disco: "GEPCO", feeder: "Gujranwala City",  area: "Trust Colony / Satellite Town",hoursPerDay: 6,  schedule: "8am–11am, 4pm–7pm" },
  { city: "Gujranwala", disco: "GEPCO", feeder: "Sialkot City",     area: "Sialkot / Cantonment",         hoursPerDay: 4,  schedule: "9am–11am, 5pm–7pm" },
  { city: "Gujranwala", disco: "GEPCO", feeder: "Gujrat City",      area: "Gujrat / Kharian",             hoursPerDay: 6,  schedule: "7am–10am, 3pm–6pm" },
  { city: "Gujranwala", disco: "GEPCO", feeder: "Hafizabad",        area: "Hafizabad / Pindi Bhattian",   hoursPerDay: 8,  schedule: "6am–10am, 3pm–7pm" },
  { city: "Gujranwala", disco: "GEPCO", feeder: "Wazirabad",        area: "Wazirabad / Alipur Chatha",    hoursPerDay: 8,  schedule: "7am–11am, 4pm–8pm" },
];

const CITIES = ["All", ...Array.from(new Set(FEEDER_DATA.map((f) => f.city)))];

function hoursColor(h: number) {
  if (h === 0)  return "#10b981";
  if (h <= 4)   return "#f59e0b";
  if (h <= 6)   return "#f97316";
  return "#ef4444";
}

const DISCO_CONTACTS: Record<string, { sms?: string; app?: string; call: string; web?: string }> = {
  "K-Electric": { sms: "SMS 13-digit a/c to 8119", app: "KE Live App", call: "118" },
  "LESCO":      { call: "118 / 042-111-000-118", web: "lesco.gov.pk" },
  "IESCO":      { call: "051-9252626", web: "iesco.com.pk" },
  "FESCO":      { call: "041-9220033", web: "fesco.com.pk" },
  "MEPCO":      { call: "061-111-000-118", web: "mepco.com.pk" },
  "PESCO":      { call: "091-9210065", web: "pesco.gov.pk" },
  "QESCO":      { call: "081-9210056", web: "qesco.com.pk" },
  "HESCO":      { call: "022-9200071", web: "hesco.gov.pk" },
  "SEPCO":      { call: "071-9310052", web: "sepco.gov.pk" },
  "GEPCO":      { call: "055-9200190", web: "gepco.com.pk" },
};

export default function LoadSheddingPage() {
  const { t } = useLang();
  const [query,  setQuery]  = useState("");
  const [filter, setFilter] = useState<"all" | "none" | "low" | "high">("all");
  const [city,   setCity]   = useState("All");

  const filtered = FEEDER_DATA.filter((f) => {
    const matchCity = city === "All" || f.city === city;
    const matchQ = query.trim().length < 2 || (
      f.feeder.toLowerCase().includes(query.toLowerCase()) ||
      f.area.toLowerCase().includes(query.toLowerCase()) ||
      f.city.toLowerCase().includes(query.toLowerCase()) ||
      f.disco.toLowerCase().includes(query.toLowerCase())
    );
    const matchF =
      filter === "all"  ? true :
      filter === "none" ? f.hoursPerDay === 0 :
      filter === "low"  ? f.hoursPerDay > 0 && f.hoursPerDay <= 4 :
      /* high */          f.hoursPerDay > 4;
    return matchCity && matchQ && matchF;
  });

  const pool = city === "All" ? FEEDER_DATA : FEEDER_DATA.filter((f) => f.city === city);
  const stats = {
    none: pool.filter((f) => f.hoursPerDay === 0).length,
    low:  pool.filter((f) => f.hoursPerDay > 0 && f.hoursPerDay <= 4).length,
    high: pool.filter((f) => f.hoursPerDay > 4).length,
  };

  // Which DISCOs are visible in current filtered results
  const visibleDiscos = [...new Set(filtered.map((f) => f.disco))];

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-6 pb-16 space-y-5">
      <div className="mb-2">
        <h1 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>🔌 {t("loadSheddingTitle")}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{t("loadSheddingSub")}</p>
      </div>

      {/* City selector */}
      <div className="flex gap-2 flex-wrap">
        {CITIES.map((c) => (
          <button key={c} onClick={() => setCity(c)}
            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
            style={{
              background: city === c ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "var(--bg-subtle)",
              color:      city === c ? "#fff" : "var(--text-muted)",
              border:     city === c ? "none" : "1px solid var(--border-default)",
              boxShadow:  city === c ? "var(--shadow-blue)" : "none",
            }}>
            {c === "All" ? `🌐 ${t("loadSheddingAllCities")}` : (CITY_I18N_KEY[c] ? t(CITY_I18N_KEY[c]) : c)}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { key: "all",  label: t("loadSheddingAllCities"), value: pool.length,  color: "#2563eb" },
          { key: "none", label: t("loadSheddingNoneLabel"), value: stats.none,   color: "#10b981" },
          { key: "low",  label: t("loadSheddingLowLabel"),  value: stats.low,    color: "#f59e0b" },
          { key: "high", label: t("loadSheddingHighLabel"), value: stats.high,   color: "#ef4444" },
        ].map((s) => (
          <button key={s.key} onClick={() => setFilter(s.key as typeof filter)}
            className="rounded-2xl p-3 text-center transition-all"
            style={{
              background: filter === s.key ? `${s.color}18` : "var(--bg-card)",
              border: filter === s.key ? `2px solid ${s.color}` : "1px solid var(--border-default)",
            }}>
            <p className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] font-semibold mt-0.5 leading-tight" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("loadSheddingSearch")}
        className="bb-input w-full px-4 py-3 text-sm"
      />

      {/* Official contacts for visible DISCOs */}
      {visibleDiscos.length > 0 && visibleDiscos.length <= 3 && (
        <div className="space-y-3">
          {visibleDiscos.map((disco) => {
            const c = DISCO_CONTACTS[disco];
            if (!c) return null;
            return (
              <div key={disco} className="bb-card-accent p-4">
                <p className="text-sm font-bold mb-2" style={{ color: "#2563eb" }}>
                  📲 {disco} — {t("loadSheddingOfficialTitle")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.sms && (
                    <span className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                      💬 {c.sms}
                    </span>
                  )}
                  {c.app && (
                    <span className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                      📱 {c.app}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                    📞 {c.call}
                  </span>
                  {c.web && (
                    <span className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}>
                      🌐 {c.web}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feeder list */}
      {filtered.length === 0 ? (
        <div className="bb-card p-10 text-center">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("loadSheddingNoResults")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((f, i) => (
            <div key={i} className="bb-card px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{f.feeder}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.2)" }}>
                    {f.disco}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{f.city} · {f.area}</p>
                <p className="text-[11px] mt-1 font-medium" style={{ color: "var(--text-hint)" }}>🕐 {f.schedule}</p>
              </div>
              <div className="shrink-0 text-center px-3 py-2 rounded-xl min-w-[56px]"
                style={{ background: `${hoursColor(f.hoursPerDay)}15`, border: `1px solid ${hoursColor(f.hoursPerDay)}30` }}>
                <p className="text-base font-extrabold" style={{ color: hoursColor(f.hoursPerDay) }}>
                  {f.hoursPerDay === 0 ? "✓" : `${f.hoursPerDay}h`}
                </p>
                <p className="text-[9px] font-bold mt-0.5" style={{ color: hoursColor(f.hoursPerDay) }}>
                  {f.hoursPerDay === 0 ? t("loadSheddingNoneTag") : t("loadSheddingPerDay")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[10px]" style={{ color: "var(--text-hint)" }}>
        <span>{t("loadSheddingLastUpdated")}</span>
        <span>{t("loadSheddingDisclaimer")}</span>
      </div>
    </div>
  );
}
