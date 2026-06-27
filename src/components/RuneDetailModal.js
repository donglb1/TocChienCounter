// src/components/RuneDetailModal.js
// Bảng chi tiết 1 NGỌC / PHÉP bổ trợ: tên Việt/Anh + loại + mô tả tác dụng (từ DB runes).
// Chạm 1 ngọc/phép ở màn kết quả → mở bảng này (giống ItemDetailModal cho trang bị). data=null → ẩn.
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import { C } from "../theme";
import { Ionicons } from "@expo/vector-icons";

const KIND_LABEL = { keystone: "Ngọc chính", minor: "Ngọc phụ", spell: "Phép bổ trợ" };

export default function RuneDetailModal({ data, onClose }) {
  return (
    <Modal visible={!!data} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          {data && (
            <>
              <View style={styles.head}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{data.vi || data.name}</Text>
                  {data.vi && data.vi !== data.name ? <Text style={styles.enName}>{data.name}</Text> : null}
                  <Text style={styles.kind}>{KIND_LABEL[data.kind] || "Ngọc"}</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <Ionicons name="close" size={22} color={C.textFaint} />
                </TouchableOpacity>
              </View>
              {data.desc ? (
                <Text style={styles.desc}>{data.desc}</Text>
              ) : (
                <Text style={styles.descDim}>Chưa có mô tả cho ngọc/phép này.</Text>
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
  head: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 12 },
  name: { color: C.text, fontSize: 17, fontWeight: "900" },
  enName: { color: C.textFaint, fontSize: 12, marginTop: 1 },
  kind: { color: C.amber, fontSize: 11, fontWeight: "800", letterSpacing: 0.5, marginTop: 3 },
  desc: { color: C.textDim, fontSize: 14, lineHeight: 21 },
  descDim: { color: C.textFaint, fontSize: 13, fontStyle: "italic" },
});
