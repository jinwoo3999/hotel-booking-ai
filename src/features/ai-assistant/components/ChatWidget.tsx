"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý AI của Lumina Stay. Tôi có thể giúp bạn tìm phòng phù hợp hoặc giải đáp thắc mắc.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messageCounterRef = useRef(2);

  const generateMessageId = () => {
    return (messageCounterRef.current++).toString();
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg: Message = {
      id: generateMessageId(),
      role: "user",
      content: inputValue,
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    setTimeout(() => {
      const aiMsg: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: "Cảm ơn bạn đã quan tâm. Hiện tại tính năng AI đang được kết nối với hệ thống đặt phòng. Bạn cần tìm phòng view biển hay trung tâm?",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <Card className="w-[350px] shadow-2xl border-indigo-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <CardHeader className="bg-indigo-600 text-white rounded-t-lg p-4 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-base">Lumina AI Support</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-indigo-700 h-8 w-8"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="h-[300px] p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                      msg.role === "user"
                        ? "ml-auto bg-indigo-600 text-white"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
            </div>
          </CardContent>

          <CardFooter className="p-3 border-t bg-gray-50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex w-full items-center gap-2"
            >
              <Input
                placeholder="Hỏi về phòng..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="bg-white"
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="h-14 w-14 rounded-full bg-indigo-600 shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110"
        >
          <MessageSquare className="h-7 w-7 text-white" />
        </Button>
      )}
    </div>
  );
}