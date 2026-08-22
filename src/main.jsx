import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// PWA auto-update prompt (ทำงานเฉพาะตอน build production)
if ("serviceWorker" in navigator) {
  import("virtual:pwa-register")
    .then(({ registerSW }) => {
      registerSW({
        onNeedRefresh() {
          if (confirm("มีเวอร์ชันใหม่ของ Oreo Status พร้อมใช้งาน — รีเฟรชเลยไหม?")) {
            window.location.reload();
          }
        },
        immediate: true,
      });
    })
    .catch(() => {
      // ไม่มี service worker ตอน dev mode — ข้ามไปเงียบๆ
    });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
