import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

  let body: unknown;
  try {
    body = await req.json();
  } catch {}
  type InMsg = { role: string; content: string };
  const messages: InMsg[] = Array.isArray(
    (body as { messages?: InMsg[] } | undefined)?.messages,
  )
    ? ((body as { messages?: InMsg[] }).messages as InMsg[])
    : [];

  if (!OPENROUTER_API_KEY) {
    const last = messages.length
      ? String(messages[messages.length - 1]?.content || "")
      : "";
    const reply = last
      ? `OpenRouter is not configured. To enable AI replies, set OPENROUTER_API_KEY. Your question was: "${last}".`
      : "OpenRouter is not configured. Set OPENROUTER_API_KEY to enable AI replies.";
    return NextResponse.json({ reply });
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": "Stockholm IMS Dashboard",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for the Stockholm IMS dashboard. Answer concisely about items, inventory and operations.",
          },
          ...messages,
        ],
      }),
    });
    if (!res.ok) {
      let detail = "";
      try {
        const err = await res.json();
        detail =
          err?.error?.message ||
          (typeof err?.error === "string" ? err.error : "") ||
          err?.message ||
          (typeof err === "string" ? err : JSON.stringify(err));
      } catch {}
      const msg = `OpenRouter error ${res.status}: ${detail || res.statusText}`;
      return NextResponse.json({ reply: msg });
    }
    const json = await res.json();
    const reply =
      json?.choices?.[0]?.message?.content ||
      json?.choices?.[0]?.text ||
      (json?.error?.message as string | undefined) ||
      "Sorry, I couldn't generate a reply right now.";
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({
      reply: "AI endpoint error. Please try again later.",
    });
  }
}
