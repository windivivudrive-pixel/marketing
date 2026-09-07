# Idea output contract

The JSON file is the source of truth. The Markdown file is a deterministic review view and must not contain independent editorial content.

```json
{
  "schemaVersion": 2,
  "generatedAt": "ISO-8601",
  "profile": "creatorflow/profile.json",
  "ideas": []
}
```

Use schema version 3 when the profile sets `contentStrategy.mode: business-phenomenon-decode-v1`. Version 2 remains readable for prior artifacts.

Each idea requires `id`, `rank`, `title`, `lane` (`EVERGREEN` or `CURRENT`), `status` (`NEW` or `ADJACENT`), `painPoint`, `viewerQuestion`, `caseStory`, `curiosityParadox`, `brandingLesson`, `actionablePayoff`, and 3–8 `topicKeywords`.

Each new idea also requires a story-selection contract:

- `storyPattern`: default `everyday-object-reveal`; use another explicit value only with `patternReason`;
- `familiarOpening`: the ordinary object, action, or situation seen in the first three seconds;
- `narrativeObject`: the recurring visual motif that anchors selected sections; it is explicitly allowed to leave the frame;
- `curiosityGap`: the unanswered question created before any marketing term is introduced;
- `hiddenMechanism`: the non-jargon explanation revealed by the story;
- `marketingBridge`: the short translation from that mechanism into marketing;
- `proofMove`: the contrast or second example that proves the mechanism without abandoning the narrative thread;
- `singleLesson` and `immediateApplication`: exactly one conclusion and one phone-doable action;
- `motionPotential`: at least two meaningful transformations the narrative object can perform.
- `sceneOpportunities`: 5–8 entries with `voiceSubject`, `literalVisual`, `action`, `sceneFamily`, `humanAction`, and `motifPresent`. At least five distinct scene families are required, at least two entries must set `humanAction: true`, and at least two entries must omit the motif.
- `motifUsage`: declares `returnPoints`, `maxConsecutiveMotifOnlyScenes` (default two), and `targetCueShare` (normally 0.25–0.55). Continuous story does not mean continuous object visibility.

Also require:

- `evidence[]` with `title`, direct `url`, `accessedAt`, and `supports`;
- `viralEvidence` with `status`, `signal`, and `observedAt`; use `NOT_CLAIMED` when virality is not asserted;
- `visualSeed`, `rightsStatus`, `estimatedImageCalls`, and `productionCost` (`LOW`, `MEDIUM`, or `HIGH`);
- `scores` and `totalScore`. `scores` must include `openingFamiliarity`, `curiosityGap`, `narrativeObjectStrength`, `motionPotential`, `singleLessonClarity`, and `immediateApplicability`, each from 1–5.

`scores` also requires `semanticVisualCoverage` and `sceneVariety` from 1–5. Reject an idea scoring below four on either field for a visual-first short.

`rightsStatus` records sourcing readiness, not legal certainty. Use `RESEARCH_REQUIRED` when ownership, consent, or commercial reuse is unclear.

The review view must lead with the top three, name one recommendation, show evidence links, and disclose `ADJACENT`, rights, and production-cost flags.

## Phenomenon-led fields for schema version 3

Each idea additionally requires:

```json
{
  "phenomenon": {
    "observableMoment": "A concrete moment anyone can picture",
    "businessStake": "Why this matters to an SME or brand",
    "viewerPrediction": "The guess viewers are invited to make",
    "visibleContradiction": "What makes the intuitive answer incomplete"
  },
  "hookDesign": {
    "mode": "prediction-puzzle",
    "spokenHook": "The exact short hook seed",
    "withheldAnswer": "The answer intentionally delayed",
    "broadAudienceBridge": "Why founders, marketers, and consumers can all enter"
  },
  "theoryBridge": {
    "plainLanguageMechanism": "The causal explanation without jargon",
    "technicalLabel": "Optional theory name or empty string",
    "earliestRevealSecond": 12
  },
  "proofPlan": {
    "primaryClaim": "The claim that needs support",
    "evidenceType": "documented-case",
    "sourceNeeded": true,
    "visualProof": "What the viewer will actually see as proof"
  },
  "retentionResets": []
}
```

`hookDesign.mode` is one of `prediction-puzzle`, `visible-paradox`, `price-context-contrast`, or `identity-boundary`. Keep `spokenHook` concrete, jargon-free, and short enough for the first three seconds.

Use 5–7 `retentionResets`, each with `atSecond`, `trigger`, `informationGain`, `visualReset`, and `sceneFamily`. Begin at 0–3 seconds, place later resets no more than 10 seconds apart, and include a reset at or after 40 seconds for proof, lesson, or application.

For schema version 3, every `sceneOpportunities` entry also declares `retentionLayer`: `hook-puzzle`, `story-action`, `proof-evidence`, `mechanism-decode`, or `application-audit`. Cover all five layers across the map.

Version 3 scores additionally require `viewerParticipation`, `broadAudienceReach`, `proofReadiness`, and `retentionResetStrength`, each from 1–5. Reject a phenomenon-led idea below four on any of these fields.
