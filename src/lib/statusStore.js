import { ref, onValue, set } from "firebase/database";
import { db } from "./firebase";

const STATUS_PATH = "status";

/**
 * ฟัง realtime update — ใช้ทั้งใน Viewer และ Controller
 * @param {(data: import('../types/status').StatusData) => void} callback
 * @returns {() => void} unsubscribe function
 */
export function subscribeStatus(callback) {
  const statusRef = ref(db, STATUS_PATH);
  const unsubscribe = onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
  return unsubscribe;
}

/**
 * เขียนสถานะใหม่ — ใช้เฉพาะใน Controller
 * @param {import('../types/status').StatusData} statusData
 */
export async function updateStatus(statusData) {
  const statusRef = ref(db, STATUS_PATH);
  await set(statusRef, {
    ...statusData,
    secret: import.meta.env.VITE_CONTROLLER_SECRET,
  });
}
