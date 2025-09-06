"use client";

import { MessageCircle, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const DEMO_REPLY =
  "Hi! This is a demo assistant. To enable real AI replies, set NEXT_PUBLIC_CHAT_WEBHOOK to your server endpoint that returns { reply: string }.";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999 });
  }, [msgs, open]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const endpoint = process.env.NEXT_PUBLIC_CHAT_WEBHOOK;
      if (endpoint) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...msgs, { role: "user", content: text }],
          }),
        });
        const data = (await res.json()) as { reply?: string };
        setMsgs((m) => [
          ...m,
          { role: "assistant", content: data?.reply || DEMO_REPLY },
        ]);
      } else {
        await new Promise((r) => setTimeout(r, 300));
        setMsgs((m) => [...m, { role: "assistant", content: DEMO_REPLY }]);
      }
    } catch (e) {
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, the assistant is unavailable right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[320px] md:w-[360px] h-[420px] rounded-xl border border-subtle bg-white text-gray-900 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b flex items-center justify-between bg-gray-50">
            <div className="font-medium text-sm">Chat with us</div>
            <button
              aria-label="Close chat"
              className="h-7 w-7 inline-grid place-items-center rounded-md hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-auto p-3 space-y-2">
            {msgs.length === 0 && (
              <div className="text-xs text-gray-500">
                Ask anything about Stockholm IMS.
              </div>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`text-sm ${m.role === "user" ? "text-right" : "text-left"}`}
              >
                <span
                  className={`inline-block rounded-lg px-3 py-2 ${m.role === "user" ? "bg-[--primary] text-[--primary-foreground]" : "bg-gray-100"}`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400">Thinking…</div>}
          </div>
          <div className="p-2 border-t flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Type your question…"
              className="flex-1 rounded-md border px-3 py-2 text-sm outline-none"
            />
            <button onClick={send} className="btn btn-primary text-sm">
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          className="h-12 w-12 rounded-full bg-[--primary] text-[--primary-foreground] shadow-lg grid place-items-center hover:opacity-90"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
