// src/theme.js — Neon / Cyberpunk theme. Giữ nguyên TÊN token để mọi màn tự đổi.

export const C = {
  // Nền gần đen, hơi ám xanh tím → chiều sâu "tương lai"
  bg: "#05060a",
  bgAlt: "#0a0d18",
  card: "#0e1322",
  cardAlt: "#141b30",
  border: "#1e2b4a", // viền ám xanh neon nhạt

  text: "#eaf2ff",
  textDim: "#8b9bc4",
  textFaint: "#566087",

  // Accent neon
  amber: "#ffcb52", // vàng neon (CTA chính)
  amberDim: "#5e4a1c",
  cyan: "#27e3ff", // cyan neon (accent chủ đạo)
  cyanDim: "#0c3a47",
  violet: "#a679ff", // tím neon (accent phụ / AP)
  violetDim: "#2a2150",

  red: "#ff4d6d",
  green: "#3df5a0",
  ad: "#ff8a3d", // sát thương vật lý (cam neon)
  ap: "#a679ff", // sát thương phép (tím neon)
  warn: "#ffc857",
};

// Gradient dùng với expo-linear-gradient (mảng màu)
export const GRAD = {
  header: ["#0b1024", "#0a0f1e", "#100a26"], // navy → tím nhẹ
  cta: ["#27e3ff", "#7a8bff", "#a679ff"], // cyan → tím (nút chính tương lai)
  screen: ["#05060a", "#070912"],
  card: ["#101626", "#0c1120"],
};

// Glow mềm cho hiệu ứng neon (đổ bóng cùng màu). Dùng spread vào style.
export const glow = (color = C.cyan, radius = 12, opacity = 0.55) => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: 0 },
  elevation: Math.round(radius / 2),
});

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
