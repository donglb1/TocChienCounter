// src/screens/SetupScreen.js
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, ActivityIndicator, Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { C, LANES, glow } from "../theme";
import { suggestChampions, findChampion } from "../data/champions";
import { championIcon } from "../lib/images";
import { extractChampions } from "../lib/api";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "../components/GradientButton";
import { CornerBrackets } from "../components/neon";

const MAX_EDGE = 1568; // resize cạnh dài → đủ rõ để đọc, nhẹ token

export default function SetupScreen({ session, patch, onExtracted, onHistory }) {
  const [champQuery, setChampQuery] = useState(session.champ || "");
  const [suggests, setSuggests] = useState([]);
  const [lane, setLane] = useState(session.lane || LANES[0]);
  const [imageUri, setImageUri] = useState(session.imageUri || null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);

  const onChampChange = (t) => {
    setChampQuery(t);
    setSuggests(suggestChampions(t));
  };
  const pickChamp = (c) => {
    setChampQuery(c.vi);
    setSuggests([]);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Cần quyền", "Cho phép truy cập thư viện ảnh để chọn screenshot.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (res.canceled) return;
    const asset = res.assets[0];

    // Resize cạnh dài về MAX_EDGE
    const longEdge = Math.max(asset.width || MAX_EDGE, asset.height || MAX_EDGE);
    const scale = longEdge > MAX_EDGE ? MAX_EDGE / longEdge : 1;
    const manip = await ImageManipulator.manipulateAsync(
      asset.uri,
      scale < 1
        ? [{ resize: { width: Math.round((asset.width || MAX_EDGE) * scale) } }]
        : [],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    setImageUri(manip.uri);
    setImageBase64(manip.base64);
    setMediaType("image/jpeg");
  };

  const run = async () => {
    const champ = findChampion(champQuery);
    if (!champ) {
      Alert.alert("Chưa chọn tướng", "Gõ và chọn tướng người chơi từ gợi ý.");
      return;
    }
    if (!imageBase64) {
      Alert.alert("Chưa có ảnh", "Chọn ảnh chụp màn hình team địch.");
      return;
    }
    setLoading(true);
    try {
      patch({ champ: champ.vi, lane, imageUri });
      const result = await extractChampions({
        imageBase64, mediaType, champ: champ.name, lane,
      });
      const enemies = (result.enemyChampions || []).map((e) => ({
        name: e.name,
        displayName: e.displayName || e.name,
        confidence: e.confidence || "medium",
      }));
      if (enemies.length === 0) {
        Alert.alert("Không đọc được tướng", result.notes || "Thử ảnh rõ hơn hoặc nhập tay ở bước sau.");
      }
      patch({ enemies });
      onExtracted();
    } catch (e) {
      Alert.alert("Lỗi", String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  const champObj = findChampion(champQuery);

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {onHistory && (
        <TouchableOpacity style={styles.historyBtn} onPress={onHistory} hitSlop={6}>
          <Ionicons name="time-outline" size={15} color={C.cyan} />
          <Text style={styles.historyText}>Lịch sử phân tích</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>TƯỚNG CỦA BẠN</Text>
      <View style={styles.champRow}>
        {champObj && (
          <Image source={{ uri: championIcon(champObj) }} style={styles.champAvatar} />
        )}
        <TextInput
          value={champQuery}
          onChangeText={onChampChange}
          placeholder="Gõ tên tướng…"
          placeholderTextColor={C.textFaint}
          style={styles.input}
        />
      </View>
      {suggests.length > 0 && (
        <View style={styles.suggestBox}>
          {suggests.map((c) => (
            <TouchableOpacity key={c.id} style={styles.suggestItem} onPress={() => pickChamp(c)}>
              <Image source={{ uri: championIcon(c) }} style={styles.suggestAvatar} />
              <Text style={styles.suggestText}>{c.vi}</Text>
              <Text style={styles.suggestRole}>{c.role}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[styles.label, { marginTop: 18 }]}>ĐƯỜNG</Text>
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

      <Text style={[styles.label, { marginTop: 18 }]}>ẢNH TEAM ĐỊCH</Text>
      <TouchableOpacity
        style={[styles.imageBox, !imageUri && styles.imageBoxEmpty]}
        onPress={pickImage}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
        ) : (
          <>
            <CornerBrackets color="rgba(34,211,238,0.6)" size={16} inset={10} />
            <Ionicons name="image-outline" size={38} color={C.violet} />
            <Text style={styles.imageHintTitle}>Tải ảnh chọn tướng</Text>
            <Text style={styles.imageHint}>Chụp màn hình team địch để AI đọc</Text>
          </>
        )}
      </TouchableOpacity>

      <GradientButton
        title="ĐỌC TEAM ĐỊCH →"
        loading={loading}
        loadingText="Đang đọc tướng…"
        onPress={run}
        style={{ marginTop: 22 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  historyBtn: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-end", marginBottom: 10, paddingVertical: 4 },
  historyText: { color: C.cyan, fontWeight: "700", fontSize: 13 },
  label: { color: C.textDim, fontSize: 12, fontWeight: "800", letterSpacing: 1, marginBottom: 8 },
  champRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  champAvatar: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: C.amberDim },
  input: {
    flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: C.text, fontSize: 16,
  },
  suggestBox: { marginTop: 6, backgroundColor: C.cardAlt, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  suggestItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  suggestAvatar: { width: 28, height: 28, borderRadius: 6 },
  suggestText: { color: C.text, fontSize: 15, fontWeight: "600", flex: 1 },
  suggestRole: { color: C.textFaint, fontSize: 12 },
  laneRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  laneChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  laneChipActive: { backgroundColor: C.violetDim, borderColor: C.violet, ...glow(C.violet, 14, 0.4) },
  laneText: { color: C.textDim, fontWeight: "600", fontSize: 13 },
  laneTextActive: { color: C.text },
  imageBox: {
    height: 200, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card, alignItems: "center", justifyContent: "center", overflow: "hidden", gap: 8,
  },
  imageBoxEmpty: { borderWidth: 1.5, borderStyle: "dashed", borderColor: "rgba(168,85,247,0.45)", backgroundColor: C.cardAlt },
  preview: { width: "100%", height: "100%" },
  imageHintTitle: { color: C.text, fontWeight: "700", fontSize: 15 },
  imageHint: { color: C.textFaint, textAlign: "center", fontSize: 13, lineHeight: 18 },
  cta: {
    marginTop: 22, backgroundColor: C.amber, borderRadius: 12, paddingVertical: 15,
    alignItems: "center", justifyContent: "center",
  },
  ctaText: { color: "#0b1220", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
});
