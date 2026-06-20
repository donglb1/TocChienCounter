// backend/api/analyze.js — Vercel serverless function
// Giữ ANTHROPIC_API_KEY ở server. Client gọi qua đây, không bao giờ thấy key.
//
// Deploy: cd backend && npx vercel ; npx vercel env add ANTHROPIC_API_KEY ; npx vercel --prod
// Model: đọc ảnh cần chính xác cao (đọc sai 1 con hỏng cả build) → opus cho extract.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const EXTRACT_MODEL = "claude-opus-4-8";   // đọc ảnh — chính xác nhất
const ANALYZE_MODEL = "claude-sonnet-4-6"; // phân tích text — nhanh + rẻ

export default async function handler(req, res) {
  // CORS (Expo Go / web gọi cross-origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "Thiếu ANTHROPIC_API_KEY ở server" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { mode } = body || {};

    let payload;
    if (mode === "extract") payload = buildExtract(body);
    else if (mode === "analyze") payload = buildAnalyze(body);
    else return res.status(400).json({ error: "mode phải là 'extract' hoặc 'analyze'" });

    const r = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).json({ error: "Anthropic lỗi", detail: errText });
    }

    const data = await r.json();
    const text = (data.content || [])
      .map((b) => (b.type === "text" ? b.text : ""))
      .filter(Boolean)
      .join("\n");

    return res.status(200).json({ text });
  } catch (e) {
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
function buildAnalyze({ champ, lane, enemies, allowlist }) {
  const list = (allowlist || []).join(", ");
  const prompt = `Bạn là HLV Tốc Chiến (Wild Rift) chuyên nghiệp, build khắc chế theo profile giao tranh.
Tướng người chơi: "${champ}" (${lane}).
Team địch: ${(enemies || []).join(", ")}.

Phân tích profile sát thương + mối đe dọa của team địch, rồi đề xuất build KHẮC CHẾ tối ưu cho "${champ}".

NGUYÊN TẮC:
- Địch nghiêng AP -> ưu tiên đồ kháng phép. Nghiêng AD -> giáp + đồ giảm tốc đánh.
- Địch có hồi máu/hút máu mạnh -> BẮT BUỘC đồ Vết Thương Sâu.
- Có assassin sát thương nổ -> đồ cứu mạng (hồi sinh/khiên/đẩy lùi).
- Nhiều CC cứng -> giày kháng hiệu ứng + đồ giải khống chế.
- Vẫn giữ các món CỐT LÕI theo lối chơi của tướng người chơi.

QUAN TRỌNG — CHỈ ĐƯỢC chọn trang bị trong danh sách sau (không bịa món ngoài danh sách):
${list}

YÊU CẦU OUTPUT (ngắn gọn, tiếng Việt):
- build 5-6 món gồm 1 đôi giày; lý do mỗi món 1 câu; mỗi món tối đa 2 phương án thay thế kèm ĐIỀU KIỆN.
- "item" trả ĐÚNG tên trong danh sách trên.

CHỈ trả JSON thuần (không markdown, không \`\`\`):
{"teamProfile":{"adPercent":0,"apPercent":0,"ccLevel":"none|low|medium|high","hasHealing":false,"mainThreats":[""],"summary":""},"build":[{"order":1,"item":"","type":"core|boots|situational","reason":"","alternatives":[{"item":"","condition":""}]}],"playstyle":""}`;

  return {
    model: ANALYZE_MODEL,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  };
}
