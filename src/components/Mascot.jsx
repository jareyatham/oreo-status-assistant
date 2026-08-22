import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { STATUS_CONFIG } from "../constants/statusConfig";
import { ImagePlus } from "lucide-react";

function isLottieFile(filename) {
  return filename?.endsWith(".json");
}

export default function Mascot({ status, customStatus, customImageBase64 }) {
  const config = STATUS_CONFIG[status];
  const isCustomStatus = !config; // ไม่เจอใน STATUS_CONFIG แปลว่าเป็นสถานะกำหนดเอง
  const mascotFile = config?.mascot;
  const isLottie = !isCustomStatus && isLottieFile(mascotFile);

  const [lottieData, setLottieData] = useState(null);

  useEffect(() => {
    if (!isLottie) {
      setLottieData(null);
      return;
    }
    let cancelled = false;
    fetch(`/mascot/${mascotFile}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setLottieData(data);
      })
      .catch((err) => console.error("โหลด Lottie ไม่สำเร็จ:", err));
    return () => {
      cancelled = true;
    };
  }, [mascotFile, isLottie]);

  return (
    <div className="w-40 h-40 rounded-2xl glass-card flex items-center justify-center overflow-hidden">
      {isCustomStatus ? (
        // สถานะกำหนดเอง — ใช้รูปที่ user อัปโหลด ถ้ายังไม่มีโชว์ placeholder
        customImageBase64 ? (
          <img
            src={customImageBase64}
            alt={customStatus ?? "Oreo"}
            className="w-full h-full object-cover animate-[fadeIn_0.4s_ease-out]"
          />
        ) : (
          <span className="text-5xl">✨</span>
        )
      ) : isLottie ? (
        lottieData ? (
          <Lottie animationData={lottieData} loop autoplay className="w-full h-full" />
        ) : (
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        )
      ) : (
        // สถานะหลัก 5 อัน — ใช้ GIF ที่ fix ไว้ใน public/mascot เสมอ
        <img
          src={`/mascot/${mascotFile}`}
          alt={config.label}
          className="w-full h-full object-contain animate-[fadeIn_0.4s_ease-out]"
          key={mascotFile}
        />
      )}
    </div>
  );
}