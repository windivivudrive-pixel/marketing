import json

# 1. Captions (without greeting, max 8 words per line)
captions_data = [
  {"text": "Vì sao có shop bật Affiliate", "startMs": 0, "endMs": 1100},
  {"text": "càng chạy càng khỏe,", "startMs": 1100, "endMs": 2220},
  {"text": "còn shop khác càng bán càng mệt", "startMs": 2220, "endMs": 3260},
  {"text": "vì đơn hoàn?", "startMs": 3260, "endMs": 4300},
  {"text": "Sai lầm thường gặp là đặt hoa hồng", "startMs": 4300, "endMs": 5440},
  {"text": "thật cao rồi để Creator", "startMs": 5440, "endMs": 6300},
  {"text": "tự nói gì cũng được.", "startMs": 6300, "endMs": 7640},
  {"text": "Nội dung càng phóng đại,", "startMs": 7640, "endMs": 8760},
  {"text": "kỳ vọng càng lệch.", "startMs": 8760, "endMs": 9820},
  {"text": "Khách nhận hàng không giống tưởng tượng", "startMs": 9820, "endMs": 11020},
  {"text": "thì dễ hủy hoặc trả đơn.", "startMs": 11020, "endMs": 12400},
  {"text": "Shop mất chi phí,", "startMs": 12400, "endMs": 13420},
  {"text": "trải nghiệm khách cũng xấu đi.", "startMs": 13420, "endMs": 14700},
  {"text": "Cách chắc hơn chỉ có ba việc:", "startMs": 14700, "endMs": 15600},
  {"text": "đưa khung kịch bản rõ,", "startMs": 15600, "endMs": 16780},
  {"text": "gửi đúng sản phẩm mẫu,", "startMs": 16780, "endMs": 17820},
  {"text": "và theo dõi đơn thực tế", "startMs": 17820, "endMs": 18780},
  {"text": "thay vì chỉ nhìn lượt xem.", "startMs": 18780, "endMs": 19920},
  {"text": "Affiliate không phải thả hoa hồng", "startMs": 19920, "endMs": 20960},
  {"text": "rồi chờ may mắn.", "startMs": 20960, "endMs": 21520},
  {"text": "Hãy thử với năm Creator phù hợp,", "startMs": 21520, "endMs": 23340},
  {"text": "dùng cùng một brief,", "startMs": 23340, "endMs": 24240},
  {"text": "rồi giữ người tạo đơn tốt", "startMs": 24240, "endMs": 24940},
  {"text": "và ít hoàn.", "startMs": 24940, "endMs": 25780},
  {"text": "Làm nhỏ, đo thật,", "startMs": 25780, "endMs": 26640},
  {"text": "rồi mới mở rộng nhé!", "startMs": 26640, "endMs": 27564}
]

for c in captions_data:
    c["timestampMs"] = c["startMs"]
    c["confidence"] = None

with open("src/data/captions.json", "w", encoding="utf-8") as f:
    json.dump(captions_data, f, ensure_ascii=False, indent=2)

# 2. 20 Cues with Varied SFX and Hold Tracking
cues_data = [
  {
    "id": "C01",
    "startMs": 0,
    "endMs": 700,
    "headline": "AFFILIATE: KHỎE HAY MỆT?",
    "body": "Đơn thật hay đơn hoàn?",
    "mascot": "scare",
    "kind": "image",
    "sfx": "whoosh.wav",
    "items": [{"src": "ep003/v02/crops/s01-hook-thumbnail.png", "assetId": "H01", "delayMs": 0}]
  },
  {
    "id": "C02",
    "startMs": 700,
    "endMs": 2220,
    "headline": "AFFILIATE: KHỎE HAY MỆT?",
    "body": "Luồng đơn vận hành khỏe",
    "mascot": "scare",
    "kind": "image",
    "sfx": "sticker-popup.mp3",
    "items": [{"src": "ep003/v02/crops/s06-coolmate-box.png", "assetId": "A01", "delayMs": 0}]
  },
  {
    "id": "C03",
    "startMs": 2220,
    "endMs": 3260,
    "headline": "AFFILIATE: KHỎE HAY MỆT?",
    "body": "Đơn khỏe vs Đơn hoàn",
    "mascot": "scare",
    "kind": "image",
    "sfx": "buzzer.wav",
    "items": [
      {"src": "ep003/v02/crops/s06-coolmate-box.png", "assetId": "A01", "isHeld": True, "delayMs": 0},
      {"src": "ep003/v02/crops/s04-return-box.png", "assetId": "A02", "delayMs": 0}
    ]
  },
  {
    "id": "C04",
    "startMs": 3260,
    "endMs": 4300,
    "headline": "AFFILIATE: KHỎE HAY MỆT?",
    "body": "Chi phí đơn hoàn",
    "mascot": "scare",
    "kind": "ui",
    "uiType": "UI01_ReturnCostCounter",
    "sfx": "whoosh.wav",
    "items": []
  },
  {
    "id": "C05",
    "startMs": 4300,
    "endMs": 5440,
    "headline": "SAI LẦM ĐẦU TIÊN",
    "body": "Hoa hồng cao, không có brief",
    "mascot": "thinking",
    "kind": "image",
    "sfx": "click.wav",
    "items": [{"src": "ep003/v02/crops/s02-commission-badge.png", "assetId": "A03", "delayMs": 0}]
  },
  {
    "id": "C06",
    "startMs": 5440,
    "endMs": 6300,
    "headline": "SAI LẦM ĐẦU TIÊN",
    "body": "Đẩy hoa hồng quá cao",
    "mascot": "thinking",
    "kind": "image",
    "sfx": None, # HELD, no SFX replay
    "items": [{"src": "ep003/v02/crops/s02-commission-badge.png", "assetId": "A03", "isHeld": True, "delayMs": 0}]
  },
  {
    "id": "C07",
    "startMs": 6300,
    "endMs": 7640,
    "headline": "SAI LẦM ĐẦU TIÊN",
    "body": "Creator tự nói tự do",
    "mascot": "disconect",
    "kind": "image",
    "sfx": "page-turn.wav",
    "items": [{"src": "ep002/v03/crops/s02-a-duplicate-avatar.png", "assetId": "A04", "delayMs": 0}]
  },
  {
    "id": "C08",
    "startMs": 7640,
    "endMs": 8760,
    "headline": "KỲ VỌNG BỊ ĐẨY QUÁ XA",
    "body": "Content phóng đại",
    "mascot": "disconect",
    "kind": "image",
    "sfx": "buzzer.wav",
    "items": [{"src": "ep003/v02/crops/s03-a-megaphone-sale.png", "assetId": "A05", "delayMs": 0}]
  },
  {
    "id": "C09",
    "startMs": 8760,
    "endMs": 9820,
    "headline": "KỲ VỌNG BỊ ĐẨY QUÁ XA",
    "body": "Kỳ vọng sai lệch",
    "mascot": "sad cry",
    "kind": "image",
    "sfx": "sticker-popup.mp3",
    "items": [{"src": "ep002/v03/crops/s01-c-skeptical-shopper.png", "assetId": "A06", "delayMs": 0}]
  },
  {
    "id": "C10",
    "startMs": 9820,
    "endMs": 11020,
    "headline": "KỲ VỌNG BỊ ĐẨY QUÁ XA",
    "body": "Nhận hàng thất vọng",
    "mascot": "sad cry",
    "kind": "image",
    "sfx": "buzzer.wav",
    "items": [
      {"src": "ep002/v03/crops/s01-c-skeptical-shopper.png", "assetId": "A06", "isHeld": True, "delayMs": 0},
      {"src": "ep003/v02/crops/s04-return-box.png", "assetId": "A07", "delayMs": 0}
    ]
  },
  {
    "id": "C11",
    "startMs": 11020,
    "endMs": 12400,
    "headline": "ĐƠN HOÀN KHÔNG TỰ NHIÊN XUẤT HIỆN",
    "body": "Kỳ vọng sai → Trải nghiệm xấu",
    "mascot": "sad cry",
    "kind": "ui",
    "uiType": "UI02_CancelReturnControl",
    "sfx": "click.wav",
    "items": [{"src": "ep003/v02/crops/s04-return-box.png", "assetId": "A02", "delayMs": 0}]
  },
  {
    "id": "C12",
    "startMs": 12400,
    "endMs": 14700,
    "headline": "ĐƠN HOÀN KHÔNG TỰ NHIÊN XUẤT HIỆN",
    "body": "Chi phí tăng, Trải nghiệm tụt",
    "mascot": "sad cry",
    "kind": "ui",
    "uiType": "UI03_CostExperienceChart",
    "sfx": "whoosh.wav",
    "items": []
  },
  {
    "id": "C13",
    "startMs": 14700,
    "endMs": 15600,
    "headline": "BA VIỆC PHẢI KHÓA",
    "body": "Kịch bản · Mẫu · Đơn thật",
    "mascot": "idea",
    "kind": "image",
    "sfx": "page-turn.wav",
    "items": [{"src": "ep003/v02/crops/s07-a-script-folder.png", "assetId": "A09", "delayMs": 0}]
  },
  {
    "id": "C14",
    "startMs": 15600,
    "endMs": 16780,
    "headline": "BA VIỆC PHẢI KHÓA",
    "body": "1. Khung kịch bản chuẩn",
    "mascot": "idea",
    "kind": "ui",
    "uiType": "UI04_SharedBriefCard",
    "sfx": "ding.wav",
    "items": []
  },
  {
    "id": "C15",
    "startMs": 16780,
    "endMs": 17820,
    "headline": "BA VIỆC PHẢI KHÓA",
    "body": "2. Gửi đúng sản phẩm mẫu",
    "mascot": "idea",
    "kind": "image",
    "sfx": "sticker-popup.mp3",
    "items": [{"src": "ep003/v02/crops/s07-b-coolmate-polo.png", "assetId": "A08", "delayMs": 0}]
  },
  {
    "id": "C16",
    "startMs": 17820,
    "endMs": 18780,
    "headline": "ĐỪNG CHỈ NHÌN VIEW",
    "body": "3. Theo dõi đơn thực tế",
    "mascot": "find",
    "kind": "image",
    "sfx": "ding.wav",
    "items": [{"src": "ep003/v02/crops/s07-c-verified-badge.png", "assetId": "A11", "delayMs": 0}]
  },
  {
    "id": "C17",
    "startMs": 18780,
    "endMs": 21520,
    "headline": "ĐỪNG CHỈ NHÌN VIEW",
    "body": "Đơn thực tế vs Lượt xem ảo",
    "mascot": "find",
    "kind": "image",
    "sfx": "buzzer.wav",
    "items": [
      {"src": "ep003/v02/crops/s07-c-verified-badge.png", "assetId": "A11", "isHeld": True, "delayMs": 0},
      {"src": "ep003/v02/crops/s03-b-fake-award.png", "assetId": "A12", "delayMs": 0}
    ]
  },
  {
    "id": "C18",
    "startMs": 21520,
    "endMs": 23340,
    "headline": "THỬ NHỎ TRƯỚC",
    "body": "5 Creator · 1 brief chung",
    "mascot": "cool",
    "kind": "image",
    "sfx": "page-turn.wav",
    "items": [{"src": "ep002/v03/crops/s03-a-identical-crowd.png", "assetId": "A10", "delayMs": 0}]
  },
  {
    "id": "C19",
    "startMs": 23340,
    "endMs": 25780,
    "headline": "ĐO THẬT RỒI MỞ RỘNG",
    "body": "Giữ người tạo đơn tốt, ít hoàn",
    "mascot": "cool",
    "kind": "image",
    "sfx": "ding.wav",
    "items": [
      {"src": "ep002/v03/crops/s10-a-real-person-card.png", "assetId": "A14", "delayMs": 0},
      {"src": "ep003/v02/crops/s08-partnership-handshake.png", "assetId": "A13", "delayMs": 400}
    ]
  },
  {
    "id": "C20",
    "startMs": 25780,
    "endMs": 27564,
    "headline": "ĐO THẬT RỒI MỞ RỘNG",
    "body": "Làm nhỏ · Đo thật · Mở rộng",
    "mascot": "clap hand",
    "kind": "ui",
    "uiType": "UI05_ThreeStepChecklist",
    "sfx": "ding.wav",
    "items": []
  }
]

with open("src/data/cues.json", "w", encoding="utf-8") as f:
    json.dump(cues_data, f, ensure_ascii=False, indent=2)

print("Saved src/data/captions.json and src/data/cues.json successfully!")
