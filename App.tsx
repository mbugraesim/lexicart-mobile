import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import { COLORS } from "./src/ui/colors";
import MenuDrawer from "./src/ui/MenuDrawer";
import ManageModal from "./src/ui/ManageModal";
import AddWordModal from "./src/ui/AddWordModal";
import { parseTxt } from "./src/utils/parseTxt";

/** ========= Types & Storage ========= */
type WordItem = {
  id: string;
  word: string;
  meaning: string;
  createdAt: number;
};

const KEY = "LEXIKART_WORDS_V1";

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

async function loadWords(): Promise<WordItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as WordItem[];
    return [];
  } catch {
    return [];
  }
}

async function saveWords(words: WordItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(words));
}

function mergeDedupe(
  existing: WordItem[],
  incoming: { word: string; meaning: string }[]
) {
  const map = new Map<string, WordItem>();

  for (const w of existing) {
    map.set(w.word.trim().toLowerCase(), w);
  }

  let added = 0;

  for (const it of incoming) {
    const key = it.word.trim().toLowerCase();
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, {
        id: makeId(),
        word: it.word.trim(),
        meaning: it.meaning.trim(),
        createdAt: Date.now(),
      });
      added++;
    }
  }

  const merged = Array.from(map.values()).sort(
    (a, b) => a.createdAt - b.createdAt
  );
  return { merged, added };
}

/** ========= App ========= */
export default function App() {
  const topPad =
    Platform.OS === "android" ? StatusBar.currentHeight ?? 10 : 10;

  const [words, setWords] = useState<WordItem[]>([]);
  const [index, setIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // ✅ 2 kere basınca sil
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [armedAt, setArmedAt] = useState(0);

  useEffect(() => {
    (async () => {
      const loaded = await loadWords();
      setWords(loaded);
      setIndex(0);
      setShowMeaning(false);
      setArmedDeleteId(null);
    })();
  }, []);

  const total = words.length;

  const current = useMemo(() => {
    if (!words.length) return null;
    const safeIndex = Math.min(index, words.length - 1);
    return words[safeIndex];
  }, [words, index]);

  const persist = async (next: WordItem[]) => {
    setWords(next);
    await saveWords(next);
  };

  const goNext = () => {
    if (!words.length) return;
    setShowMeaning(false);
    setArmedDeleteId(null);
    setIndex((prev) => (prev + 1) % words.length);
  };

  const toggleCard = () => {
    if (!current) return;
    setShowMeaning((p) => !p);
  };

  const openAdd = () => {
    setMenuOpen(false);
    setTimeout(() => Keyboard.dismiss(), 0);
    setAddModalOpen(true);
  };

  const addOneWord = async (word: string, meaning: string) => {
    const w = word.trim();
    const m = meaning.trim();

    if (!w || !m) {
      Alert.alert("Eksik", "Kelime ve anlam boş olamaz.");
      return;
    }

    const key = w.toLowerCase();
    const exists = words.some((x) => x.word.trim().toLowerCase() === key);
    if (exists) {
      Alert.alert("Zaten var", "Bu kelime zaten listede.");
      return;
    }

    const next = [
      ...words,
      { id: makeId(), word: w, meaning: m, createdAt: Date.now() },
    ];

    await persist(next);
    setAddModalOpen(false);

    setIndex(next.length - 1);
    setShowMeaning(false);
    setArmedDeleteId(null);
  };

  const importTxt = async () => {
    try {
      setMenuOpen(false);

      const result = await DocumentPicker.getDocumentAsync({
        type: "text/plain",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file?.uri) return;

      const content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: "utf8",
      });

      const parsed = parseTxt(content);
      if (!parsed.length) {
        Alert.alert(
          "Bulunamadı",
          "TXT içinde uygun format bulunamadı.\nÖrnek: what:Ne"
        );
        return;
      }

      const { merged, added } = mergeDedupe(words, parsed);
      await persist(merged);

      setIndex(0);
      setShowMeaning(false);
      setArmedDeleteId(null);

      Alert.alert(
        "İçe aktarıldı",
        `${added} yeni kelime eklendi.\nToplam: ${merged.length}`
      );
    } catch (e: any) {
      Alert.alert("Hata", e?.message ?? "Dosya içe aktarma başarısız.");
    }
  };

  const openManage = () => {
    setMenuOpen(false);
    setManageOpen(true);
  };

  const deleteOne = async (id: string) => {
    const next = words.filter((w) => w.id !== id);
    await persist(next);

    setIndex((prev) => {
      if (!next.length) return 0;
      return Math.min(prev, next.length - 1);
    });
    setShowMeaning(false);
    setArmedDeleteId(null);
  };

  const clearAll = async () => {
    Alert.alert("Emin misin?", "Tüm kelimeler silinecek.", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await persist([]);
          setIndex(0);
          setShowMeaning(false);
          setArmedDeleteId(null);
          setManageOpen(false);
        },
      },
    ]);
  };

  const cardBg = showMeaning ? COLORS.cardGreen : COLORS.cardBlue;

  // ✅ Sil: 2 kere basınca silsin (BURASI)
  const pressDeleteCurrent = async () => {
    if (!current) return;

    const now = Date.now();
    const same = armedDeleteId === current.id;
    const within = now - armedAt <= 2500;

    if (same && within) {
      await deleteOne(current.id);
      return;
    }

    setArmedDeleteId(current.id);
    setArmedAt(now);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: topPad }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.iconBtn} onPress={() => setMenuOpen(true)}>
          <Text style={styles.iconText}>☰</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>LexiKart</Text>
          <Text style={styles.subtitle}>
            Dokun: kelime/anlam • Next: sıradaki
          </Text>
        </View>

        <View style={styles.countPill}>
          <Text style={styles.countText}>{total}</Text>
        </View>
      </View>

      {/* Kart + Butonlar */}
      <View style={styles.centerArea}>
        <Pressable
          style={[styles.card, { backgroundColor: cardBg }]}
          onPress={toggleCard}
          disabled={!current}
        >
          <Text style={styles.cardText}>
            {!current
              ? "Henüz kelime yok.\nMenüden TXT içe aktar veya kelime ekle."
              : showMeaning
              ? current.meaning
              : current.word}
          </Text>
        </Pressable>

        <View style={styles.actionsRow}>
          <Pressable
            style={[
              styles.actionBtn,
              { backgroundColor: "#111827", opacity: current ? 1 : 0.5 },
            ]}
            onPress={pressDeleteCurrent}
            disabled={!current}
          >
            <Text style={styles.actionText}>
              {armedDeleteId && current?.id === armedDeleteId
                ? "Tekrar Bas"
                : "Sil"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.actionBtn,
              { backgroundColor: COLORS.black, opacity: current ? 1 : 0.5 },
            ]}
            onPress={goNext}
            disabled={!current}
          >
            <Text style={styles.actionText}>Next</Text>
          </Pressable>
        </View>

        {armedDeleteId && current?.id === armedDeleteId && (
          <Text style={styles.deleteHint}>
            Silmek için 2. kez bas (2.5 sn içinde)
          </Text>
        )}
      </View>

      <MenuDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenAdd={openAdd}
        onImportTxt={importTxt}
        onManage={openManage}
      />

      <ManageModal
        visible={manageOpen}
        onClose={() => setManageOpen(false)}
        words={words}
        onDeleteOne={deleteOne}
        onClearAll={clearAll}
      />

      <AddWordModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={addOneWord}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  title: { fontSize: 24, fontWeight: "900", color: COLORS.text },
  subtitle: {
    marginTop: 2,
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  countPill: {
    minWidth: 44,
    height: 34,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countText: { fontWeight: "900", color: COLORS.text },

  // ✅ Kartın yeri (BURASI)
  centerArea: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 200,
  },

  card: {
    minHeight: 220,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  cardText: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 30,
  },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: { color: COLORS.white, fontWeight: "900" },

  deleteHint: {
    marginTop: 10,
    textAlign: "center",
    color: "#B91C1C",
    fontWeight: "800",
  },
});