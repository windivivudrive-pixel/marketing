import json

# 1. Official Captions (<= 8 words per line)
captions_data = [
  {"text": "Vì sao có shop bật Affiliate", "startMs": 0, "endMs": 1320},
  {"text": "càng chạy càng khỏe,", "startMs": 1320, "endMs": 2620},
  {"text": "còn shop khác càng bán càng mệt", "startMs": 2620, "endMs": 3860},
  {"text": "vì đơn hoàn?", "startMs": 3860, "endMs": 4840},
  {"text": "Chào các bạn, mình đây!", "startMs": 4840, "endMs": 6460},
  {"text": "Sai lầm thường gặp là đặt hoa hồng", "startMs": 6460, "endMs": 7740},
  {"text": "thật cao rồi để Creator", "startMs": 7740, "endMs": 8820},
  {"text": "tự nói gì cũng được.", "startMs": 8820, "endMs": 10200},
  {"text": "Nội dung càng phóng đại,", "startMs": 10200, "endMs": 11340},
  {"text": "kỳ vọng càng lệch.", "startMs": 11340, "endMs": 12340},
  {"text": "Khách nhận hàng không giống tưởng tượng", "startMs": 12340, "endMs": 13760},
  {"text": "thì dễ hủy hoặc trả đơn.", "startMs": 13760, "endMs": 15160},
  {"text": "Shop mất chi phí,", "startMs": 15160, "endMs": 16219},
  {"text": "trải nghiệm khách cũng xấu đi.", "startMs": 16219, "endMs": 17520},
  {"text": "Cách chắc hơn chỉ có ba việc:", "startMs": 17520, "endMs": 18960},
  {"text": "đưa khung kịch bản rõ,", "startMs": 18960, "endMs": 20220},
  {"text": "gửi đúng sản phẩm mẫu,", "startMs": 20220, "endMs": 21560},
  {"text": "và theo dõi đơn thực tế", "startMs": 21560, "endMs": 22800},
  {"text": "thay vì chỉ nhìn lượt xem.", "startMs": 22800, "endMs": 24580},
  {"text": "Affiliate không phải thả hoa hồng", "startMs": 24580, "endMs": 25860},
  {"text": "rồi chờ may mắn.", "startMs": 25860, "endMs": 26980},
  {"text": "Hãy thử với năm Creator phù hợp,", "startMs": 26980, "endMs": 28740},
  {"text": "dùng cùng một brief,", "startMs": 28740, "endMs": 29820},
  {"text": "rồi giữ người tạo đơn tốt và ít hoàn.", "startMs": 29820, "endMs": 31780},
  {"text": "Làm nhỏ, đo thật,", "startMs": 31780, "endMs": 33100},
  {"text": "rồi mới mở rộng nhé!", "startMs": 33100, "endMs": 33893}
]

for c in captions_data:
    c["timestampMs"] = c["startMs"]
    c["confidence"] = None

with open("src/data/captions.json", "w", encoding="utf-8") as f:
    json.dump(captions_data, f, ensure_ascii=False, indent=2)

print("Saved src/data/captions.json")

# 2. 20 Cues Mapping
cues_data = [
  {
    "id": "C01",
    "startMs": 0,
    "endMs": 840,
    "headline": "AFFILIATE: KHỎE HAY MỆT?",
    "body": "Đơn thật hay đơn hoàn?",
    "mascot": "scare",
    "kind": "image",
    "items": [{"src": "ep003/v02/crops/s01-hook-thumbnail.png", "delayMs": 0}]
  },
  {
    "id": "C02",
    "startMs": 840,
    "endMs": 2620,
    "headline": "AFFILIATE: KHỎE HAY MỆT?",
    "body": "Luồng đơn vận hành khỏe",
    "mascot": "scare",
    "kind": "image",
    "items": [{"src": "ep003/v02/crops/s06-coolmate-box.png", "delayMs": 0}]
  },
  {
    "id": "C03",
    "startMs": 2620,
    "endMs": 3860,
    "headline": "AFFILIATE: KHỎE HAY MỆT?",
    "body": "Đơn khỏe vs Đơn hoàn",
    "mascot": "scare",
    "kind": "image",
    "items": [
      {"src": "ep003/v02/crops/s06-coolmate-box.png", "delayMs": 0},
      {"src": "ep003/v02/crops/s04-return-box.png", "delayMs": 0}
    ]
  },
  {
    "id": "C04",
    "startMs": 3860,
    "endMs": 4840,
    "headline": "AFFILIATE: KHỎE HAY MỆT?",
    "body": "Chi phí đơn hoàn",
    "mascot": "scare",
    "kind": "ui",
    "uiType": "UI01_ReturnCostCounter",
    "items": []
  },
  {
    "id": "C05",
    "startMs": 4840,
    "endMs": 7740,
    "headline": "SAI LẦM ĐẦU TIÊN",
    "body": "Hoa hồng cao, không có brief",
    "mascot": "thinking",
    "kind": "image",
    "items": [{"src": "ep003/v02/crops/s02-commission-badge.png", "delayMs": 0}]
  },
  {
    "id": "C06",
    "startMs": 7740,
    "endMs": 8820,
    "headline": "SAI LẦM ĐẦU TIÊN",
    "body": "Đẩy hoa hồng quá cao",
    "mascot": "thinking",
    "kind": "image",
    "items": [{"src": "ep003/v02/crops/s02-commission-badge.png", "delayMs": 0}]
  },
  {
    "id": "C07",
    "startMs": 8820,
    "endMs": 10200,
    "headline": "SAI LẦM ĐẦU TIÊN",
    "body": "Creator tự nói tự do",
    "mascot": "disconect",
    "kind": "image",
    "items": [{"src": "ep002/v03/crops/s02-a-duplicate-avatar.png", "delayMs": 0}]
  },
  {
    "id": "C08",
    "startMs": 10200,
    "endMs": 11340,
    "headline": "KỲ VỌNG BỊ ĐẨY QUÁ XA",
    "body": "Content phóng đại",
    "mascot": "disconect",
    "kind": "image",
    "items": [{"src": "ep003/v02/crops/s03-a-megaphone-sale.png", "delayMs": 0}]
  },
  {
    "id": "C09",
    "startMs": 11340,
    "endMs": 12340,
    "headline": "KỲ VỌNG BỊ ĐẨY QUÁ XA",
    "body": "Kỳ vọng sai lệch",
    "mascot": "sad cry",
    "kind": "image",
    "items": [{"src": "ep002/v03/crops/s01-c-skeptical-shopper.png", "delayMs": 0}]
  },
  {
    "id": "C10",
    "startMs": 12340,
    "endMs": 13760,
    "headline": "KỲ VỌNG BỊ ĐẨY QUÁ XA",
    "body": "Nhận hàng thất vọng",
    "mascot": "sad cry",
    "kind": "image",
    "items": [
      {"src": "ep002/v03/crops/s01-c-skeptical-shopper.png", "delayMs": 0},
      {"src": "ep003/v02/crops/s04-return-box.png", "delayMs": 400}
    ]
  },
  {
    "id": "C11",
    "startMs": 13760,
    "endMs": 15160,
    "headline": "ĐƠN HOÀN KHÔNG TỰ NHIÊN XUẤT HIỆN",
    "body": "Kỳ vọng sai → Trải nghiệm xấu",
    "mascot": "sad cry",
    "kind": "ui",
    "uiType": "UI02_CancelReturnControl",
    "items": [{"src": "ep003/v02/crops/s04-return-box.png", "delayMs": 0}]
  },
  {
    "id": "C12",
    "startMs": 15160,
    "endMs": 17520,
    "headline": "ĐƠN HOÀN KHÔNG TỰ NHIÊN XUẤT HIỆN",
    "body": "Chi phí tăng, Trải nghiệm tụt",
    "mascot": "sad cry",
    "kind": "ui",
    "uiType": "UI03_CostExperienceChart",
    "items": []
  },
  {
    "id": "C13",
    "startMs": 17520,
    "endMs": 18960,
    "headline": "BA VIỆC PHẢI KHÓA",
    "body": "Kịch bản · Mẫu · Đơn thật",
    "mascot": "idea",
    "kind": "image",
    "items": [{"src": "ep003/v02/crops/s07-a-script-folder.png", "delayMs": 0}]
  },
  {
    "id": "C14",
    "startMs": 18960,
    "endMs": 20220,
    "headline": "BA VIỆC PHẢI KHÓA",
    "body": "1. Khung kịch bản chuẩn",
    "mascot": "idea",
    "kind": "ui",
    "uiType": "UI04_SharedBriefCard",
    "items": []
  },
  {
    "id": "C15",
    "startMs": 20220,
    "endMs": 21560,
    "headline": "BA VIỆC PHẢI KHÓA",
    "body": "2. Gửi đúng sản phẩm mẫu",
    "mascot": "idea",
    "kind": "image",
    "items": [{"src": "ep003/v02/crops/s07-b-coolmate-polo.png", "delayMs": 0}]
  },
  {
    "id": "C16",
    "startMs": 21560,
    "endMs": 22800,
    "headline": "ĐỪNG CHỈ NHÌN VIEW",
    "body": "3. Theo dõi đơn thực tế",
    "mascot": "find",
    "kind": "image",
    "items": [{"src": "ep003/v02/crops/s07-c-verified-badge.png", "delayMs": 0}]
  },
  {
    "id": "C17",
    "startMs": 22800,
    "endMs": 26980,
    "headline": "ĐỪNG CHỈ NHÌN VIEW",
    "body": "Đơn thực tế vs Lượt xem ảo",
    "mascot": "find",
    "kind": "image",
    "items": [
      {"src": "ep003/v02/crops/s07-c-verified-badge.png", "delayMs": 0},
      {"src": "ep003/v02/crops/s03-b-fake-award.png", "delayMs": 500}
    ]
  },
  {
    "id": "C18",
    "startMs": 26980,
    "endMs": 28740,
    "headline": "THỬ NHỎ TRƯỚC",
    "body": "5 Creator · 1 brief chung",
    "mascot": "cool",
    "kind": "image",
    "items": [{"src": "ep002/v03/crops/s03-a-identical-crowd.png", "delayMs": 0}]
  },
  {
    "id": "C19",
    "startMs": 28740,
    "endMs": 31780,
    "headline": "ĐO THẬT RỒI MỞ RỘNG",
    "body": "Giữ người tạo đơn tốt, ít hoàn",
    "mascot": "cool",
    "kind": "image",
    "items": [
      {"src": "ep002/v03/crops/s10-a-real-person-card.png", "delayMs": 0},
      {"src": "ep003/v02/crops/s08-partnership-handshake.png", "delayMs": 800}
    ]
  },
  {
    "id": "C20",
    "startMs": 31780,
    "endMs": 33893,
    "headline": "ĐO THẬT RỒI MỞ RỘNG",
    "body": "Làm nhỏ · Đo thật · Mở rộng",
    "mascot": "clap hand",
    "kind": "ui",
    "uiType": "UI05_ThreeStepChecklist",
    "items": []
  }
]

with open("src/data/cues.json", "w", encoding="utf-8") as f:
    json.dump(cues_data, f, ensure_ascii=False, indent=2)

print("Saved src/data/cues.json with 20 cues!")
