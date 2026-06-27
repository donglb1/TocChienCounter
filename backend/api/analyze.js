// backend/api/analyze.js — Vercel serverless function
// Giữ ANTHROPIC_API_KEY ở server. Client gọi qua đây, không bao giờ thấy key.
//
// Deploy: cd backend && npx vercel ; npx vercel env add ANTHROPIC_API_KEY ; npx vercel --prod
//
// TỐI ƯU TỐC ĐỘ:
// - extract dùng Sonnet 4.6 (vision mạnh, NHANH hơn Opus 4.8 nhiều). Người dùng còn
//   xác nhận lại tên tướng ở bước sau nên sai sót nhỏ vẫn sửa được.
//   → nếu thấy đọc ảnh sai nhiều, đổi EXTRACT_MODEL lại "claude-opus-4-8".
// - Tắt "thinking" + effort thấp cho cả 3 mode: đây là task đọc/phân loại có cấu trúc,
//   không cần model suy nghĩ sâu → nhanh hơn rõ rệt.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const EXTRACT_MODEL = "claude-sonnet-4-6"; // đọc ảnh — nhanh, vẫn chính xác tốt
const ANALYZE_MODEL = "claude-sonnet-4-6"; // phân tích text — nhanh + rẻ

// Ép phản hồi nhanh: không suy nghĩ sâu, effort thấp (hợp task trả JSON có cấu trúc)
const FAST = { thinking: { type: "disabled" }, output_config: { effort: "low" } };

export default async function handler(req, res) {
  // CORS (Expo Go / web gọi cross-origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "Thiếu ANTHROPIC_API_KEY ở server" });

  const t0 = Date.now();

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { mode, champ, lane } = body || {};

    console.log(`[analyze] mode=${mode} champ=${champ} lane=${lane}`);

    let payload;
    if (mode === "extract") payload = buildExtract(body);
    else if (mode === "analyze") payload = buildAnalyze(body);
    else if (mode === "suggest") payload = buildSuggest(body);
    else return res.status(400).json({ error: "mode phải là 'extract' | 'analyze' | 'suggest'" });

    // Tự hủy trước khi Vercel giết function (giới hạn 60s) → trả lỗi JSON đọc được
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    let r;
    try {
      r = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") {
        console.error(`[analyze] Timeout >55s mode=${mode} champ=${champ}`);
        return res.status(504).json({ error: "Anthropic phản hồi quá chậm, thử lại giúp mình nhé." });
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!r.ok) {
      const errText = await r.text();
      console.error(`[analyze] Anthropic error ${r.status}:`, errText);
      return res.status(r.status).json({ error: "Anthropic lỗi", detail: errText });
    }

    const data = await r.json();
    const text = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .filter(Boolean)
      .join("\n");

    console.log(`[analyze] OK mode=${mode} tokens=${data.usage?.output_tokens} ms=${Date.now() - t0}`);
    return res.status(200).json({ text });
  } catch (e) {
    console.error(`[analyze] Exception ms=${Date.now() - t0}:`, e);
    return res.status(500).json({ error: "Server lỗi", detail: String(e) });
  }
}

// ───────────────────────── EXTRACT (vision) ─────────────────────────
function buildExtract({ imageBase64, mediaType, champ, lane }) {
  const prompt = `Bạn là chuyên gia đọc ảnh chụp màn hình Liên Minh: Tốc Chiến (Wild Rift).
Người chơi dùng tướng: "${champ}", ${lane}.

NHIỆM VỤ:
1. Tìm tất cả tướng trong ảnh và phe của chúng.
2. Tìm tướng "${champ}" để xác định phe người chơi (đồng minh). Phe còn lại là ĐỊCH.

QUY TẮC:
- Nhận diện theo NHÂN VẬT, bỏ qua skin/trang phục.
- "name" là tên GỐC tiếng Anh; "displayName" là tên hiển thị trên ảnh.
- CHỈ liệt kê tướng nhìn rõ. KHÔNG bịa. Không chắc -> confidence "low" + ghi notes.
- Không thấy tướng người chơi -> userTeam "unknown", đưa tất cả vào enemyChampions.

CHỈ trả JSON thuần (không markdown, không \`\`\`):
{"userTeam":"blue|red|unknown","enemyChampions":[{"name":"","displayName":"","confidence":"high|medium|low"}],"allyChampions":[{"name":"","displayName":"","confidence":"high|medium|low"}],"overallConfidence":"high|medium|low","notes":""}`;

  return {
    model: EXTRACT_MODEL,
    max_tokens: 1024,
    ...FAST,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType || "image/jpeg", data: imageBase64 },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  };
}

// ───────────────────────── ANALYZE (text) ─────────────────────────
function buildAnalyze({ champ, lane, enemies, champMeta, enemyMeta, items, runes, spells, laneOpponent }) {
  // Catalog item kèm THUỘC TÍNH → AI chọn dựa dữ liệu thật, không đoán theo trí nhớ
  const itemList = (items || [])
    .map((i) => `- ${i.name} (${i.vi}) [${i.type}]: ${i.desc}`)
    .join("\n");
  const enemyList = (enemyMeta || []).length
    ? (enemyMeta || []).map(fmtChamp).join("\n")
    : (enemies || []).map((n) => `- ${n}`).join("\n");
  const me = champMeta ? fmtChamp(champMeta).replace(/^- /, "") : champ;
  const runeList = (runes || []).map((r) => `- ${r.name} (${r.vi}): ${r.for}`).join("\n");
  const spellList = (spells || []).map((s) => `- ${s.name} (${s.vi}): ${s.for}`).join("\n");
  const laneLine = laneOpponent
    ? `ĐỐI THỦ CÙNG ĐƯỜNG (ưu tiên build SỚM bám matchup này): ${laneOpponent}`
    : `ĐỐI THỦ CÙNG ĐƯỜNG: chưa rõ — tự suy từ vai trò địch ở "${lane}".`;

  const prompt = `Bạn là HLV Tốc Chiến (Wild Rift) chuyên nghiệp. Phân tích ĐIỂM MẠNH/YẾU của cả 2 đội dựa
trên ĐẶC TÍNH được cung cấp, rồi đề xuất build + ngọc + phép KHẮC CHẾ tối ưu cho tướng người chơi.

TƯỚNG NGƯỜI CHƠI (${lane}): ${me}
${laneLine}

TEAM ĐỊCH (đặc tính từng tướng):
${enemyList}

CÁCH PHÂN TÍCH:
1. Tổng hợp profile địch: tỷ lệ sát thương AD/AP, mức CC, có hồi máu không, ai là mối đe dọa lớn nhất.
2. Điểm MẠNH tướng người chơi cần phát huy + điểm YẾU cần che (dựa "cách lên đồ", tầm đánh, spike).
3. Chọn ĐỒ LÕI bám đúng "cách lên đồ đặc trưng" của tướng người chơi (vd AD chí mạng -> Vô Cực Kiếm; AP burst -> Mũ Rabadon/Vọng Âm Luden), rồi thêm món KHẮC CHẾ theo MÔ TẢ THUỘC TÍNH:
   - Địch nghiêng AP -> món kháng phép (mr). Nghiêng AD -> giáp (armor) + giảm tốc đánh.
   - Địch có hồi máu/hút máu -> BẮT BUỘC 1 món Vết Thương Sâu (grievous).
   - Sát thủ burst -> đồ cứu mạng (revive/shield/stasis). Nhiều CC -> kháng hiệu ứng (tenacity).
4. Ngọc + phép bổ trợ chọn theo đối thủ (vd địch hồi máu -> Thiêu Đốt; sát thủ/xạ thủ mạnh -> Kiệt Sức).

CHỈ chọn TRANG BỊ trong CATALOG — trả tên tiếng Anh CHÍNH XÁC như trong catalog (không bịa, không đổi dấu nháy):
${itemList}

CHỈ chọn NGỌC trong danh sách — trả tên tiếng Anh CHÍNH XÁC như trong danh sách:
${runeList}

CHỈ chọn PHÉP trong danh sách — trả tên tiếng Anh CHÍNH XÁC như trong danh sách:
${spellList}

YÊU CẦU OUTPUT — VIẾT NGẮN GỌN:
- build ĐÚNG 5 món gồm 1 đôi giày, thứ tự ưu tiên lên đồ. "reason" ≤10 từ.
- "yourStrengths"/"yourWeaknesses": ≤14 từ mỗi cái. "summary" ≤14 từ. "playstyle" ≤20 từ.
- "alternatives": ≤1 phương án/món, "condition" ≤6 từ (không cần để []). "mainThreats": tối đa 3.
- "keystone": 1 ngọc; "spells": ĐÚNG 2 phép. "reason" của ngọc/phép ≤8 từ.

CHỈ trả JSON thuần (không markdown, không \`\`\`):
{"teamProfile":{"adPercent":0,"apPercent":0,"ccLevel":"none|low|medium|high","hasHealing":false,"mainThreats":[""],"summary":""},"yourStrengths":"","yourWeaknesses":"","keystone":{"name":"","reason":""},"spells":[{"name":"","reason":""}],"build":[{"order":1,"item":"","type":"core|boots|situational","reason":"","alternatives":[{"item":"","condition":""}]}],"playstyle":""}`;

  return {
    model: ANALYZE_MODEL,
    max_tokens: 1400,
    ...FAST,
    messages: [{ role: "user", content: prompt }],
  };
}

// ───────────────────────── SUGGEST (gợi ý tướng nên chọn) ─────────────────────────
function buildSuggest({ lane, enemies, allyMeta, enemyMeta, allowlist }) {
  const list = (allowlist || []).join(", ");
  const allyList = (allyMeta || []).length
    ? (allyMeta || []).map(fmtChamp).join("\n")
    : "- (chưa chọn tướng nào)";
  const enemyList = (enemyMeta || []).length
    ? (enemyMeta || []).map(fmtChamp).join("\n")
    : (enemies || []).map((n) => `- ${n}`).join("\n") || "- (chưa lộ)";

  const prompt = `Bạn là HLV Tốc Chiến (Wild Rift) chuyên nghiệp, tư vấn CHỌN TƯỚNG ở giai đoạn cấm/chọn.
Người chơi cần chọn tướng đi: "${lane}".

ĐỒNG ĐỘI ĐÃ CHỌN (đặc tính):
${allyList}

TEAM ĐỊCH ĐÃ LỘ (đặc tính):
${enemyList}

CÁCH PHÂN TÍCH (dựa trên đặc tính trên, không đoán):
1. Điểm mạnh/yếu đội mình: đội đang thiếu gì (chống chịu? mở giao tranh/CC? sát thương AP hay AD? hồi máu?).
2. Điểm mạnh/yếu đội địch: mối đe dọa chính (burst/threat cao), nghiêng AD hay AP, có hồi máu/nhiều CC không.
3. Đề xuất tướng vừa KHẮC mối đe dọa địch, vừa BÙ chỗ đội mình thiếu, và mạnh ở "${lane}".

NGUYÊN TẮC:
- Bù vai trò: đội thiếu chống chịu -> tướng đỡ đòn; thiếu mở giao tranh -> tướng CC mở; lệch 1 loại sát thương -> cân bằng lại. KHÔNG trùng vai trò đã có.
- Khắc chế: nhiều AP -> tướng kháng phép/lì phép; nhiều AD -> tướng giáp/đỡ đòn; địch hồi máu -> tướng gây Vết Thương Sâu/burst; nhiều CC -> tướng cơ động/kháng hiệu ứng.
- Chỉ gợi ý tướng HỢP đường "${lane}", KHÔNG trùng tướng 2 đội đã chọn.

QUAN TRỌNG — CHỈ chọn tướng trong danh sách sau (không bịa tướng ngoài danh sách), trả ĐÚNG tên tiếng Anh trong danh sách:
${list}

YÊU CẦU OUTPUT — VIẾT CỰC NGẮN (giảm độ dài = trả nhanh hơn):
- ĐÚNG 5 tướng, xếp theo ưu tiên (mạnh nhất trước).
- "tier": "S" | "A" | "B".
- "counters": tối đa 3 tướng địch.
- "reason": tối đa 8 từ. "summary": tối đa 12 từ.

CHỈ trả JSON thuần (không markdown, không \`\`\`):
{"picks":[{"name":"","tier":"S|A|B","counters":[""],"reason":""}],"summary":""}`;

  return {
    model: ANALYZE_MODEL,
    max_tokens: 800,
    ...FAST,
    messages: [{ role: "user", content: prompt }],
  };
}

// Định dạng 1 dòng đặc tính tướng cho prompt (grounding). Tướng lạ → ghi rõ chưa rõ đặc tính.
function fmtChamp(c) {
  if (!c || c.unknown) return `- ${c?.name || "?"} (chưa rõ đặc tính)`;
  const bits = [
    c.dmg, // AD | AP | mixed
    c.role,
    c.build, // cách lên đồ đặc trưng (grounding đồ lõi)
    c.range,
    c.spike,
    c.burst ? "burst" : null,
    c.cc && c.cc !== "none" ? `CC ${c.cc}` : null,
    c.healing ? "có hồi máu" : null,
  ].filter(Boolean);
  return `- ${c.vi || c.name} (${c.name}): ${bits.join(", ")}`;
}
