// src/ui/ManageModal.tsx
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "./colors";
import ConfirmModal from "./ConfirmModal";

export type WordItem = {
  id: string;
  word: string;
  meaning: string;
  createdAt: number;
};

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
  const insets = useSafeAreaInsets();

  const data = useMemo(() => {
    return [...words].sort((a, b) => a.word.localeCompare(b.word));
  }, [words]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mode, setMode] = useState<"one" | "all">("one");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [targetWord, setTargetWord] = useState("");

  const openConfirmDeleteOne = (id: string, word: string) => {
    setMode("one");
    setTargetId(id);
    setTargetWord(word);
    setConfirmOpen(true);
  };

  const openConfirmClearAll = () => {
    if (data.length === 0) return;
    setMode("all");
    setTargetId(null);
    setTargetWord("");
    setConfirmOpen(true);
  };

  const closeConfirm = () => setConfirmOpen(false);

  const confirmTitle =
    mode === "all" ? "Hepsi silinsin mi?" : "Kelime silinsin mi?";
  const confirmMessage =
    mode === "all"
      ? `${data.length} kelime kalıcı olarak silinecek.`
      : `"${targetWord}" kelimesini silmek üzeresin.`;

  const onConfirm = () => {
    setConfirmOpen(false);
    if (mode === "all") return onClearAll();
    if (targetId) onDeleteOne(targetId);
  };

  // ✅ “çok üste yapışmasın” için gerçek safe-area + ekstra boşluk
  const topPad = insets.top + UI.topPad;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.brandBlue ?? COLORS.cardBlue}
      />

      {/* ✅ TAM EKRAN SAYFA */}
      <View style={[styles.page, { paddingTop: topPad, paddingBottom: insets.bottom + 10 }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Kelimeleri Yönet</Text>

          <Pressable
            style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.headerBtnText}>Kapat</Text>
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.countPill}>
            <Text style={styles.countLabel}>Toplam</Text>
            <Text style={styles.countValue}>{data.length}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.dangerBtn,
              pressed && styles.dangerBtnPressed,
              data.length === 0 && styles.dangerBtnDisabled,
            ]}
            onPress={openConfirmClearAll}
            disabled={data.length === 0}
          >
            <Text style={styles.dangerText}>Hepsini Sil</Text>
          </Pressable>
        </View>

        {/* ✅ Liste: full kalan alan */}
        <View style={styles.listBox}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 18 }}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.word}>{item.word}</Text>
                  <Text style={styles.meaning} numberOfLines={2}>
                    {item.meaning}
                  </Text>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.del, pressed && styles.delPressed]}
                  onPress={() => openConfirmDeleteOne(item.id, item.word)}
                >
                  <Text style={styles.delText}>Sil</Text>
                </Pressable>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Henüz kelime yok</Text>
                <Text style={styles.emptyText}>
                  Menüden “Kelime Ekle” veya “TXT İçe Aktar” ile başlayabilirsin.
                </Text>
              </View>
            }
          />
        </View>

        <ConfirmModal
          visible={confirmOpen}
          title={confirmTitle}
          message={confirmMessage}
          cancelText="Vazgeç"
          confirmText={mode === "all" ? "Hepsini Sil" : "Sil"}
          danger
          onCancel={closeConfirm}
          onConfirm={onConfirm}
        />
      </View>
    </Modal>
  );
}

/* ===========================
   AYAR (buradan oynarsın)
=========================== */
const UI = {
  pagePadX: 16,

  // ✅ Senin istediğin ayar:
  // arttırırsan aşağı iner, azaltırsan yukarı çıkar
  topPad: Platform.OS === "ios" ? 14 : 12, // 👈 BUNU OYNA (12-28)

  rowRadius: 18,
  btnRadius: 14,
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: UI.pagePadX,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  headerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: UI.btnRadius,
    backgroundColor: COLORS.brandBlueLight ?? "#EEF2FF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerBtnText: { fontWeight: "900", color: COLORS.text },
  pressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  countPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: COLORS.brandBlueLight ?? "#EEF2FF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countLabel: { color: COLORS.textSoft ?? COLORS.text, fontWeight: "900" },
  countValue: { color: COLORS.brandBlue ?? COLORS.cardBlue, fontWeight: "900" },

  dangerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: UI.btnRadius,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.28)",
  },
  dangerBtnPressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  dangerBtnDisabled: { opacity: 0.45 },
  dangerText: { color: "#B91C1C", fontWeight: "900" },

  listBox: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },

  row: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderRadius: UI.rowRadius,
    backgroundColor: COLORS.surface ?? COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  word: { fontSize: 16, fontWeight: "900", color: COLORS.text },
  meaning: { marginTop: 3, color: COLORS.muted, fontWeight: "700" },

  del: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: UI.btnRadius,
    backgroundColor: COLORS.black,
  },
  delPressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  delText: { color: COLORS.white, fontWeight: "900" },

  empty: {
    marginTop: 26,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyTitle: { color: COLORS.text, fontWeight: "900", fontSize: 16 },
  emptyText: {
    marginTop: 8,
    color: COLORS.muted,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },
});