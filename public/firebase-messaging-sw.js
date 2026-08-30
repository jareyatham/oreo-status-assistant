importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

// ใส่ค่า Firebase config เดียวกับที่ใช้ใน src/lib/firebase.js
// Service Worker เข้าถึง import.meta.env ไม่ได้ ต้องเขียนค่าตรงๆ ตรงนี้
firebase.initializeApp({
  apiKey: "AIzaSyCdFutm-yVX-TWHi7norXn4AR3NXBX76Os",
  authDomain: "oreo-assistant.firebaseapp.com",
  databaseURL: "https://oreo-assistant-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "oreo-assistant",
  appId: "1:115483784294:web:a97f1ef037a7901ef6e9a7",
});

const messaging = firebase.messaging();

// จัดการ push ที่มาตอนแอปปิดอยู่ (background)
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {};
  self.registration.showNotification(title ?? "Oreo Status", {
    body: body ?? "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  });
});

// คลิก notification แล้วเปิดหน้าแอป
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/";
  event.waitUntil(clients.openWindow(targetUrl));
});