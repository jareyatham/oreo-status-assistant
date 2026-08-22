export default function MessagePreview({ autoMessage, customMessage, onCustomChange }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div>
        <p className="text-sm font-medium text-ink/70 mb-1.5">Auto-generated message (preview)</p>
        <div className="glass-card px-4 py-3 text-sm text-ink/80 italic">{autoMessage}</div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink/70 mb-1.5 block">
          Custom message (optional)
        </label>
        <textarea
          value={customMessage}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="เว้นว่างถ้าต้องการใช้ข้อความอัตโนมัติ"
          rows={3}
          className="w-full glass-card px-4 py-2.5 text-ink outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>
    </div>
  );
}