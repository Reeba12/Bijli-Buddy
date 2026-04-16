import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone } = body as { email?: string; phone?: string };

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone required" }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

    // Save to Supabase "alert" table (columns: email, phone_number)
    const { error: dbError } = await supabase
      .from("alert")
      .insert({
        email: email ? email.toLowerCase().trim() : null,
        phone_number: phone ? phone.trim() : null,
      });

    if (dbError) {
      console.error("[PEAK ALERT DB ERROR]", dbError.message);
      // Don't fail the request — still send ntfy and return success
    }

    console.log("[PEAK ALERT] Saved:", email ?? phone);

    // Send ntfy.sh notification if configured
    const topic = process.env.NTFY_TOPIC;
    if (topic) {
      await fetch(`https://ntfy.sh/${topic}`, {
        method: "POST",
        headers: {
          "Title": "New Peak Alert Signup - BijliBuddy",
          "Tags": "bell,zap",
          "Priority": "default",
        },
        body: `${email ? `Email: ${email}` : `Phone: ${phone}`}\nTime: ${timestamp}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PEAK ALERT ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
