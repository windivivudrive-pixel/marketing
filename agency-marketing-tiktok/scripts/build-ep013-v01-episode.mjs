import {readFile, writeFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const brief = JSON.parse(await readFile(new URL("briefs/ep013-nen-roi-lam-khach-nghi-nhieu-hon-v01.json", root), "utf8"));
const wordsJson = JSON.parse(await readFile(new URL("creatorflow/ep013-words-v01.json", root), "utf8"));
const words = (wordsJson.words || wordsJson).map(w => ({
  ...w,
  timestampMs: w.startMs,
  confidence: 1.0
}));
const captionsJson = JSON.parse(await readFile(new URL("creatorflow/ep013-captions-v01.json", root), "utf8"));
const captions = (captionsJson.captions || captionsJson).map(c => ({
  ...c,
  timestampMs: c.startMs,
  confidence: 1.0
}));

const clean = (value) => String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "");
const durationMs = words.at(-1)?.endMs + 350 || 53240;
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
  {id: "C01", phrase: "Cùng một sản phẩm", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Mở đầu hai điện thoại cùng máy xay (sạch vs rối)",
   role: "motif-anchor", family: "hook-contrast", spokenSubj: "một sản phẩm", visualSubj: "hai điện thoại cùng máy xay", reason: "Thumbnail mở đầu 1s",
   items: [{id: "c01-phones-contrast", kind: "asset", assetId: "A01", role: "hai điện thoại", motion: "stamp", sfx: "whoosh", semanticRole: "subject", motifKey: "phones-contrast", transform: {from: {x: 0, y: -40, scale: 0.95, rotation: -2, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 1, opacity: 1}, easing: "ease-out"}}]},

  // C02
  {id: "C02", phrase: "Nền càng rối", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nền càng rối khách càng nghĩ nhiều hơn",
   role: "literal-evidence", family: "hook-contrast", spokenSubj: "nền rối nghĩ nhiều", visualSubj: "Hai điện thoại kèm badge cảnh báo", reason: "Khơi gợi tò mò",
   items: [{id: "c02-phones-contrast", kind: "asset", assetId: "A01", role: "hai điện thoại", motion: "none", semanticRole: "subject", motifKey: "phones-contrast", transform: {from: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, easing: "linear"}},
           {id: "c02-busy-tag", kind: "code", codeTemplate: "warning", text: "NỀN CÀNG RỐI\nNGHĨ CÀNG NHIỀU", role: "nghĩ nhiều", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C03
  {id: "C03", phrase: "Hai màn hình này", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Hai màn hình cho cùng 1 máy xay",
   role: "comparison", family: "hook-contrast", spokenSubj: "cùng 1 máy xay", visualSubj: "Hai điện thoại", reason: "Thiết lập tình huống",
   items: [{id: "c03-phones-contrast", kind: "asset", assetId: "A01", role: "hai điện thoại", motion: "none", semanticRole: "subject", motifKey: "phones-contrast", transform: {from: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, easing: "linear"}},
           {id: "c03-same-tag", kind: "code", codeTemplate: "label", text: "CÙNG MỘT MÁY XAY\n2 CÁCH TRÌNH BÀY", role: "hai cách trình bày", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C04
  {id: "C04", phrase: "Một bên chỉ có", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Một bên chỉ có bàn tay, trái cây và việc rõ ràng",
   role: "literal-evidence", family: "literal-action", spokenSubj: "bàn tay trái cây", visualSubj: "Hình máy xay bỏ trái cây", reason: "Minh họa bên gọn gàng",
   items: [{id: "c04-blender-use", kind: "asset", assetId: "A03", role: "máy xay trái cây", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c04-clean-tag", kind: "code", codeTemplate: "label", text: "BÊN GỌN GÀNG:\n1 VIỆC RÕ RÀNG", role: "1 việc rõ ràng", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C05
  {id: "C05", phrase: "Bên kia có ảnh", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Bên kia có ảnh nền, icon, sticker chen nhau",
   role: "literal-evidence", family: "mechanism-map", spokenSubj: "icon sticker chen nhau", visualSubj: "Lớp icon sticker rơi lộn xộn", reason: "Minh họa bên quá tải",
   items: [{id: "c05-paper-bundle", kind: "asset", assetId: "A04", role: "icon sticker rơi", motion: "reveal", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c05-crowded-tag", kind: "code", codeTemplate: "warning", text: "BÊN QUÁ TẢI:\nICON & CHỮ CHEN NHAU", role: "chen nhau", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C06
  {id: "C06", phrase: "Thông tin sản phẩm", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Thông tin sản phẩm thật ra không đổi",
   role: "comparison", family: "mechanism-map", spokenSubj: "sản phẩm không đổi", visualSubj: "Lớp icon sticker", reason: "Bản chất máy xay như nhau",
   items: [{id: "c06-paper-bundle", kind: "asset", assetId: "A04", role: "icon sticker", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c06-same-info", kind: "code", codeTemplate: "label", text: "THÔNG TIN MÁY XAY\nTHẬT RA KHÔNG ĐỔI", role: "không đổi", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C07
  {id: "C07", phrase: "Nhưng mắt người", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Mắt người xem phải làm thêm 1 việc",
   role: "human-action", family: "viewer-reaction", spokenSubj: "mắt làm thêm việc", visualSubj: "Tay người xem lướt điện thoại", reason: "Áp lực thị giác",
   items: [{id: "c07-viewer-scroll", kind: "asset", assetId: "A02", role: "tay người xem", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c07-extra-work", kind: "code", codeTemplate: "warning", text: "MẮT PHẢI LÀM\nTHÊM MỘT VIỆC", role: "thêm việc", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C08
  {id: "C08", phrase: "Lọc xem thứ gì", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Lọc xem thứ gì mới đáng chú ý",
   role: "human-action", family: "viewer-reaction", spokenSubj: "lọc thứ đáng chú ý", visualSubj: "Tay người xem", reason: "Ma sát nhận thức",
   items: [{id: "c08-viewer-scroll", kind: "asset", assetId: "A02", role: "tay người xem", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c08-filter-tag", kind: "code", codeTemplate: "label", text: "TỰ LỌC:\nTHỨ GÌ ĐÁNG CHÚ Ý?", role: "tự lọc", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C09
  {id: "C09", phrase: "Đến lúc hiểu", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Đến lúc hiểu máy dùng làm gì ngón tay đã lướt rồi",
   role: "human-action", family: "viewer-reaction", spokenSubj: "ngón tay đã lướt", visualSubj: "Tay người xem vuốt qua", reason: "Hậu quả mất khách",
   items: [{id: "c09-viewer-scroll", kind: "asset", assetId: "A02", role: "tay người xem", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c09-swipe-tag", kind: "code", codeTemplate: "warning", text: "CHƯA KỊP HIỂU\nNGÓN TAY ĐÃ LƯỚT", role: "đã lướt", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C10
  {id: "C10", phrase: "Nền rối không tự", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Nền rối không tự làm sản phẩm kém đi",
   role: "context", family: "hook-contrast", spokenSubj: "không kém đi", visualSubj: "Hai điện thoại", reason: "Khẳng định bản chất",
   items: [{id: "c10-phones-contrast", kind: "asset", assetId: "A01", role: "hai điện thoại", motion: "scale", semanticRole: "subject", motifKey: "phones-contrast", transform: {from: {x: 0, y: 20, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C11
  {id: "C11", phrase: "Nó chỉ làm đường", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nó chỉ làm đường đi tới sản phẩm dài hơn",
   role: "literal-evidence", family: "hook-contrast", spokenSubj: "đường đi dài hơn", visualSubj: "Hai điện thoại", reason: "Tác động ma sát",
   items: [{id: "c11-phones-contrast", kind: "asset", assetId: "A01", role: "hai điện thoại", motion: "none", semanticRole: "subject", motifKey: "phones-contrast", transform: {from: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c11-long-road", kind: "code", codeTemplate: "label", text: "LÀM ĐƯỜNG HIỂU\nSẢN PHẨM DÀI HƠN", role: "đường dài hơn", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C12
  {id: "C12", phrase: "Và cảm giác lựa", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Và cảm giác lựa chọn trở nên nặng hơn",
   role: "context", family: "hook-contrast", spokenSubj: "cảm giác nặng hơn", visualSubj: "Hai điện thoại", reason: "Cơ chế tâm lý",
   items: [{id: "c12-phones-contrast", kind: "asset", assetId: "A01", role: "hai điện thoại", motion: "none", semanticRole: "subject", motifKey: "phones-contrast", transform: {from: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c12-heavy-tag", kind: "code", codeTemplate: "warning", text: "CẢM GIÁC LỰA CHỌN\nTRỞ NÊN NẶNG HƠN", role: "nặng hơn", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C13
  {id: "C13", phrase: "Đó là phần nhiều", comp: "solo", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Đó là phần nhiều video bán hàng hay bỏ qua",
   role: "context", family: "hook-contrast", spokenSubj: "video hay bỏ qua", visualSubj: "Hai điện thoại", reason: "Chuyển ý",
   items: [{id: "c13-phones-contrast", kind: "asset", assetId: "A01", role: "hai điện thoại", motion: "reveal", semanticRole: "subject", motifKey: "phones-contrast", transform: {from: {x: 0, y: 20, scale: 0.95, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C14
  {id: "C14", phrase: "Não không đọc", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Não không đọc mọi thứ với trọng lượng như nhau",
   role: "literal-evidence", family: "mechanism-map", spokenSubj: "trọng lượng khác nhau", visualSubj: "Lớp icon sticker", reason: "Cơ chế não bộ",
   items: [{id: "c14-paper-bundle", kind: "asset", assetId: "A04", role: "icon sticker", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c14-brain-weight", kind: "code", codeTemplate: "label", text: "NÃO KHÔNG ĐỌC\nTRỌNG LƯỢNG NHƯ NHAU", role: "trọng lượng", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C15
  {id: "C15", phrase: "Tín hiệu nào liên", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Tín hiệu nào liên quan sẽ được giữ lại",
   role: "literal-evidence", family: "application-audit", spokenSubj: "tín hiệu liên quan", visualSubj: "Khung máy xay sạch", reason: "Tín hiệu hữu ích",
   items: [{id: "c15-clean-frame", kind: "asset", assetId: "A07", role: "khung máy xay sạch", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c15-kept-tag", kind: "code", codeTemplate: "label", text: "TÍN HIỆU LIÊN QUAN:\nĐƯỢC GIỮ LẠI", role: "giữ lại", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C16
  {id: "C16", phrase: "Tín hiệu thừa thì", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Tín hiệu thừa thì thành một lớp ma sát",
   role: "literal-evidence", family: "mechanism-map", spokenSubj: "tín hiệu thừa ma sát", visualSubj: "Lớp icon sticker", reason: "Ma sát thông tin",
   items: [{id: "c16-paper-bundle", kind: "asset", assetId: "A04", role: "icon sticker", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c16-friction-tag", kind: "code", codeTemplate: "warning", text: "TÍN HIỆU THỪA:\nTẠO LỚP MA SÁT", role: "lớp ma sát", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C17
  {id: "C17", phrase: "Trong nghiên cứu", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Dẫn chứng thuật ngữ Processing Fluency",
   role: "literal-evidence", family: "evidence-source", spokenSubj: "thuật ngữ processing fluency", visualSubj: "Tờ giấy nghiên cứu", reason: "Cơ sở khoa học",
   items: [{id: "c17-research-paper", kind: "asset", assetId: "A05", role: "nghiên cứu", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c17-fluency-tag", kind: "code", codeTemplate: "label", text: "NGHIÊN CỨU:\nPROCESSING FLUENCY", role: "thuật ngữ", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C18
  {id: "C18", phrase: "Nói đời thường", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nói đời thường là khách tốn thêm công để hiểu",
   role: "context", family: "evidence-source", spokenSubj: "tốn thêm công", visualSubj: "Tờ giấy nghiên cứu", reason: "Giải thích bình dân",
   items: [{id: "c18-research-paper", kind: "asset", assetId: "A05", role: "nghiên cứu", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c18-effort-tag", kind: "code", codeTemplate: "label", text: "NÓI ĐỜI THƯỜNG:\nTỐN CÔNG ĐỂ HIỂU", role: "tốn công", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C19
  {id: "C19", phrase: "Vì vậy, nền sạch", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Nền sạch không chỉ để nhìn sang",
   role: "context", family: "application-audit", spokenSubj: "nền sạch không chỉ sang", visualSubj: "Khung máy xay sạch", reason: "Làm rõ mục đích",
   items: [{id: "c19-clean-frame", kind: "asset", assetId: "A07", role: "khung máy xay sạch", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c19-cleanaim-tag", kind: "code", codeTemplate: "label", text: "NỀN SẠCH:\nKHÔNG CHỈ ĐỂ SANG", role: "không chỉ sang", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C20
  {id: "C20", phrase: "Nó để một lợi", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nó để một lợi ích có cơ hội được nhìn thấy",
   role: "literal-evidence", family: "application-audit", spokenSubj: "lợi ích được thấy", visualSubj: "Khung máy xay sạch", reason: "Mục tiêu tối thượng",
   items: [{id: "c20-clean-frame", kind: "asset", assetId: "A07", role: "khung máy xay sạch", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c20-benefit-seen", kind: "code", codeTemplate: "label", text: "ĐỂ LỢI ÍCH\nĐƯỢC NHÌN THẤY", role: "được nhìn thấy", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C21
  {id: "C21", phrase: "Không có nghĩa video", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Không có nghĩa video phải trắng trơn buồn ngủ",
   role: "context", family: "literal-action", spokenSubj: "không buồn ngủ", visualSubj: "Máy xay trái cây", reason: "Tránh cực đoan",
   items: [{id: "c21-blender-use", kind: "asset", assetId: "A03", role: "máy xay trái cây", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c21-notboring-tag", kind: "code", codeTemplate: "label", text: "KHÔNG CẦN\nTRẮNG TRƠN BUỒN NGỦ", role: "không buồn ngủ", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C22
  {id: "C22", phrase: "Chỉ cần mỗi khung", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Chỉ cần mỗi khung có 1 việc chính cho mắt làm",
   role: "literal-evidence", family: "literal-action", spokenSubj: "1 việc chính cho mắt", visualSubj: "Máy xay trái cây", reason: "Nguyên tắc cốt lõi",
   items: [{id: "c22-blender-use", kind: "asset", assetId: "A03", role: "máy xay trái cây", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c22-onemain-tag", kind: "code", codeTemplate: "label", text: "MỖI KHUNG:\n1 VIỆC CHÍNH CHO MẮT", role: "1 việc chính", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C23
  {id: "C23", phrase: "Thử lấy một video", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Thử lấy 1 video cũ của shop",
   role: "human-action", family: "human-choice", spokenSubj: "video cũ shop", visualSubj: "Chủ shop audit storyboard", reason: "Thực hành audit",
   items: [{id: "c23-owner-audit", kind: "asset", assetId: "A06", role: "chủ shop audit", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c23-oldvid-tag", kind: "code", codeTemplate: "label", text: "AUDIT LẠI\nVIDEO SHOP BẠN", role: "audit shop", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C24
  {id: "C24", phrase: "Tắt âm thanh và", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Tắt âm thanh và nhìn riêng 3 giây đầu",
   role: "human-action", family: "human-choice", spokenSubj: "nhìn 3 giây đầu", visualSubj: "Chủ shop audit", reason: "Phương pháp test",
   items: [{id: "c24-owner-audit", kind: "asset", assetId: "A06", role: "chủ shop audit", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c24-threesec-tag", kind: "code", codeTemplate: "label", text: "TẮT TIẾNG:\nNHÌN 3 GIÂY ĐẦU", role: "nhìn 3 giây", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C25
  {id: "C25", phrase: "Gạch mọi thứ không", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Gạch mọi thứ không trả lời đây là gì, dùng lúc nào",
   role: "human-action", family: "human-choice", spokenSubj: "gạch bỏ thứ thừa", visualSubj: "Chủ shop audit", reason: "Hành động cụ thể",
   items: [{id: "c25-owner-audit", kind: "asset", assetId: "A06", role: "chủ shop audit", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c25-strike-tag", kind: "code", codeTemplate: "warning", text: "GẠCH BỎ MỌI THỨ\nKHÔNG LIÊN QUAN", role: "gạch bỏ", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C26
  {id: "C26", phrase: "Lưu video này rồi", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Lưu video và thử quay lại khung rõ hơn",
   role: "motif-anchor", family: "cta-close", spokenSubj: "CTA lưu video", visualSubj: "Mascot và card 3s audit", reason: "Khép lại video",
   items: [{id: "c26-mascot-audit", kind: "asset", assetId: "A08", role: "mascot audit", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
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

// Beats timing adjusted for 1.1x speed (52,890ms duration)
const beatTimings = [
  {id: "B01", startMs: 0, endMs: 3780, headline: "CÙNG MỘT MÁY XAY · 2 CÁCH ĐẶT", body: "Mở bằng nghịch lý nhìn thấy được", mascot: "thinking"},
  {id: "B02", startMs: 3780, endMs: 14000, headline: "1 BÊN GỌN GÀNG · 1 BÊN QUÁ TẢI", body: "Cho người xem tự đoán", mascot: "confuse"},
  {id: "B03", startMs: 14000, endMs: 25560, headline: "ĐỪNG BẮT KHÁCH TỰ LỌC TÍN HIỆU", body: "Lật từ trực giác sang trải nghiệm", mascot: "pointing"},
  {id: "B04", startMs: 25560, endMs: 36000, headline: "NGHIÊN CỨU: PROCESSING FLUENCY", body: "Đưa bằng chứng nghiên cứu", mascot: "research"},
  {id: "B05", startMs: 36000, endMs: 43820, headline: "1 KHUNG HÌNH · 1 VIỆC CHÍNH", body: "Giải thích cơ chế đời thường", mascot: "happy"},
  {id: "B06", startMs: 43820, endMs: 48740, headline: "AUDIT 3 GIÂY ĐẦU TIÊN", body: "Chốt bài học duy nhất", mascot: "working"},
  {id: "B07", startMs: 48740, endMs: durationMs, headline: "GẠCH BỎ TÍN HIỆU THỪA", body: "Checklist áp dụng và CTA", mascot: "thumbup"}
];

// Assets mapping
const assets = [
  {id: "A01", src: "ep013/v01/generated/a01-phones-clean-busy-contrast-alpha-v01.png", alt: "hai điện thoại", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A02", src: "ep013/v01/generated/a02-viewer-scroll-swipe-hesitate-alpha-v01.png", alt: "tay người xem", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A03", src: "ep013/v01/generated/a03-blender-product-use-fruit-alpha-v01.png", alt: "máy xay trái cây", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A04", src: "ep013/v01/generated/a04-paper-layers-falling-bundle-alpha-v01.png", alt: "icon sticker rơi", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A05", src: "ep013/v01/generated/a05-research-paper-sheet-highlight-alpha-v01.png", alt: "tờ giấy nghiên cứu", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A06", src: "ep013/v01/generated/a06-owner-storyboard-audit-phone-alpha-v01.png", alt: "chủ shop audit", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A07", src: "ep013/v01/generated/a07-clean-blender-frame-arrow-alpha-v01.png", alt: "khung máy xay sạch", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A08", src: "ep013/v01/generated/a08-mascot-three-second-note-alpha-v01.png", alt: "mascot audit", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false}
];

// Build final Episode JSON payload
const episode = {
  schemaVersion: 2,
  id: "EP013",
  episodeId: "EP013",
  version: "v01",
  title: brief.creativeContract.title,
  slug: "nen-roi-lam-khach-nghi-nhieu-hon",
  durationMs,
  totalFrames: Math.ceil(durationMs / frameMs),
  targetFps: 30,
  audioFile: "audio/ep013-voice-cartesia-processed-v01.wav",
  audio: {
    voiceSrc: "audio/ep013-voice-cartesia-processed-v01.wav",
    voiceVolume: 1.0,
    musicSrc: "audio/background-music.mp3",
    musicVolume: 0.12,
    durationMs,
    words,
    captions
  },
  motionGrammar: "continuous-stage-v1",
  narrativeObject: "chiếc máy xay trên màn hình điện thoại",
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

await writeFile(new URL("src/data/ep013-v01-episode.json", root), JSON.stringify(episode, null, 2) + "\n");
await writeFile(new URL("src/data/ep013-v01-captions.json", root), JSON.stringify(captions, null, 2) + "\n");
await writeFile(new URL("src/data/ep013-v01-words.json", root), JSON.stringify(words, null, 2) + "\n");
await writeFile(new URL("creatorflow/ep013-episode.json", root), JSON.stringify(episode, null, 2) + "\n");

console.log(`PASS: Built EP013 v01 episode (${visualCues.length} cues, ${durationMs}ms duration)`);
