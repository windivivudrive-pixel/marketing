import {readFile, writeFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const brief = JSON.parse(await readFile(new URL("briefs/ep012-so-khong-co-tieng-noi-rieng-v01.json", root), "utf8"));
const wordsJson = JSON.parse(await readFile(new URL("creatorflow/ep012-words-v01.json", root), "utf8"));
const words = (wordsJson.words || wordsJson).map(w => ({
  ...w,
  timestampMs: w.startMs,
  confidence: 1.0
}));
const captionsJson = JSON.parse(await readFile(new URL("creatorflow/ep012-captions-v01.json", root), "utf8"));
const captions = (captionsJson.captions || captionsJson).map(c => ({
  ...c,
  timestampMs: c.startMs,
  confidence: 1.0
}));

const clean = (value) => String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "");
const durationMs = words.at(-1)?.endMs + 350 || 49750;
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

const rawCues = [
  // C01
  {id: "C01", phrase: "Một đồng rất nhỏ", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Mở đầu thumbnail hai tag giá giấy và tag số 0",
   role: "motif-anchor", family: "hook-contrast", spokenSubj: "Một đồng rất nhỏ", visualSubj: "Hai tag giá giấy và tag số 0", reason: "Thumbnail mở đầu 1s",
   items: [{id: "c01-tag-contrast", kind: "asset", assetId: "A01", role: "hai tag giá", motion: "stamp", sfx: "whoosh", semanticRole: "subject", motifKey: "tag-zero", transform: {from: {x: 0, y: -40, scale: 0.95, rotation: -2, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 1, opacity: 1}, easing: "ease-out"}}]},

  // C02
  {id: "C02", phrase: "Nhưng số không", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nhấn mạnh số 0 có tiếng nói riêng",
   role: "literal-evidence", family: "hook-contrast", spokenSubj: "Số không có tiếng nói riêng", visualSubj: "Tag giá kèm badge nghịch lý", reason: "Khơi gợi tò mò",
   items: [{id: "c02-tag-contrast", kind: "asset", assetId: "A01", role: "hai tag giá", motion: "none", semanticRole: "subject", motifKey: "tag-zero", transform: {from: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, easing: "linear"}},
           {id: "c02-zero-tag", kind: "code", codeTemplate: "label", text: "SỐ 0 KHÔNG CHỈ\nLÀ MỘT CON SỐ", role: "nghịch lý số 0", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C03
  {id: "C03", phrase: "Hai món này", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Hai món cùng giảm chín nghìn",
   role: "comparison", family: "literal-action", spokenSubj: "Hai món cùng giảm 9K", visualSubj: "Hai sản phẩm kẹp tóc trung tính", reason: "Thiết lập tình huống",
   items: [{id: "c03-products", kind: "asset", assetId: "A03", role: "hai sản phẩm kẹp tóc", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c03-gap-tag", kind: "code", codeTemplate: "label", text: "CÙNG GIẢM ĐÚNG\n9.000 ĐỒNG", role: "mức giảm bằng nhau", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C04
  {id: "C04", phrase: "Một món từ", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Món 1: 10K xuống 1K",
   role: "literal-evidence", family: "literal-action", spokenSubj: "10K xuống 1K", visualSubj: "Hai sản phẩm kèm tag giá món 1", reason: "Chi tiết giá món 1",
   items: [{id: "c04-products", kind: "asset", assetId: "A03", role: "hai sản phẩm", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c04-p1-tag", kind: "code", codeTemplate: "label", text: "MÓN 1:\n10.000đ → 1.000đ", role: "giảm xuống 1K", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C05
  {id: "C05", phrase: "Món kia từ", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Món 2: 9K xuống 0 đồng",
   role: "literal-evidence", family: "literal-action", spokenSubj: "9K xuống 0đ", visualSubj: "Hai sản phẩm kèm tag giá món 2", reason: "Chi tiết giá món 2",
   items: [{id: "c05-products", kind: "asset", assetId: "A03", role: "hai sản phẩm", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c05-p2-tag", kind: "code", codeTemplate: "label", text: "MÓN 2:\n9.000đ → 0 ĐỒNG", role: "giảm xuống 0đ", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C06
  {id: "C06", phrase: "Nếu chỉ làm", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Toán học: Phép trừ cho kết quả y hệt nhau",
   role: "comparison", family: "perspective-split", spokenSubj: "Phép trừ y hệt", visualSubj: "Hai hóa đơn có cùng khoảng trống", reason: "Đối chiếu lý tính",
   items: [{id: "c06-receipts", kind: "asset", assetId: "A04", role: "hai hóa đơn", motion: "reveal", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c06-math-tag", kind: "code", codeTemplate: "label", text: "TOÁN HỌC:\n-9.000đ = -9.000đ", role: "phép trừ bằng nhau", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C07
  {id: "C07", phrase: "Nhưng mắt mình", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Mắt dừng lâu hơn ở chữ miễn phí",
   role: "human-action", family: "viewer-reaction", spokenSubj: "Dừng ở chữ miễn phí", visualSubj: "Tay khách cầm tag đọc chữ", reason: "Phản xạ thị giác",
   items: [{id: "c07-buyer-hand", kind: "asset", assetId: "A02", role: "tay khách cầm tag", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c07-eyes-tag", kind: "code", codeTemplate: "warning", text: "MẮT DỪNG LÂU Ở\nCHỮ “MIỄN PHÍ”", role: "dừng mắt", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C08
  {id: "C08", phrase: "Và tay cũng", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Tay dễ nghiêng về món có số 0",
   role: "human-action", family: "viewer-reaction", spokenSubj: "Nghiêng về số 0", visualSubj: "Tay khách cầm tag", reason: "Thiên lệch hành vi",
   items: [{id: "c08-buyer-hand", kind: "asset", assetId: "A02", role: "tay khách cầm tag", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c08-lean-tag", kind: "code", codeTemplate: "label", text: "TAY DỄ NGHIÊNG VỀ\nMÓN CÓ SỐ 0", role: "hành vi chọn số 0", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C09
  {id: "C09", phrase: "Không phải vì", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Không phải vì món đó tự nhiên tốt hơn",
   role: "context", family: "viewer-reaction", spokenSubj: "Không phải tốt hơn", visualSubj: "Tag giá số 0", reason: "Khẳng định bản chất",
   items: [{id: "c09-tag-zero", kind: "asset", assetId: "A01", role: "tag số 0", motion: "scale", semanticRole: "subject", motifKey: "tag-zero", transform: {from: {x: 0, y: 20, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C10
  {id: "C10", phrase: "Chỉ là giá", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Giá bằng không không giống một mức giá thấp bình thường",
   role: "literal-evidence", family: "mechanism-map", spokenSubj: "Giá bằng không khác giá thấp", visualSubj: "Hộp quà có số 0", reason: "Giải thích tâm lý",
   items: [{id: "c10-giftbox", kind: "asset", assetId: "A05", role: "hộp quà số 0", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c10-gift-tag", kind: "code", codeTemplate: "label", text: "GIÁ BẰNG 0\n≠ MỨC GIÁ THẤP", role: "khác biệt giá 0", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C11
  {id: "C11", phrase: "Lúc này, não", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Não không chỉ làm phép trừ đơn giản",
   role: "context", family: "mechanism-map", spokenSubj: "Não không làm phép trừ", visualSubj: "Hộp quà số 0", reason: "Cơ chế nhận thức",
   items: [{id: "c11-giftbox", kind: "asset", assetId: "A05", role: "hộp quà số 0", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c11-brain-tag", kind: "code", codeTemplate: "label", text: "NÃO KHÔNG LÀM\nPHÉP TRỪ ĐƠN GIẢN", role: "nhận thức não bộ", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C12
  {id: "C12", phrase: "Nó còn đọc", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Đọc số 0 như một món quà",
   role: "context", family: "mechanism-map", spokenSubj: "Như một món quà", visualSubj: "Hộp quà số 0 kèm badge quà tặng", reason: "Ý nghĩa tâm lý món quà",
   items: [{id: "c12-giftbox", kind: "asset", assetId: "A05", role: "hộp quà số 0", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c12-present-tag", kind: "code", codeTemplate: "label", text: "ĐỌC SỐ 0 NHƯ\nMỘT MÓN QUÀ TẶNG", role: "món quà tâm lý", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C13
  {id: "C13", phrase: "Đó là phần", comp: "solo", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Đó là phần lật của câu chuyện",
   role: "context", family: "perspective-split", spokenSubj: "Phần lật", visualSubj: "Tag giá số 0", reason: "Chuyển ý",
   items: [{id: "c13-tag-zero", kind: "asset", assetId: "A01", role: "tag số 0", motion: "reveal", semanticRole: "subject", motifKey: "tag-zero", transform: {from: {x: 0, y: 20, scale: 0.95, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C14
  {id: "C14", phrase: "Trong các thí", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Dẫn chứng thí nghiệm về giá",
   role: "literal-evidence", family: "evidence-source", spokenSubj: "Thí nghiệm về giá", visualSubj: "Hai hóa đơn", reason: "Bằng chứng nghiên cứu",
   items: [{id: "c14-receipts", kind: "asset", assetId: "A04", role: "hai hóa đơn", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c14-study-tag", kind: "code", codeTemplate: "label", text: "THÍ NGHIỆM:\nLỰA CHỌN THAY ĐỔI", role: "kết quả thí nghiệm", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C15
  {id: "C15", phrase: "Khoảng chênh", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Khoảng chênh giữa 2 món giữ nguyên",
   role: "literal-evidence", family: "evidence-source", spokenSubj: "Khoảng chênh giữ nguyên", visualSubj: "Hai hóa đơn", reason: "Tính kiểm soát",
   items: [{id: "c15-receipts", kind: "asset", assetId: "A04", role: "hai hóa đơn", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c15-gap-hold", kind: "code", codeTemplate: "label", text: "KHOẢNG CHÊNH\nGIỮ NGUYÊN", role: "chênh lệch giữ nguyên", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C16
  {id: "C16", phrase: "Nhưng cảm giác", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Cảm giác về lợi ích đổi khác (phát âm rõ ràng)",
   role: "context", family: "proof-comparison", spokenSubj: "Lợi ích đổi khác", visualSubj: "Hai hóa đơn", reason: "Chuyển đổi nhận thức",
   items: [{id: "c16-receipts", kind: "asset", assetId: "A04", role: "hai hóa đơn", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c16-value-tag", kind: "code", codeTemplate: "label", text: "CẢM GIÁC LỢI ÍCH\nHOÀN TOÀN ĐỔI KHÁC", role: "cảm nhận lợi ích", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C17
  {id: "C17", phrase: "Trong hành vi", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Gọi tên thuật ngữ: Zero-Price Effect (đầy đủ 'Trong hành vi')",
   role: "literal-evidence", family: "proof-comparison", spokenSubj: "Hiệu ứng giá bằng không", visualSubj: "Tag giá số 0", reason: "Thuật ngữ khoa học",
   items: [{id: "c17-tag-zero", kind: "asset", assetId: "A01", role: "tag số 0", motion: "scale", semanticRole: "subject", motifKey: "tag-zero", transform: {from: {x: -190, y: 20, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c17-zeroprice-tag", kind: "code", codeTemplate: "label", text: "ZERO-PRICE EFFECT:\nHIỆU ỨNG GIÁ BẰNG 0", role: "thuật ngữ", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C18
  {id: "C18", phrase: "Nghe rất hợp", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Hợp lý cho chữ miễn phí",
   role: "context", family: "proof-comparison", spokenSubj: "Hợp lý cho miễn phí", visualSubj: "Tag giá số 0", reason: "Kết nối bài học",
   items: [{id: "c18-tag-zero", kind: "asset", assetId: "A01", role: "tag số 0", motion: "none", semanticRole: "subject", motifKey: "tag-zero", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c18-free-tag", kind: "code", codeTemplate: "label", text: "SỨC HÚT CỦA\nCHỮ “MIỄN PHÍ”", role: "sức hút free", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C19
  {id: "C19", phrase: "Nhưng miễn phí", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Miễn phí không phải tấm khăn phủ điều kiện",
   role: "context", family: "application-audit", spokenSubj: "Không phủ điều kiện", visualSubj: "Giao diện checkout điện thoại", reason: "Cảnh báo minh bạch",
   items: [{id: "c19-checkout", kind: "asset", assetId: "A07", role: "checkout điện thoại", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c19-notrap-tag", kind: "code", codeTemplate: "warning", text: "KHÔNG BIẾN FREE\nTHÀNH CÁI BẪY", role: "cảnh báo cái bẫy", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C20
  {id: "C20", phrase: "Nếu còn phí", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nếu còn phí bắt buộc nói sớm",
   role: "literal-evidence", family: "application-audit", spokenSubj: "Phí bắt buộc nói sớm", visualSubj: "Giao diện checkout", reason: "Nguyên tắc 1",
   items: [{id: "c20-checkout", kind: "asset", assetId: "A07", role: "checkout điện thoại", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c20-fee-early", kind: "code", codeTemplate: "label", text: "1. PHÍ BẮT BUỘC:\nPHẢI NÓI SỚM", role: "nói sớm", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C21
  {id: "C21", phrase: "Nếu có giới", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nếu có giới hạn số lượng nói rõ",
   role: "literal-evidence", family: "application-audit", spokenSubj: "Giới hạn nói rõ", visualSubj: "Giao diện checkout", reason: "Nguyên tắc 2",
   items: [{id: "c21-checkout", kind: "asset", assetId: "A07", role: "checkout điện thoại", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c21-limit-clear", kind: "code", codeTemplate: "label", text: "2. GIỚI HẠN SỐ LƯỢNG:\nPHẢI NÓI RÕ", role: "nói rõ", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C22
  {id: "C22", phrase: "Một ưu đãi", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Ưu đãi tốt làm khách hiểu mình đang nhận gì",
   role: "context", family: "human-choice", spokenSubj: "Khách hiểu đang nhận gì", visualSubj: "Chủ shop dùng điện thoại kiểm tra", reason: "Chuẩn mực ưu đãi",
   items: [{id: "c22-owner-audit", kind: "asset", assetId: "A06", role: "chủ shop audit", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c22-good-offer", kind: "code", codeTemplate: "label", text: "ƯU ĐÃI TỐT:\nKHÁCH HIỂU RÕ", role: "ưu đãi tốt", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C23
  {id: "C23", phrase: "Nó không bắt", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Không bắt khách đi hết checkout mới biết",
   role: "literal-evidence", family: "human-choice", spokenSubj: "Không giấu điều kiện", visualSubj: "Chủ shop dùng điện thoại", reason: "Trải nghiệm mua hàng",
   items: [{id: "c23-owner-audit", kind: "asset", assetId: "A06", role: "chủ shop audit", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c23-nohide-tag", kind: "code", codeTemplate: "warning", text: "ĐỪNG GIẤU\nĐẾN CUỐI CHECKOUT", role: "không giấu", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C24
  {id: "C24", phrase: "Thử mở các", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Thử mở các ưu đãi của shop trên điện thoại",
   role: "human-action", family: "application-audit", spokenSubj: "Audit ưu đãi", visualSubj: "Chủ shop audit", reason: "Hành động thực tế",
   items: [{id: "c24-owner-audit", kind: "asset", assetId: "A06", role: "chủ shop audit", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c24-test-phone", kind: "code", codeTemplate: "label", text: "MỞ ĐIỆN THOẠI\nKIỂM TRA SHOP BẠN", role: "test phone", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C25
  {id: "C25", phrase: "Khoanh mọi", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Khoanh mọi điều kiện trước nút quyết định",
   role: "human-action", family: "application-audit", spokenSubj: "Khoanh điều kiện", visualSubj: "Mascot cầm checklist", reason: "Checklist kiểm tra",
   items: [{id: "c25-save-gesture", kind: "asset", assetId: "A08", role: "checklist kiểm tra", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c25-check-tag", kind: "code", codeTemplate: "label", text: "HIỆN ĐIỀU KIỆN\nTRƯỚC NÚT MUA", role: "hiện điều kiện", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C26
  {id: "C26", phrase: "Lưu video này", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Lưu video và kiểm tra lại chữ miễn phí",
   role: "motif-anchor", family: "cta-close", spokenSubj: "CTA lưu video", visualSubj: "Mascot và nút save", reason: "Khép lại video",
   items: [{id: "c26-save-gesture", kind: "asset", assetId: "A08", role: "checklist kiểm tra", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c26-save-btn", kind: "code", codeTemplate: "button", text: "LƯU VIDEO\nAUDIT SHOP BẠN", role: "nút CTA duy nhất", motion: "stamp", sfx: "ding", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]}
];

// Align cues with exact Whisper timestamps
let cursor = 0;
const visualCues = [];
for (let i = 0; i < rawCues.length; i++) {
  const cueDef = rawCues[i];
  const wIdx = findWordIndex(cueDef.phrase, cursor);
  cursor = wIdx;
  const startMs = i === 0 ? 0 : words[wIdx].startMs;
  visualCues.push({
    ...cueDef,
    startMs,
    wIdx
  });
}

for (let i = 0; i < visualCues.length; i++) {
  const nextStart = i < visualCues.length - 1 ? visualCues[i + 1].startMs : durationMs;
  visualCues[i].endMs = nextStart;
  for (const it of visualCues[i].items) {
    it.enterMs = visualCues[i].startMs;
  }
}

// Ensure first cue holds at least 1.0s
if (visualCues[0].endMs < 1000) {
  visualCues[0].endMs = 1000;
  if (visualCues[1]) visualCues[1].startMs = 1000;
}

// Beats timing adjusted for 1.1x speed (49,420ms duration)
const beatTimings = [
  {id: "B01", startMs: 0, endMs: 2600, headline: "1 ĐỒNG NHỎ · SỐ 0 ĐẶC BIỆT", body: "Mở bằng nghịch lý nhìn thấy được", mascot: "thinking"},
  {id: "B02", startMs: 2600, endMs: 7700, headline: "THỬ ĐOÁN NHÉ: 1K vs 0 ĐỒNG", body: "Cho người xem tự đoán", mascot: "thinking"},
  {id: "B03", startMs: 7700, endMs: 14240, headline: "PHÉP TRỪ TOÁN HỌC: 9K = 9K?", body: "Lật từ trực giác sang trải nghiệm", mascot: "confuse"},
  {id: "B04", startMs: 14240, endMs: 23800, headline: "GIÁ BẰNG 0 ≠ GIÁ THẤP BÌNH THƯỜNG", body: "Giải thích cơ chế đời thường", mascot: "happy"},
  {id: "B05", startMs: 23800, endMs: 35160, headline: "NGHIÊN CỨU: ZERO-PRICE EFFECT", body: "Đưa bằng chứng nghiên cứu", mascot: "research"},
  {id: "B06", startMs: 35160, endMs: 40800, headline: "ĐỪNG BIẾN 'FREE' THÀNH CÁI BẪY", body: "Chốt bài học minh bạch", mascot: "pointing"},
  {id: "B07", startMs: 40800, endMs: durationMs, headline: "AUDIT LẠI CHỮ MIỄN PHÍ", body: "Checklist áp dụng và CTA", mascot: "working"}
];

// Assets mapping
const assets = [
  {id: "A01", src: "ep012/v01/generated/a01-price-tags-zero-contrast-alpha-v01.png", alt: "hai tag giá", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A02", src: "ep012/v01/generated/a02-buyer-hand-tag-conditions-alpha-v01.png", alt: "tay khách cầm tag", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A03", src: "ep012/v01/generated/a03-small-products-tag-pair-alpha-v01.png", alt: "hai sản phẩm kẹp tóc", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A04", src: "ep012/v01/generated/a04-receipt-proof-gap-alpha-v01.png", alt: "hai hóa đơn", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A05", src: "ep012/v01/generated/a05-giftbox-zero-marker-alpha-v01.png", alt: "hộp quà số 0", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A06", src: "ep012/v01/generated/a06-owner-audit-conditions-alpha-v01.png", alt: "chủ shop audit", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A07", src: "ep012/v01/generated/a07-checkout-cost-line-alpha-v01.png", alt: "checkout điện thoại", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A08", src: "ep012/v01/generated/a08-save-gesture-checklist-alpha-v01.png", alt: "checklist kiểm tra", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false}
];

// Build final Episode JSON payload
const episode = {
  schemaVersion: 2,
  id: "EP012",
  episodeId: "EP012",
  version: "v01",
  title: brief.creativeContract.title,
  slug: "so-khong-co-tieng-noi-rieng",
  durationMs,
  totalFrames: Math.ceil(durationMs / frameMs),
  targetFps: 30,
  audioFile: "audio/ep012-voice-cartesia-processed-v01.wav",
  audio: {
    voiceSrc: "audio/ep012-voice-cartesia-processed-v01.wav",
    voiceVolume: 1.0,
    musicSrc: "audio/background-music.mp3",
    musicVolume: 0.12,
    durationMs,
    words,
    captions
  },
  motionGrammar: "continuous-stage-v1",
  narrativeObject: "tag giá số 0",
  beats: beatTimings,
  visualCues: visualCues.map(c => ({
    id: c.id,
    startMs: c.startMs,
    endMs: c.endMs,
    spokenAnchor: c.phrase,
    semanticIntent: c.intent,
    spokenSubject: c.spokenSubj,
    visualSubject: c.visualSubj,
    visualReason: c.reason,
    sceneFamily: c.family,
    continuityRole: c.role,
    composition: c.comp,
    exit: c.exit,
    camera: c.cam,
    transition: c.trans,
    items: c.items
  })),
  assets,
  creativeContract: brief.creativeContract,
  topicKeywords: brief.topicKeywords,
  editBlueprint: brief.editBlueprint
};

await writeFile(new URL("src/data/ep012-v01-episode.json", root), JSON.stringify(episode, null, 2) + "\n");
await writeFile(new URL("src/data/ep012-v01-captions.json", root), JSON.stringify(captions, null, 2) + "\n");
await writeFile(new URL("src/data/ep012-v01-words.json", root), JSON.stringify(words, null, 2) + "\n");
await writeFile(new URL("creatorflow/ep012-episode.json", root), JSON.stringify(episode, null, 2) + "\n");

console.log(`PASS: Built EP012 v01 episode (${visualCues.length} cues, ${durationMs}ms duration)`);
