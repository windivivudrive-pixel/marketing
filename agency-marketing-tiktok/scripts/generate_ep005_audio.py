import asyncio
import json
import os
import subprocess
from pathlib import Path
import edge_tts
import whisper

ROOT = Path(__file__).resolve().parents[1]
FFMPEG_DIR = ROOT / "node_modules/ffmpeg-static"
os.environ["PATH"] = f"{FFMPEG_DIR}:{os.environ.get('PATH', '')}"
FFMPEG = FFMPEG_DIR / "ffmpeg"
VOICE_RAW = ROOT / "public/audio/ep005-voice-raw.wav"
VOICE_1_1X = ROOT / "public/audio/ep005-voice-1.1x.mp3"
VOICE_WAV = ROOT / "public/audio/ep005-voice-1.1x.wav"
(ROOT / "public/audio").mkdir(parents=True, exist_ok=True)

transcript = """Trà sữa ngoài kia hai lăm ngàn đang ế ẩm giảm giá một tặng một. Tại sao Phê La bán tận năm lăm sáu mươi lăm ngàn một ly, bắt khách ngồi ghế xếp dù cắm trại lề đường mà chi nhánh nào mở ra cũng kín bàn từ sáng đến tối?

Nhiều người nghĩ khách tới đây chỉ vì đú trend sống ảo, nhưng đằng sau là một chiến lược định vị cực kỳ khôn ngoan!

Thứ nhất, nếu tự nhận mình là quán trà sữa, bạn sẽ lập tức bị khách đem ra so sánh giá với hàng trăm thương hiệu khác. Phê La không làm vậy! Họ tự tạo ra một sân chơi hoàn toàn mới với tên gọi: Trà Ô Long Đặc Sản Đà Lạt, pha bằng máy Espresso đậm vị nguyên bản!

Thứ hai, tại sao lại bắt khách ngồi ghế dù cắm trại? Quán máy lạnh hộp kính thì đâu đâu cũng có, nhưng không gian camping ngoài trời tạo cảm giác cực chill và phóng khoáng. Khách hàng tới đây không chỉ uống nước, mà để chụp ảnh khoe lối sống sành điệu lên mạng xã hội!

Thứ ba, thay vì làm menu năm mươi món rối rắm, họ chỉ dồn toàn lực vào dòng chủ lực là Ô Long Khói và Ô Long Sữa. Càng ít món, vận hành càng nhanh và chất lượng càng đồng đều!

Bài học cho mọi chủ shop: Đừng lao vào cuộc chiến giảm giá ở sân chơi cũ. Hãy đổi tên gọi để tạo ra một ngách mới, và biến sản phẩm thành một trải nghiệm có thể chụp ảnh khoe được nhé!"""

async def synthesize():
    print("1. Synthesizing voice with Edge-TTS (vi-VN-HoaiMyNeural)...")
    communicate = edge_tts.Communicate(transcript, voice="vi-VN-HoaiMyNeural", rate="+15%", pitch="+0Hz")
    await communicate.save(str(VOICE_1_1X))
    
    print("2. Converting to 44.1kHz WAV...")
    subprocess.run([
        str(FFMPEG), "-y", "-i", str(VOICE_1_1X),
        "-ar", "44100", "-ac", "2",
        str(VOICE_WAV)
    ], check=True)

asyncio.run(synthesize())

# Check duration
dur_res = subprocess.run([
    str(FFMPEG), "-i", str(VOICE_WAV)
], capture_output=True, text=True)
print("Audio conversion done!")

print("3. Transcribing with Whisper for word-level timestamps...")
model = whisper.load_model("base")
result = model.transcribe(str(VOICE_WAV), word_timestamps=True, language="vi")

words = []
captions = []

for seg in result["segments"]:
    seg_words = seg.get("words", [])
    for w in seg_words:
        cleaned_word = w["word"].strip()
        if cleaned_word:
            words.append({
                "word": cleaned_word,
                "startMs": int(w["start"] * 1000),
                "endMs": int(w["end"] * 1000)
            })

chunk = []
for w in words:
    chunk.append(w)
    is_punct = any(w["word"].endswith(p) for p in [".", ",", "!", "?", "—", ":", ";"])
    if len(chunk) >= 7 or (len(chunk) >= 4 and is_punct):
        c_text = " ".join(item["word"] for item in chunk)
        captions.append({
            "id": f"cap_{len(captions)+1:03d}",
            "text": c_text,
            "startMs": chunk[0]["startMs"],
            "endMs": chunk[-1]["endMs"]
        })
        chunk = []

if chunk:
    c_text = " ".join(item["word"] for item in chunk)
    captions.append({
        "id": f"cap_{len(captions)+1:03d}",
        "text": c_text,
        "startMs": chunk[0]["startMs"],
        "endMs": chunk[-1]["endMs"]
    })

# Adjust continuous gaps
for i in range(len(captions) - 1):
    if captions[i]["endMs"] < captions[i+1]["startMs"]:
        captions[i]["endMs"] = captions[i+1]["startMs"]

with open(ROOT / "src/data/words.json", "w", encoding="utf-8") as f:
    json.dump(words, f, ensure_ascii=False, indent=2)

with open(ROOT / "src/data/captions.json", "w", encoding="utf-8") as f:
    json.dump(captions, f, ensure_ascii=False, indent=2)

total_duration_ms = words[-1]["endMs"] if words else 0
print(f"Generated {len(words)} words, {len(captions)} subtitle lines, total duration: {total_duration_ms}ms ({total_duration_ms/1000:.2f}s)!")
