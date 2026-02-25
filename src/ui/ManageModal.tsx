import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import { WordItem } from "../storage/wordsStorage";
import { COLORS } from "./colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  words: WordItem[];
  onDeleteOne: (id: string) => void;
  onClearAll: () => void;
};

export default function ManageModal({
  visible,
  onClose,
  words,
  onDeleteOne,
  onClearAll,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <Text style={styles.title}>Kelimeleri Yönet</Text>
          <Pressable style={styles.headerBtn} onPress={onClose}>
            <Text style={styles.headerBtnText}>Kapat</Text>
          </Pressable>
        </View>

        <View style={styles.actions}>
          <Text style={styles.count}>Toplam: {words.length}</Text>
          <Pressable style={styles.dangerBtn} onPress={onClearAll}>
            <Text style={styles.dangerText}>Hepsini Sil</Text>
          </Pressable>
        </View>

        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.word}>{item.word}</Text>
                <Text style={styles.meaning}>{item.meaning}</Text>
              </View>
              <Pressable style={styles.del} onPress={() => onDeleteOne(item.id)}>
                <Text style={styles.delText}>Sil</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Henüz kelime yok.</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg, padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  headerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerBtnText: { fontWeight: "800", color: COLORS.text },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  count: { color: COLORS.muted, fontWeight: "800" },
  dangerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.30)",
  },
  dangerText: { color: "#B91C1C", fontWeight: "900" },
  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  word: { fontSize: 16, fontWeight: "900", color: COLORS.text },
  meaning: { marginTop: 2, color: COLORS.muted, fontWeight: "700" },
  del: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  delText: { color: COLORS.white, fontWeight: "900" },
  empty: { marginTop: 30, alignItems: "center" },
  emptyText: { color: COLORS.muted, fontWeight: "800" },
});