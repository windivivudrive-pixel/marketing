import {readFile, writeFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const brief = JSON.parse(await readFile(new URL("briefs/ep010-quay-hai-muoi-bon-vi-v01.json", root), "utf8"));
const wordsJson = JSON.parse(await readFile(new URL("creatorflow/ep010-words-v01.json", root), "utf8"));
const words = (wordsJson.words || wordsJson).map(w => ({
  ...w,
  timestampMs: w.startMs,
  confidence: 1.0
}));
const captionsJson = JSON.parse(await readFile(new URL("creatorflow/ep010-captions-v01.json", root), "utf8"));
const captions = (captionsJson.captions || captionsJson).map(c => ({
  ...c,
  timestampMs: c.startMs,
  confidence: 1.0
}));

const clean = (value) => String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "");
const durationMs = words.at(-1)?.endMs + 350 || 42800;
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
  {id: "C01", phrase: "Quầy hai mươi bốn vị", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Mở đầu thumbnail đối lập 24 vị vs 6 vị",
   role: "motif-anchor", family: "choice-hook", spokenSubj: "Hai quầy số vị đối lập", visualSubj: "Hai kệ hũ mứt 24 vị và 6 vị", reason: "Thumbnail mở đầu",
   items: [{id: "c01-two-displays", kind: "asset", assetId: "A01", role: "hai kệ hũ mứt đối lập", motion: "stamp", sfx: "whoosh", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: 0, y: -40, scale: 0.95, rotation: -2, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 1, opacity: 1}, easing: "ease-out"}}]},

  // C02
  {id: "C02", phrase: "hấp dẫn hơn", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nhấn mạnh vẻ hấp dẫn của quầy nhiều vị",
   role: "literal-evidence", family: "choice-hook", spokenSubj: "Vẻ ngoài hấp dẫn", visualSubj: "Kệ 24 vị kèm tag hấp dẫn", reason: "Thừa nhận trực giác",
   items: [{id: "c02-displays", kind: "asset", assetId: "A01", role: "hai kệ hũ mứt", motion: "none", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, easing: "linear"}},
           {id: "c02-attract-tag", kind: "code", codeTemplate: "label", text: "24 VỊ:\nHẤP DẪN HƠN", role: "trực giác ban đầu", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C03
  {id: "C03", phrase: "sao khách lại dễ bỏ đi", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Đặt nghịch lý vì sao khách dễ bỏ đi",
   role: "literal-evidence", family: "choice-hook", spokenSubj: "Khách bỏ đi", visualSubj: "Kệ hũ kèm nhãn cảnh báo bỏ đi", reason: "Khơi gợi tò mò",
   items: [{id: "c03-displays", kind: "asset", assetId: "A01", role: "hai kệ hũ mứt", motion: "none", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, easing: "linear"}},
           {id: "c03-walk-tag", kind: "code", codeTemplate: "warning", text: "SAO KHÁCH LẠI\nDỄ BỎ ĐI?", role: "nghịch lý tò mò", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C04
  {id: "C04", phrase: "Bạn đoán nhé", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Mời khán giả tham gia đoán",
   role: "human-action", family: "prediction-copy", spokenSubj: "Khán giả đoán", visualSubj: "Câu hỏi đoán 24 hay 6", reason: "Tăng tương tác",
   items: [{id: "c04-displays", kind: "asset", assetId: "A01", role: "hai kệ hũ mứt", motion: "none", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, easing: "linear"}},
           {id: "c04-guess-tag", kind: "code", codeTemplate: "label", text: "BẠN ĐOÁN NHÉ:\n24 HAY 6?", role: "câu hỏi tương tác", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C05
  {id: "C05", phrase: "quầy hai mươi bốn vị hay quầy sáu vị", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "So sánh trực quan 2 phương án",
   role: "human-action", family: "choice-comparison", spokenSubj: "So 2 phương án", visualSubj: "Bàn tay chỉ qua lại", reason: "Hành động người mua",
   items: [{id: "c05-hand", kind: "asset", assetId: "A03", role: "bàn tay so sánh", motion: "slide", sfx: "whoosh", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.92, rotation: -2, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C06
  {id: "C06", phrase: "dễ khiến khách chọn hơn", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Đặt câu hỏi quầy nào dễ chốt đơn hơn",
   role: "human-action", family: "choice-comparison", spokenSubj: "Quầy nào dễ chọn", visualSubj: "Bàn tay kèm nhãn câu hỏi", reason: "Chốt câu hỏi so sánh",
   items: [{id: "c06-hand", kind: "asset", assetId: "A03", role: "bàn tay so sánh", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c06-which-tag", kind: "code", codeTemplate: "label", text: "QUẦY NÀO\nDỄ CHỌN HƠN?", role: "câu hỏi chốt đơn", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C07
  {id: "C07", phrase: "Quầy lớn trông vui mắt", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "mask-reveal",
   intent: "Cận cảnh 24 hũ sắc màu",
   role: "literal-evidence", family: "visual-attraction", spokenSubj: "Quầy lớn vui mắt", visualSubj: "24 hũ mứt sắc màu", reason: "Hình ảnh trực quan",
   items: [{id: "c07-dense-jars", kind: "asset", assetId: "A05", role: "24 hũ mứt", motion: "reveal", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: -1, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C08
  {id: "C08", phrase: "ai cũng muốn dừng lại xem", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "reframe",
   intent: "Mọi người đều dừng lại xem",
   role: "literal-evidence", family: "visual-attraction", spokenSubj: "Dừng lại xem", visualSubj: "24 hũ kèm nhãn dừng lại", reason: "Khẳng định lưu lượng",
   items: [{id: "c08-dense-jars", kind: "asset", assetId: "A05", role: "24 hũ mứt", motion: "none", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c08-stop-tag", kind: "code", codeTemplate: "label", text: "AI CŨNG MUỐN\nDỪNG LẠI XEM", role: "hút khách ban đầu", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C09
  {id: "C09", phrase: "Nhưng đứng trước hai mươi bốn hũ", comp: "solo", exit: "carry", cam: {mode: "pan", intensity: "subtle"}, trans: "cut",
   intent: "Khách đứng trước quầy phân vân",
   role: "human-action", family: "shopper-hesitation", spokenSubj: "Khách phân vân", visualSubj: "Khách ngập ngừng tay", reason: "Tâm lý người mua",
   items: [{id: "c09-hesitate", kind: "asset", assetId: "A02", role: "khách phân vân", motion: "slide", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.92, rotation: -2, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C10
  {id: "C10", phrase: "khách phải tự so vị này với vị kia", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Khách tự so từng vị với nhau",
   role: "human-action", family: "comparison-action", spokenSubj: "Tự so từng vị", visualSubj: "Khách kèm tag tự so", reason: "Gánh nặng so sánh",
   items: [{id: "c10-hesitate", kind: "asset", assetId: "A02", role: "khách phân vân", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c10-compare-tag", kind: "code", codeTemplate: "label", text: "TỰ SO TỪNG VỊ\nVỚI NHAU", role: "gánh nặng so", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C11
  {id: "C11", phrase: "rồi lại sợ chọn nhầm", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "reframe",
   intent: "Nỗi sợ chọn nhầm",
   role: "literal-evidence", family: "choice-anxiety", spokenSubj: "Sợ chọn nhầm", visualSubj: "Khách kèm nhãn cảnh báo sợ nhầm", reason: "Rào cản tâm lý",
   items: [{id: "c11-hesitate", kind: "asset", assetId: "A02", role: "khách phân vân", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c11-fear-tag", kind: "code", codeTemplate: "warning", text: "SỢ CHỌN NHẦM!", role: "áp lực mua hàng", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C12
  {id: "C12", phrase: "Mỗi món mới", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "zoom-through",
   intent: "Mỗi món mới thêm phép so sánh",
   role: "context", family: "comparison-network", spokenSubj: "Thêm so sánh", visualSubj: "Bàn tay so sánh kèm tag", reason: "Quy luật xử lý",
   items: [{id: "c12-hand", kind: "asset", assetId: "A03", role: "bàn tay so", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c12-tag", kind: "code", codeTemplate: "label", text: "+1 LỰA CHỌN\n= +1 SO SÁNH", role: "quy luật", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C13
  {id: "C13", phrase: "Đây là lúc nhiều lựa chọn", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "match-move",
   intent: "Nhiều lựa chọn dày đặc",
   role: "context", family: "shopper-overload", spokenSubj: "Nhiều lựa chọn", visualSubj: "24 hũ dày đặc", reason: "Minh họa quá tải",
   items: [{id: "c13-dense", kind: "asset", assetId: "A05", role: "24 hũ dày", motion: "scale", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: 0, y: 20, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C14
  {id: "C14", phrase: "biến thành nhiều việc phải làm", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "reframe",
   intent: "Biến thành việc phải làm",
   role: "context", family: "shopper-overload", spokenSubj: "Việc phải làm", visualSubj: "24 hũ kèm nhãn việc phải làm", reason: "Khái quát cơ chế",
   items: [{id: "c14-dense", kind: "asset", assetId: "A05", role: "24 hũ dày", motion: "none", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c14-work-tag", kind: "code", codeTemplate: "warning", text: "NHIỀU LỰA CHỌN\n= NHIỀU VIỆC", role: "gánh nặng", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C15
  {id: "C15", phrase: "Một nghiên cứu nổi tiếng", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Dẫn chứng nghiên cứu thực chứng",
   role: "literal-evidence", family: "choice-study", spokenSubj: "Nghiên cứu khoa học", visualSubj: "Hai kệ hũ nghiên cứu", reason: "Nguồn chứng minh",
   items: [{id: "c15-displays", kind: "asset", assetId: "A01", role: "hai kệ nghiên cứu", motion: "reveal", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C16
  {id: "C16", phrase: "trước quầy hai mươi bốn lựa chọn và quầy sáu lựa chọn", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Thiết lập quầy 24 vs quầy 6",
   role: "literal-evidence", family: "choice-study", spokenSubj: "24 vs 6 lựa chọn", visualSubj: "Hai kệ kèm tag 24 vs 6", reason: "Thiết lập thí nghiệm",
   items: [{id: "c16-displays", kind: "asset", assetId: "A01", role: "hai kệ nghiên cứu", motion: "none", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c16-study-tag", kind: "code", codeTemplate: "label", text: "THÍ NGHIỆM:\n24 VỊ vs 6 VỊ", role: "thí nghiệm", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C17
  {id: "C17", phrase: "Tập lớn thu hút sự chú ý", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Tập lớn thu hút 60% chú ý",
   role: "literal-evidence", family: "study-proof", spokenSubj: "Thu hút chú ý", visualSubj: "Quầy 24 vị kèm số liệu 60%", reason: "Số liệu thực tế",
   items: [{id: "c17-dense", kind: "asset", assetId: "A05", role: "24 hũ", motion: "none", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c17-view-tag", kind: "code", codeTemplate: "label", text: "24 VỊ:\n60% DỪNG XEM", role: "thu hút", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C18
  {id: "C18", phrase: "còn tập giới hạn tạo điều kiện để quyết định", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "match-move",
   intent: "Tập 6 vị có tỷ lệ mua 30% cao gấp 10 lần",
   role: "literal-evidence", family: "study-proof", spokenSubj: "Tập giới hạn dễ quyết định", visualSubj: "Kệ 6 hũ kèm số liệu mua gấp 10x", reason: "Chứng minh cốt lõi",
   items: [{id: "c18-six", kind: "asset", assetId: "A04", role: "6 hũ gọn", motion: "reveal", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: -190, y: 0, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c18-buy-tag", kind: "code", codeTemplate: "label", text: "6 VỊ: DỄ CHỌN\nMUA CAO GẤP 10X", role: "kết quả mua hàng", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C19
  {id: "C19", phrase: "Nhưng khoan", comp: "solo", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "cut",
   intent: "Chặn suy nghĩ tiêu cực đi xóa sản phẩm",
   role: "context", family: "lesson-flip", spokenSubj: "Không xóa sản phẩm", visualSubj: "Chủ shop phân loại", reason: "Chỉnh sửa góc nhìn",
   items: [{id: "c19-owner", kind: "asset", assetId: "A06", role: "chủ shop phân loại", motion: "slide", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.92, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C20
  {id: "C20", phrase: "không phải cứ xóa bớt sản phẩm là bán tốt", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Khẳng định không cần xóa sản phẩm",
   role: "context", family: "lesson-flip", spokenSubj: "Không cần xóa", visualSubj: "Chủ shop kèm tag không xóa", reason: "Uốn nắn bài học",
   items: [{id: "c20-owner", kind: "asset", assetId: "A06", role: "chủ shop", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c20-nodelete-tag", kind: "code", codeTemplate: "warning", text: "KHÔNG CẦN\nXÓA SẢN PHẨM", role: "cảnh báo sai lầm", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C21
  {id: "C21", phrase: "Bài học nằm ở cách tổ chức", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Bài học nằm ở cách tổ chức",
   role: "context", family: "lesson-copy", spokenSubj: "Cách tổ chức", visualSubj: "Chủ shop kèm tag tổ chức", reason: "Giải pháp",
   items: [{id: "c21-owner", kind: "asset", assetId: "A06", role: "chủ shop", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c21-org-tag", kind: "code", codeTemplate: "label", text: "BÀI HỌC:\nCÁCH TỔ CHỨC", role: "giải pháp", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C22
  {id: "C22", phrase: "Giữ đủ danh mục", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Giữ danh mục và gom 3 lối vào",
   role: "human-action", family: "choice-path-audit", spokenSubj: "Gom 3 lối vào", visualSubj: "Điện thoại gom danh mục", reason: "Hành động thực chiến",
   items: [{id: "c22-phone", kind: "asset", assetId: "A08", role: "điện thoại gom nhóm", motion: "slide", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: -1, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C23
  {id: "C23", phrase: "nhưng gom lối vào thành ba tình huống", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Chia 3 nhóm tình huống",
   role: "human-action", family: "choice-path-audit", spokenSubj: "3 tình huống", visualSubj: "Điện thoại kèm tag 3 lối vào", reason: "Khung phân loại",
   items: [{id: "c23-phone", kind: "asset", assetId: "A08", role: "điện thoại gom nhóm", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c23-paths-tag", kind: "code", codeTemplate: "label", text: "GOM THÀNH\n3 LỐI VÀO", role: "3 lối vào", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C24
  {id: "C24", phrase: "mới dùng lần đầu cần giải pháp nhanh", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Liệt kê 3 nhóm: Lần đầu, Nhanh, Chuyên sâu",
   role: "literal-evidence", family: "choice-path-audit", spokenSubj: "Chi tiết 3 nhóm", visualSubj: "Điện thoại kèm danh sách 3 nhóm", reason: "Khung hành động",
   items: [{id: "c24-phone", kind: "asset", assetId: "A08", role: "điện thoại", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c24-groups-tag", kind: "code", codeTemplate: "label", text: "1. LẦN ĐẦU\n2. NHANH GỌN\n3. CHUYÊN SÂU", role: "danh sách 3 nhóm", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C25
  {id: "C25", phrase: "hoặc muốn lựa chọn chuyên sâu", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Khách tự tin chọn đúng nhu cầu",
   role: "human-action", family: "organized-choice-payoff", spokenSubj: "Chọn nhu cầu trước", visualSubj: "Khách chọn 1 hũ kèm tag", reason: "Kết quả tích cực",
   items: [{id: "c25-shopper", kind: "asset", assetId: "A07", role: "khách tự tin", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 0.92, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "ease-out"}},
           {id: "c25-need-tag", kind: "code", codeTemplate: "label", text: "CHỌN NHU CẦU TRƯỚC\nCHỌN MÓN SAU", role: "nguyên lý", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C26
  {id: "C26", phrase: "Khách chọn nhu cầu trước rồi mới chọn món", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Trải nghiệm mua sắm nhẹ nhàng",
   role: "literal-evidence", family: "organized-choice-payoff", spokenSubj: "Trải nghiệm nhẹ nhàng", visualSubj: "Khách vui vẻ kèm tag nhẹ nhàng", reason: "Payoff tâm lý",
   items: [{id: "c26-shopper", kind: "asset", assetId: "A07", role: "khách vui vẻ", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c26-exam-tag", kind: "code", codeTemplate: "label", text: "KHÔNG CÒN CẢM GIÁC\nLÀM BÀI THI", role: "trải nghiệm nhẹ nhàng", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C27
  {id: "C27", phrase: "Đỡ cảm giác đang làm bài thi giữa quầy hàng", comp: "solo", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "zoom-through",
   intent: "Kệ 6 vị gọn gàng kết thúc hành trình",
   role: "motif-anchor", family: "organized-choice-payoff", spokenSubj: "Kệ gọn gàng", visualSubj: "Kệ 6 vị gọn gàng", reason: "Hình ảnh kết",
   items: [{id: "c27-six", kind: "asset", assetId: "A04", role: "kệ 6 vị gọn", motion: "none", semanticRole: "subject", motifKey: "choice-jam-jar", transform: {from: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}}]},

  // C28
  {id: "C28", phrase: "Lưu video", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Kêu gọi lưu video để gom 3 lối vào",
   role: "human-action", family: "cta", spokenSubj: "CTA lưu video", visualSubj: "Điện thoại và nút CTA", reason: "Một lời kêu gọi duy nhất",
   items: [{id: "c28-phone", kind: "asset", assetId: "A08", role: "điện thoại", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c28-btn", kind: "code", codeTemplate: "button", text: "LƯU ĐỂ GOM\n3 LỐI VÀO", role: "nút CTA", motion: "stamp", sfx: "ding", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]}
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

// Adjust beats contiguous timings to exactly match durationMs
const beatTimings = [
  {id: "B01", startMs: 0, endMs: 2700, headline: "24 HAY 6?", body: "Đặt nghịch lý bằng vật thể quen thuộc", mascot: "thinking"},
  {id: "B02", startMs: 2700, endMs: 8780, headline: "HÚT MẮT CHƯA CHẮC DỄ CHỌN", body: "Khán giả đoán và theo dõi tình huống", mascot: "happy"},
  {id: "B03", startMs: 8780, endMs: 16560, headline: "MỖI MÓN · THÊM 1 SO SÁNH", body: "Lật giả định trực giác ban đầu", mascot: "confuse"},
  {id: "B04", startMs: 16560, endMs: 26260, headline: "NHIỀU LỰA CHỌN · NHIỀU VIỆC", body: "Giải cơ chế bằng tiếng Việt đời thường", mascot: "research"},
  {id: "B05", startMs: 26260, endMs: 30490, headline: "BẰNG CHỨNG CÓ BỐI CẢNH", body: "Đưa bằng chứng thí nghiệm có nguồn", mascot: "pointing"},
  {id: "B06", startMs: 30490, endMs: 36040, headline: "ĐỪNG XÓA SẢN PHẨM", body: "Chốt đúng một bài học tổ chức", mascot: "working"},
  {id: "B07", startMs: 36040, endMs: durationMs, headline: "GOM LỐI VÀO", body: "Cho thao tác áp dụng và một CTA", mascot: "thumbup"}
];

// Assets mapping to existing public files
const assets = [
  {id: "A01", src: "ep010/v01/generated/a01-two-jam-displays-alpha-v01.png", alt: "hai kệ hũ mứt 24 vị và 6 vị", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A02", src: "ep010/v01/generated/a02-hesitating-shopper-alpha-v01.png", alt: "khách hàng phân vân trước quầy", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A03", src: "ep010/v01/generated/a03-hand-reaching-jars-alpha-v01.png", alt: "bàn tay chỉ so sánh các hũ", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A04", src: "ep010/v01/generated/a04-six-plain-jars-alpha-v01.png", alt: "kệ 6 vị gọn gàng", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A05", src: "ep010/v01/generated/a05-many-plain-jars-alpha-v01.png", alt: "cụm 24 hũ mứt sắc màu", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A06", src: "ep010/v01/generated/a06-owner-sorting-products-alpha-v01.png", alt: "chủ shop phân loại sản phẩm", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A07", src: "ep010/v01/generated/a07-shopper-choosing-alpha-v01.png", alt: "khách tự tin chọn 1 hũ", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A08", src: "ep010/v01/generated/a08-phone-catalog-audit-alpha-v01.png", alt: "điện thoại gom danh mục 3 lối vào", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false}
];

// Build final Episode JSON payload
const episode = {
  schemaVersion: 2,
  id: "EP010",
  episodeId: "EP010",
  version: "v01",
  title: brief.creativeContract.title,
  slug: "quay-hai-muoi-bon-vi",
  durationMs,
  totalFrames: Math.ceil(durationMs / frameMs),
  targetFps: 30,
  audioFile: "audio/ep010-voice-cartesia-processed-v01.wav",
  audio: {
    voiceSrc: "audio/ep010-voice-cartesia-processed-v01.wav",
    voiceVolume: 1.0,
    musicSrc: "audio/background-music.mp3",
    musicVolume: 0.12,
    durationMs,
    words,
    captions
  },
  motionGrammar: "continuous-stage-v1",
  narrativeObject: "Hũ mứt nhỏ",
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

await writeFile(new URL("src/data/ep010-v01-episode.json", root), JSON.stringify(episode, null, 2) + "\n");
await writeFile(new URL("src/data/ep010-v01-captions.json", root), JSON.stringify(captions, null, 2) + "\n");
await writeFile(new URL("src/data/ep010-v01-words.json", root), JSON.stringify(words, null, 2) + "\n");
await writeFile(new URL("creatorflow/ep010-episode.json", root), JSON.stringify(episode, null, 2) + "\n");

console.log(`PASS: Built EP010 v01 episode (${visualCues.length} cues, ${durationMs}ms duration)`);
