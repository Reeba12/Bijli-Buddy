// Common Pakistani household appliances with default kW ratings

export interface ApplianceTemplate {
  id: string;
  name: string;
  nameUrdu: string;
  category: string;
  defaultKw: number;       // kilowatts (e.g. 1.5 for a 1500W AC)
  defaultHours: number;
  dutyCycle: number;       // 1 = runs full time, 0.4 = compressor cycles
  icon: string;
  tip?: string;
}

export const APPLIANCE_TEMPLATES: ApplianceTemplate[] = [
  // Cooling
  { id: "ac-1ton",        name: "AC 1 Ton (Non-Inverter)",   nameUrdu: "AC 1 ٹن",           category: "Cooling",       defaultKw: 1.500, defaultHours: 8,   dutyCycle: 0.80, icon: "❄️", tip: "Switch to inverter AC to save up to 40%" },
  { id: "ac-1.5ton",      name: "AC 1.5 Ton (Non-Inverter)", nameUrdu: "AC 1.5 ٹن",         category: "Cooling",       defaultKw: 2.200, defaultHours: 8,   dutyCycle: 0.80, icon: "❄️", tip: "Typically the highest cost appliance in Pakistan" },
  { id: "ac-2ton",        name: "AC 2 Ton (Non-Inverter)",   nameUrdu: "AC 2 ٹن",           category: "Cooling",       defaultKw: 2.800, defaultHours: 8,   dutyCycle: 0.80, icon: "❄️" },
  { id: "ac-1ton-inv",    name: "AC 1 Ton (Inverter)",        nameUrdu: "AC انورٹر 1 ٹن",    category: "Cooling",       defaultKw: 0.900, defaultHours: 8,   dutyCycle: 0.75, icon: "❄️" },
  { id: "ac-1.5ton-inv",  name: "AC 1.5 Ton (Inverter)",      nameUrdu: "AC انورٹر 1.5 ٹن",  category: "Cooling",       defaultKw: 1.200, defaultHours: 8,   dutyCycle: 0.75, icon: "❄️" },
  // Fans
  { id: "ceiling-fan",    name: "Ceiling Fan",               nameUrdu: "چھت کا پنکھا",      category: "Fans",          defaultKw: 0.075, defaultHours: 12,  dutyCycle: 1.00, icon: "💨" },
  { id: "pedestal-fan",   name: "Pedestal Fan",              nameUrdu: "پیڈسٹل پنکھا",     category: "Fans",          defaultKw: 0.060, defaultHours: 8,   dutyCycle: 1.00, icon: "💨" },
  // Kitchen
  { id: "fridge",         name: "Refrigerator",              nameUrdu: "فریج",              category: "Kitchen",       defaultKw: 0.150, defaultHours: 24,  dutyCycle: 0.40, icon: "🧊", tip: "Fridge runs 24/7 but compressor only cycles 40% of the time" },
  { id: "deep-freezer",   name: "Deep Freezer",              nameUrdu: "ڈیپ فریزر",         category: "Kitchen",       defaultKw: 0.200, defaultHours: 24,  dutyCycle: 0.35, icon: "🧊" },
  { id: "microwave",      name: "Microwave",                 nameUrdu: "مائیکروویو",        category: "Kitchen",       defaultKw: 1.200, defaultHours: 0.5, dutyCycle: 1.00, icon: "📡" },
  { id: "electric-kettle",name: "Electric Kettle",           nameUrdu: "الیکٹرک کیتلی",    category: "Kitchen",       defaultKw: 1.500, defaultHours: 0.3, dutyCycle: 1.00, icon: "☕" },
  // Washing
  { id: "washing-machine",name: "Washing Machine",           nameUrdu: "واشنگ مشین",        category: "Washing",       defaultKw: 0.500, defaultHours: 1,   dutyCycle: 1.00, icon: "🫧" },
  // Lighting
  { id: "led-bulb",       name: "LED Bulb",                  nameUrdu: "ایل ای ڈی بلب",    category: "Lighting",      defaultKw: 0.015, defaultHours: 6,   dutyCycle: 1.00, icon: "💡" },
  { id: "energy-saver",   name: "Energy Saver (CFL)",         nameUrdu: "انرجی سیور",        category: "Lighting",      defaultKw: 0.025, defaultHours: 6,   dutyCycle: 1.00, icon: "💡" },
  // Entertainment
  { id: "led-tv-40",      name: 'LED TV (40")',               nameUrdu: "ایل ای ڈی ٹی وی",  category: "Entertainment", defaultKw: 0.060, defaultHours: 6,   dutyCycle: 1.00, icon: "📺" },
  { id: "led-tv-55",      name: 'LED TV (55")',               nameUrdu: "ایل ای ڈی ٹی وی بڑا", category: "Entertainment", defaultKw: 0.100, defaultHours: 6, dutyCycle: 1.00, icon: "📺" },
  // Water
  { id: "water-motor",    name: "Water Motor (0.5 HP)",       nameUrdu: "پانی کی موٹر",      category: "Water",         defaultKw: 0.373, defaultHours: 1,   dutyCycle: 1.00, icon: "💧" },
  { id: "water-motor-1hp",name: "Water Motor (1 HP)",         nameUrdu: "پانی کی موٹر 1 HP", category: "Water",         defaultKw: 0.746, defaultHours: 1,   dutyCycle: 1.00, icon: "💧" },
  // Heating
  { id: "geyser",         name: "Electric Geyser",           nameUrdu: "گیزر",              category: "Heating",       defaultKw: 2.000, defaultHours: 1,   dutyCycle: 1.00, icon: "🚿" },
  { id: "iron",           name: "Clothes Iron",              nameUrdu: "استری",             category: "Heating",       defaultKw: 1.000, defaultHours: 0.5, dutyCycle: 1.00, icon: "👔" },
  // UPS/Inverter
  { id: "ups",            name: "UPS (500VA)",                nameUrdu: "یو پی ایس",         category: "UPS/Inverter",  defaultKw: 0.050, defaultHours: 24,  dutyCycle: 1.00, icon: "🔋", tip: "UPS continuously draws power even when grid is available" },
];

export const CATEGORIES = [...new Set(APPLIANCE_TEMPLATES.map((a) => a.category))];
