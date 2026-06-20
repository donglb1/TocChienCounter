// src/data/champions.js
// DB tướng gắn thẻ phục vụ rule engine khắc chế.
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
  // ─── Assassin ───
  { id: "Zed",          name: "Zed",           vi: "Zed",           damageType: "AD",    role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 9 },
  { id: "Talon",        name: "Talon",         vi: "Talon",         damageType: "AD",    role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Akali",        name: "Akali",         vi: "Akali",         damageType: "AP",    role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Katarina",     name: "Katarina",      vi: "Katarina",      damageType: "AP",    role: "Assassin", burst: true,  cc: "none",   healing: false, threat: 8 },
  { id: "Fizz",         name: "Fizz",          vi: "Fizz",          damageType: "AP",    role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Evelynn",      name: "Evelynn",       vi: "Evelynn",       damageType: "AP",    role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Khazix",       name: "Kha'Zix",       vi: "Kha'Zix",       damageType: "AD",    role: "Assassin", burst: true,  cc: "none",   healing: false, threat: 8 },
  { id: "Pyke",         name: "Pyke",          vi: "Pyke",          damageType: "AD",    role: "Assassin", burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Kassadin",     name: "Kassadin",      vi: "Kassadin",      damageType: "AP",    role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Ekko",         name: "Ekko",          vi: "Ekko",          damageType: "AP",    role: "Assassin", burst: true,  cc: "medium", healing: false, threat: 8 },
  { id: "Rengar",       name: "Rengar",        vi: "Rengar",        damageType: "AD",    role: "Assassin", burst: true,  cc: "low",    healing: false, threat: 9 },
  { id: "Diana",        name: "Diana",         vi: "Diana",         damageType: "AP",    role: "Assassin", burst: true,  cc: "medium", healing: false, threat: 8 },
  { id: "MasterYi",     name: "Master Yi",     vi: "Master Yi",     damageType: "AD",    role: "Assassin", burst: false, cc: "none",   healing: true,  threat: 8 },

  // ─── Marksman ───
  { id: "Jinx",         name: "Jinx",          vi: "Jinx",          damageType: "AD",    role: "Marksman", burst: false, cc: "low",    healing: false, threat: 8 },
  { id: "Caitlyn",      name: "Caitlyn",       vi: "Caitlyn",       damageType: "AD",    role: "Marksman", burst: false, cc: "low",    healing: false, threat: 7 },
  { id: "Vayne",        name: "Vayne",         vi: "Vayne",         damageType: "AD",    role: "Marksman", burst: false, cc: "low",    healing: false, threat: 8 },
  { id: "Ezreal",       name: "Ezreal",        vi: "Ezreal",        damageType: "mixed", role: "Marksman", burst: false, cc: "none",   healing: false, threat: 7 },
  { id: "Lucian",       name: "Lucian",        vi: "Lucian",        damageType: "AD",    role: "Marksman", burst: true,  cc: "none",   healing: false, threat: 7 },
  { id: "Jhin",         name: "Jhin",          vi: "Jhin",          damageType: "AD",    role: "Marksman", burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Tristana",     name: "Tristana",      vi: "Tristana",      damageType: "AD",    role: "Marksman", burst: true,  cc: "low",    healing: false, threat: 7 },
  { id: "Kaisa",        name: "Kai'Sa",        vi: "Kai'Sa",        damageType: "mixed", role: "Marksman", burst: true,  cc: "none",   healing: false, threat: 8 },
  { id: "Samira",       name: "Samira",        vi: "Samira",        damageType: "AD",    role: "Marksman", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Ashe",         name: "Ashe",          vi: "Ashe",          damageType: "AD",    role: "Marksman", burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Draven",       name: "Draven",        vi: "Draven",        damageType: "AD",    role: "Marksman", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "MissFortune",  name: "Miss Fortune",  vi: "Miss Fortune",  damageType: "AD",    role: "Marksman", burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Varus",        name: "Varus",         vi: "Varus",         damageType: "mixed", role: "Marksman", burst: false, cc: "high",   healing: false, threat: 7 },
  { id: "Xayah",        name: "Xayah",         vi: "Xayah",         damageType: "AD",    role: "Marksman", burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Corki",        name: "Corki",         vi: "Corki",         damageType: "mixed", role: "Marksman", burst: true,  cc: "none",   healing: false, threat: 7 },
  { id: "Graves",       name: "Graves",        vi: "Graves",        damageType: "AD",    role: "Marksman", burst: true,  cc: "low",    healing: false, threat: 7 },
  { id: "Teemo",        name: "Teemo",         vi: "Teemo",         damageType: "AP",    role: "Marksman", burst: false, cc: "low",    healing: false, threat: 6 },
  { id: "Sivir",        name: "Sivir",         vi: "Sivir",         damageType: "AD",    role: "Marksman", burst: false, cc: "low",    healing: false, threat: 6 },
  { id: "Nilah",        name: "Nilah",         vi: "Nilah",         damageType: "AD",    role: "Marksman", burst: true,  cc: "low",    healing: true,  threat: 7 },
  { id: "Twitch",       name: "Twitch",        vi: "Twitch",        damageType: "AD",    role: "Marksman", burst: true,  cc: "low",    healing: false, threat: 8 },
  { id: "Zeri",         name: "Zeri",          vi: "Zeri",          damageType: "AD",    role: "Marksman", burst: false, cc: "none",   healing: false, threat: 7 },
  { id: "Akshan",       name: "Akshan",        vi: "Akshan",        damageType: "AD",    role: "Marksman", burst: true,  cc: "low",    healing: false, threat: 7 },
  { id: "Kalista",      name: "Kalista",       vi: "Kalista",       damageType: "AD",    role: "Marksman", burst: false, cc: "low",    healing: false, threat: 7 },
  { id: "Kindred",      name: "Kindred",       vi: "Kindred",       damageType: "AD",    role: "Marksman", burst: false, cc: "low",    healing: false, threat: 7 },

  // ─── Mage ───
  { id: "Ahri",         name: "Ahri",          vi: "Ahri",          damageType: "AP",    role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Lux",          name: "Lux",           vi: "Lux",           damageType: "AP",    role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Orianna",      name: "Orianna",       vi: "Orianna",       damageType: "AP",    role: "Mage",     burst: false, cc: "high",   healing: false, threat: 7 },
  { id: "Veigar",       name: "Veigar",        vi: "Veigar",        damageType: "AP",    role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 8 },
  { id: "Brand",        name: "Brand",         vi: "Brand",         damageType: "AP",    role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Seraphine",    name: "Seraphine",     vi: "Seraphine",     damageType: "AP",    role: "Mage",     burst: false, cc: "high",   healing: true,  threat: 6 },
  { id: "Ziggs",        name: "Ziggs",         vi: "Ziggs",         damageType: "AP",    role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 6 },
  { id: "Annie",        name: "Annie",         vi: "Annie",         damageType: "AP",    role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "AurelionSol",  name: "Aurelion Sol",  vi: "Aurelion Sol",  damageType: "AP",    role: "Mage",     burst: false, cc: "medium", healing: false, threat: 7 },
  { id: "Heimerdinger", name: "Heimerdinger",  vi: "Heimerdinger",  damageType: "AP",    role: "Mage",     burst: false, cc: "low",    healing: false, threat: 6 },
  { id: "Kennen",       name: "Kennen",        vi: "Kennen",        damageType: "AP",    role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Lissandra",    name: "Lissandra",     vi: "Lissandra",     damageType: "AP",    role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Syndra",       name: "Syndra",        vi: "Syndra",        damageType: "AP",    role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 8 },
  { id: "TwistedFate",  name: "Twisted Fate",  vi: "Twisted Fate",  damageType: "AP",    role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Swain",        name: "Swain",         vi: "Swain",         damageType: "AP",    role: "Mage",     burst: false, cc: "medium", healing: true,  threat: 7 },
  { id: "Vex",          name: "Vex",           vi: "Vex",           damageType: "AP",    role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Viktor",       name: "Viktor",        vi: "Viktor",        damageType: "AP",    role: "Mage",     burst: false, cc: "medium", healing: false, threat: 7 },
  { id: "Vladimir",     name: "Vladimir",      vi: "Vladimir",      damageType: "AP",    role: "Mage",     burst: false, cc: "low",    healing: true,  threat: 7 },
  { id: "Zoe",          name: "Zoe",           vi: "Zoe",           damageType: "AP",    role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 8 },
  { id: "Zyra",         name: "Zyra",          vi: "Zyra",          damageType: "AP",    role: "Mage",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "FiddleSticks", name: "Fiddlesticks",  vi: "Fiddlesticks",  damageType: "AP",    role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Lillia",       name: "Lillia",        vi: "Lillia",        damageType: "AP",    role: "Mage",     burst: false, cc: "high",   healing: false, threat: 7 },

  // ─── Fighter ───
  { id: "Garen",        name: "Garen",         vi: "Garen",         damageType: "AD",    role: "Fighter",  burst: true,  cc: "low",    healing: true,  threat: 7 },
  { id: "Darius",       name: "Darius",        vi: "Darius",        damageType: "AD",    role: "Fighter",  burst: true,  cc: "high",   healing: true,  threat: 8 },
  { id: "Fiora",        name: "Fiora",         vi: "Fiora",         damageType: "AD",    role: "Fighter",  burst: false, cc: "low",    healing: true,  threat: 8 },
  { id: "Camille",      name: "Camille",       vi: "Camille",       damageType: "AD",    role: "Fighter",  burst: true,  cc: "high",   healing: false, threat: 8 },
  { id: "Sett",         name: "Sett",          vi: "Sett",          damageType: "AD",    role: "Fighter",  burst: true,  cc: "high",   healing: true,  threat: 7 },
  { id: "Jax",          name: "Jax",           vi: "Jax",           damageType: "mixed", role: "Fighter",  burst: false, cc: "medium", healing: false, threat: 7 },
  { id: "Irelia",       name: "Irelia",        vi: "Irelia",        damageType: "AD",    role: "Fighter",  burst: true,  cc: "medium", healing: true,  threat: 8 },
  { id: "Renekton",     name: "Renekton",      vi: "Renekton",      damageType: "AD",    role: "Fighter",  burst: true,  cc: "medium", healing: true,  threat: 7 },
  { id: "Olaf",         name: "Olaf",          vi: "Olaf",          damageType: "AD",    role: "Fighter",  burst: false, cc: "low",    healing: true,  threat: 7 },
  { id: "Aatrox",       name: "Aatrox",        vi: "Aatrox",        damageType: "AD",    role: "Fighter",  burst: false, cc: "medium", healing: true,  threat: 8 },
  { id: "LeeSin",       name: "Lee Sin",       vi: "Lee Sin",       damageType: "AD",    role: "Fighter",  burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Yasuo",        name: "Yasuo",         vi: "Yasuo",         damageType: "AD",    role: "Fighter",  burst: false, cc: "high",   healing: false, threat: 7 },
  { id: "Yone",         name: "Yone",          vi: "Yone",          damageType: "mixed", role: "Fighter",  burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Warwick",      name: "Warwick",       vi: "Warwick",       damageType: "mixed", role: "Fighter",  burst: false, cc: "high",   healing: true,  threat: 7 },
  { id: "Hecarim",      name: "Hecarim",       vi: "Hecarim",       damageType: "AD",    role: "Fighter",  burst: false, cc: "high",   healing: false, threat: 7 },
  { id: "Urgot",        name: "Urgot",         vi: "Urgot",         damageType: "AD",    role: "Fighter",  burst: false, cc: "medium", healing: false, threat: 7 },
  { id: "Kayn",         name: "Kayn",          vi: "Kayn",          damageType: "AD",    role: "Fighter",  burst: true,  cc: "low",    healing: true,  threat: 8 },
  { id: "Gwen",         name: "Gwen",          vi: "Gwen",          damageType: "AP",    role: "Fighter",  burst: false, cc: "none",   healing: false, threat: 7 },
  { id: "Kayle",        name: "Kayle",         vi: "Kayle",         damageType: "mixed", role: "Fighter",  burst: false, cc: "low",    healing: false, threat: 7 },
  { id: "Jayce",        name: "Jayce",         vi: "Jayce",         damageType: "mixed", role: "Fighter",  burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Riven",        name: "Riven",         vi: "Riven",         damageType: "AD",    role: "Fighter",  burst: true,  cc: "medium", healing: false, threat: 8 },
  { id: "Pantheon",     name: "Pantheon",      vi: "Pantheon",      damageType: "AD",    role: "Fighter",  burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "MonkeyKing",   name: "Wukong",        vi: "Wukong",        damageType: "AD",    role: "Fighter",  burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "XinZhao",      name: "Xin Zhao",      vi: "Xin Zhao",      damageType: "AD",    role: "Fighter",  burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Vi",           name: "Vi",            vi: "Vi",            damageType: "AD",    role: "Fighter",  burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Tryndamere",   name: "Tryndamere",    vi: "Tryndamere",    damageType: "AD",    role: "Fighter",  burst: false, cc: "low",    healing: true,  threat: 8 },
  { id: "Shyvana",      name: "Shyvana",       vi: "Shyvana",       damageType: "mixed", role: "Fighter",  burst: false, cc: "none",   healing: false, threat: 7 },
  { id: "JarvanIV",     name: "Jarvan IV",     vi: "Jarvan IV",     damageType: "AD",    role: "Fighter",  burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Nasus",        name: "Nasus",         vi: "Nasus",         damageType: "AD",    role: "Fighter",  burst: false, cc: "medium", healing: true,  threat: 7 },
  { id: "Viego",        name: "Viego",         vi: "Viego",         damageType: "AD",    role: "Fighter",  burst: true,  cc: "medium", healing: true,  threat: 9 },
  { id: "Mordekaiser",  name: "Mordekaiser",   vi: "Mordekaiser",   damageType: "AP",    role: "Fighter",  burst: true,  cc: "medium", healing: true,  threat: 8 },
  { id: "Sion",         name: "Sion",          vi: "Sion",          damageType: "mixed", role: "Fighter",  burst: true,  cc: "high",   healing: false, threat: 6 },

  // ─── Tank ───
  { id: "Malphite",     name: "Malphite",      vi: "Malphite",      damageType: "AP",    role: "Tank",     burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Leona",        name: "Leona",         vi: "Leona",         damageType: "AP",    role: "Tank",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Nautilus",     name: "Nautilus",      vi: "Nautilus",      damageType: "AP",    role: "Tank",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Rammus",       name: "Rammus",        vi: "Rammus",        damageType: "AP",    role: "Tank",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Amumu",        name: "Amumu",         vi: "Amumu",         damageType: "AP",    role: "Tank",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Ornn",         name: "Ornn",          vi: "Ornn",          damageType: "mixed", role: "Tank",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Alistar",      name: "Alistar",       vi: "Alistar",       damageType: "AP",    role: "Tank",     burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Braum",        name: "Braum",         vi: "Braum",         damageType: "AD",    role: "Tank",     burst: false, cc: "high",   healing: false, threat: 5 },
  { id: "DrMundo",      name: "Dr. Mundo",     vi: "Dr. Mundo",     damageType: "AD",    role: "Tank",     burst: false, cc: "none",   healing: true,  threat: 6 },
  { id: "Galio",        name: "Galio",         vi: "Galio",         damageType: "AP",    role: "Tank",     burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "Gragas",       name: "Gragas",        vi: "Gragas",        damageType: "AP",    role: "Tank",     burst: true,  cc: "high",   healing: false, threat: 6 },
  { id: "Maokai",       name: "Maokai",        vi: "Maokai",        damageType: "AP",    role: "Tank",     burst: false, cc: "high",   healing: false, threat: 5 },
  { id: "Nunu",         name: "Nunu & Willump", vi: "Nunu & Willump", damageType: "AP",  role: "Tank",     burst: true,  cc: "high",   healing: false, threat: 6 },
  { id: "Shen",         name: "Shen",          vi: "Shen",          damageType: "AD",    role: "Tank",     burst: false, cc: "medium", healing: false, threat: 6 },
  { id: "Singed",       name: "Singed",        vi: "Singed",        damageType: "AP",    role: "Tank",     burst: false, cc: "medium", healing: false, threat: 5 },
  { id: "Volibear",     name: "Volibear",      vi: "Volibear",      damageType: "mixed", role: "Tank",     burst: true,  cc: "high",   healing: false, threat: 7 },

  // ─── Support ───
  { id: "Thresh",       name: "Thresh",        vi: "Thresh",        damageType: "AP",    role: "Support",  burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Lulu",         name: "Lulu",          vi: "Lulu",          damageType: "AP",    role: "Support",  burst: false, cc: "medium", healing: true,  threat: 5 },
  { id: "Soraka",       name: "Soraka",        vi: "Soraka",        damageType: "AP",    role: "Support",  burst: false, cc: "low",    healing: true,  threat: 6 },
  { id: "Nami",         name: "Nami",          vi: "Nami",          damageType: "AP",    role: "Support",  burst: false, cc: "high",   healing: true,  threat: 5 },
  { id: "Yuumi",        name: "Yuumi",         vi: "Yuumi",         damageType: "AP",    role: "Support",  burst: false, cc: "low",    healing: true,  threat: 5 },
  { id: "Blitzcrank",   name: "Blitzcrank",    vi: "Blitzcrank",    damageType: "AP",    role: "Support",  burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Janna",        name: "Janna",         vi: "Janna",         damageType: "AP",    role: "Support",  burst: false, cc: "high",   healing: true,  threat: 5 },
  { id: "Karma",        name: "Karma",         vi: "Karma",         damageType: "AP",    role: "Support",  burst: false, cc: "medium", healing: false, threat: 5 },
  { id: "Milio",        name: "Milio",         vi: "Milio",         damageType: "AP",    role: "Support",  burst: false, cc: "low",    healing: true,  threat: 5 },
  { id: "Morgana",      name: "Morgana",       vi: "Morgana",       damageType: "AP",    role: "Support",  burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Rakan",        name: "Rakan",         vi: "Rakan",         damageType: "AP",    role: "Support",  burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "Senna",        name: "Senna",         vi: "Senna",         damageType: "mixed", role: "Support",  burst: false, cc: "medium", healing: true,  threat: 7 },
  { id: "Sona",         name: "Sona",          vi: "Sona",          damageType: "AP",    role: "Support",  burst: false, cc: "high",   healing: true,  threat: 5 },
  { id: "Bard",         name: "Bard",          vi: "Bard",          damageType: "AP",    role: "Support",  burst: false, cc: "high",   healing: true,  threat: 5 },
  { id: "Zilean",       name: "Zilean",        vi: "Zilean",        damageType: "AP",    role: "Support",  burst: false, cc: "medium", healing: false, threat: 6 },
  { id: "Rell",         name: "Rell",          vi: "Rell",          damageType: "AP",    role: "Support",  burst: false, cc: "high",   healing: false, threat: 6 },

  // ─── Bổ sung roster 139 (tướng mới) ───
  { id: "Ambessa",      name: "Ambessa",       vi: "Ambessa",       damageType: "AD",    role: "Fighter",  burst: true,  cc: "medium", healing: false, threat: 8 },
  { id: "Mel",          name: "Mel",           vi: "Mel",           damageType: "AP",    role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Smolder",      name: "Smolder",       vi: "Smolder",       damageType: "mixed", role: "Marksman", burst: false, cc: "none",   healing: false, threat: 7 },
  { id: "Aurora",       name: "Aurora",        vi: "Aurora",        damageType: "AP",    role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 8 },
  { id: "Nidalee",      name: "Nidalee",       vi: "Nidalee",       damageType: "AP",    role: "Assassin", burst: true,  cc: "low",    healing: true,  threat: 7 },
  { id: "Norra",        name: "Norra",         vi: "Norra",         damageType: "AP",    role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Skarner",      name: "Skarner",       vi: "Skarner",       damageType: "AD",    role: "Fighter",  burst: false, cc: "high",   healing: false, threat: 7 },
  { id: "Taliyah",      name: "Taliyah",       vi: "Taliyah",       damageType: "AP",    role: "Mage",     burst: true,  cc: "high",   healing: false, threat: 7 },
  { id: "KSante",       name: "K'Sante",       vi: "K'Sante",       damageType: "AD",    role: "Tank",     burst: false, cc: "high",   healing: false, threat: 7 },
  { id: "KogMaw",       name: "Kog'Maw",       vi: "Kog'Maw",       damageType: "mixed", role: "Marksman", burst: false, cc: "none",   healing: false, threat: 7 },
  { id: "Poppy",        name: "Poppy",         vi: "Poppy",         damageType: "AD",    role: "Fighter",  burst: false, cc: "high",   healing: false, threat: 6 },
  { id: "VelKoz",       name: "Vel'Koz",       vi: "Vel'Koz",       damageType: "AP",    role: "Mage",     burst: true,  cc: "medium", healing: false, threat: 7 },
  { id: "Rumble",       name: "Rumble",        vi: "Rumble",        damageType: "AP",    role: "Fighter",  burst: false, cc: "high",   healing: false, threat: 7 },
  { id: "Ryze",         name: "Ryze",          vi: "Ryze",          damageType: "AP",    role: "Mage",     burst: true,  cc: "low",    healing: false, threat: 7 },
  { id: "Gnar",         name: "Gnar",          vi: "Gnar",          damageType: "mixed", role: "Fighter",  burst: false, cc: "high",   healing: false, threat: 7 },
  { id: "Nocturne",     name: "Nocturne",      vi: "Nocturne",      damageType: "AD",    role: "Assassin", burst: true,  cc: "medium", healing: false, threat: 8 },
];

// ─────────────── BUILD-IDENTITY (cách LÊN ĐỒ đặc trưng) ───────────────
// Grounding cho phần ĐỒ LÕI của tướng người chơi (trước đây AI phải tự nhớ).
// Mỗi tướng: [archetype, range, spike]
//   archetype: xác định trục lên đồ (xem BUILD_LABELS)
//   range    : "xa" (tầm xa) | "can" (cận chiến)
//   spike    : "som" | "giua" | "muon" (mạnh sớm / giữa / cuối trận)
const BUILD = {
  // Assassin
  Zed: ["ad-xuyen-giap", "can", "som"], Talon: ["ad-xuyen-giap", "can", "som"],
  Akali: ["ap-no", "can", "giua"], Katarina: ["ap-no", "can", "giua"],
  Fizz: ["ap-no", "can", "giua"], Evelynn: ["ap-no", "can", "giua"],
  Khazix: ["ad-xuyen-giap", "can", "giua"], Pyke: ["ad-xuyen-giap", "can", "giua"],
  Kassadin: ["ap-no", "can", "muon"], Ekko: ["ap-no", "can", "giua"],
  Rengar: ["ad-xuyen-giap", "can", "giua"], Diana: ["ap-no", "can", "giua"],
  MasterYi: ["ad-on-hit", "can", "muon"],
  // Marksman
  Jinx: ["ad-chi-mang", "xa", "muon"], Caitlyn: ["ad-chi-mang", "xa", "giua"],
  Vayne: ["ad-on-hit", "xa", "muon"], Ezreal: ["ad-dau-si", "xa", "giua"],
  Lucian: ["ad-chi-mang", "xa", "som"], Jhin: ["ad-chi-mang", "xa", "giua"],
  Tristana: ["ad-chi-mang", "xa", "giua"], Kaisa: ["ad-on-hit", "xa", "giua"],
  Samira: ["ad-chi-mang", "can", "giua"], Ashe: ["ad-chi-mang", "xa", "giua"],
  Draven: ["ad-chi-mang", "xa", "som"], MissFortune: ["ad-chi-mang", "xa", "giua"],
  Varus: ["ad-on-hit", "xa", "giua"], Xayah: ["ad-chi-mang", "xa", "giua"],
  Corki: ["ad-on-hit", "xa", "giua"], Graves: ["ad-xuyen-giap", "xa", "giua"],
  Teemo: ["ap-danh-chieu", "xa", "giua"], Sivir: ["ad-chi-mang", "xa", "giua"],
  Nilah: ["ad-chi-mang", "can", "giua"], Twitch: ["ad-on-hit", "xa", "muon"],
  Zeri: ["ad-chi-mang", "xa", "muon"], Akshan: ["ad-xuyen-giap", "xa", "giua"],
  Kalista: ["ad-on-hit", "xa", "giua"], Kindred: ["ad-on-hit", "xa", "muon"],
  // Mage
  Ahri: ["ap-no", "xa", "giua"], Lux: ["ap-no", "xa", "giua"],
  Orianna: ["ap-no", "xa", "giua"], Veigar: ["ap-no", "xa", "muon"],
  Brand: ["ap-no", "xa", "giua"], Seraphine: ["ho-tro-hoi-khien", "xa", "giua"],
  Ziggs: ["ap-poke", "xa", "giua"], Annie: ["ap-no", "xa", "giua"],
  AurelionSol: ["ap-poke", "xa", "muon"], Heimerdinger: ["ap-poke", "xa", "giua"],
  Kennen: ["ap-no", "xa", "giua"], Lissandra: ["ap-no", "xa", "giua"],
  Syndra: ["ap-no", "xa", "giua"], TwistedFate: ["ap-no", "xa", "giua"],
  Swain: ["ap-dau-si", "xa", "giua"], Vex: ["ap-no", "xa", "giua"],
  Viktor: ["ap-poke", "xa", "muon"], Vladimir: ["ap-dau-si", "can", "muon"],
  Zoe: ["ap-no", "xa", "giua"], Zyra: ["ho-tro-phep", "xa", "giua"],
  FiddleSticks: ["ap-no", "xa", "giua"], Lillia: ["ap-dau-si", "can", "giua"],
  // Fighter
  Garen: ["ad-dau-si", "can", "giua"], Darius: ["ad-dau-si", "can", "som"],
  Fiora: ["ad-dau-si", "can", "giua"], Camille: ["ad-dau-si", "can", "giua"],
  Sett: ["ad-dau-si", "can", "giua"], Jax: ["ad-dau-si", "can", "giua"],
  Irelia: ["ad-dau-si", "can", "giua"], Renekton: ["ad-dau-si", "can", "som"],
  Olaf: ["ad-dau-si", "can", "som"], Aatrox: ["ad-dau-si", "can", "giua"],
  LeeSin: ["ad-dau-si", "can", "som"], Yasuo: ["ad-chi-mang", "can", "giua"],
  Yone: ["ad-chi-mang", "can", "giua"], Warwick: ["ad-on-hit", "can", "giua"],
  Hecarim: ["ad-dau-si", "can", "giua"], Urgot: ["ad-dau-si", "can", "giua"],
  Kayn: ["ad-dau-si", "can", "giua"], Gwen: ["ap-danh-chieu", "can", "giua"],
  Kayle: ["ap-danh-chieu", "xa", "muon"], Jayce: ["ad-xuyen-giap", "can", "giua"],
  Riven: ["ad-dau-si", "can", "giua"], Pantheon: ["ad-dau-si", "can", "som"],
  MonkeyKing: ["ad-dau-si", "can", "giua"], XinZhao: ["ad-dau-si", "can", "giua"],
  Vi: ["ad-dau-si", "can", "giua"], Tryndamere: ["ad-chi-mang", "can", "giua"],
  Shyvana: ["ad-on-hit", "can", "giua"], JarvanIV: ["ad-dau-si", "can", "giua"],
  Nasus: ["ad-do-don", "can", "muon"], Viego: ["ad-dau-si", "can", "giua"],
  Mordekaiser: ["ap-dau-si", "can", "giua"], Sion: ["do-don-mo-giao-tranh", "can", "giua"],
  // Tank
  Malphite: ["do-don-mo-giao-tranh", "can", "giua"], Leona: ["do-don-mo-giao-tranh", "can", "giua"],
  Nautilus: ["do-don-mo-giao-tranh", "can", "giua"], Rammus: ["do-don-mo-giao-tranh", "can", "giua"],
  Amumu: ["do-don-mo-giao-tranh", "can", "giua"], Ornn: ["do-don-mo-giao-tranh", "can", "giua"],
  Alistar: ["do-don-mo-giao-tranh", "can", "giua"], Braum: ["do-don-mo-giao-tranh", "can", "giua"],
  DrMundo: ["ad-do-don", "can", "muon"], Galio: ["do-don-mo-giao-tranh", "can", "giua"],
  Gragas: ["do-don-mo-giao-tranh", "can", "giua"], Maokai: ["do-don-mo-giao-tranh", "can", "giua"],
  Nunu: ["do-don-mo-giao-tranh", "can", "giua"], Shen: ["do-don-mo-giao-tranh", "can", "giua"],
  Singed: ["do-don-mo-giao-tranh", "can", "giua"], Volibear: ["do-don-mo-giao-tranh", "can", "giua"],
  // Support
  Thresh: ["do-don-mo-giao-tranh", "xa", "giua"], Lulu: ["ho-tro-hoi-khien", "xa", "giua"],
  Soraka: ["ho-tro-hoi-khien", "xa", "giua"], Nami: ["ho-tro-hoi-khien", "xa", "giua"],
  Yuumi: ["ho-tro-hoi-khien", "xa", "giua"], Blitzcrank: ["do-don-mo-giao-tranh", "can", "giua"],
  Janna: ["ho-tro-hoi-khien", "xa", "giua"], Karma: ["ho-tro-phep", "xa", "giua"],
  Milio: ["ho-tro-hoi-khien", "xa", "giua"], Morgana: ["ho-tro-phep", "xa", "giua"],
  Rakan: ["do-don-mo-giao-tranh", "can", "giua"], Senna: ["ad-chi-mang", "xa", "muon"],
  Sona: ["ho-tro-hoi-khien", "xa", "giua"], Bard: ["ho-tro-phep", "xa", "giua"],
  Zilean: ["ho-tro-phep", "xa", "giua"], Rell: ["do-don-mo-giao-tranh", "can", "giua"],
  // Roster mới
  Ambessa: ["ad-dau-si", "can", "giua"], Mel: ["ap-no", "xa", "giua"],
  Smolder: ["ad-chi-mang", "xa", "muon"], Aurora: ["ap-no", "xa", "giua"],
  Nidalee: ["ap-poke", "xa", "giua"], Norra: ["ap-no", "xa", "giua"],
  Skarner: ["do-don-mo-giao-tranh", "can", "giua"], Taliyah: ["ap-no", "xa", "giua"],
  KSante: ["do-don-mo-giao-tranh", "can", "giua"], KogMaw: ["ad-on-hit", "xa", "muon"],
  Poppy: ["do-don-mo-giao-tranh", "can", "giua"], VelKoz: ["ap-poke", "xa", "giua"],
  Rumble: ["ap-dau-si", "can", "giua"], Ryze: ["ap-no", "xa", "muon"],
  Gnar: ["do-don-mo-giao-tranh", "xa", "giua"], Nocturne: ["ad-xuyen-giap", "can", "giua"],
};

// Diễn giải archetype sang câu mô tả gửi cho AI (grounding chọn đồ lõi)
export const BUILD_LABELS = {
  "ad-chi-mang": "AD chí mạng (lên chí mạng + tốc đánh, vd Vô Cực Kiếm)",
  "ad-on-hit": "AD on-hit (% máu, vd Gươm Suy Vong/Cuồng Đao)",
  "ad-xuyen-giap": "AD xuyên giáp/sát thủ (lethality, burst lẻ)",
  "ad-dau-si": "đấu sĩ AD (Tam Hợp/Rìu Đen, lì đòn)",
  "ad-do-don": "đỡ đòn AD (trâu máu, scale muộn)",
  "ap-no": "pháp sư burst (nổ combo)",
  "ap-poke": "pháp sư poke tầm xa (bào máu)",
  "ap-danh-chieu": "AP đánh-chiêu/on-hit (Nanh Nashor, DPS)",
  "ap-dau-si": "đấu sĩ AP/battlemage (lì + sát thương phép)",
  "do-don-mo-giao-tranh": "đỡ đòn mở giao tranh (tank engage)",
  "ho-tro-hoi-khien": "hỗ trợ hồi máu/khiên (enchanter)",
  "ho-tro-phep": "hỗ trợ phép/khống chế (mage support)",
};

// Gắn build-identity vào từng tướng để findChampion trả về luôn
for (const c of CHAMPIONS) {
  const b = BUILD[c.id];
  if (b) {
    c.build = b[0];
    c.range = b[1];
    c.spike = b[2];
  }
}

// Allowlist tên tướng (Anh) để ép model chỉ gợi ý tướng thật khi đề xuất chọn tướng
export const CHAMPION_ALLOWLIST = CHAMPIONS.map((c) => c.name);

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

// Map slug (từ web tier list) → tướng. Khớp cả dạng có gạch (kha-zix) lẫn liền (khazix).
const SLUG_ALIAS = { lilia: "Lillia" }; // site gõ sai/khác
const SLUG_MAP = (() => {
  const map = {};
  for (const c of CHAMPIONS) {
    const base = noDiacritics(c.name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const tight = noDiacritics(c.name).replace(/[^a-z0-9]+/g, "");
    map[base] = c;
    map[tight] = c;
  }
  return map;
})();
export function findChampionBySlug(slug) {
  if (!slug) return null;
  const s = String(slug).toLowerCase();
  if (SLUG_ALIAS[s]) return findChampion(SLUG_ALIAS[s]);
  return SLUG_MAP[s] || SLUG_MAP[s.replace(/-/g, "")] || null;
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
