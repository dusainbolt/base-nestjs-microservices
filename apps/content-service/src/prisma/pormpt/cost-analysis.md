# BÀI TOÁN CHI PHÍ SINH NỘI DUNG (AI CONTENT GENERATION)

Tài liệu này dùng để ước tính chi phí và so sánh giữa các Model/Platform AI khi thực hiện sinh dữ liệu bài tập (Exercise Packs) cho hệ thống English Pedagogical.

---

## 1. THỐNG KÊ DỮ LIỆU ĐẦU VÀO & ĐẦU RA (ƯỚC TÍNH)

Dựa trên cấu trúc chuẩn của 1 Level:
- **Số lượng Pack:** 20 - 25 packs.
- **Số lượng Exercise/Pack:** 5 bài tập.
- **Tổng số bài tập/Level:** 100 - 125 bài tập.

### Ước tính Token (Dựa trên thực tế file JSON Level 1):
- **Input (Prompt + Context):** ~800 - 1,000 tokens (Bao gồm System role, Topic Description, Level Rules).
- **Output (JSON Data):**
    - 1 Exercise: ~150 - 200 tokens (Bao gồm: `previousPrompt`, `myPrompt`, `levelHint`, `sampleAnswer`).
    - 1 Pack (5 bài tập): ~800 - 1,000 tokens.
    - **Tổng 1 Level (25 Packs):** ~20,000 - 25,000 tokens.

> [!IMPORTANT]
> Level 4 có câu trả lời dài hơn và câu ghép, dự kiến Output Token có thể tăng lên **30,000 - 35,000 tokens/level**.

---

## 2. BẢNG SO SÁNH CHI PHÍ (TẠM TÍNH TRÊN 1.000.000 TOKENS)

*Giá có thể thay đổi tùy theo chính sách của nhà cung cấp.*

| Model | Input ($/1M) | Output ($/1M) | Ước tính 1 Level (25 packs) | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **GPT-4o (OpenAI)** | $5.00 | $15.00 | ~$0.40 | Chất lượng cao, ổn định nhất. |
| **Claude 3.5 Sonnet** | $3.00 | $15.00 | ~$0.38 | Hiểu ngữ cảnh sư phạm cực tốt. |
| **Gemini 1.5 Pro** | $3.50 | $10.50 | ~$0.27 | Hỗ trợ Context Window lớn, hiếm khi drop JSON. |
| **Gemini 1.5 Flash** | **$0.075** | **$0.30** | **~$0.01** | **Rẻ nhất**, tốc độ cực nhanh, phù hợp cho Level 1-2. |
| **GPT-4o-mini** | $0.15 | $0.60 | ~$0.02 | Đối trọng của Gemini Flash, rất rẻ. |

---

## 3. CHI PHÍ CHO TOÀN BỘ PROJECT (ESTIMATION)

Giả sử hệ thống có:
- **100 Topics**
- Mỗi Topic có **4 Levels**
- Tổng cộng: **400 lần gọi AI**

| Chiến lược sử dụng Model | Ước tính tổng chi phí (400 Levels) | Nhận xét |
| :--- | :--- | :--- |
| **Premium (GPT-4o/Claude 3.5)** | ~$160.00 (4tr VND) | Chất lượng tuyệt đối, ít phải sửa tay. |
| **Hybrid (Level 1-2 dùng Flash, Level 3-4 dùng Pro)** | ~$40.00 - $60.00 (1.5tr VND) | Cân bằng giữa chi phí và chất lượng. |
| **Saving (Gemini Flash/GPT-4o-mini)** | **~$5.00 - $8.00 (200k VND)** | Rẻ kỷ lục, nhưng cần reviewer kỹ ở Level 4. |

---

## 4. KẾT LUẬN & ĐỀ XUẤT

1. **Giai đoạn R&D/Seed Data:** Nên dùng **Claude 3.5 Sonnet** hoặc **GPT-4o** để lấy bộ khung chuẩn nhất.
2. **Giai đoạn Scale (Tạo hàng loạt):**
   - Level 1 & 2: Dùng **Gemini 1.5 Flash** hoặc **GPT-4o-mini** để tiết kiệm 95% chi phí.
   - Level 3 & 4: Dùng **Gemini 1.5 Pro** để đảm bảo không bị mất dữ liệu (cắt JSON) do token dài.
3. **Lưu ý kỹ thuật:** Luôn sử dụng `response_format: { "type": "json_object" }` (nếu model hỗ trợ) để tránh tốn token cho các đoạn text giải thích không cần thiết.
