// backend/api/champbuild.js — cào BUILD THỰC TẾ của 1 tướng từ lolwildriftbuild.com.
// Mục: build tự bám patch (không cần sửa tay). Client map item slug → DB, fallback template offline.
// GET ?slug=zed → { slug, starting, boots, core, situational, source, fetchedAt }
// Parse lỗi → trả rỗng (client tự dùng template offline).

const BASE = "https://lolwildriftbuild.com/champion/";
const SECTION = { "starting-item": "starting", "boot-item": "boots", "core-item": "core", "main-item": "situational" };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800"); // 24h, giữ bản cũ 7 ngày

  const slug = String((req.query && req.query.slug) || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!slug) return res.status(400).json({ error: "Thiếu slug" });

  try {
    const r = await fetch(`${BASE}${slug}/`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (!r.ok) throw new Error(`Trang build trả ${r.status}`);
    const html = (await r.text()).replace(/<script[\s\S]*?<\/script>/g, " ");

    const out = { starting: [], boots: [], core: [], situational: [] };
    const re = /class="build-list ([a-z-]+)"([\s\S]*?)(?=class="build-list |class="runes-list|class="row|<footer|$)/g;
    let m;
    while ((m = re.exec(html))) {
      const key = SECTION[m[1]];
      if (!key) continue;
      const slugs = [...m[2].matchAll(/\/item\/([a-z0-9-]+)\//g)].map((x) => x[1]);
      out[key] = [...new Set(out[key].concat(slugs))];
    }
    // situational: bỏ món đã nằm trong core/boots cho gọn
    const used = new Set([...out.core, ...out.boots]);
    out.situational = out.situational.filter((s) => !used.has(s)).slice(0, 8);

    const ok = out.core.length || out.boots.length;
    console.log(`[champbuild] ${slug} core=${out.core.length} sit=${out.situational.length}`);
    return res.status(200).json({ slug, ...out, source: `${BASE}${slug}/`, fetchedAt: Date.now(), ok: !!ok });
  } catch (e) {
    console.error(`[champbuild] ${slug} lỗi:`, e);
    return res.status(200).json({ slug, starting: [], boots: [], core: [], situational: [], ok: false, error: String(e) });
  }
}
