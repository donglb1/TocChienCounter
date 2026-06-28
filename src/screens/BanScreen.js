// src/screens/BanScreen.js
// Màn "Cấm": đề xuất tướng NÊN BAN theo META hiện tại — trộn tier list (sức mạnh thực tế
// patch này) + threat (độ nguy hiểm trong DB). Offline (tier list lỗi) → xếp theo threat DB.
import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, glow, tierColor } from "../theme";
import { CHAMPIONS } from "../data/champions";
import { TierBadge } from "../components/neon";
import { championIcon, ddragonIdByName } from "../lib/images";
import { useLiveData } from "../lib/liveData";
import { fetchTierList } from "../lib/api";
import { metaBanList } from "../lib/draftAnalysis";

const ROLE_VI = { Tank: "Đỡ đòn", Fighter: "Đấu sĩ", Mage: "Pháp sư", Assassin: "Sát thủ", Marksman: "Xạ thủ", Support: "Hỗ trợ" };
// Lane site (Baron/Jungle/Mid/Dragon/Support) → nhãn ngắn (đồng bộ với Thư viện tướng)
const LANE_FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "Baron", label: "Top" },
  { key: "Jungle", label: "Rừng" },
  { key: "Mid", label: "Mid" },
  { key: "Dragon", label: "AD" },
  { key: "Support", label: "Hỗ trợ" },
];
// Màu nhãn ưu tiên cấm theo mức độ
const PRIORITY_COLOR = { urgent: "#ff4d6d", high: C.amber, mid: C.cyan, low: C.textFaint };

// Avatar có fallback chữ khi icon lỗi (tướng mới chưa có icon DDragon)
function ChampAvatar({ champ, style }) {
  const [err, setErr] = useState(false);
  const uri = championIcon(champ);
  if (err || !uri) {
    return (
      <View style={[style, styles.avatarFallback]}>
        <Text style={styles.avatarFallbackText}>{(champ.vi || champ.name || "?").slice(0, 2)}</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={style} onError={() => setErr(true)} />;
}

export default function BanScreen() {
  useLiveData(); // roster/icon tướng mới phụ thuộc DDragon live
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tierRaw, setTierRaw] = useState([]); // entry tier list (slug,name,tier,lanes)
  const [laneFilter, setLaneFilter] = useState("all");

  const load = () => {
    setLoading(true);
    setError("");
    fetchTierList()
      .then((data) => {
        setTierRaw(data.list || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e.message || e));
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const hasTiers = tierRaw.length > 0;

  // Nguồn xếp hạng: tier list (kèm tướng mới chưa có icon) → metaBanList trộn điểm.
  // Tier list rỗng/offline → fallback DB tĩnh xếp theo threat (không có lane → ẩn filter).
  const bans = useMemo(() => {
    if (hasTiers) {
      // Bổ sung id DDragon cho tướng mới (chỉ có trong tier list) để lấy icon.
      const entries = tierRaw.map((e) => ({ ...e, id: ddragonIdByName(e.name) || e.slug }));
      return metaBanList(entries, { laneFilter, limit: 20 });
    }
    const fallback = CHAMPIONS.map((c) => ({ slug: null, name: c.name, tier: null, lanes: [] }));
    return metaBanList(fallback, { laneFilter: "all", limit: 20 });
  }, [tierRaw, laneFilter, hasTiers]);

  return (
    <View style={styles.wrap}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <View style={styles.introCard}>
          <View style={styles.introHeadRow}>
            <Ionicons name="ban" size={16} color="#ff4d6d" />
            <Text style={styles.introTitle}>NÊN CẤM THEO META</Text>
          </View>
          <Text style={styles.introText}>
            Xếp hạng tướng đáng cấm nhất patch này — trộn{" "}
            <Text style={{ color: C.amber }}>tier list</Text> hiện tại với{" "}
            <Text style={{ color: "#ff7a8a" }}>độ nguy hiểm</Text> của tướng.
            {hasTiers ? "" : " (Đang offline — xếp theo độ nguy hiểm.)"}
          </Text>
        </View>

        {hasTiers && (
          <View style={styles.laneRow}>
            {LANE_FILTERS.map((l) => {
              const on = laneFilter === l.key;
              return (
                <TouchableOpacity
                  key={l.key}
                  style={[styles.laneChip, on && styles.laneChipOn]}
                  onPress={() => setLaneFilter(l.key)}
                >
                  <Text style={[styles.laneChipText, on && styles.laneChipTextOn]}>{l.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.amber} />
          <Text style={styles.loadingText}>Đang tải tier list…</Text>
        </View>
      ) : error && !hasTiers ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retry} onPress={load}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bans}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}
          renderItem={({ item: b, index }) => {
            const pc = PRIORITY_COLOR[b.priority.level] || C.textFaint;
            const tc = b.tier ? tierColor(b.tier) : C.textFaint;
            return (
              <View style={[styles.card, { borderColor: tc + "44" }, glow(tc, 14, 0.22)]}>
                <View style={[styles.cardBar, { backgroundColor: tc }, glow(tc, 8, 0.8)]} />
                <View style={styles.rankWrap}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <ChampAvatar champ={b.champ} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{b.vi}</Text>
                    {b.tier ? <TierBadge tier={b.tier} /> : null}
                  </View>
                  <Text style={styles.sub}>
                    {b._new ? "Tướng mới" : (ROLE_VI[b.role] || b.role)}
                    {!b._new && b.damageType ? ` · ${b.damageType}` : ""}
                  </Text>
                  <Text style={styles.reason}>{b.reason}</Text>
                </View>
                <View style={[styles.priBadge, { borderColor: pc }]}>
                  <Text style={[styles.priText, { color: pc }]}>{b.priority.label}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>Không có tướng phù hợp ở đường này.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  introCard: {
    backgroundColor: C.cardAlt, borderRadius: 12, borderWidth: 1,
    borderColor: "rgba(255,77,109,0.3)", padding: 13,
  },
  introHeadRow: { flexDirection: "row", alignItems: "center", gap: 7, marginBottom: 6 },
  introTitle: { color: "#ff7a8a", fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  introText: { color: C.textDim, fontSize: 13, lineHeight: 19 },
  laneRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 12 },
  laneChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  laneChipOn: { borderColor: C.violet, backgroundColor: C.violetDim, ...glow(C.violet, 14, 0.4) },
  laneChipText: { color: C.textDim, fontSize: 13, fontWeight: "700" },
  laneChipTextOn: { color: C.cyan },
  center: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: { color: C.textDim, fontSize: 13 },
  errorText: { color: C.red, fontSize: 13, textAlign: "center", paddingHorizontal: 24 },
  retry: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  retryText: { color: C.text, fontWeight: "700" },
  card: {
    flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: C.card,
    borderRadius: 13, borderWidth: 1, borderColor: C.border,
    paddingVertical: 11, paddingRight: 11, paddingLeft: 15, marginBottom: 10, overflow: "hidden",
  },
  cardBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  rankWrap: { width: 20, alignItems: "center" },
  rankText: { color: C.textFaint, fontWeight: "900", fontSize: 14 },
  avatar: { width: 46, height: 46, borderRadius: 10, borderWidth: 1, borderColor: C.amberDim },
  avatarFallback: { backgroundColor: C.cardAlt, alignItems: "center", justifyContent: "center" },
  avatarFallbackText: { color: C.textDim, fontWeight: "800", fontSize: 14 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: C.text, fontWeight: "800", fontSize: 16, flexShrink: 1 },
  sub: { color: C.textFaint, fontSize: 12, marginTop: 2 },
  reason: { color: C.textDim, fontSize: 12.5, lineHeight: 17, marginTop: 4 },
  priBadge: { borderWidth: 1, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3, alignSelf: "flex-start" },
  priText: { fontSize: 10.5, fontWeight: "800" },
  empty: { color: C.textDim, textAlign: "center", marginTop: 30 },
});
