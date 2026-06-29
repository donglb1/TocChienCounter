// src/screens/SetupScreen.js
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as MediaLibrary from "expo-media-library";
import { C, LANES } from "../theme";
import { findChampion } from "../data/champions";
import { championIcon } from "../lib/images";
import { extractChampions } from "../lib/api";
import { Ionicons } from "@expo/vector-icons";
import GradientButton from "../components/GradientButton";
import { CornerBrackets } from "../components/neon";
import { LanePicker, ChampSearch } from "../components/inputs";

const MAX_EDGE = 1568; // resize cạnh dài → đủ rõ để đọc, nhẹ token

export default function SetupScreen({ session, patch, onExtracted, onHistory }) {
  const [champQuery, setChampQuery] = useState(session.champ || "");
  const [lane, setLane] = useState(session.lane || LANES[0]);
  const [imageUri, setImageUri] = useState(session.imageUri || null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [grabbing, setGrabbing] = useState(false);

  // Resize cạnh dài về MAX_EDGE rồi nạp vào state (dùng chung cho cả 2 nút)
  const loadImage = async ({ uri, width, height }) => {
    const longEdge = Math.max(width || MAX_EDGE, height || MAX_EDGE);
    const scale = longEdge > MAX_EDGE ? MAX_EDGE / longEdge : 1;
    const manip = await ImageManipulator.manipulateAsync(
      uri,
      scale < 1
        ? [{ resize: { width: Math.round((width || MAX_EDGE) * scale) } }]
        : [],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    setImageUri(manip.uri);
    setImageBase64(manip.base64);
    setMediaType("image/jpeg");
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
    await loadImage(res.assets[0]);
  };

  // Chụp nhanh: lấy thẳng screenshot mới nhất trong máy, khỏi mở gallery
  const grabLatest = async () => {
    setGrabbing(true);
    try {
      const perm = await MediaLibrary.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Cần quyền", "Cho phép truy cập ảnh để lấy nhanh screenshot vừa chụp.");
        return;
      }
      // Ưu tiên album Screenshots; không có thì lấy ảnh mới nhất toàn máy
      let album = null;
      try {
        album = await MediaLibrary.getAlbumAsync("Screenshots");
      } catch {}
      const page = await MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: MediaLibrary.MediaType.photo,
        sortBy: [MediaLibrary.SortBy.creationTime],
        ...(album ? { album } : {}),
      });
      const asset = page.assets?.[0];
      if (!asset) {
        Alert.alert("Không tìm thấy ảnh", "Chưa có screenshot nào. Chụp màn hình chọn tướng trong game rồi bấm lại.");
        return;
      }
      // iOS trả uri ph:// — cần localUri thật để manipulate/đọc base64
      let uri = asset.uri;
      if (uri.startsWith("ph://") || !uri.startsWith("file")) {
        try {
          const info = await MediaLibrary.getAssetInfoAsync(asset);
          uri = info.localUri || uri;
        } catch {}
      }
      await loadImage({ uri, width: asset.width, height: asset.height });
    } catch (e) {
      Alert.alert("Lỗi", String(e.message || e));
    } finally {
      setGrabbing(false);
    }
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
      <ChampSearch
        value={champQuery}
        onChangeText={setChampQuery}
        onPick={(c) => setChampQuery(c.vi)}
        clearOnPick={false}
        placeholder="Gõ tên tướng…"
        leftAvatar={champObj ? <Image source={{ uri: championIcon(champObj) }} style={styles.champAvatar} /> : null}
      />

      <Text style={[styles.label, { marginTop: 18 }]}>ĐƯỜNG</Text>
      <LanePicker value={lane} onChange={setLane} />

      <Text style={[styles.label, { marginTop: 18 }]}>ẢNH TEAM ĐỊCH</Text>
      <TouchableOpacity
        style={styles.quickBtn}
        onPress={grabLatest}
        activeOpacity={0.8}
        disabled={grabbing}
      >
        <Ionicons name={grabbing ? "hourglass-outline" : "flash"} size={16} color={C.cyan} />
        <Text style={styles.quickBtnText}>
          {grabbing ? "Đang lấy ảnh…" : "Lấy ảnh vừa chụp"}
        </Text>
      </TouchableOpacity>
      <Text style={styles.quickHint}>
        Chụp màn hình chọn tướng trong game → mở app → bấm nút này.
      </Text>
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
  champAvatar: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: C.amberDim },
  quickBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7,
    height: 46, borderRadius: 12, borderWidth: 1.5, borderColor: "rgba(34,211,238,0.45)",
    backgroundColor: "rgba(34,211,238,0.08)", marginBottom: 8,
  },
  quickBtnText: { color: C.cyan, fontWeight: "800", fontSize: 14, letterSpacing: 0.5 },
  quickHint: { color: C.textFaint, fontSize: 12, lineHeight: 16, marginBottom: 10 },
  imageBox: {
    height: 200, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card, alignItems: "center", justifyContent: "center", overflow: "hidden", gap: 8,
  },
  imageBoxEmpty: { borderWidth: 1.5, borderStyle: "dashed", borderColor: "rgba(168,85,247,0.45)", backgroundColor: C.cardAlt },
  preview: { width: "100%", height: "100%" },
  imageHintTitle: { color: C.text, fontWeight: "700", fontSize: 15 },
  imageHint: { color: C.textFaint, textAlign: "center", fontSize: 13, lineHeight: 18 },
});
