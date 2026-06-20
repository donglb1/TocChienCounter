// src/data/items.js
// DB trang bị THẬT + allowlist chống item ma.
// ⚠ BẢN KHỞI ĐẦU (~26 item). Paste bộ ~65 item curated patch 7.1f từ bản web vào đây,
// GIỮ NGUYÊN SCHEMA. Tên tiếng Việt vài món tao để theo trí nhớ — kiểm lại với DB web
// của mày trước khi tin tuyệt đối (đây đúng là chỗ dễ sai nhất).
//
// Schema:
//   id   : khóa nội bộ (không trùng)
//   name : tên gốc tiếng Anh (model trả về tên này — dùng làm allowlist)
//   vi   : tên hiển thị tiếng Việt
//   type : "core" | "boots" | "defense" | "offense" | "support"
//   tags : nhãn để rule engine/prompt chọn đúng (xem danh sách tag bên dưới)
//   img  : URL icon — Wild Rift KHÔNG có CDN item công khai → để null, UI vẽ ô lục giác màu
//
// Tag chuẩn:
//   armor, mr, hp, grievous (Vết Thương Sâu), revive, tenacity (kháng hiệu ứng),
//   antiCrit, attackSpeedSlow, lifesteal, omnivamp, magicPen, armorPen,
//   slow, shield, healShield (hỗ trợ), critDamage, onHit

export const ITEMS = [
  // ─── Phòng thủ vật lý (chống AD) ───
  { id: "thornmail",   name: "Thornmail",        vi: "Giáp Gai",            type: "defense", tags: ["armor", "grievous"], img: null },
  { id: "randuin",     name: "Randuin's Omen",   vi: "Khiên Băng Randuin",  type: "defense", tags: ["armor", "antiCrit"], img: null },
  { id: "frozenheart", name: "Frozen Heart",     vi: "Trái Tim Băng Giá",   type: "defense", tags: ["armor", "attackSpeedSlow"], img: null },
  { id: "deadmans",    name: "Dead Man's Plate",  vi: "Giáp Liệt Sĩ",        type: "defense", tags: ["armor", "hp"], img: null },
  { id: "sunfire",     name: "Sunfire Aegis",    vi: "Giáp Mặt Trời",       type: "defense", tags: ["armor", "hp"], img: null },

  // ─── Phòng thủ phép (chống AP) ───
  { id: "spiritvisage", name: "Spirit Visage",   vi: "Giáp Tâm Linh",       type: "defense", tags: ["mr", "hp", "healShield"], img: null },
  { id: "abyssal",      name: "Abyssal Mask",    vi: "Mặt Nạ Đọa Đày",      type: "defense", tags: ["mr", "hp"], img: null },
  { id: "forceofnature",name: "Force of Nature", vi: "Sức Mạnh Thiên Nhiên",type: "defense", tags: ["mr"], img: null },

  // ─── Tank đa dụng / cứu mạng ───
  { id: "warmog",      name: "Warmog's Armor",   vi: "Giáp Máu Warmog",     type: "defense", tags: ["hp"], img: null },
  { id: "gargoyle",    name: "Gargoyle Stoneplate", vi: "Áo Choàng Hộ Mệnh", type: "defense", tags: ["armor", "mr", "shield"], img: null },
  { id: "guardianangel",name: "Guardian Angel",  vi: "Giáp Thiên Thần",     type: "defense", tags: ["armor", "revive"], img: null },

  // ─── Vết Thương Sâu (chống hồi máu) ───
  { id: "mortal",      name: "Mortal Reminder",  vi: "Lời Nhắc Tử Vong",    type: "offense", tags: ["armorPen", "grievous"], img: null },
  { id: "chempunk",    name: "Chempunk Chainsword", vi: "Kiếm Tai Ương",    type: "offense", tags: ["grievous", "hp"], img: null },
  { id: "morello",     name: "Morellonomicon",   vi: "Quỷ Thư Morello",     type: "offense", tags: ["grievous", "magicPen"], img: null },

  // ─── Giày ───
  { id: "mercury",     name: "Mercury's Treads", vi: "Giày Thủy Ngân",      type: "boots", tags: ["mr", "tenacity"], img: null },
  { id: "ninjatabi",   name: "Ninja Tabi",       vi: "Giày Ninja Tabi",     type: "boots", tags: ["armor"], img: null },
  { id: "berserker",   name: "Berserker's Greaves", vi: "Giày Cuồng Nộ",    type: "boots", tags: ["onHit"], img: null },
  { id: "ionian",      name: "Ionian Boots of Lucidity", vi: "Giày Khai Sáng Ionia", type: "boots", tags: [], img: null },
  { id: "swiftness",   name: "Boots of Swiftness", vi: "Giày Tốc Hành",     type: "boots", tags: ["slow"], img: null },
  { id: "gluttonous",  name: "Gluttonous Greaves", vi: "Giày Tham Lam",     type: "boots", tags: ["omnivamp"], img: null },

  // ─── Tấn công (giữ core theo tướng) ───
  { id: "ie",          name: "Infinity Edge",    vi: "Vô Cực Kiếm",         type: "offense", tags: ["critDamage"], img: null },
  { id: "botrk",       name: "Blade of the Ruined King", vi: "Gươm Vương Suy Vong", type: "offense", tags: ["onHit", "lifesteal", "slow"], img: null },
  { id: "deathsdance", name: "Death's Dance",    vi: "Vũ Điệu Tử Thần",     type: "offense", tags: ["armor", "lifesteal"], img: null },
  { id: "rabadon",     name: "Rabadon's Deathcap", vi: "Mũ Phù Thủy Rabadon", type: "offense", tags: [], img: null },
  { id: "rylai",       name: "Rylai's Crystal Scepter", vi: "Quyền Trượng Pha Lê Rylai", type: "offense", tags: ["slow", "hp"], img: null },
  { id: "voidstaff",   name: "Void Staff",       vi: "Trượng Hư Vô",        type: "offense", tags: ["magicPen"], img: null },

  // ─── Hỗ trợ ───
  { id: "knightsvow",  name: "Knight's Vow",     vi: "Lời Thề Hiệp Sĩ",     type: "support", tags: ["armor", "healShield"], img: null },
];

// Allowlist tên (Anh + Việt) để ép model chỉ chọn từ đây — chống bịa item ma
export const ITEM_ALLOWLIST = ITEMS.flatMap((i) => [i.name, i.vi]);

// Tra item theo tên (Anh hoặc Việt). Trả null nếu ngoài danh sách → UI bật ⚠ NGOÀI DS
import { noDiacritics } from "../theme";
export function findItem(query) {
  const q = noDiacritics(query);
  if (!q) return null;
  return (
    ITEMS.find((i) => noDiacritics(i.name) === q || noDiacritics(i.vi) === q) ||
    null
  );
}
