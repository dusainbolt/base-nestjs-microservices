# BÀI TOÁN CHI PHÍ SINH NỘI DUNG (AI CONTENT GENERATION)

Tài liệu này dùng để ước tính chi phí và so sánh giữa các Model/Platform AI khi thực hiện sinh dữ liệu bài tập (Exercise Packs) cho hệ thống English Pedagogical.

---

## 1. DỮ LIỆU THỰC TẾ ĐO ĐƯỢC (GPT-5 mini)

> Đây là số liệu **thực tế** từ batch sinh dữ liệu Level 1 — không phải ước tính.

| Chỉ số | Giá trị |
| :--- | :--- |
| **Số file JSON đã sinh** | 57 files |
| **Token/file (prompt + completion)** | ~8,500 – 12,000 tokens |
| **Token trung bình/file** | ~10,250 tokens |
| **Tổng token tiêu thụ (57 files)** | ~584,250 tokens |
| **Tổng chi phí thực tế** | **$1.33** |
| **Chi phí trung bình/file** | **~$0.023/file** |
| **Effective rate** | ~$2.28/1M tokens |

---

## 2. THỐNG KÊ CẤU TRÚC DỮ LIỆU (1 FILE JSON)

Mỗi file JSON Level 1 tương ứng 1 topic, gồm:
- **20 – 25 packs** mỗi topic
- **5 exercises/pack**
- **4 fields/exercise:** `p` (prompt), `m` (instruction VI), `h` (hint), `s` (sample answer)

### Phân bổ token ước tính trong 1 request:

| Phần | Token ước tính | Tỉ lệ |
| :--- | :--- | :--- |
| System prompt + topic context | ~1,000 – 1,500 | ~12% |
| Output JSON (25 packs × 5 exercises) | ~7,500 – 10,500 | ~88% |
| **Tổng** | **~8,500 – 12,000** | 100% |

> Output chiếm phần lớn chi phí — đây là đặc thù của task sinh JSON dài.

---

## 3. DỰ PHÓNG CHI PHÍ TOÀN DỰ ÁN

Giả sử hệ thống có **100 topics × 4 levels = 400 files**.

| Quy mô | Số file | Chi phí (GPT-5 mini) |
| :--- | :--- | :--- |
| Pilot (Level 1, 57 topics đã làm) | 57 | **$1.33** ✅ |
| Level 1 đầy đủ (100 topics) | 100 | ~$2.33 |
| 2 levels (100 topics × L1 + L2) | 200 | ~$4.67 |
| Full project (100 topics × 4 levels) | 400 | ~$9.33 |
| Mở rộng (250 topics × 4 levels) | 1,000 | ~$23.33 |

> **Kết luận:** Toàn bộ 400 file chỉ tốn khoảng **$9–10** (~230,000 VND). Cực kỳ tiết kiệm.

---

## 4. BẢNG SO SÁNH CHI PHÍ GIỮA CÁC MODEL

*Giá tham khảo — có thể thay đổi theo chính sách nhà cung cấp.*

| Model | Input ($/1M) | Output ($/1M) | Ước tính 1 file (10k token) | 400 files |
| :--- | :--- | :--- | :--- | :--- |
| **GPT-5 mini** ⭐ | ~$0.40 | ~$1.60 | **~$0.023** | **~$9.33** |
| GPT-4o-mini | $0.15 | $0.60 | ~$0.007 | ~$2.80 |
| GPT-4o | $5.00 | $15.00 | ~$0.14 | ~$56.00 |
| Claude 3.5 Sonnet | $3.00 | $15.00 | ~$0.14 | ~$56.00 |
| Gemini 1.5 Flash | $0.075 | $0.30 | ~$0.003 | ~$1.20 |
| Gemini 1.5 Pro | $3.50 | $10.50 | ~$0.10 | ~$40.00 |

> **GPT-5 mini** là điểm cân bằng tốt giữa chất lượng và chi phí — phù hợp cho Level 1–3. Số liệu thực tế đã xác nhận.

---

## 5. CHIẾN LƯỢC SỬ DỤNG MODEL ĐỀ XUẤT

| Giai đoạn | Model đề xuất | Lý do |
| :--- | :--- | :--- |
| **R&D / Thiết kế prompt** | GPT-4o / Claude Sonnet | Chất lượng cao nhất để định hình chuẩn nội dung |
| **Level 1 & 2 (scale)** | **GPT-5 mini** ✅ | Đã kiểm chứng thực tế, output tốt, giá ~$0.023/file |
| **Level 3 & 4** | GPT-5 mini hoặc GPT-4o | Level 3–4 có câu dài hơn, nên monitor chất lượng |
| **Re-generate / Fix lẻ** | GPT-5 mini | Rẻ, nhanh, đủ chất lượng cho fix nhỏ |

---

## 6. LƯU Ý KỸ THUẬT

- Luôn dùng `response_format: { "type": "json_object" }` để tránh tốn token cho text giải thích thừa.
- Batch 1 request = 1 file JSON (1 topic) — **không** tách nhỏ theo từng pack để tránh tốn overhead token cho system prompt lặp lại.
- Level 4 có `sampleAnswer` dài hơn (~2–3 câu ghép) → dự kiến token tăng lên **12,000 – 15,000/file**.
- Theo dõi `finish_reason` — nếu là `length` thay vì `stop` thì JSON bị cắt, cần tăng `max_tokens`.
