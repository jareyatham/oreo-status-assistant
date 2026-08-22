import { useEffect, useRef, useState } from "react";
import { subscribeChatMessages, sendChatMessage } from "../lib/chatStore";
import { searchGifs } from "../lib/giphy";
import { MessageCircle, Image as ImageIcon, Film, Send, X } from "lucide-react";

const SEND_COOLDOWN_MS = 3000;
const MAX_TEXT_LENGTH = 200;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const COMPRESSED_MAX_DIMENSION = 1280;
const COMPRESSED_QUALITY = 0.75;

function formatMessageTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > COMPRESSED_MAX_DIMENSION) {
          height = Math.round((height * COMPRESSED_MAX_DIMENSION) / width);
          width = COMPRESSED_MAX_DIMENSION;
        } else if (height > COMPRESSED_MAX_DIMENSION) {
          width = Math.round((width * COMPRESSED_MAX_DIMENSION) / height);
          height = COMPRESSED_MAX_DIMENSION;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", COMPRESSED_QUALITY));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
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
  const [pendingMedia, setPendingMedia] = useState(null); // { type: "image"|"gif", content: string }
  const [lightboxImage, setLightboxImage] = useState(null); // url รูปที่กำลังขยายดู  const lastSentAtRef = useRef(0);
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

  function handleSelectGif(gif) {
    setPendingMedia({ type: "gif", content: gif.fullUrl });
    setMode("text");
    setGifQuery("");
    setGifResults([]);
  }

  // Step 1: เลือกไฟล์ → บีบอัด → เอาไปโชว์ preview รอ confirm (ยังไม่ส่ง)
  async function handleImageSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are supported");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      alert("File too large. Please choose an image smaller than 8MB");
      e.target.value = "";
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPendingMedia({ type: "image", content: compressed });
    } catch (err) {
      console.error("ประมวลผลรูปไม่สำเร็จ:", err);
      alert("Failed to process image, please try again");
    } finally {
      e.target.value = "";
    }
  }

  // Step 2: กดยืนยันส่งจริง
  // กดยืนยันส่งจริง — ใช้ได้ทั้งรูปที่อัปโหลดและ GIF ที่เลือก
  async function handleConfirmSendMedia() {
    if (!pendingMedia || !canSendNow()) return;
    markSent();
    const toSend = pendingMedia;
    setPendingMedia(null);
    try {
      await sendChatMessage(toSend.type, toSend.content, role);
    } catch (err) {
      console.error("ส่งไม่สำเร็จ:", err);
    }
  }

  function handleCancelMedia() {
    setPendingMedia(null);
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
            No messages yet — send the first message
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
                {(msg.type === "gif" || msg.type === "image") && (
                  <button
                    type="button"
                    onClick={() => setLightboxImage(msg.content)}
                    className="block"
                  >
                    <img
                      src={msg.content}
                      alt={msg.type === "gif" ? "gif" : "image"}
                      className="rounded-xl w-40 h-40 object-cover block cursor-zoom-in"
                    />
                  </button>
                )}
              </div>
              <span className="text-[10px] text-ink/35 px-1">
                {formatMessageTime(msg.sentAt)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Preview รูปที่เลือกไว้ รอกด confirm ก่อนส่งจริง */}
      {/* Preview รูป/GIF ที่เลือกไว้ รอกด confirm ก่อนส่งจริง */}
      {pendingMedia && (
        <div className="glass-card p-2 flex items-center gap-3">
          <img
            src={pendingMedia.content}
            alt="Preview"
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div className="flex-1 flex flex-col gap-1">
            <p className="text-xs text-ink/60">
              Send this {pendingMedia.type === "gif" ? "GIF" : "image"}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmSendMedia}
                disabled={disabled}
                className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium btn-press disabled:opacity-40"
              >
                Send
              </button>
              <button
                onClick={handleCancelMedia}
                className="px-3 py-1.5 rounded-full glass-card text-xs font-medium btn-press"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === "text" ? (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
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
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
              {gifResults.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => handleSelectGif(gif)}
                  className="rounded-xl overflow-hidden glass-card btn-press bg-black/5 flex items-center justify-center h-24 w-full"
                >
                  <img
                    src={gif.previewUrl}
                    alt="GIF option"
                    className="max-w-full max-h-full object-contain"
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
            Wait {cooldownLeft}s before sending again
          </span>
        )}
      </div>

      {/* Lightbox — ขยายรูปเต็มจอ */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="fixed w-10 h-10 rounded-full bg-white/15 flex items-center justify-center z-[101] active:bg-white/25"
            style={{
              top: "calc(env(safe-area-inset-top, 0px) + 16px)",
              right: "calc(env(safe-area-inset-right, 0px) + 16px)",
            }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <img
            src={lightboxImage}
            alt="Expanded view"
            className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
