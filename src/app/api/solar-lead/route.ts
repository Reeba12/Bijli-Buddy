import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Solar lead API — sends ntfy.sh notification + logs to console
// Set NTFY_TOPIC in .env.local to activate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, bill, feedback } = body as { name: string; phone: string; email?: string; bill: number; feedback?: string };

    if (!name || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

    // Log to server console (visible in Vercel logs)
    console.log("[SOLAR LEAD]", { name, phone, bill, timestamp });

    // Save to Supabase
    const { error: dbError } = await supabase
      .from("lead-generation")
      .insert({ name, phone_number: phone, email: email || null, feedback: feedback || null });

    if (dbError) console.error("[SOLAR LEAD DB ERROR]", dbError.message);

    // Send ntfy.sh notification if configured
    const topic = process.env.NTFY_TOPIC;

    if (topic) {
      await fetch(`https://ntfy.sh/${topic}`, {
        method: "POST",
        headers: {
          "Title": "New Solar Lead - BijliBuddy",
          "Tags": "sunny,phone",
          "Priority": "high",
        },
        body: `Name: ${name}\nPhone: ${phone}\nEmail: ${email || "N/A"}\nMonthly Bill: PKR ${bill?.toLocaleString() ?? "N/A"}\nTime: ${timestamp}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[SOLAR LEAD ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
