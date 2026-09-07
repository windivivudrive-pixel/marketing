import os
import json
import subprocess
from pathlib import Path
import whisper

ROOT = Path(__file__).resolve().parents[1]
ffmpeg_bin = "/Users/win/Documents/marketing channel/mascot/node_modules/ffmpeg-static/ffmpeg"
os.environ["PATH"] = os.path.dirname(ffmpeg_bin) + ":" + os.environ.get("PATH", "")

audio_path = ROOT / "public/audio/ep002-voice-cartesia-v05-1.1x.wav"
captions_path = ROOT / "src/data/captions.json"

print(f"Transcribing {audio_path} using Whisper...")
model = whisper.load_model("base")
result = model.transcribe(str(audio_path), language="vi")

captions = []
for segment in result["segments"]:
    text = segment["text"].strip()
    if text:
        captions.append({
            "text": text,
            "startMs": int(segment["start"] * 1000),
            "endMs": int(segment["end"] * 1000),
            "timestampMs": int(segment["start"] * 1000),
            "confidence": None
        })

print(f"Generated {len(captions)} caption segments from Whisper!")
with open(captions_path, "w", encoding="utf-8") as f:
    json.dump(captions, f, ensure_ascii=False, indent=2)

print("Saved updated captions to src/data/captions.json")
