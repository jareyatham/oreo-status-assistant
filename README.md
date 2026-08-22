# Oreo Status Assistant

เว็บแอปแชร์สถานะส่วนตัว อัปเดตสถานะความว่างแบบเรียลไทม์ผ่านหน้า Controller (ส่วนควบคุม) และแชร์ลิงก์ Viewer (สำหรับดู) ให้คนใกล้ตัวเช็กได้ว่าคุณว่างอยู่หรือไม่ ไม่ต้องพิมพ์บอกเองว่า "ยุ่งอยู่" อีกต่อไป

พัฒนาเป็น PWA แบบ mobile-first พร้อมมาสคอตน้องหมา ระบบรีแอคชัน และมินิแชท ที่ซิงก์ข้อมูลแบบเรียลไทม์ผ่าน Firebase

---

## สารบัญ

- [ฟีเจอร์](#ฟีเจอร์)
- [Tech Stack](#tech-stack)
- [วิธีเริ่มใช้งาน](#วิธีเริ่มใช้งาน)
- [Build และ Deploy](#build-และ-deploy)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [ความปลอดภัย](#ความปลอดภัย)
- [เวอร์ชัน](#เวอร์ชัน)
- [License](#license)

---

## ฟีเจอร์

### ระบบสถานะ

- สถานะให้เลือก 5 แบบ (ประชุม / ยุ่ง / ว่าง / กำลังขับรถ / กำลังนอน) พร้อมสถานะกำหนดเอง
- สร้างข้อความสถานะอัตโนมัติจากสถานะ เวลาที่คาดว่าจะว่าง และโทนข้อความ (น่ารัก / มืออาชีพ / อัตโนมัติ)
- แก้ไขข้อความเองได้ (override) แทนข้อความอัตโนมัติ
- เลือกเวลาที่จะว่างในรูปแบบ 24 ชั่วโมง ไม่มีปัญหา AM/PM ของ browser

### มาสคอต

- แต่ละสถานะมี GIF หรือ Lottie มาสคอตเฉพาะ อยู่ในโฟลเดอร์ `public/mascot/`
- สถานะแบบกำหนดเองสามารถอัปโหลดรูปเอง (บีบอัดฝั่ง client สูงสุด 8MB) หรือค้นหา GIF จาก Giphy แล้วเลือกใช้

### หน้า Viewer (สาธารณะ ไม่ต้องล็อกอิน)

- โหลดเร็ว รองรับมือถือ โดยเฉพาะ iOS Safari
- แสดงมาสคอต สถานะ ข้อความ เวลาที่จะว่าง และเวลาอัปเดตล่าสุด
- Reaction: กด emoji เพื่อรีแอคได้ทันที มี animation ลอยขึ้น เจ้าของเห็นแบบเรียลไทม์
- Mini Chat: ส่งข้อความ รูปภาพ หรือ GIF ได้ มี rate limit กันสแปม และล้างอัตโนมัติเมื่อเจ้าของอัปเดตสถานะใหม่
- กดรูปหรือ GIF เพื่อดูแบบเต็มจอ (lightbox)

### หน้า Controller (ส่วนตัว)

- เลือกสถานะ เวลา และโทนข้อความ พร้อมดู preview ข้อความแบบเรียลไทม์และแก้ไขเองได้
- Reaction feed: ดูรีแอคชันทั้งหมดที่ได้รับ
- มี mini chat ฝั่งเจ้าของ
- เข้าถึงผ่าน URL ลับ

### ดีไซน์และ UX

- โทนสีเขียวสบายตา ดีไซน์แบบ glassmorphism และ animation ที่นุ่มนวล
- มี Dark mode พร้อมจำค่าที่เลือกไว้และรองรับการตั้งค่าของระบบ
- รองรับ PWA ติดตั้งลงมือถือได้และใช้งานแบบ offline ได้บางส่วน (app shell)

---

## Tech Stack

| ส่วนประกอบ | เทคโนโลยีที่ใช้ |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Firebase Realtime Database (แพ็กเกจฟรี Spark) |
| ไอคอน | lucide-react |
| ค้นหา GIF | Giphy API |
| PWA | vite-plugin-pwa |

หมายเหตุ: โปรเจกต์นี้ไม่ใช้ Firebase Storage เนื่องจากต้องอัปเกรดเป็นแพ็กเกจเสียเงิน รูปภาพและ GIF จะถูกบีบอัดแล้วเก็บเป็น data URL หรือลิงก์แทน

---

## วิธีเริ่มใช้งาน

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. ตั้งค่า Firebase

1. สร้างโปรเจกต์ใหม่ใน [Firebase Console](https://console.firebase.google.com)
2. เปิดใช้งาน Realtime Database
3. ไปที่ Project settings แล้วเพิ่ม Web app จากนั้นคัดลอกค่า config
4. คัดลอกไฟล์ตัวอย่าง env แล้วตั้งชื่อใหม่

```bash
cp .env.local.example .env.local
```

5. แก้ไขค่าในไฟล์ `.env.local`

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...

# รหัสลับสำหรับยืนยันสิทธิ์เขียนข้อมูลจาก Controller
VITE_CONTROLLER_SECRET=your_secret

# API key จาก Giphy สำหรับค้นหา GIF
VITE_GIPHY_API_KEY=your_giphy_api_key
```

ไฟล์ `.env.local` ถูก git-ignore ไว้แล้วโดยปริยาย ห้าม commit ค่าจริงขึ้น GitHub เด็ดขาด

### 3. ตั้งค่า Security Rules

ไปที่ Firebase Console เมนู Realtime Database แท็บ Rules แล้ววางเนื้อหาจากไฟล์ `firebase-database-rules.json` ในโปรเจกต์ จากนั้นแก้ไขค่า secret ในไฟล์ให้ตรงกับ `VITE_CONTROLLER_SECRET` ของคุณ แล้วกด Publish

### 4. เพิ่มไฟล์มาสคอต

วางไฟล์ GIF หรือ Lottie ไว้ในโฟลเดอร์ `public/mascot/` โดยตั้งชื่อไฟล์ให้ตรงกับที่กำหนดไว้ใน `src/constants/statusConfig.js` ดูรายละเอียดเพิ่มเติมได้ที่ `public/mascot/README.md`

### 5. รันเซิร์ฟเวอร์สำหรับพัฒนา

```bash
npm run dev
```

- `http://localhost:5173` สำหรับหน้า Viewer (สาธารณะ)
- `http://localhost:5173/control-xxxxxxx` สำหรับหน้า Controller (ส่วนตัว)

ควรเปลี่ยน path ของหน้า Controller ในไฟล์ `src/App.jsx` ให้เป็นข้อความที่เดายาก และไม่แชร์ URL นี้ให้ผู้อื่นทราบ เนื่องจากเป็นหน้าเดียวที่สามารถเขียนข้อมูลสถานะได้

### ทดสอบบนมือถือระหว่างพัฒนา

```bash
npm run dev -- --host
```

จากนั้นเปิด URL ที่แสดงในรูปแบบ IP address จากมือถือที่เชื่อมต่อ Wi-Fi เดียวกัน

---

## Build และ Deploy

```bash
npm run build
```

ก่อน build ให้ตรวจสอบว่าโฟลเดอร์ `public/icons/` มีไฟล์ครบทั้งสามไฟล์ตามที่อ้างอิงไว้ใน `vite.config.js`

- `icon-192.png`
- `icon-512.png`
- `icon-maskable-512.png`

Deploy โฟลเดอร์ `dist/` ไปยังผู้ให้บริการ hosting ที่รองรับ HTTPS เช่น Netlify หรือ Vercel และตั้งค่า environment variables ชุดเดียวกับใน `.env.local` ไว้บนแดชบอร์ดของผู้ให้บริการด้วย ไม่ใช่แค่ในเครื่องของตัวเอง

---

## โครงสร้างโปรเจกต์

```
src/
├── components/     Mascot, StatusBadge, TimePicker, MessagePreview,
│                   ReactionBar, ReactionFeed, ChatBox, ThemeToggle
├── pages/          ViewerPage (สาธารณะ), ControllerPage (ส่วนตัว)
├── lib/            firebase.js, statusStore.js, messageGenerator.js,
│                   reactionStore.js, chatStore.js, giphy.js
├── constants/      statusConfig.js, version.js
└── types/          โครงสร้างข้อมูล StatusData (JSDoc)
```

---

## ความปลอดภัย

โปรเจกต์นี้ออกแบบมาสำหรับการใช้งานส่วนตัว จึงเลือกใช้มาตรการความปลอดภัยแบบเรียบง่ายโดยตั้งใจ

- หน้า Controller ป้องกันด้วย URL ที่เดายากร่วมกับรหัสลับที่ตรวจสอบผ่าน Realtime Database rules ไม่ใช่ระบบยืนยันตัวตนแบบเต็มรูปแบบ
- หน้า Viewer เปิดให้เขียนข้อมูลได้ตามการออกแบบ (สำหรับ reaction และ chat) แต่จำกัดด้วยกฎ validation เช่น รายการ emoji ที่อนุญาต ความยาวข้อความสูงสุด และ cooldown การส่งฝั่ง client
- ไม่มีการเก็บข้อมูลส่วนตัวใด ๆ นอกเหนือจากที่ผู้ใช้พิมพ์หรืออัปโหลดเอง

หากนำโปรเจกต์นี้ไปใช้ต่อ ควรสร้าง Firebase project, API key และรหัสลับใหม่ทั้งหมดของตนเอง ไม่ควรใช้ค่าที่เคยปรากฏใน commit history เดิมซ้ำ

---

## เวอร์ชัน

เลขเวอร์ชันปัจจุบันแสดงเป็นตัวอักษรขนาดเล็กที่ด้านล่างของทั้งสองหน้า แก้ไขได้ที่ไฟล์ `src/constants/version.js` ก่อนปล่อยเวอร์ชันใหม่แต่ละครั้ง โดยยึดตามหลัก [Semantic Versioning](https://semver.org/)

---

## License

โปรเจกต์ส่วนตัว
