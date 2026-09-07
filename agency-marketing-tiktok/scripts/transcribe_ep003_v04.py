import os
import json
from pathlib import Path
import whisper

ROOT = Path(__file__).resolve().parents[1]
ffmpeg_bin = ROOT / "node_modules/ffmpeg-static/ffmpeg"
os.environ["PATH"] = str(ffmpeg_bin.parent) + ":" + os.environ.get("PATH", "")

audio_path = ROOT / "public/audio/ep003-v04-voice-1.1x.wav"
words_path = ROOT / "src/data/words.json"

print(f"Transcribing {audio_path} using Whisper with word timestamps...")
model = whisper.load_model("base")
result = model.transcribe(str(audio_path), language="vi", word_timestamps=True)

# Extract word timestamps
all_words = []
for segment in result["segments"]:
    for word_info in segment.get("words", []):
        all_words.append({
            "word": word_info["word"].strip(),
            "startMs": int(word_info["start"] * 1000),
            "endMs": int(word_info["end"] * 1000)
        })

with open(words_path, "w", encoding="utf-8") as f:
    json.dump(all_words, f, ensure_ascii=False, indent=2)
print(f"Saved {len(all_words)} words to src/data/words.json")

print("Transcription complete!")
