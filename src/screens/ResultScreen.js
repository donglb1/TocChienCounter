// src/screens/ResultScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { C } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { findItem } from "../data/items";
import { findKeystone, findSpell, findRune } from "../data/runes";
import { itemIcon } from "../lib/images";
import { useLiveData } from "../lib/liveData";
import ItemDetailModal from "../components/ItemDetailModal";
import RuneDetailModal from "../components/RuneDetailModal";

// Màu gem theo loại item (fallback khi không có icon CDN)
const GEM = {
  defense: "#2f6f4f",
  offense: "#7a3b3b",
  boots: "#3b5b7a",
  support: "#6b5a2f",
  core: "#7a3b3b",
  situational: "#4a4a6a",
};

function abbrev(name) {
  const parts = (name || "?").split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name || "?").slice(0, 2).toUpperCase();
}

function ItemGem({ name, onPress }) {
  useLiveData(); // re-render khi catalog item Wild Rift về (icon/tên thật)
  const item = findItem(name);
  const known = !!item;
  const vi = known ? item.vi : name;
  const color = known ? GEM[item.type] || GEM.core : "#555";
  const icon = known ? itemIcon(item) : null;
  return (
    <TouchableOpacity
      style={styles.gemWrap}
      activeOpacity={known ? 0.7 : 1}
      onPress={() => known && onPress?.(item)}
    >
      {icon ? (
        <Image source={{ uri: icon }} style={styles.gemImg} />
      ) : (
        <View style={[styles.gem, { backgroundColor: color, borderColor: known ? C.amberDim : C.warn }]}>
          <Text style={styles.gemText}>{abbrev(vi)}</Text>
        </View>
      )}
      <Text style={styles.gemName} numberOfLines={2}>{vi}</Text>
      {!known && (
        <View style={styles.outBadgeRow}>
          <Ionicons name="warning" size={10} color={C.warn} />
          <Text style={styles.outBadge}>NGOÀI DS</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function ResultScreen({
  session,
  onRestart,
  onEditEnemies,
  restartLabel = "Phân tích trận mới",
  editLabel = "Sửa team địch",
}) {
  const [detailItem, setDetailItem] = React.useState(null);
  const [detailRune, setDetailRune] = React.useState(null);
  const b = session.build || {};
  const profile = b.teamProfile || {};
  const ad = clamp(profile.adPercent);
  const ap = clamp(profile.apPercent);

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Text style={styles.title}>
        Build cho <Text style={{ color: C.amber }}>{session.champ}</Text> · {session.lane}
      </Text>

      {/* Profile team địch */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>PROFILE TEAM ĐỊCH</Text>
        <View style={styles.barWrap}>
          <View style={[styles.barSeg, { flex: ad || 1, backgroundColor: C.ad }]} />
          <View style={[styles.barSeg, { flex: ap || 1, backgroundColor: C.ap }]} />
        </View>
        <View style={styles.barLegend}>
          <Text style={[styles.legend, { color: C.ad }]}>AD {ad}%</Text>
          <Text style={[styles.legend, { color: C.ap }]}>AP {ap}%</Text>
        </View>

        <View style={styles.metaRow}>
          <Meta label="Khống chế" value={ccText(profile.ccLevel)} />
          <Meta label="Hồi máu" value={profile.hasHealing ? "Có" : "Không"} warn={profile.hasHealing} />
        </View>

        {Array.isArray(profile.mainThreats) && profile.mainThreats.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.threatLabel}>Mối đe dọa chính</Text>
            <View style={styles.threatRow}>
              {profile.mainThreats.filter(Boolean).map((t, i) => (
                <View key={i} style={styles.threatChip}>
                  <Text style={styles.threatText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {profile.summary ? <Text style={styles.summary}>{profile.summary}</Text> : null}
      </View>

      {/* Điểm mạnh/yếu tướng người chơi */}
      {(b.yourStrengths || b.yourWeaknesses) && (
        <View style={styles.swCard}>
          <Text style={styles.cardTitle}>TƯỚNG CỦA BẠN</Text>
          {b.yourStrengths ? (
            <View style={styles.swRow}>
              <Text style={styles.swPlus}>＋</Text>
              <Text style={styles.swText}>{b.yourStrengths}</Text>
            </View>
          ) : null}
          {b.yourWeaknesses ? (
            <View style={styles.swRow}>
              <Text style={styles.swMinus}>－</Text>
              <Text style={styles.swText}>{b.yourWeaknesses}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Ngọc & Phép bổ trợ — chạm 1 dòng để xem tác dụng */}
      {(b.keystone?.name || (Array.isArray(b.spells) && b.spells.length > 0)) && (
        <View style={styles.swCard}>
          <Text style={styles.cardTitle}>NGỌC & PHÉP BỔ TRỢ</Text>
          {b.keystone?.name ? (
            <TouchableOpacity
              style={styles.rsRow}
              activeOpacity={0.7}
              onPress={() => setDetailRune({ ...(findKeystone(b.keystone.name) || { name: b.keystone.name }), kind: "keystone" })}
            >
              <Text style={styles.rsBadge}>NGỌC</Text>
              <Text style={styles.rsName}>{keystoneName(b.keystone.name)}</Text>
              {b.keystone.reason ? <Text style={styles.rsReason}>· {b.keystone.reason}</Text> : null}
              <Ionicons name="information-circle-outline" size={15} color={C.textFaint} />
            </TouchableOpacity>
          ) : null}
          {(b.minorRunes || []).filter((r) => r && r.name).map((r, i) => (
            <TouchableOpacity
              key={`m${i}`}
              style={styles.rsRow}
              activeOpacity={0.7}
              onPress={() => setDetailRune({ ...(findRune(r.name) || { name: r.name }), kind: "minor" })}
            >
              <Text style={[styles.rsBadge, styles.rsBadgeMinor]}>NGỌC PHỤ</Text>
              <Text style={styles.rsName}>{(findRune(r.name) || {}).vi || r.name}</Text>
              {r.reason ? <Text style={styles.rsReason}>· {r.reason}</Text> : null}
              <Ionicons name="information-circle-outline" size={15} color={C.textFaint} />
            </TouchableOpacity>
          ))}
          {(b.spells || []).filter((s) => s && s.name).map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.rsRow}
              activeOpacity={0.7}
              onPress={() => setDetailRune({ ...(findSpell(s.name) || { name: s.name }), kind: "spell" })}
            >
              <Text style={[styles.rsBadge, styles.rsBadgeSpell]}>PHÉP</Text>
              <Text style={styles.rsName}>{spellName(s.name)}</Text>
              {s.reason ? <Text style={styles.rsReason}>· {s.reason}</Text> : null}
              <Ionicons name="information-circle-outline" size={15} color={C.textFaint} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Build từng bước */}
      <Text style={styles.section}>BUILD KHẮC CHẾ</Text>
      {(b.build || []).map((step, i) => (
        <View key={i} style={styles.step}>
          <View style={styles.stepHead}>
            <View style={styles.orderBadge}>
              <Text style={styles.orderText}>{step.order || i + 1}</Text>
            </View>
            <ItemGem name={step.item} onPress={setDetailItem} />
            {step.type ? <Text style={styles.typeTag}>{typeText(step.type)}</Text> : null}
          </View>
          {step.reason ? <Text style={styles.reason}>{step.reason}</Text> : null}
          {Array.isArray(step.alternatives) && step.alternatives.length > 0 && (
            <View style={styles.altWrap}>
              {step.alternatives.filter((a) => a && a.item).map((a, j) => (
                <Text key={j} style={styles.alt}>
                  ↳ <Text style={styles.altItem}>{altName(a.item)}</Text>
                  {a.condition ? <Text style={styles.altCond}> — {a.condition}</Text> : null}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}

      {b.playstyle ? (
        <View style={styles.playstyle}>
          <Text style={styles.playstyleLabel}>LỐI CHƠI</Text>
          <Text style={styles.playstyleText}>{b.playstyle}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondary} onPress={onEditEnemies}>
          <Text style={styles.secondaryText}>{editLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primary} onPress={onRestart}>
          <Text style={styles.primaryText}>{restartLabel}</Text>
        </TouchableOpacity>
      </View>

      <ItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      <RuneDetailModal data={detailRune} onClose={() => setDetailRune(null)} />
    </ScrollView>
  );
}

function altName(name) {
  const it = findItem(name);
  return it ? it.vi : name;
}
function keystoneName(name) {
  const k = findKeystone(name);
  return k ? k.vi : name;
}
function spellName(name) {
  const s = findSpell(name);
  return s ? s.vi : name;
}
function Meta({ label, value, warn }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, warn && { color: C.warn }]}>{value}</Text>
    </View>
  );
}
function clamp(n) {
  const v = Math.round(Number(n) || 0);
  return Math.max(0, Math.min(100, v));
}
function ccText(l) {
  return { none: "Không", low: "Thấp", medium: "Vừa", high: "Cao" }[l] || "—";
}
function typeText(t) {
  return { core: "CỐT LÕI", boots: "GIÀY", situational: "TÙY TÌNH HUỐNG" }[t] || t;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  title: { color: C.text, fontSize: 18, fontWeight: "800", marginBottom: 14 },
  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14 },
  cardTitle: { color: C.textDim, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 12 },
  barWrap: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", backgroundColor: C.bgAlt },
  barSeg: { height: "100%" },
  barLegend: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  legend: { fontSize: 12, fontWeight: "700" },
  metaRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  meta: { flex: 1, backgroundColor: C.bgAlt, borderRadius: 10, padding: 10 },
  metaLabel: { color: C.textFaint, fontSize: 11, marginBottom: 3 },
  metaValue: { color: C.text, fontSize: 15, fontWeight: "700" },
  threatLabel: { color: C.textFaint, fontSize: 11, marginBottom: 6 },
  threatRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  threatChip: { backgroundColor: "#3a1f1f", borderColor: C.red, borderWidth: 1, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 },
  threatText: { color: "#fca5a5", fontSize: 12, fontWeight: "600" },
  summary: { color: C.textDim, fontSize: 13, lineHeight: 19, marginTop: 12 },
  swCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, marginTop: 12 },
  swRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 4 },
  swPlus: { color: C.green, fontSize: 15, fontWeight: "900", width: 16 },
  swMinus: { color: C.warn, fontSize: 15, fontWeight: "900", width: 16 },
  swText: { color: C.text, fontSize: 13, lineHeight: 19, flex: 1 },
  rsRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 7, marginTop: 7 },
  rsBadge: { color: C.amber, borderColor: C.amberDim, borderWidth: 1, borderRadius: 5, fontSize: 10, fontWeight: "800", paddingHorizontal: 6, paddingVertical: 2 },
  rsBadgeSpell: { color: C.cyan, borderColor: C.cyanDim },
  rsBadgeMinor: { color: C.violet, borderColor: C.violetDim },
  rsName: { color: C.text, fontSize: 14, fontWeight: "700" },
  rsReason: { color: C.textDim, fontSize: 12, flexShrink: 1 },
  section: { color: C.amber, fontSize: 13, fontWeight: "800", letterSpacing: 1, marginTop: 22, marginBottom: 12 },
  step: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 10 },
  stepHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  orderBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.cyanDim, alignItems: "center", justifyContent: "center" },
  orderText: { color: C.text, fontWeight: "800", fontSize: 12 },
  gemWrap: { flexDirection: "row", alignItems: "center", gap: 9, flex: 1 },
  gem: { width: 38, height: 38, borderRadius: 9, borderWidth: 1.5, alignItems: "center", justifyContent: "center", transform: [{ rotate: "0deg" }] },
  gemImg: { width: 38, height: 38, borderRadius: 9, borderWidth: 1.5, borderColor: C.amberDim, backgroundColor: C.cardAlt },
  gemText: { color: "#fff", fontWeight: "900", fontSize: 13 },
  gemName: { color: C.text, fontWeight: "700", fontSize: 14, flexShrink: 1 },
  outBadgeRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  outBadge: { color: C.warn, fontSize: 10, fontWeight: "800" },
  typeTag: { color: C.textFaint, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  reason: { color: C.textDim, fontSize: 13, lineHeight: 19, marginTop: 9 },
  altWrap: { marginTop: 8, gap: 3 },
  alt: { color: C.textFaint, fontSize: 12.5, lineHeight: 18 },
  altItem: { color: C.cyan, fontWeight: "700" },
  altCond: { color: C.textFaint },
  playstyle: { marginTop: 16, backgroundColor: C.cardAlt, borderRadius: 12, borderWidth: 1, borderColor: C.cyanDim, padding: 14 },
  playstyleLabel: { color: C.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  playstyleText: { color: C.text, fontSize: 13.5, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 10, marginTop: 24 },
  secondary: { flex: 1, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  secondaryText: { color: C.textDim, fontWeight: "700" },
  primary: { flex: 1, backgroundColor: C.amber, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  primaryText: { color: "#0b1220", fontWeight: "900" },
});
