// src/components/neon.js — mảnh UI dùng chung cho theme esports/neon (tái dùng nhiều màn).
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, GRAD, glow, tierColor } from "../theme";

// 4 ngoặc góc cyan ôm quanh thẻ key art (góc bracket như thiết kế)
export function CornerBrackets({ color = C.cyan, size = 18, inset = 9, thickness = 2 }) {
  const base = { position: "absolute", width: size, height: size };
  return (
    <>
      <View style={[base, { top: inset, left: inset, borderTopWidth: thickness, borderLeftWidth: thickness, borderColor: color }]} />
      <View style={[base, { top: inset, right: inset, borderTopWidth: thickness, borderRightWidth: thickness, borderColor: color }]} />
      <View style={[base, { bottom: inset, left: inset, borderBottomWidth: thickness, borderLeftWidth: thickness, borderColor: color }]} />
      <View style={[base, { bottom: inset, right: inset, borderBottomWidth: thickness, borderRightWidth: thickness, borderColor: color }]} />
    </>
  );
}

// Tiêu đề mục: gạch dọc gradient cyan→tím + chữ HOA
export function SectionTitle({ children, style }) {
  return (
    <View style={[nstyles.titleRow, style]}>
      <LinearGradient colors={GRAD.accentBar} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={nstyles.titleBar} />
      <Text style={nstyles.titleText}>{children}</Text>
    </View>
  );
}

// Badge tier góc vát (xấp xỉ clip-path bằng bo góc lệch) + viền/màu theo tier
export function TierBadge({ tier, size = "sm" }) {
  if (!tier) return null;
  const c = tierColor(tier);
  const big = size === "lg";
  return (
    <View style={[big ? nstyles.tierLg : nstyles.tierSm, { borderColor: c }, glow(c, 8, 0.5)]}>
      <Text style={[big ? nstyles.tierLgText : nstyles.tierSmText, { color: c }]}>{tier}</Text>
    </View>
  );
}

const nstyles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 16 },
  titleBar: { width: 4, height: 22, borderRadius: 2, ...glow(C.violet, 8, 0.8) },
  titleText: { color: C.text, fontWeight: "800", fontSize: 19, letterSpacing: 0.5 },
  tierSm: {
    minWidth: 30, alignItems: "center", borderWidth: 1.5, borderTopLeftRadius: 6,
    borderTopRightRadius: 6, borderBottomLeftRadius: 6, borderBottomRightRadius: 2,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  tierSmText: { fontWeight: "900", fontSize: 12 },
  tierLg: {
    borderWidth: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 3, paddingHorizontal: 9, paddingVertical: 2,
  },
  tierLgText: { fontWeight: "900", fontSize: 16 },
});
