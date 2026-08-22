import { useEffect, useRef, useState } from "react";
import { subscribeStatus } from "../lib/statusStore";
import { resolveFinalMessage } from "../lib/messageGenerator";
import Mascot from "../components/Mascot";
import StatusBadge from "../components/StatusBadge";
import ReactionBar from "../components/ReactionBar";
import ChatBox from "../components/ChatBox";
import { Clock, PawPrint } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { APP_VERSION } from "../constants/version";
import { recordView } from "../lib/viewCounter";

function formatUpdatedAt(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ViewerPage() {
  const [data, setData] = useState(null);
  const hasRecordedView = useRef(false);

  useEffect(() => {
  const existing = document.querySelector('link[rel="manifest"][href="/manifest-controller.webmanifest"]');
  if (existing) existing.remove();

  const link = document.createElement("link");
  link.rel = "manifest";
  link.href = "/manifest.webmanifest"; // path มาตรฐานที่ vite-plugin-pwa gen ให้
  document.head.appendChild(link);
}, []);

  useEffect(() => {
    const unsubscribe = subscribeStatus(setData);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (hasRecordedView.current) return;
    hasRecordedView.current = true;
    recordView().catch((err) => console.error("บันทึกการเข้าชมไม่สำเร็จ:", err));
  }, []);

  if (!data) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg">
        <p className="text-ink/50 text-sm">Loading Status...</p>
      </div>
    );
  }

  const finalMessage = resolveFinalMessage(data);
  const isCustomMessage = !!data.message?.trim();

  return (
    <div className="min-h-dvh bg-app-gradient flex flex-col items-center justify-center px-6 py-10">
      <div className="relative w-full max-w-sm">
        <ThemeToggle />

        <div
          key={data.status}
          className="w-full glass-card p-6 flex flex-col items-center gap-4 animate-[fadeIn_0.4s_ease-out]"
        >
          <p className="text-xs text-ink/40 tracking-wide uppercase -mb-1 flex items-center gap-1.5">
            <PawPrint className="w-3.5 h-3.5 text-primary" />
            Oreo Status
          </p>

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
            <p className="text-center text-ink text-base leading-relaxed">
              {finalMessage}
            </p>
            {isCustomMessage && (
              <span className="text-[11px] text-accent/60 tracking-wide">
                Message from the boss
              </span>
            )}
          </div>

          {data.endTime && (
            <p className="text-sm text-accent font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" /> Expected back around {data.endTime}
            </p>
          )}

          <p className="text-xs text-ink/40 mt-2">
            Last updated {formatUpdatedAt(data.updatedAt)}
          </p>

          <ReactionBar />
          <ChatBox role="viewer" />

          <p className="text-[10px] text-ink/25 mt-1">{APP_VERSION}</p>
        </div>
      </div>
    </div>
  );
}