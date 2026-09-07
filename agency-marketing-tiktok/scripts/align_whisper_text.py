import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
captions_path = ROOT / "src/data/captions.json"

with open(captions_path, "r", encoding="utf-8") as f:
    captions = json.load(f)

# Exact clean script text corresponding to 14 segments of EP002 v03
correct_texts = [
  "Seeding comment cho kênh mới: đang tạo niềm tin, hay tự treo biển “đừng tin tôi”?",
  "Nhìn một dãy này nhé: “Hàng đẹp lắm”, “shop mười điểm”, “đã nhận hàng”. Cùng câu, cùng nhịp, cùng icon.",
  "Trông đông thật, nhưng giống một căn phòng chỉ có tiếng vọng. Và đây không chỉ là chuyện khách lướt qua.",
  "TikTok không cho phép mua bán dịch vụ bơm tương tác, hoặc hành vi cố đánh lừa hệ thống đề xuất.",
  "Nên đừng xem comment ảo là phao cứu kênh. Nhưng cũng đừng bỏ luôn phần comment.",
  "Thứ đáng giữ là câu hỏi thật. Trước khi đăng video, mở inbox, xem đánh giá, rồi hỏi đội bán hàng.",
  "Ghi lại ba điều khách hay lăn tăn:",
  "giá? dùng thế nào? có hợp với mình không?",
  "Ví dụ bán serum. Đừng thả mười comment “dùng thích lắm”. Hãy làm video trả lời: “Da dầu dùng có bí không?”",
  "Rồi nói rõ kết cấu, cách dùng và giới hạn của sản phẩm.",
  "Nếu đội ngũ muốn khơi mào hội thoại, dùng tài khoản thật, nói đúng vai trò, và trả lời bằng thông tin có ích.",
  "Không clone. Không lời khen copy-paste.",
  "Mẹo hôm nay: biến một câu hỏi thật thành hook; biến comment thành nơi giải đáp, không thành sân khấu.",
  "Seeding thông minh là mở lời thoại, không dựng màn kịch."
]

for idx, item in enumerate(captions):
    if idx < len(correct_texts):
        item["text"] = correct_texts[idx]

with open(captions_path, "w", encoding="utf-8") as f:
    json.dump(captions, f, ensure_ascii=False, indent=2)

print("Aligned EP002 v03 Whisper timestamps with official script text!")
