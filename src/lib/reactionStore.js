import { ref, push, onValue, remove, query, limitToLast } from "firebase/database";
import { db } from "./firebase";

const REACTIONS_PATH = "reactions";
const KEEP_LAST = 30;

export async function sendReaction(emoji) {
  const reactionsRef = ref(db, REACTIONS_PATH);
  await push(reactionsRef, {
    emoji,
    sentAt: new Date().toISOString(),
  });
}

/**
 * ดึงรายการ reaction ทั้งหมดของสถานะปัจจุบัน แบบ realtime
 * @param {(reactions: Array<{ id: string, emoji: string, sentAt: string }>) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeReactionHistory(callback) {
  const reactionsQuery = query(ref(db, REACTIONS_PATH), limitToLast(KEEP_LAST));
  const unsubscribe = onValue(reactionsQuery, (snapshot) => {
    const data = snapshot.val() ?? {};
    const list = Object.entries(data)
      .map(([id, r]) => ({ id, ...r }))
      .sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1)); // ใหม่สุดอยู่บน
    callback(list);
  });
  return unsubscribe;
}

/** ล้าง reaction ทั้งหมด — เรียกตอนเจ้าของอัปเดตสถานะใหม่ */
export async function clearReactions() {
  await remove(ref(db, REACTIONS_PATH));
}