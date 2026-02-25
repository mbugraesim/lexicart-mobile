import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "./colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  onOpenAdd: () => void;
  onImportTxt: () => void;
  onManage: () => void;
};

export default function MenuDrawer({
  visible,
  onClose,
  onOpenAdd,
  onImportTxt,
  onManage,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <Text style={styles.title}>Menü</Text>
        <Text style={styles.sub}>Kelime ekle, dosyadan içe aktar, sil.</Text>

        <Pressable style={styles.item} onPress={onOpenAdd}>
          <Text style={styles.itemText}>➕ Kelime Ekle</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={onImportTxt}>
          <Text style={styles.itemText}>📄 TXT İçe Aktar</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={onManage}>
          <Text style={styles.itemText}>🗂️ Kelimeleri Yönet</Text>
        </Pressable>

        <Pressable style={[styles.item, styles.close]} onPress={onClose}>
          <Text style={[styles.itemText, { color: COLORS.black }]}>Kapat</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,23,0.45)",
  },
  sheet: {
    position: "absolute",
    left: 14,
    right: 14,
    top: 70,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.text,
  },
  sub: {
    marginTop: 4,
    marginBottom: 12,
    color: COLORS.muted,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#F7F8FF",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  close: {
    backgroundColor: "#EEF2FF",
  },
});