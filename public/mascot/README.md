# Mascot Assets

วางไฟล์ GIF หรือ Lottie JSON ของ Oreo ที่นี่ ตามชื่อที่ผูกไว้ใน
`src/constants/statusConfig.js`:

- meeting.gif
- busy.gif
- available.gif
- driving.gif
- sleeping.gif

โปรเจกต์นี้ยังไม่ได้แนบไฟล์ภาพจริงมาให้ (ต้องหา/วาด/จ้างทำเอง) —
ดูวิธีหาไฟล์และ compress ได้ใน README.md หลักของโปรเจกต์ หัวข้อ
"Mascot Assets"

ถ้าอยากใช้ Lottie แทน GIF ในบาง status ให้เปลี่ยนนามสกุลใน
statusConfig.js เป็น `.json` — โค้ดใน `Mascot.jsx` รองรับทั้งสองแบบอยู่แล้ว
