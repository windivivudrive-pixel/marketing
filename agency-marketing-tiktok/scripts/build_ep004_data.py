import json

# 1. Official Captions (max 8 words per line, 0-53508ms)
captions = [
  {"text": "Sầu riêng ngoài chợ 150k một ký,", "startMs": 0, "endMs": 1880},
  {"text": "tại sao Ngọc Sầu Riêng Q7", "startMs": 1880, "endMs": 2800},
  {"text": "bán tận 600k một ký cơm", "startMs": 2800, "endMs": 4220},
  {"text": "mà ngày nào khách cũng xếp hàng dài?", "startMs": 4220, "endMs": 5920},
  {"text": "Nhiều người nghĩ khách ở đây bị ngáo giá,", "startMs": 5920, "endMs": 7400},
  {"text": "nhưng tính kỹ ra thì họ lại là", "startMs": 7400, "endMs": 8440},
  {"text": "những người mua hàng thông minh nhất!", "startMs": 8440, "endMs": 9480},
  {"text": "Bởi vì mua sầu riêng nguyên quả ngoài chợ", "startMs": 9480, "endMs": 10820},
  {"text": "giống như chơi xổ số vậy.", "startMs": 10820, "endMs": 12220},
  {"text": "Quả 3 ký giá 450k,", "startMs": 12220, "endMs": 13640},
  {"text": "mang về bổ ra vỏ chiếm hết 70%,", "startMs": 13640, "endMs": 15360},
  {"text": "được vài múi cơm mà lỡ dính", "startMs": 15360, "endMs": 16400},
  {"text": "một múi sượng là coi như mất trắng.", "startMs": 16400, "endMs": 17980},
  {"text": "Tính ra, giá cơm sầu ngoài chợ", "startMs": 17980, "endMs": 19340},
  {"text": "thực chất đã gần 700k một ký,", "startMs": 19340, "endMs": 20820},
  {"text": "mà rủi ro thì tự chịu!", "startMs": 20820, "endMs": 21760},
  {"text": "Còn ở đây, họ loại bỏ hoàn toàn", "startMs": 21760, "endMs": 23480},
  {"text": "trò chơi may rủi.", "startMs": 23480, "endMs": 24580},
  {"text": "600k là bạn nhận đúng 1 ký cơm tuyển,", "startMs": 24580, "endMs": 26480},
  {"text": "khui ăn thử ngay tại bàn,", "startMs": 26480, "endMs": 27720},
  {"text": "sượng múi nào đổi múi đó.", "startMs": 27720, "endMs": 28860},
  {"text": "Khách hàng không mua sầu riêng đắt,", "startMs": 28860, "endMs": 30160},
  {"text": "họ đang mua sự chắc chắn 100%", "startMs": 30160, "endMs": 31440},
  {"text": "không bao giờ bị bực mình!", "startMs": 31440, "endMs": 32500},
  {"text": "Nhưng bí mật kinh doanh thú vị nhất là:", "startMs": 32500, "endMs": 33620},
  {"text": "bao đổi 1-1 như vậy thì chủ quán", "startMs": 33620, "endMs": 36000},
  {"text": "lấy đâu ra lời? Quả sượng bỏ đi đâu?", "startMs": 36000, "endMs": 37820},
  {"text": "Họ không hề vứt đi!", "startMs": 37820, "endMs": 38740},
  {"text": "Những múi không đạt chuẩn bán tươi", "startMs": 38740, "endMs": 39900},
  {"text": "lập tức được cấp đông để bán sỉ", "startMs": 39900, "endMs": 40860},
  {"text": "cho các xưởng làm bánh pía,", "startMs": 40860, "endMs": 42040},
  {"text": "kem và chè sầu riêng.", "startMs": 42040, "endMs": 42920},
  {"text": "Nhờ có đầu ra khép kín cho hàng phụ phẩm,", "startMs": 42920, "endMs": 44780},
  {"text": "họ mới tự tin cam kết bảo hành đanh thép", "startMs": 44780, "endMs": 46200},
  {"text": "mà không sợ lỗ!", "startMs": 46200, "endMs": 47300},
  {"text": "Bài học cho mọi chủ shop:", "startMs": 47300, "endMs": 48320},
  {"text": "Đừng chỉ cạnh tranh giảm giá.", "startMs": 48320, "endMs": 49820},
  {"text": "Hãy bóc tách phần lõi giá trị nhất", "startMs": 49820, "endMs": 50800},
  {"text": "để bán giá cao,", "startMs": 50800, "endMs": 51600},
  {"text": "và xử lý triệt để nỗi sợ của khách hàng nhé!", "startMs": 51600, "endMs": 53508}
]

for c in captions:
    c["timestampMs"] = c["startMs"]
    c["confidence"] = None

with open("src/data/captions.json", "w", encoding="utf-8") as f:
    json.dump(captions, f, ensure_ascii=False, indent=2)

# 2. 24 Visual Cues
cues = [
  {
    "id": "C01",
    "startMs": 0,
    "endMs": 1880,
    "headline": "SẦU RIÊNG 600K/KG?",
    "body": "Đắt gấp 3 hay mua thông minh?",
    "mascot": "scare",
    "kind": "image",
    "sfx": "whoosh.wav",
    "items": [
      {"src": "ep004/v01/crops/s01-durian-market.png", "assetId": "S01", "delayMs": 0},
      {"src": "ep004/v01/crops/s02-durian-box-golden.png", "assetId": "S02", "delayMs": 0}
    ]
  },
  {
    "id": "C02",
    "startMs": 1880,
    "endMs": 4220,
    "headline": "SẦU RIÊNG 600K/KG?",
    "body": "Ngọc Sầu Riêng Q7",
    "mascot": "scare",
    "kind": "image",
    "sfx": "sticker-popup.mp3",
    "items": [{"src": "ep004/v01/crops/s03-ngoc-storefront.png", "assetId": "S03", "delayMs": 0}]
  },
  {
    "id": "C03",
    "startMs": 4220,
    "endMs": 5920,
    "headline": "SẦU RIÊNG 600K/KG?",
    "body": "Khách xếp hàng dài",
    "mascot": "scare",
    "kind": "image",
    "sfx": "page-turn.wav",
    "items": [
      {"src": "ep004/v01/crops/s03-ngoc-storefront.png", "assetId": "S03", "isHeld": True, "delayMs": 0},
      {"src": "ep004/v01/crops/s04-customer-queue.png", "assetId": "S04", "delayMs": 0}
    ]
  },
  {
    "id": "C04",
    "startMs": 5920,
    "endMs": 7400,
    "headline": "NGÁO GIÁ HAY THÔNG MINH?",
    "body": "Nhiều người nghĩ bị ngáo giá",
    "mascot": "thinking",
    "kind": "image",
    "sfx": "click.wav",
    "items": [{"src": "ep004/v01/crops/s12-no-sale-sign.png", "assetId": "S12", "delayMs": 0}]
  },
  {
    "id": "C05",
    "startMs": 7400,
    "endMs": 9480,
    "headline": "NGÁO GIÁ HAY THÔNG MINH?",
    "body": "Người mua hàng thông minh nhất",
    "mascot": "thinking",
    "kind": "image",
    "sfx": "ding.wav",
    "items": [{"src": "ep004/v01/crops/s11-diamond-core.png", "assetId": "S11", "delayMs": 0}]
  },
  {
    "id": "C06",
    "startMs": 9480,
    "endMs": 12220,
    "headline": "TRÒ CHƠI XỔ SỐ",
    "body": "Mua sầu chợ như chơi xổ số",
    "mascot": "thinking",
    "kind": "image",
    "sfx": "page-turn.wav",
    "items": [{"src": "ep004/v01/crops/s05-lottery-wheel.png", "assetId": "S05", "delayMs": 0}]
  },
  {
    "id": "C07",
    "startMs": 12220,
    "endMs": 15360,
    "headline": "TRÒ CHƠI XỔ SỐ",
    "body": "Quả 3kg: Vỏ chiếm 70%",
    "mascot": "disconect",
    "kind": "ui",
    "uiType": "UI01_DurianAnatomyChart",
    "sfx": "whoosh.wav",
    "items": []
  },
  {
    "id": "C08",
    "startMs": 15360,
    "endMs": 17980,
    "headline": "TRÒ CHƠI XỔ SỐ",
    "body": "Dính 1 múi sượng là mất trắng",
    "mascot": "sad cry",
    "kind": "image",
    "sfx": "sticker-popup.mp3",
    "items": [{"src": "ep004/v01/crops/s06-durian-suong.png", "assetId": "S06", "delayMs": 0}]
  },
  {
    "id": "C09",
    "startMs": 17980,
    "endMs": 21760,
    "headline": "PHÉP TOÁN THỰC TẾ",
    "body": "Cơm sầu chợ thực chất ~700k/kg",
    "mascot": "find",
    "kind": "ui",
    "uiType": "UI02_RealCostCalculator",
    "sfx": "whoosh.wav",
    "items": []
  },
  {
    "id": "C10",
    "startMs": 21760,
    "endMs": 24580,
    "headline": "BÁN SỰ CHẮC CHẮN",
    "body": "Loại bỏ hoàn toàn may rủi",
    "mascot": "cool",
    "kind": "image",
    "sfx": "ding.wav",
    "items": [{"src": "ep004/v01/crops/s13-green-shield.png", "assetId": "S13", "delayMs": 0}]
  },
  {
    "id": "C11",
    "startMs": 24580,
    "endMs": 26480,
    "headline": "BÁN SỰ CHẮC CHẮN",
    "body": "600k = 100% Cơm sầu tuyển",
    "mascot": "cool",
    "kind": "image",
    "sfx": "sticker-popup.mp3",
    "items": [{"src": "ep004/v01/crops/s02-durian-box-golden.png", "assetId": "S02", "delayMs": 0}]
  },
  {
    "id": "C12",
    "startMs": 26480,
    "endMs": 27720,
    "headline": "BẢO HIỂM VỊ GIÁC",
    "body": "Khui ăn thử ngay tại bàn",
    "mascot": "cool",
    "kind": "image",
    "sfx": "click.wav",
    "items": [{"src": "ep004/v01/crops/s07-peeling-counter.png", "assetId": "S07", "delayMs": 0}]
  },
  {
    "id": "C13",
    "startMs": 27720,
    "endMs": 30160,
    "headline": "BẢO HIỂM VỊ GIÁC",
    "body": "Sượng múi nào đổi múi đó",
    "mascot": "cool",
    "kind": "image",
    "sfx": "ding.wav",
    "items": [
      {"src": "ep004/v01/crops/s07-peeling-counter.png", "assetId": "S07", "isHeld": True, "delayMs": 0},
      {"src": "ep004/v01/crops/s08-guarantee-seal.png", "assetId": "S08", "delayMs": 0}
    ]
  },
  {
    "id": "C14",
    "startMs": 30160,
    "endMs": 32500,
    "headline": "BÁN SỰ CHẮC CHẮN",
    "body": "Mua sự an tâm không bị bực mình",
    "mascot": "cool",
    "kind": "image",
    "sfx": "sticker-popup.mp3",
    "items": [{"src": "ep004/v01/crops/s11-diamond-core.png", "assetId": "S11", "delayMs": 0}]
  },
  {
    "id": "C15",
    "startMs": 32500,
    "endMs": 36000,
    "headline": "CÂU HỎI TRIỆU ĐÔ",
    "body": "Bao đổi 1-1 thì lấy đâu ra lời?",
    "mascot": "thinking",
    "kind": "image",
    "sfx": "click.wav",
    "items": [{"src": "ep004/v01/crops/s08-guarantee-seal.png", "assetId": "S08", "delayMs": 0}]
  },
  {
    "id": "C16",
    "startMs": 36000,
    "endMs": 38740,
    "headline": "CÂU HỎI TRIỆU ĐÔ",
    "body": "Quả sượng bỏ đi đâu?",
    "mascot": "thinking",
    "kind": "image",
    "sfx": "page-turn.wav",
    "items": [{"src": "ep004/v01/crops/s06-durian-suong.png", "assetId": "S06", "delayMs": 0}]
  },
  {
    "id": "C17",
    "startMs": 38740,
    "endMs": 40860,
    "headline": "BÍ MẬT CHUỖI CUNG ỨNG",
    "body": "Cấp đông bán sỉ cho xưởng",
    "mascot": "idea",
    "kind": "image",
    "sfx": "whoosh.wav",
    "items": [{"src": "ep004/v01/crops/s09-freezer-unit.png", "assetId": "S09", "delayMs": 0}]
  },
  {
    "id": "C18",
    "startMs": 40860,
    "endMs": 42920,
    "headline": "BÍ MẬT CHUỖI CUNG ỨNG",
    "body": "Bánh pía · Kem · Chè sầu riêng",
    "mascot": "idea",
    "kind": "image",
    "sfx": "sticker-popup.mp3",
    "items": [{"src": "ep004/v01/crops/s10-fnb-desserts.png", "assetId": "S10", "delayMs": 0}]
  },
  {
    "id": "C19",
    "startMs": 42920,
    "endMs": 46200,
    "headline": "CHUỖI GIÁ TRỊ KHÉP KÍN",
    "body": "B2C giá cao & B2B chế biến",
    "mascot": "working cool",
    "kind": "ui",
    "uiType": "UI03_DualChannelSupplyDiagram",
    "sfx": "whoosh.wav",
    "items": []
  },
  {
    "id": "C20",
    "startMs": 46200,
    "endMs": 48320,
    "headline": "TỰ TIN BẢO HÀNH",
    "body": "Có đầu ra phụ phẩm → Không sợ lỗ",
    "mascot": "working cool",
    "kind": "image",
    "sfx": "ding.wav",
    "items": [{"src": "ep004/v01/crops/s13-green-shield.png", "assetId": "S13", "delayMs": 0}]
  },
  {
    "id": "C21",
    "startMs": 48320,
    "endMs": 50800,
    "headline": "BÀI HỌC CHO CHỦ SHOP",
    "body": "Đừng chỉ cạnh tranh giảm giá",
    "mascot": "find",
    "kind": "image",
    "sfx": "click.wav",
    "items": [{"src": "ep004/v01/crops/s12-no-sale-sign.png", "assetId": "S12", "delayMs": 0}]
  },
  {
    "id": "C22",
    "startMs": 50800,
    "endMs": 51600,
    "headline": "BÀI HỌC CHO CHỦ SHOP",
    "body": "Bóc tách phần lõi giá trị nhất",
    "mascot": "find",
    "kind": "image",
    "sfx": "ding.wav",
    "items": [{"src": "ep004/v01/crops/s11-diamond-core.png", "assetId": "S11", "delayMs": 0}]
  },
  {
    "id": "C23",
    "startMs": 51600,
    "endMs": 53508,
    "headline": "ĐỊNH GIÁ CAO VẪN ĐẮT KHÁCH",
    "body": "Xử lý triệt để nỗi sợ của khách",
    "mascot": "clap hand",
    "kind": "ui",
    "uiType": "UI04_ZeroFearActionCard",
    "sfx": "ding.wav",
    "items": []
  }
]

with open("src/data/cues.json", "w", encoding="utf-8") as f:
    json.dump(cues, f, ensure_ascii=False, indent=2)

print("Saved EP004 captions and 23 cues successfully!")
