// src/lib/api.js
// Gọi backend serverless (giữ ANTHROPIC_API_KEY ở server, KHÔNG nhét key vào client).
//
// ⚠ SỬA BACKEND_URL thành URL Vercel của mày sau khi deploy backend/.
//    Chạy backend local thì để IP máy tính (vd http://192.168.1.10:3000),
//    KHÔNG dùng localhost (điện thoại không hiểu localhost của máy).

import { repairJson } from "./repairJson";
import { ITEM_CATALOG } from "../data/items";
import { CHAMPION_ALLOWLIST, findChampion, BUILD_LABELS } from "../data/champions";
import { KEYSTONE_CATALOG, SPELL_CATALOG } from "../data/runes";

const RANGE_LABEL = { xa: "tầm xa", can: "cận chiến" };
const SPIKE_LABEL = { som: "mạnh sớm", giua: "mạnh giữa trận", muon: "mạnh cuối trận" };

// Rút gọn đặc tính 1 tướng để gửi cho AI (grounding phân tích điểm mạnh/yếu + đồ lõi).
// Tướng lạ (không có trong DB) → chỉ gửi tên để model tự suy luận.
function champMeta(name) {
  const c = findChampion(name);
  if (!c) return { name, unknown: true };
  return {
    name: c.name,
    vi: c.vi,
    dmg: c.damageType, // AD | AP | mixed
    role: c.role,
    burst: !!c.burst,
    cc: c.cc, // none | low | medium | high
    healing: !!c.healing,
    build: BUILD_LABELS[c.build] || null, // cách lên đồ đặc trưng
    range: RANGE_LABEL[c.range] || null,
    spike: SPIKE_LABEL[c.spike] || null,
  };
}

// ⚠ Đây là NGUỒN DUY NHẤT của URL backend. Đổi 1 lần ở đây, cả app dùng chung.
//    Production trên Vercel cố định, KHÔNG đổi giữa các lần `vercel --prod`.
export const BACKEND_URL = "https://tocchiencounter.vercel.app";

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

// Phân tích team địch → build + ngọc + phép khắc chế
export async function analyzeBuild({ champ, lane, enemies, laneOpponent }) {
  const res = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "analyze",
      champ,
      lane,
      enemies,
      laneOpponent: laneOpponent || null, // tướng đối lane trực tiếp (build sớm bám matchup)
      champMeta: champMeta(champ), // đặc tính tướng người chơi
      enemyMeta: (enemies || []).map(champMeta), // đặc tính từng tướng địch
      runes: KEYSTONE_CATALOG, // catalog ngọc + khi nào dùng
      spells: SPELL_CATALOG, // catalog phép bổ trợ + khi nào dùng
      items: ITEM_CATALOG, // catalog item kèm thuộc tính → AD chọn dựa dữ liệu
    }),
  });
  if (!res.ok) throw new Error(`Backend lỗi ${res.status}: ${await safeText(res)}`);
  const data = await res.json();
  const parsed = repairJson(data.text || "");
  if (!parsed) throw new Error("Không đọc được kết quả phân tích (JSON hỏng).");
  return parsed; // { teamProfile, build:[...], playstyle }
}

// Gợi ý tướng nên chọn — xét cả đồng đội (allies) lẫn địch (enemies) theo đường
export async function suggestPicks({ lane, enemies, allies }) {
  const res = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "suggest",
      lane,
      enemies,
      allies,
      allyMeta: (allies || []).map(champMeta), // đặc tính đồng đội → bù vai trò
      enemyMeta: (enemies || []).map(champMeta), // đặc tính địch → chọn khắc chế
      allowlist: CHAMPION_ALLOWLIST, // ép model chỉ gợi ý tướng thật
    }),
  });
  if (!res.ok) throw new Error(`Backend lỗi ${res.status}: ${await safeText(res)}`);
  const data = await res.json();
  const parsed = repairJson(data.text || "");
  if (!parsed) throw new Error("Không đọc được kết quả gợi ý (JSON hỏng).");
  return parsed; // { picks:[{name,tier,counters,reason}], summary }
}

// Lấy tin tức Tốc Chiến (cào từ trang chính thức qua backend)
export async function fetchNews() {
  const res = await fetch(`${BACKEND_URL}/api/news`);
  if (!res.ok) throw new Error(`Backend lỗi ${res.status}: ${await safeText(res)}`);
  const data = await res.json();
  return data; // { news:[{title,url,image,category,description,publishedAt}], fallbackUrl }
}

// Lấy tier list (cào từ web qua backend)
export async function fetchTierList() {
  const res = await fetch(`${BACKEND_URL}/api/tierlist`);
  if (!res.ok) throw new Error(`Backend lỗi ${res.status}: ${await safeText(res)}`);
  const data = await res.json();
  return data; // { list:[{slug,name,tier,lanes}], order, source, fetchedAt }
}

// Lấy build THỰC TẾ theo patch của 1 tướng (cào qua backend). Lỗi → ok:false để client fallback.
export async function fetchChampBuild(slug) {
  const res = await fetch(`${BACKEND_URL}/api/champbuild?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`Backend lỗi ${res.status}`);
  return await res.json(); // { slug, starting, boots, core, situational, ok, source }
}

async function safeText(res) {
  try {
    return await res.text();
  } catch (_) {
    return "";
  }
}
