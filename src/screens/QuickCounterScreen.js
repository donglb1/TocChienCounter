// src/screens/QuickCounterScreen.js
// Tra khắc chế 1v1: chọn đường + 1 tướng địch → mẹo + đồ mua sớm TỨC THÌ (offline).
// Tùy chọn: nút AI gợi ý tướng nên pick để khắc đối thủ đó.
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { C, GRAD, LANES, glow } from "../theme";
import { findChampion, BUILD_LABELS } from "../data/champions";
import { championIcon, itemIcon } from "../lib/images";
import { matchupTips, counterItems } from "../lib/matchup";
import { suggestPicks, analyzeBuild } from "../lib/api";
import { LanePicker, ChampSearch } from "../components/inputs";
import ItemDetailModal from "../components/ItemDetailModal";
import ResultScreen from "./ResultScreen";

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
  const [enemy, setEnemy] = useState(null);
  const [picks, setPicks] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [busyName, setBusyName] = useState(null); // tướng đang phân tích build
  const [buildSession, setBuildSession] = useState(null); // build khắc chế của tướng đã chọn

  const pick = (c) => {
    setEnemy(c);
    setPicks(null);
    setBuildSession(null);
  };

  // Chạm 1 tướng khắc chế → phân tích build khắc chế đối thủ rồi mở màn kết quả (như luồng Đội hình).
  const choosePick = async (p) => {
    const champ = findChampion(p.name);
    if (!champ || !enemy) return;
    setBusyName(p.name);
    try {
      const build = await analyzeBuild({ champ: champ.name, lane, enemies: [enemy.name] });
      setBuildSession({
        champ: champ.vi,
        lane,
        enemies: [{ name: enemy.name, displayName: enemy.vi, confidence: "high" }],
        build,
      });
    } catch (e) {
      setPicks([{ name: "", tier: "", reason: "Lỗi: " + String(e.message || e), counters: [] }]);
    } finally {
      setBusyName(null);
    }
  };

  const tips = enemy ? matchupTips(enemy) : null;
  const danger = tips ? DANGER[tips.danger] : null;
  const counters = enemy ? counterItems(enemy) : [];

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

  // Đã chọn 1 tướng khắc chế → hiện build đầy đủ (tái dùng màn kết quả). Quay lại = bỏ build.
  if (buildSession) {
    return (
      <ResultScreen
        session={buildSession}
        onRestart={() => setBuildSession(null)}
        onEditEnemies={() => setBuildSession(null)}
        restartLabel="Chọn tướng khác"
        editLabel="← Quay lại"
        compactRunes
      />
    );
  }

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.hint}>Chọn đường và tướng địch cùng đường để xem mẹo khắc chế tức thì.</Text>

      <Text style={styles.label}>BẠN ĐI ĐƯỜNG</Text>
      <LanePicker value={lane} onChange={setLane} />

      <Text style={[styles.label, { marginTop: 18 }]}>TƯỚNG ĐỊCH CÙNG ĐƯỜNG</Text>
      <ChampSearch
        onPick={pick}
        placeholder={enemy ? `Đang xem: ${enemy.vi} — gõ để đổi…` : "Gõ tên tướng địch…"}
      />

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
                <LinearGradient colors={GRAD.accentBar} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.shopBar} />
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

          {counters.length > 0 && (
            <>
              <SectionTitle icon="shield-checkmark-outline">BỘ TRANG BỊ KHẮC CHẾ</SectionTitle>
              {counters.map(({ item, reason }, i) => {
                const icon = itemIcon(item);
                return (
                  <TouchableOpacity
                    key={item.id || i}
                    style={styles.ctrRow}
                    activeOpacity={0.7}
                    onPress={() => setDetailItem(item)}
                  >
                    {icon ? (
                      <Image source={{ uri: icon }} style={styles.ctrIcon} />
                    ) : (
                      <View style={[styles.ctrIcon, styles.ctrIconFallback]}>
                        <Text style={styles.ctrIconText}>{(item.vi || item.name).slice(0, 2)}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.ctrName}>{item.vi}</Text>
                      <Text style={styles.ctrReason}>{reason}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
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
              <Text style={styles.pickHint}>Chạm 1 tướng để xem build khắc chế {enemy.vi}.</Text>
              {picks.map((p, i) => {
                const champ = findChampion(p.name);
                const busy = busyName === p.name;
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.pickRow}
                    activeOpacity={0.85}
                    onPress={() => champ && choosePick(p)}
                    disabled={!champ || !!busyName}
                  >
                    {champ && <Image source={{ uri: championIcon(champ) }} style={styles.pickAvatar} />}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickName}>
                        {champ ? champ.vi : p.name} {p.tier ? <Text style={styles.pickTier}>[{p.tier}]</Text> : null}
                      </Text>
                      {p.reason ? <Text style={styles.pickReason}>{p.reason}</Text> : null}
                    </View>
                    {busy ? <ActivityIndicator color={C.amber} /> : champ ? <Text style={styles.pickChevron}>›</Text> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      )}

      <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  hint: { color: C.textDim, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  label: { color: C.textDim, fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  enemyHead: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, padding: 14, backgroundColor: "#160d14", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,93,115,0.4)", ...glow(C.red, 20, 0.35) },
  enemyAvatar: { width: 52, height: 52, borderRadius: 11, borderWidth: 1, borderColor: C.red },
  enemyName: { color: C.text, fontSize: 18, fontWeight: "800" },
  enemyMeta: { color: C.textDim, fontSize: 12, marginTop: 3 },
  dangerTag: { fontSize: 11, fontWeight: "800", borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  sectionRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 20, marginBottom: 8 },
  sectionTxt: { color: C.text, fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
  aiBtnRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dim: { color: C.textFaint, fontSize: 13 },
  shopRow: { backgroundColor: C.card, borderRadius: 11, borderWidth: 1, borderColor: C.border, paddingVertical: 12, paddingRight: 14, paddingLeft: 16, marginBottom: 8, overflow: "hidden" },
  shopBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  shopLabel: { color: C.warn, fontSize: 14, fontWeight: "800" },
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
  pickHint: { color: C.textFaint, fontSize: 12, marginBottom: 8 },
  pickChevron: { color: C.textFaint, fontSize: 24, fontWeight: "300" },
  ctrRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 8, marginBottom: 7 },
  ctrIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: C.cardAlt },
  ctrIconFallback: { alignItems: "center", justifyContent: "center" },
  ctrIconText: { color: C.textDim, fontWeight: "800", fontSize: 12 },
  ctrName: { color: C.text, fontSize: 14, fontWeight: "700" },
  ctrReason: { color: C.textDim, fontSize: 12, marginTop: 2 },
});
