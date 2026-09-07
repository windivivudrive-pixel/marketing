import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {fontFamilies} from "./fonts";
import profile from "./data/ep006-preview-profile.json";
import type {ReactNode} from "react";

const PINK = "#f22f68";
const INK = "#181416";
const CREAM = "#fbf7f1";
const MUTED = "#6e655e";

const cards = [
  {label: "CƠ BẢN", sub: "Cần nhanh", price: "₁"},
  {label: "ĐẶC TRƯNG", sub: "Khác biệt thật", price: "₂"},
  {label: "GIỚI HẠN", sub: "Một dịp cụ thể", price: "₃"}
];

const captionAt = (second: number) => {
  if (second < 2.66) return "Tăng giá không làm thương hiệu trông cao cấp hơn.";
  if (second < 7.42) return "Đổi con số... khách vẫn hỏi: Sao mắc vậy?";
  if (second < 16.64) return "Ba món. Ba tình huống.";
  if (second < 24.68) return "Khách đang trả thêm cho điều gì?";
  if (second < 31.72) return "Giá trị phải xuất hiện trong sản phẩm, phục vụ và bằng chứng.";
  if (second < 39.26) return "Thử làm ba bước để menu tự nói được.";
  if (second < 43.54) return "Định vị chưa rõ, chứ chưa chắc giá sai.";
  return "Lưu để kiểm tra lại bảng giá.";
};

const PreviewCard = ({children, accent = PINK}: {children: ReactNode; accent?: string}) => (
  <div style={{background: "rgba(255,253,248,.96)", border: `3px solid ${INK}`, borderRadius: 28, padding: "28px 34px", boxShadow: `12px 14px 0 ${accent}25`}}>{children}</div>
);

const Sticker = ({file, height = 250}: {file: string; height?: number}) => {
  const source = staticFile(file);
  const mask = {WebkitMaskImage: `url(${source})`, WebkitMaskRepeat: "no-repeat", WebkitMaskSize: "contain", WebkitMaskPosition: "center", maskImage: `url(${source})`, maskRepeat: "no-repeat", maskSize: "contain", maskPosition: "center"} as const;
  return (
  <div style={{width: height, height, position: "relative", flexShrink: 0}}>
    <div style={{position: "absolute", inset: 0, transform: "translate(13px, 15px) scale(1.08)", background: PINK, opacity: .58, filter: "blur(1.5px)", ...mask}} />
    <div style={{position: "absolute", inset: 0, transform: "scale(1.13)", background: "#fffdf8", filter: "url(#torn-edge)", ...mask}} />
    <div style={{position: "absolute", inset: 0, transform: "scale(1.07)", background: "radial-gradient(circle at 22% 18%, #ffeef4 0 11%, #f4b6cb 48%, #ef9cba 100%)", boxShadow: "0 14px 22px rgba(65,35,43,.16)", ...mask}} />
    <Img src={source} style={{position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 5px 5px rgba(45,26,30,.12))"}} />
  </div>
  );
};

const mascotBurstAt = (second: number) => {
  const bursts: Array<[number, string]> = [[3.6, "thinking"], [17.2, "find"], [25.1, "serious"], [32.1, "idea"], [40.0, "clap hand"], [43.7, "hello"]];
  return bursts.find(([start]) => second >= start && second < start + 0.35)?.[1];
};

export const EP006Preview = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const second = frame / fps;
  const progress = Math.min(1, second / 45.6);
  const phase = second < 2.66 ? 0 : second < 7.42 ? 1 : second < 16.64 ? 2 : second < 24.68 ? 3 : second < 31.72 ? 4 : second < 39.26 ? 5 : second < 43.54 ? 6 : 7;
  const caption = captionAt(second);
  const cardScale = interpolate(Math.min(1, Math.max(0, (second - 7.42) / 1.2)), [0, 1], [0.86, 1], {extrapolateRight: "clamp"});
  const mascot = mascotBurstAt(second);
  const mascotFrame = Math.floor(frame / 2) % 8;
  const openingThumbnail = second < 1.2;

  return (
    <AbsoluteFill style={{background: CREAM, color: INK, overflow: "hidden"}}>
      <Audio src={staticFile("audio/ep006-voice-cartesia-processed-v01.wav")} volume={1} />
      <Audio src={staticFile("audio/background-music-v01.mp3")} volume={0.10} loop />
      <Sequence durationInFrames={36}><Audio src={staticFile("audio/sfx/whoosh.wav")} volume={0.26} /></Sequence>
      <Sequence from={Math.round(7.42 * fps)} durationInFrames={18}><Audio src={staticFile("audio/sfx/sticker-popup.mp3")} volume={0.32} /></Sequence>
      <Sequence from={Math.round(31.72 * fps)} durationInFrames={18}><Audio src={staticFile("audio/sfx/click.wav")} volume={0.28} /></Sequence>
      <Sequence from={Math.round(39.26 * fps)} durationInFrames={24}><Audio src={staticFile("audio/sfx/ding.wav")} volume={0.28} /></Sequence>
      <Sequence from={Math.round(43.54 * fps)} durationInFrames={18}><Audio src={staticFile("audio/sfx/click.wav")} volume={0.26} /></Sequence>
      <svg width="0" height="0" aria-hidden="true"><filter id="torn-edge"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
      <Img src={staticFile(`background/bg${Math.floor(second * 2) % 3 + 1}.png`)} style={{position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: .72}} />
      <AbsoluteFill style={{backgroundImage: "linear-gradient(rgba(242,47,104,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(242,47,104,.04) 1px, transparent 1px)", backgroundSize: "43px 43px"}} />

      <div style={{position: "absolute", top: 112, left: 60, right: 60, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 3, opacity: openingThumbnail ? 0 : 1}}>
        <span style={{fontFamily: fontFamilies.primaryTitle, fontSize: 26, letterSpacing: ".04em"}}>{profile.seriesLabel}</span>
        <span style={{fontFamily: fontFamilies.supportingText, fontSize: 26, color: PINK, fontWeight: "bold"}}>{profile.episodeLabel}</span>
      </div>

      <div style={{position: "absolute", top: 245, left: 60, right: 60, textAlign: "center", zIndex: 3, opacity: openingThumbnail ? 0 : 1}}>
        <div style={{fontFamily: fontFamilies.primaryTitle, fontSize: 54, lineHeight: 1.1, letterSpacing: ".015em"}}>{phase === 0 ? "GIÁ CAO ≠ CAO CẤP" : phase === 1 ? "KHÁCH CHỈ THẤY... MẮC" : phase === 2 ? "ĐỔI KHUNG SO SÁNH" : phase === 3 ? "TRẢ THÊM CHO ĐIỀU GÌ?" : phase === 4 ? "GIÁ TRỊ PHẢI HIỆN RA" : phase === 5 ? "BÀI TEST 3 BƯỚC" : phase === 6 ? "ĐỊNH VỊ CHƯA RÕ" : "LƯU ĐỂ KIỂM TRA"}</div>
        <div style={{fontFamily: fontFamilies.decorativeAccent, color: PINK, fontSize: 43, marginTop: 18}}>{phase === 2 ? "một menu · ba tình huống" : phase === 5 ? "menu tự nói được chưa?" : "một câu chuyện · một bài học"}</div>
      </div>

      <div style={{position: "absolute", top: 500, left: 60, right: 60, height: 520, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2}}>
        {phase === 0 && (openingThumbnail ? <div style={{display: "flex", alignItems: "center", gap: 12, transform: "scale(1.08)"}}><Sticker file="ep006/v02/generated/a03-cup-basic-alpha-v02.png" height={390}/><div style={{fontFamily: fontFamilies.primaryTitle, fontSize: 88, lineHeight: .85, color: INK}}>GIÁ<br/><span style={{color: PINK}}>CAO</span><br/>≠</div><div style={{fontFamily: fontFamilies.primaryTitle, fontSize: 56, lineHeight: .9}}>CAO<br/>CẤP</div></div> : <PreviewCard><div style={{fontFamily: fontFamilies.primaryTitle, fontSize: 92, color: PINK, textAlign: "center"}}>₫ ↑</div><div style={{fontFamily: fontFamilies.supportingText, fontSize: 30, textAlign: "center", marginTop: 12}}>Giá tăng ≠ trải nghiệm tăng</div></PreviewCard>)}
        {phase === 1 && <div style={{display: "flex", gap: 18, alignItems: "center"}}><Sticker file="ep006/v02/generated/a01-cafe-owner-alpha-v02.png" height={290}/><PreviewCard accent="#222"><div style={{fontSize: 76}}>₫</div><div style={{fontFamily: fontFamilies.supportingText, fontSize: 30}}>Một con số đứng riêng<br/><span style={{color: PINK, fontWeight: "bold"}}>rất dễ bị so giá</span></div></PreviewCard></div>}
        {phase === 2 && <div style={{display: "flex", gap: 14, transform: `scale(${cardScale})`}}>{["a03-cup-basic-alpha-v02.png","a04-cup-signature-alpha-v02.png","a05-cup-limited-alpha-v02.png"].map((file, index) => <PreviewCard key={file}><Sticker file={`ep006/v02/generated/${file}`} height={180}/><div style={{fontFamily: fontFamilies.primaryTitle, fontSize: 25, textAlign: "center"}}>{cards[index].label}</div><div style={{fontFamily: fontFamilies.supportingText, fontSize: 20, color: MUTED, textAlign: "center", marginTop: 6}}>{cards[index].sub}</div></PreviewCard>)}</div>}
        {phase === 3 && <PreviewCard><div style={{fontFamily: fontFamilies.primaryTitle, fontSize: 42, textAlign: "center"}}>Khách không hỏi<br/><span style={{color: PINK}}>“bao nhiêu?”</span></div><div style={{fontFamily: fontFamilies.supportingText, fontSize: 32, textAlign: "center", marginTop: 22}}>Họ hỏi: “Đổi lại được gì?”</div></PreviewCard>}
        {phase === 4 && <div style={{display: "flex", gap: 18, alignItems: "center"}}><Sticker file="ep006/v02/generated/a04-cup-signature-alpha-v02.png" height={220}/><Sticker file="ep006/v02/generated/a07-service-hand-alpha-v02.png" height={220}/><Sticker file="ep006/v02/generated/a08-proof-sheet-alpha-v02.png" height={220}/></div>}
        {phase === 5 && <PreviewCard><div style={{fontFamily: fontFamilies.primaryTitle, fontSize: 38, marginBottom: 18}}>BÀI TEST MENU</div>{["Mỗi lựa chọn dành cho ai?", "Khác biệt thật là gì?", "Người mới có tự chọn được không?"].map((line, index) => <div key={line} style={{fontFamily: fontFamilies.supportingText, fontSize: 28, margin: "15px 0", display: "flex", gap: 14, alignItems: "center"}}><span style={{color: PINK, fontWeight: "bold"}}>{index + 1}.</span>{line}</div>)}</PreviewCard>}
        {phase === 6 && <PreviewCard accent="#222"><div style={{fontFamily: fontFamilies.primaryTitle, fontSize: 48, textAlign: "center"}}>“Khác nhau ở đâu?”</div><div style={{height: 4, background: PINK, margin: "26px 50px"}}/><div style={{fontFamily: fontFamilies.supportingText, fontSize: 32, textAlign: "center"}}>Định vị chưa rõ,<br/>chưa chắc giá sai.</div></PreviewCard>}
        {phase === 7 && <PreviewCard><div style={{fontFamily: fontFamilies.primaryTitle, fontSize: 44, textAlign: "center"}}>LƯU VIDEO</div><div style={{fontFamily: fontFamilies.supportingText, fontSize: 30, textAlign: "center", marginTop: 16}}>kiểm tra lại bảng giá của bạn</div><div style={{fontSize: 80, color: PINK, textAlign: "center", marginTop: 18}}>♡</div></PreviewCard>}
      </div>

      <div style={{position: "absolute", top: 1110, left: 60, right: 60, zIndex: 5, textAlign: "center", whiteSpace: "pre-wrap"}}>
        <span style={{display: "inline-block", maxWidth: 900, padding: "15px 30px", background: "rgba(255,253,248,.97)", borderRadius: 18, border: `2px solid ${PINK}35`, boxShadow: "0 8px 24px rgba(40,20,20,.08)", fontFamily: fontFamilies.supportingText, fontSize: 38, fontWeight: "bold", lineHeight: 1.25, color: PINK}}>{caption}</span>
      </div>
      {mascot && <Img src={staticFile(`mascot/frames/${mascot}/frame_${mascotFrame}.png`)} style={{position: "absolute", top: 1260, left: "50%", transform: "translateX(-50%)", height: 390, width: "auto", objectFit: "contain", zIndex: 4, filter: "drop-shadow(0 14px 12px rgba(94,35,53,.14))"}} />}
      <div style={{position: "absolute", bottom: 48, left: 60, right: 60, display: "flex", justifyContent: "space-between", fontFamily: fontFamilies.supportingText, fontSize: 19, color: MUTED, zIndex: 5}}><span>{profile.footerLeft}</span><span>{profile.footerRight}</span></div>
      <div style={{position: "absolute", right: 36, bottom: 104, fontFamily: fontFamilies.supportingText, fontSize: 18, color: "#a59a92", zIndex: 5}}>VISUAL ANIMATIC · {Math.round(progress * 100)}%</div>
    </AbsoluteFill>
  );
};
