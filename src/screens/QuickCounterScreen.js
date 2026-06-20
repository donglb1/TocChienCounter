// src/screens/QuickCounterScreen.js
// Tra khắc chế 1v1: chọn đường + 1 tướng địch → mẹo + đồ mua sớm TỨC THÌ (offline).
// Tùy chọn: nút AI gợi ý tướng nên pick để khắc đối thủ đó.
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, LANES } from "../theme";
import { suggestChampions, findChampion, BUILD_LABELS } from "../data/champions";
import { championIcon } from "../lib/images";
import { matchupTips } from "../lib/matchup";
import { suggestPicks } from "../lib/api";

// Tiêu đề mục có icon vector
function SectionTitle({ icon, children }) {
  return (
    <View style={styles.sectionRow}>
      <Ionicons name={icon} size={15} color={C.cyan} />
      <Text style={styles.sectionTxt}>{children}</Text>
    </View>
  );
}

const DANGER = {
  high: { t: "RẤT NGUY HIỂM", c: C.red },
  mid: { t: "Cẩn thận", c: C.warn },
  low: { t: "Dễ thở", c: C.green },
};

export default function QuickCounterScreen() {
  const [lane, setLane] = useState(LANES[0]);
  const [query, setQuery] = useState("");
  const [suggests, setSuggests] = useState([]);
  const [enemy, setEnemy] = useState(null);
  const [picks, setPicks] = useState(null);
  const [loading, setLoading] = useState(false);

  const onQuery = (t) => {
    setQuery(t);
    setSuggests(suggestChampions(t));
  };
  const pick = (c) => {
    setEnemy(c);
    setQuery("");
    setSuggests([]);
    setPicks(null);
  };

  const tips = enemy ? matchupTips(enemy) : null;
  const danger = tips ? DANGER[tips.danger] : null;

  const askAI = async () => {
    if (!enemy) return;
    setLoading(true);
    setPicks(null);
    try {
      const res = await suggestPicks({ lane, enemies: [enemy.name], allies: [] });
      setPicks(res.picks || []);
    } catch (e) {
      setPicks([{ name: "", tier: "", reason: "Lỗi: " + String(e.message || e), counters: [] }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.hint}>Chọn đường và tướng địch cùng đường để xem mẹo khắc chế tức thì.</Text>

      <Text style={styles.label}>BẠN ĐI ĐƯỜNG</Text>
      <View style={styles.laneRow}>
        {LANES.map((l) => (
          <TouchableOpacity
            key={l}
            style={[styles.laneChip, lane === l && styles.laneChipActive]}
            onPress={() => setLane(l)}
          >
            <Text style={[styles.laneText, lane === l && styles.laneTextActive]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 18 }]}>TƯỚNG ĐỊCH CÙNG ĐƯỜNG</Text>
      <TextInput
        value={query}
        onChangeText={onQuery}
        placeholder={enemy ? `Đang xem: ${enemy.vi} — gõ để đổi…` : "Gõ tên tướng địch…"}
        placeholderTextColor={C.textFaint}
        style={styles.input}
      />
      {suggests.length > 0 && (
        <View style={styles.suggestBox}>
          {suggests.map((c) => (
            <TouchableOpacity key={c.id} style={styles.suggestItem} onPress={() => pick(c)}>
              <Image source={{ uri: championIcon(c) }} style={styles.suggestAvatar} />
              <Text style={styles.suggestText}>{c.vi}</Text>
              <Text style={styles.suggestRole}>{c.role}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {enemy && tips && (
        <>
          <View style={styles.enemyHead}>
            <Image source={{ uri: championIcon(enemy) }} style={styles.enemyAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.enemyName}>{enemy.vi}</Text>
              <Text style={styles.enemyMeta}>{BUILD_LABELS[enemy.build] || enemy.role} · {enemy.damageType}</Text>
            </View>
            {danger && (
              <Text style={[styles.dangerTag, { color: danger.c, borderColor: danger.c }]}>{danger.t}</Text>
            )}
          </View>

          <SectionTitle icon="cart-outline">MUA SỚM</SectionTitle>
          {tips.shopping.length === 0 ? (
            <Text style={styles.dim}>Không có ưu tiên đặc biệt — build chuẩn theo tướng của bạn.</Text>
          ) : (
            tips.shopping.map((s, i) => (
              <View key={i} style={styles.shopRow}>
                <Text style={styles.shopLabel}>{s.label}</Text>
                <Text style={styles.shopNote}>{s.note}</Text>
              </View>
            ))
          )}

          <SectionTitle icon="bulb-outline">LƯU Ý ĐI ĐƯỜNG</SectionTitle>
          {tips.tips.length === 0 ? (
            <Text style={styles.dim}>Matchup cân bằng — chơi chắc, farm tốt.</Text>
          ) : (
            tips.tips.map((t, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>{t}</Text>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.aiBtn} onPress={askAI} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <ActivityIndicator color={C.text} />
                <Text style={styles.aiBtnText}>Đang hỏi AI…</Text>
              </View>
            ) : (
              <View style={styles.aiBtnRow}>
                <Ionicons name="sparkles" size={16} color={C.text} />
                <Text style={styles.aiBtnText}>Gợi ý tướng nên pick để khắc {enemy.vi}</Text>
              </View>
            )}
          </TouchableOpacity>

          {picks && picks.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <SectionTitle icon="locate">NÊN PICK</SectionTitle>
              {picks.map((p, i) => {
                const champ = findChampion(p.name);
                return (
                  <View key={i} style={styles.pickRow}>
                    {champ && <Image source={{ uri: championIcon(champ) }} style={styles.pickAvatar} />}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickName}>
                        {champ ? champ.vi : p.name} {p.tier ? <Text style={styles.pickTier}>[{p.tier}]</Text> : null}
                      </Text>
                      {p.reason ? <Text style={styles.pickReason}>{p.reason}</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  hint: { color: C.textDim, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  label: { color: C.textDim, fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  laneRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  laneChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  laneChipActive: { backgroundColor: C.cyanDim, borderColor: C.cyan },
  laneText: { color: C.textDim, fontWeight: "600", fontSize: 13 },
  laneTextActive: { color: C.text },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 16 },
  suggestBox: { marginTop: 6, backgroundColor: C.cardAlt, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  suggestItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  suggestAvatar: { width: 28, height: 28, borderRadius: 6 },
  suggestText: { color: C.text, fontSize: 15, fontWeight: "600", flex: 1 },
  suggestRole: { color: C.textFaint, fontSize: 12 },
  enemyHead: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, padding: 12, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  enemyAvatar: { width: 52, height: 52, borderRadius: 11, borderWidth: 1, borderColor: C.red },
  enemyName: { color: C.text, fontSize: 18, fontWeight: "800" },
  enemyMeta: { color: C.textDim, fontSize: 12, marginTop: 3 },
  dangerTag: { fontSize: 11, fontWeight: "800", borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  section: { color: C.text, fontSize: 13, fontWeight: "900", letterSpacing: 0.5, marginTop: 20, marginBottom: 8 },
  sectionRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 20, marginBottom: 8 },
  sectionTxt: { color: C.text, fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
  aiBtnRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dim: { color: C.textFaint, fontSize: 13 },
  shopRow: { backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 11, marginBottom: 7 },
  shopLabel: { color: C.amber, fontSize: 13, fontWeight: "800" },
  shopNote: { color: C.textDim, fontSize: 13, marginTop: 3 },
  tipRow: { flexDirection: "row", gap: 8, marginBottom: 7 },
  tipDot: { color: C.cyan, fontSize: 15, fontWeight: "900" },
  tipText: { color: C.text, fontSize: 13, lineHeight: 19, flex: 1 },
  aiBtn: { marginTop: 18, borderRadius: 12, paddingVertical: 13, alignItems: "center", borderWidth: 1.5, borderColor: C.cyan, backgroundColor: C.cyanDim },
  aiBtnText: { color: C.text, fontWeight: "800", fontSize: 13 },
  pickRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 10, marginBottom: 7 },
  pickAvatar: { width: 40, height: 40, borderRadius: 9 },
  pickName: { color: C.text, fontSize: 15, fontWeight: "700" },
  pickTier: { color: C.amber, fontWeight: "900" },
  pickReason: { color: C.textDim, fontSize: 12, marginTop: 2 },
});
