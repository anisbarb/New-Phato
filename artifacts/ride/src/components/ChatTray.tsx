import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "../lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSend: (text: string) => void;
  toName?: string;
}

export default function ChatTray({ open, onClose, messages, onSend, toName }: Props) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="phato-chat"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          <div className="phato-chat-header">
            <span className="phato-chat-title">{toName ?? "Chat"}</span>
            <button className="phato-chat-close" onClick={onClose} aria-label="Close chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="phato-chat-messages">
            {messages.length === 0 && (
              <p className="phato-chat-empty">No messages yet</p>
            )}
            {messages.map((m) => (
              <div key={m.chatId} className={`phato-chat-bubble ${m.fromSelf ? "self" : "other"}`}>
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="phato-chat-input-row">
            <input
              className="phato-chat-input"
              type="text"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className="phato-chat-send"
              onClick={handleSend}
              disabled={!text.trim()}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
