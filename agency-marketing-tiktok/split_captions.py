import json
import os

def split_text_max_words(text, max_words=8):
    words = text.split()
    if len(words) <= max_words:
        return [text]
    
    num_chunks = (len(words) + max_words - 1) // max_words
    words_per_chunk = (len(words) + num_chunks - 1) // num_chunks
    
    better_chunks = []
    for i in range(0, len(words), words_per_chunk):
        better_chunks.append(" ".join(words[i:i+words_per_chunk]))
        
    return better_chunks

file_path = 'src/data/captions.json'
with open(file_path, 'r') as f:
    data = json.load(f)

new_data = []
for item in data:
    chunks = split_text_max_words(item['text'], 8)
    if len(chunks) == 1:
        new_data.append(item)
    else:
        duration = item['endMs'] - item['startMs']
        time_per_char = duration / sum(len(c) for c in chunks)
        
        current_start = item['startMs']
        for i, chunk in enumerate(chunks):
            chunk_duration = int(len(chunk) * time_per_char)
            chunk_end = current_start + chunk_duration if i < len(chunks) - 1 else item['endMs']
            
            new_item = {
                "text": chunk,
                "startMs": current_start,
                "endMs": chunk_end,
                "timestampMs": current_start,
                "confidence": item.get('confidence')
            }
            new_data.append(new_item)
            current_start = chunk_end

with open(file_path, 'w') as f:
    json.dump(new_data, f, indent=2, ensure_ascii=False)

print("Captions split successfully!")
