// src/lib/patchWatch.js
// Theo dõi PATCH: nhớ patch lần xem trước, khi game lên patch mới → bắn THÔNG BÁO CỤC BỘ
// (nhắc kiểm tra tướng tủ vì build/tier có thể đổi). Không cần server đẩy: so sánh ngay khi mở app.
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getFavorites } from "./storage";
import { CHAMPIONS } from "../data/champions";

const LAST_PATCH_KEY = "@tcc/lastSeenPatch";
const NOTIFY_KEY = "@tcc/notifyPatch"; // "1" bật | "0" tắt (mặc định bật)
const isMobile = Platform.OS === "ios" || Platform.OS === "android";

// Hiện thông báo cả khi app đang mở (foreground).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// ───────── Cờ bật/tắt thông báo ─────────
export async function getNotifyEnabled() {
  try {
    const v = await AsyncStorage.getItem(NOTIFY_KEY);
    return v == null ? true : v === "1";
  } catch (_) {
    return true;
  }
}

export async function setNotifyEnabled(on) {
  try {
    await AsyncStorage.setItem(NOTIFY_KEY, on ? "1" : "0");
  } catch (_) {}
  if (on) ensureNotifyPermission();
}

// ───────── Quyền thông báo ─────────
export async function ensureNotifyPermission() {
  if (!isMobile) return false;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.status === "granted";
  } catch (_) {
    return false;
  }
}

// id tướng tủ → tên hiển thị tiếng Việt
function favNames(ids) {
  const set = new Set(ids || []);
  return CHAMPIONS.filter((c) => set.has(c.id)).map((c) => c.vi);
}

async function presentPatchNotification(patch, favVis) {
  if (!isMobile) return;
  if (!(await getNotifyEnabled())) return;
  if (!(await ensureNotifyPermission())) return;
  const body = favVis.length
    ? `Kiểm tra lại tướng tủ: ${favVis.slice(0, 3).join(", ")}${favVis.length > 3 ? "…" : ""}`
    : "Build, ngọc và tier list đã cập nhật theo patch mới.";
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title: `Patch ${patch} đã ra mắt! 🎮`, body },
      trigger: null, // hiện ngay
    });
  } catch (_) {}
}

// Hook theo dõi patch: chạy 1 lần khi biết patch.
// - Lần đầu cài app (chưa có mốc) → chỉ lưu mốc, KHÔNG báo (tránh báo nhiễu).
// - Patch khác mốc cũ → trả về newPatch (để UI hiện badge) + bắn thông báo cục bộ.
export function usePatchWatch(patch) {
  const [newPatch, setNewPatch] = useState(null);
  const handled = useRef(false);
  useEffect(() => {
    if (!patch || handled.current) return;
    handled.current = true;
    (async () => {
      let prev = null;
      try {
        prev = await AsyncStorage.getItem(LAST_PATCH_KEY);
      } catch (_) {}
      const cur = String(patch);
      if (prev && prev !== cur) {
        setNewPatch(cur);
        presentPatchNotification(cur, favNames(await getFavorites()));
      }
      try {
        await AsyncStorage.setItem(LAST_PATCH_KEY, cur);
      } catch (_) {}
    })();
  }, [patch]);
  return newPatch;
}
