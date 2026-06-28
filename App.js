// App.js — điều hướng bằng thanh tab dưới (3 mục), mỗi tab có luồng con riêng.
// Tách buildSession và suggestSession để 2 luồng không lẫn dữ liệu của nhau.
import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { C, GRAD, glow } from "./src/theme";
// accent chủ đạo theo thiết kế = TÍM
const ACCENT = C.violet;
import { resolveDDragonVersion, resolveChampionRoster } from "./src/lib/images";
import { useVersionCheck } from "./src/lib/useVersionCheck";
import { resolveItemCatalog } from "./src/lib/api";
import { NewsProvider, useNews } from "./src/lib/newsContext";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { tapSelection } from "./src/lib/haptics";
import HomeScreen from "./src/screens/HomeScreen";
import SetupScreen from "./src/screens/SetupScreen";
import ConfirmScreen from "./src/screens/ConfirmScreen";
import ResultScreen from "./src/screens/ResultScreen";
import PickScreen from "./src/screens/PickScreen";
import SuggestSetupScreen from "./src/screens/SuggestSetupScreen";
import ChampScreen from "./src/screens/ChampScreen";
import BanScreen from "./src/screens/BanScreen";
import QuickCounterScreen from "./src/screens/QuickCounterScreen";
import HistoryScreen from "./src/screens/HistoryScreen";

const TABS = [
  { key: "home", label: "Tin tức", set: "ion", icon: "newspaper-outline", iconActive: "newspaper" },
  { key: "champ", label: "Tướng", set: "ion", icon: "library-outline", iconActive: "library" },
  { key: "ban", label: "Cấm", set: "ion", icon: "ban-outline", iconActive: "ban" },
  { key: "counter", label: "1v1", set: "mci", icon: "sword-cross", iconActive: "sword-cross" },
  { key: "build", label: "Build", set: "ion", icon: "construct-outline", iconActive: "construct" },
  { key: "suggest", label: "Đội hình", set: "ion", icon: "people-outline", iconActive: "people" },
];

const EMPTY_BUILD = { champ: "", lane: "", imageUri: null, enemies: [], build: null };
const EMPTY_SUGGEST = { lane: "", allies: [], enemies: [], build: null, champ: "" };

export default function App() {
  return (
    <ErrorBoundary>
      <NewsProvider>
        <AppShell />
      </NewsProvider>
    </ErrorBoundary>
  );
}

function AppShell() {
  const [tab, setTab] = useState("home");

  // Luồng BUILD: setup → confirm → (picks | result)
  const [buildScreen, setBuildScreen] = useState("setup");
  const [buildSession, setBuildSession] = useState(EMPTY_BUILD);
  const patchBuild = (n) => setBuildSession((s) => ({ ...s, ...n }));

  // Luồng SUGGEST: input → picks → result
  const [suggestScreen, setSuggestScreen] = useState("input");
  const [suggestSession, setSuggestSession] = useState(EMPTY_SUGGEST);
  const patchSuggest = (n) => setSuggestSession((s) => ({ ...s, ...n }));

  useVersionCheck();
  const { patch } = useNews(); // news fetch 1 lần ở NewsProvider, dùng chung với HomeScreen
  useEffect(() => {
    resolveDDragonVersion().then(() => resolveChampionRoster());
    resolveItemCatalog(); // nạp catalog item Wild Rift (tên + icon thật) tự bám patch
  }, []);

  const stepLabel = () => {
    if (tab === "home") return "Tin tức";
    if (tab === "champ") return "Thư viện tướng";
    if (tab === "ban") return "Đề xuất cấm";
    if (tab === "counter") return "Khắc chế 1v1";
    if (tab === "build") {
      return buildScreen === "setup" ? "1 · Thiết lập"
        : buildScreen === "confirm" ? "2 · Xác nhận"
        : buildScreen === "picks" ? "Gợi ý tướng"
        : "3 · Build";
    }
    return suggestScreen === "input" ? "Nhập đội hình"
      : suggestScreen === "picks" ? "Gợi ý tướng"
      : "Build khắc chế";
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <LinearGradient
          colors={GRAD.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* gạch gradient cyan→tím glow ở mép dưới-trái header */}
          <LinearGradient
            colors={GRAD.accentBar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerAccentBar}
          />
          <View>
            <Text style={styles.brand}>
              TỐC CHIẾN <Text style={styles.brandAccent}>COUNTER</Text>
            </Text>
            {patch ? (
              <View style={styles.patchChip}>
                <View style={styles.patchDot} />
                <Text style={styles.patchText}>PATCH {patch}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.step}>{stepLabel()}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {tab === "home" && <HomeScreen />}
          {tab === "champ" && <ChampScreen />}
          {tab === "ban" && <BanScreen />}
          {tab === "counter" && <QuickCounterScreen />}

          {tab === "build" && buildScreen === "setup" && (
            <SetupScreen
              session={buildSession}
              patch={patchBuild}
              onExtracted={() => setBuildScreen("confirm")}
              onHistory={() => setBuildScreen("history")}
            />
          )}
          {tab === "build" && buildScreen === "history" && (
            <HistoryScreen
              onBack={() => setBuildScreen("setup")}
              onOpen={(entry) => {
                setBuildSession({
                  champ: entry.champ,
                  lane: entry.lane,
                  imageUri: null,
                  enemies: (entry.enemies || []).map((name) => ({ name, displayName: name, confidence: "high" })),
                  build: entry.build,
                });
                setBuildScreen("result");
              }}
            />
          )}
          {tab === "build" && buildScreen === "confirm" && (
            <ConfirmScreen
              session={buildSession}
              patch={patchBuild}
              onBack={() => setBuildScreen("setup")}
              onAnalyzed={() => setBuildScreen("result")}
              onSuggestPicks={() => setBuildScreen("picks")}
            />
          )}
          {tab === "build" && buildScreen === "picks" && (
            <PickScreen
              session={buildSession}
              patch={patchBuild}
              onBack={() => setBuildScreen("confirm")}
              onShowBuild={() => setBuildScreen("result")}
            />
          )}
          {tab === "build" && buildScreen === "result" && (
            <ResultScreen
              session={buildSession}
              onRestart={() => {
                setBuildSession(EMPTY_BUILD);
                setBuildScreen("setup");
              }}
              onEditEnemies={() => setBuildScreen("confirm")}
            />
          )}

          {tab === "suggest" && suggestScreen === "input" && (
            <SuggestSetupScreen
              session={suggestSession}
              patch={patchSuggest}
              onGo={() => setSuggestScreen("picks")}
            />
          )}
          {tab === "suggest" && suggestScreen === "picks" && (
            <PickScreen
              session={suggestSession}
              patch={patchSuggest}
              onBack={() => setSuggestScreen("input")}
              onShowBuild={() => setSuggestScreen("result")}
            />
          )}
          {tab === "suggest" && suggestScreen === "result" && (
            <ResultScreen
              session={suggestSession}
              onRestart={() => {
                setSuggestSession(EMPTY_SUGGEST);
                setSuggestScreen("input");
              }}
              onEditEnemies={() => setSuggestScreen("input")}
            />
          )}
        </View>

        <View style={styles.tabBar}>
          {TABS.map((t) => {
            const active = tab === t.key;
            const Icon = t.set === "mci" ? MaterialCommunityIcons : Ionicons;
            return (
              <TouchableOpacity
                key={t.key}
                style={styles.tabItem}
                onPress={() => { if (!active) tapSelection(); setTab(t.key); }}
                activeOpacity={0.7}
              >
                {active && <View style={styles.tabAccent} />}
                <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
                  <Icon
                    name={active ? t.iconActive : t.icon}
                    size={22}
                    color={active ? ACCENT : C.textFaint}
                  />
                </View>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerAccentBar: {
    position: "absolute", left: 0, bottom: -1, width: 64, height: 2,
    ...glow(C.violet, 8, 0.9),
  },
  brand: { color: C.text, fontWeight: "900", fontSize: 17, letterSpacing: 1.5 },
  brandAccent: { color: C.cyan, textShadowColor: C.cyan, textShadowRadius: 10, textShadowOffset: { width: 0, height: 0 } },
  patchChip: {
    flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5,
    alignSelf: "flex-start", backgroundColor: "rgba(39,227,255,0.08)",
    borderWidth: 1, borderColor: C.cyanDim, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  patchDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.cyan, ...glow(C.cyan, 6, 0.9) },
  patchText: { color: C.cyan, fontWeight: "800", fontSize: 10, letterSpacing: 0.5 },
  step: { color: C.textDim, fontWeight: "700", fontSize: 12 },
  content: { flex: 1 },
  tabBar: {
    flexDirection: "row", borderTopWidth: 1, borderTopColor: C.border,
    backgroundColor: "rgba(10,8,18,0.92)", paddingTop: 9, paddingBottom: 7,
  },
  tabItem: { flex: 1, alignItems: "center", gap: 3 },
  tabAccent: {
    position: "absolute", top: -9, width: 30, height: 3, borderRadius: 2,
    backgroundColor: ACCENT, ...glow(ACCENT, 8, 0.9),
  },
  tabIconWrap: { width: 40, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tabIconWrapActive: { backgroundColor: "rgba(168,85,247,0.12)", ...glow(ACCENT, 10, 0.4) },
  tabLabel: { color: C.textFaint, fontSize: 11, fontWeight: "700" },
  tabLabelActive: { color: ACCENT },
});
