// src/screens/SuggestSetupScreen.js
// Nhập tay lane + tướng đồng đội + tướng địch (đã lộ ở màn cấm/chọn) → gợi ý tướng nên pick.
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert,
} from "react-native";
import { C, LANES } from "../theme";
import { suggestChampions, findChampion } from "../data/champions";
import { championIcon } from "../lib/images";
import GradientButton from "../components/GradientButton";

// Khối thêm nhiều tướng (dùng chung cho đồng đội & địch)
function ChampMultiAdd({ label, accent, list, onAdd, onRemove }) {
  const [query, setQuery] = useState("");
  const [suggests, setSuggests] = useState([]);

  const onChange = (t) => {
    setQuery(t);
    setSuggests(suggestChampions(t));
  };
  const add = (c) => {
    if (!list.some((x) => x.name === c.name)) onAdd({ name: c.name, vi: c.vi });
    setQuery("");
    setSuggests([]);
  };

  return (
    <View style={{ marginTop: 18 }}>
      <Text style={[styles.label, { color: accent }]}>{label} ({list.length})</Text>
      <View style={styles.chips}>
        {list.map((e, idx) => {
          const champ = findChampion(e.name);
          return (
            <View key={`${e.name}-${idx}`} style={[styles.chip, { borderColor: accent }]}>
              {champ && <Image source={{ uri: championIcon(champ) }} style={styles.chipAvatar} />}
              <Text style={styles.chipText}>{champ ? champ.vi : e.vi || e.name}</Text>
              <TouchableOpacity onPress={() => onRemove(idx)} hitSlop={8}>
                <Text style={styles.remove}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      <TextInput
        value={query}
        onChangeText={onChange}
        placeholder="Gõ tên tướng để thêm…"
        placeholderTextColor={C.textFaint}
        style={styles.input}
      />
      {suggests.length > 0 && (
        <View style={styles.suggestBox}>
          {suggests.map((c) => (
            <TouchableOpacity key={c.id} style={styles.suggestItem} onPress={() => add(c)}>
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

export default function SuggestSetupScreen({ session, patch, onGo }) {
  const [lane, setLane] = useState(session.lane || LANES[0]);
  const [allies, setAllies] = useState(session.allies || []);
  const [enemies, setEnemies] = useState(session.enemies || []);

  const run = () => {
    if (enemies.length === 0 && allies.length === 0) {
      Alert.alert("Trống", "Thêm ít nhất 1 tướng (đồng đội hoặc địch) để gợi ý chính xác.");
      return;
    }
    patch({ lane, allies, enemies });
    onGo();
  };

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.hint}>
        Nhập đường bạn đi cùng các tướng đồng đội và địch đã chọn. AI sẽ gợi ý tướng vừa khắc chế
        địch vừa hợp đội hình.
      </Text>

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

      <ChampMultiAdd
        label="ĐỒNG ĐỘI ĐÃ CHỌN"
        accent={C.green}
        list={allies}
        onAdd={(c) => setAllies((a) => [...a, c])}
        onRemove={(idx) => setAllies((a) => a.filter((_, i) => i !== idx))}
      />

      <ChampMultiAdd
        label="ĐỊCH ĐÃ CHỌN"
        accent={C.red}
        list={enemies}
        onAdd={(c) => setEnemies((e) => [...e, c])}
        onRemove={(idx) => setEnemies((e) => e.filter((_, i) => i !== idx))}
      />

      <GradientButton title="🎯 GỢI Ý TƯỚNG NÊN CHỌN →" onPress={run} style={{ marginTop: 26 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  hint: { color: C.textDim, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 10, color: C.textDim },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 7, paddingLeft: 6, paddingRight: 10,
    paddingVertical: 6, borderRadius: 20, backgroundColor: C.cardAlt, borderWidth: 1,
  },
  chipAvatar: { width: 24, height: 24, borderRadius: 12 },
  chipText: { color: C.text, fontWeight: "600", fontSize: 14 },
  remove: { color: C.textFaint, fontSize: 15, fontWeight: "700" },
  input: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 16,
  },
  suggestBox: { marginTop: 6, backgroundColor: C.cardAlt, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  suggestItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  suggestAvatar: { width: 28, height: 28, borderRadius: 6 },
  suggestText: { color: C.text, fontSize: 15, fontWeight: "600", flex: 1 },
  suggestRole: { color: C.textFaint, fontSize: 12 },
  laneRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  laneChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  laneChipActive: { backgroundColor: C.cyanDim, borderColor: C.cyan },
  laneText: { color: C.textDim, fontWeight: "600", fontSize: 13 },
  laneTextActive: { color: C.text },
  cta: {
    marginTop: 26, backgroundColor: C.amber, borderRadius: 12, paddingVertical: 15,
    alignItems: "center", justifyContent: "center",
  },
  ctaText: { color: "#0b1220", fontWeight: "900", fontSize: 15, letterSpacing: 0.5 },
});
