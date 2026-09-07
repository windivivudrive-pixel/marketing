# JSON script package contract

The canonical file is `briefs/epNNN-slug-vNN.json`. Its sibling `.review.md` is generated and must never be edited as an independent source.

Use schema version 3 when the profile sets `contentStrategy.mode: business-phenomenon-decode-v1`. Schema version 2 remains readable for prior artifacts.

## Required top-level fields

```ts
type ScriptPackage = {
  schemaVersion: 2;
  metadata: {
    episodeId: string;
    slug: string;
    version: number;
    status: "script-review";
    approvedIdea: string;
    language: string;
    stylePreset: string;
    targetSeconds: number;
    researchRequired: boolean;
  };
  creativeContract: {
    openingFrame: {visualTension: string; heroSubject: string; contrast: string; firstFrameCopy: string};
    narrativeObject: string;
    visualStrategy: {
      version: "subject-led-v1";
      recurringMotif: string;
      motifRule: string;
      sceneFamilies: string[];
      humanMoments: string[];
    };
    storyArc: Record<"familiarHook" | "curiosityBuild" | "perspectiveFlip" | "marketingDecode" | "proof" | "lesson" | "application", StoryArcStage>;
  } & object;
  topicKeywords: string[];
  voiceover: {
    displayText: string;
    voiceText: string;
    sections: {
      hook: VoiceSection;
      body: VoiceSection & {story: string; lesson: string; actions: string[]};
      close: VoiceSection & {cta: "save" | "follow"};
    };
    pronunciationOverrides: Array<{term: string; spoken: string; reason: string}>;
  };
  onScreenCopy: object[];
  beats: object[];
  visualCues: object[];
  assets: object[];
  editBlueprint: object;
  sources: object[];
  quotaPlan: object;
  approval: object;
};
```

Schema version 3 additionally requires:

```ts
type RetentionPlan = {
  mode: "business-phenomenon-decode-v1";
  viewerPrediction: string;
  withheldAnswer: string;
  plainLanguageMechanism: string;
  theoryReveal: {
    technicalLabel: string;
    earliestMs: number;
    plainLanguageAnchor: string;
  };
  resets: Array<{
    id: string;
    atMs: number;
    trigger: string;
    informationGain: string;
    visualReset: string;
    sceneFamily: string;
  }>;
};
```

Use 5–7 resets. The first lands within 0–3 seconds, adjacent resets are no more than 10 seconds apart, every reset begins on a visual cue, and the final reset lands at or after 40 seconds but before the close ends.

Every schema version 3 visual cue adds `retentionRole`: `hook-puzzle`, `viewer-prediction`, `story-progress`, `perspective-flip`, `mechanism-decode`, `proof-evidence`, `application-audit`, or `cta`. Cover all eight roles across the episode. The first cue is `hook-puzzle`; the final cue is `cta`.

`VoiceSection` requires `displayText`, `voiceText`, `estimatedStartMs`, and `estimatedEndMs`. Timings are provisional until the final trimmed voice is transcribed.

`StoryArcStage` requires `startMs`, `endMs`, `purpose`, `voiceAnchor`, and `visualProgression`. The seven stages are ordered, contiguous, start at zero, end at `targetSeconds`, and map into the compatible hook/body/close sections.

## Invariants

- Hook duration is 1–3 seconds; close duration is 3–5 seconds; sections are contiguous and cover `targetSeconds`.
- `creativeContract.openingFrame` describes a truthful, one-glance hook thumbnail. Its first visual cue begins at zero, lasts 0.6–1.2 seconds, and does not open with a three-item grid.
- Body contains a concrete `story`, one `lesson`, and one to three `actions`.
- Schema version 3 begins with an observable puzzle, gives the viewer a prediction, explains the mechanism in ordinary language, uses credible proof, and ends with one practical audit or change.
- New packages use all seven `creativeContract.storyArc` stages and one non-empty `creativeContract.narrativeObject`. Marketing jargon must not be the premise of the first three stages.
- Close contains exactly one CTA.
- `voiceText` contains no Arabic digits. `displayText`, on-screen copy, and captions contain no pronunciation spellings.
- `visualCues` are contiguous from zero to `targetSeconds`, use `C01` IDs, contain one to three items, and have an exact `spokenAnchor` found in `voiceText`.
- New briefs set `editBlueprint.visualGrammar` to `subject-led-v1`. Every cue declares `spokenSubject`, `visualSubject`, `visualReason`, `sceneFamily`, and `continuityRole`. At least five scene families and two human/action moments are required.
- When `editBlueprint.motionGrammar` is `continuous-stage-v1`, every cue declares `camera` and `transition`; every item declares a `transform`. Adjacent semantic continuity uses stable IDs, while non-adjacent motif returns use new item IDs plus a shared `motifKey`.
- The recurring motif normally appears in 25–55 percent of cues and cannot be the only dominant subject for more than two consecutive cues unless the voice explicitly narrates its transformation.
- Each source records title, direct URL, access date, and supported claim. Use an empty array only when `researchRequired` is false and no factual case claim needs support.
- A precise number, sales lift, specification, brand practice, or causal claim must be directly supported by a recorded source. Plausibility is not evidence.
- New visual assets declare `provider: "flow-agent"` and `stickerTreatment: "remotion-paper"`; legacy pre-cut assets declare `legacy-precut`. No other generation provider is valid.
- `approval.status` remains `script-review` until the user explicitly approves this exact version.
