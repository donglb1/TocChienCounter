// src/lib/useVersionCheck.js
// Gọi /api/version khi app mở, hiện Alert nếu cần update.

import { useEffect } from "react";
import { Alert, Linking, Platform } from "react-native";
import Constants from "expo-constants";
import { BACKEND_URL } from "./api";

const API_URL = `${BACKEND_URL}/api/version`;

function compareVersions(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

export function useVersionCheck() {
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) return;
        const { minVersion, forceUpdate, message, ios, android } = await res.json();

        const current = Constants.expoConfig?.version || "0.0.0";
        const needUpdate = compareVersions(current, minVersion) < 0;
        if (!needUpdate) return;

        const storeUrl = Platform.OS === "ios" ? ios : android;
        const msg =
          message ||
          (forceUpdate
            ? "Phiên bản này không còn được hỗ trợ. Vui lòng cập nhật để tiếp tục."
            : "Có phiên bản mới. Cập nhật để dùng tính năng mới nhất nhé!");

        const buttons = [
          { text: "Cập nhật ngay", onPress: () => Linking.openURL(storeUrl) },
        ];
        if (!forceUpdate) {
          buttons.push({ text: "Để sau", style: "cancel" });
        }

        Alert.alert("Cập nhật ứng dụng", msg, buttons, {
          cancelable: !forceUpdate,
        });
      } catch {
        // Bỏ qua lỗi mạng — không chặn app
      }
    })();
  }, []);
}
