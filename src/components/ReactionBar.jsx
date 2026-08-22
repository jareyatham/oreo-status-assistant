import { useState } from "react";
import { REACTION_EMOJIS } from "../constants/statusConfig";
import { sendReaction } from "../lib/reactionStore";

export default function ReactionBar() {
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [sending, setSending] = useState(false);

  async function handleTap(emoji) {
    const id = Date.now() + Math.random();
    setFloatingEmojis((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 1200);

    setSending(true);
    try {
      await sendReaction(emoji);
    } catch (err) {
      console.error("ส่ง reaction ไม่สำเร็จ:", err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative w-full flex flex-col items-center gap-2">
      <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 h-0 w-0">
        {floatingEmojis.map((item) => (
          <span
            key={item.id}
            className="absolute text-2xl animate-[floatUp_1.2s_ease-out_forwards]"
            style={{ left: `${(Math.random() - 0.5) * 60}px` }}
          >
            {item.emoji}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleTap(emoji)}
            disabled={sending}
            className="min-w-[44px] min-h-[44px] rounded-full glass-card text-xl flex items-center justify-center btn-press transition active:scale-90"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}