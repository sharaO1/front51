import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bot,
  Send,
  User as UserIcon,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore, ChatMessage } from "@/stores/chatStore";

type ChatMessage = {
  id: string;
  role: "user" | "ai";
  text: string;
};

function formatMessage(t: string): string {
  if (!t) return "";
  let s = t.replace(/\r\n/g, "\n");

  // Normalize excessive breaks
  s = s.replace(/\n{3,}/g, "\n\n");

  // Remove single newlines inserted between non-space characters (token-per-line)
  s = s.replace(/([^\s])\n([^\s])/g, "$1$2");

  const PARA = "<<PARA>>";
  // Preserve real paragraphs, then turn any remaining single newlines into spaces
  s = s.replace(/\n{2,}/g, PARA);
  s = s.replace(/\n/g, " ");

  // Cleanup extra spaces
  s = s.replace(/[\t ]{2,}/g, " ").trim();

  // Restore paragraph breaks
  s = s.replace(new RegExp(PARA, "g"), "\n\n");
  return s;
}

function getInitials(name?: string | null, email?: string | null) {
  const source = (name && name.trim()) || (email && email.split("@")[0]) || "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

const ENV_URL = (import.meta as any)?.env?.VITE_CHAT_API_URL as
  | string
  | undefined;
const getCandidateApiUrls = () => {
  const origin =
    typeof window !== "undefined" ? window.location.origin : undefined;
  const list = [
    ENV_URL?.trim(),
    "/chat",
    "/api/chat",
    origin ? `${origin}/chat` : undefined,
    origin ? `${origin}/api/chat` : undefined,
    "http://localhost:5002/api/chat",
  ].filter(Boolean) as string[];
  return Array.from(new Set(list));
};

const getCandidateResetUrls = () =>
  getCandidateApiUrls().map((u) => `${u.replace(/\/+$/, "")}/reset`);

async function tryResetBackend(accessToken?: string | null) {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  // 1) Try explicit /reset endpoints
  for (const url of getCandidateResetUrls()) {
    try {
      const res = await fetch(url, { method: "POST", headers });
      if (res.ok) return true;
    } catch {}
  }

  // 2) Fallback: send a reset command payload to chat endpoints
  const payloads = [{ action: "reset" }, { reset: true }, { command: "reset" }];
  for (const url of getCandidateApiUrls()) {
    for (const body of payloads) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) return true;
      } catch {}
    }
  }
  return false;
}

type AIChatProps = {
  variant?: "inline" | "floating"; // inline: renders inside layout. floating: shows a button and opens as a panel
  height?: string; // Tailwind height class for inline variant (e.g. "h-[70vh]")
  page?: boolean; // page mode renders full-viewport without overlay and without depending on dashboard layout
  defaultOpen?: boolean; // open by default (useful for floating variant triggered via URL)
  showTrigger?: boolean; // show the floating trigger button (for floating variant)
};

export default function AIChat({
  variant = "inline",
  height = "h-[70vh]",
  page = false,
  defaultOpen = false,
  showTrigger = true,
}: AIChatProps) {
  const [isOpen, setIsOpen] = useState(variant === "inline" || defaultOpen);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigate = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const initialMessages = useMemo<ChatMessage[]>(
    () => [
      {
        id: "welcome-1",
        role: "ai",
        text: "Hello! Welcome to your warehouse and business assistant. How can I help you today?",
      },
    ],
    [],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback((smooth = false) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isTyping, scrollToBottom, isFullScreen]);

  // Always reset conversation when component mounts (e.g., after page refresh)
  useEffect(() => {
    tryResetBackend(accessToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen, isFullScreen]);

  const clearChat = useCallback(async () => {
    // Reset UI immediately
    setMessages(
      initialMessages.map((m) => ({ ...m, id: `welcome-${Date.now()}` })),
    );
    setInput("");
    setIsTyping(false);
    setIsSending(false);
    abortRef.current?.abort();
    scrollToBottom(true);

    // Try notifying backend to reset server-side conversation (with fallbacks)
    try {
      await tryResetBackend(accessToken);
    } catch {
      // ignore errors; UI is already reset
    }
  }, [initialMessages, scrollToBottom, accessToken]);

  const typeWriter = useCallback(
    async (fullText: string) => {
      setIsTyping(true);
      const id = `ai-${Date.now()}`;
      setMessages((prev) => [...prev, { id, role: "ai", text: "" }]);

      await new Promise<void>((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
          i += 1;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id ? { ...m, text: fullText.slice(0, i) } : m,
            ),
          );
          if (i >= fullText.length) {
            clearInterval(interval);
            resolve();
          }
        }, 10);
      });

      setIsTyping(false);
      scrollToBottom(true);
    },
    [scrollToBottom],
  );

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || isSending || isTyping) return;

      setIsSending(true);

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text: content,
      };
      const aiId = `ai-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: aiId, role: "ai", text: "" },
      ]);
      setInput("");
      setIsTyping(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const urls = getCandidateApiUrls();
        let success = false;
        let lastErr: unknown = null;
        for (const url of urls) {
          try {
            const headers: Record<string, string> = {
              "Content-Type": "application/json",
              Accept: "text/plain, application/json;q=0.9, */*;q=0.8",
            };
            if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
            const payload = { massage: content, message: content };
            const res = await fetch(url, {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
              signal: controller.signal,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            if (res.body) {
              const reader = res.body.getReader();
              const decoder = new TextDecoder();
              let acc = "";
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                acc += decoder.decode(value, { stream: true });
                setMessages((prev) =>
                  prev.map((m) => (m.id === aiId ? { ...m, text: acc } : m)),
                );
                scrollToBottom(true);
              }
              if (acc.trim().length > 0) {
                success = true;
                break;
              }
            }

            const ct = res.headers.get("content-type") || "";
            if (!success) {
              let textResp: string | null = null;
              if (ct.includes("application/json")) {
                const data: any = await res.json();
                textResp =
                  (typeof data?.result === "string" && data.result) ||
                  (typeof data?.message === "string" && data.message) ||
                  (typeof data?.text === "string" && data.text) ||
                  null;
              } else {
                textResp = await res.text();
              }
              if (typeof textResp === "string" && textResp.length > 0) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === aiId ? { ...m, text: textResp } : m,
                  ),
                );
                success = true;
                break;
              }
            }
            lastErr = new Error("Empty reply");
          } catch (e) {
            lastErr = e;
            continue;
          }
        }

        if (!success) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiId
                ? {
                    ...m,
                    text: "Failed connect to Network. Please check your Internet connection!!",
                  }
                : m,
            ),
          );
        }
      } finally {
        setIsTyping(false);
        setIsSending(false);
      }
    },
    [input, isSending, isTyping, scrollToBottom, accessToken],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const showFloatingButton = variant === "floating" && !isOpen && showTrigger;
  const containerFixed = isFullScreen || (variant === "floating" && isOpen);

  // Exit fullscreen on Escape
  useEffect(() => {
    if (!isFullScreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullScreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullScreen]);

  // Lock page scroll when chat is open/fullscreen to avoid background moving
  useEffect(() => {
    if (isOpen || isFullScreen) {
      const body = document.body;
      const html = document.documentElement;
      const prevBody = body.style.overflow;
      const prevHtml = html.style.overflow;
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      return () => {
        body.style.overflow = prevBody;
        html.style.overflow = prevHtml;
      };
    }
  }, [isOpen, isFullScreen]);

  return (
    <>
      {showFloatingButton && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed right-4 lg:right-6 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] lg:bottom-6 h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg transition-transform hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {isOpen && (
        <div
          className={cn(
            page && isFullScreen
              ? "fixed inset-0 z-50 p-0 bg-background overscroll-none touch-none"
              : page
                ? "relative z-auto"
                : isFullScreen
                  ? "fixed inset-0 z-50 p-0 bg-background overscroll-none touch-none"
                  : variant === "floating"
                    ? "fixed right-4 lg:right-6 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] lg:bottom-6 z-50"
                    : "relative z-auto mt-6",
          )}
        >
          <Card
            className={cn(
              "border-0 shadow-lg overflow-hidden",
              page
                ? isFullScreen
                  ? "h-screen w-screen rounded-none"
                  : "h-[100dvh] w-screen rounded-none"
                : isFullScreen
                  ? "h-screen w-screen rounded-none"
                  : variant === "floating"
                    ? "w-[min(92vw,384px)] sm:w-[384px] h-[560px] rounded-3xl"
                    : cn("w-full", height, "rounded-3xl"),
            )}
          >
            <CardHeader className="relative border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 sticky top-0 z-10 px-6 pb-6 pt-[15px]">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Bot className="h-5 w-5" /> AI Chat
              </CardTitle>
              <div className="absolute right-2 top-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (page) {
                      navigate("/dashboard?chat=open");
                      return;
                    }
                    navigate("/chat");
                  }}
                  className="h-8 w-8 rounded-full"
                  aria-label={page ? "Dock to dashboard" : "Open full screen"}
                >
                  {page ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChat}
                  className="h-8 w-8 rounded-full"
                  aria-label="Clear chat"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                {(variant === "floating" || page) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (page) {
                        if (window.history.length > 1) navigate(-1);
                        else navigate("/dashboard");
                      } else {
                        setIsOpen(false);
                      }
                    }}
                    className="h-8 w-8 rounded-full"
                    aria-label="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0 h-full">
              <div className="flex h-full flex-col overflow-hidden">
                <div className="h-2 bg-gradient-to-b from-transparent to-black/0 dark:to-white/0" />
                <div
                  ref={listRef}
                  className="flex-1 overflow-y-auto overscroll-contain pt-[76px] px-[11px] pb-0 space-y-3 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "flex gap-2",
                        m.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {m.role === "ai" && (
                        <div className="mt-1 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl leading-relaxed shadow break-words whitespace-pre-wrap",
                          isFullScreen
                            ? "p-4 text-base max-w-[80%]"
                            : "p-3 text-sm",
                          m.role === "user"
                            ? "bg-blue-600 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-800 border rounded-bl-md",
                        )}
                      >
                        {formatMessage(m.text)}
                      </div>
                      {m.role === "user" && (
                        <Avatar className="mt-1 h-8 w-8">
                          <AvatarImage
                            src={user?.avatar || undefined}
                            alt={user?.name || user?.email || "User"}
                          />
                          <AvatarFallback className="bg-gray-500 text-white text-xs font-medium">
                            {getInitials(
                              user?.name || null,
                              user?.email || null,
                            )}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                        <span
                          className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <span
                          className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      AI is typing…
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "border-t bg-background p-3",
                    containerFixed ? "sticky bottom-0" : "",
                  )}
                  style={
                    containerFixed
                      ? { bottom: "env(safe-area-inset-bottom)" }
                      : undefined
                  }
                >
                  <form
                    className="flex items-end gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                  >
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Type your message…"
                      className="min-h-[48px] sm:min-h-[52px] rounded-xl px-4 shadow-sm"
                      disabled={isSending || isTyping}
                    />
                    <Button
                      type="submit"
                      disabled={!input.trim() || isSending || isTyping}
                      className="h-12 w-12 rounded-xl"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
