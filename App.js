// App.js — điều hướng 3 màn bằng state (không cần react-navigation cho luồng tuyến tính này)
import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { C } from "./src/theme";
import { resolveDDragonVersion } from "./src/lib/images";
import SetupScreen from "./src/screens/SetupScreen";
import ConfirmScreen from "./src/screens/ConfirmScreen";
import ResultScreen from "./src/screens/ResultScreen";

export default function App() {
  const [screen, setScreen] = useState("setup"); // setup | confirm | result
  const [session, setSession] = useState({
    champ: "",
    lane: "",
    imageUri: null,
    enemies: [], // [{ name, displayName, confidence }]
    build: null, // kết quả analyze
  });

  // Lấy version Data Dragon mới nhất 1 lần khi mở app (cho icon tướng)
  useEffect(() => {
    resolveDDragonVersion();
  }, []);

  const patch = (next) => setSession((s) => ({ ...s, ...next }));

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <View style={styles.header}>
          <Text style={styles.brand}>
            TỐC CHIẾN <Text style={{ color: C.amber }}>COUNTER</Text>
          </Text>
          <Text style={styles.step}>
            {screen === "setup" ? "1 · Thiết lập" : screen === "confirm" ? "2 · Xác nhận" : "3 · Build"}
          </Text>
        </View>

        {screen === "setup" && (
          <SetupScreen
            session={session}
            patch={patch}
            onExtracted={() => setScreen("confirm")}
          />
        )}
        {screen === "confirm" && (
          <ConfirmScreen
            session={session}
            patch={patch}
            onBack={() => setScreen("setup")}
            onAnalyzed={() => setScreen("result")}
          />
        )}
        {screen === "result" && (
          <ResultScreen
            session={session}
            onRestart={() => {
              patch({ enemies: [], build: null, imageUri: null });
              setScreen("setup");
            }}
            onEditEnemies={() => setScreen("confirm")}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bgAlt,
  },
  brand: { color: C.text, fontWeight: "800", fontSize: 16, letterSpacing: 1 },
  step: { color: C.textDim, fontWeight: "700", fontSize: 12 },
});
