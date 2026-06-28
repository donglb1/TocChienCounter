// src/lib/haptics.js — rung phản hồi nhẹ (haptic) bọc expo-haptics.
// An toàn: chỉ chạy trên iOS/Android, nuốt mọi lỗi để không bao giờ làm crash UI.
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

const enabled = Platform.OS === "ios" || Platform.OS === "android";

// Chạm chọn nhẹ — dùng cho chip, tab, toggle (vd chọn lane, đổi sort, yêu thích).
export function tapSelection() {
  if (!enabled) return;
  Haptics.selectionAsync().catch(() => {});
}

// Nhấn nút chính / hành động quan trọng (CTA). style: "light" | "medium" | "heavy".
export function tapImpact(style = "medium") {
  if (!enabled) return;
  const map = {
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
  };
  Haptics.impactAsync(map[style] || Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

// Báo kết quả: "success" | "warning" | "error".
export function tapNotify(type = "success") {
  if (!enabled) return;
  const map = {
    success: Haptics.NotificationFeedbackType.Success,
    warning: Haptics.NotificationFeedbackType.Warning,
    error: Haptics.NotificationFeedbackType.Error,
  };
  Haptics.notificationAsync(map[type] || Haptics.NotificationFeedbackType.Success).catch(() => {});
}
