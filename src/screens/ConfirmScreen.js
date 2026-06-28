// src/screens/ConfirmScreen.js
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert,
} from "react-native";
import { C } from "../theme";
import { findChampion } from "../data/champions";
import { championIcon } from "../lib/images";
import { analyzeBuild, getCachedBuildForChamp } from "../lib/api";
import { addHistory } from "../lib/storage";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "../components/GradientButton";
import { ChampSearch } from "../components/inputs";

export default function ConfirmScreen({ session, patch, onBack, onAnalyzed, onSuggestPicks }) {
  const [enemies, setEnemies] = useState(session.enemies || []);
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
    const enemyNames = enemies.map((e) => e.name);
    patch({ enemies });

    // Có build cache của tướng này → hiện TẠM ngay (đồ/ngọc/phép) rồi phân tích lại nền.
    const cached = await getCachedBuildForChamp(session.champ);
    if (cached) {
      patch({ build: cached, buildStale: true, buildError: false });
      onAnalyzed();
    } else {
      setLoading(true);
    }

    try {
      const build = await analyzeBuild({
        champ: session.champ,
        lane: session.lane,
        enemies: enemyNames,
        laneOpponent: laneOpp,
      });
      patch({ build, buildStale: false, buildError: false });
      addHistory({ champ: session.champ, lane: session.lane, enemies: enemyNames, build });
      if (!cached) onAnalyzed();
    } catch (e) {
      if (cached) patch({ buildStale: false, buildError: true }); // giữ build cũ, báo không cập nhật được
      else Alert.alert("Lỗi", String(e.message || e));
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
      <ChampSearch onPick={add} placeholder="Gõ tên tướng để thêm…" />

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
  optional: { color: C.textFaint, fontSize: 10, fontWeight: "600", letterSpacing: 0 },
  oppChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, backgroundColor: C.card,
  },
  oppChipActive: { borderColor: C.red, backgroundColor: "#2a1414" },
  oppText: { color: C.textDim, fontWeight: "600", fontSize: 13 },
  oppTextActive: { color: C.text },
  suggestCta: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7,
    marginTop: 24, borderRadius: 12, paddingVertical: 14,
    borderWidth: 1.5, borderColor: C.cyan, backgroundColor: C.cyanDim,
  },
  suggestCtaText: { color: C.text, fontWeight: "800", fontSize: 14, letterSpacing: 0.5 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  back: { paddingVertical: 15, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  backText: { color: C.textDim, fontWeight: "700" },
});
