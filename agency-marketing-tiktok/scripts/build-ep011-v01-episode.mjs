import {readFile, writeFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const brief = JSON.parse(await readFile(new URL("briefs/ep011-cam-thu-muoi-giay-v02.json", root), "utf8"));
const wordsJson = JSON.parse(await readFile(new URL("creatorflow/ep011-words-v01.json", root), "utf8"));
const words = (wordsJson.words || wordsJson).map(w => ({
  ...w,
  timestampMs: w.startMs,
  confidence: 1.0
}));
const captionsJson = JSON.parse(await readFile(new URL("creatorflow/ep011-captions-v01.json", root), "utf8"));
const captions = (captionsJson.captions || captionsJson).map(c => ({
  ...c,
  timestampMs: c.startMs,
  confidence: 1.0
}));

const clean = (value) => String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "");
const durationMs = words.at(-1)?.endMs + 350 || 46200;
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
  {id: "C01", phrase: "Có những món đồ", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Mở đầu thumbnail bàn tay cầm chiếc gối không muốn buông",
   role: "motif-anchor", family: "touch-hook", spokenSubj: "Bàn tay cầm gối", visualSubj: "Bàn tay cầm chiếc gối mềm vừa nâng khỏi kệ", reason: "Thumbnail mở đầu 1s",
   items: [{id: "c01-hand-pillow", kind: "asset", assetId: "A01", role: "bàn tay cầm chiếc gối", motion: "stamp", sfx: "whoosh", semanticRole: "subject", motifKey: "touch-pillow", transform: {from: {x: 0, y: -40, scale: 0.95, rotation: -2, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 1, opacity: 1}, easing: "ease-out"}}]},

  // C02
  {id: "C02", phrase: "nhưng bàn tay", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nhấn mạnh bàn tay không muốn trả về kệ",
   role: "literal-evidence", family: "touch-hook", spokenSubj: "Không muốn trả về kệ", visualSubj: "Tay cầm gối kèm tag nghịch lý", reason: "Khơi gợi tò mò",
   items: [{id: "c02-hand-pillow", kind: "asset", assetId: "A01", role: "tay cầm gối", motion: "none", semanticRole: "subject", motifKey: "touch-pillow", transform: {from: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 1, opacity: 1}, easing: "linear"}},
           {id: "c02-hold-tag", kind: "code", codeTemplate: "warning", text: "CHƯA MUA · TAY\nKHÔNG MUỐN BUÔNG?", role: "nghịch lý sở hữu", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C03
  {id: "C03", phrase: "Chiếc gối này", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Giới thiệu vật thể dẫn chứng chiếc gối mềm",
   role: "motif-anchor", family: "shopper-touch-action", spokenSubj: "Chiếc gối mềm", visualSubj: "Bàn tay cầm chiếc gối", reason: "Nhập đề câu chuyện",
   items: [{id: "c03-hand-pillow", kind: "asset", assetId: "A01", role: "chiếc gối mềm", motion: "none", semanticRole: "subject", motifKey: "touch-pillow", transform: {from: {x: 0, y: 20, scale: 0.95, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}}]},

  // C04
  {id: "C04", phrase: "Bạn cầm nó", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Hành động cầm lên và chuẩn bị bóp thử",
   role: "human-action", family: "shopper-touch-action", spokenSubj: "Cầm lên bóp thử", visualSubj: "Tay ấn vào bề mặt gối", reason: "Minh họa tương tác xúc giác",
   items: [{id: "c04-hand-press", kind: "asset", assetId: "A02", role: "tay ấn vào gối", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: -1, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c04-press-tag", kind: "code", codeTemplate: "label", text: "CẦM LÊN\nBÓP THỬ 1 CÁI", role: "tương tác xúc giác", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C05
  {id: "C05", phrase: "bóp một cái", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Cảm giác đàn hồi mềm mại khi bóp",
   role: "literal-evidence", family: "fabric-macro", spokenSubj: "Độ mềm đàn hồi", visualSubj: "Vết lún đàn hồi của vải", reason: "Xác nhận xúc giác",
   items: [{id: "c05-hand-press", kind: "asset", assetId: "A02", role: "vết lún đàn hồi", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c05-soft-tag", kind: "code", codeTemplate: "label", text: "MỀM MẠI\nĐÀN HỒI", role: "cảm giác xúc giác", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C06
  {id: "C06", phrase: "Rồi tự nhiên", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Tay tự nhiên chậm lại khi đặt xuống",
   role: "human-action", family: "shopper-hesitation", spokenSubj: "Tay chậm lại", visualSubj: "Khách ôm nhẹ gối phân vân", reason: "Khoảnh khắc do dự",
   items: [{id: "c06-shopper-hold", kind: "asset", assetId: "A04", role: "khách ôm gối", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c06-slow-tag", kind: "code", codeTemplate: "warning", text: "TỰ NHIÊN\nTAY CHẬM LẠI", role: "phản xạ do dự", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C07
  {id: "C07", phrase: "Chưa thanh toán", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Chưa thanh toán nhưng cảm giác đã thay đổi",
   role: "human-action", family: "shopper-closeness", spokenSubj: "Chưa thanh toán", visualSubj: "Khách ôm chiếc gối", reason: "Nhấn mạnh nghịch lý",
   items: [{id: "c07-shopper-hold", kind: "asset", assetId: "A04", role: "khách ôm gối", motion: "none", semanticRole: "subject", transform: {from: {x: 0, y: 20, scale: 0.95, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C08
  {id: "C08", phrase: "Nhưng trong đầu", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Trong đầu món đồ đã bớt xa lạ",
   role: "context", family: "ownership-flip", spokenSubj: "Bớt xa lạ", visualSubj: "Khách ôm gối kèm tag", reason: "Khái quát tâm lý",
   items: [{id: "c08-shopper-hold", kind: "asset", assetId: "A04", role: "khách ôm gối", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c08-close-tag", kind: "code", codeTemplate: "label", text: "TRONG ĐẦU:\nĐÃ BỚT XA LẠ", role: "cảm giác gần gũi", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C09
  {id: "C09", phrase: "Tay biết mấy", comp: "solo", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Tay biết những thứ mắt không đo hết",
   role: "literal-evidence", family: "touch-information", spokenSubj: "Thông tin xúc giác", visualSubj: "Tay ấn vào vải gối", reason: "Phân tích thông tin",
   items: [{id: "c09-press", kind: "asset", assetId: "A02", role: "tay ấn vải", motion: "reveal", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C10
  {id: "C10", phrase: "độ mềm", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Liệt kê các thuộc tính: Độ mềm, bề mặt, trọng lượng, nhiệt độ",
   role: "literal-evidence", family: "tactile-inspection", spokenSubj: "4 thuộc tính xúc giác", visualSubj: "Tay ấn kèm danh sách thuộc tính", reason: "Khung thông tin",
   items: [{id: "c10-press", kind: "asset", assetId: "A02", role: "tay ấn vải", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c10-props-tag", kind: "code", codeTemplate: "label", text: "ĐỘ MỀM · TEXTURE\nTRỌNG LƯỢNG · NHIỆT ĐỘ", role: "4 thuộc tính xúc giác", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C11
  {id: "C11", phrase: "Chạm dễ chịu", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Chạm dễ chịu làm món đồ bước gần lại mình hơn",
   role: "context", family: "touch-valence", spokenSubj: "Bước gần lại", visualSubj: "Tay ấn kèm tag gần lại", reason: "Cơ chế gắn kết",
   items: [{id: "c11-press", kind: "asset", assetId: "A02", role: "tay ấn vải", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c11-closer-tag", kind: "code", codeTemplate: "label", text: "CHẠM DỄ CHỊU\n→ BƯỚC GẦN LẠI", role: "cơ chế gắn kết", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C12
  {id: "C12", phrase: "Nghiên cứu về", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Dẫn chứng nghiên cứu hành vi tiêu dùng",
   role: "literal-evidence", family: "touch-study", spokenSubj: "Nghiên cứu hành vi", visualSubj: "Tay cầm gối", reason: "Bằng chứng khoa học",
   items: [{id: "c12-pillow", kind: "asset", assetId: "A01", role: "chiếc gối", motion: "scale", semanticRole: "subject", motifKey: "touch-pillow", transform: {from: {x: 0, y: 20, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C13
  {id: "C13", phrase: "chỉ riêng việc", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Chỉ riêng việc chạm làm tăng cảm giác sở hữu",
   role: "context", family: "touch-study", spokenSubj: "Mere-touch effect", visualSubj: "Gối kèm nhãn nghiên cứu", reason: "Khái niệm Mere-touch",
   items: [{id: "c13-pillow", kind: "asset", assetId: "A01", role: "chiếc gối", motion: "none", semanticRole: "subject", motifKey: "touch-pillow", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c13-meretouch-tag", kind: "code", codeTemplate: "label", text: "MERE-TOUCH EFFECT:\nTĂNG CẢM GIÁC SỞ HỮU", role: "hiệu ứng chạm", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C14
  {id: "C14", phrase: "Nhưng giá trị", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Giá trị cảm nhận không phải nút bấm thần kỳ",
   role: "context", family: "evidence-limit", spokenSubj: "Không phải nút thần kỳ", visualSubj: "Gối sau tủ kính", reason: "Giới hạn kết luận",
   items: [{id: "c14-glass-pillow", kind: "asset", assetId: "A03", role: "gối sau kính", motion: "reveal", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c14-nobutton-tag", kind: "code", codeTemplate: "warning", text: "KHÔNG PHẢI\nNÚT BẤM THẦN KỲ", role: "cảnh báo quá đà", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C15
  {id: "C15", phrase: "Trải nghiệm chạm", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Trải nghiệm chạm vẫn phải dễ chịu",
   role: "context", family: "evidence-limit", spokenSubj: "Phải dễ chịu", visualSubj: "Gối sau kính kèm tag", reason: "Điều kiện tiên quyết",
   items: [{id: "c15-glass-pillow", kind: "asset", assetId: "A03", role: "gối sau kính", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c15-pleasant-tag", kind: "code", codeTemplate: "label", text: "TRẢI NGHIỆM CHẠM\nPHẢI THỰC SỰ DỄ CHỊU", role: "điều kiện chạm", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C16
  {id: "C16", phrase: "Online không đưa", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Online không đưa được sản phẩm qua màn hình",
   role: "literal-evidence", family: "online-friction", spokenSubj: "Không đưa qua màn hình", visualSubj: "Gối sau kính tượng trưng rào cản online", reason: "Rào cản thương mại điện tử",
   items: [{id: "c16-glass-pillow", kind: "asset", assetId: "A03", role: "gối sau kính", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c16-barrier-tag", kind: "code", codeTemplate: "warning", text: "ONLINE: KHÔNG ĐƯA\nQUA ĐƯỢC MÀN HÌNH", role: "rào cản online", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C17
  {id: "C17", phrase: "Nhưng video vẫn", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "zoom-through",
   intent: "Nhưng video vẫn cho thấy cách nó được cảm nhận",
   role: "human-action", family: "tactile-demo-audit", spokenSubj: "Video cho thấy cách cảm", visualSubj: "Chủ shop đặt máy quay POV", reason: "Giải pháp video",
   items: [{id: "c17-owner-film", kind: "asset", assetId: "A05", role: "chủ shop quay POV", motion: "slide", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C18
  {id: "C18", phrase: "Đừng quay một", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Đừng quay một vòng quanh hộp rồi bảo mềm lắm",
   role: "context", family: "lesson-copy", spokenSubj: "Đừng nói suông", visualSubj: "Chủ shop kèm tag cảnh báo", reason: "Chỉnh sửa cách làm video",
   items: [{id: "c18-owner-film", kind: "asset", assetId: "A05", role: "chủ shop", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c18-nosay-tag", kind: "code", codeTemplate: "warning", text: "ĐỪNG CHỈ NÓI SUÔNG\n“MỀM LẮM”", role: "cảnh báo nói suông", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C19
  {id: "C19", phrase: "Hãy để tay", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Hãy để tay ấn nệm, kéo vải",
   role: "human-action", family: "application-audit", spokenSubj: "Ấn nệm kéo vải", visualSubj: "Hai tay gập vải", reason: "Hành động trực quan",
   items: [{id: "c19-fold-hands", kind: "asset", assetId: "A07", role: "hai tay gập vải", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c19-press-tag", kind: "code", codeTemplate: "label", text: "1. ẤN NỆM · KÉO VẢI", role: "thao tác 1", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C20
  {id: "C20", phrase: "kéo vải", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Gập túi, hoặc nghe tiếng nắp đóng",
   role: "human-action", family: "application-audit", spokenSubj: "Gập túi nghe tiếng nắp", visualSubj: "Hai tay đóng nắp hộp", reason: "Âm thanh xúc giác",
   items: [{id: "c20-lid-hands", kind: "asset", assetId: "A08", role: "hai tay đóng nắp", motion: "reveal", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c20-click-tag", kind: "code", codeTemplate: "label", text: "2. GẬP TÚI · TIẾNG NẮP", role: "thao tác 2", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C21
  {id: "C21", phrase: "Chọn đúng một", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Chọn đúng một cảm giác và quay POV 10 giây",
   role: "human-action", family: "pov-demo-payoff", spokenSubj: "Quay POV 10 giây", visualSubj: "Điện thoại và tay demo", reason: "Công thức thực thi",
   items: [{id: "c21-phone-demo", kind: "asset", assetId: "A06", role: "điện thoại quay demo", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 30, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c21-pov-tag", kind: "code", codeTemplate: "label", text: "CHỌN 1 CẢM GIÁC\nQUAY POV 10 GIÂY", role: "công thức video", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C22
  {id: "C22", phrase: "Khách không chạm", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Khách không chạm được, nhưng thấy lý do để muốn chạm",
   role: "literal-evidence", family: "pov-demo-payoff", spokenSubj: "Lý do muốn chạm", visualSubj: "Điện thoại demo kèm tag", reason: "Payoff cốt lõi",
   items: [{id: "c22-phone-demo", kind: "asset", assetId: "A06", role: "điện thoại quay demo", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c22-reason-tag", kind: "code", codeTemplate: "label", text: "CHO KHÁCH THẤY\nLÝ DO ĐỂ MUỐN CHẠM", role: "payoff cốt lõi", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C23
  {id: "C23", phrase: "Lưu video", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Kêu gọi lưu video để quay thử thao tác chạm",
   role: "human-action", family: "cta", spokenSubj: "CTA lưu video", visualSubj: "Chiếc gối và nút CTA", reason: "Kêu gọi hành động",
   items: [{id: "c23-pillow-cta", kind: "asset", assetId: "A01", role: "gối khép lại", motion: "reveal", semanticRole: "subject", motifKey: "touch-pillow", transform: {from: {x: -190, y: 0, scale: 0.9, rotation: 0, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c23-save-btn", kind: "code", codeTemplate: "button", text: "LƯU VIDEO", role: "nút CTA duy nhất", motion: "stamp", sfx: "ding", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C24
  {id: "C24", phrase: "Rồi quay thử", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "reframe",
   intent: "Khép lại với lời kêu gọi quay thử một thao tác chạm",
   role: "motif-anchor", family: "cta", spokenSubj: "Quay thử thao tác", visualSubj: "Chiếc gối và nút CTA", reason: "Khép lại video",
   items: [{id: "c24-pillow-cta", kind: "asset", assetId: "A01", role: "gối khép lại", motion: "none", semanticRole: "subject", motifKey: "touch-pillow", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c24-save-btn", kind: "code", codeTemplate: "button", text: "QUAY THỬ 1 THAO TÁC\nCHẠM CỦA SHOP", role: "nút CTA duy nhất", motion: "none", semanticRole: "accent", transform: {from: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}}]}
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
  {id: "B01", startMs: 0, endMs: 3960, headline: "CHƯA MUA · TAY KHÔNG BUÔNG", body: "Đặt nghịch lý bằng vật thể quen thuộc", mascot: "thinking"},
  {id: "B02", startMs: 3960, endMs: 9360, headline: "CẦM LÊN · BÓP NHẸ", body: "Cho người xem theo dõi tình huống", mascot: "happy"},
  {id: "B03", startMs: 9360, endMs: 13560, headline: "BỚT XA LẠ", body: "Lật giả định trực giác", mascot: "confuse"},
  {id: "B04", startMs: 13560, endMs: 21760, headline: "TAY BIẾT THỨ MẮT KHÔNG THẤY", body: "Giải cơ chế bằng tiếng Việt đời thường", mascot: "research"},
  {id: "B05", startMs: 21760, endMs: 30360, headline: "MERE-TOUCH EFFECT", body: "Đưa bằng chứng có nguồn và giới hạn", mascot: "research"},
  {id: "B06", startMs: 30360, endMs: 36440, headline: "ONLINE KHÔNG CÓ XÚC GIÁC", body: "Chốt đúng một bài học", mascot: "pointing"},
  {id: "B07", startMs: 36440, endMs: durationMs, headline: "QUAY POV 10 GIÂY", body: "Cho thao tác áp dụng và một CTA", mascot: "working"}
];

// Assets mapping to existing public files
const assets = [
  {id: "A01", src: "ep011/v01/generated/a01-hand-holding-pillow-alpha-v01.png", alt: "bàn tay cầm chiếc gối", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A02", src: "ep011/v01/generated/a02-hand-pressing-fabric-alpha-v01.png", alt: "tay ấn vào gối", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A03", src: "ep011/v01/generated/a03-pillow-behind-glass-alpha-v01.png", alt: "gối sau tủ kính", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A04", src: "ep011/v01/generated/a04-shopper-holding-pillow-alpha-v01.png", alt: "khách ôm chiếc gối", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A05", src: "ep011/v01/generated/a05-owner-filming-pov-alpha-v01.png", alt: "chủ shop quay POV", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A06", src: "ep011/v01/generated/a06-phone-and-hand-demo-alpha-v01.png", alt: "điện thoại quay demo", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A07", src: "ep011/v01/generated/a07-hands-folding-product-alpha-v01.png", alt: "hai tay gập vải", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false},
  {id: "A08", src: "ep011/v01/generated/a08-hands-closing-lid-alpha-v01.png", alt: "hai tay đóng nắp", kind: "image", sourceType: "generated", provider: "flow-agent", stickerTreatment: "remotion-paper", hasBakedContour: false}
];

// Build final Episode JSON payload
const episode = {
  schemaVersion: 2,
  id: "EP011",
  episodeId: "EP011",
  version: "v02",
  title: brief.creativeContract.title,
  slug: "cam-thu-muoi-giay",
  durationMs,
  totalFrames: Math.ceil(durationMs / frameMs),
  targetFps: 30,
  audioFile: "audio/ep011-voice-cartesia-processed-v01.wav",
  audio: {
    voiceSrc: "audio/ep011-voice-cartesia-processed-v01.wav",
    voiceVolume: 1.0,
    musicSrc: "audio/background-music.mp3",
    musicVolume: 0.12,
    durationMs,
    words,
    captions
  },
  motionGrammar: "continuous-stage-v1",
  narrativeObject: "Chiếc gối nhỏ",
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

await writeFile(new URL("src/data/ep011-v02-episode.json", root), JSON.stringify(episode, null, 2) + "\n");
await writeFile(new URL("src/data/ep011-v02-captions.json", root), JSON.stringify(captions, null, 2) + "\n");
await writeFile(new URL("src/data/ep011-v02-words.json", root), JSON.stringify(words, null, 2) + "\n");
await writeFile(new URL("creatorflow/ep011-episode.json", root), JSON.stringify(episode, null, 2) + "\n");

console.log(`PASS: Built EP011 v02 episode (${visualCues.length} cues, ${durationMs}ms duration)`);
