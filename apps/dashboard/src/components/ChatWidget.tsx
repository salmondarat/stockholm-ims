"use client";

import { MessageCircle, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const DEMO_REPLY =
  "Hi! This is a demo assistant. To enable real AI replies, set NEXT_PUBLIC_CHAT_WEBHOOK to your server endpoint that returns { reply: string }.";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999 });
  }, [msgs, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      window.addEventListener("keydown", onKey);
      window.addEventListener("mousedown", onClick);
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const endpoint =
        process.env.NEXT_PUBLIC_CHAT_WEBHOOK || "/app/api/ai/openrouter";
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
        <div
          ref={panelRef}
          className="w-[400px] md:w-[440px] h-[520px] rounded-2xl border border-subtle bg-card text-[--foreground] shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-subtle flex items-center justify-between bg-card/90">
            <div className="font-semibold text-sm">Chat with us</div>
            <button
              aria-label="Close chat"
              className="h-8 w-8 inline-grid place-items-center rounded-md hover:bg-[--background]/10"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div
            ref={scrollRef}
            className="flex-1 overflow-auto p-3 md:p-4 space-y-2"
          >
            {msgs.length === 0 && (
              <div className="text-xs text-muted">
                Ask anything about Stockholm IMS.
              </div>
            )}
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`text-sm ${m.role === "user" ? "text-right" : "text-left"}`}
              >
                <span
                  className={`inline-block rounded-lg px-3 py-2 ${m.role === "user" ? "bg-[--primary] text-[--primary-foreground]" : "bg-card/80 text-[--foreground] border border-subtle"}`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {loading && <div className="text-xs text-muted">Thinking…</div>}
          </div>
          <div className="p-3 md:p-4 border-t border-subtle flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Type your question…"
              className="flex-1 rounded-md border px-3 py-2 text-sm outline-none bg-[--background] text-[--foreground] border-subtle placeholder:text-gray-500"
            />
            <button
              onClick={send}
              className="px-3 py-2 text-sm rounded-md bg-[--primary] text-[--primary-foreground]"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          className="h-16 w-16 rounded-full bg-[#e11d48] text-white shadow-xl shadow-black/20 grid place-items-center transition-transform duration-150 hover:scale-105 hover:bg-[#f43f5e] active:scale-95 active:translate-y-[1px] focus:outline-none focus:ring-4 focus:ring-[#fb7185]/50"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-7 w-7 text-white"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 4C7.582 4 4 7.134 4 10.999c0 1.613.59 3.12 1.635 4.35l-.97 3.517a.75.75 0 0 0 .958.916l3.808-1.184A9.96 9.96 0 0 0 12 18c4.418 0 8-3.134 8-6.999S16.418 4 12 4z" />
          </svg>
        </button>
      )}
    </div>
  );
}
