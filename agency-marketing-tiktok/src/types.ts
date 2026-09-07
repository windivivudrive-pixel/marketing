export type StylePreset =
  | "branding-story-paper-pink"
  | "clean-editorial"
  | "dark-cinematic"
  | "playful-pop"
  | "warm-lifestyle"
  | "tech-brutalist"
  | "luxe-minimal";

export type CreatorProfile = {
  schemaVersion: 1;
  projectName: string;
  language: string;
  channelName?: string;
  seriesLabel?: string;
  brand: {name: string; promise: string; voice: string; footerLeft?: string; footerRight?: string};
  style: {preset: StylePreset; vibe: string};
  production: {width: number; height: number; fps: number; captionTop?: number};
};

export type MediaAsset = {
  id: string;
  src: string;
  alt: string;
  kind: "image" | "video";
  stickerTreatment?: "remotion-paper" | "legacy-precut";
  hasBakedContour?: boolean;
};

export type Beat = {
  id: string;
  startMs: number;
  endMs: number;
  purpose: "hook" | "answer" | "compare" | "example" | "safety" | "payoff" | "cta";
  focus: "both" | "a" | "b" | "none";
  headline: string;
  body: string;
  assetIds: string[];
  transition: "cut" | "slide" | "push" | "reveal";
};

export type VisualComposition = "solo" | "compare" | "sequence" | "process" | "code" | "transform";
export type VisualExit = "replace" | "carry" | "transform";
export type VisualMotion = "pop" | "slide" | "stamp" | "reveal" | "scale" | "arc" | "track" | "none";
export type VisualSfx = "sticker-popup" | "whoosh" | "click" | "ding";
export type CodeTemplate = "metric" | "button" | "warning" | "chart" | "label" | "checklist" | "menu" | "price-board" | "interface";
export type CameraMode = "static" | "push-in" | "pull-out" | "pan" | "follow";
export type CueTransition = "cut" | "match-move" | "zoom-through" | "mask-reveal" | "reframe";
export type TransformPoint = {x: number; y: number; scale: number; rotation: number; opacity: number};
export type ItemTransform = {from: TransformPoint; to: TransformPoint; easing: "linear" | "ease-out" | "spring"};

export type VisualItem = {
  id: string;
  kind: "asset" | "code";
  assetId?: string;
  codeTemplate?: CodeTemplate;
  text?: string;
  role: string;
  enterMs: number;
  motion: VisualMotion;
  sfx?: VisualSfx;
  semanticRole?: "subject" | "evidence" | "accent";
  transform?: ItemTransform;
};

export type VisualCue = {
  id: string;
  startMs: number;
  endMs: number;
  spokenAnchor: string;
  semanticIntent: string;
  composition: VisualComposition;
  exit: VisualExit;
  camera?: {mode: CameraMode; intensity: "subtle" | "medium"};
  transition?: CueTransition;
  mascot?: string;
  items: VisualItem[];
};

type EpisodeBase = {
  id: string;
  slug: string;
  title: string;
  durationMs: number;
  cardA: {label: string; sublabel: string; assetId: string};
  cardB: {label: string; sublabel: string; assetId: string};
  assets: MediaAsset[];
  beats: Beat[];
  audio: {
    voiceSrc: string;
    voiceVolume: number;
    musicSrc: string;
    musicVolume: number;
  };
};

export type EpisodeV1 = EpisodeBase & {schemaVersion: 1};
export type EpisodeV2 = EpisodeBase & {
  schemaVersion: 2;
  wordsSrc: string;
  motionGrammar?: "continuous-stage-v1";
  visualCues: VisualCue[];
};
export type Episode = EpisodeV1 | EpisodeV2;

export type Caption = {text: string; startMs: number; endMs: number; timestampMs: number | null; confidence: number | null};
