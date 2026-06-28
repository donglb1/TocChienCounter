// src/screens/HomeScreen.js
// Trang chủ: feed tin tức Tốc Chiến cào từ trang chính thức. Chạm 1 tin → mở trình duyệt.
// Dữ liệu lấy từ NewsContext (fetch 1 lần, dùng chung với header app).
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image,
  RefreshControl, Linking,
} from "react-native";
import { glow } from "../theme";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme";
import { CornerBrackets } from "../components/neon";
import { useNews } from "../lib/newsContext";
import { tapSelection } from "../lib/haptics";
import { NewsSkeleton } from "../components/Skeleton";

// "2026-05-27T09:00:00Z" → "27/05/2026"
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function HomeScreen() {
  const { news, fallbackUrl, loading, error, reload } = useNews();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload(true);
    setRefreshing(false);
  };

  // Mở tin NGAY TRONG APP (Custom Tab/Safari overlay), có nút Xong để quay lại.
  // Lỗi (vd URL không hợp lệ) → rơi về trình duyệt hệ thống cho chắc.
  const open = (url) => {
    if (!url) return;
    tapSelection();
    WebBrowser.openBrowserAsync(url, {
      toolbarColor: C.bg,
      controlsColor: C.amber,
      enableBarCollapsing: true,
    }).catch(() => Linking.openURL(url).catch(() => {}));
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={[styles.card, styles.cardFeatured]}
        activeOpacity={0.85}
        onPress={() => open(item.url)}
      >
        <View>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.imgFeatured} />
          ) : (
            <View style={[styles.imgFeatured, styles.imgFallback]}>
              <Text style={styles.imgFallbackText}>TỐC CHIẾN</Text>
            </View>
          )}
          <CornerBrackets color={C.cyan} />
        </View>
        <View style={styles.body}>
          {!!item.category && (
            <Text style={styles.category}>{item.category.toUpperCase()}</Text>
          )}
          <Text style={styles.titleFeatured} numberOfLines={3}>
            {item.title}
          </Text>
          <Text style={styles.date}>{fmtDate(item.publishedAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.wrap}>
        <NewsSkeleton />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.wrap}
      contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
      data={news}
      keyExtractor={(it, i) => `${it.url}-${i}`}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.amber} />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.dim}>{error || "Không có tin."}</Text>
          {!!fallbackUrl && (
            <TouchableOpacity style={styles.fallbackBtn} onPress={() => open(fallbackUrl)}>
              <Text style={styles.fallbackText}>Mở trang tin chính thức</Text>
              <Ionicons name="open-outline" size={15} color={C.amber} />
            </TouchableOpacity>
          )}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 12, minHeight: 240 },
  dim: { color: C.textDim, fontSize: 13, textAlign: "center" },
  card: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    marginBottom: 14, overflow: "hidden",
  },
  cardFeatured: { borderColor: "rgba(34,211,238,0.35)", ...glow(C.cyan, 22, 0.35) },
  imgFeatured: { width: "100%", height: 200, backgroundColor: C.cardAlt },
  imgFallback: { alignItems: "center", justifyContent: "center" },
  imgFallbackText: { color: C.textFaint, fontWeight: "800", letterSpacing: 2 },
  body: { padding: 13 },
  category: { color: C.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  titleFeatured: { color: C.text, fontSize: 18, fontWeight: "800", lineHeight: 25 },
  date: { color: C.textFaint, fontSize: 12, marginTop: 8 },
  fallbackBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 18, paddingVertical: 11, borderRadius: 10,
    borderWidth: 1, borderColor: C.amber,
  },
  fallbackText: { color: C.amber, fontWeight: "700" },
});
