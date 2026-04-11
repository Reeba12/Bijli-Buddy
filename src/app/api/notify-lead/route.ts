import { NextRequest, NextResponse } from "next/server";

// Email/notify signup — sends Telegram notification + logs
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

    // Send Telegram notification if configured
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      const message = [
        "📬 *New Tariff Alert Signup — BijliBuddy*",
        "",
        `📧 Email: ${email}`,
        `🕐 Time: ${timestamp}`,
      ].join("\n");

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[NOTIFY SIGNUP ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
