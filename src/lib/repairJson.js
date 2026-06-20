// src/lib/repairJson.js
// Cứu JSON bị model trả lỗi: dính ```json fence, có chữ thừa, hoặc bị CẮT giữa chừng.
// Trả về object đã parse, hoặc null nếu không cứu được.

export function repairJson(raw) {
  if (!raw || typeof raw !== "string") return null;

  // 1) Bỏ code fence + khoảng trắng thừa
  let s = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  // 2) Cắt từ dấu { đầu tiên (bỏ preamble kiểu "Đây là kết quả:")
  const start = s.indexOf("{");
  if (start === -1) return null;
  s = s.slice(start);

  // 3) Thử parse thẳng
  try {
    return JSON.parse(s);
  } catch (_) {
    // tiếp tục sửa
  }

  // 4) Đóng chuỗi/ngoặc bị bỏ dở (trường hợp response bị cắt do hết token)
  const closed = closeOpen(s);
  if (closed) {
    try {
      return JSON.parse(closed);
    } catch (_) {}
  }

  // 5) Cố lấy tới dấu } cân bằng cuối cùng
  const balanced = lastBalanced(s);
  if (balanced) {
    try {
      return JSON.parse(balanced);
    } catch (_) {}
  }

  return null;
}

// Đóng các ngoặc/ngoặc vuông/ dấu nháy còn mở khi chuỗi bị cắt ngang
function closeOpen(s) {
  let inStr = false;
  let esc = false;
  const stack = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }
  let out = s;
  // Nếu đang kẹt trong chuỗi → bỏ phần value/key dở dang về vị trí an toàn
  if (inStr) {
    const lastQuote = out.lastIndexOf('"');
    let before = out.slice(0, lastQuote); // bỏ chuỗi chưa đóng
    const trimmed = before.replace(/\s*$/, "");
    // Nếu ngay trước là ':' → chuỗi dở là VALUE → phải bỏ luôn "key": đứng trước
    if (trimmed.endsWith(":")) {
      before = trimmed.slice(0, -1).replace(/\s*"[^"]*"\s*$/, "");
    } else {
      before = trimmed;
    }
    out = before;
  }
  out = out.replace(/[,:]\s*$/, "");
  while (stack.length) out += stack.pop();
  return out;
}

// Quét tìm đoạn { ... } cân bằng dài nhất tính từ đầu
function lastBalanced(s) {
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) end = i;
    }
  }
  return end === -1 ? null : s.slice(0, end + 1);
}
