# Chiến lược Kinh doanh và Đào tạo (BA Documentation)

Tài liệu này ghi lại các quyết định chiến lược về mô hình kinh doanh (Monetization) và phương pháp sư phạm (Pedagogy) cho ứng dụng học giao tiếp Tiếng Anh.

> **Phạm vi:** Hệ thống vận hành với **3 Level**: Beginner (L1) → Elementary (L2) → Pre-Intermediate (L3).

---

## 1. Mô hình Kinh doanh: Nạp & Trừ Credit (Consumption-based)

Để đảm bảo khả năng sinh lời và bù đắp chi phí vận hành AI (Whisper STT, LLM scoring), hệ thống sử dụng mô hình trừ phí theo lượt sử dụng, phân thành **hai tầng dịch vụ độc lập**.

### 1.1. Hai tầng dịch vụ

**Tầng 1 — Transcript Only (mặc định khi chơi pack)**

Đây là dịch vụ cốt lõi: người dùng luyện nói theo chủ đề, hệ thống dùng Whisper STT chuyển giọng nói thành văn bản và trả lại transcript sau mỗi bài. Người dùng thấy được chính xác mình đã nói gì — không gọi scoring model, chi phí AI thấp.

- Luồng: Record → Whisper STT → Hiện transcript → Next bài
- Áp dụng cho tất cả các bài trong pack (bài 1 đến bài N)
- Phí: theo cấp độ Level (xem 1.2)

**Tầng 2 — AI Feedback (tùy chọn, sau khi hoàn thành pack)**

Sau khi hoàn thành toàn bộ pack, người dùng có thể chọn nhận đánh giá chuyên sâu từ AI. Hệ thống gộp toàn bộ transcript của pack và gửi một lần duy nhất cho scoring model, trả về điểm số + feedback chi tiết từng bài.

- Kích hoạt: user nhấn "Nhận đánh giá AI" ở màn hình Pack Complete
- Phí bổ sung: **5 credit / pack** (bất kể level)
- Chi tiết scoring & feedback: xem `08-scoring-feedback-design.md`

> **Rationale:** Tách 2 tầng giúp người dùng mới trải nghiệm ngay giá trị cốt lõi (luyện nói + xem transcript) với chi phí thấp, trong khi người dùng muốn cải thiện chất lượng có thể nâng cấp lên AI feedback khi cần.

---

### 1.2. Phân cấp chi phí theo Level (Transcript Only)

| Cấp độ (Level) | Code             | Độ dài / Độ phức tạp      | Phí Credit (💎) | Ghi chú                                    |
| :------------- | :--------------- | :------------------------ | :-------------: | :----------------------------------------- |
| **Level 1**    | BEGINNER         | Câu đơn, 1 ý (~20–30s)    |      **5**      | Entry point — chi phí Whisper thấp nhất.   |
| **Level 2**    | ELEMENTARY       | 2 câu liên tiếp (~30–45s) |      **7**      | Nội dung dài hơn, Whisper xử lý nhiều hơn. |
| **Level 3**    | PRE_INTERMEDIATE | 2–3 câu logic (~45–60s)   |      **9**      | Audio dài nhất, ngữ cảnh phức tạp nhất.    |

**AI Feedback (tùy chọn):** +5 💎 / pack — áp dụng đồng nhất mọi level.

---

### 1.3. Gói Credit

| Gói      | Credit | Giá VND  | Quy đổi           |
| :------- | :----: | :------- | :---------------- |
| Starter  | 20 💎  | 29,000đ  | ~1,450đ/credit    |
| Standard | 60 💎  | 79,000đ  | ~1,317đ/credit    |
| Pro      | 160 💎 | 169,000đ | ~1,056đ/credit ⭐ |

> Gói Pro có giá quy đổi thấp nhất — phù hợp người dùng luyện tập thường xuyên.

---

### 1.4. Luồng trừ phí (Deduction Logic)

**Transcript Only (tầng 1):**

- Credit trừ **một lần duy nhất** khi user nhấn ✓ OK ở **bài đầu tiên** của pack (lần ghi đầu tiên, `attemptSeq === 1, seq === 1`).
- Các bài tiếp theo trong cùng pack: không trừ thêm.
- Re-record cùng bài: không trừ thêm.

**AI Feedback (tầng 2):**

- Hiển thị nút "Nhận đánh giá AI (+5 💎)" ở màn hình Pack Complete.
- Trừ 5 credit khi user xác nhận — sau đó mới gọi scoring model.
- Nếu credit không đủ: hiển thị màn hình Upsell để nạp thêm.

**Hoàn trả credit:**

- Scoring model lỗi và không có kết quả nào → hoàn trả 5 credit.
- Whisper fail toàn bộ (không có transcript nào) → hoàn trả credit pack.

---

## 2. Chiến lược Đào tạo: Đánh giá theo Luồng kép (Dual-Scoring)

> **Lưu ý:** Luồng kép chỉ áp dụng khi người dùng chọn **AI Feedback (Tầng 2)**. Tầng 1 (Transcript Only) không có đánh giá — chỉ trả transcript.

Mục tiêu giải quyết mâu thuẫn giữa tính "có khuôn mẫu" của bài tập máy móc và tính "tự do" của giao tiếp thực tế, đặc biệt ở Level 2–3.

### 2.1. Mode A — FREE (Phản xạ tự nhiên)

- **Đối tượng:** Người dùng muốn luyện giao tiếp mở, không muốn bị gò bó vào khuôn mẫu.
- **Logic AI:** Bỏ qua `m` (instruction) và `h` (hint). Chỉ đánh giá mức độ phản hồi phù hợp với `p` (Prompt).
- **Tiêu chí chấm điểm:**

| Tiêu chí                    | Mô tả                                           | Trọng số |
| :-------------------------- | :---------------------------------------------- | :------: |
| **Relevance**               | Câu trả lời có liên quan đến prompt `p`?        |   40%    |
| **Grammar (theo level)**    | Có vi phạm quy tắc ngữ pháp bắt buộc của level? |   35%    |
| **Vocabulary (theo level)** | Từ vựng có phù hợp CEFR của level?              |   25%    |

- **Điểm cộng (Bonus +5):** Dùng cấu trúc ngữ pháp/từ vựng vượt mức Level và dùng đúng.
- **Không phạt** khi người dùng dùng cấu trúc cao hơn Level — Level chỉ xác định **sàn tối thiểu (floor)**, không phải trần.
- **Phù hợp nhất:** Level 2, Level 3.

### 2.2. Mode B — GUIDED (Có hướng dẫn)

- **Đối tượng:** Người dùng cần hướng dẫn cụ thể, chưa tự tin nói tự do.
- **Logic AI:** Chấm điểm dựa trên mức độ hoàn thiện các nhiệm vụ trong `m` và có dùng cấu trúc gợi ý trong `h` không.
- **Tiêu chí chấm điểm:**

| Tiêu chí                    | Mô tả                                            | Trọng số |
| :-------------------------- | :----------------------------------------------- | :------: |
| **Task completion**         | Hoàn thành các ý trong `m`? (mỗi ý = 1 điểm nhỏ) |   40%    |
| **Grammar (theo level)**    | Có vi phạm quy tắc ngữ pháp bắt buộc của level?  |   30%    |
| **Structure match**         | Có dùng cấu trúc gợi ý trong `h`?                |   20%    |
| **Vocabulary (theo level)** | Từ vựng có phù hợp CEFR của level?               |   10%    |

- **Hiển thị:** Sau khi nhận feedback, app highlight từng tiêu chí đạt/chưa đạt theo từng bài.
- **Phù hợp nhất:** Level 1, Level 2.

### 2.3. Cấu trúc dữ liệu bài tập (JSON Standard)

Mỗi Exercise trong bộ dữ liệu phải cung cấp đủ nguyên liệu cho cả 2 mode:

| Field | Ý nghĩa                                       | Dùng trong Mode |
| :---- | :-------------------------------------------- | :-------------- |
| `p`   | Câu dẫn dắt tự nhiên (Prompt)                 | A + B           |
| `m`   | Hướng dẫn tiếng Việt / checkpoint nhiệm vụ    | B (Guided)      |
| `h`   | Công thức ngữ pháp mục tiêu (Hint)            | B (Guided)      |
| `s`   | Mẫu câu trả lời chuẩn (Sample / Ground Truth) | A + B           |

> Khi gọi AI Feedback, toàn bộ `{p, m, h, s, transcript}` của N bài trong pack được gửi một lần duy nhất. Chi tiết xem `[CORE] - fe-audio-core-implementation.md` (Section 3 & 4).

### 2.4. Nguyên tắc Floor-Only (không có Ceiling)

Level xác định **độ khó của prompt `p`** và **sàn ngữ pháp tối thiểu kỳ vọng** — không giới hạn trần. Người học dùng cấu trúc cao hơn level và dùng đúng: luôn được chấp nhận, có thể bonus điểm.

| Trường hợp                             | Xử lý                                |
| :------------------------------------- | :----------------------------------- |
| Dùng grammar đúng bằng level           | ✅ Bình thường                       |
| Dùng grammar**cao hơn** level và đúng  | ✅ Chấp nhận — bonus +5 nếu dùng tốt |
| Dùng grammar**thấp hơn sàn** của level | ❌ Trừ điểm complexity               |
| Dùng grammar**sai** (bất kể tầng nào)  | ❌ Trừ điểm grammar                  |
| Câu trả lời**không liên quan** đến `p` | ❌ Trừ điểm relevance                |

### 2.5. Ngưỡng đạt (Pass Threshold)

| Level                      | Ngưỡng đạt | Ghi chú                                 |
| :------------------------- | :--------: | :-------------------------------------- |
| Level 1 — Beginner         |   60/100   | Khuyến khích người mới, threshold thấp. |
| Level 2 — Elementary       |   65/100   | Dần nâng tiêu chuẩn.                    |
| Level 3 — Pre-Intermediate |   70/100   | Tiêu chuẩn giao tiếp thực tế.           |

Pack score được tính bằng trung bình điểm các bài: `packScore = avg(exercise[1].score, ..., exercise[N].score)`.

> Chi tiết thang điểm 0–100, tiêu chí từng Level (A1/A2/B1), cấu trúc feedback JSON và scoring prompt: xem `08-scoring-feedback-design.md`.
