// backend/api/version.js
// Trả về version tối thiểu yêu cầu. Khi cần ép user update native build,
// tăng minVersion lên bằng version mới trên Store rồi deploy lại.

const VERSION_INFO = {
  minVersion: "1.0.0",   // version tối thiểu được phép chạy
  latestVersion: "1.0.0", // version mới nhất (hiển thị cho user biết)
  forceUpdate: false,     // true = chặn app, bắt update ngay
  message: "",            // tin nhắn tuỳ chỉnh hiện cho user (bỏ trống nếu không cần)
  ios: "https://apps.apple.com/app/id__YOUR_APP_ID__",
  android: "https://play.google.com/store/apps/details?id=com.donglb.tocchiencounter",
};

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json(VERSION_INFO);
}
