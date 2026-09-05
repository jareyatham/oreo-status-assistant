import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

if ("serviceWorker" in navigator) {
  import("virtual:pwa-register")
    .then(({ registerSW }) => {
      registerSW({
        onNeedRefresh() {
          // ไม่ทำอะไรอัตโนมัติ ปล่อยให้ผู้ใช้กด refresh เองตามปกติเมื่อสะดวก
          console.log("มีเวอร์ชันใหม่พร้อมใช้งาน จะอัปเดตในครั้งถัดไปที่เปิดแอป");
        },
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
