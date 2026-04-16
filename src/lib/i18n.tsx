"use client";
import { createContext, useContext, useState } from "react";

export type Lang = "en" | "ur";

export const translations = {
  en: {
    // Nav
    navCalculator: "Bill Calculator",
    navTools: "Analysis Tools",
    navSolar: "Solar",
    navLoadshed: "Load Shedding",

    // Header
    appName: "BijliBuddy",
    tagline: "K-Electric Calculator",
    peak: "Peak Hours",
    offPeak: "Off-Peak",

    // Hero
    heroBadge: "Free · No Login · Instant Results",
    heroTitle: "Why is your\nK-Electric bill so high?",
    heroSub: "Enter your units — get an instant breakdown of every charge on your bill.",

    // Mode toggle
    enterUnits: "Enter Units",
    addAppliances: "Add Appliances",

    // Meter settings
    meterSettings: "Meter Settings",
    meterType: "Meter Type",
    singlePhase: "Single Phase",
    threePhase: "Three Phase",
    sanctionedLoad: "Sanctioned Load (kW)",
    fcaRate: "FCA Rate",
    fcaHint: "Find FCA on your bill under \"Fuel Cost Adjustment\".",

    // Units input
    unitsThisMonth: "Units This Month",
    peakOffPeakUnits: "Peak & Off-Peak Units",
    peakUnits: "Peak Units",
    offPeakUnits: "Off-Peak Units",
    totalUnits: "Total units",
    findUnitsHint: "Find \"Units Consumed\" on your K-Electric bill slip",
    findThreePhaseHint: "Find \"Energy - Peak\" and \"Energy - Off Peak\" on your bill slip",
    protectedQualify: "You may qualify for Protected (Lifeline) tariff",
    nonProtected: "Non-Protected",
    protected: "Protected",

    // Appliances
    myAppliances: "My Appliances",
    addAppliance: "+ Add Appliance",
    close: "✕ Close",
    noAppliances: "No appliances added yet",
    noAppliancesHint: "Tap \"+ Add Appliance\" to get started",
    qty: "Qty",
    hrsDay: "Hrs/day",
    estimatedUnits: "Estimated monthly units",

    // Bill result
    estimatedBill: "Estimated Monthly Bill",
    kwhConsumed: "kWh consumed this month",
    tariffNotice: "Based on K-Electric tariff — SRO 279/2026, effective Feb 12, 2026",
    protectedApplied: "Protected Tariff Applied",
    billBreakdown: "Bill Breakdown",
    energyCharges: "Energy Charges",
    leviesTaxes: "Levies & Taxes",
    fixedCharges: "Fixed Charges",
    fuelCostAdj: "Fuel Cost Adj. (FCA)",
    additionalSurcharge: "Additional Surcharge (PHL)",
    electricityDuty: "Electricity Duty",
    muct: "MUCT (KMC)",
    gst: "GST / Sales Tax",
    energyTotal: "Energy Total",
    totalEstimatedBill: "Total Estimated Bill",
    sroRates: "SRO 279/2026 rates",

    // Appliance breakdown
    whichCostsMost: "Which Appliance Costs Most?",

    // Insights
    smartInsights: "Smart Insights",
    insightSolar: "Your bill qualifies for solar savings. A 5kW system in Karachi pays for itself in under 3 years.",
    insightInverter: "Switching to inverter AC could save approx.",
    insightInverterSuffix: "per month.",
    insightPeak: "Peak hours active (7–11 PM). Shift heavy appliances after 11 PM to avoid surcharges.",
    insightSlab: "You're in Slab",
    insightSlabSuffix: "Cutting 50 units drops you a slab — big savings.",
    insightNight: "No peak surcharge after 11 PM. Run washing machines, water motors & irons at night.",

    // Action buttons
    shareWhatsApp: "Share on WhatsApp",
    getSolarQuote: "Get Solar Quote",

    // Bill shock
    billShock: "Bill Shock Explainer",
    billShockSub: "Why did your bill jump this month?",
    lastMonth: "Last Month (units)",
    thisMonth: "This Month (units)",
    explainJump: "Explain My Bill Jump →",
    billChangedBy: "Bill Changed By",

    // Solar CTA
    solarTitle: "Cut Your Bill by 70% with Solar",
    solarSubWithBill: "solar pays for itself in Karachi in under 3 years.",
    solarSubDefault: "Get 3 free quotes from verified solar installers in Karachi at your email address.",
    yourName: "Your name",
    phoneNumber: "Phone number (0312-1234567)",
    feedbackPlaceholder: "Any feedback?",
    getSolarBtn: "Get 3 Free Solar Quotes →",
    sending: "Sending...",
    solarSuccess: "Request Received!",
    solarSuccessSub: "3 verified installers will contact you within 24 hours.",
    noObligation: "Free. No obligation. Verified installers only.",

    // Email
    tariffAlerts: "Get Tariff Update Alerts",
    tariffAlertsSub: "Know when K-Electric rates change so your estimates stay accurate.",
    emailPlaceholder: "your@email.com",
    emailOptional: "Email (optional)",
    emailAddress: "Email address",
    notifyMe: "Notify Me",
    onTheList: "You're on the list!",
    onTheListSub: "We'll email you when tariffs update",

    // What-if Simulator
    whatIfTitle: "What-If Simulator",
    whatIfSub: "Drag the slider to see how changing your usage affects your bill.",
    whatIfAdjust: "Adjust units by",
    whatIfSave: "You save",
    whatIfCost: "You spend extra",
    whatIfPerMonth: "per month",
    whatIfNewBill: "New estimated bill",
    whatIfNewUnits: "New units",

    // Bill History Tracker
    historyTitle: "Monthly Bill History",
    historySub: "Track your units each month to spot trends.",
    historyAddMonth: "Add Month",
    historyMonth: "Month",
    historyUnits: "Units",
    historyBill: "Est. Bill",
    historyEmpty: "No history yet — add your first month above.",
    historyAvg: "Avg units/month",
    historyTotal: "Total spent (est.)",
    historyClear: "Clear all",
    historyPeak: "Peak month",

    // Appliance Upgrade Recommendations
    upgradeTitle: "Upgrade & Save",
    upgradeSub: "Appliances worth switching for big savings.",
    upgradeMonthly: "saves/month",
    upgradeYearly: "saves/year",
    upgradeViewDaraz: "View Online →",
    upgradeNoRecs: "Your usage looks efficient! No major upgrade recommendations.",

    // Solar Comparison
    solarCompareTitle: "Solar Panel & Inverter Comparison",
    solarCompareSub: "Live prices from Pakistan market. Updated manually.",
    solarPanels: "Solar Panels",
    solarInverters: "Inverters",
    solarBrand: "Brand",
    solarModel: "Model",
    solarTech: "Technology",
    solarEff: "Efficiency",
    solarPricePerKw: "Price/kW",
    solarWarranty: "Warranty",
    solarTier: "Tier",
    solarType: "Type",
    solarCapacity: "Capacity",
    solarPrice: "Price",
    solarNoData: "Loading solar data...",

    // Solar ROI Calculator
    solarRoiTitle: "Solar ROI Calculator",
    solarRoiSub: "Find out when solar pays for itself based on your bill.",
    solarRoiSystemSize: "System Size (kW)",
    solarRoiPanel: "Panel Brand",
    solarRoiInverter: "Inverter",
    solarRoiMonthlyBill: "Monthly Bill (PKR)",
    solarRoiResult: "Your Solar ROI",
    solarRoiCost: "Total System Cost",
    solarRoiMonthlySaving: "Monthly Saving (est.)",
    solarRoiPayback: "Payback Period",
    solarRoiYears: "years",
    solarRoiLifetimeSaving: "25-Year Net Saving",
    solarRoiGeneration: "Monthly Generation (est.)",
    solarRoiUnits: "units/month",
    solarRoiSelectPanel: "Select panel brand",
    solarRoiSelectInverter: "Select inverter",
    solarRoiCalculate: "Calculate ROI",

    // Solar Panel Sizing Tool
    solarSizeTitle: "Solar Panel Sizing Tool",
    solarSizeSub: "Enter your roof area and budget — get panel count and estimated output.",
    solarSizeRoofArea: "Available Roof Area (sq ft)",
    solarSizeBudget: "Budget (PKR)",
    solarSizeCalculate: "Calculate System Size",
    solarSizeResult: "Recommended System",
    solarSizePanels: "Solar Panels Needed",
    solarSizeSystemKw: "System Capacity",
    solarSizeMonthlyGen: "Monthly Generation (est.)",
    solarSizeCoverage: "Bill Coverage (est.)",
    solarSizeRoofNeeded: "Roof Area Needed",
    solarSizePanelCount: "panels",
    solarSizeNote: "Based on 400W panels, 5.5 peak sun hours/day, 80% system efficiency.",
    solarSizeRoofHint: "A typical 100 sq ft can fit 2–3 panels (each ~17 sq ft).",
    solarSizeBudgetHint: "Budget covers panels only. Add ~PKR 80,000 for installation.",

    // Load Shedding
    loadSheddingTitle: "Load Shedding Schedule",
    loadSheddingSub: "Search your area or feeder for scheduled outage timings.",
    loadSheddingSearch: "Search area or feeder name...",
    loadSheddingFeeder: "Feeder",
    loadSheddingArea: "Area",
    loadSheddingHours: "Hours/Day",
    loadSheddingSchedule: "Schedule",
    loadSheddingNoResults: "No feeder found. Try a different area name.",
    loadSheddingOfficialTitle: "Get exact timings via K-Electric:",
    loadSheddingSmsSub: "SMS your 13-digit account number to 8119",
    loadSheddingAppSub: "KE Live App → Power Status",
    loadSheddingCallSub: "Call 118 (24/7)",
    loadSheddingLastUpdated: "Schedule data: week of Apr 14, 2026",
    loadSheddingDisclaimer: "Timings are approximate. Unscheduled outages may differ.",

    // Footer
    footerLine1: "BijliBuddy · K-Electric Bill Estimator · Karachi",
    footerLine2: "Rates per SRO 279(I)/2026, effective Feb 12, 2026. Results are estimates only.",
    footerLine3: "Not affiliated with K-Electric or NEPRA.",

    // Empty state
    emptyStateLine1: "Enter units or add appliances to see your bill",
    emptyStateLine2: "Results appear here instantly",

    // page.tsx inline strings
    kwhMonth: "kWh / month",
    defaultFca: "Default",
    allOtherHours: "All other hours",
    basedOnSlab: "Based on current K-Electric slab rates (SRO 279/2026)",

    // Tools page
    toolsSubtitle: "Bill shock explainer, what-if simulator, monthly history & upgrade recommendations.",
    yourCurrentUnits: "Your current monthly units",
    annualSaving: "Annual saving",
    resetSlider: "↺ Reset",
    upgradeSavings: "Up to {pct}% savings on this appliance",

    // Solar page
    solarPageSubtitle: "Panel sizing, ROI calculator, live market prices & verified installer leads.",

    // Load shedding page
    loadSheddingCity: "City / Utility",
    loadSheddingAllCities: "All Cities",
    loadSheddingNoneLabel: "No Shedding",
    loadSheddingLowLabel: "1–4 hrs",
    loadSheddingHighLabel: "5+ hrs",
    loadSheddingNoneTag: "None",
    loadSheddingPerDay: "per day",

    // Peak hours alert signup
    peakAlertTitle: "Peak Hour Alerts",
    peakAlertSub: "Get notified before 7 PM peak hours start — save by shifting heavy appliances.",
    peakAlertContact: "Phone or email",
    peakAlertBtn: "Notify Me Before Peak",
    peakAlertSuccess: "You're set!",
    peakAlertSuccessSub: "We'll alert you before 7 PM peak hours via WhatsApp or email.",
    peakAlertNote: "Peak: 7 PM – 11 PM daily. Three-phase meters pay PKR 46.85/unit vs 34.53 off-peak.",

    // City names (for Urdu pill labels)
    cityKarachi: "Karachi",
    cityLahore: "Lahore",
    cityIslamabad: "Islamabad",
    cityFaisalabad: "Faisalabad",
    cityMultan: "Multan",
    cityPeshawar: "Peshawar",
    cityQuetta: "Quetta",
    cityHyderabad: "Hyderabad",
    citySukkur: "Sukkur",
    cityGujranwala: "Gujranwala",
  },
  ur: {
    // Nav
    navCalculator: "بل کیلکولیٹر",
    navTools: "تجزیہ ٹولز",
    navSolar: "سولر",
    navLoadshed: "لوڈ شیڈنگ",

    // Header
    appName: "بجلی بڈی",
    tagline: "کے الیکٹرک کیلکولیٹر",
    peak: "پیک اوقات",
    offPeak: "آف پیک",

    // Hero
    heroBadge: "مفت · بغیر لاگ ان · فوری نتائج",
    heroTitle: "آپ کا کے الیکٹرک بل\nاتنا زیادہ کیوں ہے؟",
    heroSub: "یونٹس درج کریں — اپنے بل کی مکمل تفصیل فوری دیکھیں۔",

    // Mode toggle
    enterUnits: "یونٹس درج کریں",
    addAppliances: "آلات شامل کریں",

    // Meter settings
    meterSettings: "میٹر کی ترتیبات",
    meterType: "میٹر کی قسم",
    singlePhase: "سنگل فیز",
    threePhase: "تھری فیز",
    sanctionedLoad: "منظور شدہ لوڈ (kW)",
    fcaRate: "FCA ریٹ",
    fcaHint: "اپنے بل پر \"Fuel Cost Adjustment\" دیکھیں۔",

    // Units input
    unitsThisMonth: "اس ماہ کے یونٹس",
    peakOffPeakUnits: "پیک اور آف پیک یونٹس",
    peakUnits: "پیک یونٹس",
    offPeakUnits: "آف پیک یونٹس",
    totalUnits: "کل یونٹس",
    findUnitsHint: "کے الیکٹرک بل پر \"Units Consumed\" دیکھیں",
    findThreePhaseHint: "بل پر \"Energy - Peak\" اور \"Energy - Off Peak\" دیکھیں",
    protectedQualify: "آپ محفوظ (لائف لائن) ٹیرف کے اہل ہو سکتے ہیں",
    nonProtected: "غیر محفوظ",
    protected: "محفوظ",

    // Appliances
    myAppliances: "میرے آلات",
    addAppliance: "+ آلہ شامل کریں",
    close: "✕ بند کریں",
    noAppliances: "ابھی کوئی آلہ شامل نہیں",
    noAppliancesHint: "شروع کرنے کے لیے \"+ آلہ شامل کریں\" پر ٹیپ کریں",
    qty: "تعداد",
    hrsDay: "گھنٹے/دن",
    estimatedUnits: "ماہانہ متوقع یونٹس",

    // Bill result
    estimatedBill: "متوقع ماہانہ بل",
    kwhConsumed: "اس ماہ استعمال شدہ kWh",
    tariffNotice: "کے الیکٹرک ٹیرف کے مطابق — SRO 279/2026، 12 فروری 2026",
    protectedApplied: "محفوظ ٹیرف لاگو",
    billBreakdown: "بل کی تفصیل",
    energyCharges: "توانائی کے اخراجات",
    leviesTaxes: "لیویز اور ٹیکس",
    fixedCharges: "مقررہ اخراجات",
    fuelCostAdj: "ایندھن لاگت ایڈجسٹمنٹ (FCA)",
    additionalSurcharge: "اضافی سرچارج (PHL)",
    electricityDuty: "بجلی ڈیوٹی",
    muct: "MUCT (KMC)",
    gst: "GST / سیلز ٹیکس",
    energyTotal: "توانائی کل",
    totalEstimatedBill: "کل متوقع بل",
    sroRates: "SRO 279/2026 ریٹس",

    // Appliance breakdown
    whichCostsMost: "کون سا آلہ سب سے زیادہ مہنگا ہے؟",

    // Insights
    smartInsights: "ذہین مشورے",
    insightSolar: "آپ کا بل شمسی بچت کا اہل ہے۔ کراچی میں 5kW سسٹم 3 سال سے کم میں قیمت وصول کر لیتا ہے۔",
    insightInverter: "انورٹر AC پر تبدیل ہونے سے تقریباً بچت ہو سکتی ہے",
    insightInverterSuffix: "ماہانہ۔",
    insightPeak: "پیک اوقات فعال ہیں (شام 7 سے 11)۔ بھاری آلات رات 11 بجے کے بعد چلائیں۔",
    insightSlab: "آپ سلیب نمبر",
    insightSlabSuffix: "میں ہیں۔ 50 یونٹس کم کریں — بڑی بچت ہوگی۔",
    insightNight: "رات 11 بجے کے بعد پیک سرچارج نہیں۔ واشنگ مشین، واٹر موٹر رات کو چلائیں۔",

    // Action buttons
    shareWhatsApp: "واٹس ایپ پر شیئر کریں",
    getSolarQuote: "شمسی قیمت دیکھیں",

    // Bill shock
    billShock: "بل شاک وضاحت",
    billShockSub: "اس ماہ بل کیوں بڑھا؟",
    lastMonth: "پچھلا مہینہ (یونٹس)",
    thisMonth: "یہ مہینہ (یونٹس)",
    explainJump: "میرے بل کا اضافہ سمجھائیں ←",
    billChangedBy: "بل میں تبدیلی",

    // Solar CTA
    solarTitle: "شمسی توانائی سے 70% بل کم کریں",
    solarSubWithBill: "شمسی توانائی کراچی میں 3 سال سے کم میں قیمت وصول کر لیتی ہے۔",
    solarSubDefault: "کراچی میں تصدیق شدہ انسٹالرز سے 3 مفت اقتباسات حاصل کریں۔",
    yourName: "آپ کا نام",
    phoneNumber: "فون نمبر (0312-1234567)",
    feedbackPlaceholder: "کوئی رائے؟ (اختیاری — کیا اچھا لگا، کیا missing ہے...)",
    getSolarBtn: "3 مفت شمسی اقتباسات حاصل کریں ←",
    sending: "بھیج رہے ہیں...",
    solarSuccess: "درخواست موصول!",
    solarSuccessSub: "3 تصدیق شدہ انسٹالرز 24 گھنٹوں میں آپ سے رابطہ کریں گے۔",
    noObligation: "مفت۔ کوئی پابندی نہیں۔ صرف تصدیق شدہ انسٹالرز۔",

    // Email
    tariffAlerts: "ٹیرف اپڈیٹ الرٹس حاصل کریں",
    tariffAlertsSub: "جب کے الیکٹرک ریٹس بدلیں تو فوری اطلاع پائیں۔",
    emailPlaceholder: "آپ کی ای میل",
    emailOptional: "ای میل (اختیاری)",
    emailAddress: "ای میل ایڈریس",
    notifyMe: "مجھے بتائیں",
    onTheList: "آپ فہرست میں شامل ہیں!",
    onTheListSub: "ٹیرف تبدیل ہونے پر ہم آپ کو ای میل کریں گے",

    // What-if Simulator
    whatIfTitle: "اگر-تو سمیولیٹر",
    whatIfSub: "سلائیڈر کو گھسیٹیں اور دیکھیں کہ استعمال بدلنے سے بل کتنا بدلتا ہے۔",
    whatIfAdjust: "یونٹس میں تبدیلی",
    whatIfSave: "آپ بچاتے ہیں",
    whatIfCost: "اضافی خرچ",
    whatIfPerMonth: "ماہانہ",
    whatIfNewBill: "نیا متوقع بل",
    whatIfNewUnits: "نئے یونٹس",

    // Bill History Tracker
    historyTitle: "ماہانہ بل تاریخ",
    historySub: "ہر ماہ یونٹس ریکارڈ کریں اور رجحان دیکھیں۔",
    historyAddMonth: "مہینہ شامل کریں",
    historyMonth: "مہینہ",
    historyUnits: "یونٹس",
    historyBill: "متوقع بل",
    historyEmpty: "ابھی کوئی تاریخ نہیں — اوپر پہلا مہینہ شامل کریں۔",
    historyAvg: "اوسط یونٹس/مہینہ",
    historyTotal: "کل متوقع خرچ",
    historyClear: "سب صاف کریں",
    historyPeak: "سب سے زیادہ مہینہ",

    // Appliance Upgrade Recommendations
    upgradeTitle: "اپ گریڈ کریں اور بچائیں",
    upgradeSub: "ان آلات کو بدلنے سے بڑی بچت ہو سکتی ہے۔",
    upgradeMonthly: "ماہانہ بچت",
    upgradeYearly: "سالانہ بچت",
    upgradeViewDaraz: "آن لائن دیکھیں ←",
    upgradeNoRecs: "آپ کا استعمال موثر ہے! کوئی بڑی اپ گریڈ تجویز نہیں۔",

    // Solar Comparison
    solarCompareTitle: "شمسی پینل اور انورٹر موازنہ",
    solarCompareSub: "پاکستان مارکیٹ کی لائیو قیمتیں۔ دستی طور پر اپڈیٹ کی جاتی ہیں۔",
    solarPanels: "شمسی پینل",
    solarInverters: "انورٹرز",
    solarBrand: "برانڈ",
    solarModel: "ماڈل",
    solarTech: "ٹیکنالوجی",
    solarEff: "کارکردگی",
    solarPricePerKw: "قیمت/kW",
    solarWarranty: "وارنٹی",
    solarTier: "درجہ",
    solarType: "قسم",
    solarCapacity: "صلاحیت",
    solarPrice: "قیمت",
    solarNoData: "ڈیٹا لوڈ ہو رہا ہے...",

    // Solar ROI Calculator
    solarRoiTitle: "شمسی ROI کیلکولیٹر",
    solarRoiSub: "جانیں کہ آپ کے بل کے حساب سے شمسی توانائی کب فائدہ مند ہوگی۔",
    solarRoiSystemSize: "سسٹم سائز (kW)",
    solarRoiPanel: "پینل برانڈ",
    solarRoiInverter: "انورٹر",
    solarRoiMonthlyBill: "ماہانہ بل (PKR)",
    solarRoiResult: "آپ کا شمسی ROI",
    solarRoiCost: "کل سسٹم لاگت",
    solarRoiMonthlySaving: "ماہانہ بچت (اندازہ)",
    solarRoiPayback: "واپسی کی مدت",
    solarRoiYears: "سال",
    solarRoiLifetimeSaving: "25 سالہ خالص بچت",
    solarRoiGeneration: "ماہانہ پیداوار (اندازہ)",
    solarRoiUnits: "یونٹس/ماہ",
    solarRoiSelectPanel: "پینل برانڈ منتخب کریں",
    solarRoiSelectInverter: "انورٹر منتخب کریں",
    solarRoiCalculate: "ROI حساب کریں",

    // Solar Panel Sizing Tool
    solarSizeTitle: "شمسی پینل سائزنگ ٹول",
    solarSizeSub: "چھت کا رقبہ اور بجٹ درج کریں — پینل کی تعداد اور پیداوار دیکھیں۔",
    solarSizeRoofArea: "دستیاب چھت کا رقبہ (مربع فٹ)",
    solarSizeBudget: "بجٹ (PKR)",
    solarSizeCalculate: "سسٹم سائز حساب کریں",
    solarSizeResult: "تجویز کردہ سسٹم",
    solarSizePanels: "مطلوبہ شمسی پینل",
    solarSizeSystemKw: "سسٹم صلاحیت",
    solarSizeMonthlyGen: "ماہانہ پیداوار (اندازہ)",
    solarSizeCoverage: "بل کوریج (اندازہ)",
    solarSizeRoofNeeded: "مطلوبہ چھت کا رقبہ",
    solarSizePanelCount: "پینل",
    solarSizeNote: "400W پینل، 5.5 پیک سن آور/دن، 80% سسٹم کارکردگی کی بنیاد پر۔",
    solarSizeRoofHint: "100 مربع فٹ میں 2-3 پینل آ سکتے ہیں (ہر پینل ~17 مربع فٹ)۔",
    solarSizeBudgetHint: "بجٹ صرف پینل کے لیے ہے۔ انسٹالیشن کے لیے ~PKR 80,000 مزید شامل کریں۔",

    // Load Shedding
    loadSheddingTitle: "لوڈ شیڈنگ شیڈول",
    loadSheddingSub: "اپنے علاقے یا فیڈر کا نام تلاش کریں۔",
    loadSheddingSearch: "علاقہ یا فیڈر کا نام تلاش کریں...",
    loadSheddingFeeder: "فیڈر",
    loadSheddingArea: "علاقہ",
    loadSheddingHours: "گھنٹے/دن",
    loadSheddingSchedule: "شیڈول",
    loadSheddingNoResults: "کوئی فیڈر نہیں ملا۔ کوئی اور نام آزمائیں۔",
    loadSheddingOfficialTitle: "کے الیکٹرک سے عین وقت حاصل کریں:",
    loadSheddingSmsSub: "اپنا 13 ہندسہ اکاؤنٹ نمبر 8119 پر SMS کریں",
    loadSheddingAppSub: "KE Live App → Power Status",
    loadSheddingCallSub: "118 پر کال کریں (24/7)",
    loadSheddingLastUpdated: "شیڈول ڈیٹا: 14 اپریل 2026 کا ہفتہ",
    loadSheddingDisclaimer: "اوقات تقریبی ہیں۔ غیر شیڈول بندش مختلف ہو سکتی ہے۔",

    // Footer
    footerLine1: "بجلی بڈی · کے الیکٹرک بل تخمینہ · کراچی",
    footerLine2: "ریٹس SRO 279(I)/2026 کے مطابق، 12 فروری 2026 سے نافذ۔ نتائج صرف تخمینہ ہیں۔",
    footerLine3: "کے الیکٹرک یا NEPRA سے کوئی تعلق نہیں۔",

    // Empty state
    emptyStateLine1: "یونٹس درج کریں یا آلات شامل کریں تاکہ بل دیکھ سکیں",
    emptyStateLine2: "نتائج فوری ظاہر ہوں گے",

    // page.tsx inline strings
    kwhMonth: "kWh / ماہ",
    defaultFca: "ڈیفالٹ",
    allOtherHours: "باقی تمام اوقات",
    basedOnSlab: "موجودہ کے الیکٹرک سلیب ریٹس کے مطابق (SRO 279/2026)",

    // Tools page
    toolsSubtitle: "بل شاک وضاحت، اگر-تو سمیولیٹر، ماہانہ تاریخ اور اپ گریڈ تجاویز۔",
    yourCurrentUnits: "آپ کے موجودہ ماہانہ یونٹس",
    annualSaving: "سالانہ بچت",
    resetSlider: "↺ دوبارہ ترتیب",
    upgradeSavings: "اس آلے پر {pct}% تک بچت",

    // Solar page
    solarPageSubtitle: "پینل سائزنگ، ROI کیلکولیٹر، مارکیٹ قیمتیں اور تصدیق شدہ انسٹالرز۔",

    // Load shedding page
    loadSheddingCity: "شہر / یوٹیلٹی",
    loadSheddingAllCities: "تمام شہر",
    loadSheddingNoneLabel: "کوئی لوڈ شیڈنگ نہیں",
    loadSheddingLowLabel: "1–4 گھنٹے",
    loadSheddingHighLabel: "5+ گھنٹے",
    loadSheddingNoneTag: "کوئی نہیں",
    loadSheddingPerDay: "روزانہ",

    // Peak hours alert signup
    peakAlertTitle: "پیک اوقات الرٹس",
    peakAlertSub: "شام 7 بجے پیک اوقات سے پہلے اطلاع پائیں — بھاری آلات شفٹ کریں اور بچائیں۔",
    peakAlertContact: "فون یا ای میل",
    peakAlertBtn: "پیک سے پہلے مجھے بتائیں",
    peakAlertSuccess: "تیار ہیں!",
    peakAlertSuccessSub: "ہم آپ کو شام 7 بجے سے پہلے واٹس ایپ یا ای میل پر الرٹ کریں گے۔",
    peakAlertNote: "پیک: روزانہ شام 7 سے 11 بجے۔ تھری فیز میٹر: 46.85 PKR/یونٹ بمقابلہ 34.53 آف پیک۔",

    // City names (for Urdu pill labels)
    cityKarachi: "کراچی",
    cityLahore: "لاہور",
    cityIslamabad: "اسلام آباد",
    cityFaisalabad: "فیصل آباد",
    cityMultan: "ملتان",
    cityPeshawar: "پشاور",
    cityQuetta: "کوئٹہ",
    cityHyderabad: "حیدرآباد",
    citySukkur: "سکھر",
    cityGujranwala: "گجرانوالہ",
  },
} satisfies Record<Lang, Record<string, string>>;

export type TKey = keyof typeof translations.en;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
  dir: "ltr" | "rtl";
}

const Ctx = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => translations.en[k],
  dir: "ltr",
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("bb-lang", l);
    document.documentElement.setAttribute("dir", l === "ur" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", l);
  }

  const t = (key: TKey): string => translations[lang][key] ?? translations.en[key];
  const dir = lang === "ur" ? "rtl" : "ltr";

  return <Ctx.Provider value={{ lang, setLang, t, dir }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
