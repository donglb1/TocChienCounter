// src/lib/matchup.js
// Sinh MẸO KHẮC CHẾ 1v1 OFFLINE từ đặc tính tướng địch (damageType/burst/cc/healing/spike/range/threat).
// Không tốn API — phục vụ tra nhanh đối thủ cùng đường.

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
