# Tốc Chiến Counter — Mobile App (Expo)

App native Android/iOS cho Liên Minh: Tốc Chiến (Wild Rift): đọc team địch từ ảnh chụp →
đề xuất build + ngọc + phép khắc chế, gợi ý tướng nên pick/ban, tra cứu tướng & trang bị,
và cập nhật tin tức/tier list/build **tự bám theo patch**.

---

## Tính năng (6 tab)

| Tab | Màn | Mô tả |
|-----|-----|-------|
| **Tin tức** | `HomeScreen` | Feed tin Tốc Chiến cào từ trang chính thức + số patch hiện tại. Chạm để mở trong app. |
| **Tướng** | `ChampScreen` | Thư viện tướng: build chuẩn theo archetype (offline) + build thật cào theo patch, tier list, lọc theo đường, yêu thích. Tướng mới tự xuất hiện từ tier list. |
| **Cấm** | `BanScreen` | Đề xuất tướng **nên ban theo meta**. Ưu tiên **số liệu thật** (win/pick/ban rate cào op.gg) → ban-score. Fallback: tier list + độ nguy hiểm (threat). Offline: chỉ threat. Lọc theo đường + cảnh báo dữ liệu lệch patch. |
| **1v1** | `QuickCounterScreen` | Tra khắc chế đối lane tức thì (offline): đồ mua sớm + mẹo đi đường. Nút AI gợi ý tướng pick để khắc đối thủ. |
| **Build** | `Setup → Confirm → Result` | Nạp ảnh màn chọn tướng/loading (**nút "Lấy ảnh vừa chụp"** lấy thẳng screenshot mới nhất, khỏi mở gallery) → AI **tự nhận tướng bạn đang chơi + đường + team địch** từ ảnh, tự điền sẵn (vẫn sửa tay được) → xác nhận → build khắc chế từng bước có lý do + phương án thay thế. Có lịch sử phân tích. |
| **Đội hình** | `SuggestSetup → Pick → Result` | Nhập đồng đội + địch ở màn cấm/chọn → gợi ý tướng nên pick. Phân tích offline tức thì: profile AD/AP đội mình, lỗ hổng vai trò. |

Chạm bất kỳ **trang bị** nào (màn Build / Thư viện) → xem chi tiết: tên Việt/Anh, loại, mô tả thuộc tính.

---

## Cấu trúc

```
toc-chien-counter/
├── App.js                       # tab bar 6 mục + điều hướng luồng con + ErrorBoundary + NewsProvider
├── app.json / eas.json          # cấu hình Expo / EAS build
├── src/
│   ├── theme.js                 # màu HUD, glow, nameKey/slugify (chuẩn hóa tên), danh sách đường
│   ├── data/
│   │   ├── champions.js         # DB tướng gắn thẻ (AD/AP/role/cc/healing/threat) + build-identity
│   │   ├── items.js             # DB trang bị (tên Việt/Anh, type, tags, desc) + allowlist + lọc theo hệ
│   │   ├── runes.js             # DB ngọc + phép bổ trợ (tên Việt/Anh + khi nào dùng)
│   │   └── buildTemplates.js    # build mẫu offline theo 12 archetype
│   ├── lib/
│   │   ├── api.js               # gọi backend (BACKEND_URL ở đây) + resolve catalog item live
│   │   ├── images.js            # icon tướng/item từ Data Dragon + version + roster live
│   │   ├── liveData.js          # store reactive (useSyncExternalStore) cho catalog/roster live
│   │   ├── storage.js           # AsyncStorage: cache TTL (cachedResolve), yêu thích, lịch sử
│   │   ├── newsContext.js       # fetch tin tức 1 lần, dùng chung header + HomeScreen
│   │   ├── draftAnalysis.js     # phân tích đội hình offline (profile đội) + xếp hạng ban theo meta
│   │   ├── matchup.js           # mẹo khắc chế 1v1 offline theo đặc tính địch
│   │   ├── repairJson.js        # cứu JSON model trả bị cắt/lỗi
│   │   └── useVersionCheck.js   # nhắc cập nhật app khi version cũ
│   ├── components/              # GradientButton, neon, inputs (LanePicker/ChampSearch),
│   │   └─                         ItemDetailModal, ErrorBoundary
│   └── screens/                 # 10 màn (xem bảng tính năng)
└── backend/                     # Vercel serverless — giữ ANTHROPIC_API_KEY ở server
    └── api/
        ├── analyze.js           # AI: extract (vision) | analyze (build) | suggest (pick tướng)
        ├── champbuild.js        # cào build thật 1 tướng theo patch
        ├── items.js             # cào catalog item Wild Rift (tên + icon thật)
        ├── tierlist.js          # cào tier list theo patch
        ├── wrstats.js           # cào win/pick/ban rate (op.gg) → xếp hạng tướng nên cấm
        ├── news.js              # cào tin tức + dò số patch
        └── version.js           # version tối thiểu (ép update app)
```

---

## Dữ liệu LIVE (tự bám patch, không cần sửa tay)

App cào dữ liệu qua backend rồi cache theo TTL (cache-first: hiện ngay kể cả offline):

- **Icon + tên item Wild Rift thật** — từ `backend/api/items` (cào lolwildriftbuild.com). Fallback: icon LoL PC (Data Dragon) → ô gem viết tắt.
- **Build thật theo patch** — `backend/api/champbuild`, map slug → DB; fallback build mẫu offline.
- **Tier list + tướng mới** — `backend/api/tierlist`; tướng chưa có trong DB tĩnh tự xuất hiện.
- **Tin tức + số patch** — `backend/api/news`.
- **Roster + version Data Dragon** — icon tướng tự lấy bản mới nhất.

Vì là store reactive, dữ liệu về tới đâu màn tự cập nhật icon/tên tới đó.

---

## ⚠ 2 việc PHẢI làm trước khi app chạy AI

1. **Deploy backend** (`backend/`) lên Vercel + set env `ANTHROPIC_API_KEY`. Đừng bao giờ nhét key vào client.
2. **Sửa `BACKEND_URL`** trong `src/lib/api.js` thành URL backend vừa deploy.
   (Hiện đang trỏ `https://tocchiencounter.vercel.app`.)

---

## Chạy app (dev) trên máy local

```bash
npm install
npx expo start
```

Quét QR bằng app **Expo Go** trên điện thoại (máy + điện thoại cùng wifi).

> Chạy backend **local** thì `BACKEND_URL` phải là **IP máy tính** (vd `http://192.168.1.10:3000`),
> KHÔNG dùng `localhost` — điện thoại không hiểu localhost của máy.

---

## Deploy backend (Vercel)

```bash
cd backend
npx vercel                              # deploy lần đầu
npx vercel env add ANTHROPIC_API_KEY    # dán API key vào
npx vercel --prod                       # deploy production
```

Lấy URL `https://xxx.vercel.app` → bỏ vào `BACKEND_URL` trong `src/lib/api.js`.

### Đổi model AI
Trong `backend/api/analyze.js` (mặc định cả hai dùng `claude-sonnet-4-6` cho nhanh + rẻ):
- `EXTRACT_MODEL` — đọc ảnh team địch (vision). Đọc sai nhiều → đổi `claude-opus-4-8` (chính xác hơn, chậm hơn).
- `ANALYZE_MODEL` — phân tích build + gợi ý pick (text).

Khâu đọc ảnh muốn rẻ hơn nữa: `claude-haiku-4-5-20251001` (đánh đổi độ chính xác trên ảnh khó).

---

## Build APK (cài máy thật / chia sẻ)

```bash
npm install -g eas-cli
eas login
eas build:configure
npx eas-cli build --platform android --profile preview   # ra file .apk
npx eas-cli update --branch preview --message "..."       # OTA update source JS
```

---

## Cập nhật DB tĩnh

DB tĩnh là phần "lõi" có gắn thẻ để AI phân tích chính xác (live data chỉ bù tên/icon/build):

- `src/data/champions.js` — tướng + thẻ `damageType/role/burst/cc/healing/threat` + build-identity. Tướng mới vẫn tự hiện qua tier list, nhưng thêm vào đây thì AI phân tích sâu hơn (matchup, đồ lõi).
- `src/data/items.js` — trang bị: `name` (Anh, dùng làm allowlist), `vi`, `type`, `tags`, `desc`. `ITEM_ALLOWLIST` và catalog gửi AI tự sinh từ `ITEMS`.
- `src/data/runes.js` — ngọc + phép bổ trợ (tên Việt/Anh + gợi ý khi nào dùng).

Tên hiển thị khớp bằng `nameKey()` (bỏ dấu + ký tự đặc biệt) nên chịu được nháy typographic.

---

## Ghi chú kỹ thuật

- **Chuẩn hóa tên**: `nameKey()`/`slugify()` ở `theme.js` là nguồn duy nhất — khớp tên item/ngọc/tướng bất kể dấu tiếng Việt, nháy `'`/`'`, khoảng trắng.
- **Cache**: `cachedResolve(key, ttl, fetcher, apply)` cache-first dùng chung cho version/roster/item catalog/champ build.
- **Allowlist chống "đồ ma"**: AI chỉ được chọn item/ngọc/phép/tướng trong danh sách gửi kèm. Item lọt ngoài DB → badge `⚠ NGOÀI DS` ở màn kết quả.
- **Lọc catalog theo hệ**: tướng AD bỏ item AP rõ rệt (và ngược lại) trước khi gửi AI → giảm token, vẫn đủ item counter.
- **repairJson**: cứu response JSON bị cắt do hết token (đóng ngoặc/chuỗi dở, lấy đoạn cân bằng cuối).
- **Resize ảnh**: cạnh dài về ~1568px trước khi gửi vision → đủ rõ, nhẹ token.
- **ErrorBoundary**: 1 màn lỗi render không làm sập cả app.
- **Degrade mềm**: mọi API cào lỗi → trả rỗng (không 500), app dùng cache/DB tĩnh/fallback.
