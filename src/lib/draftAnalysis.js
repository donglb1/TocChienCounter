// src/lib/draftAnalysis.js
// Phân tích đội hình OFFLINE (không tốn API): cân bằng sát thương + lỗ hổng vai trò đội mình,
// và xếp hạng BAN THEO META (tier list + threat) cho tab "Cấm".
import { findChampion, findChampionBySlug } from "../data/champions";

// Phân tích đội mình từ danh sách đồng đội đã chọn.
// → { count, adPercent, apPercent, gaps:[string] }
export function analyzeAllies(allies) {
  const champs = (allies || []).map((a) => findChampion(a.name)).filter(Boolean);
  let ad = 0, ap = 0;
  let hasTank = false, hasCC = false;
  for (const c of champs) {
    if (c.damageType === "AD") ad += 1;
    else if (c.damageType === "AP") ap += 1;
    else { ad += 0.5; ap += 0.5; } // mixed/true → chia đôi
    if (c.role === "Tank") hasTank = true;
    if (c.cc === "high" || c.cc === "medium") hasCC = true;
  }
  const total = ad + ap || 1;
  const gaps = [];
  if (champs.length >= 2) {
    if (!hasTank) gaps.push("Thiếu đỡ đòn/chống chịu");
    if (!hasCC) gaps.push("Thiếu khống chế mở giao tranh");
    if (ap === 0 && ad >= 2) gaps.push("Lệch toàn AD — dễ bị khắc giáp");
    if (ad === 0 && ap >= 2) gaps.push("Lệch toàn AP — dễ bị khắc kháng phép");
  }
  return {
    count: champs.length,
    adPercent: Math.round((ad / total) * 100),
    apPercent: Math.round((ap / total) * 100),
    gaps,
  };
}

// ─── Gợi ý BAN THEO META (không phụ thuộc team địch) ───
// Trộn TIER LIST hiện tại (sức mạnh thực tế patch này) + threat (độ nguy hiểm trong DB)
// để xếp hạng tướng đáng cấm nhất. Dùng cho màn "Cấm" độc lập.

// Trọng số tier → điểm sức mạnh meta (S+ áp đảo, giảm dần xuống D).
const TIER_SCORE = { "S+": 100, S: 84, "A+": 60, A: 44, B: 24, C: 10, D: 5 };

// Lane CHÍNH của 1 entry (lane đầu tiên tier list liệt kê). Nguồn gộp bot-lane chung "Dragon"(AD);
// tướng role Hỗ trợ đứng bot → ép về "Support" cho đúng filter.
function primaryLane(lanes, role) {
  const primary = (lanes || [])[0] || null;
  if (primary === "Dragon" && role === "Support") return "Support";
  return primary;
}

// Độ ưu tiên cấm theo điểm tổng → nhãn + mức (đổ màu trong UI).
function banPriority(score) {
  if (score >= 92) return { label: "Cấm gấp", level: "urgent" };
  if (score >= 68) return { label: "Nên cấm", level: "high" };
  if (score >= 42) return { label: "Cân nhắc", level: "mid" };
  return { label: "Tùy chọn", level: "low" };
}

// Lý do nên cấm — bám đặc tính tướng (DB) trước, rồi tới sức mạnh tier.
function banReason(champ, tier) {
  if (champ && champ.role) {
    if (champ.role === "Assassin" && champ.burst)
      return "Sát thủ bùng nổ — xóa sổ chủ lực chỉ trong vài đòn.";
    if (champ.healing && (champ.role === "Fighter" || champ.role === "Mage"))
      return "Hồi/hút máu lì lợm — rất khó hạ trong giao tranh kéo dài.";
    if (champ.cc === "high")
      return "Khống chế diện rộng — một combo khóa được cả đội.";
    if (champ.role === "Marksman")
      return "Xạ thủ gánh kèo — sát thương cuối trận cực cao.";
    if (champ.burst)
      return "Sát thương bùng nổ — hạ mục tiêu rất nhanh.";
    if (champ.role === "Fighter")
      return "Đấu sĩ lì đòn — snowball mạnh khi chiếm lợi thế đường.";
    return tier ? `Tier ${tier} — sức mạnh vượt trội ở patch hiện tại.` : "Tướng nguy hiểm, nên cấm sớm.";
  }
  return tier ? `Tier ${tier} — đang được ưa chuộng & rất mạnh ở meta này.` : "Đang nổi ở meta hiện tại.";
}

// entries = list từ tier list ({slug,name,tier,lanes}); offline có thể truyền entry tier=null.
// → [{ id, slug, name, vi, tier, lanes, role, damageType, threat, score, priority, reason, champ, _new }]
export function metaBanList(entries, { laneFilter = "all", limit = 15 } = {}) {
  const out = [];
  for (const e of entries || []) {
    const champ = findChampionBySlug(e.slug) || findChampion(e.name);
    const tier = e.tier || null;
    const threat = (champ && champ.threat) || 0;
    const tierScore = TIER_SCORE[tier];
    // Có tier → trộn sức mạnh meta (trọng số chính) + threat. Offline (không tier) → chỉ threat.
    const score = tierScore != null
      ? Math.round(tierScore * 0.78 + threat * 4.2)
      : Math.round(threat * 9);
    const lanes = e.lanes || champ?.lanes || [];
    out.push({
      id: champ?.id || e.slug || e.name,
      slug: e.slug || null,
      name: champ?.name || e.name,
      vi: champ?.vi || e.name,
      tier,
      lanes,
      role: champ?.role || "",
      damageType: champ?.damageType || "",
      threat,
      score,
      priority: banPriority(score),
      reason: banReason(champ, tier),
      champ: champ || { id: e.slug || e.name, name: e.name, vi: e.name, _new: true },
      _new: !champ,
    });
  }
  let arr = out;
  if (laneFilter && laneFilter !== "all") {
    arr = arr.filter((x) => primaryLane(x.lanes, x.role) === laneFilter);
  }
  return arr.sort((a, b) => b.score - a.score || (b.threat - a.threat)).slice(0, limit);
}

// ─── Gợi ý BAN từ SỐ LIỆU THẬT (win/pick/ban rate op.gg) ───
// Đáng cấm = mạnh (winRate) + được chuộng (pickRate) + đã bị cấm nhiều (banRate, tín hiệu mạnh nhất).
// stats = [{ name, lane, winRate, pickRate, banRate }] (đơn vị %).

// Lane op.gg (top/jungle/mid/adc/support…) → khóa filter chung (Baron/Jungle/Mid/Dragon/Support).
function laneKeyFromStats(lane) {
  const s = (lane || "").toLowerCase();
  if (/top|baron/.test(s)) return "Baron";
  if (/jung|^jg$|jgl/.test(s)) return "Jungle";
  if (/mid/.test(s)) return "Mid";
  if (/ad|adc|bot|duo|dragon|marks/.test(s)) return "Dragon";
  if (/sup/.test(s)) return "Support";
  return null;
}

// Lý do cấm bám số liệu (ưu tiên banRate) → rơi về đặc tính tướng nếu số liệu nhạt.
function statsBanReason(champ, wr, pr, br) {
  if (br != null && br >= 25) return `Bị cấm ${br}% — cộng đồng coi là mối nguy hàng đầu.`;
  if (wr != null && wr >= 53 && pr != null && pr >= 8) return `Thắng ${wr}% + được pick nhiều — đang áp đảo meta.`;
  if (wr != null && wr >= 53) return `Tỷ lệ thắng ${wr}% — vượt trội ở patch hiện tại.`;
  if (br != null && br >= 12) return `Bị cấm ${br}% — nhiều người ngại đối đầu.`;
  return banReason(champ, null);
}

export function metaBanListFromStats(stats, { laneFilter = "all", limit = 20 } = {}) {
  const rows = [];
  for (const s of stats || []) {
    const champ = findChampion(s.name);
    const wr = s.winRate, pr = s.pickRate, br = s.banRate;
    const threat = (champ && champ.threat) || 0;
    const wrEdge = wr != null ? wr - 50 : 0; // thắng trên 50% mới tính là "mạnh"
    // banRate là trọng số mạnh nhất; winRate trên ngưỡng nhân hệ số cao; pickRate & threat phụ.
    const score = Math.round((br || 0) * 1.2 + Math.max(0, wrEdge) * 3.5 + (pr || 0) * 0.4 + threat * 1.4);
    rows.push({
      id: champ?.id || s.name,
      slug: null,
      name: champ?.name || s.name,
      vi: champ?.vi || s.name,
      tier: null,
      lanes: champ?.lanes || [],
      laneKey: laneKeyFromStats(s.lane),
      role: champ?.role || "",
      damageType: champ?.damageType || "",
      threat,
      winRate: wr, pickRate: pr, banRate: br,
      score,
      priority: banPriority(score),
      reason: statsBanReason(champ, wr, pr, br),
      champ: champ || { id: s.name, name: s.name, vi: s.name, _new: true },
      _new: !champ,
    });
  }
  let arr = rows;
  if (laneFilter && laneFilter !== "all") {
    arr = arr.filter((x) => x.laneKey === laneFilter);
  } else {
    // Tướng nhiều đường → giữ entry điểm cao nhất để khỏi trùng trong danh sách tổng.
    const byId = {};
    for (const r of arr) if (!byId[r.id] || r.score > byId[r.id].score) byId[r.id] = r;
    arr = Object.values(byId);
  }
  return arr.sort((a, b) => b.score - a.score || (b.threat - a.threat)).slice(0, limit);
}
