// backend/api/tierlist.js — cào tier list Tốc Chiến từ lolwildriftbuild.com.
// Cấu trúc: mỗi <div class="tier-group"> có <h3> tier (S+/S/A+/A/B/C) + danh sách
//   <a class="characters-item" data-lane="..." href=".../champion/SLUG/"> ... alt="Tên".
// Trả slug + tier CAO NHẤT mỗi tướng + các lane. Client map slug → DB tướng.
// Parse lỗi → trả list rỗng (không 500) để app vẫn chạy.

const TIER_URL = "https://lolwildriftbuild.com/tier-list/";
const TIER_ORDER = ["S+", "S", "A+", "A", "B", "C", "D"];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  // Tier list chỉ đổi theo patch (~2 tuần/lần) → cache CDN 24h, giữ bản cũ 7 ngày nếu nguồn lỗi
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");

  try {
    const r = await fetch(TIER_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (!r.ok) throw new Error(`Trang tier trả ${r.status}`);
    const html = await r.text();
    const list = parseTiers(html);
    console.log(`[tierlist] OK count=${list.length}`);
    return res.status(200).json({ list, order: TIER_ORDER, source: TIER_URL, fetchedAt: Date.now() });
  } catch (e) {
    console.error("[tierlist] Lỗi:", e);
    return res.status(200).json({ list: [], order: TIER_ORDER, source: TIER_URL, error: String(e) });
  }
}

function parseTiers(html) {
  const re = /<div class="characters-category[^"]*"><h3>([^<]+)<\/h3><\/div>\s*<div class="characters-list">([\s\S]*?)<\/div>\s*(?=<div class="tier-group">|<div class="characters-category|<\/div>)/g;
  const best = {}; // slug → { slug, name, tier, lanes:Set }
  let m;
  while ((m = re.exec(html))) {
    const tier = m[1].trim();
    if (!TIER_ORDER.includes(tier)) continue;
    const items = m[2].split('<a class="characters-item');
    for (const raw of items) {
      const lane = (raw.match(/data-lane="([^"]*)"/) || [])[1] || "";
      const slug = (raw.match(/\/champion\/([a-z0-9-]+)\//) || [])[1];
      if (!slug) continue;
      const name = (raw.match(/class="character-icon"[^>]*alt="([^"]+)"/) || [])[1] || slug;
      const cur = best[slug];
      if (!cur || TIER_ORDER.indexOf(tier) < TIER_ORDER.indexOf(cur.tier)) {
        best[slug] = { slug, name, tier, lanes: new Set(cur ? cur.lanes : []) };
      }
      if (lane) best[slug].lanes.add(lane);
    }
  }
  return Object.values(best)
    .map((c) => ({ slug: c.slug, name: c.name, tier: c.tier, lanes: [...c.lanes] }))
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
}
