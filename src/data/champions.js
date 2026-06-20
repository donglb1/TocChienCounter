// src/data/champions.js
// DB tướng gắn thẻ phục vụ rule engine khắc chế.
// ⚠ BẢN KHỞI ĐẦU (~45 tướng). Paste bộ ~115 tướng gắn thẻ từ bản web vào đây,
// GIỮ NGUYÊN SCHEMA bên dưới thì drop thẳng vào là chạy.
//
// Schema mỗi tướng:
//   id        : ID Data Dragon (để tra icon, xem lib/images.js — phân biệt hoa thường)
//   name      : tên gốc tiếng Anh (model trả về tên này)
//   vi        : tên hiển thị tiếng Việt (đa số = tên Anh)
//   damageType: "AD" | "AP" | "mixed" | "true"
//   role      : "Tank" | "Fighter" | "Mage" | "Assassin" | "Marksman" | "Support"
//   burst     : true nếu sát thương nổ cao
//   cc        : "none" | "low" | "medium" | "high"
//   healing   : true nếu hồi máu/hút máu mạnh (→ ép Vết Thương Sâu)
//   threat    : độ nguy hiểm 1-10 (ưu tiên khắc chế)

export const CHAMPIONS = [
  // ─── Assassin / nổ ───
  { id: "Zed",       name: "Zed",       vi: "Zed",       damageType: "AD", role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 9 },
  { id: "Talon",     name: "Talon",     vi: "Talon",     damageType: "AD", role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Akali",     name: "Akali",     vi: "Akali",     damageType: "AP", role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Katarina",  name: "Katarina",  vi: "Katarina",  damageType: "AP", role: "Assassin", burst: true,  cc: "none",   healing: false, threat: 8 },
  { id: "Fizz",      name: "Fizz",      vi: "Fizz",      damageType: "AP", role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Evelynn",   name: "Evelynn",   vi: "Evelynn",   damageType: "AP", role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Kha'Zix",   name: "Kha'Zix",   vi: "Kha'Zix",   damageType: "AD", role: "Assassin", burst: true,  cc: "none",   healing: false, threat: 8 },
  { id: "Pyke",      name: "Pyke",      vi: "Pyke",      damageType: "AD", role: "Assassin", burst: true,  cc: "high",   healing: false, threat: 7 },

  // ─── Marksman / hút máu ───
  { id: "Jinx",      name: "Jinx",      vi: "Jinx",      damageType: "AD", role: "Marksman", burst: false, cc: "low",    healing: false, threat: 8 },
  { id: "Caitlyn",   name: "Caitlyn",   vi: "Caitlyn",   damageType: "AD", role: "Marksman", burst: false, cc: "low",    healing: false, threat: 7 },
  { id: "Vayne",     name: "Vayne",     vi: "Vayne",     damageType: "AD", role: "Marksman", burst: false, cc: "low",    healing: false, threat: 8 },
  { id: "Ezreal",    name: "Ezreal",    vi: "Ezreal",    damageType: "mixed", role: "Marksman", burst: false, cc: "none", healing: false, threat: 7 },
  { id: "Lucian",    name: "Lucian",    vi: "Lucian",    damageType: "AD", role: "Marksman", burst: true,  cc: "none",   healing: false, threat: 7 },
  { id: "Jhin",      name: "Jhin",      vi: "Jhin",      damageType: "AD", role: "Marksman", burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Tristana",  name: "Tristana",  vi: "Tristana",  damageType: "AD", role: "Marksman", burst: true,  cc: "low",    healing: false, threat: 7 },
  { id: "Kai'Sa",    name: "Kai'Sa",    vi: "Kai'Sa",    damageType: "mixed", role: "Marksman", burst: true, cc: "none",  healing: false, threat: 8 },
  { id: "Samira",    name: "Samira",    vi: "Samira",    damageType: "AD", role: "Marksman", burst: true,  cc: "low",    healing: false, threat: 8 },

  // ─── Mage / AP ───
  { id: "Ahri",      name: "Ahri",      vi: "Ahri",      damageType: "AP", role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Lux",       name: "Lux",       vi: "Lux",       damageType: "AP", role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Orianna",   name: "Orianna",   vi: "Orianna",   damageType: "AP", role: "Mage",     burst: false, cc: "high",   healing: false, threat: 7 },
  { id: "Veigar",    name: "Veigar",    vi: "Veigar",    damageType: "AP", role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 8 },
  { id: "Brand",     name: "Brand",     vi: "Brand",     damageType: "AP", role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Seraphine", name: "Seraphine", vi: "Seraphine", damageType: "AP", role: "Mage",     burst: false, cc: "high",   healing: true,  threat: 6 },
  { id: "Ziggs",     name: "Ziggs",     vi: "Ziggs",     damageType: "AP", role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 6 },

  // ─── Fighter / bruiser ───
  { id: "Garen",     name: "Garen",     vi: "Garen",     damageType: "AD", role: "Fighter",  burst: true,  cc: "low",    healing: true,  threat: 7 },
  { id: "Darius",    name: "Darius",    vi: "Darius",    damageType: "AD", role: "Fighter",  burst: true,  cc: "high",   healing: true,  threat: 8 },
  { id: "Fiora",     name: "Fiora",     vi: "Fiora",     damageType: "AD", role: "Fighter",  burst: false, cc: "low",    healing: true,  threat: 8 },
  { id: "Camille",   name: "Camille",   vi: "Camille",   damageType: "AD", role: "Fighter",  burst: true,  cc: "high",   healing: false, threat: 8 },
  { id: "Sett",      name: "Sett",      vi: "Sett",      damageType: "AD", role: "Fighter",  burst: true,  cc: "high",   healing: true,  threat: 7 },
  { id: "Jax",       name: "Jax",       vi: "Jax",       damageType: "mixed", role: "Fighter", burst: false, cc: "medium", healing: false, threat: 7 },
  { id: "Irelia",    name: "Irelia",    vi: "Irelia",    damageType: "AD", role: "Fighter",  burst: true,  cc: "medium", healing: true,  threat: 8 },
  { id: "Renekton",  name: "Renekton",  vi: "Renekton",  damageType: "AD", role: "Fighter",  burst: true,  cc: "medium", healing: true,  threat: 7 },
  { id: "Olaf",      name: "Olaf",      vi: "Olaf",      damageType: "AD", role: "Fighter",  burst: false, cc: "low",    healing: true,  threat: 7 },
  { id: "Aatrox",    name: "Aatrox",    vi: "Aatrox",    damageType: "AD", role: "Fighter",  burst: false, cc: "medium", healing: true,  threat: 8 },

  // ─── Tank ───
  { id: "Malphite",  name: "Malphite",  vi: "Malphite",  damageType: "AP", role: "Tank",     burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Leona",     name: "Leona",     vi: "Leona",     damageType: "AP", role: "Tank",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Nautilus",  name: "Nautilus",  vi: "Nautilus",  damageType: "AP", role: "Tank",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Rammus",    name: "Rammus",    vi: "Rammus",    damageType: "AP", role: "Tank",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Amumu",     name: "Amumu",     vi: "Amumu",     damageType: "AP", role: "Tank",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Ornn",      name: "Ornn",      vi: "Ornn",      damageType: "mixed", role: "Tank",   burst: false, cc: "high",   healing: false, threat: 6 },

  // ─── Support ───
  { id: "Thresh",    name: "Thresh",    vi: "Thresh",    damageType: "AP", role: "Support",  burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Lulu",      name: "Lulu",      vi: "Lulu",      damageType: "AP", role: "Support",  burst: false, cc: "medium", healing: true,  threat: 5 },
  { id: "Soraka",    name: "Soraka",    vi: "Soraka",    damageType: "AP", role: "Support",  burst: false, cc: "low",    healing: true,  threat: 6 },
  { id: "Nami",      name: "Nami",      vi: "Nami",      damageType: "AP", role: "Support",  burst: false, cc: "high",   healing: true,  threat: 5 },
  { id: "Yuumi",     name: "Yuumi",     vi: "Yuumi",     damageType: "AP", role: "Support",  burst: false, cc: "low",    healing: true,  threat: 5 },

  // ─── Bruiser/Jungle khác ───
  { id: "LeeSin",    name: "Lee Sin",   vi: "Lee Sin",   damageType: "AD", role: "Fighter",  burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Graves",    name: "Graves",    vi: "Graves",    damageType: "AD", role: "Marksman", burst: true,  cc: "low",    healing: false, threat: 7 },
  { id: "Yasuo",     name: "Yasuo",     vi: "Yasuo",     damageType: "AD", role: "Fighter",  burst: false, cc: "high",   healing: false, threat: 7 },
  { id: "Yone",      name: "Yone",      vi: "Yone",      damageType: "mixed", role: "Fighter", burst: true, cc: "high",   healing: false, threat: 7 },
  { id: "MasterYi",  name: "Master Yi", vi: "Master Yi", damageType: "AD", role: "Assassin", burst: false, cc: "none",   healing: true,  threat: 8 },
  { id: "Warwick",   name: "Warwick",   vi: "Warwick",   damageType: "mixed", role: "Fighter", burst: false, cc: "high", healing: true,  threat: 7 },
];

import { noDiacritics } from "../theme";

// Tra tướng theo tên (Anh hoặc Việt, không phân biệt dấu)
export function findChampion(query) {
  const q = noDiacritics(query);
  if (!q) return null;
  return (
    CHAMPIONS.find(
      (c) => noDiacritics(c.name) === q || noDiacritics(c.vi) === q
    ) || null
  );
}

// Gợi ý autocomplete (prefix match, tối đa `limit`)
export function suggestChampions(query, limit = 8) {
  const q = noDiacritics(query);
  if (!q) return [];
  const starts = [];
  const contains = [];
  for (const c of CHAMPIONS) {
    const n = noDiacritics(c.name);
    const v = noDiacritics(c.vi);
    if (n.startsWith(q) || v.startsWith(q)) starts.push(c);
    else if (n.includes(q) || v.includes(q)) contains.push(c);
  }
  return [...starts, ...contains].slice(0, limit);
}
