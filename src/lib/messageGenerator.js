/**
 * Template ข้อความต่อ status ต่อ mood
 * {time} จะถูกแทนที่ด้วยเวลาที่กรอกไว้ (ถ้ามี)
 */
const TEMPLATES = {
  meeting: {
    cute: "Oreo บอกว่า: เจ้านายกำลังประชุมอยู่นะ 🐶 ว่างประมาณ {time} โฮ่งๆ",
    professional: "ขณะนี้เจ้านายอยู่ระหว่างการประชุม คาดว่าจะว่างประมาณ {time}",
  },
  busy: {
    cute: "Oreo บอกว่า: ตอนนี้เจ้านายยุ่งๆ นิดนึงนะ 🐾 อีกสักพักจะกลับมาคุยด้วย โฮ่งๆ",
    professional: "ขณะนี้เจ้านายไม่สะดวก คาดว่าจะว่างประมาณ {time}",
  },
  available: {
    cute: "Oreo บอกว่า: เจ้านายว่างแล้ววว พร้อมคุยเลย 🐶💚 โฮ่งๆ",
    professional: "ขณะนี้เจ้านายว่าง สามารถติดต่อได้ทันที",
  },
  driving: {
    cute: "Oreo บอกว่า: เจ้านายกำลังนั่งรถอยู่ 🚗 เดี๋ยวถึงแล้วจะทักไปนะ โฮ่งๆ",
    professional: "ขณะนี้เจ้านายอยู่ระหว่างเดินทาง คาดว่าจะถึงประมาณ {time}",
  },
  sleeping: {
    cute: "Oreo บอกว่า: เจ้านายหลับปุ๋ยอยู่ ไว้ตื่นมาจะรีบทักกลับนะ โฮ่งๆ",
    professional: "ขณะนี้เจ้านายพักผ่อนอยู่ จะตอบกลับเมื่อสะดวก",
  },
};

const FALLBACK_TEMPLATE = {
  cute: "OreO บอกว่า: ตอนนี้เจ้านายกำลัง{customStatus}อยู่นะ 🐾 โฮ่งๆ",
  professional: "ขณะนี้เจ้านายกำลัง{customStatus} จะติดต่อกลับเมื่อสะดวก",
};

function formatTime(endTime) {
  if (!endTime) return "";
  return endTime;
}

/**
 * เลือก mood จริงเวลา mood === "auto"
 * ดึกๆ (22:00–06:00) → cute โทนอบอุ่น, กลางวัน → professional
 */
export function resolveAutoMood() {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 6 ? "cute" : "professional";
}

/**
 * @param {Object} params
 * @param {string} params.status
 * @param {string} [params.customStatus]
 * @param {string} [params.endTime] - "HH:mm"
 * @param {"cute"|"professional"|"auto"} params.mood
 * @returns {string} autoMessage
 */
export function generateMessage({ status, customStatus, endTime, mood }) {
  const resolvedMood = mood === "auto" ? resolveAutoMood() : mood;
  const time = formatTime(endTime);

  const templateSet = TEMPLATES[status] ?? FALLBACK_TEMPLATE;
  let text = templateSet[resolvedMood] ?? templateSet.cute;

  if (!TEMPLATES[status] && customStatus) {
    text = text.replace("{customStatus}", customStatus);
  }

  if (text.includes("{time}")) {
    text = time
      ? text.replace("{time}", time)
      : text.replace("ว่างประมาณ {time}", "").replace("ถึงประมาณ {time}", "").trim();
  }

  return text;
}

/**
 * Logic การเลือกข้อความสุดท้ายที่จะแสดง
 * @param {{ message?: string, autoMessage: string }} statusData
 */
export function resolveFinalMessage({ message, autoMessage }) {
  return message?.trim() ? message : autoMessage;
}
