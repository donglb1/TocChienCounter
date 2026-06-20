// src/lib/api.js
// Gọi backend serverless (giữ ANTHROPIC_API_KEY ở server, KHÔNG nhét key vào client).
//
// ⚠ SỬA BACKEND_URL thành URL Vercel của mày sau khi deploy backend/.
//    Chạy backend local thì để IP máy tính (vd http://192.168.1.10:3000),
//    KHÔNG dùng localhost (điện thoại không hiểu localhost của máy).

import { repairJson } from "./repairJson";
import { ITEM_ALLOWLIST } from "../data/items";

export const BACKEND_URL = "https://vercel.com/dong-lb-1/tocchiencounter/J12xeoNfr3K22vQVi84kuJSqeEpWhttps://vercel.com/dong-lb-1/tocchiencounter/FBxi9VQkQaCBwwHDeDcHWXK5YxdP";

// Đọc ảnh team địch → trả danh sách tướng (JSON có cấu trúc)
export async function extractChampions({ imageBase64, mediaType, champ, lane }) {
  const res = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "extract",
      imageBase64,
      mediaType: mediaType || "image/jpeg",
      champ,
      lane,
    }),
  });
  if (!res.ok) throw new Error(`Backend lỗi ${res.status}: ${await safeText(res)}`);
  const data = await res.json();
  const parsed = repairJson(data.text || "");
  if (!parsed) throw new Error("Không đọc được kết quả nhận diện (JSON hỏng).");
  return parsed; // { userTeam, enemyChampions:[{name,displayName,confidence}], allyChampions, overallConfidence, notes }
}

// Phân tích team địch → build khắc chế từng bước
export async function analyzeBuild({ champ, lane, enemies }) {
  const res = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "analyze",
      champ,
      lane,
      enemies,
      allowlist: ITEM_ALLOWLIST, // ép model chỉ chọn item thật
    }),
  });
  if (!res.ok) throw new Error(`Backend lỗi ${res.status}: ${await safeText(res)}`);
  const data = await res.json();
  const parsed = repairJson(data.text || "");
  if (!parsed) throw new Error("Không đọc được kết quả phân tích (JSON hỏng).");
  return parsed; // { teamProfile, build:[...], playstyle }
}

async function safeText(res) {
  try {
    return await res.text();
  } catch (_) {
    return "";
  }
}
