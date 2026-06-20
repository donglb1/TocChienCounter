// backend/api/news.js — Vercel serverless function
// Cào tin tức Tốc Chiến từ trang chính thức (tiếng Việt) và trả JSON sạch cho client.
//
// CÁCH HOẠT ĐỘNG (vì sao bền):
// - Trang wildrift.leagueoflegends.com nhúng sẵn toàn bộ dữ liệu trong <script id="__NEXT_DATA__">
//   (Next.js). Ta parse JSON đó thay vì cào HTML hiển thị → chỉ vỡ khi Riot đổi cấu trúc DỮ LIỆU
//   (hiếm), không vỡ khi họ đổi CSS/giao diện.
// - Tự dò mảng bài viết (không hardcode vị trí blade) → chịu được khi Riot thêm/bớt khối trang.
// - Parse lỗi → trả 200 với list rỗng + link dự phòng (KHÔNG 500) để app vẫn chạy mượt.

const NEWS_PAGE = "https://wildrift.leagueoflegends.com/vi-vn/news/";
const SITE_BASE = "https://wildrift.leagueoflegends.com";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Tin đăng thường xuyên hơn patch → cache CDN 3h, giữ bản cũ 1 ngày nếu nguồn lỗi
  res.setHeader("Cache-Control", "s-maxage=10800, stale-while-revalidate=86400");

  try {
    const r = await fetch(NEWS_PAGE, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "vi-VN,vi" },
    });
    if (!r.ok) throw new Error(`Trang tin trả ${r.status}`);
    const html = await r.text();

    const news = parseNews(html);
    const patch = detectPatch(news);
    console.log(`[news] OK count=${news.length} patch=${patch}`);
    return res.status(200).json({ news, patch, fallbackUrl: NEWS_PAGE });
  } catch (e) {
    console.error("[news] Lỗi:", e);
    // Degrade mềm: app hiện link mở trang chính thức thay vì màn hình lỗi
    return res.status(200).json({ news: [], patch: null, fallbackUrl: NEWS_PAGE, error: String(e) });
  }
}

// Lấy số patch hiện tại từ tin Patch Notes mới nhất (vd "7.1f"). news đã sắp xếp mới→cũ.
function detectPatch(news) {
  for (const n of news || []) {
    const t = n.title || "";
    if (/patch notes|bản cập nhật|thông tin bản|phiên bản/i.test(t)) {
      const m = t.match(/(\d+\.\d+[a-z]?)/i);
      if (m) return m[1];
    }
  }
  return null;
}

function parseNews(html) {
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!m) return [];

  const data = JSON.parse(m[1]);
  const blades = data?.props?.pageProps?.page?.blades || [];

  // Tự dò khối có items là bài viết (title + action + publishedAt)
  let items = [];
  for (const b of blades) {
    const arr = b?.items;
    if (
      Array.isArray(arr) &&
      arr.length &&
      arr[0]?.title &&
      arr[0]?.action &&
      arr[0]?.publishedAt
    ) {
      items = arr;
      break;
    }
  }

  return items
    .map((it) => {
      let url = it.action?.payload?.url || "";
      if (url.startsWith("/")) url = SITE_BASE + url;
      return {
        title: it.title || "",
        url,
        image: thumb(it.media?.url || it.imageMedia?.url || null),
        category: classify(it, url),
        description: stripHtml(it.description?.body || ""),
        publishedAt: it.publishedAt || null,
      };
    })
    .filter((n) => n.title && n.url)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 30);
}

// Riot gắn ~85% tin là "game_updates" (quá chung). Tự suy nhãn cụ thể hơn từ tiêu đề/slug.
// Nếu Riot đã gắn category KHÁC game_updates (Thông báo/Esports/Cộng đồng…) thì giữ nguyên.
function classify(it, url) {
  const title = (it.title || "").toLowerCase();
  const slug = (url || "").toLowerCase();
  const cat = it.category?.title || "";
  const machine = it.category?.machineName || "";
  const isYoutube = /youtube\.com|youtu\.be/.test(slug);

  if (machine && machine !== "game_updates" && cat) return cat;

  if (/patch notes|bản cập nhật|thông tin bản|cập nhật \d/.test(title) || /patch-notes/.test(slug))
    return "Cập nhật";
  if (/tổng quan tướng|tướng mới|champion|spotlight|hé lộ tướng/.test(title)) return "Tướng mới";
  if (/esports|smash|chung kết|giải đấu|championship|icon series|vô địch/.test(title)) return "Esports";
  if (/trang phục|skin|tinh hoa|huyền thoại|chí tôn/.test(title)) return "Trang phục";
  if (/sự kiện|lễ hội|event|chuỗi|đua top|thử thách/.test(title)) return "Sự kiện";
  if (/đối tác|cộng đồng|sáng tạo|nhà sáng tạo/.test(title)) return "Cộng đồng";
  if (isYoutube) return "Video";
  return cat || "Tin tức";
}

// Ảnh host trên Sanity CDN (cmsassets.rgpub.io) — ép rộng 640px cho nhẹ trên mobile
function thumb(url) {
  if (!url) return null;
  if (!url.includes("cmsassets.rgpub.io")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}w=640&auto=format`;
}

function stripHtml(s) {
  return String(s)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}
