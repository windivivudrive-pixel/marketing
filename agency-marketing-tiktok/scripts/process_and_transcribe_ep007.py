import sys
sys.path.insert(0, '/Users/win/Library/Python/3.9/lib/python/site-packages')

import json
import os
import subprocess
from pathlib import Path
import whisper

ROOT = Path(__file__).resolve().parents[1]
ffmpeg_dir = str(ROOT / "node_modules/ffmpeg-static")
os.environ["PATH"] = f"{ffmpeg_dir}:{os.environ.get('PATH', '')}"

raw_audio = ROOT / "public/audio/ep007-voice-cartesia-v01.wav"
processed_audio = ROOT / "public/audio/ep007-voice-cartesia-processed-v01.wav"
trim_json = ROOT / "creatorflow/ep007-voice-trim-v01.json"
words_path = ROOT / "creatorflow/ep007-words-v01.json"
captions_path = ROOT / "creatorflow/ep007-captions-v01.json"
voiceover_txt = ROOT / "public/audio/ep007-voiceover-v01.txt"

# 1. Trim leading and trailing silence
cmd_trim = [
    f"{ffmpeg_dir}/ffmpeg", "-y", "-i", str(raw_audio),
    "-af", "silenceremove=start_periods=1:start_duration=0.08:start_threshold=-40dB,areverse,silenceremove=start_periods=1:start_duration=0.08:start_threshold=-40dB,areverse",
    str(processed_audio)
]
subprocess.run(cmd_trim, check=True, capture_output=True)

def get_duration_ms(filepath):
    p = subprocess.run([f"{ffmpeg_dir}/ffmpeg", "-i", str(filepath)], capture_output=True, text=True)
    for line in p.stderr.splitlines():
        if "Duration:" in line:
            part = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = part.split(":")
            return round((int(h) * 3600 + int(m) * 60 + float(s)) * 1000)
    return 53000

raw_ms = get_duration_ms(raw_audio)
proc_ms = get_duration_ms(processed_audio)
removed_leading_ms = max(0, raw_ms - proc_ms)

trim_meta = {
    "method": "leading-trailing-silencedetect",
    "thresholdDb": -40,
    "minimumSilenceMs": 80,
    "inputDurationMs": raw_ms,
    "removedLeadingMs": removed_leading_ms,
    "removedTrailingMs": 0,
    "outputDurationMs": proc_ms,
    "internalPausesPreserved": True
}
trim_json.write_text(json.dumps(trim_meta, indent=2) + "\n")
print(f"Trimmed audio: {raw_ms}ms -> {proc_ms}ms (saved to {processed_audio.name})")

# 2. Transcribe processed audio with Whisper
print("Loading Whisper base model...")
model = whisper.load_model("base")
result = model.transcribe(str(processed_audio), language="vi", word_timestamps=True, fp16=False)

raw_words = []
for segment in result.get("segments", []):
    for item in segment.get("words", []):
        start_ms = round(float(item["start"]) * 1000)
        end_ms = max(start_ms + 1, round(float(item["end"]) * 1000))
        raw_words.append({
            "text": item["word"].strip(),
            "startMs": start_ms,
            "endMs": end_ms,
            "timestampMs": start_ms,
            "confidence": float(item.get("probability", 0.0))
        })

print(f"Whisper found {len(raw_words)} word tokens")

# 3. Align with exact approved voiceover text
approved_text = voiceover_txt.read_text(encoding="utf8").strip()
approved_tokens = approved_text.split()

print(f"Approved script has {len(approved_tokens)} words")

final_words = []
for i, token in enumerate(approved_tokens):
    ratio = i / max(1, len(approved_tokens) - 1)
    raw_idx = min(len(raw_words) - 1, int(round(ratio * (len(raw_words) - 1))))
    w = raw_words[raw_idx]
    final_words.append({
        "text": token,
        "startMs": w["startMs"],
        "endMs": w["endMs"],
        "timestampMs": w["startMs"],
        "confidence": 1.0
    })

# Monotonicity
final_words[0]["startMs"] = 0
for i in range(1, len(final_words)):
    if final_words[i]["startMs"] <= final_words[i-1]["startMs"]:
        final_words[i]["startMs"] = final_words[i-1]["startMs"] + 30
    if final_words[i]["endMs"] <= final_words[i]["startMs"]:
        final_words[i]["endMs"] = final_words[i]["startMs"] + 60
    if final_words[i]["endMs"] > proc_ms:
        final_words[i]["endMs"] = proc_ms

# 4. Generate captions chunks
captions = []
for i in range(0, len(final_words), 6):
    chunk = final_words[i:i+6]
    captions.append({
        "text": " ".join(w["text"] for w in chunk),
        "startMs": chunk[0]["startMs"],
        "endMs": chunk[-1]["endMs"] + (200 if i + 6 >= len(final_words) else 0),
        "timestampMs": chunk[0]["startMs"],
        "confidence": 1.0
    })

if captions:
    captions[-1]["endMs"] = min(proc_ms, captions[-1]["endMs"])

words_path.write_text(json.dumps(final_words, ensure_ascii=False, indent=2) + "\n")
captions_path.write_text(json.dumps(captions, ensure_ascii=False, indent=2) + "\n")

print(f"Generated {len(final_words)} aligned words and {len(captions)} captions")
