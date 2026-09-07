import {readFile, writeFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const brief = JSON.parse(await readFile(new URL("briefs/ep006-vi-sao-giu-tui-vut-coc-v03.json", root), "utf8"));
const words = JSON.parse(await readFile(new URL("creatorflow/ep006-words-v03.json", root), "utf8"));
const captions = JSON.parse(await readFile(new URL("creatorflow/ep006-captions-v03.json", root), "utf8"));

const clean = (value) => String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "");
const durationMs = words.at(-1)?.endMs + 350 || 53640;
const frameMs = 1000 / 30;

function findWordIndex(phrase, startSearch = 0) {
  const tokens = phrase.trim().split(/\s+/).map(clean);
  for (let i = startSearch; i <= words.length - tokens.length; i++) {
    let match = true;
    for (let j = 0; j < tokens.length; j++) {
      if (clean(words[i + j].text) !== tokens[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  for (let i = startSearch; i < words.length; i++) {
    if (clean(words[i].text) === tokens[0]) return i;
  }
  return startSearch;
}

// Coordinate layout design with strict clear spacing between image (left: x -190 to -210) and text/label (right: x +190 to +210)
// and well-paced sticker-popup SFX at key moments
const rawCues = [
  // C01: 0 -> "Sao"
  {id: "C01", phrase: "Cốc", comp: "solo", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Cho thấy kết cục của chiếc cốc ngay khi voice nói vứt",
   items: [{id: "discard-cup", kind: "asset", assetId: "A01", role: "hành động vứt cốc", motion: "track", sfx: "whoosh", semanticRole: "subject", transform: {from: {x: 0, y: -60, scale: 0.95, rotation: -4, opacity: 1}, to: {x: 0, y: 30, scale: 1.05, rotation: 5, opacity: 1}, easing: "ease-out"}}]},
  
  // C02: "Sao" -> "gấp"
  {id: "C02", phrase: "Sao chiếc túi", comp: "code", exit: "carry", cam: {mode: "pan", intensity: "medium"}, trans: "match-move",
   intent: "Đảo hướng chú ý từ cốc sang chiếc túi được giữ",
   items: [{id: "bag-hook", kind: "asset", assetId: "A02", role: "motif chiếc túi được giữ", motion: "slide", sfx: "sticker-popup", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: -190, y: 30, scale: 0.85, rotation: 3, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "keep-label", kind: "code", codeTemplate: "label", text: "GIỮ LẠI?", role: "câu hỏi mở", motion: "reveal", semanticRole: "accent", transform: {from: {x: 210, y: 30, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 200, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C03: "gấp" -> "Cùng"
  {id: "C03", phrase: "gấp mang về", comp: "solo", exit: "carry", cam: {mode: "follow", intensity: "subtle"}, trans: "reframe",
   intent: "Khóa nghịch lý bằng động tác gấp túi",
   items: [{id: "bag-hook", kind: "asset", assetId: "A02", role: "motif được gấp lại", motion: "none", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}}]},
  
  // C04: "Cùng" -> "Không"
  {id: "C04", phrase: "Cùng mua ở một quán đấy", comp: "compare", exit: "carry", cam: {mode: "pull-out", intensity: "subtle"}, trans: "reframe",
   intent: "Đặt cốc và túi vào cùng một lần mua",
   items: [{id: "bag-hook", kind: "asset", assetId: "A03", role: "khách cầm cả cốc và túi", motion: "none", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "same-purchase-cup", kind: "asset", assetId: "A01", role: "chiếc cốc cùng lần mua", motion: "reveal", sfx: "sticker-popup", semanticRole: "evidence", transform: {from: {x: 200, y: 40, scale: 0.78, rotation: 4, opacity: 0}, to: {x: 190, y: 0, scale: 0.92, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C05: "Không" -> "mà"
  {id: "C05", phrase: "Không hẳn vì chiếc túi đẹp hơn", comp: "code", exit: "transform", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Phủ định câu trả lời chỉ dựa vào vẻ ngoài",
   items: [{id: "bag-hook", kind: "asset", assetId: "A02", role: "chiếc túi đang được xem xét", motion: "none", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "beauty-question", kind: "code", codeTemplate: "label", text: "CHỈ VÌ ĐẸP?", role: "giả thuyết bị nghi ngờ", motion: "reveal", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 200, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},
  
  // C06: "mà" -> "Hôm nay"
  {id: "C06", phrase: "mà vì nó vẫn còn một việc để làm", comp: "code", exit: "replace", cam: {mode: "pull-out", intensity: "subtle"}, trans: "mask-reveal",
   intent: "Hé lộ cơ chế chiếc túi còn công việc tiếp theo",
   items: [{id: "bag-hook", kind: "asset", assetId: "A04", role: "túi chờ công việc mới", motion: "none", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "next-job", kind: "code", codeTemplate: "label", text: "VIỆC TIẾP THEO", role: "cơ chế ẩn", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 200, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},
  
  // C07: "Hôm nay" -> "Ngày mai"
  {id: "C07", phrase: "Hôm nay đựng đồ uống", comp: "solo", exit: "replace", cam: {mode: "follow", intensity: "subtle"}, trans: "cut",
   intent: "Cho thấy công việc đầu tiên đã hoàn thành",
   items: [{id: "drink-now", kind: "asset", assetId: "A03", role: "khách dùng đồ uống hôm nay", motion: "track", semanticRole: "subject", transform: {from: {x: 0, y: 40, scale: 0.92, rotation: -2, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C08: "Ngày mai" -> "nó đựng"
  {id: "C08", phrase: "Ngày mai", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "reframe",
   intent: "Mở lần sử dụng thứ hai bằng match-cut túi gấp thành túi mở",
   items: [{id: "bag-reuse", kind: "asset", assetId: "A04", role: "túi gấp bắt đầu lần dùng hai", motion: "scale", sfx: "whoosh", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: 0, y: 20, scale: 0.88, rotation: -2, opacity: 1}, to: {x: 0, y: 0, scale: 1.08, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C09: "nó đựng" -> "Khi"
  {id: "C09", phrase: "nó đựng món quà cho một người bạn", comp: "compare", exit: "replace", cam: {mode: "follow", intensity: "medium"}, trans: "mask-reveal",
   intent: "Đặt món quà vào chiếc túi bằng hành động thật",
   items: [{id: "bag-reuse", kind: "asset", assetId: "A05", role: "túi mở nhận món quà", motion: "none", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "gift-box", kind: "asset", assetId: "A09", role: "món quà được đặt vào", motion: "slide", sfx: "sticker-popup", semanticRole: "evidence", transform: {from: {x: 200, y: -40, scale: 0.78, rotation: 3, opacity: 0}, to: {x: 190, y: 0, scale: 0.94, rotation: 0, opacity: 1}, easing: "spring"}}]},
  
  // C10: "Khi" -> "họ"
  {id: "C10", phrase: "Khi người bạn ấy nhận quà", comp: "code", exit: "replace", cam: {mode: "follow", intensity: "medium"}, trans: "zoom-through",
   intent: "Theo người mang quà tới cửa để mở không gian câu chuyện",
   items: [{id: "gift-carrier", kind: "asset", assetId: "A06", role: "người mang túi quà", motion: "track", sfx: "sticker-popup", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: -190, y: 20, scale: 0.88, rotation: -2, opacity: 0}, to: {x: -180, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "ease-out"}},
           {id: "door-mark", kind: "code", codeTemplate: "label", text: "TỚI NHÀ BẠN", role: "bối cảnh giao quà", motion: "reveal", semanticRole: "accent", transform: {from: {x: 210, y: 20, scale: 0.82, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.96, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C11: "họ" -> "rồi"
  {id: "C11", phrase: "họ nhìn chiếc túi", comp: "solo", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "reframe",
   intent: "Chuyển điểm nhìn sang phản ứng của người nhận",
   items: [{id: "gift-recipient-look", kind: "asset", assetId: "A07", role: "người nhận chú ý", motion: "reveal", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: 1, opacity: 0}, to: {x: 0, y: 0, scale: 1.06, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C12: "rồi" -> "Thế là"
  {id: "C12", phrase: "rồi hỏi Mua ở đâu vậy", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "mask-reveal",
   intent: "Biến sự chú ý thành câu hỏi truyền miệng",
   items: [{id: "gift-recipient-ask", kind: "asset", assetId: "A07", role: "người nhận đặt câu hỏi", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "where-question", kind: "code", codeTemplate: "label", text: "MUA Ở ĐÂU VẬY?", role: "câu hỏi truyền miệng", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},
  
  // C13: "Thế là" -> "dù"
  {id: "C13", phrase: "Thế là thương hiệu xuất hiện thêm một lần", comp: "process", exit: "carry", cam: {mode: "pull-out", intensity: "subtle"}, trans: "reframe",
   intent: "Cho thấy thương hiệu được gợi nhớ ở lần dùng thứ hai",
   items: [{id: "purchase-node", kind: "code", codeTemplate: "label", text: "LẦN MUA", role: "điểm bắt đầu", motion: "reveal", semanticRole: "evidence", transform: {from: {x: -200, y: 20, scale: 0.82, rotation: -1, opacity: 0}, to: {x: -200, y: 0, scale: 0.94, rotation: 0, opacity: 1}, easing: "ease-out"}},
           {id: "reuse-node", kind: "code", codeTemplate: "label", text: "LẦN DÙNG HAI", role: "điểm xuất hiện thứ hai", motion: "reveal", semanticRole: "evidence", transform: {from: {x: 200, y: 20, scale: 0.82, rotation: 1, opacity: 0}, to: {x: 200, y: 0, scale: 0.94, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C14: "dù" -> "Trong"
  {id: "C14", phrase: "dù cửa hàng không chạy thêm quảng cáo", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nhấn rằng lần xuất hiện này không cần thêm quảng cáo",
   items: [{id: "purchase-node", kind: "code", codeTemplate: "label", text: "LẦN MUA", role: "điểm bắt đầu", motion: "none", semanticRole: "evidence", transform: {from: {x: -200, y: 0, scale: 0.94, rotation: 0, opacity: 1}, to: {x: -200, y: 0, scale: 0.88, rotation: 0, opacity: 0.65}, easing: "ease-out"}},
           {id: "ad-off", kind: "code", codeTemplate: "warning", text: "KHÔNG THÊM QUẢNG CÁO", role: "trạng thái quảng cáo tắt", motion: "stamp", semanticRole: "evidence", transform: {from: {x: 180, y: 20, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 170, y: 0, scale: 0.96, rotation: 0, opacity: 1}, easing: "spring"}}]},
  
  // C15: "Trong" -> "sống"
  {id: "C15", phrase: "Trong marketing đó là một điểm chạm", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Chỉ gọi tên marketing sau khi cơ chế đã được nhìn thấy",
   items: [{id: "post-sale-term", kind: "code", codeTemplate: "label", text: "ĐIỂM CHẠM SAU BÁN", role: "tên nguyên lý", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 0, y: 30, scale: 0.8, rotation: 1, opacity: 0}, to: {x: 0, y: 0, scale: 1.08, rotation: 0, opacity: 1}, easing: "spring"}}]},
  
  // C16: "sống" -> "Nhưng"
  {id: "C16", phrase: "sống lâu hơn giao dịch", comp: "code", exit: "replace", cam: {mode: "pan", intensity: "subtle"}, trans: "match-move",
   intent: "Giải nghĩa nguyên lý bằng thời gian tồn tại",
   items: [{id: "post-sale-term", kind: "code", codeTemplate: "label", text: "SỐNG LÂU HƠN GIAO DỊCH", role: "giải nghĩa thời gian tồn tại", motion: "none", semanticRole: "accent", transform: {from: {x: 0, y: 0, scale: 1.08, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.08, rotation: 0, opacity: 1}, easing: "linear"}}]},
  
  // C17: "Nhưng" -> "Món"
  {id: "C17", phrase: "Nhưng in logo thật lớn chưa chắc khiến khách giữ lại", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Phủ định việc logo lớn tự tạo lý do giữ",
   items: [{id: "giant-logo", kind: "code", codeTemplate: "warning", text: "LOGO THẬT LỚN ≠ LÝ DO GIỮ", role: "giả định logo lớn", motion: "stamp", sfx: "click", semanticRole: "evidence", transform: {from: {x: 0, y: 30, scale: 0.8, rotation: -2, opacity: 0}, to: {x: 0, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}}]},
  
  // C18: "Món" -> "đủ đẹp"
  {id: "C18", phrase: "Món đồ ấy phải hữu ích", comp: "solo", exit: "replace", cam: {mode: "follow", intensity: "subtle"}, trans: "mask-reveal",
   intent: "Đưa tiêu chí đầu tiên bằng hành động sử dụng",
   items: [{id: "useful-touchpoints", kind: "asset", assetId: "A09", role: "đồ vật có công dụng", motion: "reveal", sfx: "sticker-popup", semanticRole: "evidence", transform: {from: {x: 0, y: 30, scale: 0.88, rotation: -2, opacity: 0}, to: {x: 0, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C19: "đủ đẹp" -> "hoặc"
  {id: "C19", phrase: "đủ đẹp", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Cho tiêu chí vẻ đẹp như một trải nghiệm thị giác",
   items: [{id: "beautiful-card", kind: "asset", assetId: "A09", role: "điểm chạm đủ đẹp", motion: "scale", semanticRole: "evidence", transform: {from: {x: -190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "beautiful-label", kind: "code", codeTemplate: "label", text: "ĐỦ ĐẸP ĐỂ GIỮ", role: "tiêu chí vẻ đẹp", motion: "reveal", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.8, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.96, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C20: "hoặc" -> "Còn"
  {id: "C20", phrase: "hoặc gắn với một kỷ niệm", comp: "solo", exit: "replace", cam: {mode: "pull-out", intensity: "subtle"}, trans: "match-move",
   intent: "Cho tiêu chí cảm xúc bằng phản ứng lưu giữ",
   items: [{id: "memory-recipient", kind: "asset", assetId: "A07", role: "người nhận lưu kỷ niệm", motion: "reveal", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.88, rotation: 1, opacity: 0}, to: {x: 0, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C21: "Còn" -> "Bài học"
  {id: "C21", phrase: "Còn bao bì vô dụng dù đắt đến đâu vẫn đi thẳng vào thùng rác", comp: "solo", exit: "replace", cam: {mode: "follow", intensity: "medium"}, trans: "cut",
   intent: "Đối chiếu bằng kết cục đi vào thùng rác",
   items: [{id: "crumple-wrapper", kind: "asset", assetId: "A10", role: "bao bì vô dụng bị bỏ", motion: "track", sfx: "whoosh", semanticRole: "subject", transform: {from: {x: 0, y: -60, scale: 0.9, rotation: -3, opacity: 1}, to: {x: 0, y: 40, scale: 1.02, rotation: 6, opacity: 1}, easing: "ease-out"}}]},
  
  // C22: "Bài học" -> "Hãy"
  {id: "C22", phrase: "Bài học là đừng chỉ thiết kế khoảnh khắc khách mua", comp: "code", exit: "replace", cam: {mode: "pan", intensity: "subtle"}, trans: "reframe",
   intent: "Chốt việc thiết kế sau lần mua thay vì chỉ khoảnh khắc thanh toán",
   items: [{id: "lesson-timeline", kind: "code", codeTemplate: "label", text: "MUA XONG → VẪN SỐNG TIẾP", role: "một bài học", motion: "reveal", semanticRole: "accent", transform: {from: {x: 0, y: 30, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C23: "Hãy" -> "Thử" - Bag on left (-190), Label on right (+200), NO overlapping!
  {id: "C23", phrase: "Hãy thiết kế một thứ có lý do để sống tiếp sau lần mua", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "match-move",
   intent: "Đưa motif trở lại để gắn bài học với một vật cụ thể",
   items: [{id: "bag-lesson-return", kind: "asset", assetId: "A02", role: "motif sống tiếp sau mua", motion: "reveal", sfx: "sticker-popup", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: -190, y: 30, scale: 0.85, rotation: -2, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "live-on", kind: "code", codeTemplate: "label", text: "CÓ LÝ DO SỐNG TIẾP", role: "kết luận dễ nhớ", motion: "stamp", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 200, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},
  
  // C24: "Thử" -> "Hỏi"
  {id: "C24", phrase: "Thử đặt túi hộp thiệp hóa đơn và tin nhắn sau bán cạnh nhau", comp: "sequence", exit: "replace", cam: {mode: "pull-out", intensity: "medium"}, trans: "reframe",
   intent: "Bắt đầu bài test bằng thao tác trải các điểm chạm",
   items: [{id: "bag-lesson-return", kind: "asset", assetId: "A02", role: "túi trong bài test", motion: "none", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: -240, y: 0, scale: 0.85, rotation: -2, opacity: 1}, to: {x: -240, y: 0, scale: 0.85, rotation: -2, opacity: 1}, easing: "linear"}},
           {id: "audit-owner", kind: "asset", assetId: "A08", role: "chủ shop thực hiện audit", motion: "reveal", semanticRole: "subject", transform: {from: {x: 0, y: 40, scale: 0.82, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "ease-out"}},
           {id: "audit-touchpoints", kind: "asset", assetId: "A09", role: "các điểm chạm sau bán", motion: "slide", sfx: "sticker-popup", semanticRole: "evidence", transform: {from: {x: 240, y: 40, scale: 0.75, rotation: 2, opacity: 0}, to: {x: 240, y: 0, scale: 0.85, rotation: 1, opacity: 1}, easing: "spring"}}]},
  
  // C25: "Hỏi" -> "Nếu"
  {id: "C25", phrase: "Hỏi một câu ngày mai khách còn muốn giữ thứ nào", comp: "code", exit: "carry", cam: {mode: "follow", intensity: "subtle"}, trans: "zoom-through",
   intent: "Biến bài test thành một câu hỏi duy nhất",
   items: [{id: "audit-phone", kind: "asset", assetId: "A11", role: "điện thoại chụp bài test", motion: "scale", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.85, rotation: -2, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "ease-out"}},
           {id: "tomorrow-question", kind: "code", codeTemplate: "label", text: "NGÀY MAI KHÁCH CÒN GIỮ GÌ?", role: "câu hỏi ứng dụng", motion: "reveal", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "ease-out"}}]},
  
  // C26: "Nếu" -> "Lưu"
  {id: "C26", phrase: "Nếu chưa có câu trả lời hãy bắt đầu từ đúng một món", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "mask-reveal",
   intent: "Thu bài test về đúng một lựa chọn để bắt đầu",
   items: [{id: "audit-phone", kind: "asset", assetId: "A11", role: "điện thoại giữ góc nhìn bài test", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "one-choice", kind: "code", codeTemplate: "button", text: "BẮT ĐẦU TỪ MỘT MÓN", role: "hành động nhỏ nhất", motion: "stamp", sfx: "click", semanticRole: "evidence", transform: {from: {x: 200, y: 30, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.96, rotation: 0, opacity: 1}, easing: "spring"}}]},
  
  // C27: "Lưu" -> "trải nghiệm"
  {id: "C27", phrase: "Lưu video này để kiểm tra lại", comp: "code", exit: "carry", cam: {mode: "pull-out", intensity: "subtle"}, trans: "match-move",
   intent: "Đưa motif quay lại cạnh một CTA duy nhất",
   items: [{id: "bag-cta", kind: "asset", assetId: "A02", role: "motif khép vòng", motion: "reveal", sfx: "sticker-popup", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: -190, y: 30, scale: 0.85, rotation: -2, opacity: 0}, to: {x: -190, y: 0, scale: 0.98, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "save-button", kind: "code", codeTemplate: "button", text: "LƯU VIDEO", role: "CTA duy nhất", motion: "stamp", sfx: "click", semanticRole: "evidence", transform: {from: {x: 200, y: 30, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},
  
  // C28: "trải nghiệm" -> end
  {id: "C28", phrase: "trải nghiệm sau bán của bạn", comp: "compare", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Khép bằng phạm vi bài test sau bán",
   items: [{id: "bag-cta", kind: "asset", assetId: "A02", role: "motif cuối video", motion: "none", semanticRole: "subject", motifKey: "kept-bag", transform: {from: {x: -190, y: 0, scale: 0.98, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 0.98, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "post-sale-label", kind: "code", codeTemplate: "label", text: "KIỂM TRA TRẢI NGHIỆM SAU BÁN", role: "phạm vi hành động", motion: "reveal", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.92, rotation: 0, opacity: 1}, easing: "ease-out"}}]}
];

let lastWordIndex = 0;
const processedCues = [];

for (let i = 0; i < rawCues.length; i++) {
  const rc = rawCues[i];
  let wIndex = 0;
  if (i === 0) {
    wIndex = 0;
  } else {
    wIndex = findWordIndex(rc.phrase, lastWordIndex);
    if (wIndex < 0 || wIndex <= lastWordIndex) {
      wIndex = lastWordIndex + 1;
    }
  }
  lastWordIndex = wIndex;
  
  processedCues.push({
    id: rc.id,
    wordIndex: wIndex,
    startMs: words[wIndex].startMs,
    endMs: 0,
    spokenAnchor: words[wIndex].text,
    semanticIntent: rc.intent,
    composition: rc.comp,
    exit: rc.exit,
    camera: rc.cam,
    transition: rc.trans,
    items: rc.items
  });
}
processedCues[0].startMs = 0;

// Subdivide any cues longer than 2900ms to strictly comply with max 3s rule
const finalCues = [];
let cueCounter = 1;

for (let i = 0; i < processedCues.length; i++) {
  const cur = processedCues[i];
  const nextStart = i + 1 < processedCues.length ? processedCues[i + 1].startMs : durationMs;
  const curDuration = nextStart - cur.startMs;
  
  if (curDuration > 2900) {
    const wStart = cur.wordIndex;
    const wNext = i + 1 < processedCues.length ? processedCues[i + 1].wordIndex : words.length - 1;
    const midWordIdx = Math.min(wNext - 1, Math.max(wStart + 1, Math.floor((wStart + wNext) / 2)));
    const midStartMs = words[midWordIdx].startMs;
    
    // First sub-cue
    const cId1 = `C${String(cueCounter++).padStart(2, "0")}`;
    finalCues.push({
      ...cur,
      id: cId1,
      startMs: cur.startMs,
      endMs: midStartMs,
      spokenAnchor: words[cur.wordIndex].text,
      exit: "carry"
    });
    
    // Second sub-cue (remove SFX from repeated item and keep transform steady from=to)
    const cId2 = `C${String(cueCounter++).padStart(2, "0")}`;
    finalCues.push({
      ...cur,
      id: cId2,
      startMs: midStartMs,
      endMs: nextStart,
      spokenAnchor: words[midWordIdx].text,
      items: cur.items.map(item => {
        const copy = {
          ...item,
          motion: "none",
          transform: item.transform ? {
            from: {...item.transform.to},
            to: {...item.transform.to},
            easing: "linear"
          } : undefined
        };
        delete copy.sfx;
        return copy;
      })
    });
  } else {
    const cId = `C${String(cueCounter++).padStart(2, "0")}`;
    finalCues.push({
      ...cur,
      id: cId,
      startMs: cur.startMs,
      endMs: nextStart,
      spokenAnchor: words[cur.wordIndex].text
    });
  }
}

// Make strictly contiguous
finalCues[0].startMs = 0;
for (let i = 0; i < finalCues.length; i++) {
  finalCues[i].endMs = i + 1 < finalCues.length ? finalCues[i + 1].startMs : durationMs;
}

// Ensure items have stable enterMs
const itemFirstSeen = new Map();
for (const cue of finalCues) {
  for (const item of cue.items) {
    if (!itemFirstSeen.has(item.id)) {
      item.enterMs = cue.startMs;
      itemFirstSeen.set(item.id, cue.startMs);
    } else {
      item.enterMs = itemFirstSeen.get(item.id);
    }
  }
}

// Set exits: ensure carry and transform continuity
for (let i = 0; i < finalCues.length - 1; i++) {
  const cur = finalCues[i];
  const next = finalCues[i + 1];
  const curIds = new Set(cur.items.map(it => it.id));
  const hasShared = next.items.some(it => curIds.has(it.id));
  if (hasShared) {
    if (cur.exit === "replace") cur.exit = "carry";
  } else {
    if (cur.exit === "carry" || cur.exit === "transform") cur.exit = "replace";
  }
}

// Guarantee transform continuity
finalCues[4].exit = "transform";

// Re-align spokenAnchor for all cues to match words.json exactly at startMs
for (const cue of finalCues) {
  const matchingWord = words.find((item) => Math.abs(item.startMs - cue.startMs) <= frameMs + 0.001);
  if (matchingWord) {
    cue.spokenAnchor = matchingWord.text;
  }
}

const assets = [
  {id: "A01", src: "ep006/v03/generated/a01-discard-cup-alpha-v03.png", alt: "Bàn tay thả cốc rỗng xuống thùng rác", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A02", src: "ep006/v03/generated/a02-fold-bag-alpha-v03.png", alt: "Hai bàn tay kéo và gấp túi giấy", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A03", src: "ep006/v03/generated/a03-customer-cup-bag-alpha-v03.png", alt: "Khách cầm cốc và túi cạnh nhau", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A04", src: "ep006/v03/generated/a04-drawer-folded-bag-alpha-v03.png", alt: "Túi gấp trong ngăn kéo chờ lần dùng", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A05", src: "ep006/v03/generated/a05-pack-gift-bag-alpha-v03.png", alt: "Bàn tay mở túi và đặt hộp quà vào", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A06", src: "ep006/v03/generated/a06-gift-carrier-alpha-v03.png", alt: "Người trẻ mang túi quà tới cửa", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A07", src: "ep006/v03/generated/a07-gift-recipient-alpha-v03.png", alt: "Người nhận quan sát và hỏi mua ở đâu", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A08", src: "ep006/v03/generated/a08-shop-owner-audit-alpha-v03.png", alt: "Chủ shop trải các điểm chạm sau bán", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A09", src: "ep006/v03/generated/a09-touchpoints-sheet-alpha-v03.png", alt: "Bộ ba điểm chạm quà thiệp hóa đơn", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A10", src: "ep006/v03/generated/a10-crumple-wrapper-alpha-v03.png", alt: "Bàn tay vò giấy gói vô dụng", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A11", src: "ep006/v03/generated/a11-phone-audit-alpha-v03.png", alt: "Điện thoại chụp bàn điểm chạm", kind: "image", stickerTreatment: "remotion-paper", hasBakedContour: false},
];

const arcStages = Object.entries(brief.creativeContract.storyArc);
const arcScale = durationMs / 58000;
const beats = arcStages.map(([name, stage], index) => ({
  id: `B0${index + 1}`,
  startMs: index === 0 ? 0 : Math.round(stage.startMs * arcScale),
  endMs: index + 1 < arcStages.length ? Math.round(arcStages[index + 1][1].startMs * arcScale) : durationMs,
  purpose: ["hook", "curiosity", "perspective", "marketing", "proof", "lesson", "application"][index],
  focus: "both",
  headline: name,
  body: stage.purpose,
  assetIds: ["A02"],
  transition: "push"
}));
beats[0].startMs = 0;
for (let i = 1; i < beats.length; i++) {
  beats[i].startMs = beats[i - 1].endMs;
}
beats[beats.length - 1].endMs = durationMs;

const episode = {
  schemaVersion: 2,
  id: "EP006",
  slug: "vi-sao-giu-tui-vut-coc-v03",
  title: brief.creativeContract.title,
  durationMs,
  assets,
  beats,
  audio: {
    voiceSrc: "audio/ep006-voice-cartesia-processed-v03.wav",
    voiceVolume: 1,
    musicSrc: "audio/background-music-v01.mp3",
    musicVolume: 0.08
  },
  wordsSrc: "src/data/ep006-v03-words.json",
  motionGrammar: "continuous-stage-v1",
  visualGrammar: "subject-led-v1",
  visualCues: finalCues
};

await writeFile(new URL("src/data/ep006-v03-episode.json", root), JSON.stringify(episode, null, 2) + "\n");
await writeFile(new URL("src/data/ep006-v03-words.json", root), JSON.stringify(words, null, 2) + "\n");
await writeFile(new URL("src/data/ep006-v03-captions.json", root), JSON.stringify(captions, null, 2) + "\n");

console.log(`Built EP006 v03: ${durationMs}ms, ${words.length} words, ${finalCues.length} cues`);
