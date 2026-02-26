// App.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  Easing,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

// ✅ SAFE AREA
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { COLORS } from "./src/ui/colors";
import MenuDrawer from "./src/ui/MenuDrawer";
import ManageModal from "./src/ui/ManageModal";
import AddWordModal from "./src/ui/AddWordModal";
import ConfirmModal from "./src/ui/ConfirmModal"; // ✅ HEPSİNİ SİL confirm artık custom
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

/** ========= App (Root) ========= */
export default function App() {
  return (
    <SafeAreaProvider>
      <AppInner />
    </SafeAreaProvider>
  );
}

/** ========= App (Inner) ========= */
function AppInner() {
  const insets = useSafeAreaInsets();

  const [words, setWords] = useState<WordItem[]>([]);
  const [index, setIndex] = useState(0);

  // ✅ FLIP STATE
  const [flipped, setFlipped] = useState(false);

  // ✅ FLIP ANIM
  const flipAnim = useRef(new Animated.Value(0)).current; // 0=front, 180=back
  const flippingRef = useRef(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // ✅ 2 kere basınca sil
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [armedAt, setArmedAt] = useState(0);

  // ✅ PREMIUM NOTICE (OK'li)
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeTone, setNoticeTone] = useState<"info" | "success" | "error">(
    "info"
  );

  const showNotice = (
    title: string,
    message: string,
    tone: "info" | "success" | "error" = "info"
  ) => {
    setNoticeTitle(title);
    setNoticeMessage(message);
    setNoticeTone(tone);
    setNoticeOpen(true);
  };

  // ✅ PREMIUM CONFIRM (Hepsini Sil)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const loaded = await loadWords();
      setWords(loaded);
      setIndex(0);
      setFlipped(false);
      flipAnim.setValue(0);
      setArmedDeleteId(null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ===========================
  // Flip helpers
  // ===========================
  const animateFlipTo = (toValue: 0 | 180, onDone?: () => void) => {
    flippingRef.current = true;
    Animated.timing(flipAnim, {
      toValue,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      flippingRef.current = false;
      onDone?.();
    });
  };

  const resetToFront = () => {
    setFlipped(false);
    flipAnim.setValue(0);
  };

  // ===========================
  // Next
  // ===========================
  const goNext = () => {
    if (!words.length) return;
    resetToFront(); // ✅ Next => tekrar kelime
    setArmedDeleteId(null);
    setIndex((prev) => (prev + 1) % words.length);
  };

  // ===========================
  // Card Press (TOGGLE FLIP)
  // ===========================
  const onPressCard = () => {
    if (!current) return;
    if (flippingRef.current) return; // spam tıklamayı engelle

    const nextFlipped = !flipped;
    setFlipped(nextFlipped);
    animateFlipTo(nextFlipped ? 180 : 0);
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
    resetToFront();
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
        showNotice(
          "Bulunamadı",
          "TXT içinde uygun format bulunamadı.\nÖrnek: what:Ne",
          "error"
        );
        return;
      }

      const { merged, added } = mergeDedupe(words, parsed);
      await persist(merged);

      setIndex(0);
      resetToFront();
      setArmedDeleteId(null);

      // ✅ ESKİ Alert.alert yerine premium
      showNotice(
        "İçe aktarıldı",
        `${added} yeni kelime eklendi.\nToplam: ${merged.length}`,
        "success"
      );
    } catch (e: any) {
      showNotice("Hata", e?.message ?? "Dosya içe aktarma başarısız.", "error");
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
    resetToFront();
    setArmedDeleteId(null);
  };

  // ✅ ESKİ Alert.alert confirm yerine premium ConfirmModal
  const clearAll = async () => {
    if (!words.length) return;
    setClearConfirmOpen(true);
  };

  const confirmClearAll = async () => {
    setClearConfirmOpen(false);
    await persist([]);
    setIndex(0);
    resetToFront();
    setArmedDeleteId(null);
    setManageOpen(false);
    showNotice("Temizlendi", "Tüm kelimeler silindi.", "success");
  };

  // ===========================
  // Delete (2 kere bas)
  // ===========================
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

  // ===========================
  // Top Padding
  // ===========================
  const topPad = insets.top + UI.topBarExtraTop;

  // ===========================
  // Animated styles (3D Flip)
  // ===========================
  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0, 1],
  });

  const cardBg = flipped
    ? (COLORS.meaningBlue ?? "#60A5FA")
    : (COLORS.brandBlue ?? COLORS.cardBlue);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.brandBlue ?? COLORS.cardBlue}
        translucent={false}
      />

      {/* Top Bar */}
      <View style={[styles.topBarWrap, { paddingTop: topPad }]}>
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            onPress={() => setMenuOpen(true)}
          >
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
      </View>

      {/* Content */}
      <View style={styles.centerArea}>
        <Pressable
          style={[styles.card, { backgroundColor: cardBg }]}
          onPress={onPressCard}
          disabled={!current}
        >
          {/* ✅ Flip Faces */}
          <View style={styles.flipWrap}>
            {/* FRONT (word) */}
            <Animated.View
              style={[
                styles.face,
                {
                  opacity: frontOpacity,
                  transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
                },
              ]}
            >
              <Text style={styles.cardText}>
                {!current
                  ? "Henüz kelime yok.\nMenüden TXT içe aktar veya kelime ekle."
                  : current.word}
              </Text>
            </Animated.View>

            {/* BACK (meaning) */}
            <Animated.View
              style={[
                styles.face,
                styles.faceBack,
                {
                  opacity: backOpacity,
                  transform: [{ perspective: 1000 }, { rotateY: backRotate }],
                },
              ]}
            >
              <Text style={styles.cardText}>
                {!current
                  ? "Henüz kelime yok.\nMenüden TXT içe aktar veya kelime ekle."
                  : current.meaning}
              </Text>
            </Animated.View>
          </View>

          {!!current && (
            <View style={styles.cardFooter}>
              <View style={styles.progressPill}>
                <Text style={styles.progressText}>
                  {Math.min(index + 1, total)} / {total}
                </Text>
              </View>
            </View>
          )}
        </Pressable>

        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              styles.dangerBtn,
              (!current || !total) && styles.disabled,
              pressed && current && styles.pressedBtn,
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
            style={({ pressed }) => [
              styles.actionBtn,
              styles.primaryBtn,
              (!current || !total) && styles.disabled,
              pressed && current && styles.pressedBtn,
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

      {/* ✅ Premium OK Popup (Alert yerine) */}
      <NoticeModal
        visible={noticeOpen}
        title={noticeTitle}
        message={noticeMessage}
        tone={noticeTone}
        onClose={() => setNoticeOpen(false)}
      />

      {/* ✅ Premium Confirm (Hepsini Sil) */}
      <ConfirmModal
        visible={clearConfirmOpen}
        title="Hepsi silinsin mi?"
        message={`Tüm kelimeler kalıcı olarak silinecek.${words.length ? `\nToplam: ${words.length}` : ""}`}
        cancelText="Vazgeç"
        confirmText="Sil"
        danger
        onCancel={() => setClearConfirmOpen(false)}
        onConfirm={confirmClearAll}
      />
    </View>
  );
}

/* ===========================
   Premium OK Modal (tek dosyada)
=========================== */
function NoticeModal({
  visible,
  title,
  message,
  tone,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  tone: "info" | "success" | "error";
  onClose: () => void;
}) {
  const badgeBg =
    tone === "success"
      ? "rgba(34,197,94,0.14)"
      : tone === "error"
      ? "rgba(239,68,68,0.14)"
      : "rgba(79,70,229,0.14)";

  const badgeBorder =
    tone === "success"
      ? "rgba(34,197,94,0.28)"
      : tone === "error"
      ? "rgba(239,68,68,0.28)"
      : "rgba(79,70,229,0.28)";

  const badgeText =
    tone === "success"
      ? "#16A34A"
      : tone === "error"
      ? "#DC2626"
      : (COLORS.brandBlue ?? "#4F46E5");

  const badgeLabel = tone === "success" ? "✓" : tone === "error" ? "!" : "i";

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={noticeStyles.backdrop} onPress={onClose} />
      <View style={noticeStyles.center}>
        <View style={noticeStyles.card}>
          <View style={[noticeStyles.badge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
            <Text style={[noticeStyles.badgeText, { color: badgeText }]}>{badgeLabel}</Text>
          </View>

          <Text style={noticeStyles.title}>{title}</Text>
          <Text style={noticeStyles.msg}>{message}</Text>

          <Pressable style={({ pressed }) => [noticeStyles.okBtn, pressed && noticeStyles.pressed]} onPress={onClose}>
            <Text style={noticeStyles.okText}>Tamam</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const noticeStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backdrop ?? "rgba(2,6,23,0.45)",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    padding: 18,
  },
  card: {
    backgroundColor: COLORS.surface ?? COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  badge: {
    width: 42,
    height: 42,
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
  msg: {
    marginTop: 8,
    color: COLORS.muted,
    fontWeight: "700",
    lineHeight: 20,
  },
  okBtn: {
    marginTop: 14,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.buttonPrimary ?? COLORS.brandBlue ?? "#4F46E5",
  },
  okText: {
    color: COLORS.white,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
});

/* ===========================
   İnce Ayar Alanı
=========================== */
const UI = {
  pagePadX: 16,

  topBarExtraTop: Platform.OS === "ios" ? 8 : 10,
  topBarPaddingBottom: 12,
  topBarRadius: 22,

  cardMinHeight: 220,
  cardRadius: 26,
  centerPadBottom: 18,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  topBarWrap: {
    backgroundColor: COLORS.brandBlue ?? COLORS.cardBlue,
    paddingBottom: UI.topBarPaddingBottom,
    paddingHorizontal: UI.pagePadX,
    borderBottomLeftRadius: UI.topBarRadius,
    borderBottomRightRadius: UI.topBarRadius,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 18, fontWeight: "900", color: COLORS.white },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 2,
    color: "rgba(255,255,255,0.82)",
    fontWeight: "700",
    fontSize: 12,
  },

  countPill: {
    minWidth: 44,
    height: 34,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  countText: { fontWeight: "900", color: COLORS.white },

  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },

  centerArea: {
    flex: 1,
    paddingHorizontal: UI.pagePadX,
    paddingTop: 140, // (istersen bunu 90-110 arası yaparız)
    paddingBottom: UI.centerPadBottom,
    justifyContent: "flex-start",
  },

  card: {
    minHeight: UI.cardMinHeight,
    borderRadius: UI.cardRadius,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    overflow: "hidden",
  },

  // ✅ Flip container
  flipWrap: {
    width: "100%",
    minHeight: UI.cardMinHeight - 36,
    alignItems: "center",
    justifyContent: "center",
  },

  // ✅ Faces
  face: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    paddingHorizontal: 8,
  },
  faceBack: {},

  cardText: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 32,
  },

  cardFooter: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  progressPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  progressText: { color: COLORS.white, fontWeight: "900" },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pressedBtn: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  disabled: { opacity: 0.5 },

  dangerBtn: { backgroundColor: "rgba(239,68,68,0.92)" },
  primaryBtn: { backgroundColor: COLORS.black },
  actionText: { color: COLORS.white, fontWeight: "900" },

  deleteHint: {
    marginTop: 10,
    textAlign: "center",
    color: "#B91C1C",
    fontWeight: "900",
  },
});