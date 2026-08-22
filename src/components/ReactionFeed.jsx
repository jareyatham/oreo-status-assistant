import { useEffect, useState } from "react";
import { subscribeReactionHistory } from "../lib/reactionStore";

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  return `${hours} ชม.ที่แล้ว`;
}

export default function ReactionFeed() {
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeReactionHistory(setReactions);
    return () => unsubscribe();
  }, []);

  if (reactions.length === 0) {
    return (
      <div className="w-full max-w-sm flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink/70">Reaction Feed</label>
        <p className="text-xs text-ink/30 glass-card px-3 py-3 text-center">
          ยังไม่มีใครส่งรีแอคชันมาในสถานะนี้
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-ink/70">Reaction Feed</label>
        <span className="text-[11px] text-ink/40">{reactions.length} ครั้ง</span>
      </div>

      <div className="glass-card p-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-1 bg-white/60 rounded-full px-2.5 py-1 text-sm"
          >
            <span className="text-base">{r.emoji}</span>
            <span className="text-[10px] text-ink/40">{timeAgo(r.sentAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}