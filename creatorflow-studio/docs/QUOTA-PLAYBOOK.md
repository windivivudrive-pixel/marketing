# Quota playbook

CreatorFlow minimizes paid work by changing the order of operations:

1. inventory and de-duplicate before research;
2. approve one idea before writing a full brief;
3. approve the full brief and visual plan before media;
4. reuse brand and semantic matches before generation;
5. use three compatible stickers per sheet, then crop;
6. use individual calls for faces, products, heroes, and reference-sensitive assets;
7. animate stills in Remotion instead of generating video by default;
8. use one stable idempotency key per approved output;
9. never overwrite an approved asset;
10. transcribe and render only the final voice version.

The quota ledger in `creatorflow/state.json` stores estimates, actual calls, reused assets, TTS characters, and idempotency keys. Review the estimate at script approval. A retry with the same payload must reuse the same key.

