import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

with open(ROOT / "src/data/words.json") as f:
    raw_words = json.load(f)

# Format words to Remotion Caption shape: {text, startMs, endMs, timestampMs: null, confidence: null}
words = []
for w in raw_words:
    t = w.get("text") or w.get("word") or ""
    words.append({
        "text": t.strip(),
        "startMs": int(w["startMs"]),
        "endMs": int(w["endMs"]),
        "timestampMs": None,
        "confidence": None
    })

# Format captions to Remotion Caption shape
raw_captions = []
chunk = []
for w in words:
    chunk.append(w)
    is_punct = any(w["text"].endswith(p) for p in [".", ",", "!", "?", "—", ":", ";"])
    if len(chunk) >= 7 or (len(chunk) >= 4 and is_punct):
        c_text = " ".join(item["text"] for item in chunk)
        raw_captions.append({
            "text": c_text,
            "startMs": chunk[0]["startMs"],
            "endMs": chunk[-1]["endMs"],
            "timestampMs": None,
            "confidence": None
        })
        chunk = []

if chunk:
    c_text = " ".join(item["text"] for item in chunk)
    raw_captions.append({
        "text": c_text,
        "startMs": chunk[0]["startMs"],
        "endMs": chunk[-1]["endMs"],
        "timestampMs": None,
        "confidence": None
    })

# Adjust gaps between consecutive captions
duration_ms = 65000
for i in range(len(raw_captions) - 1):
    if raw_captions[i]["endMs"] < raw_captions[i+1]["startMs"]:
        raw_captions[i]["endMs"] = raw_captions[i+1]["startMs"]

if raw_captions:
    raw_captions[-1]["endMs"] = min(raw_captions[-1]["endMs"], duration_ms)

with open(ROOT / "src/data/words.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

with open(ROOT / "src/data/captions.json", "w", encoding="utf-8") as f:
    json.dump(raw_captions, f, ensure_ascii=False, indent=2)

beats = [
    {
        "id": "b01",
        "startMs": 0,
        "endMs": 8500,
        "purpose": "hook",
        "focus": "both",
        "headline": "PHÊ LA 65K/LY?",
        "body": "Đắt gấp đôi sao khách vẫn ngồi kín vỉa hè?",
        "assetIds": ["s01", "s02", "s03", "s04"],
        "transition": "cut"
    },
    {
        "id": "b02",
        "startMs": 8500,
        "endMs": 15000,
        "purpose": "answer",
        "focus": "both",
        "headline": "ĐỪNG TỰ GỌI TRÀ SỮA",
        "body": "Tự nhận trà sữa là rơi vào bẫy so sánh giá",
        "assetIds": ["s05", "s06", "s07"],
        "transition": "cut"
    },
    {
        "id": "b03",
        "startMs": 15000,
        "endMs": 26500,
        "purpose": "example",
        "focus": "b",
        "headline": "TẠO SÂN CHƠI MỚI",
        "body": "Định vị: Trà Ô Long Đặc Sản Đà Lạt",
        "assetIds": ["s08", "s09", "s10"],
        "transition": "cut"
    },
    {
        "id": "b04",
        "startMs": 26500,
        "endMs": 34000,
        "purpose": "compare",
        "focus": "both",
        "headline": "TRẢI NGHIỆM CAMPING",
        "body": "Ghế dù cắm trại: Bán cảm giác chill giữa phố",
        "assetIds": ["s11", "s12", "s13"],
        "transition": "cut"
    },
    {
        "id": "b05",
        "startMs": 34000,
        "endMs": 40000,
        "purpose": "example",
        "focus": "b",
        "headline": "CHỤP ẢNH KHOE ĐƯỢC",
        "body": "Khách flex lối sống sành điệu lên Story",
        "assetIds": ["s03", "s14"],
        "transition": "cut"
    },
    {
        "id": "b06",
        "startMs": 40000,
        "endMs": 47000,
        "purpose": "example",
        "focus": "b",
        "headline": "CHIẾN LƯỢC ÍT MÓN",
        "body": "Dồn lực vào Ô Long Khói & Ô Long Sữa",
        "assetIds": ["s15", "s16"],
        "transition": "cut"
    },
    {
        "id": "b07",
        "startMs": 47000,
        "endMs": 51000,
        "purpose": "safety",
        "focus": "b",
        "headline": "TỐI ƯU VẬN HÀNH",
        "body": "Menu tinh gọn → Pha nhanh & Chất lượng chuẩn",
        "assetIds": ["s17"],
        "transition": "cut"
    },
    {
        "id": "b08",
        "startMs": 51000,
        "endMs": duration_ms,
        "purpose": "payoff",
        "focus": "both",
        "headline": "TỰ TẠO SÂN CHƠI RIÊNG",
        "body": "Một góc nhìn dễ hiểu · Một việc làm ngay",
        "assetIds": ["s18", "s19", "s20"],
        "transition": "cut"
    }
]

assets = [
    {"id": f"s{i:02d}", "src": f"ep005/v01/crops/s{i:02d}.png", "alt": f"Asset s{i:02d}", "kind": "image"}
    for i in range(1, 21)
]

episode = {
    "schemaVersion": 1,
    "id": "EP005",
    "slug": "phe-la-ban-tra-dac-san-camping",
    "title": "Giải mã Phê La: Bán trà đắt + Bắt ngồi ghế xếp sao vẫn full bàn?",
    "durationMs": duration_ms,
    "cardA": {
        "label": "TRÀ SỮA 25K",
        "sublabel": "Bẫy so sánh giá rẻ",
        "assetId": "s01"
    },
    "cardB": {
        "label": "PHÊ LA 65K",
        "sublabel": "Trà Ô Long Đặc Sản Camping",
        "assetId": "s03"
    },
    "audio": {
        "voiceSrc": "audio/ep005-voice-1.1x.wav",
        "voiceVolume": 1.0,
        "musicSrc": "audio/music.mp3",
        "musicVolume": 0.12
    },
    "wordsSrc": "src/data/words.json",
    "assets": assets,
    "beats": beats
}

with open(ROOT / "src/data/episode.json", "w", encoding="utf-8") as f:
    json.dump(episode, f, ensure_ascii=False, indent=2)

print("Alignment complete!")
