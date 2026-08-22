const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY;
const BASE_URL = "https://api.giphy.com/v1/gifs";

/**
 * ค้นหา GIF จาก Giphy
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<Array<{ id: string, previewUrl: string, fullUrl: string }>>}
 */
export async function searchGifs(query, limit = 12) {
  if (!query.trim()) return [];

  const url = `${BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
    query
  )}&limit=${limit}&rating=g&lang=th`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("ค้นหา GIF ไม่สำเร็จ");

  const data = await res.json();
  return data.data.map((gif) => ({
    id: gif.id,
    previewUrl: gif.images.fixed_width_small.url, // ตัวอย่างเล็ก โหลดเร็วตอนค้นหา
    fullUrl: gif.images.fixed_height.url, // ตัวที่จะใช้จริงตอนแสดงผล ขนาดกำลังดี
  }));
}