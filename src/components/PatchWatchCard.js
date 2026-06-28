// src/components/PatchWatchCard.js — thẻ "Theo dõi patch" ở đầu màn Tin tức.
// Hiện patch hiện tại, badge "PATCH MỚI" khi vừa lên patch, công tắc bật/tắt thông báo,
// và danh sách tướng tủ để nhắc kiểm tra lại build sau mỗi patch.
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { C, glow } from "../theme";
import { CHAMPIONS } from "../data/champions";
import { championIcon } from "../lib/images";
import { getNotifyEnabled, setNotifyEnabled } from "../lib/patchWatch";
import { getFavorites } from "../lib/storage";
import { tapSelection } from "../lib/haptics";

export default function PatchWatchCard({ patch, isNew }) {
  const [notify, setNotify] = useState(true);
  const [favs, setFavs] = useState([]);

  useEffect(() => {
    getNotifyEnabled().then(setNotify);
    getFavorites().then(setFavs);
  }, []);

  const onToggle = (val) => {
    tapSelection();
    setNotify(val);
    setNotifyEnabled(val);
  };

  const favChamps = CHAMPIONS.filter((c) => favs.includes(c.id)).slice(0, 8);

  return (
    <View style={[styles.card, isNew && styles.cardNew]}>
      <View style={styles.headRow}>
        <Ionicons name="git-branch" size={15} color={C.cyan} />
        <Text style={styles.title}>THEO DÕI PATCH</Text>
        {patch ? (
          isNew ? (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>PATCH MỚI · {patch}</Text>
            </View>
          ) : (
            <Text style={styles.patchText}>Patch {patch}</Text>
          )
        ) : (
          <Text style={styles.patchText}>—</Text>
        )}
      </View>

      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleLabel}>Thông báo khi có patch mới</Text>
          <Text style={styles.toggleHint}>Nhắc kiểm tra lại build tướng tủ khi cập nhật.</Text>
        </View>
        <Switch
          value={notify}
          onValueChange={onToggle}
          trackColor={{ false: C.border, true: C.violet }}
          thumbColor={notify ? C.cyan : C.textFaint}
        />
      </View>

      <View style={styles.favBlock}>
        <Text style={styles.favLabel}>TƯỚNG TỦ ({favChamps.length})</Text>
        {favChamps.length > 0 ? (
          <View style={styles.favRow}>
            {favChamps.map((c) => (
              <View key={c.id} style={styles.favItem}>
                <Image source={{ uri: championIcon(c) }} style={styles.favAvatar} />
                <Text style={styles.favName} numberOfLines={1}>{c.vi}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.favEmpty}>
            Chưa có. Vào tab <Text style={{ color: C.amber }}>Tướng</Text> bấm ⭐ để theo dõi tướng tủ.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    padding: 14, marginBottom: 16,
  },
  cardNew: { borderColor: C.cyan, ...glow(C.cyan, 18, 0.3) },
  headRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  title: { color: C.textDim, fontSize: 12, fontWeight: "900", letterSpacing: 1, flex: 1 },
  patchText: { color: C.cyan, fontSize: 12, fontWeight: "800" },
  newBadge: {
    backgroundColor: C.cyanDim, borderWidth: 1, borderColor: C.cyan,
    borderRadius: 20, paddingHorizontal: 9, paddingVertical: 3, ...glow(C.cyan, 8, 0.5),
  },
  newBadgeText: { color: C.cyan, fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  toggleLabel: { color: C.text, fontSize: 14, fontWeight: "700" },
  toggleHint: { color: C.textFaint, fontSize: 11.5, marginTop: 2, lineHeight: 16 },
  favBlock: { marginTop: 14, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 12 },
  favLabel: { color: C.textDim, fontSize: 11, fontWeight: "800", letterSpacing: 1, marginBottom: 9 },
  favRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  favItem: { alignItems: "center", width: 46 },
  favAvatar: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: C.amberDim },
  favName: { color: C.textDim, fontSize: 10, marginTop: 3, textAlign: "center" },
  favEmpty: { color: C.textFaint, fontSize: 12.5, lineHeight: 18 },
});
