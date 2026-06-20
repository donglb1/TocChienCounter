// src/data/buildTemplates.js
// Build CHUẨN theo 12 archetype (build-identity ở champions.js).
// Mục đích: thư viện build OFFLINE, tức thì — không cần ảnh, không tốn API.
// Mọi tên item phải KHỚP items.js; tên ngọc/phép khớp runes.js.
//
// Mỗi template:
//   boots       : đôi giày mặc định
//   core        : 3 món cốt lõi (lên trước)
//   situational : món lên thêm tùy tình huống
//   keystone    : ngọc bổ trợ mặc định
//   spells      : 2 phép bổ trợ
//   note        : 1 câu lối chơi/định hướng

export const BUILD_TEMPLATES = {
  "ad-chi-mang": {
    boots: "Berserker's Greaves",
    core: ["Infinity Edge", "Phantom Dancer", "Bloodthirster"],
    situational: ["Lord Dominik's Regards", "Mortal Reminder", "Guardian Angel"],
    keystone: "Lethal Tempo",
    spells: ["Flash", "Heal"],
    note: "Giữ khoảng cách, cộng dồn chí mạng late game. Lên Nỏ Thần khi địch trâu giáp.",
  },
  "ad-on-hit": {
    boots: "Berserker's Greaves",
    core: ["Blade of the Ruined King", "Kraken Slayer", "Runaan's Hurricane"],
    situational: ["Terminus", "Mortal Reminder", "Guardian Angel"],
    keystone: "Lethal Tempo",
    spells: ["Flash", "Heal"],
    note: "Đánh theo % máu, mạnh vào tướng trâu. Terminus khi cần xuyên giáp + kháng phép.",
  },
  "ad-xuyen-giap": {
    boots: "Ionian Boots of Lucidity",
    core: ["Youmuu's Ghostblade", "Eclipse", "Serylda's Grudge"],
    situational: ["Edge of Night", "The Collector", "Death's Dance"],
    keystone: "Electrocute",
    spells: ["Flash", "Ignite"],
    note: "Bắt lẻ mục tiêu mỏng máu, burst rồi rút. Áo Choàng Bóng Tối nếu địch nhiều CC mở.",
  },
  "ad-dau-si": {
    boots: "Plated Steelcaps",
    core: ["Trinity Force", "Black Cleaver", "Sterak's Gage"],
    situational: ["Death's Dance", "Spear of Shojin", "Guardian Angel"],
    keystone: "Conqueror",
    spells: ["Flash", "Ignite"],
    note: "Bám trụ giao tranh, bào giáp địch. Đổi giày sang Thủy Ngân nếu địch nhiều CC/AP.",
  },
  "ad-do-don": {
    boots: "Plated Steelcaps",
    core: ["Divine Sunderer", "Black Cleaver", "Sterak's Gage"],
    situational: ["Thornmail", "Force of Nature", "Guardian Angel"],
    keystone: "Grasp of the Undying",
    spells: ["Flash", "Ghost"],
    note: "Trâu và scale muộn, đánh theo % máu. Cân giáp/kháng phép theo sát thương địch.",
  },
  "ap-no": {
    boots: "Ionian Boots of Lucidity",
    core: ["Luden's Echo", "Rabadon's Deathcap", "Infinity Orb"],
    situational: ["Morellonomicon", "Horizon Focus", "Crown of the Shattered Queen"],
    keystone: "Electrocute",
    spells: ["Flash", "Ignite"],
    note: "Chờ chiêu rồi combo burst gọn. Quỷ Thư khi địch hồi máu, Vương Miện nếu sợ bị bắt lẻ.",
  },
  "ap-poke": {
    boots: "Ionian Boots of Lucidity",
    core: ["Luden's Echo", "Horizon Focus", "Rabadon's Deathcap"],
    situational: ["Liandry's Torment", "Rylai's Crystal Scepter", "Morellonomicon"],
    keystone: "Arcane Comet",
    spells: ["Flash", "Barrier"],
    note: "Bào máu tầm xa an toàn. Liandry/Rylai khi địch trâu máu hoặc cần giữ chân.",
  },
  "ap-danh-chieu": {
    boots: "Berserker's Greaves",
    core: ["Nashor's Tooth", "Lich Bane", "Rabadon's Deathcap"],
    situational: ["Liandry's Torment", "Morellonomicon", "Guinsoo's Rageblade"],
    keystone: "Lethal Tempo",
    spells: ["Flash", "Heal"],
    note: "Trộn đánh thường + chiêu để DPS phép liên tục. Liandry khi địch trâu máu.",
  },
  "ap-dau-si": {
    boots: "Mercury's Treads",
    core: ["Liandry's Torment", "Rylai's Crystal Scepter", "Rabadon's Deathcap"],
    situational: ["Morellonomicon", "Rod of Ages", "Abyssal Mask"],
    keystone: "Conqueror",
    spells: ["Flash", "Ignite"],
    note: "Lao vào trộn trận, vừa lì vừa gây phép. Trượng Trường Sinh nếu cần bền giai đoạn đầu.",
  },
  "do-don-mo-giao-tranh": {
    boots: "Mercury's Treads",
    core: ["Sunfire Aegis", "Winter's Approach", "Dead Man's Plate"],
    situational: ["Thornmail", "Force of Nature", "Kaenic Rookern", "Warmog's Armor"],
    keystone: "Aftershock",
    spells: ["Flash", "Ghost"],
    note: "Mở giao tranh, hứng đòn cho đội. Lên Giáp Gai/Giáp Thiên Nhiên theo sát thương địch.",
  },
  "ho-tro-hoi-khien": {
    boots: "Ionian Boots of Lucidity",
    core: ["Ardent Censer", "Staff of Flowing Waters", "Redemption"],
    situational: ["Harmonic Echo", "Knight's Vow", "Radiant Virtue"],
    keystone: "Summon Aery",
    spells: ["Flash", "Heal"],
    note: "Bám sát chủ lực, hồi-khiên-buff đúng lúc. Dây Chuyền Chuộc Tội cứu giao tranh tổng.",
  },
  "ho-tro-phep": {
    boots: "Ionian Boots of Lucidity",
    core: ["Imperial Mandate", "Luden's Echo", "Rylai's Crystal Scepter"],
    situational: ["Morellonomicon", "Redemption", "Horizon Focus"],
    keystone: "Arcane Comet",
    spells: ["Flash", "Exhaust"],
    note: "Poke + khống chế để đồng đội kích nổ. Kiệt Sức khi địch có sát thủ/xạ thủ mạnh.",
  },
};

// Trả về build chuẩn cho 1 tướng (theo build-identity). Tướng chưa có archetype → null.
export function getChampionBuild(champ) {
  if (!champ || !champ.build) return null;
  const t = BUILD_TEMPLATES[champ.build];
  if (!t) return null;
  return t;
}
