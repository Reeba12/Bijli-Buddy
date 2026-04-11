import { NextRequest, NextResponse } from "next/server";

// Solar lead API — sends Telegram notification + logs to console
// Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local to activate
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, bill } = body as { name: string; phone: string; bill: number };

    if (!name || !phone) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" });

    // Log to server console (visible in Vercel logs)
    console.log("[SOLAR LEAD]", { name, phone, bill, timestamp });

    // Send Telegram notification if configured
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      const message = [
        "☀️ *New Solar Lead — BijliBuddy*",
        "",
        `👤 Name: ${name}`,
        `📱 Phone: ${phone}`,
        `💰 Monthly Bill: PKR ${bill.toLocaleString()}`,
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
    console.error("[SOLAR LEAD ERROR]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
