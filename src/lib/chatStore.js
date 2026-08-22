import { ref, push, onValue, remove, query, limitToLast } from "firebase/database";
import { db } from "./firebase";

const CHAT_PATH = "chatMessages";
const KEEP_LAST = 50;

/**
 * @param {"text"|"gif"|"image"} type
 * @param {string} content
 * @param {"viewer"|"owner"} from
 */
export async function sendChatMessage(type, content, from) {
  const chatRef = ref(db, CHAT_PATH);
  await push(chatRef, {
    type,
    content,
    from,
    sentAt: new Date().toISOString(),
  });
}

/**
 * ฟังข้อความแชททั้งหมดแบบ realtime เรียงตามเวลา
 * @param {(messages: Array) => void} callback
 */
export function subscribeChatMessages(callback) {
  const chatQuery = query(ref(db, CHAT_PATH), limitToLast(KEEP_LAST));
  const unsubscribe = onValue(chatQuery, (snapshot) => {
    const data = snapshot.val() ?? {};
    const messages = Object.entries(data)
      .map(([id, msg]) => ({ id, ...msg }))
      .sort((a, b) => (a.sentAt < b.sentAt ? -1 : 1));
    callback(messages);
  });
  return unsubscribe;
}

/** ล้างแชททั้งหมด — เรียกตอนเจ้าของอัปเดตสถานะใหม่ */
export async function clearChat() {
  await remove(ref(db, CHAT_PATH));
}