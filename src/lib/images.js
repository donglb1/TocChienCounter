// src/lib/images.js
// Lấy icon tướng từ Riot Data Dragon CDN (icon LoL PC — sát với Wild Rift đủ dùng).
// Item: ưu tiên icon Wild Rift THẬT từ catalog live (backend /api/items), fallback icon
// LoL PC (DDragon) rồi ô lục giác ở UI.

import { setLiveChampMeta, getLiveItemByName } from "./liveData";
import { getCached, setCached } from "./storage";

const DATA_TTL = 24 * 60 * 60 * 1000; // 24h: trong TTL thì dùng cache, hết hạn mới fetch lại

let DDRAGON_VERSION = "16.12.1"; // fallback nếu chưa resolve được version mới nhất

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

// Gọi 1 lần khi app mount để lấy version mới nhất. Cache-first: dùng version đã lưu
// (kể cả offline) rồi chỉ fetch lại khi cache cũ hơn TTL.
export async function resolveDDragonVersion() {
  const cached = await getCached("ddragon-version");
  if (cached && cached.data) DDRAGON_VERSION = cached.data;
  if (cached && Date.now() - cached.fetchedAt < DATA_TTL) return DDRAGON_VERSION; // còn tươi → bỏ qua mạng
  try {
    const res = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json"
    );
    const list = await res.json();
    if (Array.isArray(list) && list[0]) {
      DDRAGON_VERSION = list[0];
      setCached("ddragon-version", DDRAGON_VERSION);
    }
  } catch (_) {
    // giữ fallback/cache, không chặn app
  }
  return DDRAGON_VERSION;
}

// Map tên tướng → ID Data Dragon (để lấy icon cho TƯỚNG MỚI chưa có trong DB tĩnh).
let DDRAGON_NAME_MAP = null;
function normName(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’.\s&]/g, "")
    .toLowerCase();
}
// Nạp roster: build name→id map (icon) + metadata (damageType/role) cho tướng mới.
// Nhận shape rút gọn { [id]: {id, name, tags, info} } — dùng được cho cả cache lẫn fetch live.
function applyRoster(data) {
  const map = {};
  for (const k in data || {}) {
    const c = data[k];
    if (!c || !c.name || !c.id) continue;
    map[normName(c.name)] = c.id;
    map[normName(c.id)] = c.id;
  }
  DDRAGON_NAME_MAP = map;
  setLiveChampMeta(data || {});
}

// Cache-first: áp roster đã lưu ngay (hiện icon/metadata kể cả offline), chỉ tải lại khi hết TTL.
export async function resolveChampionRoster() {
  const cached = await getCached("ddragon-roster");
  if (cached && cached.data) applyRoster(cached.data);
  if (cached && Date.now() - cached.fetchedAt < DATA_TTL) return DDRAGON_NAME_MAP; // còn tươi
  try {
    if (!DDRAGON_VERSION) await resolveDDragonVersion();
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/data/en_US/champion.json`
    );
    const json = await res.json();
    // Rút gọn trước khi lưu: chỉ giữ field thật sự dùng (id/name/tags/info) cho cache nhẹ.
    const slim = {};
    for (const k in json.data || {}) {
      const c = json.data[k];
      slim[c.id] = { id: c.id, name: c.name, tags: c.tags, info: c.info };
    }
    if (Object.keys(slim).length) {
      applyRoster(slim);
      setCached("ddragon-roster", slim);
    }
  } catch (_) {
    // không chặn app — đã có cache (nếu có) hoặc fallback chữ
  }
  return DDRAGON_NAME_MAP;
}
export function ddragonIdByName(name) {
  if (!DDRAGON_NAME_MAP || !name) return null;
  return DDRAGON_NAME_MAP[normName(name)] || null;
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

// Map tên item (Anh) → ID item Data Dragon (LoL PC). Wild Rift KHÔNG có CDN item
// công khai, nhưng đa số item trùng tên LoL PC nên mượn icon DDragon (art gần giống).
// Item riêng WR / giày / phù phép không có trong DDragon → không nằm trong map →
// itemIcon trả null → UI vẽ ô lục giác fallback như cũ.
const ITEM_DDRAGON_ID = {
  "Thornmail": "3075",
  "Randuin's Omen": "3143",
  "Frozen Heart": "3110",
  "Dead Man's Plate": "3742",
  "Iceborn Gauntlet": "6662",
  "Sunfire Aegis": "3068",
  "Hollow Radiance": "6664",
  "Abyssal Mask": "8020",
  "Force of Nature": "4401",
  "Kaenic Rookern": "2504",
  "Bulwark of the Mountain": "3860",
  "Warmog's Armor": "3083",
  "Heartsteel": "3084",
  "Titanic Hydra": "3748",
  "Fimbulwinter": "3121",
  "Winter's Approach": "3119",
  "Sterak's Gage": "3053",
  "Overlord's Bloodmail": "2501",
  "Unending Despair": "2502",
  "Radiant Virtue": "6667",
  "Zeke's Convergence": "3050",
  "Guardian Angel": "3026",
  "Maw of Malmortius": "3156",
  "Mercury's Treads": "3111",
  "Plated Steelcaps": "3047",
  "Berserker's Greaves": "3006",
  "Ionian Boots of Lucidity": "3158",
  "Gluttonous Greaves": "3008",
  "Dream Maker": "3870",
  "Galeforce": "6671",
  "Goredrinker": "6630",
  "Stridebreaker": "6631",
  "Infinity Edge": "3031",
  "Blade of the Ruined King": "3153",
  "Kraken Slayer": "6672",
  "Guinsoo's Rageblade": "3124",
  "Terminus": "3302",
  "Stormrazor": "3097",
  "Phantom Dancer": "3046",
  "Runaan's Hurricane": "3085",
  "Essence Reaver": "3508",
  "Death's Dance": "6333",
  "Bloodthirster": "3072",
  "Immortal Shieldbow": "6673",
  "Sundered Sky": "6610",
  "Lord Dominik's Regards": "3036",
  "Mortal Reminder": "3033",
  "Serylda's Grudge": "6694",
  "Black Cleaver": "3071",
  "The Collector": "6676",
  "Youmuu's Ghostblade": "3142",
  "Duskblade of Draktharr": "6691",
  "Eclipse": "6692",
  "Serpent's Fang": "6695",
  "Chempunk Chainsword": "6609",
  "Trinity Force": "3078",
  "Divine Sunderer": "6632",
  "Spear of Shojin": "3161",
  "Experimental Hexplate": "3073",
  "Hullbreaker": "3181",
  "Edge of Night": "3814",
  "Wit's End": "3091",
  "Manamune": "3004",
  "Muramana": "3042",
  "Rabadon's Deathcap": "3089",
  "Luden's Echo": "6655",
  "Liandry's Torment": "6653",
  "Lich Bane": "3100",
  "Horizon Focus": "4628",
  "Malignance": "3118",
  "Morellonomicon": "3165",
  "Rylai's Crystal Scepter": "3116",
  "Cosmic Drive": "4629",
  "Riftmaker": "4633",
  "Rod of Ages": "6657",
  "Archangel's Staff": "3003",
  "Seraph's Embrace": "3040",
  "Crown of the Shattered Queen": "4644",
  "Nashor's Tooth": "3115",
  "Mejai's Soulstealer": "3041",
  "Knight's Vow": "3109",
  "Ardent Censer": "3504",
  "Imperial Mandate": "4005",
  "Redemption": "3107",
  "Relic Shield": "3858",
  "Spectral Sickle": "3862",
};

// Item icon: ưu tiên img sẵn trong DB → icon Wild Rift THẬT (catalog live) →
// icon LoL PC mượn tạm (DDragon) → null (UI vẽ ô lục giác).
export function itemIcon(item) {
  if (!item) return null;
  if (item.img) return item.img;
  const live = getLiveItemByName(item.name);
  if (live && live.icon) return live.icon;
  const id = ITEM_DDRAGON_ID[item.name];
  if (id) return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${id}.png`;
  return null;
}
