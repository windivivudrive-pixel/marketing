import {readFile, writeFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const brief = JSON.parse(await readFile(new URL("briefs/ep008-dai-bang-keo-xe-do-v01.json", root), "utf8"));
const wordsJson = JSON.parse(await readFile(new URL("creatorflow/ep008-words-v01.json", root), "utf8"));
const words = wordsJson.words || wordsJson;
const captions = JSON.parse(await readFile(new URL("creatorflow/ep008-captions-v01.json", root), "utf8"));

const clean = (value) => String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "");
const durationMs = words.at(-1)?.endMs + 350 || 51400;
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

// Cues layout with strict visual separation: image left (x: -190 to -210), text/badge right (x: +190 to +210)
const rawCues = [
  // C01: 0 -> "nhưng"
  {id: "C01", phrase: "Cùng là nhận một kiện hàng", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Mở đầu thumbnail đối lập 2 số phận kiện hàng",
   role: "human-action", family: "hook-contrast", spokenSubj: "Hai kiện hàng đối lập", visualSubj: "Bàn tay chuẩn bị mở 2 kiện hàng", reason: "Thumbnail mở đầu 1s",
   items: [{id: "c01-unboxing-contrast", kind: "asset", assetId: "A01", role: "hai kiện hàng đối lập", motion: "track", sfx: "whoosh", semanticRole: "subject", transform: {from: {x: 0, y: -40, scale: 0.95, rotation: -2, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 2, opacity: 1}, easing: "ease-out"}}]},

  // C02: "nhưng" -> "có hộp"
  {id: "C02", phrase: "nhưng có hộp khách bóc vội rồi vứt rác", comp: "code", exit: "replace", cam: {mode: "pan", intensity: "subtle"}, trans: "match-move",
   intent: "Cho thấy số phận bị vứt bỏ của kiện hàng luộm thuộm",
   role: "literal-evidence", family: "hook-contrast", spokenSubj: "Chiếc hộp bị vứt rác", visualSubj: "Hộp dán nham nhở cạnh sọt rác", reason: "Minh họa hành vi bóc vội rồi bỏ đi",
   items: [{id: "c02-contrast-box", kind: "asset", assetId: "A01", role: "kiện hàng bị vứt rác", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1, rotation: -2, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: -2, opacity: 1}, easing: "linear"}},
           {id: "c02-trash-tag", kind: "code", codeTemplate: "warning", text: "BÓC RỒI VỨT", role: "kết cục tiêu cực", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C03: "có hộp" -> "Sự khác biệt"
  {id: "C03", phrase: "có hộp họ lại hào hứng dựng", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Cho thấy khách hào hứng chuẩn bị quay clip",
   role: "motif-anchor", family: "hook-contrast", spokenSubj: "Chiếc hộp được quay video", visualSubj: "Hộp carton kraft đẹp đẽ", reason: "Chuyển hướng sang kiện hàng được trân trọng",
   items: [{id: "c03-neat-box", kind: "asset", assetId: "A02", role: "hộp kraft dải đỏ", motion: "reveal", semanticRole: "subject", motifKey: "neat-red-box", transform: {from: {x: -190, y: 30, scale: 0.85, rotation: -2, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c03-unboxing-tag", kind: "code", codeTemplate: "label", text: "QUAY CLIP MỞ HỘP", role: "kết cục tích cực", motion: "reveal", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.8, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C04: "Sự khác biệt" -> "mà nằm"
  {id: "C04", phrase: "Sự khác biệt đôi khi không nằm ở", comp: "solo", exit: "carry", cam: {mode: "pull-out", intensity: "subtle"}, trans: "reframe",
   intent: "Phủ định giả thuyết chỉ vì món đồ đắt tiền",
   role: "literal-evidence", family: "tear-strip-detail", spokenSubj: "Món đồ bên trong", visualSubj: "Món quà bên trong hộp", reason: "Khẳng định sự khác biệt không chỉ ở sản phẩm",
   items: [{id: "c04-inside-gift", kind: "asset", assetId: "A05", role: "món đồ bên trong", motion: "none", semanticRole: "subject", transform: {from: {x: 0, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}}]},

  // C05: "mà nằm" -> "Bạn để ý"
  {id: "C05", phrase: "mà nằm ở đúng một dải băng xé màu đỏ", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "zoom-through",
   intent: "Hé lộ chi tiết chiếc ruy băng xé ngang hộp",
   role: "motif-anchor", family: "tear-strip-detail", spokenSubj: "Dải băng keo xé màu đỏ", visualSubj: "Cận cảnh dải băng xé đỏ nổi bật", reason: "Tập trung thị giác vào chi tiết đắt giá",
   items: [{id: "c05-neat-box", kind: "asset", assetId: "A02", role: "cận cảnh dải băng đỏ", motion: "scale", semanticRole: "subject", motifKey: "neat-red-box", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.1, rotation: 0, opacity: 1}, easing: "ease-out"}},
           {id: "c05-tear-tag", kind: "code", codeTemplate: "label", text: "DẢI BĂNG XÉ ĐỎ", role: "chi tiết cốt lõi", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C06: "Bạn để ý" -> "Họ không bao giờ"
  {id: "C06", phrase: "Bạn để ý những thương hiệu D hai C hàng đầu", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Dẫn chứng case study thực tế bằng logo thương hiệu",
   role: "context", family: "brand-case", spokenSubj: "Thương hiệu D2C hàng đầu", visualSubj: "Bộ đôi logo thương hiệu Glossier và Coolmate", reason: "Hiển thị logo trực quan của các thương hiệu thành công",
   items: [{id: "c06-brand-logos", kind: "asset", assetId: "A09", role: "logo Glossier và Coolmate", motion: "stamp", sfx: "sticker-popup", semanticRole: "evidence", transform: {from: {x: -190, y: 0, scale: 0.88, rotation: -2, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c06-brand-tag", kind: "code", codeTemplate: "label", text: "CASE STUDY D2C:\nGLOSSIER · COOLMATE", role: "case study thực tế", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C07: "Họ không bao giờ" -> "bắt khách"
  {id: "C07", phrase: "Họ không bao giờ quấn băng dính", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "cut",
   intent: "Cho thấy cảm giác phiền toái khi bóc gói truyền thống",
   role: "literal-evidence", family: "frustration-knife", spokenSubj: "Không quấn băng dính 5 6 lớp", visualSubj: "Hộp dán chằng chịt băng dính vàng", reason: "Tái hiện bối cảnh phiền toái thường gặp",
   items: [{id: "c07-taped-box", kind: "asset", assetId: "A03", role: "hộp quấn băng dính và dao rọc", motion: "slide", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: -2, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C08: "bắt khách" -> "dập tắt"
  {id: "C08", phrase: "bắt khách đi tìm dao kéo để rạch hộp", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nhấn mạnh rào cản dao kéo làm gián đoạn niềm vui",
   role: "human-action", family: "frustration-knife", spokenSubj: "Hành vi tìm dao kéo", visualSubj: "Tay cầm dao rọc rạch băng dính", reason: "Nhấn mạnh lực cản vật lý khiến khách khó chịu",
   items: [{id: "c08-taped-box", kind: "asset", assetId: "A03", role: "hộp quấn băng dính và dao", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c08-frustrate-tag", kind: "code", codeTemplate: "warning", text: "TÌM DAO KÉO", role: "rào cản vật lý", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C09: "dập tắt" -> "Khi thay bằng"
  {id: "C09", phrase: "dập tắt sự háo hức vừa nhận hàng", comp: "code", exit: "transform", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Chỉ ra tác hại của việc tạo lực cản ngay lúc nhận hàng",
   role: "literal-evidence", family: "frustration-knife", spokenSubj: "Dập tắt sự háo hức", visualSubj: "Nhãn cảnh báo dập tắt cảm xúc", reason: "Đẩy cao nhận thức về việc phá hỏng cảm xúc",
   items: [{id: "c09-taped-box", kind: "asset", assetId: "A03", role: "hộp bị rạch nham nhở", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c09-killjoy-tag", kind: "code", codeTemplate: "warning", text: "DẬP TẮT HÁO HỨC", role: "hậu quả cảm xúc", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C10: "Khi thay bằng" -> "Chỉ cần"
  {id: "C10", phrase: "Khi thay bằng một dải ruy băng xé", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "mask-reveal",
   intent: "Chuyển hóa việc mở hộp thành trải nghiệm xúc giác",
   role: "human-action", family: "tactile-satisfaction", spokenSubj: "Trải nghiệm xúc giác thỏa mãn", visualSubj: "Ngón tay cầm dải ruy băng xé", reason: "Nâng tầm thao tác mở hộp",
   items: [{id: "c10-tear-action", kind: "asset", assetId: "A04", role: "ngón tay kéo dải ruy băng xé", motion: "slide", sfx: "whoosh", semanticRole: "subject", motifKey: "neat-red-box", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: -1, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C11: "Chỉ cần" -> "tiếng xoẹt"
  {id: "C11", phrase: "Chỉ cần một cú giật nhẹ", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Thể hiện cảm giác xé nhẹ nhàng không cần dùng sức",
   role: "human-action", family: "tactile-satisfaction", spokenSubj: "Hành động giật dải băng xé", visualSubj: "Đường xé chạy mượt mà trên thân hộp", reason: "Tả cận cảnh sự dễ dàng",
   items: [{id: "c11-tear-action", kind: "asset", assetId: "A04", role: "động tác kéo dải xé", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c11-pull-tag", kind: "code", codeTemplate: "label", text: "1 CÚ GIẬT NHẸ", role: "thao tác đơn giản", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C12: "tiếng xoẹt" -> "chiếc hộp"
  {id: "C12", phrase: "tiếng xoẹt giòn tan vang lên", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Miêu tả âm thanh xoẹt thỏa mãn giác quan",
   role: "context", family: "tactile-satisfaction", spokenSubj: "Âm thanh xé giòn tan", visualSubj: "Hiệu ứng âm thanh xúc giác ASMR", reason: "Nhấn mạnh kích thích thính giác",
   items: [{id: "c12-asmr-tag", kind: "code", codeTemplate: "metric", text: "XOẸT!", role: "âm thanh thỏa mãn", motion: "pop", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 0, y: 20, scale: 0.8, rotation: -3, opacity: 0}, to: {x: 0, y: 0, scale: 1.1, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C13: "chiếc hộp" -> "mà không"
  {id: "C13", phrase: "chiếc hộp tự động bung mở", comp: "solo", exit: "carry", cam: {mode: "pull-out", intensity: "medium"}, trans: "zoom-through",
   intent: "Cho thấy hộp tự động mở toang đẹp mắt",
   role: "literal-evidence", family: "box-open-reveal", spokenSubj: "Chiếc hộp bung mở hoàn hảo", visualSubj: "Hộp bung nắp khoe lớp giấy lụa bên trong", reason: "Khoảnh khắc thị giác mãn nhãn",
   items: [{id: "c13-box-bloom", kind: "asset", assetId: "A05", role: "hộp bung mở lộ giấy lụa", motion: "scale", sfx: "ding", semanticRole: "subject", transform: {from: {x: 0, y: 20, scale: 0.88, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C14: "mà không" -> "Cảm giác kiểm soát"
  {id: "C14", phrase: "mà không tốn chút sức lực nào", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nhấn mạnh sự dễ dàng trọn vẹn khi mở hộp",
   role: "literal-evidence", family: "box-open-reveal", spokenSubj: "Không tốn chút sức lực", visualSubj: "Hộp bung mở kèm nhãn mở dễ dàng", reason: "Khẳng định sự mượt mà",
   items: [{id: "c13-box-bloom", kind: "asset", assetId: "A05", role: "hộp bung mở lộ giấy lụa", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c14-easy-tag", kind: "code", codeTemplate: "label", text: "MỞ DỄ DÀNG", role: "ưu điểm mượt mà", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C15: "Cảm giác kiểm soát" -> "kích hoạt"
  {id: "C15", phrase: "Cảm giác kiểm soát và âm thanh đã tai này", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "mask-reveal",
   intent: "Chỉ ra cảm giác kiểm soát trọn vẹn của khách",
   role: "context", family: "tactile-framework", spokenSubj: "Cảm giác kiểm soát và thỏa mãn", visualSubj: "Đồ họa dopamine và xúc giác", reason: "Giải thích cơ chế tâm lý kích hoạt hormone vui vẻ",
   items: [{id: "c15-dopamine-art", kind: "asset", assetId: "A07", role: "đồ họa xúc giác dopamine", motion: "reveal", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.88, rotation: 1, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C16: "kích hoạt" -> "Trải nghiệm quá mượt mà"
  {id: "C16", phrase: "kích hoạt hormone phần thưởng", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nhấn mạnh phần thưởng tâm lý tức thì",
   role: "context", family: "tactile-framework", spokenSubj: "Hormone phần thưởng", visualSubj: "Nhãn dopamine phần thưởng", reason: "Nhấn mạnh kích hoạt tâm lý",
   items: [{id: "c15-dopamine-art", kind: "asset", assetId: "A07", role: "đồ họa dopamine", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c16-dopamine-tag", kind: "code", codeTemplate: "label", text: "THƯỞNG DOPAMINE", role: "cơ chế sinh học", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C17: "Trải nghiệm quá mượt mà" -> "rút điện thoại"
  {id: "C17", phrase: "Trải nghiệm quá mượt mà khiến", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "zoom-through",
   intent: "Cho thấy khách hàng hào hứng bấm máy quay",
   role: "human-action", family: "ugc-recording", spokenSubj: "Khách hàng quay video unboxing", visualSubj: "Khách dựng điện thoại quay video unboxing", reason: "Minh họa hành vi tự phát",
   items: [{id: "c17-filming-ugc", kind: "asset", assetId: "A06", role: "khách quay video unboxing", motion: "slide", sfx: "sticker-popup", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.88, rotation: -1, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C18: "rút điện thoại" -> "Trải nghiệm thương hiệu"
  {id: "C18", phrase: "rút điện thoại quay lại khoảnh khắc đó", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "reframe",
   intent: "Nhấn mạnh người mua tự nguyện trở thành UGC creator",
   role: "human-action", family: "ugc-recording", spokenSubj: "Chia sẻ khoảnh khắc lên mạng", visualSubj: "Khách quay unboxing khoe story", reason: "Biến người mua thành người tạo nội dung",
   items: [{id: "c17-filming-ugc", kind: "asset", assetId: "A06", role: "khách quay video unboxing", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c18-share-tag", kind: "code", codeTemplate: "label", text: "TỰ NGUYỆN QUAY CLIP", role: "hành vi tự nhiên", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C19: "Trải nghiệm thương hiệu" -> "từ giây đầu tiên"
  {id: "C19", phrase: "Trải nghiệm thương hiệu thực ra không bắt đầu", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "match-move",
   intent: "Đưa thông điệp cốt lõi một cách nhẹ nhàng",
   role: "motif-anchor", family: "lesson-board", spokenSubj: "Bài học trải nghiệm thương hiệu", visualSubj: "Hộp kraft dải đỏ quay lại sân khấu", reason: "Gắn thông điệp đúc kết với chiếc hộp",
   items: [{id: "c19-lesson-box", kind: "asset", assetId: "A02", role: "hộp motif bài học", motion: "reveal", semanticRole: "subject", motifKey: "neat-red-box", transform: {from: {x: -190, y: 30, scale: 0.85, rotation: -2, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c19-lesson-tag", kind: "code", codeTemplate: "label", text: "BẮT ĐẦU TỪ VỎ HỘP", role: "thông điệp cốt lõi", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C20: "từ giây đầu tiên" -> "chiếc vỏ hộp"
  {id: "C20", phrase: "từ giây đầu tiên tay họ chạm vào", comp: "code", exit: "carry", cam: {mode: "static", intensity: "subtle"}, trans: "reframe",
   intent: "Nhấn mạnh giây đầu tiên chạm vào vỏ hộp",
   role: "motif-anchor", family: "lesson-board", spokenSubj: "Giây đầu tiên chạm vào vỏ hộp", visualSubj: "Hộp dải đỏ được chạm tay", reason: "Khắc sâu điểm chạm đầu tiên",
   items: [{id: "c19-lesson-box", kind: "asset", assetId: "A02", role: "hộp motif bài học", motion: "none", semanticRole: "subject", motifKey: "neat-red-box", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c20-touch-tag", kind: "code", codeTemplate: "label", text: "ĐIỂM CHẠM ĐẦU TIÊN", role: "khoảnh khắc quyết định", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C21: "chiếc vỏ hộp" -> "Hôm nay"
  {id: "C21", phrase: "chiếc vỏ hộp bên ngoài", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Lời nhắc nhở đừng coi nhẹ chiếc vỏ hộp bên ngoài",
   role: "literal-evidence", family: "lesson-board", spokenSubj: "Chiếc vỏ hộp bên ngoài", visualSubj: "Hộp quấn băng dính bị cảnh báo", reason: "Nhắc nhở đừng để băng keo làm hỏng cảm xúc",
   items: [{id: "c21-bad-box", kind: "asset", assetId: "A03", role: "hộp quấn băng dính", motion: "none", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c21-no-tape-tag", kind: "code", codeTemplate: "warning", text: "ĐỪNG COI NHẸ", role: "lời nhắc nhở", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: -2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C22: "Hôm nay" -> "xem mất bao nhiêu"
  {id: "C22", phrase: "Hôm nay, bạn hãy thử tự đặt", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "mask-reveal",
   intent: "Đưa ra bài test thực tế cho chủ shop",
   role: "application", family: "audit-test", spokenSubj: "Tự đặt đơn và bấm giờ", visualSubj: "Đồng hồ bấm giờ đặt cạnh kiện hàng", reason: "Hành động thực nghiệm ngay",
   items: [{id: "c22-timer-audit", kind: "asset", assetId: "A08", role: "đồng hồ bấm giờ test mở hộp", motion: "slide", sfx: "sticker-popup", semanticRole: "evidence", transform: {from: {x: 0, y: 30, scale: 0.88, rotation: -1, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C23: "xem mất bao nhiêu" -> "Lưu video"
  {id: "C23", phrase: "xem mất bao nhiêu giây để mở", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "reframe",
   intent: "Nhấn mạnh tiêu chuẩn mở hộp nhanh chóng",
   role: "application", family: "audit-test", spokenSubj: "Số giây mở hộp", visualSubj: "Đồng hồ hiển thị 5 giây", reason: "Thước đo thời gian mở hộp",
   items: [{id: "c22-timer-audit", kind: "asset", assetId: "A08", role: "đồng hồ bấm giờ", motion: "none", semanticRole: "evidence", transform: {from: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c23-speed-tag", kind: "code", codeTemplate: "metric", text: "DƯỚI 5 GIÂY", role: "tiêu chuẩn tốc độ", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C24: "Lưu video" -> "kiểm tra lại"
  {id: "C24", phrase: "Lưu video này để", comp: "code", exit: "carry", cam: {mode: "pull-out", intensity: "subtle"}, trans: "reframe",
   intent: "Kêu gọi lưu video để tối ưu khâu đóng gói",
   role: "motif-anchor", family: "cta", spokenSubj: "CTA lưu video", visualSubj: "Chiếc hộp bên cạnh nút Lưu video", reason: "Kêu gọi hành động duy nhất",
   items: [{id: "c24-box-cta", kind: "asset", assetId: "A02", role: "hộp khép lại video", motion: "reveal", semanticRole: "subject", motifKey: "neat-red-box", transform: {from: {x: -190, y: 20, scale: 0.9, rotation: -2, opacity: 0}, to: {x: -190, y: 0, scale: 0.98, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c24-save-btn", kind: "code", codeTemplate: "button", text: "LƯU VIDEO", role: "nút CTA duy nhất", motion: "stamp", sfx: "click", semanticRole: "evidence", transform: {from: {x: 200, y: 30, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C25: "kiểm tra lại" -> end
  {id: "C25", phrase: "kiểm tra lại khâu đóng gói của bạn", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Khép lại video với thông điệp trải nghiệm đóng gói",
   role: "motif-anchor", family: "cta", spokenSubj: "Khép lại thông điệp đóng gói", visualSubj: "Chiếc hộp và nút CTA", reason: "Khép lại toàn bộ thông điệp unboxing",
   items: [{id: "c24-box-cta", kind: "asset", assetId: "A02", role: "hộp khép lại video", motion: "none", semanticRole: "subject", motifKey: "neat-red-box", transform: {from: {x: -190, y: 0, scale: 0.98, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 0.98, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c24-save-btn", kind: "code", codeTemplate: "button", text: "LƯU VIDEO", role: "nút CTA duy nhất", motion: "none", semanticRole: "evidence", transform: {from: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}}]},
];

let searchPos = 0;
const visualCues = rawCues.map((cue, idx) => {
  const wIdx = findWordIndex(cue.phrase, searchPos);
  searchPos = wIdx;
  const startMs = idx === 0 ? 0 : words[wIdx].startMs;
  return {
    id: cue.id,
    startMs,
    endMs: startMs + 2000,
    spokenAnchor: cue.phrase,
    spokenSubject: cue.spokenSubj,
    visualSubject: cue.visualSubj,
    visualReason: cue.reason,
    semanticIntent: cue.intent,
    sceneFamily: cue.family,
    continuityRole: cue.role,
    composition: cue.comp,
    exit: cue.exit,
    camera: cue.cam,
    transition: cue.trans,
    items: cue.items
  };
});

// Chain cue timings monotonically
for (let i = 0; i < visualCues.length - 1; i++) {
  visualCues[i].endMs = visualCues[i + 1].startMs;
}
visualCues.at(-1).endMs = durationMs;

// Enforce minimum 1.0s opening thumbnail
if (visualCues[0].endMs - visualCues[0].startMs < 1000) {
  visualCues[0].endMs = 1000;
  if (visualCues[1]) visualCues[1].startMs = 1000;
}

const mascotEmotions = ["thinking", "scare", "find", "thinking", "serious", "idea", "working cool", "idea", "clap hand"];

const episodeData = {
  schemaVersion: 2,
  id: "EP008",
  episodeId: "EP008",
  slug: "dai-bang-keo-xe-do-clip-unboxing",
  version: "v01",
  durationMs,
  totalFrames: Math.ceil(durationMs / frameMs),
  targetFps: 30,
  audio: {
    voiceSrc: "audio/ep008-voice-cartesia-processed-v01.wav",
    voiceVolume: 1.0,
    musicSrc: "audio/background-music.mp3",
    musicVolume: 0.12,
    durationMs,
    words,
    captions
  },
  visualCues,
  assets: brief.assets,
  creativeContract: brief.creativeContract,
  topicKeywords: brief.topicKeywords,
  editBlueprint: {
    ...brief.editBlueprint,
    mascotPlacement: {
      anchor: "below-captions",
      topPx: 1240,
      frameDurationSec: 0.35,
      emotions: mascotEmotions
    }
  }
};

await writeFile(new URL("creatorflow/ep008-episode.json", root), JSON.stringify(episodeData, null, 2) + "\n");
await writeFile(new URL("src/data/ep008-v01-episode.json", root), JSON.stringify(episodeData, null, 2) + "\n");
const captionsArray = captions.captions || captions;
const wordsArray = words.words || words;
await writeFile(new URL("src/data/ep008-v01-captions.json", root), JSON.stringify(captionsArray, null, 2) + "\n");
await writeFile(new URL("src/data/ep008-v01-words.json", root), JSON.stringify(wordsArray, null, 2) + "\n");
console.log(`PASS: compiled EP008 episode JSON with ${visualCues.length} cues, duration ${durationMs}ms (${episodeData.totalFrames} frames)`);
