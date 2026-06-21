// src/screens/ChampScreen.js
// Thư viện tướng OFFLINE: tra 1 tướng → build chuẩn + ngọc + phép + lối chơi.
// Không cần ảnh, không tốn API — dùng build-identity + template có sẵn.
import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView,
} from "react-native";
import { C, glow } from "../theme";
import { CHAMPIONS, BUILD_LABELS, findChampion, findChampionBySlug } from "../data/champions";
import { getChampionBuild } from "../data/buildTemplates";
import { findItem, findItemBySlug } from "../data/items";
import { findKeystone, findSpell } from "../data/runes";
import { Ionicons } from "@expo/vector-icons";
import { championIcon, itemIcon, ddragonIdByName } from "../lib/images";
import { getFavorites, toggleFavorite } from "../lib/storage";
import { fetchTierList, fetchChampBuild } from "../lib/api";

// slug site cho 1 tướng (ưu tiên slug thật từ tier list; fallback suy từ tên)
function champToSlug(champ) {
  return norm(champ.name).replace(/['’.,]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function prettySlug(s) {
  return String(s).split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const RANGE = { xa: "Tầm xa", can: "Cận chiến" };
const SPIKE = { som: "Mạnh sớm", giua: "Mạnh giữa trận", muon: "Mạnh cuối trận" };
const ROLE_VI = { Tank: "Đỡ đòn", Fighter: "Đấu sĩ", Mage: "Pháp sư", Assassin: "Sát thủ", Marksman: "Xạ thủ", Support: "Hỗ trợ" };
const TIER_ORDER = ["S+", "S", "A+", "A", "B", "C", "D"];
// Lane site (Baron/Jungle/Mid/Dragon/Support) → nhãn ngắn
const LANE_FILTERS = [
  { key: "all", label: "Tất cả" },
  { key: "Baron", label: "Top" },
  { key: "Jungle", label: "Rừng" },
  { key: "Mid", label: "Mid" },
  { key: "Dragon", label: "AD" },
  { key: "Support", label: "Hỗ trợ" },
];
const TIER_COLOR = { "S+": "#ff5d5d", S: C.amber, "A+": "#7ee081", A: C.cyan, B: C.textDim, C: C.textFaint, D: C.textFaint };

// Avatar có fallback chữ khi icon lỗi (tướng mới/WR-riêng không có icon DDragon)
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

function TierBadge({ tier, big }) {
  if (!tier) return null;
  const c = TIER_COLOR[tier] || C.textDim;
  return (
    <View style={[big ? styles.tierBig : styles.tierSmall, { borderColor: c }]}>
      <Text style={[big ? styles.tierBigText : styles.tierSmallText, { color: c }]}>{tier}</Text>
    </View>
  );
}

function norm(s) {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function ChampScreen() {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(null);
  const [favs, setFavs] = useState([]);
  const [tierMap, setTierMap] = useState({}); // champ.id → tier
  const [slugMap, setSlugMap] = useState({}); // champ.id → slug site (cho fetch build)
  const [laneMap, setLaneMap] = useState({}); // champ.id → [lane site]
  const [tierRaw, setTierRaw] = useState([]); // toàn bộ entry tier list (gồm tướng mới)
  const [sortMode, setSortMode] = useState("az"); // az | tier
  const [laneFilter, setLaneFilter] = useState("all"); // all | Baron | Jungle | Mid | Dragon | Support

  useEffect(() => {
    getFavorites().then(setFavs);
    // Tier list (cào qua backend). Lỗi/offline → bỏ qua, thư viện vẫn chạy.
    fetchTierList()
      .then((data) => {
        const tm = {}, sm = {}, lm = {};
        for (const e of data.list || []) {
          const champ = findChampionBySlug(e.slug) || findChampion(e.name);
          if (champ) {
            tm[champ.id] = e.tier;
            sm[champ.id] = e.slug;
            lm[champ.id] = e.lanes || [];
          }
        }
        setTierMap(tm);
        setSlugMap(sm);
        setLaneMap(lm);
        setTierRaw(data.list || []);
      })
      .catch(() => {});
  }, []);

  // Roster = DB tĩnh + TƯỚNG MỚI (có trong tier list nhưng chưa có trong DB) → tự xuất hiện
  const roster = useMemo(() => {
    const extra = [];
    for (const e of tierRaw) {
      if (findChampionBySlug(e.slug) || findChampion(e.name)) continue;
      extra.push({
        id: ddragonIdByName(e.name) || e.slug,
        name: e.name,
        vi: e.name,
        role: "",
        damageType: "",
        slug: e.slug,
        tier: e.tier,
        lanes: e.lanes || [],
        _new: true,
      });
    }
    return extra.length ? [...CHAMPIONS, ...extra] : CHAMPIONS;
  }, [tierRaw]);

  const hasTiers = Object.keys(tierMap).length > 0;
  const onToggleFav = async (id) => setFavs(await toggleFavorite(id));
  // tier của tướng (DB tĩnh tra qua tierMap[id]; tướng mới giữ tier trong chính object)
  const tierOf = (c) => tierMap[c.id] || c.tier;
  const slugOf = (c) => slugMap[c.id] || c.slug || champToSlug(c);
  // Lane CHÍNH = lane đầu tiên tier list liệt kê. Lọc theo lane chính để ẩn kèo phụ/off-meta
  // (vd nguồn liệt kê Samira cả "Baron"/Top dù cô ấy là xạ thủ AD → chỉ hiện ở AD).
  const primaryLaneOf = (c) => {
    const ls = c.lanes || laneMap[c.id] || [];
    const primary = ls[0] || null;
    // Nguồn gộp bot-lane (ADC + hỗ trợ) chung tag "Dragon"(AD). Tướng role Hỗ trợ đứng bot
    // → ép về filter Hỗ trợ cho đúng (vd Milio bị nguồn để ở AD).
    if (primary === "Dragon" && c.role === "Support") return "Support";
    return primary;
  };

  const list = useMemo(() => {
    const q = norm(query);
    let arr = q
      ? roster.filter((c) => norm(c.name).includes(q) || norm(c.vi).includes(q))
      : roster;
    if (laneFilter !== "all") arr = arr.filter((c) => primaryLaneOf(c) === laneFilter);
    const favSet = new Set(favs);
    const tierIdx = (c) => {
      const t = tierOf(c);
      return t ? TIER_ORDER.indexOf(t) : 99;
    };
    return [...arr].sort((a, b) => {
      const fa = favSet.has(a.id), fb = favSet.has(b.id);
      if (fa !== fb) return fa ? -1 : 1;
      if (sortMode === "tier") {
        const d = tierIdx(a) - tierIdx(b);
        if (d !== 0) return d;
      }
      return a.vi.localeCompare(b.vi);
    });
  }, [query, favs, roster, tierMap, laneMap, sortMode, laneFilter]);

  if (picked) {
    return (
      <ChampDetail
        champ={picked}
        tier={tierOf(picked)}
        slug={slugOf(picked)}
        onBack={() => setPicked(null)}
        isFav={favs.includes(picked.id)}
        onToggleFav={() => onToggleFav(picked.id)}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm tướng…"
          placeholderTextColor={C.textFaint}
          style={styles.search}
        />
        {hasTiers && (
          <>
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
            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sắp xếp:</Text>
              <TouchableOpacity onPress={() => setSortMode("az")}>
                <Text style={[styles.sortOpt, sortMode === "az" && styles.sortOptOn]}>A–Z</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSortMode("tier")}>
                <Text style={[styles.sortOpt, sortMode === "tier" && styles.sortOptOn]}>Theo tier</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        numColumns={1}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item: c }) => {
          const fav = favs.includes(c.id);
          return (
            <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={() => setPicked(c)}>
              <ChampAvatar champ={c} style={styles.rowAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{c.vi}</Text>
                {c._new ? (
                  <View style={styles.newRow}>
                    <Ionicons name="sparkles" size={12} color={C.cyan} />
                    <Text style={styles.rowRoleNew}>Tướng mới</Text>
                  </View>
                ) : (
                  <Text style={styles.rowRole}>{ROLE_VI[c.role] || c.role} · {c.damageType}</Text>
                )}
              </View>
              <TierBadge tier={tierOf(c)} />
              <TouchableOpacity onPress={() => onToggleFav(c.id)} hitSlop={10} style={{ padding: 4 }}>
                <Ionicons name={fav ? "star" : "star-outline"} size={20} color={fav ? C.amber : C.textFaint} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy tướng.</Text>}
      />
    </View>
  );
}

function ChampDetail({ champ, tier, slug, onBack, isFav, onToggleFav }) {
  const tpl = getChampionBuild(champ); // build mẫu offline (theo archetype)
  const [live, setLive] = useState(null); // build thật cào theo patch
  const dmgColor = champ.damageType === "AP" ? C.ap : champ.damageType === "AD" ? C.ad : C.textDim;

  useEffect(() => {
    let alive = true;
    if (slug) {
      fetchChampBuild(slug)
        .then((d) => { if (alive && d && d.ok) setLive(d); })
        .catch(() => {});
    }
    return () => { alive = false; };
  }, [slug]);

  const mapSlugs = (arr) => (arr || []).map((s) => {
    const it = findItemBySlug(s);
    return it ? it.name : prettySlug(s);
  });
  const usingLive = !!(live && live.core && live.core.length);
  const boots = usingLive ? mapSlugs(live.boots) : tpl ? [tpl.boots] : [];
  const core = usingLive ? mapSlugs(live.core) : tpl ? tpl.core : [];
  const situational = usingLive ? mapSlugs(live.situational) : tpl ? tpl.situational : [];
  const hasBuild = core.length > 0 || boots.length > 0;
  const sourceLabel = usingLive ? "Cập nhật theo patch hiện tại" : tpl ? "Build mẫu (offline)" : null;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={styles.detailTop}>
        <TouchableOpacity onPress={onBack} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backText}>← Danh sách tướng</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onToggleFav} hitSlop={10} style={styles.favBtn}>
          <Ionicons name={isFav ? "star" : "star-outline"} size={16} color={isFav ? C.amber : C.textFaint} />
          <Text style={[styles.star, isFav && styles.starOn]}>{isFav ? "Đã thích" : "Yêu thích"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.head}>
        <ChampAvatar champ={champ} style={styles.headAvatar} />
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.headName}>{champ.vi}</Text>
            <TierBadge tier={tier} big />
          </View>
          {champ._new ? (
            <View style={styles.newDetailRow}>
              <Ionicons name="sparkles" size={14} color={C.cyan} />
              <Text style={[styles.identity, { flex: 1 }]}>Tướng mới — build cập nhật theo web, đặc tính sẽ bổ sung sau.</Text>
            </View>
          ) : (
            <>
              <View style={styles.tagRow}>
                <Text style={styles.roleTag}>{ROLE_VI[champ.role] || champ.role}</Text>
                <Text style={[styles.dmgTag, { color: dmgColor, borderColor: dmgColor }]}>{champ.damageType}</Text>
              </View>
              <Text style={styles.identity}>{BUILD_LABELS[champ.build] || "—"}</Text>
              <Text style={styles.subMeta}>
                {RANGE[champ.range] || ""}{champ.spike ? ` · ${SPIKE[champ.spike]}` : ""}
              </Text>
            </>
          )}
        </View>
      </View>

      {!hasBuild ? (
        <Text style={styles.empty}>Chưa có build cho tướng này.</Text>
      ) : (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.section}>BỘ TRANG BỊ</Text>
            {sourceLabel ? <Text style={styles.sourceTag}>{sourceLabel}</Text> : null}
          </View>

          {boots.length > 0 && (
            <>
              <Text style={styles.subLabel}>GIÀY & PHÙ PHÉP</Text>
              {boots.map((it, i) => <ItemRow key={`b${i}`} name={it} />)}
            </>
          )}

          <Text style={styles.subLabel}>CỐT LÕI (lên trước)</Text>
          {core.map((it, i) => <ItemRow key={`c${i}`} name={it} order={i + 1} />)}

          {situational.length > 0 && (
            <>
              <Text style={styles.subLabel}>TÙY TÌNH HUỐNG</Text>
              <View style={styles.sitWrap}>
                {situational.map((it, i) => <ItemChip key={`s${i}`} name={it} />)}
              </View>
            </>
          )}

          {tpl && (
            <>
              <Text style={styles.section}>NGỌC & PHÉP</Text>
              <View style={styles.rsRow}>
                <Text style={styles.rsBadge}>NGỌC</Text>
                <Text style={styles.rsName}>{keystoneName(tpl.keystone)}</Text>
              </View>
              <View style={styles.rsRow}>
                <Text style={[styles.rsBadge, styles.rsBadgeSpell]}>PHÉP</Text>
                <Text style={styles.rsName}>{tpl.spells.map(spellName).join(" + ")}</Text>
              </View>

              <View style={styles.noteCard}>
                <Text style={styles.noteLabel}>LỐI CHƠI</Text>
                <Text style={styles.noteText}>{tpl.note}</Text>
              </View>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

function ItemRow({ name, order }) {
  const item = findItem(name);
  const icon = item ? itemIcon(item) : null;
  const vi = item ? item.vi : name;
  return (
    <View style={styles.itemRow}>
      {order ? (
        <View style={styles.orderBadge}><Text style={styles.orderText}>{order}</Text></View>
      ) : (
        <View style={styles.bootDot} />
      )}
      {icon ? (
        <Image source={{ uri: icon }} style={styles.itemIcon} />
      ) : (
        <View style={[styles.itemIcon, styles.itemIconFallback]}>
          <Text style={styles.itemIconText}>{vi.slice(0, 2)}</Text>
        </View>
      )}
      <Text style={styles.itemName}>{vi}</Text>
    </View>
  );
}

function ItemChip({ name }) {
  const item = findItem(name);
  return <Text style={styles.sitChip}>{item ? item.vi : name}</Text>;
}

function keystoneName(n) {
  const k = findKeystone(n);
  return k ? k.vi : n;
}
function spellName(n) {
  const s = findSpell(n);
  return s ? s.vi : n;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  search: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, color: C.text, fontSize: 16,
  },
  laneRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 10 },
  laneChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  laneChipOn: { borderColor: C.violet, backgroundColor: C.violetDim, ...glow(C.violet, 14, 0.4) },
  laneChipText: { color: C.textDim, fontSize: 13, fontWeight: "700" },
  laneChipTextOn: { color: C.cyan },
  sortRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 10 },
  sortLabel: { color: C.textFaint, fontSize: 12 },
  sortOpt: { color: C.textDim, fontSize: 13, fontWeight: "700" },
  sortOptOn: { color: C.amber },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  tierSmall: { borderWidth: 1.5, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1, minWidth: 26, alignItems: "center" },
  tierSmallText: { fontWeight: "900", fontSize: 12 },
  tierBig: { borderWidth: 2, borderRadius: 7, paddingHorizontal: 9, paddingVertical: 2 },
  tierBigText: { fontWeight: "900", fontSize: 16 },
  row: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  rowAvatar: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: C.amberDim },
  avatarFallback: { backgroundColor: C.cardAlt, alignItems: "center", justifyContent: "center" },
  avatarFallbackText: { color: C.textDim, fontWeight: "800", fontSize: 14 },
  rowName: { color: C.text, fontWeight: "700", fontSize: 16 },
  rowRole: { color: C.textFaint, fontSize: 12, marginTop: 2 },
  newRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  rowRoleNew: { color: C.cyan, fontSize: 12, fontWeight: "700" },
  newDetailRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 6 },
  chevron: { color: C.textFaint, fontSize: 24, fontWeight: "300" },
  favBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  star: { color: C.textFaint, fontSize: 13, fontWeight: "700" },
  starOn: { color: C.amber },
  empty: { color: C.textDim, textAlign: "center", marginTop: 30 },
  detailTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  backBtn: {},
  backText: { color: C.cyan, fontWeight: "700", fontSize: 14 },
  head: { flexDirection: "row", gap: 14, alignItems: "center", marginBottom: 8 },
  headAvatar: { width: 72, height: 72, borderRadius: 14, borderWidth: 2, borderColor: C.amberDim },
  headName: { color: C.text, fontSize: 22, fontWeight: "900" },
  tagRow: { flexDirection: "row", gap: 8, marginTop: 4, alignItems: "center" },
  roleTag: { color: C.textDim, fontSize: 12, fontWeight: "700", backgroundColor: C.cardAlt, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  dmgTag: { fontSize: 12, fontWeight: "800", borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 1 },
  identity: { color: C.amber, fontSize: 13, fontWeight: "600", marginTop: 6 },
  subMeta: { color: C.textFaint, fontSize: 12, marginTop: 2 },
  section: { color: C.text, fontSize: 14, fontWeight: "900", letterSpacing: 1, marginTop: 22, marginBottom: 8 },
  sectionRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 22, marginBottom: 8 },
  sourceTag: { color: C.green, fontSize: 10, fontWeight: "700" },
  subLabel: { color: C.textDim, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginTop: 12, marginBottom: 6 },
  itemRow: {
    flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.card,
    borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 8, marginBottom: 6,
  },
  orderBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.amberDim, alignItems: "center", justifyContent: "center" },
  orderText: { color: C.amber, fontWeight: "900", fontSize: 12 },
  bootDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.cyanDim },
  itemIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: C.cardAlt },
  itemIconFallback: { alignItems: "center", justifyContent: "center" },
  itemIconText: { color: C.textDim, fontWeight: "800", fontSize: 12 },
  itemName: { color: C.text, fontSize: 14, fontWeight: "600", flex: 1 },
  sitWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  sitChip: {
    color: C.textDim, fontSize: 13, backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, paddingHorizontal: 11, paddingVertical: 6,
  },
  rsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 7 },
  rsBadge: { color: C.amber, borderColor: C.amberDim, borderWidth: 1, borderRadius: 5, fontSize: 10, fontWeight: "800", paddingHorizontal: 6, paddingVertical: 2 },
  rsBadgeSpell: { color: C.cyan, borderColor: C.cyanDim },
  rsName: { color: C.text, fontSize: 14, fontWeight: "700" },
  noteCard: { backgroundColor: C.cardAlt, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 13, marginTop: 18 },
  noteLabel: { color: C.textDim, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 6 },
  noteText: { color: C.text, fontSize: 13, lineHeight: 20 },
});
