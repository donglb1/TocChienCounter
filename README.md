# Tốc Chiến Counter — Mobile App (Expo)

App native Android/iOS phân tích team địch Wild Rift → đề xuất build khắc chế từng bước.

**Pipeline:** chọn tướng + đường → chụp/chọn ảnh team địch → AI đọc tướng → xác nhận/sửa tay → build khắc chế có lý do + phương án thay thế.

---

## Cấu trúc

```
toc-chien-counter/
├── App.js                      # điều hướng 3 màn (setup → confirm → result)
├── app.json                    # cấu hình Expo
├── package.json
├── src/
│   ├── theme.js                # màu HUD + helper bỏ dấu + danh sách đường
│   ├── data/champions.js       # DB tướng (gắn thẻ AD/AP/CC/...)   ← THAY DATA CỦA MÀY
│   ├── data/items.js           # DB item thật + allowlist          ← THAY DATA CỦA MÀY
│   ├── lib/api.js              # gọi backend (SỬA BACKEND_URL)
│   ├── lib/repairJson.js       # cứu JSON bị cắt
│   ├── lib/images.js           # icon tướng từ Data Dragon CDN
│   └── screens/                # SetupScreen, ConfirmScreen, ResultScreen
└── backend/
    └── api/analyze.js          # serverless giữ API key (vision + analyze)
```

---

## ⚠ 2 việc PHẢI làm trước khi app chạy AI

1. **Deploy backend** (`backend/`) lên Vercel + set env `ANTHROPIC_API_KEY`.
   Đừng bao giờ nhét key vào client.
2. **Sửa `BACKEND_URL`** trong `src/lib/api.js` thành URL backend vừa deploy.

---

## Chạy app (dev) trên máy local

```bash
cd toc-chien-counter
npm install
npx expo start
```

Quét QR bằng app **Expo Go** trên điện thoại (máy + điện thoại cùng wifi).

> Nếu chạy backend **local** thì `BACKEND_URL` phải là **IP máy tính** (vd `http://192.168.1.10:3000`), KHÔNG dùng `localhost` — điện thoại không hiểu localhost của máy.

---

## Deploy backend (Vercel)

```bash
cd backend
npx vercel                       # làm theo hướng dẫn để deploy
npx vercel env add ANTHROPIC_API_KEY   # dán API key vào
cd /Users/lebadong/Downloads/tocChienCounter/backend
npx vercel --prod
```

Lấy URL dạng `https://xxx.vercel.app` → bỏ vào `BACKEND_URL` trong `src/lib/api.js`.

### Đổi model AI
Trong `backend/api/analyze.js`:
- `EXTRACT_MODEL = "claude-opus-4-8"` — đọc ảnh, chính xác cao (đọc sai 1 con hỏng cả build)
- `ANALYZE_MODEL = "claude-sonnet-4-6"` — phân tích text, nhanh + rẻ

Muốn rẻ hơn cho khâu đọc ảnh thì hạ xuống `claude-haiku-4-5-20251001` (đánh đổi độ chính xác trên ảnh khó).

---

## Build APK (cài máy thật / chia sẻ)

```bash
npm install -g eas-cli
eas login
eas build:configure
cd /Users/lebadong/Downloads/tocChienCounter
npx eas-cli build --platform android --profile preview # ra file .apk tải về cài
npx eas-cli update --branch preview --message "..." # lệnh chạy khi update source
```

---

## 🔑 Thay DATA của mày vào (quan trọng nhất)

Bản này là DB **khởi đầu** để app chạy được luôn, CHƯA đầy đủ:

- `src/data/champions.js` — mới ~45 tướng. Paste bộ ~115 tướng đã gắn thẻ từ bản web vào, **giữ nguyên schema** (`id, name, vi, damageType, role, burst, cc, healing, threat`).
- `src/data/items.js` — mới ~26 item. Paste bộ ~65 item curated patch 7.1f từ bản web vào, **giữ nguyên schema** (`id, name, vi, type, tags, img`). `ITEM_ALLOWLIST` tự sinh từ `ITEMS` nên không cần sửa tay.

Schema giữ y hệt nên data của mày drop thẳng vào là chạy. Tên tiếng Việt vài item trong bản khởi đầu tao để theo trí nhớ — **kiểm lại với DB web của mày** (đây đúng là chỗ dễ sai item nhất).

---

## Ghi chú kỹ thuật

- **Icon tướng**: lấy từ Riot Data Dragon (icon LoL PC, sát Wild Rift đủ dùng), tự resolve version mới nhất khi mở app, có map ID đặc biệt (Kai'Sa→Kaisa, Wukong→MonkeyKing, Dr. Mundo→DrMundo...).
- **Icon item**: Wild Rift KHÔNG có CDN item công khai → UI vẽ ô gem màu + viết tắt tên. Có field `img` sẵn trong schema, sau này có URL thì gán vào là hiện ảnh thật.
- **Allowlist**: `analyze` ép model chỉ chọn item trong `ITEM_ALLOWLIST` → chống item ma. Món nào lọt ngoài DB → badge `⚠ NGOÀI DS` ở màn kết quả.
- **repairJson**: cứu response JSON bị cắt do hết token (đóng ngoặc/chuỗi dở dang, lấy đoạn cân bằng cuối).
- **Resize ảnh**: cạnh dài về ~1568px trước khi gửi vision → đủ rõ, nhẹ token.
