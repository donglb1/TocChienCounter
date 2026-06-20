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
import { addHistory } from "../lib/storage";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "../components/GradientButton";

export default function ConfirmScreen({ session, patch, onBack, onAnalyzed, onSuggestPicks }) {
  const [enemies, setEnemies] = useState(session.enemies || []);
  const [query, setQuery] = useState("");
  const [suggests, setSuggests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [laneOpp, setLaneOpp] = useState(null); // tên tướng đối lane trực tiếp (tùy chọn)

  const remove = (idx) =>
    setEnemies((e) => {
      const removed = e[idx];
      if (removed && removed.name === laneOpp) setLaneOpp(null);
      return e.filter((_, i) => i !== idx);
    });

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

  const goSuggest = () => {
    if (enemies.length === 0) {
      Alert.alert("Trống", "Thêm ít nhất 1 tướng địch.");
      return;
    }
    patch({ enemies });
    onSuggestPicks();
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
        laneOpponent: laneOpp,
      });
      patch({ build });
      addHistory({ champ: session.champ, lane: session.lane, enemies: enemies.map((e) => e.name), build });
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
          const champ = findChampion(e.name);
          const known = !!champ;
          const low = e.confidence === "low";
          return (
            <View key={`${e.name}-${idx}`} style={[styles.chip, (!known || low) && styles.chipWarn]}>
              {known && <Image source={{ uri: championIcon(champ) }} style={styles.chipAvatar} />}
              {/* Tướng đã nhận diện → hiện tên chuẩn từ DB (khớp icon).
                  Chưa nhận diện → giữ chuỗi AI đọc + cảnh báo ⚠ */}
              <Text style={styles.chipText}>{known ? champ.vi : (e.displayName || e.name)}</Text>
              {(!known || low) && <Ionicons name="warning" size={13} color={C.warn} />}
              <TouchableOpacity onPress={() => remove(idx)} hitSlop={8}>
                <Ionicons name="close" size={15} color={C.textFaint} />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {enemies.length > 0 && (
        <>
          <Text style={[styles.label, { marginTop: 18 }]}>
            ⚔ ĐỐI THỦ CÙNG ĐƯỜNG <Text style={styles.optional}>(tùy chọn — để build sớm bám matchup)</Text>
          </Text>
          <View style={styles.chips}>
            {enemies.map((e, idx) => {
              const champ = findChampion(e.name);
              const active = laneOpp === e.name;
              return (
                <TouchableOpacity
                  key={`opp-${e.name}-${idx}`}
                  style={[styles.oppChip, active && styles.oppChipActive]}
                  onPress={() => setLaneOpp(active ? null : e.name)}
                >
                  <Text style={[styles.oppText, active && styles.oppTextActive]}>
                    {champ ? champ.vi : e.displayName || e.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

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

      <TouchableOpacity style={styles.suggestCta} onPress={goSuggest} disabled={loading} activeOpacity={0.85}>
        <Ionicons name="bulb-outline" size={16} color={C.text} />
        <Text style={styles.suggestCtaText}>Gợi ý tướng nên chọn</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity style={styles.back} onPress={onBack}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <GradientButton
          title="PHÂN TÍCH BUILD →"
          loading={loading}
          loadingText="Đang phân tích…"
          onPress={run}
          style={{ flex: 1 }}
        />
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
  optional: { color: C.textFaint, fontSize: 10, fontWeight: "600", letterSpacing: 0 },
  oppChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.card,
  },
  oppChipActive: { borderColor: C.red, backgroundColor: "#2a1414" },
  oppText: { color: C.textDim, fontWeight: "600", fontSize: 13 },
  oppTextActive: { color: C.text },
  input: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 16,
  },
  suggestBox: { marginTop: 6, backgroundColor: C.cardAlt, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  suggestItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  suggestAvatar: { width: 28, height: 28, borderRadius: 6 },
  suggestText: { color: C.text, fontSize: 15, fontWeight: "600", flex: 1 },
  suggestRole: { color: C.textFaint, fontSize: 12 },
  suggestCta: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7,
    marginTop: 24, borderRadius: 12, paddingVertical: 14,
    borderWidth: 1.5, borderColor: C.cyan, backgroundColor: C.cyanDim,
  },
  suggestCtaText: { color: C.text, fontWeight: "800", fontSize: 14, letterSpacing: 0.5 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  back: { paddingVertical: 15, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  backText: { color: C.textDim, fontWeight: "700" },
  cta: { flex: 1, backgroundColor: C.amber, borderRadius: 12, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  ctaText: { color: "#0b1220", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
});
