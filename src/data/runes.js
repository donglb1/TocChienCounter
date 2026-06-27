// src/data/runes.js
// DB Ngọc Bổ Trợ Tốc Chiến — dữ liệu ĐỐI CHIẾU trong game (ảnh người dùng cung cấp).
// Cấu trúc WR: 1 NGỌC CHÍNH (siêu cấp) + 3 NGỌC PHỤ (mỗi nhánh chọn 1).
//   name : tên Anh (giữ để khớp build mẫu/AI). Ngọc phụ không có tên Anh chuẩn → name = vi.
//   vi   : tên hiển thị tiếng Việt (CHUẨN theo game).
//   desc : tác dụng ngắn (hiện khi chạm + grounding cho AI).
//   tree : nhánh ngọc phụ (Áp Đảo | Chuẩn Xác | Kiên Định | Pháp Thuật).

// ─── NGỌC CHÍNH (Keystone) ───
export const KEYSTONES = [
  { name: "Electrocute", vi: "Sốc Điện", tree: "Áp Đảo", desc: "Đánh trúng 1 tướng 3 đòn/kỹ năng trong 3 giây gây thêm sát thương thích ứng. Cho sát thủ/burst." },
  { name: "Dark Harvest", vi: "Thu Thập Hắc Ám", tree: "Áp Đảo", desc: "Đánh tướng dưới 50% máu gây sát thương thích ứng + cộng dồn vĩnh viễn. Snowball sát thủ." },
  { name: "Press the Attack", vi: "Cường Lực", tree: "Chuẩn Xác", desc: "3 đòn liên tiếp lên tướng gây thêm sát thương thích ứng + khuếch đại 9% sát thương lên tướng đó. Cho xạ thủ/đánh thường." },
  { name: "Lethal Tempo", vi: "Nhịp Độ Chết Người", tree: "Chuẩn Xác", desc: "Cộng dồn Tốc Độ Đánh khi đánh tướng (tối đa 6); đầy thì thêm tầm đánh + vượt giới hạn tốc đánh. Cho xạ thủ on-hit." },
  { name: "Fleet Footwork", vi: "Bước Chân Thần Tốc", tree: "Chuẩn Xác", desc: "Tích điện khi di chuyển/đánh; đầy 100 thì đòn kế hồi máu + tốc đánh + tốc chạy. Cơ động, trụ kèo." },
  { name: "Conqueror", vi: "Chinh Phục", tree: "Chuẩn Xác", desc: "Cộng dồn Sức Mạnh Thích Ứng khi trúng tướng (tối đa 6); đầy thêm Hút Máu Toàn Phần. Cho đấu sĩ kéo dài giao tranh." },
  { name: "Grasp of the Undying", vi: "Quyền Năng Bất Diệt", tree: "Kiên Định", desc: "Mỗi 3 giây trong giao tranh, đòn kế cường hóa: +sát thương phép theo máu, hồi máu, +máu vĩnh viễn. Cho đỡ đòn/đấu sĩ (xa giảm 60%)." },
  { name: "Guardian", vi: "Người Bảo Hộ", tree: "Kiên Định", desc: "Bảo vệ đồng minh gần/được nhắm; khi nhận sát thương vượt ngưỡng, cả hai nhận lá chắn. Cho hỗ trợ." },
  { name: "Summon Aery", vi: "Aery", tree: "Pháp Thuật", desc: "Đòn đánh/kỹ năng phái Aery gây sát thương địch hoặc che chắn đồng minh. Cho pháp sư poke/enchanter." },
  { name: "Arcane Comet", vi: "Thiên Thạch Bí Ẩn", tree: "Pháp Thuật", desc: "Trúng tướng bằng kỹ năng thả thiên thạch gây sát thương phép; càng trúng càng mạnh. Cho pháp sư poke." },
  { name: "First Strike", vi: "Đòn Phủ Đầu", tree: "Pháp Thuật", desc: "Mở giao tranh trước → cho vàng + gây thêm 7% sát thương chuẩn, thưởng vàng theo sát thương. Cho pháp sư cần vàng/snowball." },
  { name: "Phase Rush", vi: "Tăng Tốc Pha", tree: "Pháp Thuật", desc: "Trúng tướng 3 lần trong 4 giây → tăng Tốc Chạy + giảm hồi chiêu kỹ năng cơ bản. Để kite/thoát." },
  { name: "Glacial Augment", vi: "Bá Chủ Vùng Băng", tree: "Pháp Thuật", desc: "Vô hiệu hóa 1 tướng tạo vùng băng làm chậm + tăng chống chịu + nổ sát thương phép. Cho kiểm soát/đỡ đòn." },
];

// ─── NGỌC PHỤ (theo 4 nhánh) ───
export const MINOR_RUNES = [
  // NHÁNH ÁP ĐẢO (Domination)
  { vi: "Phát Bắn Đơn Giản", tree: "Áp Đảo", desc: "Gây thêm sát thương chuẩn lên kẻ địch bị hạn chế di chuyển. (7s hồi chiêu)" },
  { vi: "Tác Động Bất Chợt", tree: "Áp Đảo", desc: "Sau khi lướt/nhảy/dịch chuyển/thoát tàng hình, đòn/kỹ năng kế lên tướng gây thêm sát thương chuẩn. (10s)" },
  { vi: "Đòn Đánh Cường Hóa", tree: "Áp Đảo", desc: "Mỗi 8 giây, đòn kế gây thêm sát thương thích ứng lên tướng (80% với tướng đánh xa)." },
  { vi: "Liên Kích", tree: "Áp Đảo", desc: "Kỹ năng trúng tướng đặt dấu ấn; 2 đòn/kỹ năng kế gây thêm sát thương thích ứng. (15s)" },
  { vi: "Bạo Chúa", tree: "Áp Đảo", desc: "Đánh tướng dưới 50% máu gây thêm sát thương thích ứng. (10s)" },
  { vi: "Nguyệt Quế Cao Ngạo", tree: "Áp Đảo", desc: "Tham gia hạ gục nhận Sức Mạnh Thích Ứng cộng dồn 30 giây." },
  { vi: "Thu Thập Nhãn Cầu", tree: "Áp Đảo", desc: "Hạ gục tướng/quái khủng cộng dồn +2 AD hoặc +4 AP (tối đa 8 lần)." },
  { vi: "Thợ Săn Tài Tình", tree: "Áp Đảo", desc: "+20 Hồi Kỹ Năng Trang Bị, +5 mỗi lần hạ gục đầu tiên với từng tướng (tối đa 5)." },
  { vi: "Thợ Săn Tàn Nhẫn", tree: "Áp Đảo", desc: "+10 Tốc Chạy ngoài giao tranh, +2 mỗi lần hạ gục đầu tiên (tối đa 5)." },
  { vi: "Mắt Thây Ma", tree: "Áp Đảo", desc: "Phá mắt địch tạo Mắt Thây Ma + cộng dồn AD/AP. Cho kiểm soát tầm nhìn." },

  // NHÁNH CHUẨN XÁC (Precision)
  { vi: "Chốt Chặn Cuối Cùng", tree: "Chuẩn Xác", desc: "Máu dưới 60% → đòn lên tướng gây thêm 5-11% sát thương thích ứng (tối đa khi dưới 30%)." },
  { vi: "Đốn Hạ", tree: "Chuẩn Xác", desc: "Gây thêm 8% sát thương thích ứng lên tướng trên 60% máu." },
  { vi: "Nhát Chém Ân Huệ", tree: "Chuẩn Xác", desc: "Gây thêm 8% sát thương thích ứng lên tướng dưới 40% máu." },
  { vi: "Huyền Thoại: Tốc Độ Đánh", tree: "Chuẩn Xác", desc: "+3% Tốc Độ Đánh, cộng dồn khi tham gia hạ gục (tối đa +20%)." },
  { vi: "Huyền Thoại: Kháng Hiệu Ứng", tree: "Chuẩn Xác", desc: "+3% Kháng Hiệu Ứng & Kháng Làm Chậm, cộng dồn khi hạ gục." },
  { vi: "Huyền Thoại: Hút Máu", tree: "Chuẩn Xác", desc: "+1% Hút Máu Toàn Phần, cộng dồn khi hạ gục (tối đa +7%)." },
  { vi: "Tàn Bạo", tree: "Chuẩn Xác", desc: "Đòn đánh gây thêm (6 + 8% cộng thêm) sát thương thích ứng lên tướng." },
  { vi: "Đắc Thắng", tree: "Chuẩn Xác", desc: "Tham gia hạ gục hồi 10% máu đã mất + 10% năng lượng + 35 Tốc Chạy 2 giây." },
  { vi: "Sĩ Khí", tree: "Chuẩn Xác", desc: "Cộng dồn khuếch đại sát thương kỹ năng cơ bản lên tướng (tối đa 3)." },

  // NHÁNH KIÊN ĐỊNH (Resolve)
  { vi: "Suối Nguồn Sinh Mệnh", tree: "Kiên Định", desc: "Trúng tướng hồi máu cho mình + đồng minh thấp máu gần đó. (20s, 130% nếu cận chiến)" },
  { vi: "Khổng Lồ Can Đảm", tree: "Kiên Định", desc: "Làm bất động tướng → nhận lá chắn theo máu tối đa 3 giây. (10s)" },
  { vi: "Vững Vàng", tree: "Kiên Định", desc: "+4% Giáp & Kháng Phép, thêm 3% mỗi tướng địch gần; đủ thì +20% Kháng Làm Chậm." },
  { vi: "Tàn Phá Hủy Diệt", tree: "Kiên Định", desc: "Đứng gần trụ địch tích vận sức; đầy thì đòn kế lên trụ gây thêm sát thương lớn. (30s)" },
  { vi: "Ngọn Gió Thứ Hai", tree: "Kiên Định", desc: "+5 máu/5 giây; sau khi trúng tướng hồi máu theo máu đã mất (gấp đôi nếu cận chiến)." },
  { vi: "Quả Cầu Hư Không", tree: "Kiên Định", desc: "Tụt dưới 35% máu do tướng → lá chắn hấp thụ sát thương 4 giây. (60s)" },
  { vi: "Giáp Cốt", tree: "Kiên Định", desc: "Khi bị tướng đánh, giảm sát thương đòn hiện tại + 3 đòn/kỹ năng kế trong 1,5 giây. (30s)" },
  { vi: "Lan Tràn", tree: "Kiên Định", desc: "Hạ lính/quái gần nhận +máu tối đa vĩnh viễn; đạt 30 cộng dồn thêm +3% máu." },
  { vi: "Tiếp Súc", tree: "Kiên Định", desc: "+5% hiệu ứng hồi máu/lá chắn; mục tiêu dưới 40% máu thì +10%. Cho hỗ trợ." },
  { vi: "Bền Bỉ", tree: "Kiên Định", desc: "+10% Kháng Hiệu Ứng; +Giáp & Kháng Phép tạm thời khi bị bất động." },

  // NHÁNH PHÁP THUẬT (Sorcery/Inspiration)
  { vi: "Thiêu Rụi", tree: "Pháp Thuật", desc: "Trúng tướng bằng kỹ năng → thiêu cháy gây thêm sát thương phép sau 1 giây. (8s)" },
  { vi: "Áo Choàng Mây", tree: "Pháp Thuật", desc: "Sau khi dùng Phép bổ trợ, +10-40% Tốc Chạy trong 3 giây (theo hồi chiêu phép)." },
  { vi: "Cuồng Phong Tích Tụ", tree: "Pháp Thuật", desc: "Từ phút 6 nhận thêm AD/AP thích ứng, tăng dần theo thời gian. Cho cuối trận." },
  { vi: "Lọ Đựng Hạt Ixtal", tree: "Pháp Thuật", desc: "Phá cây nhận hạt giống thay phụ kiện (tầm nhìn/tiện ích)." },
  { vi: "Bậc Thầy Nguyên Tố", tree: "Pháp Thuật", desc: "Chiêu cuối +10% sát thương/hồi máu/lá chắn; hạ gục giảm hồi chiêu chiêu cuối." },
  { vi: "Dải Băng Năng Lượng", tree: "Pháp Thuật", desc: "Trúng tướng tăng vĩnh viễn năng lượng tối đa (tối đa +300). Cho tướng tốn mana." },
  { vi: "Nhà Thực Vật Học", tree: "Pháp Thuật", desc: "Phá cây nhận vàng + hiệu ứng cây cường hóa." },
  { vi: "Thăng Tiến Sức Mạnh", tree: "Pháp Thuật", desc: "+Hồi Kỹ Năng theo cấp; cấp 9 kỹ năng cơ bản trúng mục tiêu tự giảm hồi chiêu. (8s)" },
  { vi: "Mau Lẹ", tree: "Pháp Thuật", desc: "+2% Tốc Chạy; mọi nguồn tăng Tốc Chạy được +7%." },
  { vi: "Tập Trung Tuyệt Đối", tree: "Pháp Thuật", desc: "Trên 65% máu nhận thêm AD/AP thích ứng (theo cấp)." },
  { vi: "Tốc Biến Ma Thuật", tree: "Pháp Thuật", desc: "Khi Tốc Biến đang hồi, thay bằng lướt ngắn theo thời gian vận sức. (25s)" },
];

export const SPELLS = [
  { name: "Flash", vi: "Tốc Biến", desc: "Dịch chuyển tức thời 1 đoạn ngắn — cơ động/né combo. Gần như luôn mang." },
  { name: "Ignite", vi: "Thiêu Đốt", desc: "Đốt 1 tướng gây sát thương chuẩn + giảm hồi máu. KHẮC hồi máu, kết liễu." },
  { name: "Exhaust", vi: "Kiệt Sức", desc: "Làm chậm + giảm mạnh sát thương 1 mục tiêu. KHẮC sát thủ/xạ thủ burst." },
  { name: "Heal", vi: "Hồi Máu", desc: "Hồi máu + tăng tốc bản thân và 1 đồng minh. Chống burst/all-in." },
  { name: "Barrier", vi: "Hàng Rào", desc: "Lá chắn tức thì cho bản thân. Chống burst nổ nhanh." },
  { name: "Ghost", vi: "Tốc Hành", desc: "Tăng Tốc Chạy mạnh 1 lúc. Bám dính/thoát cho đấu sĩ." },
  { name: "Smite", vi: "Trừng Phạt", desc: "Sát thương chuẩn lên quái/lính. Cho đi rừng kiểm soát mục tiêu lớn." },
];

export const KEYSTONE_CATALOG = KEYSTONES.map((k) => ({ name: k.name, vi: k.vi, tree: k.tree, desc: k.desc }));
export const MINOR_RUNE_CATALOG = MINOR_RUNES.map((r) => ({ vi: r.vi, tree: r.tree, desc: r.desc }));
export const SPELL_CATALOG = SPELLS.map((s) => ({ name: s.name, vi: s.vi, desc: s.desc }));

import { nameKey } from "../theme";
export function findKeystone(q) {
  const n = nameKey(q);
  if (!n) return null;
  return KEYSTONES.find((k) => nameKey(k.name) === n || nameKey(k.vi) === n) || null;
}
export function findSpell(q) {
  const n = nameKey(q);
  if (!n) return null;
  return SPELLS.find((s) => nameKey(s.name) === n || nameKey(s.vi) === n) || null;
}
// Tra 1 ngọc bất kỳ (chính hoặc phụ) theo tên — dùng cho bảng chi tiết khi chạm.
export function findRune(q) {
  const n = nameKey(q);
  if (!n) return null;
  return (
    KEYSTONES.find((k) => nameKey(k.name) === n || nameKey(k.vi) === n) ||
    MINOR_RUNES.find((r) => nameKey(r.vi) === n) ||
    null
  );
}
