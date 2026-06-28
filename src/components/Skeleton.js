// src/components/Skeleton.js — khối "xương" nhấp nháy hiển thị trong lúc tải.
// Mượt hơn spinner, gợi đúng bố cục nội dung sắp hiện. Dùng Animated (native driver).
import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { C, glow } from "../theme";

// 1 khối chữ nhật nhấp nháy opacity 0.4 ↔ 1.
export function SkeletonBlock({ style }) {
  const op = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(op, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [op]);
  return <Animated.View style={[styles.block, { opacity: op }, style]} />;
}

// Skeleton cho feed tin tức (HomeScreen): ảnh lớn + 3 dòng chữ.
export function NewsSkeleton({ count = 4 }) {
  return (
    <View style={{ padding: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.newsCard}>
          <SkeletonBlock style={styles.newsImg} />
          <View style={{ padding: 13, gap: 9 }}>
            <SkeletonBlock style={{ width: 80, height: 10 }} />
            <SkeletonBlock style={{ width: "92%", height: 16 }} />
            <SkeletonBlock style={{ width: "55%", height: 16 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

// Skeleton cho danh sách cấm (BanScreen): avatar + 3 dòng.
export function BanSkeleton({ count = 6 }) {
  return (
    <View style={{ paddingHorizontal: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.banCard}>
          <SkeletonBlock style={styles.banAvatar} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBlock style={{ width: "50%", height: 14 }} />
            <SkeletonBlock style={{ width: "35%", height: 11 }} />
            <SkeletonBlock style={{ width: "80%", height: 11 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: C.cardAlt, borderRadius: 8 },
  newsCard: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    marginBottom: 14, overflow: "hidden", ...glow(C.cyan, 14, 0.15),
  },
  newsImg: { width: "100%", height: 200, borderRadius: 0 },
  banCard: {
    flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: C.card,
    borderRadius: 13, borderWidth: 1, borderColor: C.border, padding: 11, marginBottom: 10,
  },
  banAvatar: { width: 46, height: 46, borderRadius: 10 },
});
