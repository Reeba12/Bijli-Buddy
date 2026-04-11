import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Email/notify signup — sends ntfy.sh notification + logs
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body as { email: string };

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

    // Log to server console (visible in Vercel logs)
    console.log("[NOTIFY SIGNUP]", { email, timestamp });

    // Save to Supabase
    const { error: dbError } = await supabase
      .from("lead-generation")
      .insert({ email });

    if (dbError) console.error("[NOTIFY SIGNUP DB ERROR]", dbError.message);

    // Send ntfy.sh notification if configured
    const topic = process.env.NTFY_TOPIC;

    if (topic) {
      await fetch(`https://ntfy.sh/${topic}`, {
        method: "POST",
        headers: {
          "Title": "New Tariff Alert Signup - BijliBuddy",
          "Tags": "email,bell",
          "Priority": "default",
        },
        body: `Email: ${email}\nTime: ${timestamp}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[NOTIFY SIGNUP ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
