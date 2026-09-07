import {Audio} from "@remotion/media";
import type {ReactNode} from "react";
import {AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Captions} from "./components/Captions";
import {styles} from "./styles";
import type {StyleTokens} from "./styles";
import type {CodeTemplate, CreatorProfile, Episode, MediaAsset, VisualCue, VisualItem} from "./types";

const silhouetteMask = (sourceSrc: string) => ({
  WebkitMaskImage: `url("${sourceSrc}")`,
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  WebkitMaskSize: "contain",
  maskImage: `url("${sourceSrc}")`,
  maskRepeat: "no-repeat",
  maskPosition: "center",
  maskSize: "contain"
});

const TornSticker = ({children, variant, sourceSrc, accent}: {children: ReactNode; variant: number; sourceSrc: string; accent: string}) => {
  const mask = silhouetteMask(sourceSrc);
  const watercolor = "radial-gradient(circle at 24% 17%, rgba(255,255,255,.78) 0 3%, transparent 25%), radial-gradient(circle at 78% 76%, rgba(255,255,255,.42) 0 2%, transparent 28%), linear-gradient(135deg, #FBE1EA 0%, #F4B8CA 58%, #F8D3DD 100%)";
  return <div style={{position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: 28}}>
    <div style={{...mask, position: "absolute", inset: 18, background: accent, scale: 1.18, translate: `${variant % 2 === 0 ? "12px 14px" : "-12px 14px"}`, opacity: 0.82, filter: "drop-shadow(0 16px 18px rgba(117, 33, 61, .12))"}} />
    <div style={{...mask, position: "absolute", inset: 18, background: "#FFFDF9", scale: 1.13, rotate: `${variant % 2 === 0 ? -1.4 : 1.4}deg`, filter: "drop-shadow(0 17px 24px rgba(94, 35, 53, .18))"}} />
    <div style={{...mask, position: "absolute", inset: 18, backgroundImage: watercolor, scale: 1.075, rotate: `${variant % 2 === 0 ? -0.7 : 0.7}deg`}} />
    <div style={{position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>{children}</div>
  </div>;
};

const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);
const sfxFiles = {"sticker-popup": "audio/sfx/sticker-popup.mp3", whoosh: "audio/sfx/whoosh.wav", click: "audio/sfx/click.wav", ding: "audio/sfx/ding.wav"} as const;

const legacyCue = (episode: Episode, now: number): VisualCue => {
  const beat = episode.beats.find((item) => now >= item.startMs && now < item.endMs) ?? episode.beats[episode.beats.length - 1];
  return {
    id: beat.id,
    startMs: beat.startMs,
    endMs: beat.endMs,
    spokenAnchor: beat.headline,
    semanticIntent: beat.body,
    composition: beat.assetIds.length === 2 ? "compare" : beat.assetIds.length > 2 ? "sequence" : "solo",
    exit: "replace",
    items: beat.assetIds.slice(0, 3).map((assetId, index) => ({
      id: `${beat.id}-${assetId}`,
      kind: "asset",
      assetId,
      role: beat.body,
      enterMs: beat.startMs + index * 150,
      motion: "reveal"
    }))
  };
};

const CodeVisual = ({template = "label", text = "", compact = false, tokens, direct = false}: {template?: CodeTemplate; text?: string; compact?: boolean; tokens: StyleTokens; direct?: boolean}) => {
  const shared = {background: tokens.surface, color: tokens.text, border: `3px solid ${tokens.border}`, boxShadow: `0 12px 0 ${tokens.shadow}`};
  if (template === "label" && direct) return <div style={{maxWidth: 720, color: tokens.text, fontFamily: tokens.headingFont, fontSize: text.length <= 2 ? 220 : compact ? 42 : 68, fontWeight: 900, lineHeight: 0.95, textAlign: "center", textWrap: "balance"}}>{text}</div>;
  if (template === "chart") {
    return (
      <div style={{...shared, width: 420, height: 300, borderRadius: 24, padding: 30, display: "flex", alignItems: "flex-end", gap: 20}}>
        {[42, 68, 94, 58].map((height, index) => <div key={index} style={{height: `${height}%`, flex: 1, background: index === 2 ? tokens.accentA : tokens.accentB, borderRadius: "14px 14px 4px 4px"}} />)}
      </div>
    );
  }
  if (template === "checklist") {
    return <div style={{...shared, width: 500, borderRadius: 24, padding: 36, fontSize: 34, lineHeight: 1.5}}>{text.split("+").map((line) => <div key={line}>✓ {line.trim()}</div>)}</div>;
  }
  if (["menu", "price-board", "interface"].includes(template)) {
    return <div style={{...shared, width: compact ? 270 : 520, minHeight: 260, borderRadius: 22, padding: 32, fontSize: compact ? 27 : 38, fontWeight: 800, lineHeight: 1.35, whiteSpace: "pre-wrap"}}>{text}</div>;
  }
  const background = template === "warning" ? tokens.accentB : template === "button" ? tokens.accentA : tokens.surface;
  const color = template === "button" ? tokens.surface : tokens.text;
  return <div style={{...shared, minWidth: compact ? 170 : 300, maxWidth: compact ? 255 : 620, padding: compact ? "22px 20px" : "34px 46px", borderRadius: template === "button" ? 18 : 999, background, color, fontSize: template === "metric" ? 86 : compact ? 30 : 46, fontWeight: 900, textAlign: "center"}}>{text}</div>;
};

const VisualItemLayer = ({item, asset, itemCount, tokens, cue, continuous}: {item: VisualItem; asset?: MediaAsset; itemCount: number; tokens: StyleTokens; cue: VisualCue; continuous: boolean}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const local = frame - msToFrame(item.enterMs, fps);
  if (local < 0) return null;
  const easing = Easing.bezier(0.16, 1, 0.3, 1);
  const opacity = interpolate(local, [0, 5], [0, 1], {easing, extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const scale = item.motion === "pop" || item.motion === "stamp"
    ? interpolate(local, [0, 8], [0.78, 1], {easing, extrapolateLeft: "clamp", extrapolateRight: "clamp", output: "perceptual-scale"})
    : 1;
  const translate = item.motion === "slide"
    ? interpolate(local, [0, 9], ["0px 44px", "0px 0px"], {easing, extrapolateLeft: "clamp", extrapolateRight: "clamp"})
    : "0px 0px";
  const cueStartFrame = msToFrame(Math.max(cue.startMs, item.enterMs), fps);
  const cueEndFrame = Math.max(cueStartFrame + 1, msToFrame(cue.endMs, fps));
  const transformProgress = interpolate(frame, [cueStartFrame, cueEndFrame], [0, 1], {
    easing: item.transform?.easing === "linear" ? Easing.linear : item.transform?.easing === "spring" ? Easing.bezier(0.22, 1.35, 0.36, 1) : easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const from = item.transform?.from ?? {x: 0, y: 0, scale: 1, rotation: 0, opacity: 1};
  const to = item.transform?.to ?? from;
  const stageX = interpolate(transformProgress, [0, 1], [from.x, to.x]);
  const stageY = interpolate(transformProgress, [0, 1], [from.y, to.y]);
  const stageScale = interpolate(transformProgress, [0, 1], [from.scale, to.scale]);
  const stageRotation = interpolate(transformProgress, [0, 1], [from.rotation, to.rotation]);
  const stageOpacity = interpolate(transformProgress, [0, 1], [from.opacity, to.opacity]);
  const width = itemCount === 1 ? 650 : itemCount === 2 ? 400 : 275;
  const height = itemCount === 1 ? 520 : itemCount === 2 ? 470 : 380;
  return (
    <div style={{position: continuous ? "absolute" : undefined, left: continuous ? "50%" : undefined, top: continuous ? "50%" : undefined, marginLeft: continuous ? -width / 2 : undefined, marginTop: continuous ? -height / 2 : undefined, width, height, display: "flex", justifyContent: "center", alignItems: "center", opacity: continuous ? opacity * stageOpacity : opacity, transform: continuous ? `translate3d(${stageX}px, ${stageY}px, 0) scale(${stageScale}) rotate(${stageRotation}deg)` : undefined, scale: continuous ? undefined : scale, translate: continuous ? undefined : translate, willChange: "transform, opacity"}}>
      {item.kind === "asset" && asset && asset.stickerTreatment !== "legacy-precut" ? (
        <TornSticker variant={itemCount} sourceSrc={staticFile(asset.src)} accent={tokens.accentA}>
          <Img src={staticFile(asset.src)} alt={asset.alt} style={{maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 12px rgba(23,21,19,.12))"}} />
        </TornSticker>
      ) : item.kind === "asset" && asset ? (
        <Img src={staticFile(asset.src)} alt={asset.alt} style={{maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 14px rgba(94,35,53,.14))"}} />
      ) : (
        <CodeVisual template={item.codeTemplate} text={item.text} compact={itemCount === 3} tokens={tokens} direct={continuous && item.semanticRole !== "evidence"} />
      )}
    </div>
  );
};

export const CreatorFlowVideo = ({episode, profile}: {episode: Episode; profile: CreatorProfile}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const now = (frame / fps) * 1000;
  const beat = episode.beats.find((item) => now >= item.startMs && now < item.endMs) ?? episode.beats[episode.beats.length - 1];
  const cue = episode.schemaVersion === 2
    ? episode.visualCues.find((item) => now >= item.startMs && now < item.endMs) ?? episode.visualCues[episode.visualCues.length - 1]
    : legacyCue(episode, now);
  const tokens = styles[profile.style.preset];
  const seriesLabel = profile.seriesLabel || profile.channelName || profile.brand.name || profile.projectName;
  const footerLeft = profile.brand.footerLeft || profile.brand.promise;
  const footerRight = profile.brand.footerRight || profile.style.vibe;
  const assetMap = new Map(episode.assets.map((asset) => [asset.id, asset]));
  const continuous = episode.schemaVersion === 2 && episode.motionGrammar === "continuous-stage-v1";
  const cueProgress = interpolate(now, [cue.startMs, cue.endMs], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const cameraAmount = cue.camera?.intensity === "medium" ? 0.1 : 0.055;
  const cameraScale = cue.camera?.mode === "push-in" || cue.camera?.mode === "follow" ? 1 + cueProgress * cameraAmount : cue.camera?.mode === "pull-out" ? 1 + (1 - cueProgress) * cameraAmount : cue.transition === "zoom-through" ? 1 + cueProgress * 0.16 : 1;
  const cameraX = cue.camera?.mode === "pan" ? interpolate(cueProgress, [0, 1], [-45, 45]) : 0;
  const reveal = cue.transition === "mask-reveal" ? interpolate(cueProgress, [0, 0.22], [0, 100], {extrapolateRight: "clamp"}) : 100;

  const sfxEvents = episode.schemaVersion === 2
    ? [...new Map(episode.visualCues.flatMap((state) => state.items).filter((item) => item.sfx).map((item) => [`${item.id}@${item.enterMs}`, item])).values()]
    : [];

  return (
    <AbsoluteFill style={{background: tokens.background, color: tokens.text, fontFamily: tokens.bodyFont, overflow: "hidden"}}>
      <AbsoluteFill style={{backgroundImage: tokens.texture, backgroundSize: profile.style.preset === "tech-brutalist" ? "48px 48px" : "18px 18px", opacity: 0.75}} />
      <div style={{position: "absolute", top: continuous ? 68 : 85, left: 80, right: 80, display: "flex", justifyContent: "space-between", borderBottom: continuous ? undefined : `2px solid ${tokens.border}`, paddingBottom: continuous ? 0 : 22, zIndex: 20, pointerEvents: "none"}}>
        <div style={{fontWeight: 900, fontSize: continuous ? 20 : 31, letterSpacing: continuous ? 1.8 : 0, color: continuous ? tokens.muted : tokens.text}}>{seriesLabel}</div>
        <div style={{fontSize: continuous ? 18 : 21, color: tokens.muted, letterSpacing: 2.5}}>{episode.id.toUpperCase()}</div>
      </div>
      {!continuous && <div style={{position: "absolute", top: 190, left: 80, right: 80, textAlign: "center"}}>
        <div style={{fontFamily: tokens.headingFont, fontSize: 68, lineHeight: 0.98, fontWeight: 900}}>{beat.headline}</div>
        <div style={{marginTop: 16, color: tokens.muted, fontSize: 30}}>{beat.body}</div>
      </div>}
      <div style={{position: "absolute", top: continuous ? 170 : 430, left: continuous ? 0 : 80, right: continuous ? 0 : 80, height: continuous ? 1010 : 700, display: "flex", alignItems: "center", justifyContent: "center", gap: cue.items.length === 3 ? 14 : 28, transform: continuous ? `translate3d(${cameraX}px, 0, 0) scale(${cameraScale})` : undefined, clipPath: continuous ? `inset(0 ${100 - reveal}% 0 0)` : undefined, transformOrigin: "center center", willChange: "transform, clip-path"}}>
        {cue.items.map((item) => <VisualItemLayer key={item.id} item={item} asset={item.assetId ? assetMap.get(item.assetId) : undefined} itemCount={cue.items.length} tokens={tokens} cue={cue} continuous={continuous} />)}
      </div>
      {episode.audio.voiceSrc && <Captions tokens={tokens} top={profile.production.captionTop ?? 1110} />}
      {!continuous && <div style={{position: "absolute", left: 80, right: 80, bottom: 70, display: "flex", justifyContent: "space-between", color: tokens.muted, fontSize: 20}}>
        <span>{footerLeft}</span><span>{footerRight} · {cue.id}</span>
      </div>}
      {sfxEvents.map((item) => (
        <Sequence key={`${item.id}-${item.enterMs}`} from={msToFrame(item.enterMs, fps)} durationInFrames={Math.max(1, Math.round(fps * 0.5))} layout="none">
          <Audio src={staticFile(sfxFiles[item.sfx!])} volume={0.75} />
        </Sequence>
      ))}
      {episode.audio.musicSrc && <Audio src={staticFile(episode.audio.musicSrc)} loop volume={(audioFrame) => interpolate(audioFrame, [0, 20, Math.max(21, durationInFrames - 25), durationInFrames - 1], [0, episode.audio.musicVolume, episode.audio.musicVolume, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})} />}
      {episode.audio.voiceSrc && <Audio src={staticFile(episode.audio.voiceSrc)} volume={() => episode.audio.voiceVolume} />}
    </AbsoluteFill>
  );
};
