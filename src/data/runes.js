// src/data/runes.js
// DB Ngọc Bổ Trợ (Keystone) + Phép Bổ Trợ cho gợi ý counter.
// ⚠ Tên tiếng Việt của NGỌC có thể lệch chút so với client (Riot đổi localize theo bản).
//   Mục đích chính là để AI chọn ĐÚNG HƯỚNG ngọc/phép; tên hiển thị có thể soát lại sau.
//   AI trả về "name" (tiếng Anh) — UI hiển thị "vi".
//
// "for": gợi ý NGẮN khi nào dùng → giúp AI chọn theo đối thủ, không đoán.

export const KEYSTONES = [
  { name: "Conqueror", vi: "Chinh Phục", for: "đấu sĩ/kéo dài giao tranh, có hồi máu; mạnh vào đỡ đòn" },
  { name: "Electrocute", vi: "Sốc Điện", for: "sát thủ/burst lẻ, hạ mục tiêu mỏng máu nhanh" },
  { name: "Press the Attack", vi: "Tấn Công Dồn Dập", for: "xạ thủ/đánh thường, mở thêm sát thương khi 3 đòn" },
  { name: "Lethal Tempo", vi: "Nhịp Độ Chí Mạng", for: "xạ thủ on-hit/đánh nhanh, DPS kéo dài" },
  { name: "Fleet Footwork", vi: "Sải Bước Hạm Đội", for: "xạ thủ/cơ động trụ kèo, sống dai đường khó" },
  { name: "Grasp of the Undying", vi: "Nắm Lấy Bất Diệt", for: "đỡ đòn/đấu sĩ đi đường, trâu và bám trụ" },
  { name: "Aftershock", vi: "Dư Chấn", for: "tank mở giao tranh, tăng giáp+kháng phép khi khống chế trúng" },
  { name: "Summon Aery", vi: "Triệu Hồi Aery", for: "pháp sư poke/enchanter hỗ trợ hồi-khiên" },
  { name: "Arcane Comet", vi: "Sao Chổi Bí Thuật", for: "pháp sư poke tầm xa, bào máu an toàn" },
  { name: "First Strike", vi: "Đòn Phủ Đầu", for: "pháp sư/poke cần vàng, snowball đường" },
  { name: "Glacial Augment", vi: "Tăng Cường Băng Giá", for: "kiểm soát/làm chậm, khắc tướng cơ động cần áp sát" },
  { name: "Hail of Blades", vi: "Mưa Lưỡi Kiếm", for: "sát thủ/đánh nhanh burst đầu trận" },
  { name: "Phase Rush", vi: "Tăng Tốc Pha", for: "cần thoát/kite khỏi sát thủ-đấu sĩ áp sát" },
  { name: "Dark Harvest", vi: "Nông Thu Đen", for: "sát thủ snowball, gây sát thương cộng thêm lên địch máu thấp" },
  { name: "Guardian", vi: "Hộ Vệ", for: "hỗ trợ bảo vệ đồng minh, tạo khiên khi ở gần nhau" },
];

export const SPELLS = [
  { name: "Flash", vi: "Tốc Biến", for: "cơ động/né combo — gần như luôn mang" },
  { name: "Ignite", vi: "Thiêu Đốt", for: "KHẮC hồi máu (giảm hồi) + kết liễu; vào team có hút máu/hồi" },
  { name: "Exhaust", vi: "Kiệt Sức", for: "KHẮC sát thủ/xạ thủ burst: giảm mạnh sát thương 1 mục tiêu" },
  { name: "Heal", vi: "Hồi Máu", for: "chống burst/all-in, cứu mình và đồng đội cận kề" },
  { name: "Barrier", vi: "Hàng Rào", for: "chống burst nổ tức thì (sát thủ/poke mạnh)" },
  { name: "Ghost", vi: "Tốc Hành", for: "đấu sĩ/áp sát bám dính hoặc thoát" },
  { name: "Smite", vi: "Trừng Phạt", for: "đi rừng — kiểm soát bãi quái/rồng/baron" },
];

export const KEYSTONE_CATALOG = KEYSTONES.map((k) => ({ name: k.name, vi: k.vi, for: k.for }));
export const SPELL_CATALOG = SPELLS.map((s) => ({ name: s.name, vi: s.vi, for: s.for }));

import { nameKey } from "../theme";
export function findKeystone(q) {
  const n = nameKey(q);
  if (!n) return null;
  return KEYSTONES.find((k) => nameKey(k.name) === n || nameKey(k.vi) === n) || null;
}
export function findSpell(q) {
  const n = nameKey(q);
  if (!n) return null;
  return SPELLS.find((s) => nameKey(s.name) === n || nameKey(s.vi) === n) || null;
}
