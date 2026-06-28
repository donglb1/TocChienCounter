// backend/api/wrstats.js — cào SỐ LIỆU META Wild Rift (win/pick/ban rate) từ op.gg để
// xếp hạng tướng NÊN CẤM theo dữ liệu thật thay vì chữ tier.
//
// op.gg là Next.js → dữ liệu nhúng sẵn trong <script id="__NEXT_DATA__">. Ta fetch HTML,
// parse JSON đó rồi DÒ ĐỆ QUY mảng tướng có win/pick/ban rate (bền với thay đổi cấu trúc;
// không cần chạy JS). Lỗi/đổi cấu trúc → trả list rỗng để client tự fallback tier list.
//
// GET → { list:[{name, lane, winRate, pickRate, banRate}], patch, source, fetchedAt }

// Thử lần lượt vài URL op.gg WR (đường dẫn có thể đổi giữa các phiên bản site).
const CANDIDATES = [
  "https://op.gg/wildrift/tiers",
  "https://www.op.gg/wildrift/tiers",
  "https://op.gg/wildrift/statistics/champions",
  "https://www.op.gg/wildrift/statistics/champions",
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  // Meta đổi theo patch (~2 tuần) nhưng số liệu cập nhật hằng ngày → cache 6h, giữ bản cũ 1 ngày.
  res.setHeader("Cache-Control", "s-maxage=21600, stale-while-revalidate=86400");

  for (const url of CANDIDATES) {
    try {
      const r = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      if (!r.ok) continue;
      const html = await r.text();
      const data = extractNextData(html);
      if (!data) continue;
      const list = findChampStats(data);
      if (list.length >= 10) {
        const patch = findPatch(data) || findPatchInHtml(html);
        console.log(`[wrstats] OK count=${list.length} patch=${patch} src=${url}`);
        return res.status(200).json({ list, patch, source: url, fetchedAt: Date.now() });
      }
    } catch (e) {
      console.error(`[wrstats] lỗi ${url}:`, e.message);
    }
  }
  return res.status(200).json({ list: [], patch: null, source: CANDIDATES[0], error: "Không cào được op.gg" });
}

// ─── Helpers ───
function extractNextData(html) {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch (_) {
    return null;
  }
}

function num(v) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && isFinite(n) ? n : null;
}
// Chuẩn hóa tỉ lệ về 0–100 (nguồn có thể để 0–1 hoặc 0–100).
function pct(v) {
  let n = num(v);
  if (n == null) return null;
  if (n > 0 && n <= 1) n *= 100;
  return Math.round(n * 10) / 10;
}

function pickField(obj, regexes) {
  for (const k of Object.keys(obj)) {
    if (regexes.some((re) => re.test(k))) return obj[k];
  }
  return undefined;
}

// 1 object → entry tướng nếu có ≥1 chỉ số win/pick/ban + tên. Không khớp → null.
function asEntry(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const winRaw = pickField(o, [/^win_?rate$/i, /winrate/i]);
  const banRaw = pickField(o, [/^ban_?rate$/i, /banrate/i]);
  const pickRaw = pickField(o, [/^pick_?rate$/i, /pickrate/i]);
  if (winRaw == null && banRaw == null && pickRaw == null) return null;

  let name = pickField(o, [/^name$/i, /champion_?name/i, /^title$/i]);
  if (name && typeof name === "object") name = name.name || name.en || name.en_US || null;
  if (!name) {
    const champ = pickField(o, [/^champion$/i]);
    if (champ && typeof champ === "object") name = champ.name || champ.en_name || champ.key || null;
  }
  if (!name || typeof name !== "string") return null;

  let lane = pickField(o, [/^position$/i, /^lane$/i, /^role$/i]);
  if (lane && typeof lane === "object") lane = lane.name || lane.key || null;

  const e = {
    name: name.trim(),
    lane: typeof lane === "string" ? lane : null,
    winRate: pct(winRaw),
    pickRate: pct(pickRaw),
    banRate: pct(banRaw),
  };
  return e.winRate != null || e.banRate != null || e.pickRate != null ? e : null;
}

// Dò đệ quy: chọn MẢNG nào phần lớn phần tử là entry tướng (và dài nhất).
function findChampStats(root) {
  let best = [];
  (function walk(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      const mapped = node.map(asEntry).filter(Boolean);
      if (mapped.length >= 10 && mapped.length >= node.length * 0.5 && mapped.length > best.length) {
        best = mapped;
      }
      for (const v of node) walk(v);
    } else {
      for (const k of Object.keys(node)) walk(node[k]);
    }
  })(root);

  const seen = new Set();
  const out = [];
  for (const e of best) {
    const key = e.name + "|" + (e.lane || "");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

function findPatch(root) {
  let found = null;
  (function walk(n) {
    if (found || !n || typeof n !== "object") return;
    for (const k of Object.keys(n)) {
      const v = n[k];
      if (/version|patch/i.test(k) && typeof v === "string" && /^\d+(\.\d+)+/.test(v)) {
        found = v;
        return;
      }
      if (v && typeof v === "object") walk(v);
    }
  })(root);
  return found;
}

function findPatchInHtml(html) {
  const m = html.match(/(?:patch|version)[^0-9]{0,12}(\d+\.\d+[a-z]?)/i);
  return m ? m[1] : null;
}
