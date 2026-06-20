// src/lib/images.js
// Lấy icon tướng từ Riot Data Dragon CDN (icon LoL PC — sát với Wild Rift đủ dùng).
// Wild Rift KHÔNG có CDN item công khai → item dùng ô lục giác fallback ở UI.

let DDRAGON_VERSION = "14.10.1"; // fallback nếu chưa resolve được version mới nhất

// Map ID đặc biệt: tên trong DB → ID Data Dragon (phân biệt hoa thường)
const ID_MAP = {
  "Kai'Sa": "Kaisa",
  "Kha'Zix": "Khazix",
  "Cho'Gath": "Chogath",
  "Vel'Koz": "Velkoz",
  "Kog'Maw": "KogMaw",
  "Rek'Sai": "RekSai",
  "Bel'Veth": "Belveth",
  Wukong: "MonkeyKing",
  "Dr. Mundo": "DrMundo",
  "Renata Glasc": "Renata",
  "Nunu & Willump": "Nunu",
  "Lee Sin": "LeeSin",
  "Master Yi": "MasterYi",
  "Miss Fortune": "MissFortune",
  "Tahm Kench": "TahmKench",
  "Twisted Fate": "TwistedFate",
  "Xin Zhao": "XinZhao",
  "Aurelion Sol": "AurelionSol",
  "Jarvan IV": "JarvanIV",
  LeBlanc: "Leblanc",
};

// Gọi 1 lần khi app mount để lấy version mới nhất
export async function resolveDDragonVersion() {
  try {
    const res = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const list = await res.json();
    if (Array.isArray(list) && list[0]) DDRAGON_VERSION = list[0];
  } catch (_) {
    // giữ fallback, không chặn app
  }
  return DDRAGON_VERSION;
}

// Chuẩn hóa ID Data Dragon từ tên/id tướng
function toDDragonId(champ) {
  if (!champ) return null;
  const key = champ.name || champ.id || champ;
  if (ID_MAP[key]) return ID_MAP[key];
  // mặc định: bỏ ký tự không phải chữ/số, giữ nguyên hoa thường gốc nếu có id
  if (champ.id) return champ.id.replace(/[^a-zA-Z0-9]/g, "");
  return String(key).replace(/[^a-zA-Z0-9]/g, "");
}

// URL icon vuông của tướng
export function championIcon(champ) {
  const id = toDDragonId(champ);
  if (!id) return null;
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion/${id}.png`;
}

// Item: nếu DB có img thì dùng, không thì null (UI vẽ lục giác)
export function itemIcon(item) {
  return item && item.img ? item.img : null;
}
