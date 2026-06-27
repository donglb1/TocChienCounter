// src/lib/draftAnalysis.js
// Phân tích đội hình OFFLINE (không tốn API) cho màn gợi ý: cân bằng sát thương +
// lỗ hổng vai trò đội mình, và gợi ý BAN dựa trên độ nguy hiểm (threat) tướng địch.
import { findChampion } from "../data/champions";

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
