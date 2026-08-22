import { STATUS_CONFIG } from "../constants/statusConfig";

export default function StatusBadge({ status, customStatus, customEmoji }) {
  const config = STATUS_CONFIG[status];
  const label = config?.label ?? customStatus ?? "ไม่ทราบสถานะ";
  const emoji = config?.emoji ?? customEmoji ?? "✨";

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full 
        bg-primary/15 text-accent font-medium text-sm transition-all duration-300
        ${status === "available" ? "pulse-available" : ""}`}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
