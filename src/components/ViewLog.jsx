import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { subscribeViewLogs } from "../lib/viewCounter";

function formatViewTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  if (isToday) return `Today, ${time}`;

  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${dateStr}, ${time}`;
}

export default function ViewLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeViewLogs(setLogs);
    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-sm flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-ink/70 flex items-center gap-1.5">
          <Eye className="w-4 h-4" /> Viewer visits
        </label>
        <span className="text-[11px] text-ink/40">{logs.length} total</span>
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-ink/30 glass-card px-3 py-3 text-center">No visits yet</p>
      ) : (
        <div className="glass-card p-3 flex flex-col gap-1.5 max-h-32 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="text-xs text-ink/60">
              {formatViewTime(log.viewedAt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}