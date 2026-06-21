// src/theme.js — Esports / Neon theme (tím chủ đạo + cyan phụ). Giữ nguyên TÊN token để mọi màn tự đổi.
// Tham chiếu thiết kế: nền tím-đen, accent tím #a855f7, highlight cyan #22d3ee, CTA gradient cyan→tím chạy.

export const C = {
  // Nền tím-đen, chiều sâu "esports"
  bg: "#07060e", // nền màn hình
  bgAlt: "#0b0a14", // nền phụ
  card: "#0e0c1b", // thẻ / ô nhập
  cardAlt: "#0d0b18", // thẻ phụ
  border: "#241b3a", // viền tím mờ (~rgba(168,85,247,.2))

  text: "#f4f2ff",
  textDim: "#b9b6d0",
  textFaint: "#7c7997",

  // Accent: TÍM là chủ đạo (active/glow/nhãn nhấn), CYAN là phụ (highlight/link/patch)
  violet: "#a855f7", // accent chính
  violetDim: "#2a1f4d",
  cyan: "#22d3ee", // accent phụ
  cyanDim: "#103a44",
  amber: "#f5b942", // tier S / sort active / nhãn item
  amberDim: "#5e4a1c",

  red: "#ff5d73", // địch
  green: "#4ade80", // đồng đội
  ad: "#ff8a3d", // sát thương vật lý
  ap: "#a855f7", // sát thương phép (tím)
  warn: "#ffb648", // badge "Cẩn thận"
};

// Gradient dùng với expo-linear-gradient (mảng màu)
export const GRAD = {
  header: ["#120c22", "#0a0810", "#07060e"], // tím → đen (radial xấp xỉ bằng linear)
  cta: ["#22d3ee", "#7c4dff", "#22d3ee"], // cyan → tím → cyan (nút chính)
  screen: ["#07060e", "#050409"],
  card: ["#0e0c1b", "#0c0b16"],
  accentBar: ["#22d3ee", "#a855f7"], // gạch dọc/ngang highlight (header, section)
};

// Glow mềm neon (đổ bóng cùng màu). Spread vào style.
export const glow = (color = C.violet, radius = 12, opacity = 0.55) => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: 0 },
  elevation: Math.round(radius / 2),
});

// Màu tier theo thiết kế (S+ đỏ, S vàng, A cyan, B/C/D xám)
export const TIER_COLOR = {
  "S+": "#ff4d6d",
  S: "#f5b942",
  "A+": "#7ee081",
  A: "#22d3ee",
  B: "#8f8ca8",
  C: "#7c7997",
  D: "#7c7997",
};
export function tierColor(t) {
  return TIER_COLOR[t] || "#8f8ca8";
}

// Cặp màu gradient cho avatar chữ-cái (fallback khi chưa có icon)
export function avatarGradient(seed = "?") {
  const palettes = [
    ["#3a2a6e", "#7c5cff"], ["#6e2233", "#e0556f"], ["#1f5a4a", "#2fd6a0"],
    ["#6e4a1f", "#e0a84f"], ["#1f4a6e", "#5cb0e0"], ["#3a1f4c", "#7c2b5a"],
  ];
  const code = String(seed).charCodeAt(0) || 0;
  return palettes[code % palettes.length];
}

export const LANES = ["Đường trên", "Rừng", "Đường giữa", "Đường dưới", "Hỗ trợ"];

// Bỏ dấu tiếng Việt để match autocomplete không phân biệt dấu
export function noDiacritics(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

// Màu theo loại sát thương để render thanh profile
export function damageColor(type) {
  if (type === "AD") return C.ad;
  if (type === "AP") return C.ap;
  return C.textDim;
}
