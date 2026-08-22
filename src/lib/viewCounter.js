import { ref, push, onValue, query, limitToLast } from "firebase/database";
import { db } from "./firebase";
import { ref, push, onValue, remove, query, limitToLast } from "firebase/database";
import { db } from "./firebase";

// ...โค้ดเดิมทั้งหมด (recordView, subscribeViewLogs)

/** ล้าง log การเข้าชมทั้งหมด — เรียกตอนเจ้าของอัปเดตสถานะใหม่ */
export async function clearViewLogs() {
  await remove(ref(db, "viewLogs"));
}


const VIEW_LOGS_PATH = "viewLogs";
const KEEP_LAST = 50;

/** บันทึกว่าเปิดหน้า Viewer พร้อมเวลาปัจจุบัน */
export async function recordView() {
  const logsRef = ref(db, VIEW_LOGS_PATH);
  await push(logsRef, {
    viewedAt: new Date().toISOString(),
  });
}

/**
 * ฟัง log การเข้าชมทั้งหมดล่าสุด แบบ realtime — ใช้เฉพาะใน Controller
 * @param {(logs: Array<{ id: string, viewedAt: string }>) => void} callback
 * @returns {() => void} unsubscribe
 */
export function subscribeViewLogs(callback) {
  const logsQuery = query(ref(db, VIEW_LOGS_PATH), limitToLast(KEEP_LAST));
  const unsubscribe = onValue(logsQuery, (snapshot) => {
    const data = snapshot.val() ?? {};
    const list = Object.entries(data)
      .map(([id, log]) => ({ id, ...log }))
      .sort((a, b) => (a.viewedAt < b.viewedAt ? 1 : -1)); // ใหม่สุดอยู่บน
    callback(list);
  });
  return unsubscribe;
}