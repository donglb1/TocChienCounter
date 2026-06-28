// src/lib/draftAnalysis.js
// Phân tích đội hình OFFLINE (không tốn API) cho màn gợi ý: cân bằng sát thương +
// lỗ hổng vai trò đội mình, và gợi ý BAN dựa trên độ nguy hiểm (threat) tướng địch.
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

// Gợi ý BAN: tướng địch đã lộ, xếp theo độ nguy hiểm giảm dần (chỉ lấy threat đủ cao).
// → [{ champ, threat }]
export function banSuggestions(enemies, { limit = 3, minThreat = 7 } = {}) {
  return (enemies || [])
    .map((e) => findChampion(e.name))
    .filter((c) => c && (c.threat || 0) >= minThreat)
    .sort((a, b) => (b.threat || 0) - (a.threat || 0))
    .slice(0, limit)
    .map((champ) => ({ champ, threat: champ.threat || 0 }));
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
