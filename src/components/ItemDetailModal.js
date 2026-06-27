// src/components/ItemDetailModal.js
// Bảng chi tiết 1 trang bị: icon + tên Việt/Anh + loại + mô tả thuộc tính (từ DB items).
// Chạm 1 item ở bất kỳ màn nào → mở bảng này. item=null → ẩn.
import React from "react";
import { Modal, View, Text, Image, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { C } from "../theme";
import { Ionicons } from "@expo/vector-icons";
import { itemIcon } from "../lib/images";

const TYPE_LABEL = {
  defense: "Phòng thủ",
  offense: "Tấn công",
  boots: "Giày / Phù phép",
  support: "Hỗ trợ",
  core: "Cốt lõi",
  situational: "Tùy tình huống",
};

export default function ItemDetailModal({ item, onClose }) {
  const icon = item ? itemIcon(item) : null;
  return (
    <Modal visible={!!item} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {item && (
            <>
              <View style={styles.head}>
                {icon ? (
                  <Image source={{ uri: icon }} style={styles.icon} />
                ) : (
                  <View style={[styles.icon, styles.iconFallback]}>
                    <Text style={styles.iconFallbackText}>{(item.vi || item.name).slice(0, 2)}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.vi || item.name}</Text>
                  {item.vi && item.vi !== item.name ? (
                    <Text style={styles.enName}>{item.name}</Text>
                  ) : null}
                  {item.type ? <Text style={styles.type}>{TYPE_LABEL[item.type] || item.type}</Text> : null}
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <Ionicons name="close" size={22} color={C.textFaint} />
                </TouchableOpacity>
              </View>

              {item.desc ? (
                <Text style={styles.desc}>{item.desc}</Text>
              ) : (
                <Text style={styles.descDim}>Chưa có mô tả chi tiết cho trang bị này.</Text>
              )}
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center", padding: 28 },
  card: { width: "100%", backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 18 },
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  icon: { width: 52, height: 52, borderRadius: 11, backgroundColor: C.cardAlt },
  iconFallback: { alignItems: "center", justifyContent: "center" },
  iconFallbackText: { color: C.textDim, fontWeight: "800", fontSize: 16 },
  name: { color: C.text, fontSize: 17, fontWeight: "900" },
  enName: { color: C.textFaint, fontSize: 12, marginTop: 1 },
  type: { color: C.cyan, fontSize: 11, fontWeight: "800", letterSpacing: 0.5, marginTop: 3 },
  desc: { color: C.textDim, fontSize: 14, lineHeight: 21 },
  descDim: { color: C.textFaint, fontSize: 13, fontStyle: "italic" },
});
