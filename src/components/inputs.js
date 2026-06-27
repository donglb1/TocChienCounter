// src/components/inputs.js — input dùng chung nhiều màn: chọn đường + tìm/chọn tướng.
// Gom logic + style trùng lặp ở Setup/Confirm/QuickCounter/SuggestSetup về 1 chỗ.
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { C, LANES, glow } from "../theme";
import { suggestChampions } from "../data/champions";
import { championIcon } from "../lib/images";

// Hàng chip chọn đường (5 lane). value = tên lane, onChange(lane).
export function LanePicker({ value, onChange, style }) {
  return (
    <View style={[styles.laneRow, style]}>
      {LANES.map((l) => {
        const on = value === l;
        return (
          <TouchableOpacity
            key={l}
            style={[styles.laneChip, on && styles.laneChipActive]}
            onPress={() => onChange(l)}
          >
            <Text style={[styles.laneText, on && styles.laneTextActive]}>{l}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Ô tìm tướng + dropdown gợi ý. onPick(champ) khi chọn 1 tướng.
//  - controlled: truyền value + onChangeText (vd SetupScreen giữ tên trong ô).
//  - uncontrolled: bỏ trống → tự quản query; clearOnPick mặc định true (xóa ô sau khi chọn).
//  - leftAvatar: hiện avatar tướng đang chọn bên trái ô (SetupScreen).
export function ChampSearch({
  value,
  onChangeText,
  onPick,
  placeholder = "Gõ tên tướng…",
  clearOnPick = true,
  leftAvatar = null,
}) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState("");
  const [suggests, setSuggests] = useState([]);
  const query = controlled ? value : inner;

  const onChange = (t) => {
    if (controlled) onChangeText?.(t);
    else setInner(t);
    setSuggests(suggestChampions(t));
  };
  const pick = (c) => {
    onPick?.(c);
    if (clearOnPick) {
      if (controlled) onChangeText?.("");
      else setInner("");
    }
    setSuggests([]);
  };

  return (
    <View>
      <View style={leftAvatar ? styles.inputRow : undefined}>
        {leftAvatar}
        <TextInput
          value={query}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={C.textFaint}
          style={[styles.input, leftAvatar && { flex: 1 }]}
        />
      </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  laneRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  laneChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  laneChipActive: { backgroundColor: C.violetDim, borderColor: C.violet, ...glow(C.violet, 14, 0.4) },
  laneText: { color: C.textDim, fontWeight: "600", fontSize: 13 },
  laneTextActive: { color: C.text },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  input: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 16,
  },
  suggestBox: { marginTop: 6, backgroundColor: C.cardAlt, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  suggestItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  suggestAvatar: { width: 28, height: 28, borderRadius: 6 },
  suggestText: { color: C.text, fontSize: 15, fontWeight: "600", flex: 1 },
  suggestRole: { color: C.textFaint, fontSize: 12 },
});
