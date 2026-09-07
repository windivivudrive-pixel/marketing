import type {StylePreset} from "./types";

export type StyleTokens = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accentA: string;
  accentB: string;
  border: string;
  shadow: string;
  headingFont: string;
  bodyFont: string;
  radius: number;
  texture: string;
};

export const styles: Record<StylePreset, StyleTokens> = {
  "branding-story-paper-pink": {
    background: "#FFF9F5", surface: "rgba(255,253,248,.96)", text: "#171313", muted: "#705E64",
    accentA: "#F22F68", accentB: "#F8C7D5", border: "#171313", shadow: "rgba(94,35,53,.14)",
    headingFont: "'SVN-Miller Banner', Georgia, serif", bodyFont: "'SVN-Nexa Light', Arial, sans-serif", radius: 18,
    texture: "radial-gradient(circle at 1px 1px, rgba(242,47,104,.07) 1px, transparent 0)"
  },
  "clean-editorial": {
    background: "#F7F1E8", surface: "#FFFDF8", text: "#171513", muted: "#6E655E",
    accentA: "#FF5A47", accentB: "#9DB9AE", border: "#171513", shadow: "#D9CFC3",
    headingFont: "Georgia, 'Times New Roman', serif", bodyFont: "Arial, sans-serif", radius: 22,
    texture: "radial-gradient(circle at 1px 1px, rgba(23,21,19,.12) 1px, transparent 0)"
  },
  "dark-cinematic": {
    background: "#0E0D0C", surface: "#1B1917", text: "#F4EBDD", muted: "#A69B90",
    accentA: "#D94D36", accentB: "#CDA66B", border: "#3C3732", shadow: "#050505",
    headingFont: "Georgia, 'Times New Roman', serif", bodyFont: "Arial, sans-serif", radius: 8,
    texture: "radial-gradient(circle at 70% 10%, rgba(205,166,107,.13), transparent 36%)"
  },
  "playful-pop": {
    background: "#FFF5D8", surface: "#FFFFFF", text: "#242033", muted: "#6D6680",
    accentA: "#FF4F91", accentB: "#4FD6C8", border: "#242033", shadow: "#B8A5FF",
    headingFont: "Arial Black, Arial, sans-serif", bodyFont: "Arial, sans-serif", radius: 34,
    texture: "radial-gradient(circle at 1px 1px, rgba(36,32,51,.1) 1.4px, transparent 0)"
  },
  "warm-lifestyle": {
    background: "#EFE6D7", surface: "#FAF5EC", text: "#40362D", muted: "#7B6B5D",
    accentA: "#C96E4B", accentB: "#7F8E69", border: "#9C8976", shadow: "#D3C1AC",
    headingFont: "Georgia, 'Times New Roman', serif", bodyFont: "Arial, sans-serif", radius: 28,
    texture: "linear-gradient(115deg, rgba(255,255,255,.28), transparent 42%)"
  },
  "tech-brutalist": {
    background: "#0A0B0A", surface: "#121512", text: "#F2F3E8", muted: "#8A938A",
    accentA: "#B6FF3B", accentB: "#55D6FF", border: "#B6FF3B", shadow: "#26311E",
    headingFont: "Arial Black, Arial, sans-serif", bodyFont: "Courier New, monospace", radius: 0,
    texture: "linear-gradient(rgba(182,255,59,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(182,255,59,.05) 1px, transparent 1px)"
  },
  "luxe-minimal": {
    background: "#F4F0E7", surface: "#FCFAF5", text: "#171717", muted: "#777168",
    accentA: "#A8854B", accentB: "#B7ADA1", border: "#B9AA93", shadow: "#DDD5C8",
    headingFont: "Georgia, 'Times New Roman', serif", bodyFont: "Arial, sans-serif", radius: 3,
    texture: "linear-gradient(135deg, rgba(168,133,75,.07), transparent 40%)"
  }
};
