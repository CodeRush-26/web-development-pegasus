import { useState, useEffect, useRef } from "react";
import { useSocketStore } from "@/store/socketStore";
import useUserStore from "@/store/userStore";
import { Send, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  _id: string;
  senderId: string;
  senderRole: string;
  shipId: string;
  content: string;
  timestamp: string;
}

export function DispatchChat({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { ws, send } = useSocketStore();
  const { user } = useUserStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "chat_receive") {
          setMessages((prev) => [...prev, msg.payload]);
        }
      } catch (err) {}
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [ws]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    send("chat_send", {
      content: input.trim(),
      // If admin, they broadcast to all captains in this MVP view.
      // Ideally, they would select a specific shipId, but for now we broadcast.
    });

    setInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 sm:w-96 h-[500px] bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-xl shadow-2xl flex flex-col overflow-hidden z-[300]">
      <div className="p-3 bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)] flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare size={18} className="text-[var(--primary)]" />
          Fleet Dispatch Comms
        </h3>
        <button onClick={onClose} className="text-[var(--dashboard-text-muted)] hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--dashboard-text-muted)] text-sm opacity-50">
            <MessageSquare size={32} className="mb-2" />
            <p>No messages yet.</p>
            <p>Secure comms channel open.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-[var(--dashboard-text-muted)] mb-1 px-1">
                  {msg.senderRole === "admin" ? "Command Center" : `Ship ${msg.shipId}`}
                </span>
                <div className={`px-3 py-2 rounded-lg max-w-[85%] text-sm ${
                  isMe 
                    ? 'bg-[var(--primary)] text-white rounded-br-none' 
                    : 'bg-[var(--dashboard-card-hover)] border border-[var(--dashboard-border)] rounded-bl-none'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-[var(--dashboard-text-muted)] mt-1 opacity-50 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Transmit message..."
            className="flex-1 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <Button type="submit" size="icon" disabled={!input.trim()} className="bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shrink-0">
            <Send size={16} />
          </Button>
        </div>
      </form>
    </div>
  );
}
