# Subject-led visual grammar

Use this contract for story-led 45–60 second videos when one recurring motif connects several scenes.

## Core rule

Continuity belongs to the story, not to permanent object visibility. For every spoken line, identify the current person, object, action, place, interface, consequence, or proof. Make that subject visually dominant. Keep the recurring motif only when it still helps explain the line.

## Cue contract

Every cue declares:

- `spokenSubject`: what the voice is currently talking about;
- `visualSubject`: the concrete subject or action shown;
- `visualReason`: why this image helps explain that exact line;
- `sceneFamily`: the semantic family used for diversity QA;
- `continuityRole`: `motif-anchor`, `literal-evidence`, `human-action`, `context`, `proof`, or `application`.

If `visualReason` could justify an unrelated marketing sentence, the image is too generic.

## Motif behavior

- Target motif presence in 25–55 percent of cues.
- Allow no more than two consecutive motif-only cues unless the voice explicitly narrates a real multi-step transformation.
- Adjacent carries keep one stable item ID and original entrance time.
- A motif that leaves and returns uses a new item ID plus the same `motifKey`.
- A pan, zoom, scale, rotation, or new label does not create a new scene unless it reveals new evidence, action, relationship, or consequence.

## Scene diversity

Plan at least five scene families and two human/action cues. Prefer literal actions such as choosing, comparing, carrying, opening, asking, hesitating, returning, sharing, discarding, arranging, photographing, or testing.

When the voice names a customer, friend, owner, staff member, delivery, gesture, reaction, interface, or test, show that person or action. Do not leave the motif on screen with explanatory text as a substitute.

## Rejection checks

Reject or rewrite a plan when:

- more than half of likely cues are the same object plus changing labels;
- three consecutive samples show the same composition with only x/y/scale changes;
- a named person or action has no literal visual;
- text explains information the image should demonstrate;
- the contact sheet looks like one asset moving around an empty stage;
- motion changes energy but not meaning.

## Review matrix

For each cue, review spoken anchor, spoken subject, expected visual subject, actual visual, scene family, motif presence, timing, semantic match, and safe-zone result. A passing build does not satisfy this review.
