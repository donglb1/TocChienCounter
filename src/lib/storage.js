// src/lib/storage.js
// Lưu OFFLINE: tướng yêu thích + lịch sử phân tích. Dùng AsyncStorage (JSON).
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAV_KEY = "@tcc/favorites"; // mảng champion id
const HIST_KEY = "@tcc/history"; // mảng entry phân tích
const HIST_MAX = 30;

// ───────── Cache DATA LIVE (kèm timestamp để TTL) ─────────
// Dùng cho catalog item + roster tướng: đọc cache hiện ngay (kể cả offline),
// chỉ fetch mạng lại khi cache cũ hơn TTL. Lỗi storage → trả null, app fetch như thường.
const CACHE_PREFIX = "@tcc/cache/";

export async function getCached(key) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.fetchedAt !== "number") return null;
    return obj; // { data, fetchedAt }
  } catch (_) {
    return null;
  }
}

export async function setCached(key, data) {
  try {
    await AsyncStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, fetchedAt: Date.now() })
    );
  } catch (_) {}
}

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
