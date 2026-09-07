# Visual cue schema v2

New production episodes use `schemaVersion: 2` and store `visualCues` inside `episode.json`. Legacy schema v1 remains renderable but is not valid for new production.

```ts
type VisualCue = {
  id: string;
  startMs: number;
  endMs: number;
  spokenAnchor: string;
  semanticIntent: string;
  spokenSubject?: string;
  visualSubject?: string;
  visualReason?: string;
  sceneFamily?: string;
  continuityRole?: "motif-anchor" | "literal-evidence" | "human-action" | "context" | "proof" | "application";
  retentionRole?: "hook-puzzle" | "viewer-prediction" | "story-progress" | "perspective-flip" | "mechanism-decode" | "proof-evidence" | "application-audit" | "cta";
  composition: "solo" | "compare" | "sequence" | "process" | "code" | "transform";
  exit: "replace" | "carry" | "transform";
  camera?: {mode: "static" | "push-in" | "pull-out" | "pan" | "follow"; intensity: "subtle" | "medium"};
  transition?: "cut" | "match-move" | "zoom-through" | "mask-reveal" | "reframe";
  mascot?: string;
  items: VisualItem[];
};

type VisualItem = {
  id: string;
  kind: "asset" | "code";
  assetId?: string;
  codeTemplate?: "metric" | "button" | "warning" | "chart" | "label" | "checklist";
  text?: string;
  role: string;
  enterMs: number;
  motion: "pop" | "slide" | "stamp" | "reveal" | "none";
  sfx?: "sticker-popup" | "whoosh" | "click" | "ding";
  semanticRole?: "subject" | "evidence" | "accent";
  motifKey?: string;
  transform?: {
    from: {x: number; y: number; scale: number; rotation: number; opacity: number};
    to: {x: number; y: number; scale: number; rotation: number; opacity: number};
    easing: "linear" | "ease-out" | "spring";
  };
};
```

Store token-level timestamps in `words.json` using the Remotion `Caption` shape. A cue start and each newly introduced item `enterMs` must equal a word `startMs` after frame rounding. A carried item repeats its stable item ID and original `enterMs` in the next cue; it must not replay motion or SFX.

Assets referenced by items may declare `stickerTreatment: "remotion-paper" | "legacy-precut"`. `remotion-paper` means the source has no baked paper/contour and receives the channel treatment in Remotion. `legacy-precut` means the approved source already includes its contour and must render without another backing.

Keep cues contiguous from zero through `durationMs`, with one to three items each. `solo` uses one item; `compare` uses exactly two; `sequence` and `process` use two or three. `code` may mix one code item with one supporting asset. `transform` must reuse at least one stable item ID from the preceding cue.

Schema v2 remains backward compatible. New episodes opt into the added fields with `editBlueprint.motionGrammar: "continuous-stage-v1"` and `editBlueprint.visualGrammar: "subject-led-v1"`. Motion continuity does not require permanent object visibility. Adjacent carries use stable IDs; later motif returns use a new ID plus the same `motifKey`. Code items that draw a menu, price board, checklist, chart, or interface must use `semanticRole: "evidence"`; decorative cards are invalid.

## Phenomenon-led production extension

The renderer continues to use `schemaVersion: 2`. When the approved source brief is schema v3, add these production fields instead of silently downgrading the editorial contract:

```ts
type EpisodeV2Phenomenon = EpisodeV2 & {
  retentionMode: "business-phenomenon-decode-v1";
  retentionResets: Array<{
    id: string;
    atMs: number;
    trigger: string;
    informationGain: string;
    visualReset: string;
    sceneFamily: string;
  }>;
};
```

Every visual cue must keep a valid `retentionRole`. The first cue is `hook-puzzle`, the final cue is `cta`, and all eight roles appear across the episode. Each `retentionResets[].atMs` must equal a re-timed visual-cue start and stored word boundary. Preserve five-to-seven resets, gaps no longer than ten seconds, and a late reset at or after forty seconds for a forty-five-to-sixty-second episode.
