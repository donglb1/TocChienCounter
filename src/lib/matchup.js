// src/lib/matchup.js
// Sinh MẸO KHẮC CHẾ 1v1 OFFLINE từ đặc tính tướng địch (damageType/burst/cc/healing/spike/range/threat).
// Không tốn API — phục vụ tra nhanh đối thủ cùng đường.

import { ITEMS } from "../data/items";

// Bộ TRANG BỊ KHẮC CHẾ (offline) theo đặc tính địch — chỉ chọn item PHÒNG THỦ/GIÀY curated
// (champ-agnostic: đúng bất kể bạn cầm tướng nào). Trả [{ item, reason }], tối đa 6 món.
export function counterItems(enemy) {
  if (!enemy) return [];
  const out = [];
  const seen = new Set();
  const isDef = (i) => i.type === "defense" || i.type === "boots";
  const has = (i, t) => (i.tags || []).includes(t);
  const pick = (pred, reason, n = 2) => {
    let count = 0;
    for (const i of ITEMS) {
      if (out.length >= 6 || count >= n) break;
      if (!seen.has(i.id) && isDef(i) && pred(i)) {
        seen.add(i.id);
        out.push({ item: i, reason });
        count++;
      }
    }
  };
  // ưu tiên: Vết Thương Sâu (nếu địch hồi máu) → kháng theo hệ sát thương → chống burst → kháng CC → chống chí mạng
  if (enemy.healing) pick((i) => has(i, "grievous"), "Giảm hồi máu địch (Vết Thương Sâu)", 2);
  if (enemy.damageType === "AP") pick((i) => has(i, "mr"), "Kháng phép chống sát thương AP", 2);
  else if (enemy.damageType === "AD") pick((i) => has(i, "armor"), "Giáp chống sát thương AD", 2);
  else {
    pick((i) => has(i, "mr"), "Kháng phép (địch sát thương hỗn hợp)", 1);
    pick((i) => has(i, "armor"), "Giáp (địch sát thương hỗn hợp)", 1);
  }
  if (enemy.burst) pick((i) => has(i, "shield") || has(i, "revive"), "Chống sát thương nổ (khiên/hồi sinh)", 1);
  if (enemy.cc === "high") pick((i) => has(i, "tenacity"), "Kháng hiệu ứng, giảm thời gian khống chế", 1);
  if (enemy.role === "Marksman" && !enemy.burst) pick((i) => has(i, "antiCrit"), "Chống chí mạng (xạ thủ crit)", 1);
  return out.slice(0, 6);
}

// Trả: { shopping: [{label, note}], tips: [string], danger: "low|mid|high" }
export function matchupTips(enemy) {
  if (!enemy) return null;
  const shopping = [];
  const tips = [];

  // ─── Đồ MUA SỚM theo loại sát thương ───
  if (enemy.damageType === "AP") {
    shopping.push({ label: "Kháng phép sớm", note: "Giày Thủy Ngân / Mặt Nạ Vực Thẳm" });
  } else if (enemy.damageType === "AD") {
    shopping.push({ label: "Giáp sớm", note: "Giày Thép Gai / áo giáp cơ bản" });
  } else if (enemy.damageType === "mixed") {
    shopping.push({ label: "Phòng thủ hỗn hợp", note: "Cân cả giáp lẫn kháng phép" });
  }

  if (enemy.healing) {
    shopping.push({ label: "Vết Thương Sâu (BẮT BUỘC)", note: "Cưa Xích Hóa Kỹ / Quỷ Thư Morello" });
    tips.push("Địch hồi máu mạnh — lên Vết Thương Sâu sớm, dồn sát thương nhanh thay vì kéo dài.");
  }
  if (enemy.burst) {
    shopping.push({ label: "Chống burst", note: "Áo Choàng Bóng Tối / Băng Giáp / khiên" });
    tips.push("Sát thương nổ cao — giữ khoảng cách, đừng để bị bắt lẻ, để dành phép thoát.");
  }
  if (enemy.cc === "high") {
    shopping.push({ label: "Kháng hiệu ứng", note: "Giày Thủy Ngân / Giải Thuật Ma Pháp" });
    tips.push("Nhiều khống chế — đừng đứng cụm, giữ Tốc Biến để né combo mở.");
  }

  // ─── MẸO đi đường theo spike/range/threat ───
  if (enemy.spike === "som") {
    tips.push("Địch mạnh sớm — tránh đối đầu tay đôi cấp 1-3, farm an toàn, chờ qua giai đoạn yếu của mình.");
  } else if (enemy.spike === "muon") {
    tips.push("Địch scale muộn — ép mạnh giai đoạn đầu, không cho farm/đẩy đường cướp lính.");
  }
  if (enemy.range === "xa") {
    tips.push("Địch tầm xa — né chiêu kỹ năng, tìm thời điểm áp sát rồi all-in.");
  } else if (enemy.range === "can") {
    tips.push("Địch cận chiến — giữ khoảng cách, bào máu khi nó vào tầm đánh thường.");
  }
  if ((enemy.threat || 0) >= 8) {
    tips.push("Tướng RẤT nguy hiểm — chủ động xin gank/hỗ trợ, cắm mắt phòng bị bắt.");
  }

  const danger = (enemy.threat || 0) >= 8 ? "high" : (enemy.threat || 0) >= 6 ? "mid" : "low";
  return { shopping, tips, danger };
}
