// src/components/ErrorBoundary.js
// Bắt lỗi render để 1 màn hỏng không làm sập cả app — hiện màn lỗi + nút thử lại.
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "../theme";

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Đã có lỗi xảy ra</Text>
        <Text style={styles.msg}>Ứng dụng gặp sự cố ở màn này. Thử lại giúp mình nhé.</Text>
        <Text style={styles.detail} numberOfLines={3}>{String(this.state.error?.message || this.state.error)}</Text>
        <TouchableOpacity style={styles.btn} onPress={this.reset} activeOpacity={0.85}>
          <Text style={styles.btnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  title: { color: C.text, fontSize: 18, fontWeight: "900" },
  msg: { color: C.textDim, fontSize: 14, textAlign: "center", lineHeight: 20 },
  detail: { color: C.textFaint, fontSize: 12, textAlign: "center" },
  btn: { marginTop: 8, backgroundColor: C.violet, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
});
