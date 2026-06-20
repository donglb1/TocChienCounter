// src/theme.js — màu HUD esports + helper + hằng số dùng chung

export const C = {
  bg: "#0b1220",
  bgAlt: "#0f172a",
  card: "#111c33",
  cardAlt: "#16223d",
  border: "#1e2d4d",
  text: "#e6edf7",
  textDim: "#94a3b8",
  textFaint: "#64748b",
  amber: "#f5b945",
  amberDim: "#7a5a1e",
  cyan: "#34d6e8",
  cyanDim: "#1d6a74",
  red: "#ef4444",
  green: "#22c55e",
  ad: "#f97316", // sát thương vật lý
  ap: "#a855f7", // sát thương phép
  warn: "#fbbf24",
};

export const LANES = [
  "Đường trên",
  "Rừng",
  "Đường giữa",
  "Đường dưới",
  "Hỗ trợ",
];

// Bỏ dấu tiếng Việt để match autocomplete không phân biệt dấu
export function noDiacritics(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
