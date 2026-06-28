// scripts/check-wr-items.mjs
// Đối chiếu DB trang bị tĩnh (src/data/items.js) với CATALOG ITEM WILD RIFT THẬT
// (backend /api/items → cào lolwildriftbuild.com). In ra món nào trong DB tĩnh KHÔNG
// khớp tên với catalog live (nghi không tồn tại / sai tên trong Tốc Chiến).
//
// Chạy ở MÁY có mạng (sandbox bị chặn egress):
//   node scripts/check-wr-items.mjs
//   node scripts/check-wr-items.mjs https://tocchiencounter.vercel.app   # đổi backend
//
// Lưu ý: chỉ so theo TÊN ANH (catalog live chỉ có tên Anh). Khớp lỏng theo nameKey
// (bỏ dấu/ký tự đặc biệt) để không báo nhầm do dấu nháy/khoảng trắng.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND = process.argv[2] || "https://tocchiencounter.vercel.app";

// Chuẩn hóa tên giống theme.nameKey: bỏ dấu + chỉ giữ chữ/số thường.
function nameKey(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Alias web ↔ DB (web bỏ chữ "s"…). Đồng bộ với ITEM_SLUG_ALIAS trong items.js.
const KNOWN_ALIAS = {
  "mercurystreads": "mercurytreads", // Mercury's Treads ↔ Mercury Treads
};

function readStaticItems() {
  const src = fs.readFileSync(path.join(__dirname, "..", "src", "data", "items.js"), "utf8");
  const re = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*vi:\s*"([^"]+)",\s*type:\s*"([^"]+)"/g;
  const rows = [];
  let m;
  while ((m = re.exec(src))) rows.push({ id: m[1], name: m[2], vi: m[3], type: m[4] });
  return rows;
}

async function main() {
  const staticItems = readStaticItems();
  console.log(`DB tĩnh: ${staticItems.length} món\n`);

  const url = `${BACKEND.replace(/\/$/, "")}/api/items`;
  console.log(`Đang lấy catalog live: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Backend trả ${res.status}`);
  const data = await res.json();
  const live = data.items || [];
  if (!live.length) throw new Error(`Catalog live rỗng (lỗi cào?): ${data.error || "không rõ"}`);
  console.log(`Catalog live: ${live.length} món\n`);

  const liveKeys = new Set(live.map((i) => nameKey(i.name)));

  const missing = staticItems.filter((it) => {
    const k = nameKey(it.name);
    return !liveKeys.has(k) && !liveKeys.has(KNOWN_ALIAS[k]);
  });

  if (!missing.length) {
    console.log("✅ TẤT CẢ item trong DB tĩnh đều khớp catalog Wild Rift live. Không có món lạ.");
    return;
  }

  console.log(`⚠️  ${missing.length} món KHÔNG khớp catalog live (kiểm tra lại tên / có thể không tồn tại trong Tốc Chiến):\n`);
  for (const it of missing) {
    console.log(`  - ${it.name}  (${it.vi})  [${it.type}]  id=${it.id}`);
  }
  console.log("\nGợi ý: tên có thể bị sai chính tả, hoặc món đã bị xoá khỏi Wild Rift, hoặc web nguồn ghi tên khác.");
}

main().catch((e) => {
  console.error("Lỗi:", e.message);
  process.exit(1);
});
