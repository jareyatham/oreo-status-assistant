# 🐶 Oreo Status Assistant

เว็บแอปส่วนตัวสำหรับอัปเดตสถานะ real-time ให้คนอื่น (เช่นแฟน) เช็คได้ว่าตอนนี้ว่างไหม
โดยไม่ต้องส่งข้อความเองทุกครั้ง

## Tech Stack

- React (Vite) + Tailwind CSS
- Firebase Realtime Database
- PWA (installable บนมือถือ)

## เริ่มต้นใช้งาน

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า Firebase

1. สร้างโปรเจกต์ใหม่ที่ https://console.firebase.google.com
2. เปิดใช้งาน **Realtime Database** (Build > Realtime Database > Create Database)
3. ไปที่ Project settings > General > Your apps > เพิ่มเว็บแอป (</>) แล้ว copy config
4. คัดลอก `.env.local.example` เป็น `.env.local` แล้วใส่ค่าที่ได้:

```bash
cp .env.local.example .env.local
```

5. ตั้ง `VITE_CONTROLLER_SECRET` เป็น string สุ่มยาวๆ ของตัวเอง (ใช้ยืนยันสิทธิ์เขียนข้อมูล)

### 3. ตั้ง Security Rules

ไปที่ Realtime Database > Rules ในคอนโซล Firebase แล้ววางเนื้อหาจาก
`firebase-database-rules.json` ในโปรเจกต์นี้ — **อย่าลืมแก้**
`YOUR_SECRET_TOKEN_HERE` ให้ตรงกับค่าที่ตั้งใน `.env.local`

### 4. ใส่ Mascot Assets

วางไฟล์ GIF/Lottie ของหมา Oreo ใน `public/mascot/` — ดูรายละเอียดใน
`public/mascot/README.md`

### 5. รันเซิร์ฟเวอร์ dev

```bash
npm run dev
```

เปิด `http://localhost:5173` → Viewer Page (public)
เปิด `http://localhost:5173/control-xyz123` → Controller Page (private)

> ⚠️ **สำคัญ:** เปลี่ยน path `/control-xyz123` ใน `src/App.jsx` เป็นคำที่เดายากๆ
> ของตัวเอง แล้วอย่าแชร์ path นี้ให้ใครนอกจากตัวเอง เพราะเป็นหน้าเดียวที่
> เขียนข้อมูลได้

### ทดสอบบนมือถือจริงระหว่าง dev

```bash
npm run dev -- --host
```

แล้วเปิด URL แบบ `http://192.168.x.x:5173` จากมือถือในวง Wi-Fi เดียวกัน

## Build & Deploy

```bash
npm run build
```

ก่อน build ต้องมีไอคอนใน `public/icons/` (ดู `public/icons/README.md`)
เพราะ PWA manifest อ้างอิงไฟล์เหล่านี้

แนะนำ deploy ผ่าน **Vercel** หรือ **Netlify** (free tier พอ, auto HTTPS
ซึ่งจำเป็นสำหรับ PWA):

```bash
npm install -g vercel
vercel --prod
```

**อย่าลืม** ตั้งค่า Environment Variables (`VITE_FIREBASE_*`,
`VITE_CONTROLLER_SECRET`) ในหน้า project settings ของ Vercel/Netlify ด้วย
ไม่ใช่แค่ใน `.env.local` ที่เครื่องตัวเอง

## โครงสร้างโปรเจกต์

```
src/
├── components/       # Mascot, StatusBadge, TimePicker, MessagePreview
├── pages/            # ViewerPage (public), ControllerPage (private)
├── lib/              # firebase.js, statusStore.js, messageGenerator.js
├── constants/        # statusConfig.js — จุดเดียวที่ผูก status → emoji/mascot
└── types/            # StatusData shape (JSDoc)
```

## Mascot Assets

ไฟล์ GIF ควร compress ก่อนใช้งานจริง (แนะนำ < 200KB ต่อไฟล์):

```bash
npm install -g gifsicle
gifsicle -O3 --lossy=80 --colors 128 input.gif -o public/mascot/meeting.gif
```

หาไฟล์ได้จาก LottieFiles.com (Lottie, ไฟล์เล็ก, ลื่นกว่า) หรือ Giphy/Tenor
(GIF, หาง่ายกว่า) — โค้ดรองรับทั้งสองแบบพร้อมกัน

## License

Personal project — ใช้และแก้ไขได้ตามต้องการ
