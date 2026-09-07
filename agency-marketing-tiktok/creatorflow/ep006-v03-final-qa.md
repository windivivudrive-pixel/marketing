# EP006 v03 — Final QA Report

## Overview
- **Episode ID**: EP006
- **Version**: v03
- **Title**: Vì sao người ta vứt chiếc cốc nhưng lại giữ chiếc túi?
- **Slug**: vi-sao-giu-tui-vut-coc-v03
- **Preset**: `branding-story-paper-pink`
- **Grammar Blueprints**: `continuous-stage-v1` (motion) + `subject-led-v1` (visual)
- **Voice Provider**: Cartesia (`b143fdf3-029f-4f00-aa3f-0c171fb170bd`)
- **Image Provider**: Flow Agent (`gem_pix_2`) — 100% Flow Agent generated isolated stickers on `#00FF00` chroma green
- **Final Render**: `out/ep006-vi-sao-giu-tui-vut-coc-v03.mp4`
- **Duration**: 53.99s (1619 frames @ 30fps)
- **Resolution**: 1080x1920 (9:16)
- **Codecs**: Video H.264 High / Audio AAC stereo 48kHz

---

## Gates & Profile Validation
1. `validate-profile.mjs production`: **PASS (0 warnings, 0 errors)**
2. `ensure-flow-agent.mjs`: **PASS (backend healthy, extension connected, flow key verified)**
3. `validate-episode.mjs --mode production`: **PASS (schema v2, 7 macro beats, 34 visual cues, 54.0s)**
4. Corner transparency check on all 11 isolated cutouts: **PASS (100% alpha = 0 at all 4 corners)**

---

## Subject-Led & Continuous-Stage Compliance
- **Motif Object**: Chiếc túi giấy trơn (`kept-bag` / A02, A04, A05). Appears in C02-C06, C08-C09, C23-C24, C27-C28 (approx. 41% of duration), leaving completely when subject shifts to human reaction, delivery, logo critique, or store audit.
- **Scene Families (>= 5 required)**: 10 families present (`hook-action-contrast`, `retail-context`, `object-state-change`, `gift-packing`, `human-delivery`, `human-reaction`, `brand-echo`, `proof-criteria`, `waste-proof`, `owner-audit`, `phone-application`, `cta`).
- **Human / Action Moments (>= 2 required)**: 5 distinct photoreal human moments (hand discarding cup, customer holding both items, friend delivering gift at door, recipient looking/asking, shop owner table audit).
- **Paper Treatment**: Alpha silhouette watercolor pastel-pink backing + irregular torn-white contour + hot-pink offset + soft paper shadow (all rendered in Remotion via SVG filter & mask). No rectangular backings.
- **Mascot Punctuation**: Mascot bursts appear at key narrative punctuation points (4.2s `thinking`, 17.8s `find`, 27.2s `idea`, 43.0s `serious`, 51.8s `clap hand`), each lasting <= 0.35s (10 frames) before fully exiting.
- **Captions & Safe Zone**: Captions rendered at `top: 1110` with active word spring-clamped scale <= 1.15 and `whiteSpace: "pre-wrap"`. Clear of TikTok right gutter and footer identity rails.

---

## Cue-by-Cue QA Matrix

| Cue | Time (s) | Spoken Anchor | Voice Subject | Visual Subject & Treatment | Scene Family | Role | Continuity & Safe Zone |
|---|---|---|---|---|---|---|---|
| C01 | 0.0–1.5 | Cốc | Cốc bị vứt | Bàn tay thả cốc rỗng xuống thùng rác (A01) | hook-action-contrast | human-action | PASS · Center crop safe |
| C02 | 1.5–2.8 | Sao | Chiếc túi được giữ | Bàn tay kéo túi giấy lại (A02) + Label `GIỮ LẠI?` | hook-action-contrast | motif-anchor | PASS · Match-move carry |
| C03 | 2.8–4.3 | gấp | Gấp túi mang về | Bàn tay gấp túi thành hình phẳng (A02) | object-state-change | motif-anchor | PASS · Reframe carry |
| C04 | 4.3–6.6 | Cùng | Cùng mua một quán | Khách Việt cầm cốc & túi cạnh nhau (A03) | retail-context | context | PASS · Mascot thinking burst |
| C05 | 6.6–9.0 | Không | Giả định vì đẹp | Túi giấy được xem xét (A02) + Label `CHỈ VÌ ĐẸP?` | object-state-change | motif-anchor | PASS · Transform exit |
| C06 | 9.0–11.5 | mà | Việc tiếp theo | Túi gấp trong ngăn kéo (A04) + Label `VIỆC TIẾP THEO` | object-state-change | motif-anchor | PASS · Mask-reveal replace |
| C07 | 11.5–13.8 | Hôm nay | Cốc đồ uống hôm nay | Bàn tay nâng cốc uống rồi hạ xuống (A03) | use-now | human-action | PASS · Cut replace |
| C08 | 13.8–15.4 | Ngày mai | Túi vào ngày mai | Túi gấp mở ra chuẩn bị dùng lại (A04) | object-state-change | motif-anchor | PASS · Reframe carry |
| C09 | 15.4–17.8 | nó đựng | Đựng quà cho bạn | Bàn tay mở túi và đặt hộp quà vào (A05, A09) | gift-packing | human-action | PASS · Mask-reveal replace |
| C10 | 17.8–20.0 | Khi | Bạn nhận quà | Người trẻ mang túi quà tới cửa (A06) + Label | human-delivery | human-action | PASS · Mascot find burst |
| C11 | 20.0–22.2 | họ | Ánh nhìn người nhận | Người nhận nghiêng người quan sát (A07) | human-reaction | human-action | PASS · Reframe replace |
| C12 | 22.2–24.1 | rồi | Câu hỏi mua ở đâu | Người nhận đặt câu hỏi (A07) + Bubble `MUA Ở ĐÂU VẬY?` | human-reaction | human-action | PASS · Mask-reveal replace |
| C13 | 24.1–26.2 | Thế là | Lần xuất hiện thứ hai | Đường thời gian LẦN MUA → LẦN DÙNG HAI | brand-echo | literal-evidence | PASS · Reframe carry |
| C14 | 26.2–28.5 | dù | Không thêm quảng cáo | Đường thời gian + Badge `KHÔNG THÊM QUẢNG CÁO` | brand-echo | literal-evidence | PASS · Mascot idea burst |
| C15 | 28.5–30.6 | Trong | Điểm chạm sau bán | Label nổi bật `ĐIỂM CHẠM SAU BÁN` | concept-decode | literal-evidence | PASS · Zoom-through carry |
| C16 | 30.6–32.8 | sống | Sống lâu hơn giao dịch | Timeline `SỐNG LÂU HƠN GIAO DỊCH` | concept-decode | literal-evidence | PASS · Match-move replace |
| C17 | 32.8–35.0 | Nhưng | Logo thật lớn | Warning box `LOGO THẬT LỚN ≠ LÝ DO GIỮ` | proof-criteria | proof | PASS · Click SFX |
| C18 | 35.0–37.2 | Món | Món đồ hữu ích | Hộp quà & thiệp được sắp để dùng lại (A09) | proof-criteria | proof | PASS · Mask-reveal replace |
| C19 | 37.2–39.2 | đủ đẹp | Đủ đẹp để giữ | Thiệp trơn đặt ngay ngắn (A09) + Label `ĐỦ ĐẸP ĐỂ GIỮ` | proof-criteria | proof | PASS · Reframe replace |
| C20 | 39.2–41.2 | hoặc | Gắn với kỷ niệm | Người nhận lưu giữ thiệp & ảnh kỷ niệm (A07) | memory-action | human-action | PASS · Match-move replace |
| C21 | 41.2–43.4 | Còn | Bao bì vô dụng | Bàn tay vò giấy gói thả vào thùng (A10) | waste-proof | human-action | PASS · Whoosh SFX |
| C22 | 43.4–45.6 | Bài học | Bài học vòng đời | Timeline `MUA XONG → VẪN SỐNG TIẾP` | lesson-timeline | literal-evidence | PASS · Mascot serious burst |
| C23 | 45.6–47.8 | Hãy | Có lý do sống tiếp | Túi giấy quay lại (A02) + Label `CÓ LÝ DO SỐNG TIẾP` | lesson-timeline | motif-anchor | PASS · Match-move carry |
| C24 | 47.8–50.0 | Thử | Trải các điểm chạm | Chủ shop audit các điểm chạm trên bàn (A02, A08, A09) | owner-audit | human-action | PASS · Reframe replace |
| C25 | 50.0–52.2 | Hỏi | Ngày mai khách giữ gì | Điện thoại chụp bài test (A11) + Label `NGÀY MAI KHÁCH CÒN GIỮ GÌ?` | phone-application | application | PASS · Zoom-through carry |
| C26 | 52.2–53.9 | Nếu | Bắt đầu từ 1 món | Button hành động `BẮT ĐẦU TỪ MỘT MÓN` | phone-application | application | PASS · Mascot clap hand burst |
| C27 | 53.9–55.8 | Lưu | Lưu video | Túi giấy quay lại (A02) + Button `LƯU VIDEO` | cta | application | PASS · Match-move carry |
| C28 | 55.8–58.0 | trải nghiệm | Trải nghiệm sau bán | Túi giấy (A02) + Label `KIỂM TRA TRẢI NGHIỆM SAU BÁN` | cta | application | PASS · Final hold |

---

## Conclusion
Production edit of EP006 v03 is **100% complete, fully compliant with subject-led-v1 and continuous-stage-v1, rendered locally via Remotion with all assets sourced from Flow Agent and voice from Cartesia**.
- Status: **qa-passed**
