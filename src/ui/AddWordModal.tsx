// src/ui/AddWordModal.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { COLORS } from "./colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (word: string, meaning: string) => Promise<void> | void;
};

export default function AddWordModal({ visible, onClose, onSave }: Props) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");

  // ===========================
  // H1: Input refs (Enter ile akış)
  // ===========================
  const wordRef = useRef<TextInput>(null);
  const meaningRef = useRef<TextInput>(null);

  const canSave = useMemo(() => !!word.trim() && !!meaning.trim(), [word, meaning]);

  useEffect(() => {
    if (!visible) {
      setWord("");
      setMeaning("");
      return;
    }

    // ===========================
    // H2: Açılınca otomatik fokus
    // ===========================
    const t = setTimeout(() => wordRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [visible]);

  const handleSave = async () => {
    if (!word.trim() || !meaning.trim()) return;
    await onSave(word.trim(), meaning.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      {/* ===========================
          H3: StatusBar (Android üst bar mavi)
      =========================== */}
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.brandBlue}
      />

      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ===========================
            H4: Top Spacer (ince ayar)
        =========================== */}
        <View style={styles.topSpacer} />

        {/* ===========================
            H5: Header
        =========================== */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
            onPress={onClose}
          >
            <Text style={styles.headerBtnText}>Geri</Text>
          </Pressable>

          <Text style={styles.title}>Kelime Ekle</Text>

          <View style={{ width: 72 }} />
        </View>

        {/* ===========================
            H6: Card
        =========================== */}
        <View style={styles.card}>
          <Text style={styles.label}>English word</Text>
          <TextInput
            ref={wordRef}
            value={word}
            onChangeText={setWord}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="what"
            placeholderTextColor={META.placeholder}
            returnKeyType="next"
            onSubmitEditing={() => meaningRef.current?.focus()}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Türkçe anlam</Text>
          <TextInput
            ref={meaningRef}
            value={meaning}
            onChangeText={setMeaning}
            style={styles.input}
            placeholder="ne"
            placeholderTextColor={META.placeholder}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />

          {/* ===========================
              H7: Save Button (theme uyumlu)
              - cardGreen yoksa success kullan
          =========================== */}
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              !canSave && styles.saveBtnDisabled,
              pressed && canSave && styles.saveBtnPressed,
            ]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveText}>Kaydet</Text>
          </Pressable>

          <Text style={styles.hint}>İpucu: Aynı kelime varsa eklemez.</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ===========================
   H0: İnce Ayar Alanı
=========================== */
const UI = {
  topSpacerIOS: 8,
  topSpacerAndroid: 14,

  pagePaddingX: 16,
  headerGapBottom: 16,

  cardRadius: 20,
  cardPadding: 16,

  inputRadius: 14,
  inputPaddingY: 12,
  inputPaddingX: 12,

  btnRadius: 16,
  btnPaddingY: 14,
};

const META = {
  placeholder: "#94A3B8",
};

const styles = StyleSheet.create({
  /* ===========================
     H8: Wrap
  =========================== */
  wrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: UI.pagePaddingX,
  },

  /* ===========================
     H9: Top Spacer
  =========================== */
  topSpacer: {
    height: Platform.OS === "ios" ? UI.topSpacerIOS : UI.topSpacerAndroid,
  },

  /* ===========================
     H10: Header
  =========================== */
  header: {
    marginBottom: UI.headerGapBottom,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBtn: {
    width: 72,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  headerBtnText: {
    fontWeight: "900",
    color: COLORS.text,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: 0.2,
  },

  /* ===========================
     H11: Card
  =========================== */
  card: {
    backgroundColor: COLORS.white,
    borderRadius: UI.cardRadius,
    padding: UI.cardPadding,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  label: {
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#F8FAFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: UI.inputPaddingY,
    paddingHorizontal: UI.inputPaddingX,
    borderRadius: UI.inputRadius,
    fontWeight: "800",
    color: COLORS.text,
  },

  /* ===========================
     H12: Save Button
     - Hata bitirici: cardGreen yerine success fallback
  =========================== */
  saveBtn: {
    marginTop: 16,
    backgroundColor: (COLORS.cardGreen ?? COLORS.success) as any,
    paddingVertical: UI.btnPaddingY,
    borderRadius: UI.btnRadius,
    alignItems: "center",
  },
  saveBtnPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.2,
  },

  hint: {
    marginTop: 12,
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12,
  },
});