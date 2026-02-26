// src/ui/MenuDrawer.tsx
import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
} from "react-native";
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
  const act = useMemo(
    () => ({
      add: () => {
        onClose();
        setTimeout(onOpenAdd, 80);
      },
      importTxt: () => {
        onClose();
        setTimeout(onImportTxt, 80);
      },
      manage: () => {
        onClose();
        setTimeout(onManage, 80);
      },
    }),
    [onClose, onOpenAdd, onImportTxt, onManage]
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.brandBlue ?? COLORS.cardBlue}
      />

      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.centerWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetInner}
          >
            {/* ================= HEADER ================= */}
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <View style={styles.dot} />
                <Text style={styles.title}>Menü</Text>
              </View>

              <Text style={styles.sub}>
                Kelime ekle, dosyadan içe aktar, sil.
              </Text>
            </View>

            {/* ================= ITEMS ================= */}

            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              onPress={act.add}
            >
              <View
                style={[
                  styles.iconPill,
                  { backgroundColor: COLORS.brandBlueLight ?? "#EEF2FF" },
                ]}
              >
                <Text style={styles.icon}>＋</Text>
              </View>
              <Text style={styles.itemText}>Kelime Ekle</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              onPress={act.importTxt}
            >
              <View
                style={[
                  styles.iconPill,
                  { backgroundColor: COLORS.brandBlueLight ?? "#EEF2FF" },
                ]}
              >
                <Text style={styles.icon}>TXT</Text>
              </View>
              <Text style={styles.itemText}>TXT İçe Aktar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              onPress={act.manage}
            >
              <View
                style={[
                  styles.iconPill,
                  { backgroundColor: COLORS.brandBlueLight ?? "#EEF2FF" },
                ]}
              >
                <Text style={styles.icon}>≡</Text>
              </View>
              <Text style={styles.itemText}>Kelimeleri Yönet</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.item,
                styles.close,
                pressed && styles.pressed,
              ]}
              onPress={onClose}
            >
              <View
                style={[
                  styles.iconPill,
                  { backgroundColor: "rgba(15,23,42,0.06)" },
                ]}
              >
                <Text style={[styles.icon, { color: COLORS.text }]}>×</Text>
              </View>
              <Text style={[styles.itemText, { color: COLORS.text }]}>
                Kapat
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

/* ===========================
   AYARLAR
=========================== */
const UI = {
  sheetPad: 14,
  radius: 22,
  itemHeight: 54,
  itemRadius: 16,
  iconPill: 38,
  sideGap: 14,

  sheetMaxHeight: 340,
  menuOffsetUp: 90,
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop ?? "rgba(2,6,23,0.45)",
  },

  centerWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    paddingHorizontal: UI.sideGap,
    paddingBottom: UI.menuOffsetUp,
  },

  sheet: {
    width: "100%",
    maxHeight: UI.sheetMaxHeight,
    borderRadius: UI.radius,
    backgroundColor: COLORS.surface ?? COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    overflow: "hidden",
  },

  sheetInner: {
    padding: UI.sheetPad,
  },

  /* ================= HEADER ================= */

  header: {
    marginBottom: 12,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 12,
    backgroundColor: COLORS.brandBlue ?? COLORS.cardBlue,
  },

  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.2,
  },

  sub: {
    marginTop: 6,
    color: COLORS.muted,
    fontWeight: "700",
  },

  /* ================= ITEMS ================= */

  item: {
    height: UI.itemHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    borderRadius: UI.itemRadius,
    backgroundColor: "#F7F8FF",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  iconPill: {
    width: UI.iconPill,
    height: UI.iconPill,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
  },

  icon: {
    fontWeight: "900",
    color: COLORS.brandBlue ?? COLORS.cardBlue,
    fontSize: 12,
  },

  itemText: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.1,
  },

  close: {
    backgroundColor: COLORS.buttonSoft ?? "#EEF2FF",
  },
});