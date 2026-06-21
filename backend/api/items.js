// backend/api/items.js — cào DANH SÁCH ITEM Wild Rift (tên + icon THẬT) từ lolwildriftbuild.com.
// Mục: catalog item tự bám patch (item mới xuất hiện ngay, không cần sửa tay) + icon Wild Rift
// chính chủ thay cho icon LoL PC mượn tạm. Client map theo tên/slug, item lạ hết badge "NGOÀI DS".
// GET → { items:[{slug,name,icon,tier}], count, source, fetchedAt }
// Parse lỗi → items:[] (client tự dùng DB tĩnh + icon DDragon như cũ).

const SOURCE = "https://lolwildriftbuild.com/items/";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800"); // 24h, giữ bản cũ 7 ngày

  try {
    const r = await fetch(SOURCE, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (!r.ok) throw new Error(`Trang item trả ${r.status}`);
    const html = await r.text();

    // Mỗi item là 1 thẻ: <a class="item-data..." href=".../item/<slug>/"> ... <img ... title="Tên" data-lazy-src="ICON"> ...
    // Tách theo từng anchor item rồi rút title + icon (data-lazy-src là URL thật; src chỉ là placeholder lazy-load).
    const items = [];
    const seen = new Set();
    let tier = null;
    const tierRe = /<h[1-4][^>]*>([^<]{2,40})<\/h[1-4]>/g;
    const tierAt = []; // [pos, label] để gán tier theo heading đứng trước
    let tm;
    while ((tm = tierRe.exec(html))) tierAt.push([tm.index, tm[1].trim()]);

    const re = /<a class="item-data[^"]*"\s+href="[^"]*\/item\/([a-z0-9-]+)\/"[^>]*>([\s\S]*?)<\/a>/g;
    let m;
    while ((m = re.exec(html))) {
      const slug = m[1];
      if (seen.has(slug)) continue;
      const block = m[2];
      const title = (block.match(/\btitle="([^"]+)"/) || [])[1];
      const icon =
        (block.match(/data-lazy-src="([^"]+\.(?:png|jpg|jpeg|webp))"/) || [])[1] ||
        (block.match(/\bsrc="(https?:\/\/[^"]+\.(?:png|jpg|jpeg|webp))"/) || [])[1] ||
        null;
      if (!title) continue;
      seen.add(slug);
      // tier = heading gần nhất đứng trước anchor này
      for (const [pos, label] of tierAt) {
        if (pos < m.index) tier = label;
        else break;
      }
      items.push({ slug, name: title.trim(), icon, tier });
    }

    console.log(`[items] cào được ${items.length} item`);
    return res
      .status(200)
      .json({ items, count: items.length, source: SOURCE, fetchedAt: Date.now() });
  } catch (e) {
    console.error("[items] lỗi:", e);
    return res.status(200).json({ items: [], count: 0, error: String(e), source: SOURCE });
  }
}
