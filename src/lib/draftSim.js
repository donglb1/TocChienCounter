// src/lib/draftSim.js
// Logic MÔ PHỎNG DRAFT (cấm/chọn theo lượt) — OFFLINE, không tốn API.
// Gợi ý mỗi lượt: CẤM = tướng mạnh/nguy hiểm nhất còn lại; CHỌN = mạnh + khắc hệ sát thương địch + lấp lỗ hổng đội.
import { CHAMPIONS } from "../data/champions";

// Thứ tự draft kiểu xếp hạng: 3 cấm xen kẽ mỗi bên, rồi 5 chọn theo kiểu rắn (blue=Mình).
// blue: B1 R1 B2 R2 B3 R3 | B1 R1 R2 B2 B3 R3 R4 B4 B5 R5
export const DRAFT_STEPS = [
  { team: "ally", type: "ban" }, { team: "enemy", type: "ban" },
  { team: "ally", type: "ban" }, { team: "enemy", type: "ban" },
  { team: "ally", type: "ban" }, { team: "enemy", type: "ban" },
  { team: "ally", type: "pick" }, { team: "enemy", type: "pick" },
  { team: "enemy", type: "pick" }, { team: "ally", type: "pick" },
  { team: "ally", type: "pick" }, { team: "enemy", type: "pick" },
  { team: "enemy", type: "pick" }, { team: "ally", type: "pick" },
  { team: "ally", type: "pick" }, { team: "enemy", type: "pick" },
];

const TIER_SCORE = { "S+": 100, S: 84, "A+": 60, A: 44, B: 24, C: 10, D: 5 };

// Tier của 1 tướng: ưu tiên tierMap (tier list live) → tier gắn sẵn trong object.
export function tierOf(champ, tierMap) {
  return (tierMap && tierMap[champ.id]) || champ.tier || null;
}

// Điểm sức mạnh: có tier → trộn tier + threat; không có → chỉ threat.
function powerScore(champ, tierMap) {
  const ts = TIER_SCORE[tierOf(champ, tierMap)];
  return ts != null ? ts * 0.8 + (champ.threat || 0) * 2 : (champ.threat || 0) * 9;
}

// Cân bằng AD/AP của 1 nhóm tướng (mixed/true → chia đôi).
function damageMix(champs) {
  let ad = 0, ap = 0;
  for (const c of champs) {
    if (c.damageType === "AD") ad += 1;
    else if (c.damageType === "AP") ap += 1;
    else { ad += 0.5; ap += 0.5; }
  }
  return { ad, ap };
}

// Gợi ý CẤM: tướng mạnh/nguy hiểm nhất còn lại (loại tướng đã cấm/chọn).
export function suggestBans(used, tierMap, limit = 6) {
  return CHAMPIONS
    .filter((c) => !used.has(c.id))
    .map((c) => ({ champ: c, score: powerScore(c, tierMap), reason: banReason(c, tierOf(c, tierMap)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function banReason(c, tier) {
  if (c.role === "Assassin" && c.burst) return "Sát thủ bùng nổ — xóa chủ lực";
  if (c.healing) return "Hồi máu lì — khó hạ";
  if (c.cc === "high") return "Khống chế diện rộng";
  if (c.role === "Marksman") return "Xạ thủ gánh kèo cuối trận";
  return tier ? `Tier ${tier} — rất mạnh patch này` : "Tướng nguy hiểm";
}

// Gợi ý CHỌN cho đội mình: mạnh + khắc hệ sát thương địch + lấp lỗ hổng đội mình.
export function suggestPicks(allyChamps, enemyChamps, used, tierMap, limit = 6) {
  const enemyMix = damageMix(enemyChamps);
  const allyMix = damageMix(allyChamps);
  const hasTank = allyChamps.some((c) => c.role === "Tank");
  const hasCC = allyChamps.some((c) => c.cc === "high" || c.cc === "medium");

  return CHAMPIONS
    .filter((c) => !used.has(c.id))
    .map((c) => {
      let score = powerScore(c, tierMap);
      let reason = null;
      // Khắc hệ sát thương địch: địch lệch AD → AP của ta đỡ bị khắc giáp (và ngược lại).
      if (enemyChamps.length >= 2) {
        if (enemyMix.ad > enemyMix.ap + 1 && c.damageType === "AP") { score += 14; reason = "Địch lệch AD — AP khó bị khắc"; }
        else if (enemyMix.ap > enemyMix.ad + 1 && c.damageType === "AD") { score += 14; reason = "Địch lệch AP — AD khó bị khắc"; }
      }
      // Lấp lỗ hổng đội mình (ưu tiên cao hơn).
      if (!hasTank && c.role === "Tank") { score += 18; reason = "Bổ sung đỡ đòn cho đội"; }
      else if (!hasCC && c.cc === "high") { score += 12; reason = reason || "Bổ sung khống chế mở giao tranh"; }
      // Cân bằng sát thương đội.
      if (!reason && allyChamps.length >= 1) {
        if (allyMix.ad > allyMix.ap + 1 && c.damageType === "AP") { score += 8; reason = "Cân bằng sát thương (thêm AP)"; }
        else if (allyMix.ap > allyMix.ad + 1 && c.damageType === "AD") { score += 8; reason = "Cân bằng sát thương (thêm AD)"; }
      }
      return { champ: c, score, reason };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
