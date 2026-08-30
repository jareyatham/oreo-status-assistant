import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { ref, set, get } from "firebase/database";
import { db } from "./firebase";
import app from "./firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * ขอ permission แจ้งเตือน + สมัครรับ push token
 * @param {"viewer"|"owner"} role
 * @returns {Promise<string|null>} token ที่ได้ หรือ null ถ้าปฏิเสธ/ไม่รองรับ
 */
export async function subscribeToPush(role) {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    console.warn("เบราว์เซอร์นี้ไม่รองรับ push notification");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      // เก็บ token แยกตาม role เพื่อให้อีกฝั่งรู้ว่าจะส่ง push ไปหาใคร
      await set(ref(db, `pushTokens/${role}`), {
        token,
        updatedAt: new Date().toISOString(),
      });
    }

    return token;
  } catch (err) {
    console.error("สมัคร push ไม่สำเร็จ:", err);
    return null;
  }
}

/** เช็คว่าเคยกด allow notification ไว้หรือยัง */
export function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission; // "granted" | "denied" | "default"
}

/**
 * ดึง token ของอีกฝั่ง เพื่อส่ง push ไปหา
 * @param {"viewer"|"owner"} role
 */
export async function getPushToken(role) {
  const snapshot = await get(ref(db, `pushTokens/${role}`));
  return snapshot.val()?.token ?? null;
}

/** ฟังข้อความ push ตอนแอปเปิดอยู่ (foreground) */
export function listenForegroundMessages(callback) {
  const messaging = getMessaging(app);
  return onMessage(messaging, callback);
}