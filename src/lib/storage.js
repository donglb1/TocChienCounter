// src/lib/storage.js
// Lưu OFFLINE: tướng yêu thích + lịch sử phân tích. Dùng AsyncStorage (JSON).
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAV_KEY = "@tcc/favorites"; // mảng champion id
const HIST_KEY = "@tcc/history"; // mảng entry phân tích
const HIST_MAX = 30;

// ───────── Tướng yêu thích ─────────
export async function getFavorites() {
  try {
    const raw = await AsyncStorage.getItem(FAV_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function toggleFavorite(id) {
  const favs = await getFavorites();
  const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
  try {
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(next));
  } catch (_) {}
  return next;
}

// ───────── Lịch sử phân tích ─────────
// entry: { id, ts, champ, lane, enemies:[name], build }
export async function addHistory(entry) {
  try {
    const hist = await getHistory();
    const withId = { ...entry, id: `${Date.now()}`, ts: Date.now() };
    const next = [withId, ...hist].slice(0, HIST_MAX);
    await AsyncStorage.setItem(HIST_KEY, JSON.stringify(next));
    return next;
  } catch (_) {
    return [];
  }
}

export async function getHistory() {
  try {
    const raw = await AsyncStorage.getItem(HIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(HIST_KEY);
  } catch (_) {}
  return [];
}
