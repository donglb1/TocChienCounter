// src/lib/newsContext.js
// Fetch tin tức Tốc Chiến 1 LẦN cho cả app: header (số patch) lẫn HomeScreen (feed)
// cùng dùng chung 1 nguồn, tránh gọi /api/news hai lần lúc khởi động.
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchNews } from "./api";

const NewsContext = createContext(null);

export function NewsProvider({ children }) {
  const [news, setNews] = useState([]);
  const [patch, setPatch] = useState(null);
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (isRefresh) => {
    if (!isRefresh) setLoading(true);
    setError("");
    try {
      const data = await fetchNews();
      setNews(data.news || []);
      setPatch(data.patch || null);
      setFallbackUrl(data.fallbackUrl || "");
      if ((data.news || []).length === 0) setError("Chưa lấy được tin lúc này.");
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(false); }, [load]);

  return (
    <NewsContext.Provider value={{ news, patch, fallbackUrl, loading, error, reload: load }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  return useContext(NewsContext);
}
