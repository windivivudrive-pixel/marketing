import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

with open(ROOT / "src/data/words.json") as f:
    words = f.read()
    word_list = json.loads(words)

total_duration_ms = word_list[-1]["endMs"] if word_list else 64000
fps = 30
total_frames = int((total_duration_ms / 1000.0) * fps) + 30

# Helper to find approximate startMs for a spoken phrase
def find_phrase_start(phrase):
    tokens = phrase.lower().split()
    first = tokens[0]
    for i, w in enumerate(word_list):
        if first in w["word"].lower():
            # Check subsequence match
            match = True
            for j in range(len(tokens)):
                if i + j >= len(word_list) or tokens[j] not in word_list[i + j]["word"].lower():
                    match = False
                    break
            if match:
                return word_list[i]["startMs"]
    return None

cues_def = [
    {
        "id": "C01",
        "beat": "B01",
        "phrase": "ngoài kia",
        "headline": "PHÊ LA 65K/LY?",
        "subHeadline": "Đắt gấp đôi sao khách vẫn ngồi kín vỉa hè?",
        "layout": "compare",
        "sfx": "sticker-popup.mp3",
        "items": [
            {"id": "s01", "src": "ep005/v01/crops/s01.png", "x": -180, "y": 0, "scale": 1.0, "enterMs": 0},
            {"id": "s02", "src": "ep005/v01/crops/s02.png", "x": 180, "y": 0, "scale": 1.0, "enterMs": 1900}
        ]
    },
    {
        "id": "C02",
        "beat": "B01",
        "phrase": "tại sao phê la",
        "headline": "PHÊ LA 65K/LY?",
        "subHeadline": "Đắt gấp đôi sao khách vẫn ngồi kín vỉa hè?",
        "layout": "solo",
        "sfx": "ding.wav",
        "items": [
            {"id": "s03", "src": "ep005/v01/crops/s03.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C03",
        "beat": "B01",
        "phrase": "ghế xếp",
        "headline": "PHÊ LA 65K/LY?",
        "subHeadline": "Đắt gấp đôi sao khách vẫn ngồi kín vỉa hè?",
        "layout": "compare",
        "sfx": "sticker-popup.mp3",
        "items": [
            {"id": "s04", "src": "ep005/v01/crops/s04.png", "x": -150, "y": 0, "scale": 1.0, "enterMs": 0},
            {"id": "s03", "src": "ep005/v01/crops/s03.png", "x": 180, "y": -20, "scale": 0.95, "enterMs": 1500}
        ]
    },
    {
        "id": "C04",
        "beat": "B02",
        "phrase": "nhiều người",
        "headline": "ĐỪNG TỰ GỌI TRÀ SỮA",
        "subHeadline": "Tự nhận trà sữa là rơi vào bẫy so sánh giá",
        "layout": "solo",
        "sfx": "click.wav",
        "items": [
            {"id": "s05", "src": "ep005/v01/crops/s05.png", "x": 0, "y": 0, "scale": 1.2, "enterMs": 0}
        ]
    },
    {
        "id": "C05",
        "beat": "B02",
        "phrase": "chiến lược định vị",
        "headline": "ĐỪNG TỰ GỌI TRÀ SỮA",
        "subHeadline": "Tự nhận trà sữa là rơi vào bẫy so sánh giá",
        "layout": "solo",
        "sfx": "ding.wav",
        "items": [
            {"id": "s06", "src": "ep005/v01/crops/s06.png", "x": 0, "y": 0, "scale": 1.1, "enterMs": 0}
        ]
    },
    {
        "id": "C06",
        "beat": "B02",
        "phrase": "nếu tự nhận",
        "headline": "ĐỪNG TỰ GỌI TRÀ SỮA",
        "subHeadline": "Tự nhận trà sữa là rơi vào bẫy so sánh giá",
        "layout": "solo",
        "sfx": "buzzer.wav",
        "items": [
            {"id": "s07", "src": "ep005/v01/crops/s07.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C07",
        "beat": "B02",
        "phrase": "so sánh giá",
        "headline": "ĐỪNG TỰ GỌI TRÀ SỮA",
        "subHeadline": "Tự nhận trà sữa là rơi vào bẫy so sánh giá",
        "layout": "ui",
        "uiType": "UI01_PriceComparisonTrap",
        "sfx": "whoosh.wav",
        "items": []
    },
    {
        "id": "C08",
        "beat": "B03",
        "phrase": "sân chơi",
        "headline": "TẠO SÂN CHƠI MỚI",
        "subHeadline": "Định vị: Trà Ô Long Đặc Sản Đà Lạt",
        "layout": "solo",
        "sfx": "sticker-popup.mp3",
        "items": [
            {"id": "s08", "src": "ep005/v01/crops/s08.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C09",
        "beat": "B03",
        "phrase": "đặc sản đà lạt",
        "headline": "TẠO SÂN CHƠI MỚI",
        "subHeadline": "Định vị: Trà Ô Long Đặc Sản Đà Lạt",
        "layout": "solo",
        "sfx": "ding.wav",
        "items": [
            {"id": "s09", "src": "ep005/v01/crops/s09.png", "x": 0, "y": 0, "scale": 1.2, "enterMs": 0}
        ]
    },
    {
        "id": "C10",
        "beat": "B03",
        "phrase": "máy espresso",
        "headline": "TẠO SÂN CHƠI MỚI",
        "subHeadline": "Định vị: Trà Ô Long Đặc Sản Đà Lạt",
        "layout": "solo",
        "sfx": "click.wav",
        "items": [
            {"id": "s10", "src": "ep005/v01/crops/s10.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C11",
        "beat": "B04",
        "phrase": "ghế dù",
        "headline": "TRẢI NGHIỆM CAMPING",
        "subHeadline": "Ghế dù cắm trại: Bán cảm giác chill giữa phố",
        "layout": "solo",
        "sfx": "sticker-popup.mp3",
        "items": [
            {"id": "s11", "src": "ep005/v01/crops/s11.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C12",
        "beat": "B04",
        "phrase": "hộp kính",
        "headline": "TRẢI NGHIỆM CAMPING",
        "subHeadline": "Ghế dù cắm trại: Bán cảm giác chill giữa phố",
        "layout": "solo",
        "sfx": "click.wav",
        "items": [
            {"id": "s12", "src": "ep005/v01/crops/s12.png", "x": 0, "y": 0, "scale": 1.1, "enterMs": 0}
        ]
    },
    {
        "id": "C13",
        "beat": "B04",
        "phrase": "phóng khoáng",
        "headline": "TRẢI NGHIỆM CAMPING",
        "subHeadline": "Ghế dù cắm trại: Bán cảm giác chill giữa phố",
        "layout": "solo",
        "sfx": "ding.wav",
        "items": [
            {"id": "s13", "src": "ep005/v01/crops/s13.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C14",
        "beat": "B05",
        "phrase": "uống nước",
        "headline": "CHỤP ẢNH KHOE ĐƯỢC",
        "subHeadline": "Khách flex lối sống sành điệu lên Story",
        "layout": "solo",
        "sfx": "sticker-popup.mp3",
        "items": [
            {"id": "s03", "src": "ep005/v01/crops/s03.png", "x": 0, "y": 0, "scale": 1.1, "enterMs": 0}
        ]
    },
    {
        "id": "C15",
        "beat": "B05",
        "phrase": "mạng xã hội",
        "headline": "CHỤP ẢNH KHOE ĐƯỢC",
        "subHeadline": "Khách flex lối sống sành điệu lên Story",
        "layout": "solo",
        "sfx": "ding.wav",
        "items": [
            {"id": "s14", "src": "ep005/v01/crops/s14.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C16",
        "beat": "B06",
        "phrase": "năm mươi món",
        "headline": "CHIẾN LƯỢC ÍT MÓN",
        "subHeadline": "Dồn lực vào Ô Long Khói & Ô Long Sữa",
        "layout": "solo",
        "sfx": "buzzer.wav",
        "items": [
            {"id": "s15", "src": "ep005/v01/crops/s15.png", "x": 0, "y": 0, "scale": 1.1, "enterMs": 0}
        ]
    },
    {
        "id": "C17",
        "beat": "B06",
        "phrase": "ô long khói",
        "headline": "CHIẾN LƯỢC ÍT MÓN",
        "subHeadline": "Dồn lực vào Ô Long Khói & Ô Long Sữa",
        "layout": "solo",
        "sfx": "ding.wav",
        "items": [
            {"id": "s16", "src": "ep005/v01/crops/s16.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C18",
        "beat": "B07",
        "phrase": "càng ít món",
        "headline": "TỐI ƯU VẬN HÀNH",
        "subHeadline": "Menu tinh gọn → Pha nhanh & Chất lượng chuẩn",
        "layout": "solo",
        "sfx": "click.wav",
        "items": [
            {"id": "s17", "src": "ep005/v01/crops/s17.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C19",
        "beat": "B07",
        "phrase": "đồng đều",
        "headline": "TỐI ƯU VẬN HÀNH",
        "subHeadline": "Menu tinh gọn → Pha nhanh & Chất lượng chuẩn",
        "layout": "ui",
        "uiType": "UI02_ConsistencyScorecard",
        "sfx": "whoosh.wav",
        "items": []
    },
    {
        "id": "C20",
        "beat": "B08",
        "phrase": "bài học cho mọi",
        "headline": "TỰ TẠO SÂN CHƠI RIÊNG",
        "subHeadline": "Một góc nhìn dễ hiểu · Một việc làm ngay",
        "layout": "solo",
        "sfx": "buzzer.wav",
        "items": [
            {"id": "s18", "src": "ep005/v01/crops/s18.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C21",
        "beat": "B08",
        "phrase": "đổi tên gọi",
        "headline": "TỰ TẠO SÂN CHƠI RIÊNG",
        "subHeadline": "Một góc nhìn dễ hiểu · Một việc làm ngay",
        "layout": "solo",
        "sfx": "click.wav",
        "items": [
            {"id": "s19", "src": "ep005/v01/crops/s19.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C22",
        "beat": "B08",
        "phrase": "chụp ảnh khoe",
        "headline": "TỰ TẠO SÂN CHƠI RIÊNG",
        "subHeadline": "Một góc nhìn dễ hiểu · Một việc làm ngay",
        "layout": "solo",
        "sfx": "ding.wav",
        "items": [
            {"id": "s20", "src": "ep005/v01/crops/s20.png", "x": 0, "y": 0, "scale": 1.15, "enterMs": 0}
        ]
    },
    {
        "id": "C23",
        "beat": "B08",
        "phrase": "nhé",
        "headline": "TỰ TẠO SÂN CHƠI RIÊNG",
        "subHeadline": "Một góc nhìn dễ hiểu · Một việc làm ngay",
        "layout": "ui",
        "uiType": "UI03_CategoryCreationActionCard",
        "sfx": "page-turn.wav",
        "items": []
    }
]

# Calculate start and end ms for each cue based on spoken words
for i in range(len(cues_def)):
    cue = cues_def[i]
    p_start = find_phrase_start(cue["phrase"])
    if p_start is not None:
        cue["startMs"] = p_start
    else:
        # Fallback linear interpolation
        cue["startMs"] = int(i * (total_duration_ms / len(cues_def)))

# Ensure monotonic startMs
for i in range(1, len(cues_def)):
    if cues_def[i]["startMs"] <= cues_def[i-1]["startMs"]:
        cues_def[i]["startMs"] = cues_def[i-1]["startMs"] + 1500

cues_def[0]["startMs"] = 0

for i in range(len(cues_def) - 1):
    cues_def[i]["endMs"] = cues_def[i+1]["startMs"]
cues_def[-1]["endMs"] = total_duration_ms

# Build clean cues JSON
cues_final = []
for c in cues_def:
    cues_final.append({
        "id": c["id"],
        "beat": c["beat"],
        "startMs": c["startMs"],
        "endMs": c["endMs"],
        "headline": c["headline"],
        "subHeadline": c["subHeadline"],
        "layout": c["layout"],
        "uiType": c.get("uiType"),
        "sfx": c.get("sfx", "sticker-popup.mp3"),
        "items": c.get("items", [])
    })

with open(ROOT / "src/data/cues.json", "w", encoding="utf-8") as f:
    json.dump(cues_final, f, ensure_ascii=False, indent=2)

episode_data = {
    "id": "EP005",
    "title": "Giải mã Phê La: Bán trà đắt + Bắt ngồi ghế xếp sao vẫn full bàn?",
    "audio": "audio/ep005-voice-1.1x.wav",
    "durationFrames": total_frames,
    "fps": 30,
    "width": 1080,
    "height": 1920
}

with open(ROOT / "src/data/episode.json", "w", encoding="utf-8") as f:
    json.dump(episode_data, f, ensure_ascii=False, indent=2)

print(f"Generated {len(cues_final)} visual cues and updated episode.json (totalFrames: {total_frames})!")
