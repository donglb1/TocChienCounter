// src/components/GradientButton.js — nút CTA gradient neon (cyan→tím) có glow.
import React from "react";
import { Text, StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, GRAD, glow } from "../theme";

export default function GradientButton({ title, onPress, disabled, loading, loadingText, style }) {
  const off = disabled || loading;
  return (
    <TouchableOpacity onPress={onPress} disabled={off} activeOpacity={0.85} style={[styles.wrap, style]}>
      <LinearGradient
        colors={GRAD.cta}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.grad, off && { opacity: 0.55 }]}
      >
        {loading ? (
          <View style={styles.row}>
            <ActivityIndicator color="#04101a" />
            <Text style={styles.text}>{loadingText || "Đang xử lý…"}</Text>
          </View>
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 14, ...glow(C.cyan, 14, 0.45) },
  grad: { borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { color: "#04101a", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
});
