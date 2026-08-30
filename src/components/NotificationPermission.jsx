import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { subscribeToPush, getNotificationPermission } from "../lib/pushNotifications";

/**
 * @param {{ role: "viewer" | "owner" }} props
 */
export default function NotificationPermission({ role }) {
  const [status, setStatus] = useState("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(getNotificationPermission());
  }, []);

  async function handleEnable() {
    setLoading(true);
    const token = await subscribeToPush(role);
    setStatus(getNotificationPermission());
    setLoading(false);
    if (!token) {
      alert("Couldn't enable notifications. Please check your browser settings.");
    }
  }

  if (status === "unsupported") return null;
  if (status === "granted") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-accent/70">
        <Bell className="w-3.5 h-3.5" />
        Notifications on
      </div>
    );
  }

  return (
    <button
      onClick={handleEnable}
      disabled={loading || status === "denied"}
      className="flex items-center gap-1.5 text-xs text-ink/50 glass-card px-3 py-1.5 rounded-full btn-press disabled:opacity-50"
    >
      <BellOff className="w-3.5 h-3.5" />
      {status === "denied"
        ? "Notifications blocked"
        : loading
        ? "Enabling..."
        : "Enable notifications"}
    </button>
  );
}