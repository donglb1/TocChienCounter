// src/screens/PickScreen.js
// Gợi ý tướng nên chọn để khắc chế team địch. Chạm 1 tướng → xem luôn build khắc chế.
import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { C, GRAD, glow, tierColor } from "../theme";
import { TierBadge } from "../components/neon";
import { findChampion } from "../data/champions";
import { championIcon } from "../lib/images";
import { suggestPicks, analyzeBuild } from "../lib/api";
import { addHistory } from "../lib/storage";

export default function PickScreen({ session, patch, onBack, onShowBuild }) {
  const [loading, setLoading] = useState(true);
  const [picks, setPicks] = useState([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [busyName, setBusyName] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await suggestPicks({
        lane: session.lane,
        enemies: (session.enemies || []).map((e) => e.name),
        allies: (session.allies || []).map((e) => e.name),
      });
      setPicks(res.picks || []);
      setSummary(res.summary || "");
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Chọn 1 tướng gợi ý → phân tích build khắc chế cho tướng đó
  const choosePick = async (pick) => {
    const champ = findChampion(pick.name);
    if (!champ) {
      Alert.alert("Không rõ tướng", `Không tìm thấy "${pick.name}" trong DB.`);
      return;
    }
    setBusyName(pick.name);
    try {
      const build = await analyzeBuild({
        champ: champ.name,
        lane: session.lane,
        enemies: (session.enemies || []).map((e) => e.name),
      });
      patch({ champ: champ.vi, build });
      addHistory({
        champ: champ.vi,
        lane: session.lane,
        enemies: (session.enemies || []).map((e) => e.name),
        build,
      });
      onShowBuild();
    } catch (e) {
      Alert.alert("Lỗi", String(e.message || e));
    } finally {
      setBusyName(null);
    }
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.hint}>
        Tướng nên chọn để khắc chế team địch ở <Text style={{ color: C.cyan }}>{session.lane}</Text>.
        Chạm 1 tướng để xem build khắc chế tương ứng.
      </Text>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator color={C.amber} />
          <Text style={styles.loadingText}>Đang gợi ý tướng…</Text>
        </View>
      )}

      {!loading && error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={load}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!loading && !error && summary ? (
        <View style={styles.summaryBox}>
          <LinearGradient colors={GRAD.accentBar} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.summaryBar} />
          <Text style={styles.summaryLabel}>NHẬN ĐỊNH</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      ) : null}

      {!loading && !error && picks.map((p, idx) => {
        const champ = findChampion(p.name);
        const tier = (p.tier || "B").toUpperCase();
        const tc = tierColor(tier);
        const busy = busyName === p.name;
        return (
          <TouchableOpacity
            key={`${p.name}-${idx}`}
            style={[styles.card, { borderColor: tc + "55" }, glow(tc, 18, 0.28)]}
            activeOpacity={0.85}
            onPress={() => choosePick(p)}
            disabled={!!busyName}
          >
            <View style={[styles.cardBar, { backgroundColor: tc }, glow(tc, 8, 0.8)]} />
            {champ ? (
              <Image source={{ uri: championIcon(champ) }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarFallbackText}>{(p.name || "?").slice(0, 2)}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{champ ? champ.vi : p.name}</Text>
                <TierBadge tier={tier} />
                {champ && <Text style={styles.role}>{champ.role}</Text>}
              </View>
              <Text style={styles.reason}>{p.reason}</Text>
              {Array.isArray(p.counters) && p.counters.length > 0 && (
                <Text style={styles.counters}>Khắc chế: {p.counters.join(", ")}</Text>
              )}
            </View>
            {busy ? (
              <ActivityIndicator color={C.amber} />
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.back} onPress={onBack} disabled={!!busyName}>
        <Text style={styles.backText}>← Quay lại</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  hint: { color: C.textDim, fontSize: 13, lineHeight: 19, marginBottom: 14 },
  center: { alignItems: "center", paddingVertical: 30, gap: 12 },
  loadingText: { color: C.textDim, fontSize: 13 },
  errorText: { color: C.red, fontSize: 13, textAlign: "center" },
  retry: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  retryText: { color: C.text, fontWeight: "700" },
  summaryBox: { backgroundColor: C.cardAlt, borderRadius: 13, borderWidth: 1, borderColor: "rgba(168,85,247,0.3)", paddingVertical: 14, paddingRight: 16, paddingLeft: 18, marginBottom: 16, overflow: "hidden" },
  summaryBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  summaryLabel: { color: "#c79bff", fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 7 },
  summaryText: { color: C.text, fontSize: 14, lineHeight: 20 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.card,
    borderRadius: 13, borderWidth: 1, borderColor: C.border, paddingVertical: 13, paddingRight: 13, paddingLeft: 17, marginBottom: 11, overflow: "hidden",
  },
  cardBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  avatar: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, borderColor: C.amberDim },
  avatarFallback: { backgroundColor: C.cardAlt, alignItems: "center", justifyContent: "center" },
  avatarFallbackText: { color: C.textDim, fontWeight: "800", fontSize: 14 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 },
  name: { color: C.text, fontWeight: "800", fontSize: 16 },
  role: { color: C.textFaint, fontSize: 12 },
  reason: { color: C.textDim, fontSize: 13, lineHeight: 18 },
  counters: { color: C.cyan, fontSize: 12, marginTop: 3 },
  chevron: { color: C.textFaint, fontSize: 26, fontWeight: "300" },
  back: { marginTop: 8, paddingVertical: 14, alignItems: "center" },
  backText: { color: C.textDim, fontWeight: "700" },
});
