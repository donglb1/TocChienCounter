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

// Ép phản hồi nhanh: không suy nghĩ sâu, effort thấp (hợp task trả JSON có cấu trúc).
// Dùng cho EXTRACT (đọc ảnh) và SUGGEST (chọn tướng trong danh sách) — task phân loại, ít suy luận.
const FAST = { thinking: { type: "disabled" }, output_config: { effort: "low" } };

// ANALYZE là suy luận đa biến (tổng hợp profile địch → cân điểm mạnh/yếu → chọn build có thứ tự + lý do).
// effort "medium" cho chất lượng build tốt hơn rõ rệt; đánh đổi ~1-2s là đáng vì đây là giá trị cốt lõi.
const ANALYZE_CFG = { thinking: { type: "disabled" }, output_config: { effort: "medium" } };

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
    else if (mode === "champbuild") payload = buildChampBuild(body);
    else return res.status(400).json({ error: "mode phải là 'extract' | 'analyze' | 'suggest' | 'champbuild'" });

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
function buildAnalyze({ champ, lane, enemies, champMeta, enemyMeta, metaBuild, items, runes, minorRunes, spells, laneOpponent }) {
  // Catalog item kèm THUỘC TÍNH + TAG (synergy) → AI chọn dựa dữ liệu thật, không đoán theo trí nhớ
  const itemList = (items || [])
    .map((i) => `- ${i.name} (${i.vi}) [${i.type}${i.tags && i.tags.length ? ` · ${i.tags.join(",")}` : ""}]: ${i.desc}`)
    .join("\n");
  const enemyList = (enemyMeta || []).length
    ? (enemyMeta || []).map(fmtChamp).join("\n")
    : (enemies || []).map((n) => `- ${n}`).join("\n");
  const me = champMeta ? fmtChamp(champMeta).replace(/^- /, "") : champ;
  const runeList = (runes || []).map((r) => `- [${r.tree}] ${r.name} (${r.vi}): ${r.desc}`).join("\n");
  const spellList = (spells || []).map((s) => `- ${s.name} (${s.vi}): ${s.desc}`).join("\n");
  const minorList = fmtMinorRunes(minorRunes);
  const laneLine = laneOpponent
    ? `ĐỐI THỦ CÙNG ĐƯỜNG (ưu tiên build SỚM bám matchup này): ${laneOpponent}`
    : `ĐỐI THỦ CÙNG ĐƯỜNG: chưa rõ — tự suy từ vai trò địch ở "${lane}".`;

  // Mỏ neo build chuẩn patch (cào live). Có thì AI giữ làm gốc, chỉ đổi món để khắc chế + nêu lý do.
  const mb = metaBuild || {};
  const anchorBits = [
    (mb.core || []).length ? `Đồ lõi: ${mb.core.join(", ")}` : null,
    (mb.boots || []).length ? `Giày: ${mb.boots.join(", ")}` : null,
    (mb.situational || []).length ? `Tình huống hay gặp: ${mb.situational.join(", ")}` : null,
  ].filter(Boolean);
  const anchorBlock = anchorBits.length
    ? `\nBUILD CHUẨN PATCH HIỆN TẠI của tướng này (meta thực tế — GIỮ làm gốc, CHỈ đổi/thêm món để khắc chế đội địch và NÊU lý do khi lệch khỏi gốc):\n${anchorBits.map((b) => `- ${b}`).join("\n")}\n`
    : "";

  const prompt = `Bạn là HLV Tốc Chiến (Wild Rift) chuyên nghiệp. Phân tích ĐIỂM MẠNH/YẾU của cả 2 đội dựa
trên ĐẶC TÍNH được cung cấp, rồi đề xuất build + ngọc + phép KHẮC CHẾ tối ưu cho tướng người chơi.

⚠ ĐÂY LÀ LIÊN MINH: TỐC CHIẾN (Wild Rift) — KHÔNG phải LMHT PC. Tên item, chỉ số, hệ trang bị tiến hóa
khác hẳn bản PC. TUYỆT ĐỐI chỉ dùng item/ngọc/phép trong CATALOG bên dưới, không lấy theo trí nhớ LMHT PC.

TƯỚNG NGƯỜI CHƠI (${lane}): ${me}
${laneLine}
${anchorBlock}
TEAM ĐỊCH (đặc tính từng tướng):
${enemyList}

CÁCH PHÂN TÍCH:
1. Tổng hợp profile địch: ước lượng THÔ tỷ lệ sát thương AD/AP (2 số cộng ~100, không cần chính xác tuyệt đối), mức CC, có hồi máu không, ai là mối đe dọa lớn nhất.
2. Điểm MẠNH tướng người chơi cần phát huy + điểm YẾU cần che (dựa "cách lên đồ", tầm đánh, spike).
3. GIỮ ĐỒ LÕI theo BUILD CHUẨN ở trên làm gốc (giữ tính mạch lạc/synergy), CHỈ đổi/thêm 1-2 món để KHẮC CHẾ. Bám TAG synergy của tướng:
   - Chí mạng (critDamage) đi cùng critDamage/onHit; on-hit (onHit) đi cùng onHit; tốn năng lượng cần item hồi/cộng mana; xuyên giáp (armorPen) cho sát thủ AD; magicPen cho pháp sư. KHÔNG trộn lung tung phá synergy.
   - Địch nghiêng AP -> món kháng phép (mr). Nghiêng AD -> giáp (armor) + giảm tốc đánh.
   - Địch có hồi máu/hút máu -> BẮT BUỘC 1 món Vết Thương Sâu (grievous).
   - Sát thủ burst -> đồ cứu mạng (revive/shield/stasis). Nhiều CC -> kháng hiệu ứng (tenacity).
4. Ngọc + phép bổ trợ chọn theo đối thủ (vd địch hồi máu -> Thiêu Đốt; sát thủ/xạ thủ mạnh -> Kiệt Sức).

CHỈ chọn TRANG BỊ trong CATALOG — trả tên tiếng Anh CHÍNH XÁC như trong catalog (không bịa, không đổi dấu nháy):
${itemList}

CHỈ chọn NGỌC CHÍNH trong danh sách (mỗi ngọc kèm [Nhánh]) — trả tên tiếng Anh CHÍNH XÁC:
${runeList}

NGỌC PHỤ — LUẬT TỐC CHIẾN: chọn ĐÚNG 4 ngọc phụ = 3 ngọc CÙNG NHÁNH với ngọc chính đã chọn + 1 ngọc thuộc MỘT NHÁNH KHÁC. Trả ĐÚNG tên tiếng Việt như danh sách:
${minorList}

CHỈ chọn PHÉP trong danh sách — trả tên tiếng Anh CHÍNH XÁC như trong danh sách:
${spellList}

YÊU CẦU OUTPUT — VIẾT NGẮN GỌN:
- build ĐÚNG 5 món gồm 1 đôi giày, thứ tự ưu tiên lên đồ. "reason" ≤10 từ.
- "yourStrengths"/"yourWeaknesses": ≤14 từ mỗi cái. "summary" ≤14 từ. "playstyle" ≤20 từ.
- "alternatives": ≤1 phương án/món, "condition" ≤6 từ (không cần để []). "mainThreats": tối đa 3.
- "keystone": 1 ngọc chính; "minorRunes": ĐÚNG 4 ngọc phụ (3 cùng nhánh ngọc chính + 1 nhánh khác); "spells": ĐÚNG 2 phép. "reason" ≤8 từ.

CHỈ trả JSON thuần (không markdown, không \`\`\`):
{"teamProfile":{"adPercent":0,"apPercent":0,"ccLevel":"none|low|medium|high","hasHealing":false,"mainThreats":[""],"summary":""},"yourStrengths":"","yourWeaknesses":"","keystone":{"name":"","reason":""},"minorRunes":[{"name":"","reason":""}],"spells":[{"name":"","reason":""}],"build":[{"order":1,"item":"","type":"core|boots|situational","reason":"","alternatives":[{"item":"","condition":""}]}],"playstyle":""}`;

  return {
    model: ANALYZE_MODEL,
    max_tokens: 1400,
    ...ANALYZE_CFG,
    messages: [{ role: "user", content: prompt }],
  };
}

// ───────────────────────── CHAMPBUILD (build chuẩn 1 tướng, không có đối thủ) ─────────────────────────
// Thay nguồn cào (lolwildriftbuild lẫn item PC) bằng AI đề xuất build TIÊU CHUẨN cho 1 tướng,
// CHỈ chọn trong catalog Tốc Chiến curated → không lòi item LMHT PC.
function buildChampBuild({ champ, lane, champMeta, metaBuild, items, runes, minorRunes, spells }) {
  const itemList = (items || [])
    .map((i) => `- ${i.name} (${i.vi}) [${i.type}${i.tags && i.tags.length ? ` · ${i.tags.join(",")}` : ""}]: ${i.desc}`)
    .join("\n");
  const runeList = (runes || []).map((r) => `- [${r.tree}] ${r.name} (${r.vi}): ${r.desc}`).join("\n");
  const minorList = fmtMinorRunes(minorRunes);
  const spellList = (spells || []).map((s) => `- ${s.name} (${s.vi}): ${s.desc}`).join("\n");
  const me = champMeta ? fmtChamp(champMeta).replace(/^- /, "") : champ;

  const mb = metaBuild || {};
  const anchorBits = [
    (mb.core || []).length ? `Đồ lõi: ${mb.core.join(", ")}` : null,
    (mb.boots || []).length ? `Giày: ${mb.boots.join(", ")}` : null,
    (mb.situational || []).length ? `Tùy tình huống: ${mb.situational.join(", ")}` : null,
  ].filter(Boolean);
  const anchorBlock = anchorBits.length
    ? `\nBUILD MẪU CHUẨN của tướng này (GIỮ làm gốc cho mạch lạc, chỉ tinh chỉnh nếu thật cần):\n${anchorBits.map((b) => `- ${b}`).join("\n")}\n`
    : "";

  const prompt = `Bạn là HLV Tốc Chiến (Wild Rift) chuyên nghiệp. Đề xuất BỘ TRANG BỊ TIÊU CHUẨN, tối ưu nhất
cho tướng dưới đây theo lối lên đồ đặc trưng + meta hiện tại (KHÔNG có đối thủ cụ thể, build phổ quát mạnh nhất).

⚠ ĐÂY LÀ LIÊN MINH: TỐC CHIẾN (Wild Rift) — KHÔNG phải LMHT PC. Tên item/chỉ số khác bản PC. TUYỆT ĐỐI
chỉ dùng item/ngọc/phép trong CATALOG bên dưới, KHÔNG lấy theo trí nhớ LMHT PC.

TƯỚNG${lane ? ` (${lane})` : ""}: ${me}
${anchorBlock}
CÁCH CHỌN:
- Bám BUILD MẪU CHUẨN ở trên + "cách lên đồ đặc trưng" của tướng (vd AD chí mạng -> Vô Cực Kiếm + chí mạng; AP burst -> Mũ Rabadon/Vọng Âm Luden; đấu sĩ -> Tam Hợp/Rìu Đen; đỡ đòn -> đồ trâu).
- SYNERGY theo TAG: chí mạng (critDamage) đi cùng critDamage/onHit; on-hit đi cùng onHit; tốn năng lượng cần item mana; xuyên giáp cho sát thủ AD; magicPen cho pháp sư. KHÔNG trộn phá synergy.
- Build cân bằng: đủ sát thương + 1 món sống sót hợp tướng. Đúng 1 đôi giày.
- Ngọc + 2 phép bổ trợ chuẩn nhất cho tướng.

CHỈ chọn TRANG BỊ trong CATALOG dưới đây (trả tên tiếng Anh CHÍNH XÁC như trong catalog).
⚠ TUYỆT ĐỐI KHÔNG dùng tên item không xuất hiện trong danh sách này, dù nó quen thuộc ở LMHT PC
(vd Kraken Slayer/Galeforce/Stormrazor... CHỈ dùng nếu chúng thực sự có trong danh sách). Lưu ý: nhiều
"item" bên PC ở Tốc Chiến là NGỌC (vd Kraken Slayer) — không đưa vào trang bị.
${itemList}

CHỈ chọn NGỌC CHÍNH trong danh sách (mỗi ngọc kèm [Nhánh]) — trả tên tiếng Anh chính xác:
${runeList}

NGỌC PHỤ — LUẬT TỐC CHIẾN: chọn ĐÚNG 4 ngọc phụ = 3 ngọc CÙNG NHÁNH với ngọc chính đã chọn + 1 ngọc thuộc MỘT NHÁNH KHÁC. Trả ĐÚNG tên tiếng Việt như danh sách:
${minorList}

CHỈ chọn PHÉP trong danh sách (trả tên tiếng Anh chính xác):
${spellList}

YÊU CẦU OUTPUT — NGẮN GỌN:
- "boots": 1 đôi giày. "core": 3 món cốt lõi (thứ tự lên). "situational": 2-3 món tùy tình huống.
- "keystone": 1 ngọc chính; "minorRunes": ĐÚNG 4 ngọc phụ (3 cùng nhánh + 1 nhánh khác); "spells": ĐÚNG 2 phép. "reason" ≤8 từ. "playstyle" ≤20 từ.

CHỈ trả JSON thuần (không markdown, không \`\`\`):
{"boots":"","core":["",""],"situational":["",""],"keystone":{"name":"","reason":""},"minorRunes":[{"name":"","reason":""}],"spells":[{"name":"","reason":""}],"playstyle":""}`;

  return {
    model: ANALYZE_MODEL,
    max_tokens: 1100,
    ...ANALYZE_CFG,
    messages: [{ role: "user", content: prompt }],
  };
}

// ───────────────────────── SUGGEST (gợi ý tướng nên chọn) ─────────────────────────
function buildSuggest({ lane, enemies, allyMeta, enemyMeta, allowlist, metaTiers }) {
  // Gắn tier meta hiện tại vào tên tướng (vd "Yasuo [S+]") để AI ưu tiên tướng đang mạnh.
  // Tướng không có tier → để trơn. Model vẫn trả tên gốc (phần trước dấu []).
  const tiers = metaTiers || {};
  const list = (allowlist || [])
    .map((n) => (tiers[n] ? `${n} [${tiers[n]}]` : n))
    .join(", ");
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
- BÁM META: nhãn [S+]/[S]/[A+]/[A]... là tier mạnh-yếu patch hiện tại. Khi 2 tướng ngang nhau về khắc chế/bù vai trò, ƯU TIÊN tướng tier cao hơn. Tướng không có nhãn = chưa rõ tier, không phải yếu.
- Chỉ gợi ý tướng HỢP đường "${lane}", KHÔNG trùng tướng 2 đội đã chọn.

QUAN TRỌNG — CHỈ chọn tướng trong danh sách sau (không bịa tướng ngoài danh sách). Trả ĐÚNG tên tiếng Anh, BỎ nhãn tier trong "[]" (vd "Yasuo [S+]" -> trả "Yasuo"):
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

// Gom ngọc phụ theo nhánh cho prompt → AI dễ chọn 3 ngọc từ 3 nhánh khác nhau.
function fmtMinorRunes(minorRunes) {
  const byTree = {};
  for (const r of minorRunes || []) (byTree[r.tree] = byTree[r.tree] || []).push(r);
  return Object.entries(byTree)
    .map(([tree, rs]) => `[Nhánh ${tree}]\n` + rs.map((r) => `- ${r.vi}: ${r.desc}`).join("\n"))
    .join("\n");
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
