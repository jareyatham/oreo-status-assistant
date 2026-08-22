import { useEffect, useState } from "react";
import { subscribeStatus, updateStatus } from "../lib/statusStore";
import { generateMessage, resolveAutoMood } from "../lib/messageGenerator";
import { STATUS_CONFIG, EMOJI_CHOICES } from "../constants/statusConfig";
import Mascot from "../components/Mascot";
import TimePicker from "../components/TimePicker";
import MessagePreview from "../components/MessagePreview";
import { searchGifs } from "../lib/giphy";
import ChatBox from "../components/ChatBox";
import { clearChat } from "../lib/chatStore";
import ReactionFeed from "../components/ReactionFeed";
import { clearReactions } from "../lib/reactionStore";
import { PawPrint, Plus, Upload, Search, X } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { APP_VERSION } from "../constants/version";

const MOOD_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "cute", label: "Cute" },
  { value: "professional", label: "Professional" },
];

const MAX_IMAGE_BYTES = 400 * 1024; // ไฟล์ต้นฉบับไม่เกิน ~400KB

export default function ControllerPage() {
  const [status, setStatus] = useState("available");
  const [customStatus, setCustomStatus] = useState("");
  const [customEmoji, setCustomEmoji] = useState("✨");
  const [customImageBase64, setCustomImageBase64] = useState("");
  const [endTime, setEndTime] = useState("");
  const [mood, setMood] = useState("cute");
  const [customMessage, setCustomMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  // ตัวเลือกแหล่งรูป: อัปโหลดไฟล์เอง หรือค้นหา GIF จาก Giphy
  const [imageMode, setImageMode] = useState("upload"); // "upload" | "gif"
  const [gifQuery, setGifQuery] = useState("");
  const [gifResults, setGifResults] = useState([]);
  const [searchingGif, setSearchingGif] = useState(false);

  // โหลดค่าปัจจุบันมาแสดงตอนเปิดหน้า
  useEffect(() => {
    const unsubscribe = subscribeStatus((data) => {
      setStatus(data.status ?? "available");
      setCustomStatus(data.customStatus ?? "");
      setCustomEmoji(data.customEmoji ?? "✨");
      setCustomImageBase64(data.customImageBase64 ?? "");
      setEndTime(data.endTime ?? "");
      setMood(data.mood ?? "cute");
      setCustomMessage(data.message ?? "");
    });
    return () => unsubscribe();
  }, []);

  // ค้นหา GIF แบบ debounce — รอ 0.5 วิ หลังพิมพ์หยุด ค่อยยิง API
  useEffect(() => {
    if (imageMode !== "gif" || !gifQuery.trim()) {
      setGifResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchingGif(true);
      try {
        const results = await searchGifs(gifQuery);
        setGifResults(results);
      } catch (err) {
        console.error("ค้นหา GIF ไม่สำเร็จ:", err);
      } finally {
        setSearchingGif(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [gifQuery, imageMode]);

  const isCustomStatus = status === "custom";
  const autoMessage = generateMessage({
    status: isCustomStatus ? "custom" : status,
    customStatus,
    endTime,
    mood,
  });

  function handleImageSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("อัปโหลดได้เฉพาะไฟล์รูปภาพเท่านั้น");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      alert("ไฟล์ใหญ่เกินไป กรุณาเลือกรูปที่เล็กกว่า 400KB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCustomImageBase64(reader.result);
    reader.onerror = () => alert("อ่านไฟล์ไม่สำเร็จ ลองใหม่อีกครั้ง");
    reader.readAsDataURL(file);
  }

  async function handleUpdate() {
    setSaving(true);
    try {
      await updateStatus({
        status,
        customStatus: isCustomStatus ? customStatus : "",
        customEmoji: isCustomStatus ? customEmoji : "",
        customImageBase64: isCustomStatus ? customImageBase64 : "",
        message: customMessage,
        autoMessage,
        endTime,
        updatedAt: new Date().toISOString(),
        mood,
      });
      await clearChat(); // ล้างแชทเดิมทุกครั้งที่อัปเดตสถานะใหม่
      await clearReactions(); // ล้าง reaction เดิมทุกครั้งที่อัปเดตสถานะใหม่
      setSavedAt(new Date());
    } catch (err) {
      console.error("อัปเดตไม่สำเร็จ:", err);
      alert("อัปเดตไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center px-6 py-10 gap-6">
      <ThemeToggle />

      <h1 className="text-lg font-semibold text-ink flex items-center gap-2">
        <PawPrint className="w-5 h-5 text-primary" />
        Oreo Controller
      </h1>

      <Mascot
        status={status}
        customStatus={customStatus}
        customImageBase64={customImageBase64}
      />

      <ReactionFeed />

      {/* Status selector */}
      <div className="w-full max-w-sm flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink/70">Status</label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`min-h-[44px] px-3 py-2.5 rounded-xl text-sm font-medium transition btn-press ${
                status === key
                  ? "bg-primary text-white"
                  : "glass-card text-ink/70"
              }`}
            >
              {cfg.emoji} {cfg.label}
            </button>
          ))}
          <button
            onClick={() => setStatus("custom")}
            className={`min-h-[44px] px-3 py-2.5 rounded-xl text-sm font-medium transition btn-press flex items-center justify-center gap-1 ${
              status === "custom"
                ? "bg-primary text-white"
                : "glass-card text-ink/70"
            }`}
          >
            <Plus className="w-4 h-4" /> Custom
          </button>
        </div>

        {isCustomStatus && (
          <>
            <input
              type="text"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="Enter a custom status, e.g. Playing a game"
              className="mt-2 glass-card px-4 py-2.5 text-ink outline-none focus:ring-2 focus:ring-primary/50"
            />

            <div className="flex gap-2 mt-2 flex-wrap">
              {EMOJI_CHOICES.map((emo) => (
                <button
                  key={emo}
                  onClick={() => setCustomEmoji(emo)}
                  className={`min-w-[44px] min-h-[44px] rounded-full text-lg flex items-center justify-center transition ${
                    customEmoji === emo
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "glass-card"
                  }`}
                >
                  {emo}
                </button>
              ))}
            </div>

            {/* เลือกรูป: อัปโหลดไฟล์ หรือ ค้นหา GIF */}
            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink/70">
                Mascot image (optional)
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`flex-1 min-h-[40px] rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                    imageMode === "upload"
                      ? "bg-accent text-white"
                      : "glass-card text-ink/70"
                  }`}
                >
                  <Upload className="w-4 h-4" /> Upload file
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("gif")}
                  className={`flex-1 min-h-[40px] rounded-xl text-sm font-medium transition flex items-center justify-center gap-1.5 ${
                    imageMode === "gif"
                      ? "bg-accent text-white"
                      : "glass-card text-ink/70"
                  }`}
                >
                  <Search className="w-4 h-4" /> Search GIF
                </button>
              </div>

              {imageMode === "upload" ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelected}
                  className="glass-card px-4 py-2.5 text-sm text-ink outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-primary/15 file:text-accent file:text-sm"
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={gifQuery}
                    onChange={(e) => setGifQuery(e.target.value)}
                    placeholder="Search GIFs, e.g. cute dog, happy"
                    className="glass-card px-4 py-2.5 text-ink outline-none focus:ring-2 focus:ring-primary/50"
                  />

                  {searchingGif && (
                    <p className="text-xs text-ink/40">Searching...</p>
                  )}

                  {gifResults.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
                      {gifResults.map((gif) => (
                        <button
                          key={gif.id}
                          type="button"
                          onClick={() => setCustomImageBase64(gif.fullUrl)}
                          className={`rounded-xl overflow-hidden aspect-square glass-card transition bg-black/5 flex items-center justify-center ${
                            customImageBase64 === gif.fullUrl
                              ? "ring-2 ring-primary"
                              : ""
                          }`}
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

              {customImageBase64 && (
                <div className="flex items-center gap-3 mt-1">
                  <img
                    src={customImageBase64}
                    alt="Image Preview"
                    className="w-14 h-14 rounded-xl object-cover glass-card"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomImageBase64("")}
                    className="text-xs text-accent underline"
                  >
                    Remove image
                  </button>
                </div>
              )}

              <p className="text-xs text-ink/40">
                Upload an image (max 400KB) or search Giphy and pick one
              </p>
            </div>
          </>
        )}
      </div>

      {/* Time picker */}
      <div className="w-full max-w-sm">
        <TimePicker value={endTime} onChange={setEndTime} />
      </div>

      {/* Mood selector */}
      <div className="w-full max-w-sm flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink/70">Message tone</label>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMood(opt.value)}
              className={`min-h-[44px] flex-1 px-3 py-2 rounded-xl text-sm font-medium transition btn-press ${
                mood === opt.value
                  ? "bg-accent text-white"
                  : "glass-card text-ink/70"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {mood === "auto" && (
          <p className="text-xs text-accent/70 -mt-1">
            Auto mode is currently using:{" "}
            {resolveAutoMood() === "cute" ? "Cute  🐶" : "Professional 💼"}
          </p>
        )}
      </div>

      {/* Message preview + custom override */}
      <div className="w-full max-w-sm">
        <MessagePreview
          autoMessage={autoMessage}
          customMessage={customMessage}
          onCustomChange={setCustomMessage}
        />
      </div>

      {/* มินิแชท */}
      <ChatBox role="owner" />

      {/* Update button */}
      <button
        onClick={handleUpdate}
        disabled={saving}
        className="w-full max-w-sm min-h-[52px] bg-primary text-white font-semibold py-3 rounded-2xl shadow-sm btn-press transition disabled:opacity-50"
      >
        {saving ? "Updating..." : "Update status"}
      </button>

      {savedAt && (
        <p className="text-xs text-ink/40">
          Last saved at {savedAt.toLocaleTimeString("en-US")}
        </p>
      )}

      <p className="text-[10px] text-ink/25">{APP_VERSION}</p>
    </div>
  );
}
