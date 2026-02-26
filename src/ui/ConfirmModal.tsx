// src/ui/ConfirmModal.tsx
import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "./colors";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  cancelText = "Vazgeç",
  confirmText = "Sil",
  danger = true,
  onCancel,
  onConfirm,
}: Props) {
  const meta = useMemo(() => {
    const badgeBg = danger ? "rgba(239,68,68,0.14)" : "rgba(79,70,229,0.14)";
    const badgeBorder = danger
      ? "rgba(239,68,68,0.28)"
      : "rgba(79,70,229,0.28)";
    const badgeText = danger ? "#DC2626" : (COLORS.brandBlue ?? "#4F46E5");
    const badgeChar = danger ? "!" : "i";

    return { badgeBg, badgeBorder, badgeText, badgeChar };
  }, [danger]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel} />

      <View style={styles.center}>
        <View style={styles.card}>
          {/* Badge */}
          <View
            style={[
              styles.badge,
              { backgroundColor: meta.badgeBg, borderColor: meta.badgeBorder },
            ]}
          >
            <Text style={[styles.badgeText, { color: meta.badgeText }]}>
              {meta.badgeChar}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {!!message && <Text style={styles.message}>{message}</Text>}

          {/* Buttons */}
          <View style={styles.row}>
            <Pressable
              style={({ pressed }) => [
                styles.btn,
                styles.btnGhost,
                pressed && styles.pressed,
              ]}
              onPress={onCancel}
            >
              <Text style={[styles.btnText, styles.ghostText]}>
                {cancelText}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.btn,
                danger ? styles.btnDanger : styles.btnPrimary,
                danger && styles.btnDangerGlow,
                pressed && styles.pressed,
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.btnText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* ===========================
   İnce Ayar
=========================== */
const UI = {
  radius: 20,
  pad: 16,
  btnRadius: 14,
  badge: 42,
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop ?? "rgba(2,6,23,0.45)",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: COLORS.surface ?? COLORS.white,
    borderRadius: UI.radius,
    padding: UI.pad,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  badge: {
    width: UI.badge,
    height: UI.badge,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 10,
  },
  badgeText: {
    fontWeight: "900",
    fontSize: 18,
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  message: {
    marginTop: 8,
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 20,
  },

  row: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  btn: {
    minWidth: 110,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: UI.btnRadius,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: {
    backgroundColor: COLORS.buttonSoft ?? "#EEF2FF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ghostText: {
    color: COLORS.text,
  },
  btnPrimary: {
    backgroundColor: COLORS.buttonPrimary ?? COLORS.brandBlue ?? "#4F46E5",
  },
  btnDanger: {
    backgroundColor: "rgba(239,68,68,0.96)",
  },

  // ✅ küçük “glow” hissi
  btnDangerGlow: {
    shadowColor: "#EF4444",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  btnText: {
    color: COLORS.white,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
});