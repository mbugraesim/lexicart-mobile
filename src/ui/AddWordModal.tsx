import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
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

  useEffect(() => {
    if (!visible) {
      setWord("");
      setMeaning("");
    }
  }, [visible]);

  const handleSave = async () => {
    if (!word.trim() || !meaning.trim()) return;
    await onSave(word.trim(), meaning.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable style={styles.headerBtn} onPress={onClose}>
            <Text style={styles.headerBtnText}>Geri</Text>
          </Pressable>

          <Text style={styles.title}>Kelime Ekle</Text>

          <View style={{ width: 64 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>English word</Text>
          <TextInput
            value={word}
            onChangeText={setWord}
            style={styles.input}
            autoCapitalize="none"
            placeholder="what"
            placeholderTextColor="#94A3B8"
          />

          <Text style={[styles.label, { marginTop: 14 }]}>
            Türkçe anlam
          </Text>
          <TextInput
            value={meaning}
            onChangeText={setMeaning}
            style={styles.input}
            placeholder="ne"
            placeholderTextColor="#94A3B8"
          />

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>Kaydet</Text>
          </Pressable>

          <Text style={styles.hint}>
            İpucu: Aynı kelime varsa eklemez.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 16,
    paddingTop: 50, // 🔥 BURAYI değiştirerek yukarı–aşağı ayarlarsın
  },
  header: {
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 64,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  headerBtnText: {
    fontWeight: "900",
    color: COLORS.text,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    padding: 12,
    borderRadius: 12,
    fontWeight: "800",
    color: COLORS.text,
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: COLORS.cardGreen,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: {
    color: COLORS.white,
    fontWeight: "900",
  },
  hint: {
    marginTop: 12,
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12,
  },
});