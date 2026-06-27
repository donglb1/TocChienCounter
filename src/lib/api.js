// src/lib/api.js
// Gọi backend serverless (giữ ANTHROPIC_API_KEY ở server, KHÔNG nhét key vào client).
//
// ⚠ SỬA BACKEND_URL thành URL Vercel của mày sau khi deploy backend/.
//    Chạy backend local thì để IP máy tính (vd http://192.168.1.10:3000),
//    KHÔNG dùng localhost (điện thoại không hiểu localhost của máy).

import { repairJson } from "./repairJson";
import { itemCatalogForDamage, findItemBySlug } from "../data/items";
import { CHAMPION_ALLOWLIST, findChampion, findChampionBySlug, championSlug, BUILD_LABELS } from "../data/champions";
import { KEYSTONE_CATALOG, MINOR_RUNE_CATALOG, SPELL_CATALOG } from "../data/runes";
import { setLiveItems, getLiveChampMeta } from "./liveData";
import { cachedResolve, getCached, setCached } from "./storage";

const ITEM_CATALOG_TTL = 24 * 60 * 60 * 1000; // 24h

const RANGE_LABEL = { xa: "tầm xa", can: "cận chiến" };
const SPIKE_LABEL = { som: "mạnh sớm", giua: "mạnh giữa trận", muon: "mạnh cuối trận" };

// Rút gọn đặc tính 1 tướng để gửi cho AI (grounding phân tích điểm mạnh/yếu + đồ lõi).
// Tướng lạ (không có trong DB) → chỉ gửi tên để model tự suy luận.
function champMeta(name) {
  const c = findChampion(name);
  if (!c) {
    // Tướng mới chưa có trong DB tĩnh → suy ra damageType/role từ DDragon (live) để AI có chỗ bám.
    const live = getLiveChampMeta(name);
    return live
      ? { name, dmg: live.dmg, role: live.role, unknown: true }
      : { name, unknown: true };
  }
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

// Đổi list slug item (từ build live) → tên item thật để AI đọc được. Slug lạ → bỏ.
function slugsToItemNames(slugs) {
  return (slugs || [])
    .map((s) => findItemBySlug(s, true)?.name) // curatedOnly → bỏ item LMHT-PC từ nguồn cào
    .filter(Boolean);
}

// Lấy build THỰC TẾ theo patch của tướng người chơi làm "mỏ neo" đồ lõi cho AI.
// Cào lỗi / chưa nạp catalog item → trả null (AI tự suy từ đặc tính như cũ). KHÔNG chặn phân tích.
async function fetchAnchorBuild(champName) {
  try {
    const slug = championSlug(champName);
    if (!slug) return null;
    const b = await fetchChampBuild(slug);
    if (!b || !b.ok) return null;
    const anchor = {
      core: slugsToItemNames(b.core),
      boots: slugsToItemNames(b.boots),
      situational: slugsToItemNames(b.situational),
    };
    return anchor.core.length || anchor.boots.length ? anchor : null;
  } catch (_) {
    return null;
  }
}

// Phân tích team địch → build + ngọc + phép khắc chế
export async function analyzeBuild({ champ, lane, enemies, laneOpponent }) {
  const meta = champMeta(champ); // đặc tính tướng người chơi (gồm damageType)
  const metaBuild = await fetchAnchorBuild(champ); // build chuẩn patch (mỏ neo đồ lõi)
  const res = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "analyze",
      champ,
      lane,
      enemies,
      laneOpponent: laneOpponent || null, // tướng đối lane trực tiếp (build sớm bám matchup)
      champMeta: meta,
      enemyMeta: (enemies || []).map(champMeta), // đặc tính từng tướng địch
      metaBuild, // build chuẩn patch hiện tại (cào live) → AI giữ làm gốc, chỉ đổi để khắc chế
      runes: KEYSTONE_CATALOG, // catalog ngọc chính
      minorRunes: MINOR_RUNE_CATALOG, // catalog ngọc phụ (4 nhánh) → AI gợi ý 3 ngọc phụ
      spells: SPELL_CATALOG, // catalog phép bổ trợ
      // Catalog item LỌC theo hệ sát thương tướng → bớt token, AI vẫn đủ item counter
      items: itemCatalogForDamage(meta?.dmg),
    }),
  });
  if (!res.ok) throw new Error(`Backend lỗi ${res.status}: ${await safeText(res)}`);
  const data = await res.json();
  const parsed = repairJson(data.text || "");
  if (!parsed) throw new Error("Không đọc được kết quả phân tích (JSON hỏng).");
  return parsed; // { teamProfile, build:[...], playstyle }
}

// Lấy tier list rồi map → { tên tướng (Anh): tier } để AI bám meta hiện tại.
// Cào lỗi → trả {} (AI gợi ý theo lý thuyết khắc chế như cũ). KHÔNG chặn gợi ý.
async function fetchMetaTiers() {
  try {
    const data = await fetchTierList();
    const out = {};
    for (const e of data.list || []) {
      const c = findChampionBySlug(e.slug) || findChampion(e.name);
      if (c && e.tier) out[c.name] = e.tier;
    }
    return out;
  } catch (_) {
    return {};
  }
}

// Gợi ý tướng nên chọn — xét cả đồng đội (allies) lẫn địch (enemies) theo đường
export async function suggestPicks({ lane, enemies, allies }) {
  const metaTiers = await fetchMetaTiers(); // tier meta hiện tại (cào live) → ưu tiên tướng đang mạnh
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
      metaTiers, // tier hiện tại từng tướng → bám meta thay vì chỉ lý thuyết
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
// Cache-first theo slug (24h): mở lại 1 tướng không gọi mạng nữa; chỉ cache build hợp lệ (ok).
export async function fetchChampBuild(slug) {
  const data = await cachedResolve(
    `champbuild:${slug}`,
    ITEM_CATALOG_TTL,
    async () => {
      const res = await fetch(`${BACKEND_URL}/api/champbuild?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json && json.ok ? json : null; // build rỗng/lỗi → giữ fallback, không cache
    }
  );
  return data || { slug, starting: [], boots: [], core: [], situational: [], ok: false };
}

const AI_BUILD_TTL = 7 * 24 * 60 * 60 * 1000; // 7 ngày: build chuẩn ít đổi

// Gọi backend champbuild 1 lần (không cache) → trả build đã parse, hoặc ném lỗi.
async function requestChampBuildAI(champName, lane) {
  const meta = champMeta(champName);
  const res = await fetch(`${BACKEND_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "champbuild",
      champ: champName,
      lane: lane || null,
      champMeta: meta,
      runes: KEYSTONE_CATALOG,
      spells: SPELL_CATALOG,
      items: itemCatalogForDamage(meta?.dmg),
    }),
  });
  if (!res.ok) throw new Error(`Backend lỗi ${res.status}: ${await safeText(res)}`);
  const data = await res.json();
  const parsed = repairJson(data.text || "");
  if (!parsed) throw new Error("Không đọc được build AI (JSON hỏng).");
  return parsed; // { boots, core:[], situational:[], keystone:{name,reason}, spells:[{name,reason}], playstyle }
}

// AI đề xuất BUILD CHUẨN cho 1 tướng (Thư viện) — thay nguồn cào lỗi. Chỉ chọn trong catalog curated.
// Cache 7 ngày theo tên tướng. force=true → bỏ qua cache, phân tích LẠI (nút "Phân tích lại").
export async function aiChampionBuild(champName, lane, force = false) {
  const key = `aibuild:${champName}`;
  if (force) {
    const fresh = await requestChampBuildAI(champName, lane);
    setCached(key, fresh);
    return fresh;
  }
  const cached = await cachedResolve(key, AI_BUILD_TTL, () => requestChampBuildAI(champName, lane));
  if (!cached) throw new Error("Không đọc được build AI (JSON hỏng).");
  return cached;
}

// Peek build AI đã cache (KHÔNG gọi mạng) → hiện sẵn nếu trước đó đã tạo. Chưa có → null.
export async function getCachedAiBuild(champName) {
  const c = await getCached(`aibuild:${champName}`);
  return c ? c.data : null;
}

// Nạp catalog item Wild Rift (tên + icon thật) từ backend → liveData. Gọi 1 lần lúc app mở.
// Cache-first: áp catalog đã lưu ngay (hiện icon/tên kể cả offline), chỉ fetch lại khi hết TTL.
// Lỗi mạng → giữ cache (nếu có) hoặc DB tĩnh + icon DDragon như cũ.
export async function resolveItemCatalog() {
  const data = await cachedResolve(
    "item-catalog",
    ITEM_CATALOG_TTL,
    async () => {
      const res = await fetch(`${BACKEND_URL}/api/items`);
      if (!res.ok) return null;
      const json = await res.json();
      const items = json.items || [];
      return items.length ? items : null; // rỗng → giữ cache cũ
    },
    setLiveItems
  );
  return Array.isArray(data) ? data.length : 0;
}

async function safeText(res) {
  try {
    return await res.text();
  } catch (_) {
    return "";
  }
}
