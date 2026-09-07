import {interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import captionsData from "../data/captions.json";
import wordsData from "../data/words.json";
import type {Caption} from "../types";
import type {StyleTokens} from "../styles";

const defaultCaptions = captionsData as Caption[];
const defaultWords = wordsData as Caption[];
const normalize = (value: string) => value.toLocaleLowerCase("vi").replace(/[^\p{L}\p{N}]+/gu, "");

export const Captions = ({tokens, top = 1110, captions = defaultCaptions, words = defaultWords}: {tokens: StyleTokens; top?: number; captions?: any; words?: any}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rawCaptions: Caption[] = Array.isArray(captions) ? captions : captions?.captions || defaultCaptions;
  const rawWords: Caption[] = Array.isArray(words) ? words : words?.words || defaultWords;
  const now = frame / fps * 1000;
  const caption = rawCaptions.find((item) => now >= item.startMs && now < item.endMs);
  if (!caption) return null;
  const captionWords = rawWords.filter((word) => word.endMs > caption.startMs && word.startMs < caption.endMs);
  let searchFrom = 0;
  const tokensWithTiming = caption.text.split(/(\s+)/).map((text) => {
    if (/^\s+$/.test(text)) return {text, word: undefined};
    const relative = captionWords.slice(searchFrom).findIndex((word) => normalize(word.text) === normalize(text));
    if (relative < 0) return {text, word: undefined};
    const wordIndex = searchFrom + relative;
    searchFrom = wordIndex + 1;
    return {text, word: captionWords[wordIndex]};
  });
  return <div style={{position: "absolute", top, left: 90, right: 150, textAlign: "center", zIndex: 30}}><div style={{display: "inline-block", maxWidth: 820, padding: "16px 30px", borderRadius: 16, background: tokens.surface, boxShadow: `0 8px 24px ${tokens.shadow}`, color: tokens.text, fontFamily: tokens.bodyFont, fontSize: 38, lineHeight: 1.24, fontWeight: 800, whiteSpace: "pre-wrap"}}>{tokensWithTiming.map(({text, word}, index) => {
    if (!word) return <span key={`${index}-${text}`}>{text}</span>;
    const active = now >= word.startMs && now < word.endMs;
    const bounce = active ? spring({frame: Math.max(0, frame - Math.round((word.startMs / 1000) * fps)), fps, config: {damping: 13, stiffness: 260, mass: 0.55}}) : 0;
    const scale = active ? Math.min(1.15, interpolate(bounce, [0, 1], [1, 1.15], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})) : 1;
    return <span key={`${index}-${text}`} style={{display: "inline-block", color: active ? tokens.accentA : tokens.text, transform: `scale(${scale})`, transformOrigin: "center bottom"}}>{text}</span>;
  })}</div></div>;
};
