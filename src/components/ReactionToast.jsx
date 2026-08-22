import { useEffect, useState } from "react";
import { subscribeNewReactions } from "../lib/reactionStore";

export default function ReactionToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeNewReactions((reaction) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, emoji: reaction.emoji }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    });
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="glass-card px-4 py-2 flex items-center gap-2 text-sm text-ink animate-[fadeIn_0.3s_ease-out]"
        >
          <span className="text-lg">{toast.emoji}</span>
          <span>แฟนส่งรีแอคชันมา!</span>
        </div>
      ))}
    </div>
  );
}