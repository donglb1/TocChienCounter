// src/screens/ConfirmScreen.js
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator, Alert,
} from "react-native";
import { C } from "../theme";
import { suggestChampions, findChampion } from "../data/champions";
import { championIcon } from "../lib/images";
import { analyzeBuild } from "../lib/api";

export default function ConfirmScreen({ session, patch, onBack, onAnalyzed }) {
  const [enemies, setEnemies] = useState(session.enemies || []);
  const [query, setQuery] = useState("");
  const [suggests, setSuggests] = useState([]);
  const [loading, setLoading] = useState(false);

  const remove = (idx) => setEnemies((e) => e.filter((_, i) => i !== idx));

  const add = (c) => {
    setEnemies((e) => [
      ...e,
      { name: c.name, displayName: c.vi, confidence: "high" },
    ]);
    setQuery("");
    setSuggests([]);
  };

  const onQuery = (t) => {
    setQuery(t);
    setSuggests(suggestChampions(t));
  };

  const run = async () => {
    if (enemies.length === 0) {
      Alert.alert("Trống", "Thêm ít nhất 1 tướng địch.");
      return;
    }
    setLoading(true);
    try {
      patch({ enemies });
      const build = await analyzeBuild({
        champ: session.champ,
        lane: session.lane,
        enemies: enemies.map((e) => e.name),
      });
      patch({ build });
      onAnalyzed();
    } catch (e) {
      Alert.alert("Lỗi", String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.hint}>
        Kiểm tra lại danh sách tướng địch AI đọc được. Sửa tay nếu sai — thà mất 2 giây còn hơn build lệch.
      </Text>

      <Text style={styles.label}>TEAM ĐỊCH ({enemies.length})</Text>
      <View style={styles.chips}>
        {enemies.map((e, idx) => {
          const known = !!findChampion(e.name);
          const low = e.confidence === "low";
          return (
            <View key={`${e.name}-${idx}`} style={[styles.chip, (!known || low) && styles.chipWarn]}>
              {known && <Image source={{ uri: championIcon(findChampion(e.name)) }} style={styles.chipAvatar} />}
              <Text style={styles.chipText}>{e.displayName || e.name}</Text>
              {(!known || low) && <Text style={styles.warnTag}>⚠</Text>}
              <TouchableOpacity onPress={() => remove(idx)} hitSlop={8}>
                <Text style={styles.remove}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <Text style={[styles.label, { marginTop: 18 }]}>THÊM TƯỚNG</Text>
      <TextInput
        value={query}
        onChangeText={onQuery}
        placeholder="Gõ tên tướng để thêm…"
        placeholderTextColor={C.textFaint}
        style={styles.input}
      />
      {suggests.length > 0 && (
        <View style={styles.suggestBox}>
          {suggests.map((c) => (
            <TouchableOpacity key={c.id} style={styles.suggestItem} onPress={() => add(c)}>
              <Image source={{ uri: championIcon(c) }} style={styles.suggestAvatar} />
              <Text style={styles.suggestText}>{c.vi}</Text>
              <Text style={styles.suggestRole}>{c.role}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <TouchableOpacity style={styles.back} onPress={onBack}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.cta, loading && { opacity: 0.6 }]} onPress={run} disabled={loading}>
          {loading ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ActivityIndicator color="#0b1220" />
              <Text style={styles.ctaText}>Đang phân tích…</Text>
            </View>
          ) : (
            <Text style={styles.ctaText}>PHÂN TÍCH BUILD →</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  hint: { color: C.textDim, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  label: { color: C.textDim, fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 7, paddingLeft: 6, paddingRight: 10,
    paddingVertical: 6, borderRadius: 20, backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.border,
  },
  chipWarn: { borderColor: C.warn, backgroundColor: "#2a2410" },
  chipAvatar: { width: 24, height: 24, borderRadius: 12 },
  chipText: { color: C.text, fontWeight: "600", fontSize: 14 },
  warnTag: { color: C.warn, fontSize: 13 },
  remove: { color: C.textFaint, fontSize: 15, fontWeight: "700" },
  input: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 16,
  },
  suggestBox: { marginTop: 6, backgroundColor: C.cardAlt, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  suggestItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  suggestAvatar: { width: 28, height: 28, borderRadius: 6 },
  suggestText: { color: C.text, fontSize: 15, fontWeight: "600", flex: 1 },
  suggestRole: { color: C.textFaint, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 24 },
  back: { paddingVertical: 15, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  backText: { color: C.textDim, fontWeight: "700" },
  cta: { flex: 1, backgroundColor: C.amber, borderRadius: 12, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#0b1220", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
});
