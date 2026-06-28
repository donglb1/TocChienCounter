// src/screens/DraftScreen.js
// MÔ PHỎNG DRAFT (cấm/chọn theo lượt) — OFFLINE. Hai đội Mình vs Địch, đi theo DRAFT_STEPS.
// Mỗi lượt: gợi ý tướng (cấm/chọn) bấm để điền, hoặc tự tra bằng ô tìm kiếm. Có phân tích đội mình realtime.
import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, glow } from "../theme";
import { CHAMPIONS, findChampion, findChampionBySlug } from "../data/champions";
import { championIcon } from "../lib/images";
import { TierBadge } from "../components/neon";
import { ChampSearch } from "../components/inputs";
import GradientButton from "../components/GradientButton";
import { useLiveData } from "../lib/liveData";
import { fetchTierList } from "../lib/api";
import { analyzeAllies } from "../lib/draftAnalysis";
import { DRAFT_STEPS, suggestBans, suggestPicks, tierOf } from "../lib/draftSim";

const TEAM_META = {
  ally: { label: "MÌNH", color: C.green, ban: "BẠN CẤM", pick: "BẠN CHỌN" },
  enemy: { label: "ĐỊCH", color: C.red, ban: "ĐỊCH CẤM", pick: "ĐỊCH CHỌN" },
};

export default function DraftScreen() {
  useLiveData();
  const [tierMap, setTierMap] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [step, setStep] = useState(0);
  const [bansAlly, setBansAlly] = useState([]);
  const [bansEnemy, setBansEnemy] = useState([]);
  const [picksAlly, setPicksAlly] = useState([]);
  const [picksEnemy, setPicksEnemy] = useState([]);

  const loadTiers = async () => {
    try {
      const data = await fetchTierList();
      const tm = {};
      for (const e of data.list || []) {
        const champ = findChampionBySlug(e.slug) || findChampion(e.name);
        if (champ) tm[champ.id] = e.tier;
      }
      setTierMap(tm);
    } catch (_) {}
  };
  useEffect(() => { loadTiers(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadTiers(); setRefreshing(false); };

  const done = step >= DRAFT_STEPS.length;
  const cur = done ? null : DRAFT_STEPS[step];
  const used = useMemo(
    () => new Set([...bansAlly, ...bansEnemy, ...picksAlly, ...picksEnemy].map((c) => c.id)),
    [bansAlly, bansEnemy, picksAlly, picksEnemy]
  );

  // Bộ điền theo lượt hiện tại
  const bucketSetter = (s) => {
    if (s.team === "ally") return s.type === "ban" ? setBansAlly : setPicksAlly;
    return s.type === "ban" ? setBansEnemy : setPicksEnemy;
  };

  const assign = (champ) => {
    if (done || used.has(champ.id)) return;
    bucketSetter(cur)((arr) => [...arr, champ]);
    setStep((s) => s + 1);
  };

  const undo = () => {
    if (step === 0) return;
    const prev = DRAFT_STEPS[step - 1];
    bucketSetter(prev)((arr) => arr.slice(0, -1));
    setStep((s) => s - 1);
  };

  const reset = () => {
    setStep(0); setBansAlly([]); setBansEnemy([]); setPicksAlly([]); setPicksEnemy([]);
  };

  const onSearchPick = (c) => {
    if (used.has(c.id)) {
      Alert.alert("Đã dùng", `${c.vi} đã bị cấm hoặc đã được chọn.`);
      return;
    }
    assign(c);
  };

  // Gợi ý cho lượt hiện tại
  const suggestions = useMemo(() => {
    if (done) return [];
    if (cur.type === "ban") return suggestBans(used, tierMap, 6);
    const me = cur.team === "ally" ? picksAlly : picksEnemy;
    const foe = cur.team === "ally" ? picksEnemy : picksAlly;
    return suggestPicks(me, foe, used, tierMap, 6);
  }, [done, cur, used, tierMap, picksAlly, picksEnemy]);

  const allyProfile = useMemo(() => analyzeAllies(picksAlly.map((c) => ({ name: c.name }))), [picksAlly]);
  const enemyProfile = useMemo(() => analyzeAllies(picksEnemy.map((c) => ({ name: c.name }))), [picksEnemy]);

  return (
    <ScrollView
      style={styles.wrap}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.amber} />}
    >
      {/* Thanh tiến trình + lượt hiện tại */}
      {done ? (
        <View style={[styles.turnCard, { borderColor: C.cyan }, glow(C.cyan, 14, 0.25)]}>
          <Ionicons name="checkmark-circle" size={20} color={C.cyan} />
          <Text style={styles.turnDone}>Hoàn tất draft! Xem phân tích đội mình bên dưới.</Text>
        </View>
      ) : (
        <View style={[styles.turnCard, { borderColor: TEAM_META[cur.team].color }, glow(TEAM_META[cur.team].color, 12, 0.25)]}>
          <View style={[styles.turnDot, { backgroundColor: TEAM_META[cur.team].color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.turnLabel}>
              LƯỢT {step + 1}/{DRAFT_STEPS.length} —{" "}
              <Text style={{ color: TEAM_META[cur.team].color }}>
                {cur.type === "ban" ? TEAM_META[cur.team].ban : TEAM_META[cur.team].pick}
              </Text>
            </Text>
            <Text style={styles.turnHint}>
              {cur.type === "ban" ? "Chọn tướng cần cấm" : "Chọn tướng cho lượt này"}
            </Text>
          </View>
          <TouchableOpacity onPress={undo} disabled={step === 0} hitSlop={8} style={[styles.smallBtn, step === 0 && { opacity: 0.4 }]}>
            <Ionicons name="arrow-undo" size={15} color={C.text} />
            <Text style={styles.smallBtnText}>Lùi</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={reset} hitSlop={8} style={styles.smallBtn}>
            <Ionicons name="refresh" size={15} color={C.text} />
            <Text style={styles.smallBtnText}>Lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bảng 2 đội */}
      <View style={styles.board}>
        <TeamPanel meta={TEAM_META.ally} bans={bansAlly} picks={picksAlly} tierMap={tierMap} active={!done && cur.team === "ally"} />
        <TeamPanel meta={TEAM_META.enemy} bans={bansEnemy} picks={picksEnemy} tierMap={tierMap} active={!done && cur.team === "enemy"} />
      </View>

      {/* Lượt hiện tại: gợi ý + tìm kiếm */}
      {!done && (
        <View style={styles.actionBlock}>
          <Text style={styles.sectionLabel}>
            {cur.type === "ban" ? "GỢI Ý CẤM" : "GỢI Ý CHỌN"} <Text style={styles.dim}>(bấm để điền)</Text>
          </Text>
          <View style={styles.suggestWrap}>
            {suggestions.map(({ champ, reason }) => (
              <TouchableOpacity key={champ.id} style={styles.suggestCard} activeOpacity={0.8} onPress={() => assign(champ)}>
                <Image source={{ uri: championIcon(champ) }} style={styles.suggestAvatar} />
                <View style={{ flex: 1 }}>
                  <View style={styles.suggestNameRow}>
                    <Text style={styles.suggestName} numberOfLines={1}>{champ.vi}</Text>
                    <TierBadge tier={tierOf(champ, tierMap)} />
                  </View>
                  {reason ? <Text style={styles.suggestReason} numberOfLines={1}>{reason}</Text> : null}
                </View>
                <Ionicons name={cur.type === "ban" ? "ban" : "add-circle"} size={18} color={cur.type === "ban" ? C.red : C.green} />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>HOẶC TỰ CHỌN</Text>
          <ChampSearch onPick={onSearchPick} placeholder="Gõ tên tướng để điền lượt này…" />
        </View>
      )}

      {/* Phân tích đội khi đã có pick */}
      {(picksAlly.length > 0 || picksEnemy.length > 0) && (
        <View style={styles.analysisBlock}>
          <CompProfile meta={TEAM_META.ally} profile={allyProfile} showGaps />
          <CompProfile meta={TEAM_META.enemy} profile={enemyProfile} />
        </View>
      )}

      {done && (
        <GradientButton title="DRAFT LẠI TỪ ĐẦU" icon="refresh" onPress={reset} style={{ marginTop: 22 }} />
      )}
    </ScrollView>
  );
}

// Cột 1 đội: hàng cấm (gạch chéo) + 5 ô chọn.
function TeamPanel({ meta, bans, picks, tierMap, active }) {
  return (
    <View style={[styles.panel, active && { borderColor: meta.color, ...glow(meta.color, 10, 0.25) }]}>
      <Text style={[styles.panelTitle, { color: meta.color }]}>{meta.label}</Text>
      <View style={styles.banRow}>
        {bans.length === 0 ? <Text style={styles.banEmpty}>Chưa cấm</Text> : bans.map((c) => (
          <View key={c.id} style={styles.banItem}>
            <Image source={{ uri: championIcon(c) }} style={styles.banAvatar} />
            <View style={styles.banStrike} />
          </View>
        ))}
      </View>
      {[0, 1, 2, 3, 4].map((i) => {
        const c = picks[i];
        return (
          <View key={i} style={styles.pickSlot}>
            {c ? (
              <>
                <Image source={{ uri: championIcon(c) }} style={styles.pickAvatar} />
                <Text style={styles.pickName} numberOfLines={1}>{c.vi}</Text>
                <TierBadge tier={tierOf(c, tierMap)} />
              </>
            ) : (
              <>
                <View style={styles.pickEmptyAvatar}><Text style={styles.pickEmptyText}>{i + 1}</Text></View>
                <Text style={styles.pickEmptyLabel}>trống</Text>
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

// Thanh AD/AP + lỗ hổng đội.
function CompProfile({ meta, profile, showGaps }) {
  if (profile.count === 0) return null;
  return (
    <View style={styles.profileCard}>
      <Text style={[styles.profileTitle, { color: meta.color }]}>{meta.label} ({profile.count})</Text>
      <View style={styles.bar}>
        <View style={[styles.barSeg, { flex: profile.adPercent || 1, backgroundColor: C.ad }]} />
        <View style={[styles.barSeg, { flex: profile.apPercent || 1, backgroundColor: C.ap }]} />
      </View>
      <View style={styles.barLegend}>
        <Text style={[styles.legend, { color: C.ad }]}>AD {profile.adPercent}%</Text>
        <Text style={[styles.legend, { color: C.ap }]}>AP {profile.apPercent}%</Text>
      </View>
      {showGaps && profile.gaps.map((g, i) => (
        <View key={i} style={styles.gapRow}>
          <Ionicons name="alert-circle-outline" size={13} color={C.warn} />
          <Text style={styles.gapText}>{g}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  turnCard: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.card,
    borderRadius: 13, borderWidth: 1, padding: 12, marginBottom: 14,
  },
  turnDot: { width: 10, height: 10, borderRadius: 5 },
  turnLabel: { color: C.text, fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },
  turnHint: { color: C.textFaint, fontSize: 11.5, marginTop: 2 },
  turnDone: { color: C.text, fontSize: 14, fontWeight: "700", flex: 1 },
  smallBtn: { alignItems: "center", gap: 1, paddingHorizontal: 6 },
  smallBtnText: { color: C.textDim, fontSize: 10, fontWeight: "700" },

  board: { flexDirection: "row", gap: 10 },
  panel: { flex: 1, backgroundColor: C.card, borderRadius: 13, borderWidth: 1, borderColor: C.border, padding: 10 },
  panelTitle: { fontSize: 12, fontWeight: "900", letterSpacing: 1, marginBottom: 8, textAlign: "center" },
  banRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, minHeight: 30, marginBottom: 8, justifyContent: "center" },
  banEmpty: { color: C.textFaint, fontSize: 11, fontStyle: "italic", alignSelf: "center" },
  banItem: { width: 26, height: 26 },
  banAvatar: { width: 26, height: 26, borderRadius: 6, opacity: 0.45 },
  banStrike: { position: "absolute", top: 12, left: -1, right: -1, height: 2, backgroundColor: C.red, transform: [{ rotate: "-45deg" }] },
  pickSlot: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  pickAvatar: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, borderColor: C.amberDim },
  pickName: { color: C.text, fontSize: 13, fontWeight: "700", flex: 1 },
  pickEmptyAvatar: { width: 34, height: 34, borderRadius: 8, backgroundColor: C.cardAlt, alignItems: "center", justifyContent: "center" },
  pickEmptyText: { color: C.textFaint, fontWeight: "800", fontSize: 13 },
  pickEmptyLabel: { color: C.textFaint, fontSize: 12, flex: 1 },

  actionBlock: { marginTop: 18 },
  sectionLabel: { color: C.textDim, fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 10 },
  dim: { color: C.textFaint, fontWeight: "600", letterSpacing: 0 },
  suggestWrap: { gap: 8 },
  suggestCard: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.cardAlt,
    borderRadius: 11, borderWidth: 1, borderColor: C.border, padding: 8,
  },
  suggestAvatar: { width: 38, height: 38, borderRadius: 9, borderWidth: 1, borderColor: C.amberDim },
  suggestNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  suggestName: { color: C.text, fontSize: 14, fontWeight: "700", flexShrink: 1 },
  suggestReason: { color: C.textFaint, fontSize: 11.5, marginTop: 2 },

  analysisBlock: { marginTop: 20, gap: 12 },
  profileCard: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 13 },
  profileTitle: { fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 9 },
  bar: { flexDirection: "row", height: 11, borderRadius: 6, overflow: "hidden", backgroundColor: C.bgAlt },
  barSeg: { height: "100%" },
  barLegend: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  legend: { fontSize: 12, fontWeight: "700" },
  gapRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 7 },
  gapText: { color: C.text, fontSize: 12.5, flex: 1 },
});
