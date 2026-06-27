// src/screens/SuggestSetupScreen.js
// Nhập tay lane + tướng đồng đội + tướng địch (đã lộ ở màn cấm/chọn) → gợi ý tướng nên pick.
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from "react-native";
import { C, LANES } from "../theme";
import { findChampion } from "../data/champions";
import { championIcon } from "../lib/images";
import GradientButton from "../components/GradientButton";
import { LanePicker, ChampSearch } from "../components/inputs";

// Khối thêm nhiều tướng (dùng chung cho đồng đội & địch)
function ChampMultiAdd({ label, accent, list, onAdd, onRemove }) {
  const add = (c) => {
    if (!list.some((x) => x.name === c.name)) onAdd({ name: c.name, vi: c.vi });
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
      <ChampSearch onPick={add} placeholder="Gõ tên tướng để thêm…" />
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
      <LanePicker value={lane} onChange={setLane} />

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

      <GradientButton title="GỢI Ý TƯỚNG NÊN CHỌN" icon="locate" onPress={run} style={{ marginTop: 26 }} />
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
});
