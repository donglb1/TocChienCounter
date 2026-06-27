// src/lib/images.js
// Lấy icon tướng từ Riot Data Dragon CDN (icon LoL PC — sát với Wild Rift đủ dùng).
// Item: ưu tiên icon Wild Rift THẬT từ catalog live (backend /api/items), fallback icon
// LoL PC (DDragon) rồi ô lục giác ở UI.

import { setLiveChampMeta, getLiveItemByName } from "./liveData";
import { cachedResolve } from "./storage";
import { nameKey } from "../theme";

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

// Gọi 1 lần khi app mount để lấy version mới nhất. Cache-first qua cachedResolve.
export async function resolveDDragonVersion() {
  await cachedResolve(
    "ddragon-version",
    DATA_TTL,
    async () => {
      const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
      const list = await res.json();
      return Array.isArray(list) && list[0] ? list[0] : null;
    },
    (v) => { DDRAGON_VERSION = v; }
  );
  return DDRAGON_VERSION;
}

// Map tên tướng → ID Data Dragon (để lấy icon cho TƯỚNG MỚI chưa có trong DB tĩnh).
let DDRAGON_NAME_MAP = null;
const normName = nameKey; // chuẩn hóa tên chung (bỏ dấu + ký tự đặc biệt)
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
  await cachedResolve(
    "ddragon-roster",
    DATA_TTL,
    async () => {
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
      return Object.keys(slim).length ? slim : null;
    },
    applyRoster
  );
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
// DDragon item IDs (LoL PC) dùng làm fallback icon khi live catalog chưa có.
// Chỉ giữ item ĐANG tồn tại ở cả LoL PC lẫn Wild Rift với cùng artwork.
// Item riêng Wild Rift (Infinity Orb, Oceanid's Trident...) KHÔNG có ở đây —
// chúng lấy icon từ live catalog (backend /api/items).
const ITEM_DDRAGON_ID = {
  "Thornmail": "3075",
  "Randuin's Omen": "3143",
  "Frozen Heart": "3110",
  "Dead Man's Plate": "3742",
  "Sunfire Aegis": "3068",
  "Abyssal Mask": "3001",
  "Force of Nature": "4401",
  "Warmog's Armor": "3083",
  "Heartsteel": "3516",
  "Titanic Hydra": "3748",
  "Sterak's Gage": "3053",
  "Guardian Angel": "3026",
  "Maw of Malmortius": "3156",
  "Mercury's Treads": "3111",
  "Plated Steelcaps": "3047",
  "Berserker's Greaves": "3006",
  "Ionian Boots of Lucidity": "3158",
  "Infinity Edge": "3031",
  "Blade of the Ruined King": "3153",
  "Kraken Slayer": "6672",
  "Guinsoo's Rageblade": "3124",
  "Phantom Dancer": "3046",
  "Runaan's Hurricane": "3085",
  "Essence Reaver": "3508",
  "Bloodthirster": "3072",
  "Immortal Shieldbow": "6673",
  "Lord Dominik's Regards": "3036",
  "Mortal Reminder": "3033",
  "Black Cleaver": "3071",
  "Youmuu's Ghostblade": "3142",
  "Eclipse": "6692",
  "Trinity Force": "3078",
  "Spear of Shojin": "3161",
  "Hullbreaker": "3181",
  "Wit's End": "3091",
  "Manamune": "3004",
  "Rabadon's Deathcap": "3089",
  "Luden's Echo": "6655",
  "Liandry's Torment": "6653",
  "Lich Bane": "3100",
  "Morellonomicon": "3165",
  "Rylai's Crystal Scepter": "3116",
  "Rod of Ages": "6657",
  "Archangel's Staff": "3003",
  "Nashor's Tooth": "3115",
  "Knight's Vow": "3109",
  "Ardent Censer": "3504",
  "Redemption": "3107",
  "Zeke's Convergence": "3050",
  "Sundered Sky": "6610",
  "Serpent's Fang": "6695",
  "Chempunk Chainsword": "6609",
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

// ─── ICON NGỌC (perk DDragon, đường dẫn KHÔNG cần version) ───
// Ngọc chính (key = tên Anh) + ngọc phụ (key = tên Việt). Ngọc riêng WR không có icon → null (UI vẽ huy hiệu nhánh).
const PERK_BASE = "https://ddragon.leagueoflegends.com/cdn/img/";
const RUNE_ICON = {
  // Ngọc chính (theo tên Anh)
  "Electrocute": "perk-images/Styles/Domination/Electrocute/Electrocute.png",
  "Dark Harvest": "perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png",
  "Press the Attack": "perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png",
  "Lethal Tempo": "perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png",
  "Fleet Footwork": "perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png",
  "Conqueror": "perk-images/Styles/Precision/Conqueror/Conqueror.png",
  "Grasp of the Undying": "perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png",
  "Guardian": "perk-images/Styles/Resolve/Guardian/Guardian.png",
  "Summon Aery": "perk-images/Styles/Sorcery/SummonAery/SummonAery.png",
  "Arcane Comet": "perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png",
  "First Strike": "perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png",
  "Phase Rush": "perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png",
  "Glacial Augment": "perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png",
  // Ngọc phụ (theo tên Việt) — chỉ map món trùng rune PC
  "Phát Bắn Đơn Giản": "perk-images/Styles/Domination/CheapShot/CheapShot.png",
  "Tác Động Bất Chợt": "perk-images/Styles/Domination/SuddenImpact/SuddenImpact.png",
  "Thu Thập Nhãn Cầu": "perk-images/Styles/Domination/EyeballCollection/EyeballCollection.png",
  "Thợ Săn Tài Tình": "perk-images/Styles/Domination/TreasureHunter/TreasureHunter.png",
  "Thợ Săn Tàn Nhẫn": "perk-images/Styles/Domination/RelentlessHunter/RelentlessHunter.png",
  "Mắt Thây Ma": "perk-images/Styles/Domination/GhostPoro/GhostPoro.png",
  "Chốt Chặn Cuối Cùng": "perk-images/Styles/Sorcery/LastStand/LastStand.png",
  "Đốn Hạ": "perk-images/Styles/Precision/CutDown/CutDown.png",
  "Nhát Chém Ân Huệ": "perk-images/Styles/Precision/CoupDeGrace/CoupDeGrace.png",
  "Huyền Thoại: Tốc Độ Đánh": "perk-images/Styles/Precision/LegendAlacrity/LegendAlacrity.png",
  "Huyền Thoại: Hút Máu": "perk-images/Styles/Precision/LegendBloodline/LegendBloodline.png",
  "Đắc Thắng": "perk-images/Styles/Precision/Triumph.png",
  "Cuồng Phong Tích Tụ": "perk-images/Styles/Sorcery/GatheringStorm/GatheringStorm.png",
  "Dải Băng Năng Lượng": "perk-images/Styles/Sorcery/ManaflowBand/ManaflowBand.png",
  "Áo Choàng Mây": "perk-images/Styles/Sorcery/NimbusCloak/6361.png",
  "Thiêu Rụi": "perk-images/Styles/Sorcery/Scorch/Scorch.png",
  "Ngọn Gió Thứ Hai": "perk-images/Styles/Resolve/SecondWind/SecondWind.png",
  "Giáp Cốt": "perk-images/Styles/Resolve/BonePlating/BonePlating.png",
  "Vững Vàng": "perk-images/Styles/Resolve/Conditioning/Conditioning.png",
  "Lan Tràn": "perk-images/Styles/Resolve/Overgrowth/Overgrowth.png",
  "Tiếp Súc": "perk-images/Styles/Resolve/Revitalize/Revitalize.png",
  "Suối Nguồn Sinh Mệnh": "perk-images/Styles/Resolve/FontOfLife/FontOfLife.png",
  "Tàn Phá Hủy Diệt": "perk-images/Styles/Resolve/Demolish/Demolish.png",
  "Tập Trung Tuyệt Đối": "perk-images/Styles/Sorcery/AbsoluteFocus/AbsoluteFocus.png",
  "Thăng Tiến Sức Mạnh": "perk-images/Styles/Sorcery/Transcendence/Transcendence.png",
  "Tốc Biến Ma Thuật": "perk-images/Styles/Inspiration/HextechFlashtraption/HextechFlashtraption.png",
};
// Icon 1 ngọc (chính/phụ). rune = object có name (Anh) hoặc vi. Không map được → null.
export function runeIcon(rune) {
  if (!rune) return null;
  const path = RUNE_ICON[rune.name] || RUNE_ICON[rune.vi];
  return path ? PERK_BASE + path : null;
}

// ─── ICON PHÉP BỔ TRỢ (summoner spell DDragon — giống Tốc Chiến) ───
const SPELL_DDRAGON = {
  Flash: "SummonerFlash", Ignite: "SummonerDot", Exhaust: "SummonerExhaust",
  Heal: "SummonerHeal", Barrier: "SummonerBarrier", Ghost: "SummonerHaste", Smite: "SummonerSmite",
};
export function spellIcon(spell) {
  if (!spell) return null;
  const id = SPELL_DDRAGON[spell.name];
  return id ? `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/spell/${id}.png` : null;
}
