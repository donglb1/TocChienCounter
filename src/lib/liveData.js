// src/lib/liveData.js
// Kho trạng thái DATA LIVE (item catalog + metadata tướng) nạp 1 lần lúc app mở.
// Module TRUNG LẬP: không import items/champions/api → tránh circular import.
// - Item: từ backend /api/items (cào lolwildriftbuild.com) → tên + icon Wild Rift thật.
// - Tướng: metadata suy ra từ DDragon (tags + info) cho tướng mới chưa có trong DB tĩnh.

import { nameKey } from "../theme";

// ─── ITEM LIVE ───
let ITEM_BY_NAME = {}; // nameKey(name) → { slug, name, icon, tier, type }
let ITEM_BY_SLUG = {}; // slug → { slug, name, icon, tier, type }
let ITEM_COUNT = 0;

// Suy ra type thô từ slug/tier (đủ để tô màu gem; AI vẫn tự biết item nên không cần desc)
function inferItemType(slug, tier) {
  const s = String(slug || "");
  if (/(boots|greaves|treads|sandals|tabi|steelcaps)/.test(s)) return "boots";
  if (tier === "Enchantments" || /-enchant$/.test(s)) return "boots";
  return "situational";
}

export function setLiveItems(list) {
  const byName = {};
  const bySlug = {};
  for (const it of list || []) {
    if (!it || !it.name) continue;
    const entry = {
      slug: it.slug,
      name: it.name,
      icon: it.icon || null,
      tier: it.tier || null,
      type: inferItemType(it.slug, it.tier),
    };
    byName[nameKey(it.name)] = entry;
    if (it.slug) bySlug[it.slug] = entry;
  }
  ITEM_BY_NAME = byName;
  ITEM_BY_SLUG = bySlug;
  ITEM_COUNT = Object.keys(bySlug).length;
  return ITEM_COUNT;
}

export function getLiveItemByName(name) {
  if (!name) return null;
  return ITEM_BY_NAME[nameKey(name)] || null;
}
export function getLiveItemBySlug(slug) {
  if (!slug) return null;
  return ITEM_BY_SLUG[String(slug).toLowerCase()] || null;
}
export function liveItemCount() {
  return ITEM_COUNT;
}

// ─── METADATA TƯỚNG LIVE (từ DDragon) ───
let CHAMP_META = {}; // nameKey(name) → { dmg, role }

const TAG_ROLE = {
  Fighter: "Fighter",
  Tank: "Tank",
  Mage: "Mage",
  Assassin: "Assassin",
  Marksman: "Marksman",
  Support: "Support",
};

// info: { attack, magic } (0–10) → AD | AP | mixed
function inferDamage(info) {
  const a = Number(info?.attack) || 0;
  const m = Number(info?.magic) || 0;
  if (a >= m + 2) return "AD";
  if (m >= a + 2) return "AP";
  return "mixed";
}

// raw: { [id]: { name, tags, info } } từ DDragon champion.json
export function setLiveChampMeta(raw) {
  const map = {};
  for (const k in raw || {}) {
    const c = raw[k];
    if (!c || !c.name) continue;
    map[nameKey(c.name)] = {
      dmg: inferDamage(c.info),
      role: (c.tags || []).map((t) => TAG_ROLE[t]).find(Boolean) || null,
    };
  }
  CHAMP_META = map;
  return Object.keys(map).length;
}

export function getLiveChampMeta(name) {
  if (!name) return null;
  return CHAMP_META[nameKey(name)] || null;
}
