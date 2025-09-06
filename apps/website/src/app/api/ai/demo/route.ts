import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const last =
      Array.isArray(body?.messages) && body.messages.length
        ? String(body.messages[body.messages.length - 1]?.content || "")
        : "";
    const reply = last
      ? `Thanks for your question: "${last}". I’m a demo assistant. For AI replies without cost, set NEXT_PUBLIC_CHAT_WEBHOOK to "/api/ai/demo" (this endpoint), or deploy a free serverless function that returns { reply: string }.`
      : "Hello! Ask anything about Stockholm IMS. This is a demo endpoint.";
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ reply: "Assistant is unavailable right now." });
  }
}
