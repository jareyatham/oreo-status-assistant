import { useEffect, useState } from "react";
import { subscribeStatus } from "../lib/statusStore";
import { resolveFinalMessage } from "../lib/messageGenerator";
import Mascot from "../components/Mascot";
import StatusBadge from "../components/StatusBadge";
import ReactionBar from "../components/ReactionBar";
import ChatBox from "../components/ChatBox";

function formatUpdatedAt(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

export default function ViewerPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeStatus(setData);
    return () => unsubscribe();
  }, []);

  if (!data) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg">
        <p className="text-ink/50 text-sm">กำลังโหลดสถานะ...</p>
      </div>
    );
  }

  const finalMessage = resolveFinalMessage(data);
  const isCustomMessage = !!data.message?.trim();

  return (
    <div className="min-h-dvh bg-app-gradient flex flex-col items-center justify-center px-6 py-10">
      <div
        key={data.status}
        className="w-full max-w-sm glass-card p-6 flex flex-col items-center gap-4 animate-[fadeIn_0.4s_ease-out]"
      >
        <p className="text-xs text-ink/40 tracking-wide uppercase -mb-1">โอรีโอ สเตตัส</p>

        <Mascot
          status={data.status}
          customStatus={data.customStatus}
          customImageBase64={data.customImageBase64}
        />

        <StatusBadge
          status={data.status}
          customStatus={data.customStatus}
          customEmoji={data.customEmoji}
        />

        <div className="flex flex-col items-center gap-1.5">
          <p className="text-center text-ink text-base leading-relaxed">{finalMessage}</p>
          {isCustomMessage && (
            <span className="text-[11px] text-accent/60 tracking-wide">
              ข้อความจากเจ้านายโดยตรง
            </span>
          )}
        </div>

        {data.endTime && (
          <p className="text-sm text-accent font-medium">⏰ คาดว่าจะกลับมาประมาณ {data.endTime}</p>
        )}

        <p className="text-xs text-ink/40 mt-2">อัปเดตล่าสุด {formatUpdatedAt(data.updatedAt)}</p>

        <ReactionBar />
        <ChatBox role="viewer" />
      </div>
    </div>
  );
}