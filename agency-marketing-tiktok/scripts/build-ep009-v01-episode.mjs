import {readFile, writeFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const brief = JSON.parse(await readFile(new URL("briefs/ep009-phi-ship-xuat-hien-cuoi-v01.json", root), "utf8"));
const wordsJson = JSON.parse(await readFile(new URL("creatorflow/ep009-words-v01.json", root), "utf8"));
const words = (wordsJson.words || wordsJson).map(w => ({
  ...w,
  timestampMs: w.startMs,
  confidence: 1.0
}));
const captionsJson = JSON.parse(await readFile(new URL("creatorflow/ep009-captions-v01.json", root), "utf8"));
const captions = (captionsJson.captions || captionsJson).map(c => ({
  ...c,
  timestampMs: c.startMs,
  confidence: 1.0
}));

const clean = (value) => String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "");
const durationMs = words.at(-1)?.endMs + 350 || 45000;
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
  {id: "C01", phrase: "Cùng trả hai trăm hai chín nghìn", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Mở đầu thumbnail đối lập hai checkout cùng tổng tiền",
   role: "motif-anchor", family: "checkout-hook", spokenSubj: "Hai checkout cùng tổng", visualSubj: "Hai điện thoại checkout bên cạnh tem phí ship", reason: "Thumbnail mở đầu 1s",
   items: [{id: "c01-phones", kind: "asset", assetId: "A01", role: "hai điện thoại cùng tổng", motion: "stamp", sfx: "whoosh", semanticRole: "subject", motifKey: "late-shipping-fee", transform: {from: {x: 0, y: -40, scale: 0.95, rotation: -2, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 1, opacity: 1}, easing: "ease-out"}}]},

  // C02
  {id: "C02", phrase: "sao phí ship", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Đặt câu hỏi nghịch lý về thời điểm hiện phí ship",
   role: "literal-evidence", family: "checkout-hook", spokenSubj: "Phí ship hiện cuối", visualSubj: "Hai điện thoại kèm nhãn cảnh báo", reason: "Khơi gợi tò mò của người xem",
   items: [{id: "c02-phones", kind: "asset", assetId: "A01", role: "hai điện thoại", motion: "none", semanticRole: "subject", motifKey: "late-shipping-fee", transform: {from: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, easing: "linear"}},
           {id: "c02-why-tag", kind: "code", codeTemplate: "warning", text: "SAO PHÍ SHIP\nHIỆN CUỐI?", role: "nghịch lý tò mò", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C03
  {id: "C03", phrase: "Thử đoán nhé", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Mời khán giả tham gia đoán",
   role: "human-action", family: "prediction-copy", spokenSubj: "Khán giả đoán", visualSubj: "Hai điện thoại kèm câu hỏi", reason: "Tăng tương tác",
   items: [{id: "c03-phones", kind: "asset", assetId: "A01", role: "hai điện thoại", motion: "none", semanticRole: "subject", motifKey: "late-shipping-fee", transform: {from: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, easing: "linear"}},
           {id: "c03-guess-tag", kind: "code", codeTemplate: "label", text: "THỬ ĐOÁN NHÉ:\nTRÁI vs PHẢI?", role: "câu hỏi tương tác", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C04
  {id: "C04", phrase: "Bên trái", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Giới thiệu bên trái: Giá 229K đã gồm ship",
   role: "literal-evidence", family: "included-checkout", spokenSubj: "Bên trái 229k", visualSubj: "Bưu kiện và điện thoại bên trái", reason: "Thiết lập trường hợp 1",
   items: [{id: "c04-parcel-phone", kind: "asset", assetId: "A08", role: "bưu kiện và điện thoại", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: -1, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c04-left-tag", kind: "code", codeTemplate: "label", text: "BÊN TRÁI:\n229K ĐÃ GỒM SHIP", role: "trường hợp 1", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C05
  {id: "C05", phrase: "đã gồm giao", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Nhấn mạnh đã gồm giao hàng từ đầu",
   role: "literal-evidence", family: "included-price", spokenSubj: "Đã gồm giao hàng", visualSubj: "Bưu kiện và tem giao hàng", reason: "Xác nhận tính minh bạch",
   items: [{id: "c05-parcel-phone", kind: "asset", assetId: "A08", role: "bưu kiện", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c05-clear-tag", kind: "code", codeTemplate: "label", text: "TRỌN GÓI\nTỪ BƯỚC ĐẦU", role: "trọn gói minh bạch", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C06
  {id: "C06", phrase: "Bên phải", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Giới thiệu bên phải: Giá 199K",
   role: "literal-evidence", family: "base-price-checkout", spokenSubj: "Bên phải 199k", visualSubj: "Tay chạm màn hình chọn mua", reason: "Thiết lập trường hợp 2",
   items: [{id: "c06-buyer-tap", kind: "asset", assetId: "A02", role: "tay bấm điện thoại", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c06-right-tag", kind: "code", codeTemplate: "label", text: "BÊN PHẢI:\nGIÁ 199K", role: "giá cơ sở 199k", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C07
  {id: "C07", phrase: "Bạn bấm gần", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Người mua bấm gần tới bước thanh toán",
   role: "human-action", family: "buyer-checkout-action", spokenSubj: "Bấm gần thanh toán", visualSubj: "Cận cảnh tay chạm màn hình", reason: "Thao tác người dùng",
   items: [{id: "c07-buyer-tap", kind: "asset", assetId: "A02", role: "tay bấm thanh toán", motion: "none", semanticRole: "subject", transform: {from: {x: 0, y: 20, scale: 0.95, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C08
  {id: "C08", phrase: "bụp", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Âm thanh bất ngờ: Bụp!",
   role: "literal-evidence", family: "fee-surprise-reaction", spokenSubj: "Bất ngờ xuất hiện", visualSubj: "Tem phí ship bật ra", reason: "Khoảnh khắc bất ngờ",
   items: [{id: "c08-tag-pop", kind: "asset", assetId: "A06", role: "tem phí ship", motion: "stamp", sfx: "sticker-popup", semanticRole: "subject", motifKey: "late-shipping-fee", transform: {from: {x: -190, y: 30, scale: 0.88, rotation: -3, opacity: 0}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c08-bup-tag", kind: "code", codeTemplate: "metric", text: "BỤP!", role: "hiệu ứng bất ngờ", motion: "pop", sfx: "ding", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: 3, opacity: 0}, to: {x: 190, y: 0, scale: 1.1, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C09
  {id: "C09", phrase: "thêm ba mươi", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Thêm 30K phí ship ở bước cuối",
   role: "literal-evidence", family: "fee-surprise-reaction", spokenSubj: "Thêm 30k phí", visualSubj: "Tem phí kèm nhãn cộng 30k", reason: "Chi phí bất ngờ",
   items: [{id: "c09-tag", kind: "asset", assetId: "A06", role: "tem phí ship", motion: "none", semanticRole: "subject", motifKey: "late-shipping-fee", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c09-fee-tag", kind: "code", codeTemplate: "warning", text: "+30K PHÍ SHIP\nỞ BƯỚC CUỐI", role: "phí phát sinh", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C10
  {id: "C10", phrase: "Tổng vẫn giống", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "reframe",
   intent: "So sánh tổng tiền hai bên y hệt nhau 229K",
   role: "literal-evidence", family: "same-total-proof", spokenSubj: "Tổng giống nhau 229k", visualSubj: "Cặp hóa đơn receipt", reason: "Chứng minh toán học",
   items: [{id: "c10-receipts", kind: "asset", assetId: "A04", role: "cặp hóa đơn", motion: "reveal", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c10-same-tag", kind: "code", codeTemplate: "label", text: "TỔNG 2 BÊN:\n229K = 229K", role: "tổng tiền bằng nhau", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C11
  {id: "C11", phrase: "Nhưng bên phải", comp: "solo", exit: "carry", cam: {mode: "pan", intensity: "subtle"}, trans: "cut",
   intent: "Khách hàng bối rối nghi ngờ bên phải",
   role: "human-action", family: "buyer-doubt", spokenSubj: "Khách bối rối", visualSubj: "Khách nhướn mày ngơ ngác", reason: "Tâm lý nghi ngờ",
   items: [{id: "c11-puzzled", kind: "asset", assetId: "A03", role: "khách bối rối", motion: "slide", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.92, rotation: -2, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C12
  {id: "C12", phrase: "Ủa", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "match-move",
   intent: "Phản ứng Ủa: Chưa phải giá thật à?",
   role: "human-action", family: "buyer-doubt", spokenSubj: "Ủa chưa phải giá thật", visualSubj: "Khách bối rối kèm tag câu hỏi", reason: "Cảm giác bị hụt hẫng",
   items: [{id: "c12-puzzled", kind: "asset", assetId: "A03", role: "khách bối rối", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c12-ua-tag", kind: "code", codeTemplate: "warning", text: "ỦA, NÃY GIỜ\nCHƯA PHẢI GIÁ THẬT?", role: "phản xạ nghi ngờ", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C13
  {id: "C13", phrase: "Vấn đề không", comp: "solo", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "zoom-through",
   intent: "Vấn đề không chỉ là 30 nghìn",
   role: "motif-anchor", family: "receipt-analysis", spokenSubj: "Không chỉ là 30k", visualSubj: "Tem phí ship", reason: "Chuyển sang cơ chế tâm lý",
   items: [{id: "c13-tag", kind: "asset", assetId: "A06", role: "tem phí", motion: "scale", semanticRole: "subject", motifKey: "late-shipping-fee", transform: {from: {x: 0, y: 20, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C14
  {id: "C14", phrase: "Não đã lấy", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Giải thích cơ chế não lấy giá đầu làm mốc",
   role: "context", family: "anchor-price", spokenSubj: "Giá đầu làm mốc", visualSubj: "Tem phí kèm nhãn mốc kỳ vọng", reason: "Khái quát cơ chế neo giá",
   items: [{id: "c14-tag", kind: "asset", assetId: "A06", role: "tem phí", motion: "none", semanticRole: "subject", motifKey: "late-shipping-fee", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c14-anchor-tag", kind: "code", codeTemplate: "label", text: "GIÁ ĐẦU TIÊN\n= MỐC KỲ VỌNG", role: "cơ chế neo giá", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C15
  {id: "C15", phrase: "Khi chi phí", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "mask-reveal",
   intent: "Chi phí bắt buộc xuất hiện muộn",
   role: "literal-evidence", family: "late-fee-mechanism", spokenSubj: "Phí xuất hiện muộn", visualSubj: "Khách hàng hoàn tất thanh toán", reason: "Trải nghiệm bị gián đoạn",
   items: [{id: "c15-customer", kind: "asset", assetId: "A07", role: "khách thanh toán", motion: "slide", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C16
  {id: "C16", phrase: "khách phải đánh", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Khách buộc phải đánh giá lại toàn bộ giao dịch",
   role: "context", family: "recalculation-proof", spokenSubj: "Đánh giá lại giao dịch", visualSubj: "Khách hàng kèm nhãn tính lại", reason: "Ma sát tâm lý",
   items: [{id: "c16-customer", kind: "asset", assetId: "A07", role: "khách thanh toán", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c16-recalc-tag", kind: "code", codeTemplate: "warning", text: "BUỘC NÃO PHẢI\nĐÁNH GIÁ LẠI", role: "ma sát tâm lý", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C17
  {id: "C17", phrase: "Trong marketing", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Giới thiệu chiến lược Partitioned Pricing",
   role: "context", family: "partitioned-price-proof", spokenSubj: "Partitioned pricing", visualSubj: "Cặp hóa đơn chia tách giá", reason: "Khái niệm marketing",
   items: [{id: "c17-receipts", kind: "asset", assetId: "A04", role: "hóa đơn tách giá", motion: "reveal", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C18
  {id: "C18", phrase: "Nghiên cứu cho", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Dẫn chứng nghiên cứu về Partitioned Pricing",
   role: "literal-evidence", family: "research-action", spokenSubj: "Nghiên cứu khoa học", visualSubj: "Hóa đơn kèm nhãn nghiên cứu", reason: "Bằng chứng học thuật",
   items: [{id: "c18-receipts", kind: "asset", assetId: "A04", role: "hóa đơn", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c18-study-tag", kind: "code", codeTemplate: "label", text: "NGHIÊN CỨU:\nPARTITIONED PRICING", role: "nguồn nghiên cứu", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C19
  {id: "C19", phrase: "ảnh hưởng việc", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Tách giá ảnh hưởng đến cách khách ghi nhớ mức giá",
   role: "context", family: "conditional-proof", spokenSubj: "Ghi nhớ mức giá", visualSubj: "Hóa đơn kèm nhãn ghi nhớ", reason: "Cơ chế xử lý",
   items: [{id: "c19-receipts", kind: "asset", assetId: "A04", role: "hóa đơn", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c19-memory-tag", kind: "code", codeTemplate: "label", text: "ẢNH HƯỞNG\nCÁCH NHỚ GIÁ", role: "trí nhớ người mua", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C20
  {id: "C20", phrase: "nhưng phản ứng", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Phản ứng phụ thuộc vào mức hợp lý và rõ ràng của phụ phí",
   role: "context", family: "evidence-limit", spokenSubj: "Phụ phí phải hợp lý", visualSubj: "Hóa đơn kèm nhãn hợp lý", reason: "Giới hạn kết luận",
   items: [{id: "c20-receipts", kind: "asset", assetId: "A04", role: "hóa đơn", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c20-fair-tag", kind: "code", codeTemplate: "label", text: "PHỤ PHÍ PHẢI\nRÕ RÀNG & HỢP LÝ", role: "điều kiện phụ phí", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C21
  {id: "C21", phrase: "Vậy đừng vội", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Đừng vội kết luận phải miễn phí giao hàng",
   role: "motif-anchor", family: "lesson-check", spokenSubj: "Đừng kết luận vội", visualSubj: "Tem phí ship", reason: "Uốn nắn tư duy",
   items: [{id: "c21-tag", kind: "asset", assetId: "A06", role: "tem phí", motion: "scale", semanticRole: "subject", motifKey: "late-shipping-fee", transform: {from: {x: 0, y: 20, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C22
  {id: "C22", phrase: "phải miễn phí", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Không nhất thiết phải miễn phí giao hàng",
   role: "context", family: "lesson-check", spokenSubj: "Không cần free ship", visualSubj: "Tem phí kèm nhãn cảnh báo", reason: "Chặn kết luận sai",
   items: [{id: "c22-tag", kind: "asset", assetId: "A06", role: "tem phí", motion: "none", semanticRole: "subject", motifKey: "late-shipping-fee", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c22-nofree-tag", kind: "code", codeTemplate: "warning", text: "KHÔNG NHẤT THIẾT\nPHẢI FREE SHIP", role: "bài học chính xác", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C23
  {id: "C23", phrase: "Hãy tự mua", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "mask-reveal",
   intent: "Chủ shop tự mua thử trên điện thoại",
   role: "human-action", family: "owner-audit-action", spokenSubj: "Tự mua thử", visualSubj: "Chủ shop cầm điện thoại audit", reason: "Hành động thực nghiệm",
   items: [{id: "c23-owner", kind: "asset", assetId: "A05", role: "chủ shop audit", motion: "slide", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C24
  {id: "C24", phrase: "ghi mọi khoản", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Ghi mọi khoản bắt buộc xuất hiện trước nút thanh toán",
   role: "human-action", family: "checkout-audit", spokenSubj: "Ghi mọi khoản bắt buộc", visualSubj: "Chủ shop kèm checklist", reason: "Quy trình kiểm tra",
   items: [{id: "c24-owner", kind: "asset", assetId: "A05", role: "chủ shop audit", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c24-audit-tag", kind: "code", codeTemplate: "label", text: "AUDIT TOÀN BỘ\nKHOẢN BẮT BUỘC", role: "audit chi phí", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C25
  {id: "C25", phrase: "Khoản nào chắc", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Khoản nào chắc chắn phải trả, hãy nói sớm",
   role: "context", family: "checkout-audit", spokenSubj: "Nói sớm chi phí", visualSubj: "Chủ shop kèm lời khuyên", reason: "Nguyên tắc minh bạch",
   items: [{id: "c25-owner", kind: "asset", assetId: "A05", role: "chủ shop audit", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c25-early-tag", kind: "code", codeTemplate: "label", text: "PHÍ BẮT BUỘC:\nHÃY NÓI SỚM!", role: "nguyên tắc minh bạch", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C26
  {id: "C26", phrase: "Đừng để checkout", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Đừng để checkout thành màn jumpscare tài chính",
   role: "literal-evidence", family: "jumpscare-payoff", spokenSubj: "Không jumpscare tài chính", visualSubj: "Tem phí kèm nhãn cảnh báo", reason: "Payoff ấn tượng",
   items: [{id: "c26-tag", kind: "asset", assetId: "A06", role: "tem phí", motion: "reveal", semanticRole: "subject", motifKey: "late-shipping-fee", transform: {from: {x: -190, y: 0, scale: 0.9, rotation: -1, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c26-jumpscare-tag", kind: "code", codeTemplate: "warning", text: "TRÁNH JUMPSCARE\nTÀI CHÍNH!", role: "payoff cốt lõi", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C27
  {id: "C27", phrase: "Lưu video này", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Kêu gọi lưu video để test checkout",
   role: "human-action", family: "cta", spokenSubj: "CTA lưu video", visualSubj: "Bưu kiện và điện thoại kèm nút lưu", reason: "Kêu gọi hành động",
   items: [{id: "c27-parcel", kind: "asset", assetId: "A08", role: "bưu kiện điện thoại", motion: "reveal", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c27-save-btn", kind: "code", codeTemplate: "button", text: "LƯU VIDEO", role: "nút CTA duy nhất", motion: "stamp", sfx: "ding", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C28
  {id: "C28", phrase: "kiểm tra checkout", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "reframe",
   intent: "Khép lại với thông điệp kiểm tra checkout của shop",
   role: "motif-anchor", family: "cta", spokenSubj: "Kiểm tra checkout", visualSubj: "Bưu kiện và nút CTA", reason: "Khép lại video",
   items: [{id: "c28-parcel", kind: "asset", assetId: "A08", role: "bưu kiện điện thoại", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c28-save-btn", kind: "code", codeTemplate: "button", text: "TEST CHECKOUT\nNHƯ KHÁCH MỚI", role: "nút CTA duy nhất", motion: "none", semanticRole: "accent", transform: {from: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}}]}
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
  {id: "B01", startMs: 0, endMs: 3480, headline: "CÙNG TỔNG?", body: "Đặt nghịch lý bằng vật thể quen thuộc", mascot: "thinking"},
  {id: "B02", startMs: 3480, endMs: 13460, headline: "PHÍ XUẤT HIỆN MUỘN", body: "Cho người xem tự đoán và theo dõi tình huống", mascot: "confuse"},
  {id: "B03", startMs: 13460, endMs: 19240, headline: "ỦA, CHƯA PHẢI GIÁ THẬT?", body: "Lật giả định trực giác", mascot: "confuse"},
  {id: "B04", startMs: 19240, endMs: 26400, headline: "GIÁ ĐẦU LÀM MỐC", body: "Giải cơ chế bằng tiếng Việt đời thường trước thuật ngữ", mascot: "research"},
  {id: "B05", startMs: 26400, endMs: 32640, headline: "BẰNG CHỨNG CÓ ĐIỀU KIỆN", body: "Đưa bằng chứng có nguồn và giới hạn kết luận", mascot: "research"},
  {id: "B06", startMs: 32640, endMs: 35020, headline: "ĐỪNG KẾT LUẬN VỘI", body: "Chốt đúng một bài học", mascot: "pointing"},
  {id: "B07", startMs: 35020, endMs: durationMs, headline: "AUDIT CHECKOUT", body: "Cho thao tác áp dụng và một CTA", mascot: "working"}
];

// Assets mapping to existing public files
const assets = [
  {id: "A01", src: "ep009/v01/generated/a01-two-checkout-phones-alpha-v01.png", alt: "hai điện thoại cùng tổng", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A02", src: "ep009/v01/generated/a02-buyer-tapping-phone-alpha-v01.png", alt: "tay bấm điện thoại", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A03", src: "ep009/v01/generated/a03-puzzled-shopper-alpha-v01.png", alt: "khách hàng bối rối", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A04", src: "ep009/v01/generated/a04-receipt-pair-alpha-v01.png", alt: "cặp hóa đơn", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A05", src: "ep009/v01/generated/a05-shop-owner-audit-alpha-v01.png", alt: "chủ shop audit", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A06", src: "ep009/v01/generated/a06-shipping-tag-alpha-v01.png", alt: "tem phí ship", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A07", src: "ep009/v01/generated/a07-checkout-customer-alpha-v01.png", alt: "khách thanh toán", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A08", src: "ep009/v01/generated/a08-parcel-and-phone-alpha-v01.png", alt: "bưu kiện và điện thoại", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false}
];

// Build final Episode JSON payload
const episode = {
  schemaVersion: 2,
  id: "EP009",
  episodeId: "EP009",
  version: "v01",
  title: brief.creativeContract.title,
  slug: "phi-ship-xuat-hien-cuoi",
  durationMs,
  totalFrames: Math.ceil(durationMs / frameMs),
  targetFps: 30,
  audioFile: "audio/ep009-voice-cartesia-processed-v01.wav",
  audio: {
    voiceSrc: "audio/ep009-voice-cartesia-processed-v01.wav",
    voiceVolume: 1.0,
    musicSrc: "audio/background-music.mp3",
    musicVolume: 0.12,
    durationMs,
    words,
    captions
  },
  motionGrammar: "continuous-stage-v1",
  narrativeObject: "Tem phí ship",
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

await writeFile(new URL("src/data/ep009-v01-episode.json", root), JSON.stringify(episode, null, 2) + "\n");
await writeFile(new URL("src/data/ep009-v01-captions.json", root), JSON.stringify(captions, null, 2) + "\n");
await writeFile(new URL("src/data/ep009-v01-words.json", root), JSON.stringify(words, null, 2) + "\n");
await writeFile(new URL("creatorflow/ep009-episode.json", root), JSON.stringify(episode, null, 2) + "\n");

console.log(`PASS: Built EP009 v01 episode (${visualCues.length} cues, ${durationMs}ms duration)`);
