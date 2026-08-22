import { useEffect, useRef, useState } from "react";
import { subscribeChatMessages, sendChatMessage } from "../lib/chatStore";
import { searchGifs } from "../lib/giphy";
import { MessageCircle, Image as ImageIcon, Film, Send, X } from "lucide-react";

const SEND_COOLDOWN_MS = 3000; // กันสแปม ส่งได้ทุก 3 วิ
const MAX_TEXT_LENGTH = 200;
const MAX_IMAGE_BYTES = 200 * 1024; // ~200KB ต่อรูป (เก็บเป็น base64 ใน RTDB)

function formatMessageTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
/**
 * @param {{ role: "viewer" | "owner" }} props
 */
export default function ChatBox({ role }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [mode, setMode] = useState("text"); // "text" | "gif"
  const [gifQuery, setGifQuery] = useState("");
  const [gifResults, setGifResults] = useState([]);
  const [searchingGif, setSearchingGif] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const lastSentAtRef = useRef(0);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeChatMessages(setMessages);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (cooldownLeft <= 0) return;
    const timer = setInterval(() => {
      const remain = Math.max(
        0,
        SEND_COOLDOWN_MS - (Date.now() - lastSentAtRef.current),
      );
      setCooldownLeft(Math.ceil(remain / 1000));
    }, 250);
    return () => clearInterval(timer);
  }, [cooldownLeft]);

  useEffect(() => {
    if (mode !== "gif" || !gifQuery.trim()) {
      setGifResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearchingGif(true);
      try {
        setGifResults(await searchGifs(gifQuery));
      } catch (err) {
        console.error("ค้นหา GIF ไม่สำเร็จ:", err);
      } finally {
        setSearchingGif(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [gifQuery, mode]);

  function canSendNow() {
    return Date.now() - lastSentAtRef.current >= SEND_COOLDOWN_MS;
  }

  function markSent() {
    lastSentAtRef.current = Date.now();
    setCooldownLeft(Math.ceil(SEND_COOLDOWN_MS / 1000));
  }

  async function handleSendText() {
    const trimmed = text.trim();
    if (!trimmed || !canSendNow()) return;
    markSent();
    setText("");
    try {
      await sendChatMessage("text", trimmed, role);
    } catch (err) {
      console.error("ส่งข้อความไม่สำเร็จ:", err);
    }
  }

  async function handleSendGif(gif) {
    if (!canSendNow()) return;
    markSent();
    setMode("text");
    setGifQuery("");
    setGifResults([]);
    try {
      await sendChatMessage("gif", gif.fullUrl, role);
    } catch (err) {
      console.error("ส่ง GIF ไม่สำเร็จ:", err);
    }
  }

  function handleImageSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Image Upload Only");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      alert("Please upload an image under 200KB.");
      e.target.value = "";
      return;
    }
    if (!canSendNow()) {
      alert(`Wait ${cooldownLeft} Seconds Before Sending Another Message`);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      markSent();
      try {
        await sendChatMessage("image", reader.result, role);
      } catch (err) {
        console.error("Image Upload Failed:", err);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendText();
    }
  }

  const disabled = cooldownLeft > 0;

  return (
    <div className="w-full max-w-sm flex flex-col gap-2">
      <label className="text-sm font-medium text-ink/70 flex items-center gap-1.5">
        <MessageCircle className="w-4 h-4" /> Mini Chat
      </label>
      <div
        ref={scrollRef}
        className="glass-card p-3 h-56 overflow-y-auto flex flex-col gap-2"
      >
        {messages.length === 0 && (
          <p className="text-xs text-ink/30 text-center my-auto">
            No Messages Yet — Send the First Message
          </p>
        )}
        {messages.map((msg) => {
          const isSelf = msg.from === role;
          return (
            <div
              key={msg.id}
              className={`max-w-[75%] flex flex-col gap-0.5 ${isSelf ? "self-end items-end" : "self-start items-start"}`}
            >
              <div
                className={`rounded-2xl px-3 py-2 text-sm ${
                  isSelf ? "bg-primary text-white" : "bg-white/70 text-ink"
                }`}
              >
                {msg.type === "text" && (
                  <p className="whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                )}
                {msg.type === "gif" && (
                  <img
                    src={msg.content}
                    alt="gif"
                    className="rounded-xl w-40 h-40 object-cover block"
                  />
                )}
                {msg.type === "image" && (
                  <img
                    src={msg.content}
                    alt="รูปภาพ"
                    className="rounded-xl w-40 h-40 object-cover block"
                  />
                )}
              </div>
              <span className="text-[10px] text-ink/35 px-1">
                {formatMessageTime(msg.sentAt)}
              </span>
            </div>
          );
        })}
      </div>

      {mode === "text" ? (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder="Type a Message..."
            className="glass-card px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 flex-1 min-w-0"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 shrink-0 rounded-full glass-card flex items-center justify-center btn-press"
            title="Send image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setMode("gif")}
            className="w-10 h-10 shrink-0 rounded-full glass-card flex items-center justify-center btn-press"
            title="Send GIF"
          >
            <Film className="w-4 h-4" />
          </button>
          <button
            onClick={handleSendText}
            disabled={disabled || !text.trim()}
            className="w-10 h-10 shrink-0 rounded-full bg-primary text-white flex items-center justify-center btn-press disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelected}
            className="hidden"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={gifQuery}
              onChange={(e) => setGifQuery(e.target.value)}
              placeholder="Search GIFs..."
              className="glass-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50 flex-1"
            />
            <button
              type="button"
              onClick={() => setMode("text")}
              className="min-w-[40px] min-h-[40px] rounded-full glass-card flex items-center justify-center btn-press"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {searchingGif && <p className="text-xs text-ink/40">Searching...</p>}
          {gifResults.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
              {gifResults.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => handleSendGif(gif)}
                  disabled={disabled}
                  className="rounded-xl overflow-hidden aspect-square glass-card btn-press disabled:opacity-40"
                >
                  <img
                    src={gif.previewUrl}
                    alt="GIF option"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] text-ink/30">
          {mode === "text" ? `${text.length}/${MAX_TEXT_LENGTH}` : ""}
        </span>
        {disabled && (
          <span className="text-[11px] text-accent/70">
            Wait {cooldownLeft} s before sending again
          </span>
        )}
      </div>
    </div>
  );
}
