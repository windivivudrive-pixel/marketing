from pathlib import Path
import json
import whisper

ROOT = Path(__file__).resolve().parents[1]
audio_path = ROOT / "public/audio/ep006-voice-cartesia-v02.wav"
words_path = ROOT / "creatorflow/ep006-words-v02.json"
captions_path = ROOT / "creatorflow/ep006-captions-v02.json"

model = whisper.load_model("base")
result = model.transcribe(str(audio_path), language="vi", word_timestamps=True, fp16=False)

words = []
for segment in result.get("segments", []):
    for item in segment.get("words", []):
        start_ms = round(float(item["start"]) * 1000)
        end_ms = max(start_ms + 1, round(float(item["end"]) * 1000))
        words.append({"text": item["word"].strip(), "startMs": start_ms, "endMs": end_ms, "timestampMs": start_ms, "confidence": float(item.get("probability", 0.0))})

captions = []
for segment in result.get("segments", []):
    text = " ".join(segment.get("text", "").strip().split())
    if not text:
        continue
    start_ms = round(float(segment["start"]) * 1000)
    end_ms = max(start_ms + 1, round(float(segment["end"]) * 1000))
    chunks = text.split()
    for offset in range(0, len(chunks), 8):
        chunk = " ".join(chunks[offset:offset + 8])
        chunk_words = words[offset:offset + len(chunks)] if False else None
        captions.append({"text": chunk, "startMs": start_ms, "endMs": end_ms, "timestampMs": start_ms, "confidence": 0.0})

words_path.write_text(json.dumps(words, ensure_ascii=False, indent=2) + "\n")
captions_path.write_text(json.dumps(captions, ensure_ascii=False, indent=2) + "\n")
print(f"Generated {len(words)} words and {len(captions)} captions")
