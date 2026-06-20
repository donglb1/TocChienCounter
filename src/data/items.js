// src/data/items.js
// DB trang bị THẬT + allowlist chống item ma.
// Danh sách đã ĐỐI CHIẾU với ảnh chụp shop trong game (client VN).
// Đã research & thêm lại: Giáo Thiên Ly = Sundered Sky, Ngọn Đuốc Thánh Quang = Radiant Virtue.
// Hỏa Khuẩn: AP tập trung chiêu cuối, chưa rõ tên Anh chính thức (tạm name = vi).
//
// Schema:
//   id   : khóa nội bộ (không trùng)
//   name : tên gốc tiếng Anh (model trả về tên này — dùng làm allowlist)
//   vi   : tên hiển thị tiếng Việt
//   type : "core" | "boots" | "defense" | "offense" | "support"
//   tags : nhãn để rule engine/prompt chọn đúng
//   desc : MÔ TẢ CHỨC NĂNG ngắn gọn (chỉ số chính + nội tại + khắc/hợp gì) — gửi cho AI
//          để phân tích DỰA TRÊN THUỘC TÍNH thật, không đoán theo trí nhớ. Cố ý viết
//          ĐỊNH TÍNH (không nêu số cụ thể) để bền với thay đổi chỉ số giữa các bản.
//   img  : URL icon — Wild Rift KHÔNG có CDN item công khai → null, UI vẽ ô lục giác
//
// Tag chuẩn: armor, mr, hp, grievous (Vết Thương Sâu), revive, tenacity, antiCrit,
//   attackSpeedSlow, lifesteal, omnivamp, magicPen, armorPen, slow, shield, healShield,
//   critDamage, onHit

export const ITEMS = [
  // ─── PHÒNG THỦ (defense) ───
  { id: "thornmail", name: "Thornmail", vi: "Giáp Gai", type: "defense", tags: ["armor", "grievous"], desc: "Nhiều giáp; phản sát thương khi bị đánh thường và gây Vết Thương Sâu cho kẻ đánh. Khắc xạ thủ/AD đánh thường và tướng hồi máu.", img: null },
  { id: "randuin", name: "Randuin's Omen", vi: "Khiên Băng Randuin", type: "defense", tags: ["armor", "antiCrit"], desc: "Giáp + máu; giảm mạnh sát thương chí mạng, kích hoạt làm chậm địch xung quanh. Khắc đội nhiều chí mạng (xạ thủ crit).", img: null },
  { id: "frozenheart", name: "Frozen Heart", vi: "Tim Băng", type: "defense", tags: ["armor", "attackSpeedSlow"], desc: "Giáp + năng lượng; hào quang giảm tốc đánh kẻ địch quanh mình. Khắc tướng đánh nhanh (xạ thủ, on-hit).", img: null },
  { id: "deadmans", name: "Dead Man's Plate", vi: "Giáp Liệt Sĩ", type: "defense", tags: ["armor", "hp"], desc: "Giáp + máu; tích tốc chạy, đòn kế tiếp làm chậm. Cơ động, áp sát và đuổi bắt.", img: null },
  { id: "iceborngauntlet", name: "Iceborn Gauntlet", vi: "Găng Tay Băng Giá", type: "defense", tags: ["armor", "slow"], desc: "Giáp + năng lượng; sau khi dùng chiêu, đòn đánh tạo vùng làm chậm. Khóa chân, mạnh kèo đấu tay đôi.", img: null },
  { id: "sunfire", name: "Sunfire Aegis", vi: "Khiên Thái Dương", type: "defense", tags: ["armor", "hp", "grievous"], desc: "Giáp + máu; thiêu đốt vùng quanh mình và gây Vết Thương Sâu khi giao tranh. Đỡ đòn AoE, khắc hồi máu.", img: null },
  { id: "searingcrown", name: "Searing Crown", vi: "Vương Miện Bỏng Cháy", type: "defense", tags: ["hp", "grievous"], desc: "Máu lớn; đốt liên tục địch xung quanh + Vết Thương Sâu. Đỡ đòn diện rộng, khắc hồi máu.", img: null },
  { id: "hollowradiance", name: "Hollow Radiance", vi: "Áo Choàng Hắc Quang", type: "defense", tags: ["mr", "hp"], desc: "Kháng phép + máu; tích năng lượng rồi nổ sát thương phép AoE khi giao tranh. Chống AP, đỡ đòn.", img: null },
  { id: "abyssal", name: "Abyssal Mask", vi: "Mặt Nạ Vực Thẳm", type: "defense", tags: ["mr", "hp"], desc: "Kháng phép + máu; khuếch đại sát thương phép phe ta gây lên địch quanh mình. Khắc AP, hợp đội nhiều phép.", img: null },
  { id: "forceofnature", name: "Force of Nature", vi: "Giáp Thiên Nhiên", type: "defense", tags: ["mr"], desc: "Kháng phép lớn + tốc chạy; tích thêm kháng phép khi liên tục trúng phép. Khắc đội thiên AP nặng.", img: null },
  { id: "kaenicrookern", name: "Kaenic Rookern", vi: "Vòng Sắt Cổ Tự", type: "defense", tags: ["mr", "shield"], desc: "Kháng phép + máu; tạo khiên chắn phép khi không bị đánh một lúc. Khắc burst phép (pháp sư nổ).", img: null },
  { id: "amaranth", name: "Amaranth's Twinguard", vi: "Chiến Giáp Rực Đỏ", type: "defense", tags: ["armor", "mr"], desc: "Vừa giáp vừa kháng phép; tạo khiên hồi khi giao tranh. Đỡ đòn cân bằng cả AD lẫn AP.", img: null },
  { id: "dawnshroud", name: "Dawnshroud", vi: "Tấm Chắn Bình Minh", type: "defense", tags: ["armor", "hp"], desc: "Giáp + máu; nội tại tạo khiên/giảm sát thương khi vào giao tranh. Đỡ đòn giao tranh tổng.", img: null },
  { id: "bulwark", name: "Bulwark of the Mountain", vi: "Áo Choàng Hộ Mệnh", type: "defense", tags: ["armor", "hp"], desc: "Giáp + máu lớn; tăng chống chịu và hồi phục. Hợp tướng đỡ đòn trâu bò.", img: null },
  { id: "warmog", name: "Warmog's Armor", vi: "Giáp Máu Warmog", type: "defense", tags: ["hp"], desc: "Máu cực lớn; hồi máu rất nhanh khi ngoài giao tranh. Trâu bò, đi đường bền.", img: null },
  { id: "heartsteel", name: "Heartsteel", vi: "Trái Tim Khổng Thần", type: "defense", tags: ["hp"], desc: "Máu lớn; đòn đánh tích máu tối đa vĩnh viễn, càng đánh càng trâu. Hợp đỡ đòn áp sát.", img: null },
  { id: "titanichydra", name: "Titanic Hydra", vi: "Rìu Đại Măng Xà", type: "defense", tags: ["hp"], desc: "Máu + sát thương cộng theo máu; đòn đánh lan AoE. Đỡ đòn kiêm dọn lính/giao tranh diện rộng.", img: null },
  { id: "wintersapproach", name: "Winter's Approach", vi: "Băng Giáp", type: "defense", tags: ["hp", "shield"], desc: "Máu + năng lượng; tích khiên chắn từ năng lượng. Chống burst, nâng cấp thành Băng Trượng.", img: null },
  { id: "sterak", name: "Sterak's Gage", vi: "Móng Vuốt Sterak", type: "defense", tags: ["hp", "shield"], desc: "Máu + nội tại; khi mất nhiều máu tạo khiên lớn và tăng sát thương. Chống burst cho tướng cận chiến.", img: null },
  { id: "overlordblood", name: "Overlord's Bloodmail", vi: "Huyết Giáp Chúa Tể", type: "defense", tags: ["hp", "omnivamp"], desc: "Máu + hút máu mọi nguồn; càng đánh càng hồi. Đỡ đòn lì đòn cận chiến.", img: null },
  { id: "unendingdespair", name: "Unending Despair", vi: "Áo Choàng Diệt Vong", type: "defense", tags: ["armor", "healShield"], desc: "Giáp + máu; gây sát thương lan và hồi máu cho mình khi giao tranh kéo dài. Đỡ đòn bám trụ.", img: null },
  { id: "zeke", name: "Zeke's Convergence", vi: "Tụ Bão Zeke", type: "defense", tags: ["hp", "healShield"], desc: "Máu + hỗ trợ; liên kết một đồng minh, tạo hiệu ứng khi cùng đánh mục tiêu. Hợp tướng mở giao tranh/hỗ trợ.", img: null },
  { id: "yordletrap", name: "Yordle Trap", vi: "Bẫy Yordle", type: "defense", tags: ["armor", "hp"], desc: "Giáp + máu; đặt bẫy kiểm soát khu vực. Phòng thủ và kiểm soát tầm nhìn/vùng.", img: null },
  { id: "guardianangel", name: "Guardian Angel", vi: "Giáp Thiên Thần", type: "defense", tags: ["armor", "revive"], desc: "Giáp + sát thương; hồi sinh tại chỗ sau khi chết. Chống burst, bảo hiểm mạng cho chủ lực.", img: null },
  { id: "mawofmalmortius", name: "Maw of Malmortius", vi: "Chùy Gai Malmortius", type: "defense", tags: ["mr", "shield", "lifesteal"], desc: "Kháng phép + sát thương AD; khiên chắn phép khi máu thấp + hút máu. Khắc burst AP cho tướng AD.", img: null },

  // ─── GIÀY (boots) ───
  { id: "mercury", name: "Mercury's Treads", vi: "Giày Thủy Ngân", type: "boots", tags: ["mr", "tenacity"], desc: "Kháng phép + kháng hiệu ứng (giảm thời gian khống chế). Khắc đội nhiều CC/AP.", img: null },
  { id: "platedsteelcaps", name: "Plated Steelcaps", vi: "Giày Thép Gai", type: "boots", tags: ["armor", "antiCrit"], desc: "Giáp + giảm sát thương đòn đánh thường. Khắc xạ thủ/AD đánh thường.", img: null },
  { id: "berserker", name: "Berserker's Greaves", vi: "Giày Cuồng Nộ", type: "boots", tags: ["onHit"], desc: "Tăng tốc đánh. Giày tiêu chuẩn cho xạ thủ/on-hit.", img: null },
  { id: "ionian", name: "Ionian Boots of Lucidity", vi: "Giày Khai Sáng Ionia", type: "boots", tags: [], desc: "Giảm hồi chiêu và hồi tốc phép triệu hồi. Cho tướng phụ thuộc kỹ năng.", img: null },
  { id: "gluttonous", name: "Gluttonous Greaves", vi: "Giày Phàm Ăn", type: "boots", tags: ["omnivamp"], desc: "Hút máu mọi nguồn. Giúp cận chiến lì đòn khi đi đường.", img: null },
  { id: "bootsofmana", name: "Boots of Mana", vi: "Giày Năng Lượng", type: "boots", tags: [], desc: "Hồi năng lượng. Cho tướng tốn nhiều mana ở giai đoạn đường.", img: null },
  { id: "bootsofdynamism", name: "Boots of Dynamism", vi: "Giày Năng Động", type: "boots", tags: [], desc: "Tăng chỉ số/tốc chạy theo diễn biến giao tranh. Giày linh hoạt.", img: null },
  { id: "bootsofspeed", name: "Boots of Speed", vi: "Giày Tốc Độ", type: "boots", tags: [], desc: "Giày cơ bản, tăng tốc chạy. Mua sớm rồi nâng cấp.", img: null },

  // ─── PHÙ PHÉP GIÀY (boot enchantment) ───
  { id: "quicksilverenchant", name: "Quicksilver Enchant", vi: "Giải Thuật Ma Pháp", type: "boots", tags: ["tenacity"], desc: "Kích hoạt xóa hiệu ứng khống chế cứng. Khắc CC nặng và bị bắt lẻ.", img: null },
  { id: "stasisenchant", name: "Stasis Enchant", vi: "Ngưng Đọng Ma Pháp", type: "boots", tags: ["revive"], desc: "Kích hoạt bất tử bất động (stasis) né toàn bộ sát thương vài giây. Chống burst/combo hạ gục.", img: null },
  { id: "stoneplateenchant", name: "Stoneplate Enchant", vi: "Thú Tượng Thạch Giáp", type: "boots", tags: ["shield"], desc: "Kích hoạt tăng máu/khiên lớn tạm thời và thu hút địch. Đỡ đòn mở giao tranh.", img: null },
  { id: "galeforce", name: "Galeforce", vi: "Cung Phong Linh", type: "boots", tags: [], desc: "Kích hoạt lướt một đoạn rồi bắn địch máu thấp. Cơ động cho xạ thủ.", img: null },
  { id: "goredrinker", name: "Goredrinker", vi: "Chùy Hấp Huyết", type: "boots", tags: ["omnivamp"], desc: "Kích hoạt AoE gây sát thương và hồi máu theo số địch trúng. Lì đòn giao tranh đông.", img: null },
  { id: "stridebreaker", name: "Stridebreaker", vi: "Chùy Phản Kích", type: "boots", tags: ["slow"], desc: "Kích hoạt AoE làm chậm và lướt tới. Bắt mục tiêu, giữ chân địch.", img: null },
  { id: "protobelt", name: "Protobelt Enchant", vi: "Đai Tên Lửa Hextech", type: "boots", tags: [], desc: "Kích hoạt lướt và bắn loạt đạn phép. Cơ động + thêm sát thương cho AP.", img: null },
  { id: "gloriousenchant", name: "Glorious Enchant", vi: "Vinh Quang Ma Pháp", type: "boots", tags: [], desc: "Kích hoạt tăng tốc lao về phía địch. Mở giao tranh và đuổi bắt.", img: null },

  // ─── TẤN CÔNG VẬT LÝ (offense - AD) ───
  { id: "ie", name: "Infinity Edge", vi: "Vô Cực Kiếm", type: "offense", tags: ["critDamage"], desc: "Tăng mạnh sát thương chí mạng. Món lõi cho xạ thủ đi chí mạng.", img: null },
  { id: "botrk", name: "Blade of the Ruined King", vi: "Gươm Suy Vong", type: "offense", tags: ["onHit", "lifesteal", "slow"], desc: "Đòn đánh gây sát thương theo % máu hiện tại + hút máu + làm chậm. Khắc tướng máu trâu/đỡ đòn.", img: null },
  { id: "krakenslayer", name: "Kraken Slayer", vi: "Móc Diệt Thủy Quái", type: "offense", tags: ["onHit"], desc: "Cứ vài đòn lại gây thêm sát thương chuẩn (xuyên giáp). Khắc tướng đỡ đòn.", img: null },
  { id: "guinsoo", name: "Guinsoo's Rageblade", vi: "Cuồng Đao Guinsoo", type: "offense", tags: ["onHit"], desc: "Tích tốc đánh và đòn xen kẽ kích hoạt on-hit gấp đôi. Cho tướng on-hit lai AD/AP.", img: null },
  { id: "terminus", name: "Terminus", vi: "Cung Chạng Vạng", type: "offense", tags: ["onHit", "mr"], desc: "On-hit + luân phiên cộng xuyên giáp/kháng phép cho bản thân. Cho on-hit cần xuyên thủ + chống AP.", img: null },
  { id: "magneticblaster", name: "Magnetic Blaster", vi: "Súng Từ Trường", type: "offense", tags: ["onHit"], desc: "Tốc đánh + on-hit gây sát thương lan/tầm xa. Cho xạ thủ on-hit.", img: null },
  { id: "stormrazor", name: "Stormrazor", vi: "Đao Tím", type: "offense", tags: ["critDamage"], desc: "Đòn đầu sau khi chờ gây thêm sát thương + tăng tốc chạy. Cho sát thủ AD/đi kèo.", img: null },
  { id: "phantomdancer", name: "Phantom Dancer", vi: "Ma Vũ Song Kiếm", type: "offense", tags: ["critDamage"], desc: "Chí mạng + tốc đánh + tốc chạy; khiên khi máu thấp. Tăng sống sót cho xạ thủ.", img: null },
  { id: "runaan", name: "Runaan's Hurricane", vi: "Cuồng Cung Runaan", type: "offense", tags: ["onHit"], desc: "Đòn đánh bắn thêm mục tiêu phụ và lan on-hit. Dọn giao tranh đông và lính.", img: null },
  { id: "navori", name: "Navori Quickblades", vi: "Đoản Đao Navori", type: "offense", tags: ["critDamage"], desc: "Chí mạng + đòn đánh giảm hồi chiêu kỹ năng. Cho tướng combat dựa kỹ năng.", img: null },
  { id: "essencereaver", name: "Essence Reaver", vi: "Lưỡi Hái Linh Hồn", type: "offense", tags: ["critDamage"], desc: "Chí mạng + hồi năng lượng sau khi tung chiêu. Cho tướng combo chiêu liên tục.", img: null },
  { id: "deathsdance", name: "Death's Dance", vi: "Vũ Điệu Tử Thần", type: "offense", tags: ["armor", "lifesteal"], desc: "Giáp + sát thương; trải burst nhận vào thành sát thương theo thời gian + hồi máu khi hạ gục. Lì đòn cho AD cận chiến.", img: null },
  { id: "bloodthirster", name: "Bloodthirster", vi: "Huyết Kiếm", type: "offense", tags: ["lifesteal", "shield"], desc: "Sát thương + hút máu lớn; tích khiên máu khi đầy máu. Trụ kèo cho xạ thủ.", img: null },
  { id: "lorddominik", name: "Lord Dominik's Regards", vi: "Nỏ Thần Dominik", type: "offense", tags: ["armorPen", "antiCrit"], desc: "Xuyên giáp theo % và đánh mạnh hơn vào địch máu cao. Khắc đỡ đòn/máu trâu.", img: null },
  { id: "mortal", name: "Mortal Reminder", vi: "Lời Nhắc Tử Vong", type: "offense", tags: ["armorPen", "grievous"], desc: "Xuyên giáp + Vết Thương Sâu. Khắc đỡ đòn CÓ hồi máu (vừa xuyên giáp vừa giảm hồi).", img: null },
  { id: "seryldas", name: "Serylda's Grudge", vi: "Thương Phục Hận Serylda", type: "offense", tags: ["armorPen", "slow"], desc: "Xuyên giáp + làm chậm địch trúng kỹ năng. Cho sát thủ/đấu sĩ AD bắt mục tiêu.", img: null },
  { id: "blackcleaver", name: "Black Cleaver", vi: "Rìu Đen", type: "offense", tags: ["armorPen", "hp"], desc: "Máu + đòn đánh/chiêu bào mòn giáp địch theo lớp + tốc chạy. Khắc đỡ đòn, hợp đấu sĩ.", img: null },
  { id: "thecollector", name: "The Collector", vi: "Súng Hải Tặc", type: "offense", tags: ["armorPen", "critDamage"], desc: "Sát thương + xuyên giáp; hành quyết địch còn ít máu. Burst kết liễu cho sát thủ/xạ thủ.", img: null },
  { id: "youmuu", name: "Youmuu's Ghostblade", vi: "Kiếm Ma Youmuu", type: "offense", tags: ["armorPen"], desc: "Xuyên giáp + kích hoạt tăng mạnh tốc chạy. Cơ động/áp sát cho sát thủ AD.", img: null },
  { id: "duskblade", name: "Duskblade of Draktharr", vi: "Dạ Kiếm Draktharr", type: "offense", tags: ["armorPen"], desc: "Xuyên giáp + sát thương cộng thêm cho đòn đầu lên địch. Burst cho sát thủ.", img: null },
  { id: "eclipse", name: "Eclipse", vi: "Nguyệt Đao", type: "offense", tags: ["armorPen", "shield"], desc: "Xuyên giáp; hai đòn liên tiếp gây thêm sát thương theo % máu + khiên/tốc chạy. Cho đấu sĩ/sát thủ AD.", img: null },
  { id: "serpentsfang", name: "Serpent's Fang", vi: "Kiếm Ác Xà", type: "offense", tags: ["armorPen"], desc: "Xuyên giáp + giảm mạnh hiệu lực khiên của địch. Khắc đội nhiều khiên/chắn.", img: null },
  { id: "chempunk", name: "Chempunk Chainsword", vi: "Cưa Xích Hóa Kỹ", type: "offense", tags: ["grievous", "hp"], desc: "Sát thương + máu + Vết Thương Sâu khi gây sát thương. AD khắc hồi máu, giá rẻ.", img: null },
  { id: "trinityforce", name: "Trinity Force", vi: "Tam Hợp Kiếm", type: "offense", tags: ["onHit", "hp"], desc: "Cộng đều mọi chỉ số; đòn sau chiêu mạnh + tốc chạy. Đa dụng cho đấu sĩ.", img: null },
  { id: "divinesunderer", name: "Divine Sunderer", vi: "Búa Rìu Sát Thần", type: "offense", tags: ["onHit", "healShield"], desc: "Đòn sau chiêu gây sát thương theo % máu địch + hồi máu. Khắc máu trâu, lì đòn cho đấu sĩ.", img: null },
  { id: "spearofshojin", name: "Spear of Shojin", vi: "Ngọn Giáo Shojin", type: "offense", tags: ["hp"], desc: "Máu + tăng sát thương kỹ năng và giảm hồi chiêu khi đánh. Cho đấu sĩ combat liên tục.", img: null },
  { id: "experhexplate", name: "Experimental Hexplate", vi: "Khiên Hextech Thử Nghiệm", type: "offense", tags: ["onHit", "hp"], desc: "Máu + sau chiêu cuối tăng tốc đánh/sát thương và giảm hồi chiêu cuối. Cho đấu sĩ dựa chiêu cuối.", img: null },
  { id: "hullbreaker", name: "Hullbreaker", vi: "Búa Tiến Công", type: "offense", tags: ["hp"], desc: "Máu + sát thương mạnh hơn khi tách lẻ + buff lính. Cho đi lẻ đẩy đường.", img: null },
  { id: "edgeofnight", name: "Edge of Night", vi: "Áo Choàng Bóng Tối", type: "offense", tags: ["shield"], desc: "Sát thương + khiên hấp thụ một kỹ năng khống chế. Chống bị bắt lẻ/CC mở cho sát thủ.", img: null },
  { id: "soultransfer", name: "Soul Transfer", vi: "Chuyển Hồn", type: "offense", tags: ["magicPen"], desc: "Sức mạnh phép + xuyên kháng phép; hồi máu/khiên lớn khi tham gia hạ gục. Cho sát thủ AP snowball.", img: null },
  { id: "manamune", name: "Manamune", vi: "Kiếm Manamune", type: "offense", tags: [], desc: "Tích năng lượng thành sát thương, biến thành Muramana. Cho tướng AD dùng nhiều năng lượng.", img: null },

  // ─── TẤN CÔNG PHÉP (offense - AP) ───
  { id: "rabadon", name: "Rabadon's Deathcap", vi: "Mũ Phù Thủy Rabadon", type: "offense", tags: [], desc: "Sức mạnh phép cực lớn + khuếch đại % tổng AP. Món lõi tăng sát thương pháp sư cuối trận.", img: null },
  { id: "ludens", name: "Luden's Echo", vi: "Vọng Âm Luden", type: "offense", tags: ["magicPen"], desc: "Phép + xuyên kháng phép; đòn phép đầu nổ lan. Burst và dọn lính cho pháp sư.", img: null },
  { id: "liandry", name: "Liandry's Torment", vi: "Mặt Nạ Đọa Đày Liandry", type: "offense", tags: ["magicPen", "hp"], desc: "Phép + máu; đốt cháy theo % máu địch theo thời gian. Khắc đỡ đòn/máu trâu (phía AP).", img: null },
  { id: "lichbane", name: "Lich Bane", vi: "Kiếm Tai Ương", type: "offense", tags: ["onHit", "magicPen"], desc: "Đòn đánh sau khi tung chiêu gây sát thương phép lớn (spellblade). Cho pháp sư cận chiến/đánh-chiêu.", img: null },
  { id: "horizonfocus", name: "Horizon Focus", vi: "Kính Nhắm Ma Pháp", type: "offense", tags: ["magicPen"], desc: "Phép + xuyên kháng phép; trúng chiêu tầm xa làm lộ và tăng sát thương lên địch. Cho pháp sư tầm xa.", img: null },
  { id: "infinityorb", name: "Infinity Orb", vi: "Ngọc Vô Cực", type: "offense", tags: ["magicPen"], desc: "Phép + xuyên kháng phép; gây chí mạng phép lên địch máu thấp. Burst kết liễu cho pháp sư.", img: null },
  { id: "malignance", name: "Malignance", vi: "Quyền Trượng Ác Thần", type: "offense", tags: ["magicPen"], desc: "Phép + xuyên kháng phép + hồi năng lượng; chiêu cuối tạo vùng đốt và giảm kháng phép. Cho pháp sư dựa chiêu cuối.", img: null },
  { id: "morello", name: "Morellonomicon", vi: "Quỷ Thư Morello", type: "offense", tags: ["grievous", "magicPen"], desc: "Phép + Vết Thương Sâu khi gây sát thương phép. AP khắc tướng hồi máu.", img: null },
  { id: "rylai", name: "Rylai's Crystal Scepter", vi: "Trượng Pha Lê Rylai", type: "offense", tags: ["slow", "hp"], desc: "Phép + máu; sát thương phép làm chậm địch. Giữ chân mục tiêu cho pháp sư.", img: null },
  { id: "cosmicdrive", name: "Cosmic Drive", vi: "Động Cơ Vũ Trụ", type: "offense", tags: ["slow"], desc: "Phép + giảm hồi chiêu; gây phép được tăng tốc chạy. Cơ động cho pháp sư.", img: null },
  { id: "rodofages", name: "Rod of Ages", vi: "Trượng Trường Sinh", type: "offense", tags: ["hp", "mr"], desc: "Phép + máu + năng lượng tích lớn dần theo thời gian. Bền cho pháp sư đi đường.", img: null },
  { id: "archangel", name: "Archangel's Staff", vi: "Quyền Trượng Thiên Thần", type: "offense", tags: ["shield"], desc: "Năng lượng thành sức mạnh phép + khiên; thành Seraph khi đầy. Cho pháp sư tốn mana.", img: null },
  { id: "crownshattered", name: "Crown of the Shattered Queen", vi: "Vương Miện Suy Vong", type: "offense", tags: ["shield"], desc: "Phép + khiên chắn gần hết sát thương của đòn burst đầu tiên. Chống sát thủ/burst cho pháp sư.", img: null },
  { id: "nashortooth", name: "Nashor's Tooth", vi: "Nanh Nashor", type: "offense", tags: ["onHit", "magicPen"], desc: "Phép + tốc đánh; đòn đánh gây thêm sát thương phép on-hit. Cho pháp sư đánh-chiêu (Teemo, Kayle).", img: null },
  { id: "oceanidtrident", name: "Oceanid's Trident", vi: "Đinh Ba Hải Tinh", type: "offense", tags: ["magicPen"], desc: "Sức mạnh phép + xuyên kháng phép, thêm sát thương theo combo. Cho pháp sư sát thương liên tục.", img: null },
  { id: "psychicprojector", name: "Psychic Projector", vi: "Máy Chiếu Tâm Linh", type: "offense", tags: ["magicPen"], desc: "Phép + xuyên kháng phép tầm xa, sát thương lan. Cho pháp sư poke tầm xa.", img: null },
  { id: "bandlefantasy", name: "Bandle Fantasy", vi: "Giả Tưởng Bandle", type: "offense", tags: [], desc: "Sức mạnh phép + hiệu ứng tăng tiến theo trận. Món AP linh hoạt.", img: null },
  { id: "awakened", name: "Awakened Soulstealer", vi: "Sách Chiêu Hồn Thức Tỉnh", type: "offense", tags: [], desc: "Phép + giảm hồi chiêu; hồi chiêu khi tham gia hạ gục. Cho pháp sư snowball giao tranh liên tục.", img: null },

  // ─── HỖ TRỢ (support) ───
  { id: "knightsvow", name: "Knight's Vow", vi: "Lời Thề Hiệp Sĩ", type: "support", tags: ["armor", "healShield"], desc: "Giáp + máu; liên kết bảo vệ một đồng minh, chuyển hướng phần sát thương họ nhận. Hỗ trợ giữ chủ lực.", img: null },
  { id: "ardentcenser", name: "Ardent Censer", vi: "Lư Hương Sôi Sục", type: "support", tags: ["healShield"], desc: "Hồi/khiên đồng minh đồng thời buff họ tốc đánh + sát thương on-hit. Cho hỗ trợ enchanter (tăng xạ thủ).", img: null },
  { id: "staffflowing", name: "Staff of Flowing Waters", vi: "Trượng Lưu Thủy", type: "support", tags: ["healShield"], desc: "Khi hồi/khiên đồng minh, buff họ sức mạnh phép và tốc hồi chiêu. Cho hỗ trợ enchanter (tăng pháp sư).", img: null },
  { id: "harmonicecho", name: "Harmonic Echo", vi: "Vọng Âm Hòa Điệu", type: "support", tags: ["healShield"], desc: "Khi hồi/khiên, lan thêm hồi máu cho đồng minh xung quanh. Cho hỗ trợ hồi máu giao tranh tổng.", img: null },
  { id: "imperialmandate", name: "Imperial Mandate", vi: "Trát Lệnh Đế Vương", type: "support", tags: ["slow", "healShield"], desc: "Đánh dấu địch bị làm chậm/khống chế để đồng minh kích nổ gây thêm sát thương. Cho hỗ trợ pháp/mở giao tranh.", img: null },
  { id: "redemption", name: "Redemption", vi: "Dây Chuyền Chuộc Tội", type: "support", tags: ["healShield"], desc: "Kích hoạt gọi vùng hồi máu đồng minh + gây sát thương và Vết Thương Sâu lên địch trong vùng. Cứu giao tranh tổng.", img: null },

  // ─── Thêm lại sau khi research (item có trong ảnh game) ───
  { id: "sunderedsky", name: "Sundered Sky", vi: "Giáo Thiên Ly", type: "offense", tags: ["lifesteal", "hp", "critDamage"], desc: "Máu + sát thương; đòn sau chiêu chí mạng đảm bảo và hồi máu lớn. Lì đòn/trụ kèo cho đấu sĩ AD.", img: null },
  { id: "radiantvirtue", name: "Radiant Virtue", vi: "Ngọn Đuốc Thánh Quang", type: "support", tags: ["hp", "healShield"], desc: "Máu; chiêu cuối tạo vùng hồi máu và tăng máu tối đa cho đồng minh quanh mình. Đỡ đòn/hỗ trợ giao tranh tổng.", img: null },
  // ⚠ Hỏa Khuẩn: item AP tập trung chiêu cuối — chưa xác minh tên Anh chính thức (khả năng riêng Wild Rift).
  { id: "hoakhuan", name: "Hỏa Khuẩn", vi: "Hỏa Khuẩn", type: "offense", tags: ["magicPen"], desc: "Sức mạnh phép + xuyên kháng phép, tập trung khuếch đại sát thương chiêu cuối. Cho pháp sư burst dựa chiêu cuối.", img: null },
];

// Allowlist tên (Anh + Việt) để ép model chỉ chọn từ đây — chống bịa item ma
export const ITEM_ALLOWLIST = ITEMS.flatMap((i) => [i.name, i.vi]);

// Catalog rút gọn để nhồi vào prompt: tên + loại + mô tả thuộc tính (grounding cho AI)
export const ITEM_CATALOG = ITEMS.map((i) => ({
  name: i.name,
  vi: i.vi,
  type: i.type,
  desc: i.desc,
}));

// Map slug item (từ web build) → item DB. Khớp dạng "youmuus-ghostblade", "black-cleaver"…
import { noDiacritics } from "../theme";

const ITEM_SLUG_ALIAS = {
  "mercury-treads": "Mercury's Treads", // web bỏ chữ "s"
};
function itemSlugVariants(name) {
  const nd = noDiacritics(name).replace(/['’.,]/g, ""); // bỏ dấu nháy/chấm
  const hy = nd.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const tight = nd.replace(/[^a-z0-9]+/g, "");
  return [hy, tight];
}
const ITEM_SLUG_MAP = (() => {
  const map = {};
  for (const i of ITEMS) for (const v of itemSlugVariants(i.name)) map[v] = i;
  return map;
})();
export function findItemBySlug(slug) {
  if (!slug) return null;
  const s = String(slug).toLowerCase();
  if (ITEM_SLUG_ALIAS[s]) return findItem(ITEM_SLUG_ALIAS[s]);
  return ITEM_SLUG_MAP[s] || ITEM_SLUG_MAP[s.replace(/-/g, "")] || null;
}

// Tra item theo tên (Anh hoặc Việt). Trả null nếu ngoài danh sách → UI bật ⚠ NGOÀI DS
export function findItem(query) {
  const q = noDiacritics(query);
  if (!q) return null;
  return (
    ITEMS.find((i) => noDiacritics(i.name) === q || noDiacritics(i.vi) === q) ||
    null
  );
}
