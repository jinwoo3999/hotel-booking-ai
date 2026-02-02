"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Xin chào! Tôi có thể giúp bạn tìm khách sạn, phòng phù hợp hoặc tra cứu lịch sử đặt phòng.",
  },
];

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const createSessionId = () => {
    try {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
      }
    } catch {
      // ignore
    }
    return `anon-${Date.now()}`;
  };

  const normalizeOption = (value: string) =>
    value
      .replace(/\s*\([^)]*\)\s*$/, "")
      .replace(/:\s*.*$/u, "")
      .replace(/\s+/g, " ")
      .trim();

  const quickOptions = (() => {
    const defaultOptions = [
      "Tìm khách sạn Đà Lạt",
      "Phòng view biển Đà Nẵng",
      "Lịch sử đặt phòng",
      "Voucher đang có",
      "Chính sách check-in / hủy phòng",
      "Điểm vui chơi Đà Lạt",
      "Gợi ý phòng phù hợp gia đình",
      "Gần trung tâm, giá tốt",
    ];
    const lastAssistant = [...messages].reverse().find((msg) => msg.role === "assistant")?.content;
    if (!lastAssistant) return defaultOptions.slice(0, 10).map((label) => ({ label, useIndex: false }));
    if (lastAssistant.includes("Chi tiết đơn đặt phòng")) {
      return [{ label: "Hủy đơn", useIndex: false }];
    }
    if (lastAssistant.includes("Chi tiết phòng") || lastAssistant.includes("Bạn muốn đặt phòng này không?")) {
      return [
        { label: "Đặt phòng 12/02 - 14/02", useIndex: false },
        { label: "Đặt phòng 12/02 - 14/02 voucher ABC123", useIndex: false },
      ];
    }
    const lines = lastAssistant.split("\n").map((line) => line.trim());
    const options: string[] = [];
    for (const line of lines) {
      if (line.startsWith("• ")) {
        const label = normalizeOption(line.replace(/^•\s+/, "").split(" - ")[0]);
        if (/vui choi|điểm vui chơi|diem vui choi/i.test(label)) continue;
        options.push(label);
      } else if (line.startsWith("- ")) {
        const label = normalizeOption(line.replace(/^-+\s+/, ""));
        if (/vui choi|điểm vui chơi|diem vui choi/i.test(label)) continue;
        options.push(label);
      }
    }
    const cleaned = options.filter(Boolean);
    if (cleaned.length) return cleaned.slice(0, 10).map((label) => ({ label, useIndex: true }));
    return defaultOptions.slice(0, 10).map((label) => ({ label, useIndex: false }));
  })();

  useEffect(() => {
    if (!isOpen) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 50);
  }, [messages, isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMounted(true);
    const existing = localStorage.getItem("ai_session_id");
    if (existing) {
      setSessionId(existing);
      return;
    }
    const created = createSessionId();
    localStorage.setItem("ai_session_id", created);
    setSessionId(created);
  }, []);

  // Lắng nghe sự kiện từ QuickActionCard
  useEffect(() => {
    const handleOpenChatWithMessage = (event: CustomEvent) => {
      setIsOpen(true);
      setInput(event.detail);
    };

    window.addEventListener('openChatWithMessage', handleOpenChatWithMessage as EventListener);
    
    return () => {
      window.removeEventListener('openChatWithMessage', handleOpenChatWithMessage as EventListener);
    };
  }, []);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
    };

    setIsLoading(true);
    setMessages((prev) => [...prev, userMessage]);

    try {
      const lastAssistant = [...messages].reverse().find((msg) => msg.role === "assistant")?.content;
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const data = (await res.json()) as { response?: string };
      const reply = data.response || "Xin lỗi, hệ thống đang bận. Vui lòng thử lại.";

      const botMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
      };

      setMessages((prev) => [...prev, botMessage]);
      setInput("");
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Xin lỗi, không thể kết nối AI lúc này. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = async (option: string, index: number, useIndex: boolean) => {
    if (isLoading) return;
    setInput(option);
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
    setInput("");
    const content = option.trim();
    if (!content) return;
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
    };
    setIsLoading(true);
    setMessages((prev) => [...prev, userMessage]);

    try {
      const lastAssistant = [...messages].reverse().find((msg) => msg.role === "assistant")?.content;
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = (await res.json()) as { response?: string };
      const reply = data.response || "Xin lỗi, hệ thống đang bận. Vui lòng thử lại.";
      const botMessage: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: "Xin lỗi, không thể kết nối AI lúc này. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-end justify-end">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </Button>
      ) : (
        <Card className="w-[95vw] md:w-[460px] h-[620px] max-h-[85vh] shadow-2xl flex flex-col bg-white/95 backdrop-blur border border-indigo-100 rounded-2xl overflow-hidden relative">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-indigo-400/30 blur-3xl" />
        <div className="absolute top-24 -left-12 h-40 w-40 rounded-full bg-purple-400/25 blur-3xl" />
      </div>
      <CardHeader className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 text-white p-4 flex flex-row justify-between items-center shrink-0 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-6 -right-10 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
          <div className="absolute bottom-0 left-4 h-16 w-16 rounded-full bg-white/30 blur-2xl" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center ring-1 ring-white/25 shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Lumina Assistant</h3>
            <span className="text-[11px] opacity-90 block">Tư vấn khách sạn • Phòng • Voucher</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="text-white hover:bg-white/20 h-8 w-8 rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-indigo-50/50 via-white to-white scroll-smooth"
        style={{ scrollbarGutter: "stable" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={cn(
                "p-3 text-sm rounded-xl max-w-[85%] whitespace-pre-wrap shadow-sm leading-relaxed",
                message.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full justify-start">
            <div className="p-3 text-sm rounded-xl max-w-[85%] shadow-sm bg-white border border-gray-200 text-gray-800 rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-3 bg-white border-t border-gray-100 shrink-0 flex flex-col gap-3 items-stretch">
        <form onSubmit={handleSend} className="flex w-full gap-2 items-center">
          <input
            className="flex-1 bg-gray-100 text-gray-900 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="Nhập yêu cầu..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700 rounded-lg shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4 text-white" />}
          </Button>
        </form>
        {quickOptions.length > 0 && (
          <div className="w-full">
            <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
              <span>Gợi ý nhanh</span>
              <span className="opacity-70">Chọn nhanh bên dưới</span>
            </div>
            <div className="bg-white/95 border border-gray-200 rounded-2xl p-2 shadow-sm w-full">
              <div className="flex gap-2 overflow-x-auto pb-1 pr-1 w-full">
                {quickOptions.map((option, index) => (
                  <button
                    key={`${option.label}-${index}`}
                    type="button"
                    onClick={() => handleQuickSelect(option.label, index, option.useIndex)}
                    className="min-h-[48px] min-w-[180px] px-3 py-2 text-xs rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors text-left shadow-sm whitespace-normal"
                  >
                    <span className="mr-1 text-[10px] text-indigo-400">{index + 1}.</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardFooter>
        </Card>
      )}
    </div>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}
