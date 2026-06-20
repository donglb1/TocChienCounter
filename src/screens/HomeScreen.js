// src/screens/HomeScreen.js
// Trang chủ: feed tin tức Tốc Chiến cào từ trang chính thức. Chạm 1 tin → mở trình duyệt.
import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image,
  ActivityIndicator, RefreshControl, Linking,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";
import { C } from "../theme";
import { fetchNews } from "../lib/api";

// "2026-05-27T09:00:00Z" → "27/05/2026"
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function HomeScreen() {
  const [news, setNews] = useState([]);
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (isRefresh) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const data = await fetchNews();
      setNews(data.news || []);
      setFallbackUrl(data.fallbackUrl || "");
      if ((data.news || []).length === 0) {
        setError("Chưa lấy được tin lúc này.");
      }
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  // Mở tin NGAY TRONG APP (Custom Tab/Safari overlay), có nút Xong để quay lại.
  // Lỗi (vd URL không hợp lệ) → rơi về trình duyệt hệ thống cho chắc.
  const open = (url) => {
    if (!url) return;
    WebBrowser.openBrowserAsync(url, {
      toolbarColor: C.bg,
      controlsColor: C.amber,
      enableBarCollapsing: true,
    }).catch(() => Linking.openURL(url).catch(() => {}));
  };

  const renderItem = ({ item, index }) => {
    const featured = index === 0; // tin mới nhất hiển thị lớn
    return (
      <TouchableOpacity
        style={[styles.card, featured && styles.cardFeatured]}
        activeOpacity={0.85}
        onPress={() => open(item.url)}
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={featured ? styles.imgFeatured : styles.img}
          />
        ) : (
          <View style={[featured ? styles.imgFeatured : styles.img, styles.imgFallback]}>
            <Text style={styles.imgFallbackText}>TỐC CHIẾN</Text>
          </View>
        )}
        <View style={styles.body}>
          {!!item.category && (
            <Text style={styles.category}>{item.category.toUpperCase()}</Text>
          )}
          <Text style={featured ? styles.titleFeatured : styles.title} numberOfLines={3}>
            {item.title}
          </Text>
          <Text style={styles.date}>{fmtDate(item.publishedAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.amber} />
        <Text style={styles.dim}>Đang tải tin tức…</Text>
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
        <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={C.amber} />
      }
      ListHeaderComponent={
        <Text style={styles.heading}>TIN TỨC TỐC CHIẾN</Text>
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
  heading: { color: C.text, fontWeight: "900", fontSize: 18, letterSpacing: 1, marginBottom: 14 },
  card: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    marginBottom: 12, overflow: "hidden",
  },
  cardFeatured: { borderColor: C.amberDim },
  img: { width: "100%", height: 150, backgroundColor: C.cardAlt },
  imgFeatured: { width: "100%", height: 200, backgroundColor: C.cardAlt },
  imgFallback: { alignItems: "center", justifyContent: "center" },
  imgFallbackText: { color: C.textFaint, fontWeight: "800", letterSpacing: 2 },
  body: { padding: 13 },
  category: { color: C.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  title: { color: C.text, fontSize: 15, fontWeight: "700", lineHeight: 21 },
  titleFeatured: { color: C.text, fontSize: 18, fontWeight: "800", lineHeight: 25 },
  date: { color: C.textFaint, fontSize: 12, marginTop: 8 },
  fallbackBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 18, paddingVertical: 11, borderRadius: 10,
    borderWidth: 1, borderColor: C.amber,
  },
  fallbackText: { color: C.amber, fontWeight: "700" },
});
