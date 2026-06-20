// src/screens/HistoryScreen.js
// Lịch sử các lần phân tích build (lưu offline). Chạm 1 mục → xem lại kết quả.
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import { C } from "../theme";
import { getHistory, clearHistory } from "../lib/storage";

function fmt(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function HistoryScreen({ onBack, onOpen }) {
  const [items, setItems] = useState(null);

  useEffect(() => {
    getHistory().then(setItems);
  }, []);

  const onClear = () => {
    Alert.alert("Xóa lịch sử?", "Toàn bộ phân tích đã lưu sẽ bị xóa.", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: async () => setItems(await clearHistory()) },
    ]);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.top}>
        <TouchableOpacity onPress={onBack} hitSlop={8}>
          <Text style={styles.back}>← Quay lại</Text>
        </TouchableOpacity>
        {items && items.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={8}>
            <Text style={styles.clear}>Xóa hết</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items || []}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        renderItem={({ item }) => {
          const items5 = (item.build?.build || []).length;
          return (
            <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => onOpen(item)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.champ}>{item.champ} <Text style={styles.lane}>· {item.lane}</Text></Text>
                <Text style={styles.sub}>
                  {(item.enemies || []).length} tướng địch · {items5} món · {fmt(item.ts)}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          items === null ? null : (
            <Text style={styles.empty}>Chưa có phân tích nào.{"\n"}Phân tích 1 trận rồi quay lại đây.</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  top: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  back: { color: C.cyan, fontWeight: "700", fontSize: 14 },
  clear: { color: C.red, fontWeight: "700", fontSize: 14 },
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10,
  },
  champ: { color: C.text, fontSize: 16, fontWeight: "800" },
  lane: { color: C.textDim, fontWeight: "600", fontSize: 14 },
  sub: { color: C.textFaint, fontSize: 12, marginTop: 4 },
  chevron: { color: C.textFaint, fontSize: 24, fontWeight: "300" },
  empty: { color: C.textDim, textAlign: "center", marginTop: 40, lineHeight: 22 },
});
