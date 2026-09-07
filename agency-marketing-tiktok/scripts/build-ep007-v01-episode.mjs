import {readFile, writeFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const brief = JSON.parse(await readFile(new URL("briefs/ep007-the-tich-diem-10-o-v01.json", root), "utf8"));
const words = JSON.parse(await readFile(new URL("creatorflow/ep007-words-v01.json", root), "utf8"));
const captions = JSON.parse(await readFile(new URL("creatorflow/ep007-captions-v01.json", root), "utf8"));

const clean = (value) => String(value || "").toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "");
const durationMs = words.at(-1)?.endMs + 350 || 48600;
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

// Coordinate layout with strict separation: image left (x: -190 to -210), text/badge right (x: +190 to +210)
const rawCues = [
  // C01: 0 -> "tám"
  {id: "C01", phrase: "Cùng phải mua", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "cut",
   intent: "Mở đầu bằng thumbnail trực quan về 2 chiếc thẻ",
   role: "human-action", family: "hook-contrast", spokenSubj: "Hai chiếc thẻ đối lập", visualSubj: "Bàn tay cầm 2 tấm thẻ đối lập", reason: "Mở đầu thumbnail",
   items: [{id: "c01-card-contrast", kind: "asset", assetId: "A01", role: "hai chiếc thẻ đối lập", motion: "track", sfx: "whoosh", semanticRole: "subject", transform: {from: {x: 0, y: -40, scale: 0.95, rotation: -2, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 2, opacity: 1}, easing: "ease-out"}}]},

  // C02: "tám" -> "Nhưng"
  {id: "C02", phrase: "tám ly cà phê", comp: "solo", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Nhấn mạnh cùng điều kiện mua 8 ly",
   role: "motif-anchor", family: "hook-contrast", spokenSubj: "Mục tiêu 8 ly cà phê", visualSubj: "Thẻ đối lập kèm nhãn mua 8 ly", reason: "Xác nhận điều kiện mua 8 ly",
   items: [{id: "c01-card-contrast", kind: "asset", assetId: "A01", role: "hai chiếc thẻ đối lập", motion: "none", semanticRole: "subject", transform: {from: {x: 0, y: 0, scale: 1.05, rotation: 2, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 2, opacity: 1}, easing: "linear"}}]},

  // C03: "Nhưng" -> "còn"
  {id: "C03", phrase: "Nhưng chiếc thẻ này", comp: "code", exit: "replace", cam: {mode: "pan", intensity: "subtle"}, trans: "match-move",
   intent: "Cho thấy thẻ trắng bị vứt vào sọt rác",
   role: "literal-evidence", family: "hook-contrast", spokenSubj: "Chiếc thẻ bị vứt", visualSubj: "Thẻ trắng rơi vào sọt rác", reason: "Minh họa số phận bị từ chối của thẻ trắng",
   items: [{id: "c03-card-trash", kind: "asset", assetId: "A01", role: "thẻ rơi vào sọt rác", motion: "slide", semanticRole: "subject", transform: {from: {x: -190, y: 0, scale: 1, rotation: -3, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: -3, opacity: 1}, easing: "linear"}},
           {id: "c03-trash-label", kind: "code", codeTemplate: "warning", text: "BỊ VỨT BỎ", role: "kết cục tiêu cực", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C04: "còn" -> "Quán A"
  {id: "C04", phrase: "còn chiếc thẻ này", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Cho thấy thẻ có 2 dấu được cất vào ví da",
   role: "motif-anchor", family: "hook-contrast", spokenSubj: "Chiếc thẻ được giữ", visualSubj: "Thẻ 10 ô có 2 dấu nhét vào ví", reason: "Minh họa hành vi trân trọng giữ lại thẻ",
   items: [{id: "c04-card-wallet", kind: "asset", assetId: "A02", role: "thẻ được giữ trong ví", motion: "reveal", semanticRole: "subject", motifKey: "ten-slot-card", transform: {from: {x: -190, y: 30, scale: 0.85, rotation: -2, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c04-kept-label", kind: "code", codeTemplate: "label", text: "GIỮ TRONG VÍ", role: "kết cục tích cực", motion: "reveal", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.8, rotation: 1, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C05: "Quán A" -> "Quán B"
  {id: "C05", phrase: "Quán A phát thẻ", comp: "solo", exit: "carry", cam: {mode: "pull-out", intensity: "subtle"}, trans: "reframe",
   intent: "So sánh trực diện thẻ 8 ô trắng và thẻ 10 ô có sẵn 2 dấu",
   role: "literal-evidence", family: "store-comparison", spokenSubj: "Thẻ quán A", visualSubj: "Hai chiếc thẻ đặt cạnh nhau", reason: "Đối chiếu hình thức 2 loại thẻ",
   items: [{id: "c05-cards-pair", kind: "asset", assetId: "A03", role: "hai thẻ đặt trên quầy", motion: "none", semanticRole: "subject", motifKey: "ten-slot-card", transform: {from: {x: 0, y: 20, scale: 0.9, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C06: "Quán B" -> "Về mặt"
  {id: "C06", phrase: "Quán B phát thẻ", comp: "solo", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "zoom-through",
   intent: "Thể hiện động tác đóng dấu đỏ lên thẻ",
   role: "human-action", family: "counter-stamp", spokenSubj: "Đóng 2 con dấu đỏ", visualSubj: "Nhân viên đóng dấu lên thẻ", reason: "Tái hiện khoảnh khắc nhân viên trao giá trị",
   items: [{id: "c06-stamp-action", kind: "asset", assetId: "A04", role: "động tác đóng dấu đỏ", motion: "stamp", sfx: "sticker-popup", semanticRole: "subject", transform: {from: {x: 0, y: -40, scale: 0.88, rotation: 3, opacity: 0}, to: {x: 0, y: 0, scale: 1.06, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C07: "Về mặt" -> "bắt bạn"
  {id: "C07", phrase: "Về mặt toán học", comp: "code", exit: "transform", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Lật phép tính toán học 8 ly bằng 8 ly",
   role: "context", family: "store-comparison", spokenSubj: "Phép tính 8 ly", visualSubj: "So sánh toán học 8 bằng 8", reason: "Chỉ ra nghịch lý toán học giống hệt nhau",
   items: [{id: "c07-math-code", kind: "code", codeTemplate: "metric", text: "8 LY = 8 LY", role: "phép tính bằng nhau", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 0, y: 30, scale: 0.8, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.08, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C08: "bắt bạn" -> "Vậy tại sao"
  {id: "C08", phrase: "bắt bạn bỏ tiền", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Nhấn mạnh chi phí như nhau ở cả hai quán",
   role: "context", family: "store-comparison", spokenSubj: "Tiền mua 8 ly", visualSubj: "Nhãn chi phí 8 ly cà phê", reason: "Nhấn mạnh chi phí như nhau",
   items: [{id: "c08-cost-code", kind: "code", codeTemplate: "label", text: "CHI PHÍ BẰNG NHAU", role: "chi phí bằng nhau", motion: "reveal", sfx: "click", semanticRole: "accent", transform: {from: {x: 0, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C09: "Vậy tại sao" -> "Trong tâm lý"
  {id: "C09", phrase: "Vậy tại sao chiếc thẻ", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Đặt câu hỏi tại sao tỷ lệ quay lại gấp đôi",
   role: "motif-anchor", family: "customer-psychology", spokenSubj: "Câu hỏi nghịch lý", visualSubj: "Tấm thẻ 10 ô với nhãn gấp đôi quay lại", reason: "Tập trung sự chú ý vào khoảng trống tò mò",
   items: [{id: "c09-card-motif", kind: "asset", assetId: "A02", role: "thẻ 10 ô có sẵn dấu", motion: "reveal", semanticRole: "subject", motifKey: "ten-slot-card", transform: {from: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c09-question-label", kind: "code", codeTemplate: "label", text: "GẤP ĐÔI QUAY LẠI?", role: "câu hỏi mở", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.8, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C10: "Trong tâm lý" -> "Khi đứng"
  {id: "C10", phrase: "Trong tâm lý học", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "medium"}, trans: "zoom-through",
   intent: "Gọi tên hiệu ứng tiến độ mục tiêu",
   role: "context", family: "customer-psychology", spokenSubj: "Hiệu ứng tiến độ mục tiêu", visualSubj: "Tên nguyên lý tâm lý học", reason: "Gọi tên chính thức cơ chế hành vi",
   items: [{id: "c10-term-box", kind: "code", codeTemplate: "label", text: "HIỆU ỨNG TIẾN ĐỘ MỤC TIÊU", role: "tên nguyên lý", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 0, y: 30, scale: 0.8, rotation: 1, opacity: 0}, to: {x: 0, y: 0, scale: 1.06, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C11: "Khi đứng" -> "thấy một"
  {id: "C11", phrase: "Khi đứng trước con số", comp: "solo", exit: "carry", cam: {mode: "pull-out", intensity: "subtle"}, trans: "mask-reveal",
   intent: "Minh họa áp lực tâm lý khi bắt đầu từ số 0",
   role: "literal-evidence", family: "mental-obstacle", spokenSubj: "Con số 0", visualSubj: "Người đứng trước ngọn núi cao", reason: "Ẩn dụ cảm giác áp lực khi bắt đầu từ 0",
   items: [{id: "c11-mountain-climb", kind: "asset", assetId: "A07", role: "hình ảnh leo núi từ số 0", motion: "reveal", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.88, rotation: -1, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C12: "thấy một" -> "Nhưng khi"
  {id: "C12", phrase: "thấy một ngọn núi", comp: "solo", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Cho thấy ngọn núi cản trở hành vi bắt đầu",
   role: "literal-evidence", family: "mental-obstacle", spokenSubj: "Ngọn núi phải leo", visualSubj: "Ngọn núi dựng đứng", reason: "Khắc sâu cảm giác khó khăn khi tự khởi động",
   items: [{id: "c11-mountain-climb", kind: "asset", assetId: "A07", role: "hình ảnh leo núi từ số 0", motion: "none", semanticRole: "subject", transform: {from: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}}]},

  // C13: "Nhưng khi" -> "mình đã"
  {id: "C13", phrase: "Nhưng khi thấy hai con", comp: "solo", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Thể hiện thanh tiến độ 20% hoàn thành",
   role: "literal-evidence", family: "progress-feeling", spokenSubj: "Thanh tiến độ 20%", visualSubj: "Đồ họa thanh tiến độ game hóa", reason: "Minh họa trực quan cảm giác đã đi được 20%",
   items: [{id: "c13-progress-bar", kind: "asset", assetId: "A06", role: "thanh tiến độ 20%", motion: "scale", sfx: "sticker-popup", semanticRole: "subject", transform: {from: {x: 0, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.06, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C14: "mình đã" -> "bỏ dở"
  {id: "C14", phrase: "mình đã đi được", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "match-move",
   intent: "Nhấn mạnh cảm giác hoàn thành 20% chặng đường",
   role: "context", family: "progress-feeling", spokenSubj: "Đã đi 20%", visualSubj: "Nhãn hoàn thành 20%", reason: "Nhấn mạnh cảm giác thành tựu ban đầu",
   items: [{id: "c14-twenty-percent", kind: "code", codeTemplate: "metric", text: "ĐÃ ĐI 20%", role: "tiến độ 20%", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 0, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.08, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C15: "bỏ dở" -> "Khách hàng"
  {id: "C15", phrase: "bỏ dở thì tiếc", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Khắc sâu tâm lý tiếc nuối khi bỏ dở",
   role: "context", family: "customer-psychology", spokenSubj: "Tâm lý sợ lãng phí", visualSubj: "Nhãn cảnh báo tiếc nuối tiến độ", reason: "Nhấn mạnh cơ chế sợ mất mát tài sản",
   items: [{id: "c15-regret-label", kind: "code", codeTemplate: "warning", text: "TIẾC NỖ LỰC ĐÃ CÓ", role: "tâm lý sợ lãng phí", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 0, y: 30, scale: 0.8, rotation: -2, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C16: "Khách hàng" -> "vì bạn"
  {id: "C16", phrase: "Khách hàng không trung thành", comp: "solo", exit: "carry", cam: {mode: "follow", intensity: "subtle"}, trans: "mask-reveal",
   intent: "Cho thấy khách hàng vui vẻ cất thẻ vào ví",
   role: "human-action", family: "customer-psychology", spokenSubj: "Khách hàng cất thẻ", visualSubj: "Khách cất thẻ mỉm cười", reason: "Cho thấy trải nghiệm khách hàng tích cực",
   items: [{id: "c16-happy-customer", kind: "asset", assetId: "A05", role: "khách hài lòng cất thẻ", motion: "track", semanticRole: "subject", transform: {from: {x: 0, y: 30, scale: 0.9, rotation: 1, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C17: "vì bạn" -> "Họ trung thành"
  {id: "C17", phrase: "vì bạn nài nỉ", comp: "solo", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "reframe",
   intent: "Phủ định việc nài nỉ khách tích điểm",
   role: "literal-evidence", family: "customer-psychology", spokenSubj: "Không phải nài nỉ", visualSubj: "Khách hàng hài lòng", reason: "Đối chiếu giữa việc nài nỉ và tạo động lực tự nhiên",
   items: [{id: "c16-happy-customer", kind: "asset", assetId: "A05", role: "khách hài lòng cất thẻ", motion: "none", semanticRole: "subject", transform: {from: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}}]},

  // C18: "Họ trung thành" -> "bước đầu"
  {id: "C18", phrase: "Họ trung thành vì", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Đưa ra kết luận khách trung thành vì cảm giác chiến thắng",
   role: "context", family: "progress-feeling", spokenSubj: "Cảm giác chiến thắng", visualSubj: "Nhãn người chiến thắng", reason: "Khẳng định động lực tâm lý cốt lõi",
   items: [{id: "c18-winner-tag", kind: "code", codeTemplate: "label", text: "CẢM GIÁC CHIẾN THẮNG", role: "động lực tâm lý", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 0, y: 30, scale: 0.85, rotation: 1, opacity: 0}, to: {x: 0, y: 0, scale: 1.06, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C19: "bước đầu" -> "Bài học là"
  {id: "C19", phrase: "bước đầu tiên", comp: "solo", exit: "replace", cam: {mode: "pull-out", intensity: "medium"}, trans: "zoom-through",
   intent: "Hiển thị biểu đồ tăng trưởng hoàn thành 19% lên 34%",
   role: "proof", family: "proof-data", spokenSubj: "Số liệu chứng minh", visualSubj: "Biểu đồ so sánh 19% và 34%", reason: "Đưa bằng chứng thực nghiệm của nghiên cứu",
   items: [{id: "c19-data-chart", kind: "asset", assetId: "A08", role: "biểu đồ tăng trưởng 19% vs 34%", motion: "scale", semanticRole: "evidence", transform: {from: {x: 0, y: 20, scale: 0.88, rotation: 0, opacity: 0}, to: {x: 0, y: 0, scale: 1.05, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C20: "Bài học là" -> "Hãy trao cho họ"
  {id: "C20", phrase: "Bài học là", comp: "code", exit: "carry", cam: {mode: "push-in", intensity: "subtle"}, trans: "match-move",
   intent: "Đúc kết bài học đừng bắt khách bắt đầu từ số 0",
   role: "motif-anchor", family: "lesson-board", spokenSubj: "Bài học thương hiệu", visualSubj: "Thẻ 10 ô quay lại sân khấu", reason: "Gắn bài học đúc kết với hình ảnh chiếc thẻ",
   items: [{id: "c20-card-return", kind: "asset", assetId: "A02", role: "thẻ motif bài học", motion: "reveal", semanticRole: "subject", motifKey: "ten-slot-card", transform: {from: {x: -190, y: 30, scale: 0.85, rotation: -2, opacity: 0}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c20-lesson-label", kind: "code", codeTemplate: "label", text: "ĐỪNG BẮT ĐẦU TỪ SỐ 0", role: "bài học cốt lõi", motion: "stamp", sfx: "sticker-popup", semanticRole: "accent", transform: {from: {x: 200, y: 30, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C21: "Hãy trao cho họ" -> "Thử mở"
  {id: "C21", phrase: "Hãy trao cho họ", comp: "code", exit: "replace", cam: {mode: "static", intensity: "subtle"}, trans: "reframe",
   intent: "Chốt thông điệp trao cho khách một tiến độ có sẵn",
   role: "motif-anchor", family: "lesson-board", spokenSubj: "Trao tiến độ sẵn", visualSubj: "Nhãn hành động tiến độ sẵn", reason: "Củng cố giải pháp hành động cụ thể",
   items: [{id: "c20-card-return", kind: "asset", assetId: "A02", role: "thẻ motif bài học", motion: "none", semanticRole: "subject", motifKey: "ten-slot-card", transform: {from: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 1.02, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c21-advance-tag", kind: "code", codeTemplate: "label", text: "TRAO TIẾN ĐỘ SẴN", role: "giải pháp hành động", motion: "stamp", sfx: "click", semanticRole: "accent", transform: {from: {x: 200, y: 20, scale: 0.85, rotation: 0, opacity: 0}, to: {x: 190, y: 0, scale: 0.95, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C22: "Thử mở" -> "Tặng ngay"
  {id: "C22", phrase: "Thử mở chương trình", comp: "solo", exit: "carry", cam: {mode: "push-in", intensity: "medium"}, trans: "mask-reveal",
   intent: "Mở ứng dụng CRM tích điểm trên điện thoại",
   role: "application", family: "phone-setup", spokenSubj: "Ứng dụng trên điện thoại", visualSubj: "Màn hình tặng 20 điểm chào mừng", reason: "Hướng dẫn ứng dụng số vào app/CRM",
   items: [{id: "c22-phone-points", kind: "asset", assetId: "A09", role: "màn hình tặng điểm chào mừng", motion: "slide", sfx: "sticker-popup", semanticRole: "evidence", transform: {from: {x: 0, y: 30, scale: 0.88, rotation: -1, opacity: 0}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "ease-out"}}]},

  // C23: "Tặng ngay" -> "Lưu video"
  {id: "C23", phrase: "Tặng ngay hai mươi", comp: "solo", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Nhấn mạnh thao tác tặng 20 điểm khởi động",
   role: "application", family: "phone-setup", spokenSubj: "Tặng 20 điểm khởi động", visualSubj: "Màn hình cộng điểm khởi động", reason: "Minh họa hành động thiết thực cho chủ shop",
   items: [{id: "c22-phone-points", kind: "asset", assetId: "A09", role: "màn hình tặng điểm chào mừng", motion: "none", semanticRole: "evidence", transform: {from: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, to: {x: 0, y: 0, scale: 1.04, rotation: 0, opacity: 1}, easing: "linear"}}]},

  // C24: "Lưu video" -> "giữ chân"
  {id: "C24", phrase: "Lưu video này để", comp: "code", exit: "carry", cam: {mode: "pull-out", intensity: "subtle"}, trans: "reframe",
   intent: "Kêu gọi lưu video để kiểm tra trải nghiệm",
   role: "motif-anchor", family: "cta", spokenSubj: "CTA lưu video", visualSubj: "Chiếc thẻ cạnh nút Lưu video", reason: "Kêu gọi hành động lưu video duy nhất",
   items: [{id: "c24-card-cta", kind: "asset", assetId: "A02", role: "thẻ khép lại video", motion: "reveal", semanticRole: "subject", motifKey: "ten-slot-card", transform: {from: {x: -190, y: 20, scale: 0.9, rotation: -2, opacity: 0}, to: {x: -190, y: 0, scale: 0.98, rotation: 0, opacity: 1}, easing: "spring"}},
           {id: "c24-save-btn", kind: "code", codeTemplate: "button", text: "LƯU VIDEO", role: "nút CTA duy nhất", motion: "stamp", sfx: "click", semanticRole: "evidence", transform: {from: {x: 200, y: 30, scale: 0.85, rotation: 2, opacity: 0}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "spring"}}]},

  // C25: "giữ chân" -> hết
  {id: "C25", phrase: "giữ chân khách của bạn", comp: "code", exit: "replace", cam: {mode: "push-in", intensity: "subtle"}, trans: "reframe",
   intent: "Khép lại video với thông điệp trải nghiệm giữ chân khách",
   role: "motif-anchor", family: "cta", spokenSubj: "Khép lại thông điệp giữ chân khách", visualSubj: "Chiếc thẻ và nút CTA", reason: "Khép lại toàn bộ thông điệp giữ chân khách",
   items: [{id: "c24-card-cta", kind: "asset", assetId: "A02", role: "thẻ khép lại video", motion: "none", semanticRole: "subject", motifKey: "ten-slot-card", transform: {from: {x: -190, y: 0, scale: 0.98, rotation: 0, opacity: 1}, to: {x: -190, y: 0, scale: 0.98, rotation: 0, opacity: 1}, easing: "linear"}},
           {id: "c24-save-btn", kind: "code", codeTemplate: "button", text: "LƯU VIDEO", role: "nút CTA duy nhất", motion: "none", semanticRole: "evidence", transform: {from: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, to: {x: 190, y: 0, scale: 1, rotation: 0, opacity: 1}, easing: "linear"}}]}
];

// Map word boundaries to cues
let searchPtr = 0;
const builtCues = rawCues.map((c, idx) => {
  const wordIdx = findWordIndex(c.phrase, searchPtr);
  searchPtr = Math.max(searchPtr, wordIdx);
  const startMs = idx === 0 ? 0 : words[wordIdx]?.startMs || 0;
  return {
    ...c,
    startWordIdx: wordIdx,
    startMs,
    spokenAnchor: c.phrase
  };
});

for (let i = 0; i < builtCues.length - 1; i++) {
  builtCues[i].endMs = builtCues[i + 1].startMs;
}
builtCues[builtCues.length - 1].endMs = durationMs;

// Adjust C01 thumbnail hold strictly to ~1.0s (30 frames)
builtCues[0].endMs = Math.min(builtCues[0].endMs, 1000);
builtCues[1].startMs = builtCues[0].endMs;

// Format into valid episode cues
const visualCues = builtCues.map((c) => ({
  id: c.id,
  startMs: c.startMs,
  endMs: c.endMs,
  startFrame: Math.round(c.startMs / frameMs),
  endFrame: Math.round(c.endMs / frameMs),
  spokenAnchor: c.spokenAnchor,
  spokenSubject: c.spokenSubj,
  visualSubject: c.visualSubj,
  visualReason: c.reason,
  semanticIntent: c.intent,
  sceneFamily: c.family,
  continuityRole: c.role,
  composition: c.comp,
  exit: c.exit,
  camera: c.cam,
  transition: c.trans,
  items: c.items.map((item, idx) => ({
    ...item,
    enterMs: c.startMs + (idx > 0 && item.motion === "stamp" ? 120 : 0)
  }))
}));

// Asset paths
const assets = brief.assets.map((a) => {
  const filename = a.src.split("/").pop().replace("-green-", "-alpha-");
  return {
    id: a.id,
    src: `ep007/v01/generated/${filename}`,
    alt: a.alt,
    kind: "image",
    sourceType: "generated",
    provider: "flow-agent",
    stickerTreatment: "remotion-paper",
    hasBakedContour: false
  };
});

const episode = {
  schemaVersion: 2,
  id: "EP007",
  slug: "the-tich-diem-10-o-bi-mat-2-con-dau",
  title: brief.creativeContract.title,
  durationMs: durationMs,
  metadata: {
    episodeId: "ep007",
    slug: "the-tich-diem-10-o-bi-mat-2-con-dau",
    version: 1,
    language: "vi",
    stylePreset: "branding-story-paper-pink",
    totalDurationMs: durationMs,
    totalFrames: Math.round(durationMs / frameMs),
    fps: 30,
    width: 1080,
    height: 1920,
    audioFile: "audio/ep007-voice-cartesia-processed-v01.wav",
    audioDurationMs: durationMs
  },
  creativeContract: brief.creativeContract,
  beats: brief.beats,
  audio: {
    voiceSrc: "audio/ep007-voice-cartesia-processed-v01.wav",
    voiceVolume: 1,
    musicSrc: "audio/background-music-v01.mp3",
    musicVolume: 0.08
  },
  wordsSrc: "src/data/ep007-v01-words.json",
  motionGrammar: "continuous-stage-v1",
  visualGrammar: "subject-led-v1",
  visualCues,
  assets,
  captions,
  words
};

await writeFile(new URL("creatorflow/ep007-episode.json", root), JSON.stringify(episode, null, 2));
console.log(`PASS: Built ep007-episode.json with ${visualCues.length} cues, duration ${durationMs}ms (${Math.round(durationMs/frameMs)} frames)`);
