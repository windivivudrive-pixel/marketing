import {Audio} from "@remotion/media";
import type {ReactNode} from "react";
import {AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Captions} from "./components/Captions";
import {styles} from "./styles";
import type {StyleTokens} from "./styles";
import type {Caption, CodeTemplate, CreatorProfile, Episode, MediaAsset, VisualCue, VisualItem} from "./types";

const FontStyles = () => (
  <style>{`
    @font-face {
      font-family: 'SVN-Miller Banner';
      src: url('${staticFile("fonts/SVN-Miller Banner.ttf")}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'SVN-Nexa Light';
      src: url('${staticFile("fonts/SVN-Nexa Light.ttf")}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'UTM ClassizismAntiqua';
      src: url('${staticFile("fonts/UTM ClassizismAntiqua.ttf")}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'SVN-Vanilla Daisy Pro';
      src: url('${staticFile("fonts/SVN-Vanilla Daisy Pro.ttf")}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  `}</style>
);

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
  return (
    <div style={{position: "relative", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: 24}}>
      <div style={{...mask, position: "absolute", inset: 16, background: accent, scale: 1.16, translate: `${variant % 2 === 0 ? "10px 12px" : "-10px 12px"}`, opacity: 0.82, filter: "drop-shadow(0 14px 16px rgba(117, 33, 61, .12))"}} />
      <div style={{...mask, position: "absolute", inset: 16, background: "#FFFDF9", scale: 1.12, rotate: `${variant % 2 === 0 ? -1.2 : 1.2}deg`, filter: "drop-shadow(0 16px 20px rgba(94, 35, 53, .16))"}} />
      <div style={{...mask, position: "absolute", inset: 16, backgroundImage: watercolor, scale: 1.065, rotate: `${variant % 2 === 0 ? -0.6 : 0.6}deg`}} />
      <div style={{position: "relative", zIndex: 1, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>{children}</div>
    </div>
  );
};

const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);
const sfxFiles = {
  "sticker-popup": "audio/sfx/sticker-popup.mp3",
  whoosh: "audio/sfx/whoosh.wav",
  click: "audio/sfx/click.wav",
  ding: "audio/sfx/ding.wav"
} as const;

// Story headlines (SVN-Miller Banner) & Subtitles (SVN-Nexa Light) precisely aligned with voiceover timestamps
const getStoryTitleAt = (second: number, episodeId?: string) => {
  const epId = (episodeId || "").toLowerCase();
  if (epId === "ep013") {
    if (second < 3.78) return {headline: "CÙNG MỘT MÁY XAY · 2 CÁCH ĐẶT", subtitle: "Nền càng rối, khách càng phải nghĩ nhiều hơn"};
    if (second < 14.00) return {headline: "1 BÊN GỌN GÀNG · 1 BÊN QUÁ TẢI", subtitle: "Cùng 1 máy xay nhưng mắt phải lọc vô số layer"};
    if (second < 25.56) return {headline: "ĐỪNG BẮT KHÁCH TỰ LỌC TÍN HIỆU", subtitle: "Đến lúc hiểu máy dùng làm gì thì ngón tay đã lướt rồi"};
    if (second < 36.00) return {headline: "NGHIÊN CỨU: PROCESSING FLUENCY", subtitle: "Não không đọc mọi thứ như nhau · Tín hiệu thừa tạo ma sát"};
    if (second < 43.82) return {headline: "1 KHUNG HÌNH · 1 VIỆC CHÍNH", subtitle: "Nền sạch để lợi ích sản phẩm có cơ hội được nhìn thấy"};
    if (second < 48.74) return {headline: "AUDIT 3 GIÂY ĐẦU TIÊN", subtitle: "Tắt tiếng · Nhìn 3s đầu xem mắt đang nhìn vào đâu"};
    return {headline: "GẠCH BỎ TÍN HIỆU THỪA", subtitle: "Lưu video để kiểm tra lại các video bán hàng của shop"};
  } else if (epId === "ep012") {
    if (second < 2.60) return {headline: "1 ĐỒNG NHỎ · SỐ 0 ĐẶC BIỆT", subtitle: "Cùng khoảng giảm sao số 0 lại có tiếng nói riêng?"};
    if (second < 7.70) return {headline: "THỬ ĐOÁN NHÉ: 1K vs 0 ĐỒNG", subtitle: "10K xuống 1K vs 9K xuống 0đ · Đều giảm đúng 9K"};
    if (second < 14.24) return {headline: "PHÉP TRỪ TOÁN HỌC: 9K = 9K?", subtitle: "Mắt dừng lâu ở chữ miễn phí · Tay nghiêng về số 0"};
    if (second < 23.80) return {headline: "GIÁ BẰNG 0 ≠ GIÁ THẤP BÌNH THƯỜNG", subtitle: "Não không làm phép trừ đơn giản · Đọc số 0 như món quà"};
    if (second < 35.16) return {headline: "NGHIÊN CỨU: ZERO-PRICE EFFECT", subtitle: "Cùng khoảng chênh nhưng giá bằng 0 đổi hoàn toàn lựa chọn"};
    if (second < 40.80) return {headline: "ĐỪNG BIẾN 'FREE' THÀNH CÁI BẪY", subtitle: "Nếu còn phí bắt buộc nói sớm · Giới hạn phải nói rõ"};
    if (second < 46.28) return {headline: "MINH BẠCH NGAY TỪ ĐẦU", subtitle: "Đừng bắt khách đi hết checkout mới phát hiện điều kiện"};
    return {headline: "AUDIT LẠI CHỮ MIỄN PHÍ", subtitle: "Lưu video để kiểm tra mọi điều kiện ưu đãi của bạn"};
  }

  if (epId === "ep011") {
    if (second < 3.96) return {headline: "CHƯA MUA · TAY KHÔNG MUỐN BUÔNG", subtitle: "Cầm thử 10 giây sao tự nhiên khó đặt xuống?"};
    if (second < 9.36) return {headline: "CẦM LÊN · BÓP NHẸ 1 CÁI", subtitle: "Tự nhiên tay chậm lại khi chuẩn bị đặt xuống"};
    if (second < 13.56) return {headline: "CHƯA MUA · NHƯNG BỚT XA LẠ", subtitle: "Cảm giác sở hữu tâm lý bắt đầu hình thành"};
    if (second < 21.76) return {headline: "TAY BIẾT THỨ MẮT KHÔNG THẤY", subtitle: "Độ mềm · Texture · Trọng lượng · Nhiệt độ"};
    if (second < 30.36) return {headline: "NGHIÊN CỨU: MERE-TOUCH EFFECT", subtitle: "Chỉ riêng việc chạm làm tăng cảm giác sở hữu"};
    if (second < 36.44) return {headline: "ONLINE KHÔNG CÓ XÚC GIÁC", subtitle: "Đừng chỉ quay quanh hộp rồi bảo “mềm lắm”"};
    if (second < 43.96) return {headline: "QUAY POV THAO TÁC 10 GIÂY", subtitle: "Ấn nệm · Kéo vải · Gập túi · Tiếng nắp đóng"};
    return {headline: "THIẾT KẾ THAO TÁC CHẠM", subtitle: "Lưu video để quay thử thao tác chạm cho shop"};
  }

  if (epId === "ep009") {
    if (second < 3.48) return {headline: "CÙNG 229K · KHÁC CẢM GIÁC", subtitle: "Cùng tổng tiền, sao hiện phí muộn lại khó chịu?"};
    if (second < 8.90) return {headline: "THỬ ĐOÁN NHÉ: TRÁI vs PHẢI", subtitle: "Bên trái: 229 nghìn đã gồm giao hàng"};
    if (second < 13.46) return {headline: "BÊN PHẢI: 199K + 30K PHÍ SHIP", subtitle: "Gần tới thanh toán: Bụp, cộng thêm 30K"};
    if (second < 19.24) return {headline: "TỔNG TIỀN Y HỆT NHAU", subtitle: "Ủa, nãy giờ 199K chưa phải giá thật à?"};
    if (second < 26.40) return {headline: "GIÁ ĐẦU TIÊN LÀM MỐC KỲ VỌNG", subtitle: "Não đã ghim mốc giá, phí muộn buộc phải tính lại"};
    if (second < 32.64) return {headline: "CHIẾN LƯỢC GIÁ TÁCH PHẦN", subtitle: "Nghiên cứu Partitioned Pricing & Phụ phí rõ ràng"};
    if (second < 35.02) return {headline: "ĐỪNG VỘI KẾT LUẬN", subtitle: "Không nhất thiết phải miễn phí giao hàng"};
    if (second < 42.50) return {headline: "NÓI SỚM CHI PHÍ BẮT BUỘC", subtitle: "Đừng để checkout thành màn jumpscare tài chính"};
    return {headline: "AUDIT CHECKOUT CỦA BẠN", subtitle: "Lưu video để kiểm tra trải nghiệm thanh toán của shop"};
  }

  if (epId === "ep010") {
    if (second < 2.70) return {headline: "QUẦY 24 VỊ vs 6 VỊ · NGHỊCH LÝ", subtitle: "Nhiều vị hơn sao khách lại dễ bỏ đi?"};
    if (second < 6.58) return {headline: "BẠN ĐOÁN NHÉ: 24 HAY 6?", subtitle: "Quầy nào dễ khiến khách chốt đơn hơn?"};
    if (second < 8.78) return {headline: "HÚT MẮT CHƯA CHẮC DỄ CHỌN", subtitle: "Ai cũng dừng lại xem nhưng chưa chắc mua"};
    if (second < 13.04) return {headline: "MÂU THUẪN: SỢ CHỌN NHẦM", subtitle: "Tự so 24 vị làm não bộ quá tải phân vân"};
    if (second < 16.56) return {headline: "1 MÓN MỚI = THÊM 1 SO SÁNH", subtitle: "Nhiều lựa chọn biến thành nhiều việc phải làm"};
    if (second < 21.04) return {headline: "NGHIÊN CỨU 24 VỊ vs 6 VỊ", subtitle: "Thí nghiệm tâm lý hành vi mua sắm kinh điển"};
    if (second < 26.26) return {headline: "DỪNG LẠI (60%) vs MUA (3%)", subtitle: "Quầy 6 vị có tỷ lệ mua cao gấp 10 lần (30%)"};
    if (second < 30.49) return {headline: "KHÔNG CẦN XÓA SẢN PHẨM", subtitle: "Bài học nằm ở cách tổ chức danh mục"};
    if (second < 36.04) return {headline: "GOM THÀNH 3 LỐI VÀO", subtitle: "Mới dùng lần đầu · Giải pháp nhanh · Chuyên sâu"};
    if (second < 40.12) return {headline: "CHỌN NHU CẦU TRƯỚC · CHỌN MÓN SAU", subtitle: "Xóa tan cảm giác căng thẳng làm bài thi"};
    return {headline: "TỔ CHỨC LẠI DANH MỤC CỦA BẠN", subtitle: "Lưu video để gom sản phẩm theo 3 nhóm nhu cầu"};
  }

  if (epId === "ep008") {
    if (second < 5.50) return {headline: "CÙNG MỘT KIỆN HÀNG · 2 SỐ PHẬN", subtitle: "Bóc vội rồi vứt rác vs Dựng máy quay unboxing"};
    if (second < 10.58) return {headline: "BÍ MẬT DẢI BĂNG XÉ ĐỎ", subtitle: "Chi tiết nhỏ chạy ngang thân hộp carton kraft"};
    if (second < 14.02) return {headline: "CASE STUDY: GLOSSIER · COOLMATE", subtitle: "Thương hiệu D2C hàng đầu không quấn băng dính dày"};
    if (second < 17.56) return {headline: "RÀO CẢN DAO KÉO & BĂNG DÍNH", subtitle: "Rạch từng lớp băng dính chằng chịt đầy ức chế"};
    if (second < 22.06) return {headline: "ĐỪNG DẬP TẮT SỰ HÁO HỨC", subtitle: "Rủi ro rạch sâu làm trầy xước sản phẩm bên trong"};
    if (second < 26.66) return {headline: "TRẢI NGHIỆM XÚC GIÁC THỎA MÃN", subtitle: "Chỉ một cú giật nhẹ · Tiếng xoẹt giòn tan vang lên"};
    if (second < 31.86) return {headline: "HỘP TỰ ĐỘNG BUNG MỞ", subtitle: "Không tốn chút sức lực · Mãn nhãn từng chi tiết"};
    if (second < 34.44) return {headline: "KÍCH HOẠT HORMONE PHẦN THƯỞNG", subtitle: "Cảm giác kiểm soát & âm thanh đã tai kích thích dopamine"};
    if (second < 38.56) return {headline: "TỰ NGUYỆN QUAY CLIP MỞ HỘP", subtitle: "Trải nghiệm quá mượt mà thôi thúc khách chia sẻ"};
    if (second < 44.06) return {headline: "BẮT ĐẦU TỪ GIÂY ĐẦU CHẠM HỘP", subtitle: "Trải nghiệm thương hiệu không bắt đầu khi dùng đồ"};
    if (second < 49.10) return {headline: "BÀI TEST MỞ HỘP DƯỚI 5 GIÂY", subtitle: "Tự đặt đơn về nhà và bấm giờ kiểm tra"};
    return {headline: "TỐI ƯU TRẢI NGHIỆM ĐÓNG GÓI", subtitle: "Lưu video để kiểm tra lại khâu đóng gói của bạn"};
  }

  if (epId === "ep006") {
    if (second < 2.80) return {headline: "CỐC BỊ VỨT · TÚI ĐƯỢC GIỮ", subtitle: "Nghịch lý sau một lần mua hàng"};
    if (second < 5.32) return {headline: "CÙNG MUA Ở MỘT QUÁN", subtitle: "Không hẳn vì chiếc túi đẹp hơn"};
    if (second < 9.90) return {headline: "VẪN CÒN VIỆC ĐỂ LÀM", subtitle: "Hôm nay đựng nước · ngày mai đựng quà"};
    if (second < 15.84) return {headline: "MUA Ở ĐÂU VẬY?", subtitle: "Thương hiệu xuất hiện thêm một lần"};
    if (second < 21.56) return {headline: "ĐIỂM CHẠM SAU BÁN", subtitle: "Sống lâu hơn một giao dịch"};
    if (second < 28.14) return {headline: "HỮU ÍCH · ĐỦ ĐẸP · KỶ NIỆM", subtitle: "Logo lớn không bằng lý do giữ lại"};
    if (second < 33.50) return {headline: "THIẾT KẾ THỨ SỐNG TIẾP", subtitle: "Đừng chỉ thiết kế khoảnh khắc khách mua"};
    if (second < 43.74) return {headline: "NGÀY MAI, KHÁCH CÒN GIỮ GÌ?", subtitle: "Bắt đầu từ đúng một món"};
    return {headline: "KIỂM TRA TRẢI NGHIỆM SAU BÁN", subtitle: "Lưu video để kiểm tra trải nghiệm sau bán"};
  }

  // Default / EP007
  if (second < 3.52) return {headline: "CÙNG MUA 8 LY · 2 SỐ PHẬN", subtitle: "Nghịch lý sau hai chiếc thẻ tích điểm"};
  if (second < 7.10) return {headline: "BỊ VỨT BỎ vs ĐƯỢC GIỮ GÌN", subtitle: "Thẻ 8 ô trắng trơn vs Thẻ 10 ô có sẵn 2 dấu"};
  if (second < 13.78) return {headline: "THẺ 8 Ô TRẮNG vs THẺ 10 Ô", subtitle: "Đóng sẵn 2 con dấu đỏ khi trao tay"};
  if (second < 19.98) return {headline: "TOÁN HỌC: 8 = 8?", subtitle: "Cùng mua 8 ly, sao kết quả quay lại gấp đôi?"};
  if (second < 24.30) return {headline: "HIỆU ỨNG TIẾN ĐỘ MỤC TIÊU", subtitle: "Bắt đầu từ số 0 giống như leo núi"};
  if (second < 31.16) return {headline: "ĐÃ ĐI ĐƯỢC 20% CHẶNG ĐƯỜNG", subtitle: "Tâm lý sợ lãng phí nỗ lực có sẵn"};
  if (second < 37.20) return {headline: "CẢM GIÁC LÀ NGƯỜI CHIẾN THẮNG", subtitle: "Khách trung thành vì cảm giác thành tựu"};
  if (second < 40.72) return {headline: "ĐỪNG BẮT ĐẦU TỪ SỐ 0", subtitle: "Hãy trao cho khách một tiến độ có sẵn"};
  if (second < 46.54) return {headline: "TẶNG TIẾN ĐỘ KHỞI ĐỘNG", subtitle: "Tặng ngay 20 điểm chào mừng trên ứng dụng"};
  return {headline: "KIỂM TRA TRẢI NGHIỆM GIỮ KHÁCH", subtitle: "Lưu video để kiểm tra trải nghiệm giữ chân khách"};
};

// Continuous Mascot Stopmotion with narrative emotion progression (0.35s/frame animation)
const getMascotAt = (second: number, episodeId?: string) => {
  const epId = (episodeId || "").toLowerCase();

  let name = "thinking";
  if (epId === "ep013") {
    if (second < 3.78) name = "thinking";          // Cùng một máy xay · 2 cách đặt
    else if (second < 14.00) name = "confuse";     // 1 bên gọn gàng · 1 bên quá tải
    else if (second < 25.56) name = "pointing";    // Đừng bắt khách tự lọc tín hiệu
    else if (second < 36.00) name = "research";    // Nghiên cứu: Processing fluency
    else if (second < 43.82) name = "happy";       // 1 khung hình · 1 việc chính
    else if (second < 48.74) name = "working";     // Audit 3 giây đầu tiên
    else name = "thumbup";                         // Gạch bỏ tín hiệu thừa
  } else if (epId === "ep012") {
    if (second < 2.60) name = "thinking";          // 1 đồng nhỏ · Số 0 đặc biệt
    else if (second < 7.70) name = "thinking";     // Thử đoán nhé: 1K vs 0 đồng
    else if (second < 14.24) name = "confuse";     // Phép trừ toán học: 9K = 9K?
    else if (second < 23.80) name = "happy";       // Giá bằng 0 ≠ Giá thấp bình thường
    else if (second < 35.16) name = "research";    // Nghiên cứu: Zero-price effect
    else if (second < 40.80) name = "pointing";    // Đừng biến free thành cái bẫy
    else if (second < 46.28) name = "working";     // Minh bạch ngay từ đầu
    else name = "thumbup";                         // Audit lại chữ miễn phí
  } else if (epId === "ep011") {
    if (second < 3.96) name = "thinking";          // Chưa mua · Tay không muốn buông
    else if (second < 9.36) name = "happy";        // Cầm lên · Bóp nhẹ 1 cái
    else if (second < 13.56) name = "confuse";     // Chưa mua · Nhưng bớt xa lạ
    else if (second < 21.76) name = "research";    // Tay biết thứ mắt không thấy
    else if (second < 30.36) name = "research";    // Nghiên cứu: Mere-touch effect
    else if (second < 36.44) name = "pointing";    // Online không có xúc giác
    else if (second < 43.96) name = "working";     // Quay POV thao tác 10 giây
    else name = "thumbup";                         // Thiết kế thao tác chạm
  } else if (epId === "ep009") {
    if (second < 3.48) name = "thinking";          // Cùng 229k · Khác cảm giác
    else if (second < 8.90) name = "confuse";      // Thử đoán nhé: Trái vs Phải
    else if (second < 13.46) name = "scare";       // Bên phải: 199k + 30k phí ship
    else if (second < 19.24) name = "confuse";     // Tổng tiền y hệt nhau (Ủa nãy giờ chưa phải giá thật à?)
    else if (second < 26.40) name = "research";    // Giá đầu tiên làm mốc kỳ vọng
    else if (second < 32.64) name = "research";    // Chiến lược giá tách phần
    else if (second < 35.02) name = "pointing";    // Đừng vội kết luận
    else if (second < 42.50) name = "working";     // Nói sớm chi phí bắt buộc
    else name = "thumbup";                         // Audit checkout của bạn
  } else if (epId === "ep010") {
    if (second < 2.70) name = "thinking";          // Quầy 24 vị vs 6 vị · Nghịch lý
    else if (second < 6.58) name = "thinking";     // Bạn đoán nhé: 24 hay 6?
    else if (second < 8.78) name = "happy";        // Hút mắt chưa chắc dễ chọn
    else if (second < 13.04) name = "confuse";     // Mâu thuẫn: sợ chọn nhầm
    else if (second < 16.56) name = "scare";       // 1 món mới = thêm 1 so sánh
    else if (second < 21.04) name = "research";    // Nghiên cứu 24 vị vs 6 vị
    else if (second < 26.26) name = "research";    // Dừng lại 60% vs Mua 3%
    else if (second < 30.49) name = "pointing";    // Không cần xóa sản phẩm
    else if (second < 36.04) name = "working";     // Gom thành 3 lối vào
    else if (second < 40.12) name = "happy";       // Chọn nhu cầu trước · Chọn món sau
    else name = "thumbup";                         // Tổ chức lại danh mục
  } else if (epId === "ep008") {
    if (second < 5.50) name = "thinking";          // Cùng một kiện hàng · 2 số phận
    else if (second < 10.58) name = "research";    // Bí mật dải băng xé đỏ
    else if (second < 14.02) name = "pointing";    // Case study: Glossier · Coolmate
    else if (second < 17.56) name = "confuse";     // Rào cản dao kéo & băng dính
    else if (second < 22.06) name = "scare";       // Đừng dập tắt sự háo hức (rủi ro trầy xước)
    else if (second < 26.66) name = "happy";       // Trải nghiệm xúc giác thỏa mãn (xoẹt giòn tan)
    else if (second < 31.86) name = "thumbup";     // Hộp tự động bung mở
    else if (second < 34.44) name = "happy";       // Kích hoạt hormone phần thưởng
    else if (second < 38.56) name = "working";     // Tự nguyện quay clip mở hộp
    else if (second < 44.06) name = "pointing";    // Bắt đầu từ giây đầu chạm hộp
    else if (second < 49.10) name = "working";     // Bài test mở hộp dưới 5 giây
    else name = "thumbup";                         // Tối ưu trải nghiệm đóng gói
  } else if (epId === "ep006") {
    if (second < 2.80) name = "thinking";
    else if (second < 5.32) name = "confuse";
    else if (second < 9.90) name = "research";
    else if (second < 15.84) name = "happy";
    else if (second < 21.56) name = "pointing";
    else if (second < 28.14) name = "thumbup";
    else if (second < 33.50) name = "working";
    else if (second < 43.74) name = "pointing";
    else name = "thumbup";
  } else {
    // Default / EP007
    if (second < 3.52) name = "thinking";
    else if (second < 7.10) name = "scare";
    else if (second < 13.78) name = "research";
    else if (second < 19.98) name = "thinking";
    else if (second < 24.30) name = "pointing";
    else if (second < 31.16) name = "happy";
    else if (second < 37.20) name = "thumbup";
    else if (second < 40.72) name = "pointing";
    else if (second < 46.54) name = "working";
    else name = "thumbup";
  }

  // 0.35s per frame animation (6 frames: 0 to 5)
  const frameIndex = Math.floor(second / 0.35) % 6;
  return {name, frameIndex};
};

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
  const shared = {
    background: tokens.surface,
    color: tokens.text,
    border: `3px solid ${tokens.border}`,
    boxShadow: `0 10px 0 ${tokens.shadow}`
  };

  // Ensure generous lineHeight (1.32) so Vietnamese diacritics never overlap
  if (template === "label" && direct) {
    const fontSize = text.length <= 2 ? 180 : compact ? 34 : text.length > 18 ? 38 : text.length > 10 ? 46 : 52;
    return (
      <div
        style={{
          maxWidth: 420,
          color: tokens.text,
          fontFamily: "'SVN-Miller Banner', Georgia, serif",
          fontSize,
          fontWeight: 900,
          lineHeight: 1.32,
          letterSpacing: "0.02em",
          textAlign: "center",
          textWrap: "balance",
          whiteSpace: "pre-wrap"
        }}
      >
        {text}
      </div>
    );
  }

  if (template === "chart") {
    return (
      <div style={{...shared, width: 380, height: 280, borderRadius: 24, padding: 26, display: "flex", alignItems: "flex-end", gap: 18}}>
        {[42, 68, 94, 58].map((height, index) => (
          <div key={index} style={{height: `${height}%`, flex: 1, background: index === 2 ? tokens.accentA : tokens.accentB, borderRadius: "12px 12px 4px 4px"}} />
        ))}
      </div>
    );
  }

  if (template === "checklist") {
    return (
      <div style={{...shared, width: 440, borderRadius: 24, padding: 30, fontSize: 30, lineHeight: 1.5, fontFamily: "'SVN-Nexa Light', sans-serif"}}>
        {text.split("+").map((line) => (
          <div key={line}>✓ {line.trim()}</div>
        ))}
      </div>
    );
  }

  if (["menu", "price-board", "interface"].includes(template)) {
    return (
      <div style={{...shared, width: compact ? 260 : 440, minHeight: 240, borderRadius: 22, padding: 28, fontSize: compact ? 25 : 34, fontWeight: 800, lineHeight: 1.35, whiteSpace: "pre-wrap", fontFamily: "'SVN-Nexa Light', sans-serif"}}>
        {text}
      </div>
    );
  }

  const background = template === "warning" ? tokens.accentB : template === "button" ? tokens.accentA : tokens.surface;
  const color = template === "button" ? tokens.surface : tokens.text;
  const fontSize = template === "metric" ? 76 : compact ? 28 : text.length > 20 ? 34 : 40;

  return (
    <div
      style={{
        ...shared,
        minWidth: compact ? 160 : 260,
        maxWidth: compact ? 240 : 440,
        padding: compact ? "18px 18px" : "24px 34px",
        borderRadius: template === "button" ? 18 : 999,
        background,
        color,
        fontSize,
        fontWeight: 900,
        lineHeight: 1.32,
        letterSpacing: "0.015em",
        textAlign: "center",
        whiteSpace: "pre-wrap",
        fontFamily: template === "button" ? "'SVN-Nexa Light', sans-serif" : "'SVN-Miller Banner', serif"
      }}
    >
      {text}
    </div>
  );
};

const VisualItemLayer = ({item, asset, itemCount, tokens, cue, continuous}: {item: VisualItem; asset?: MediaAsset; itemCount: number; tokens: StyleTokens; cue: VisualCue; continuous: boolean}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enterMs = Number.isFinite(item.enterMs) ? item.enterMs : cue.startMs;
  const local = frame - msToFrame(enterMs, fps);
  if (local < 0) return null;
  const easing = Easing.bezier(0.16, 1, 0.3, 1);
  const opacity = interpolate(local, [0, 5], [0, 1], {easing, extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const scale = item.motion === "pop" || item.motion === "stamp" ? interpolate(local, [0, 8], [0.78, 1], {easing, extrapolateLeft: "clamp", extrapolateRight: "clamp", output: "perceptual-scale"}) : 1;
  const translate = item.motion === "slide" ? interpolate(local, [0, 9], ["0px 36px", "0px 0px"], {easing, extrapolateLeft: "clamp", extrapolateRight: "clamp"}) : "0px 0px";
  const cueStartFrame = msToFrame(Math.max(cue.startMs, enterMs), fps);
  const cueEndFrame = Math.max(cueStartFrame + 1, msToFrame(cue.endMs, fps));
  const transformProgress = interpolate(frame, [cueStartFrame, cueEndFrame], [0, 1], {easing: item.transform?.easing === "linear" ? Easing.linear : item.transform?.easing === "spring" ? Easing.bezier(0.22, 1.35, 0.36, 1) : easing, extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const from = item.transform?.from ?? {x: 0, y: 0, scale: 1, rotation: 0, opacity: 1};
  const to = item.transform?.to ?? from;
  const stageX = interpolate(transformProgress, [0, 1], [from.x, to.x]);
  const stageY = interpolate(transformProgress, [0, 1], [from.y, to.y]);
  const stageScale = interpolate(transformProgress, [0, 1], [from.scale, to.scale]);
  const stageRotation = interpolate(transformProgress, [0, 1], [from.rotation, to.rotation]);
  const stageOpacity = interpolate(transformProgress, [0, 1], [from.opacity, to.opacity]);

  // Differentiated stop-motion paper float/wiggle:
  // Image stickers: slow step (every 16 frames = 0.53s) with medium organic jitter
  // Text descriptions: extra slow step (every 36 frames = 1.2s) with gentle subtle jitter for maximum readability
  const isAsset = item.kind === "asset";
  
  const stickerStep = Math.floor(frame / 16);
  const stickerRot = ((stickerStep * 7) % 5 - 2) * 0.7; // ~ +/- 1.4 deg
  const stickerX = ((stickerStep * 11) % 5 - 2) * 2.8;  // ~ +/- 5.6 px
  const stickerY = ((stickerStep * 13) % 5 - 2) * 2.4;  // ~ +/- 4.8 px

  const textStep = Math.floor(frame / 36);
  const textRot = ((textStep * 7) % 5 - 2) * 0.2;       // ~ +/- 0.4 deg (very steady)
  const textX = ((textStep * 11) % 5 - 2) * 1.0;        // ~ +/- 2.0 px
  const textY = ((textStep * 13) % 5 - 2) * 0.8;        // ~ +/- 1.6 px

  const wiggleRot = isAsset ? stickerRot : textRot;
  const wiggleX = isAsset ? stickerX : textX;
  const wiggleY = isAsset ? stickerY : textY;

  // Proportional sizing so items are large and punchy, and 2 items never overlap
  const width = itemCount === 1 ? 720 : itemCount === 2 ? 430 : 280;
  const height = itemCount === 1 ? 600 : itemCount === 2 ? 480 : 380;

  return (
    <div
      style={{
        position: continuous ? "absolute" : undefined,
        left: continuous ? "50%" : undefined,
        top: continuous ? "50%" : undefined,
        marginLeft: continuous ? -width / 2 : undefined,
        marginTop: continuous ? -height / 2 : undefined,
        width,
        height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: continuous ? opacity * stageOpacity : opacity,
        transform: continuous ? `translate3d(${stageX + wiggleX}px, ${stageY + wiggleY}px, 0) scale(${stageScale}) rotate(${stageRotation + wiggleRot}deg)` : undefined,
        scale: continuous ? undefined : scale,
        translate: continuous ? undefined : translate,
        willChange: "transform, opacity"
      }}
    >
      {item.kind === "asset" && asset && asset.stickerTreatment !== "legacy-precut" ? (
        <TornSticker variant={itemCount} sourceSrc={staticFile(asset.src)} accent={tokens.accentA}>
          <Img
            src={staticFile(asset.src)}
            alt={asset.alt}
            style={{maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 12px rgba(23,21,19,.12))"}} />
        </TornSticker>
      ) : item.kind === "asset" && asset ? (
        <Img src={staticFile(asset.src)} alt={asset.alt} style={{maxWidth: "100%", maxHeight: "100%", objectFit: "contain", filter: "drop-shadow(0 10px 14px rgba(94,35,53,.14))"}} />
      ) : (
        <CodeVisual template={item.codeTemplate} text={item.text} compact={itemCount === 3} tokens={tokens} direct={continuous && item.semanticRole !== "evidence"} />
      )}
    </div>
  );
};

export const CreatorFlowVideo = ({episode, profile, captionData, wordData}: {episode: Episode; profile: CreatorProfile; captionData?: Caption[]; wordData?: Caption[]}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const now = (frame / fps) * 1000;
  const second = frame / fps;
  const cue = episode.schemaVersion === 2 ? episode.visualCues.find((item) => now >= item.startMs && now < item.endMs) ?? episode.visualCues[episode.visualCues.length - 1] : legacyCue(episode, now);
  const tokens = styles[profile.style.preset];
  const seriesLabel = profile.seriesLabel || profile.channelName || profile.brand.name || profile.projectName;
  const footerLeft = profile.brand.footerLeft || profile.brand.promise;
  const footerRight = profile.brand.footerRight || profile.style.vibe;
  const assetMap = new Map(episode.assets.map((asset) => [asset.id, asset]));
  const continuous = episode.schemaVersion === 2;
  const cueProgress = interpolate(now, [cue.startMs, cue.endMs], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
  const cameraAmount = cue.camera?.intensity === "medium" ? 0.08 : 0.045;
  const cameraScale = cue.camera?.mode === "push-in" || cue.camera?.mode === "follow" ? 1 + cueProgress * cameraAmount : cue.camera?.mode === "pull-out" ? 1 + (1 - cueProgress) * cameraAmount : cue.transition === "zoom-through" ? 1 + cueProgress * 0.14 : 1;
  const cameraX = cue.camera?.mode === "pan" ? interpolate(cueProgress, [0, 1], [-35, 35]) : 0;
  const reveal = cue.transition === "mask-reveal" ? interpolate(cueProgress, [0, 0.22], [0, 100], {extrapolateRight: "clamp"}) : 100;
  const sfxEvents = episode.schemaVersion === 2 
    ? episode.visualCues.flatMap((cue) => 
        (cue.items || [])
          .filter((item) => item.sfx && sfxFiles[item.sfx])
          .map((item) => ({
            ...item,
            enterMs: Number.isFinite(item.enterMs) ? item.enterMs : cue.startMs,
          }))
      )
    : [];

  // Stop-motion background texture cycling every 0.5s (15 frames @ 30fps)
  const bgHoldSeconds = profile.production.backgroundFrameHoldSeconds ?? 0.5;
  const bgIndex = (Math.floor(second / bgHoldSeconds) % 3) + 1;

  // Dynamic Headline (SVN-Miller Banner) + Subtitle (SVN-Nexa Light)
  const storyTitle = getStoryTitleAt(second, episode.id || episode.episodeId);

  // Continuous Mascot with narrative emotion progression (0.35s/frame animation)
  const mascot = getMascotAt(second, episode.id || episode.episodeId);

  return (
    <AbsoluteFill
      style={{
        background: tokens.background,
        color: tokens.text,
        fontFamily: "'SVN-Nexa Light', Arial, sans-serif",
        overflow: "hidden"
      }}>
      <FontStyles />
      {/* 1. Stop-motion textured paper background cycling every 0.5s */}
      <Img
        src={staticFile(`background/bg${bgIndex}.png`)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.85
        }} />
      {/* Editorial grid overlay */}
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(242,47,104,.032) 1px, transparent 1px), linear-gradient(90deg, rgba(242,47,104,.032) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          opacity: 0.75
        }} />
      {/* 2. Top Bar */}
      <div
        style={{
          position: "absolute",
          top: 135,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid rgba(24, 20, 22, 0.08)",
          paddingBottom: 14,
          zIndex: 20,
          pointerEvents: "none"
        }}
      >
        <div style={{fontWeight: 800, fontSize: 22, letterSpacing: 2, color: tokens.muted, fontFamily: "'SVN-Miller Banner', serif"}}>
          {seriesLabel}
        </div>
        <div style={{fontSize: 20, fontWeight: 900, color: tokens.accentA, letterSpacing: 3, fontFamily: "'SVN-Nexa Light', sans-serif"}}>
          {(episode.id || episode.episodeId || "EP008").toUpperCase()}
        </div>
      </div>
      {/* 3. Main Headline (SVN-Miller Banner) & Subtitle (SVN-Nexa Light) */}
      <div
        style={{
          position: "absolute",
          top: 325,
          left: 60,
          right: 60,
          textAlign: "center",
          zIndex: 15,
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div
          style={{
            fontFamily: "'SVN-Miller Banner', Georgia, serif",
            fontSize: 52,
            lineHeight: 1.16,
            fontWeight: 900,
            color: tokens.text,
            letterSpacing: "0.015em",
            maxWidth: 920,
            textWrap: "balance"
          }}
        >
          {storyTitle.headline}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: "'SVN-Nexa Light', Arial, sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: tokens.accentA,
            letterSpacing: "0.04em",
            textTransform: "uppercase"
          }}
        >
          {storyTitle.subtitle}
        </div>
      </div>
      {/* 4. Central Stage (Visual Items & Cutouts) */}
      <div
        style={{
          position: "absolute",
          top: 505,
          left: continuous ? 0 : 80,
          right: continuous ? 0 : 80,
          height: 640,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: continuous ? `translate3d(${cameraX}px, 0, 0) scale(${cameraScale})` : undefined,
          clipPath: continuous ? `inset(0 ${100 - reveal}% 0 0)` : undefined,
          transformOrigin: "center center",
          willChange: "transform, clip-path",
          zIndex: 10
        }}
      >
        {cue.items.map((item) => (
          <VisualItemLayer key={item.id} item={item} asset={item.assetId ? assetMap.get(item.assetId) : undefined} itemCount={cue.items.length} tokens={tokens} cue={cue} continuous={continuous} />
        ))}
      </div>
      {/* 5. Captions in Safe Zone */}
      {episode.audio.voiceSrc && <Captions tokens={tokens} top={profile.production.captionTop ?? 1160} captions={captionData} words={wordData} />}
      {/* 6. Continuous Mascot Stopmotion (0.35s/frame animation) */}
      <div
        style={{
          position: "absolute",
          top: 1290,
          left: "50%",
          transform: "translateX(-50%)",
          width: 320,
          height: 360,
          zIndex: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none"
        }}
      >
        <Img
          src={staticFile(`mascot/frames/${mascot.name}/frame_${mascot.frameIndex}.png`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 14px 16px rgba(94, 35, 53, 0.18))"
          }} />
      </div>
      {/* 7. Footer Rails */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 60,
          display: "flex",
          justifyContent: "space-between",
          color: tokens.muted,
          fontSize: 20,
          letterSpacing: 1.5,
          fontFamily: "'SVN-Nexa Light', sans-serif",
          opacity: 0.85
        }}
      >
        <span>{footerLeft}</span>
        <span>{footerRight}</span>
      </div>
      {/* 8. SFX & Audio Layers */}
      {sfxEvents.map((item, idx) => (
        <Sequence
          key={`${item.id}-${item.enterMs}-${idx}`}
          from={msToFrame(item.enterMs, fps)}
          durationInFrames={Math.max(1, Math.round(fps * 0.5))}
          layout="none">
          <Audio src={staticFile(sfxFiles[item.sfx!])} volume={0.45} />
        </Sequence>
      ))}
      {episode.audio.musicSrc && (
        <Audio
          src={staticFile(episode.audio.musicSrc)}
          loop
          volume={(audioFrame) => {
            const vol = Number.isFinite(episode.audio?.musicVolume) ? episode.audio.musicVolume : 0.22;
            return interpolate(audioFrame, [0, 20, Math.max(21, durationInFrames - 25), durationInFrames - 1], [0, vol, vol, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"});
          }}
        />
      )}
      {episode.audio.voiceSrc && (
        <Audio
          src={staticFile(episode.audio.voiceSrc)}
          volume={() => Number.isFinite(episode.audio?.voiceVolume) ? episode.audio.voiceVolume : 1.0}
        />
      )}
    </AbsoluteFill>
  );
};
