const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export default function TimePicker({ value, onChange }) {
  // value เป็น string "HH:mm" เช่น "14:30" หรือ "" ถ้ายังไม่ได้เลือก
  const [hour = "", minute = ""] = value ? value.split(":") : [];

  function handleHourChange(newHour) {
    onChange(`${newHour}:${minute || "00"}`);
  }

  function handleMinuteChange(newMinute) {
    onChange(`${hour || "00"}:${newMinute}`);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink/70">เวลาที่คาดว่าจะว่าง</label>
      <div className="flex items-center gap-2">
        <select
          value={hour}
          onChange={(e) => handleHourChange(e.target.value)}
          className="glass-card px-3 py-2.5 text-ink outline-none focus:ring-2 focus:ring-primary/50 flex-1"
        >
          <option value="" disabled>
            ชม.
          </option>
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>

        <span className="text-ink/50 font-medium">:</span>

        <select
          value={minute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className="glass-card px-3 py-2.5 text-ink outline-none focus:ring-2 focus:ring-primary/50 flex-1"
        >
          <option value="" disabled>
            นาที
          </option>
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}