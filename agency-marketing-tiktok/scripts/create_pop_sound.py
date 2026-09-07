import math
import wave
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
output_path = ROOT / "public/audio/pop-sound.wav"

sample_rate = 44100
duration = 0.12  # 120ms short punchy pop
num_samples = int(sample_rate * duration)

audio_data = []
for i in range(num_samples):
    t = i / sample_rate
    # Pitch drop from 900Hz to 150Hz
    freq = 900 * math.exp(-25 * t) + 150
    phase = 2 * math.pi * freq * t
    
    # Exponential amplitude envelope
    env = math.exp(-30 * t)
    
    # Add a slight pop transient click at start
    click = 0.4 * math.exp(-200 * t)
    
    sample = (math.sin(phase) * env + click) * 0.85
    sample = max(-1.0, min(1.0, sample))
    int_sample = int(sample * 32767)
    audio_data.append(int_sample)

with wave.open(str(output_path), "w") as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    for s in audio_data:
        wav_file.writeframes(struct.pack("<h", s))

print(f"Generated punchy pop sound effect at {output_path}")
