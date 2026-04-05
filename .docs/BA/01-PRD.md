# 📋 Product Requirements Document (PRD)

# SpeakEng - Nền tảng Luyện Nói Tiếng Anh với AI

---

## 1. Vision & Mission

**Vision:** Trở thành nền tảng luyện nói tiếng Anh hàng đầu khu vực Đông Nam Á, nơi mọi người có thể luyện tập bất cứ lúc nào mà không cần giáo viên.

**Mission:** Sử dụng AI để đánh giá, phản hồi và giúp người dùng cải thiện kỹ năng nói tiếng Anh thông qua bài tập thực tế từ cộng đồng.

---

## 2. Tổng Quan Sản Phẩm

### 2.1 Mô tả

SpeakEng là ứng dụng web (và sau này là mobile) cho phép người dùng luyện nói tiếng Anh qua các bài tập theo cấp độ. Hệ thống sử dụng AI (ChatGPT / Whisper) để:

- Chuyển đổi giọng nói thành text (Speech-to-Text)
- Đánh giá chất lượng phát âm, ngữ pháp, từ vựng
- Đưa ra phản hồi chi tiết và gợi ý cải thiện

### 2.2 Điểm khác biệt (USP)

| Tính năng                       | SpeakEng        | Duolingo | ELSA     |
| ------------------------------- | --------------- | -------- | -------- |
| Cộng đồng tạo nội dung          | ✅              | ❌       | ❌       |
| AI đánh giá ngữ pháp & từ vựng  | ✅ (Free+)      | ❌       | ❌       |
| AI huấn luyện Giao tiếp Công sở | 👑 Premium only | ❌       | ❌       |
| Hệ thống cấp độ chi tiết        | ✅              | ✅       | ✅       |
| Rating & Explorer cộng đồng     | ✅              | ❌       | ❌       |
| Gợi ý cách diễn đạt thay thế    | ✅              | ❌       | Một phần |

---

## 3. Personas (Đối tượng sử dụng)

### 3.1 Người học (Learner)

- **Độ tuổi:** 16 - 45
- **Mục tiêu:** Cải thiện khả năng nói tiếng Anh để đi làm, du học, giao tiếp
- **Pain points:** Không có môi trường luyện tập, ngại nói, không biết mình sai ở đâu
- **Hành vi:** Sử dụng app 15-30 phút/ngày

### 3.2 Người tạo nội dung (Creator)

- **Đối tượng:** Giáo viên tiếng Anh, người giỏi tiếng Anh muốn chia sẻ
- **Mục tiêu:** Tạo bộ bài tập cho cộng đồng, xây dựng thương hiệu cá nhân
- **Động lực:** Rating cao, nhiều người follow, sau này có thể monetize

### 3.3 Admin

- **Mục tiêu:** Quản lý hệ thống, tạo bộ bài tập official, kiểm duyệt nội dung
- **Công việc:** Upload data (hình ảnh + câu mô tả), quản lý level, quản lý user

---

## 4. User Stories

### 4.1 Authentication & Profile

| ID    | Role | Story                                        | Priority |
| ----- | ---- | -------------------------------------------- | -------- |
| US-01 | User | Tôi muốn đăng ký tài khoản bằng email/Google | P0       |
| US-02 | User | Tôi muốn đăng nhập vào hệ thống              | P0       |
| US-03 | User | Tôi muốn xem và chỉnh sửa profile cá nhân    | P1       |
| US-04 | User | Tôi muốn xem thống kê tiến độ học tập        | P1       |
| US-05 | User | Tôi muốn xem lịch sử các bài tập đã làm      | P1       |

### 4.2 Learning System

| ID    | Role | Story                                                       | Priority |
| ----- | ---- | ----------------------------------------------------------- | -------- |
| US-10 | User | Tôi muốn xem danh sách level có thể luyện tập               | P0       |
| US-11 | User | Tôi muốn chọn bài tập trong 1 level                         | P0       |
| US-12 | User | Tôi muốn xem hình ảnh + yêu cầu và ghi âm câu trả lời       | P0       |
| US-13 | User | Tôi muốn nhận feedback chi tiết sau khi ghi âm              | P0       |
| US-14 | User | Tôi muốn nghe lại bản ghi âm của mình                       | P1       |
| US-15 | User | Tôi muốn thử lại bài tập nếu chưa đạt                       | P0       |
| US-16 | User | Tôi muốn mở khoá level tiếp theo sau khi đạt điểm tối thiểu | P0       |

### 4.3 Community & Explorer

| ID    | Role  | Story                                                  | Priority |       |                                                |     |
| ----- | ----- | ------------------------------------------------------ | -------- | ----- | ---------------------------------------------- | --- |
| US-20 | User  | Tôi muốn tạo bộ bài tập (lesson pack) của riêng mình   | P1       |       |                                                |     |
| US-21 | User  | Tôi muốn upload hình ảnh và nhập câu mô tả cho bài tập | P1       |       |                                                |     |
| US-22 | User  | Tôi muốn                                               | US-32    | Admin | Tôi muốn nhập data (ảnh + câu nói) cho bài tập | P0  |
| US-33 | Admin | Tôi muốn xem thống kê tổng quan hệ thống               | P1       |       |                                                |     |
| US-34 | Admin | Tôi muốn quản lý người dùng (ban, suspend)             | P1       |       |                                                |     |
| US-35 | Admin | Tôi muốn kiểm duyệt lesson pack từ cộng đồng           | P2       |       |                                                |     |

---

## 5. Luồng Nghiệp Vụ Chính

### 5.1 Luồng Luyện Tập (Core Flow)

**Quy trình 1 bài luyện tập:**

- Một bài tập (Lesson) bao gồm **5 câu** do hệ thống hoặc người dùng chuẩn bị.
- User thực hiện trả lời lần lượt từng câu.
- **Client-side:** Ghi âm 5 file audio riêng lẻ tương ứng 5 câu x2192 Concatenate (nối) các audio thành 1 file duy nhất x2192 Gửi Server.
- **Server-side:** Nhận 1 file audio chứa 5 câu nói x2192 Phân tích bằng Whisper STT x2192 GPT Đánh giá toàn bộ.

**Quy trình 1 bài luyện tập:**

- Một bài tập (Lesson) bao gồm **5 câu** do hệ thống hoặc người dùng chuẩn bị.
- User thực hiện trả lời lần lượt từng câu.
- **Client-side:** Ghi âm 5 file audio riêng lẻ tương ứng 5 câu → Concatenate (nối) các audio thành 1 file duy nhất → Gửi Server.
- **Server-side:** Nhận 1 file audio chứa 5 câu nói → Phân tích bằng Whisper STT → GPT Đánh giá toàn bộ.

````
┌─────────────┐     ┌──────────────┐     ┌─────────────────────┐
│  Chọn Level  │────▶│ Chọn Bài Tập │────▶│ Xem 5 câu đề bài    │
└─────────────┘     └──────────────┘     └──────────┬──────────┘
                                                    │
     ┌──────────────┐     ┌──────────────┐     ┌────▼──────────────┐
     │ Đạt (Pass)   │◀────│ Nhận Feedback│◀────│ Ghi 5 audio riêng │
     └──────┬───────┘     └──────────────┘     │ Nối audio & Gửi   │
            │                                  └───────────────────┘
 ┌──────────┴──────────┐
 ▼                     ▼
┌─────────────────┐   ┌───────────────────┐
│ Kết thúc bài    │   │  Chưa đạt (Fail)  │
│ Cộng XP, lưu sử │   │  Thử lại bài      │
└─────────────────┘   └───────────────────┘
```�────────┘     │ Nối audio & Gửi   │
            │                                  └───────────────────┘
 ┌──────────┴──────────┐
 ▼                     ▼
┌─────────────────┐   ┌───────────────────┐
│ Kết thúc bài    │   │  Chưa đạt (Fail)  │
│ Cộng XP, lưu sử │   │  Thử lại bài      │
└─────────────────┘   └───────────────────┘
```-side:** Nhận 1 file audio chứa 5 câu nói → Phân tích bằng Whisper STT → GPT Đánh giá toàn bộ.

````

┌─────────────┐ ┌──────────────┐ ┌─────────────────┐
│ Chọn Level │────▶│ Chọn Bài Tập │────▶│ Xem Ảnh + Đề │
└─────────────┘ └──────────────┘ └────────┬────────┘
│
┌──────────────┐ ┌──────────▼────────┐
│ Nhận Feedback│◀────│ Ghi Âm Câu Nói │
└──────┬───────┘ └───────────────────┘
│
┌────────────┴────────────┐
▼ ▼
┌─────────────────┐ ┌───────────────────┐
│ Đạt → Tiếp │ │ Chưa đạt → Thử │
│ tục / Kết thúc│ │ lại / Xem gợi ý │
└─────────────────┘ └───────────────────┘

```

### 5.2 Luồng Đánh Giá AI (Chung cho cả 3 gói)

```

┌────────────┐ ┌──────────────┐ ┌──────────────────┐
│ Audio File │────▶│ Whisper API │────▶│ Transcription │
│ (WebM/MP3) │ │ (STT) │ │ (Text) │
└────────────┘ └──────────────┘ └────────┬─────────┘
│
┌──────────────┐ ┌──────────▼─────────┐
│ Response │◀────│ ChatGPT API │
│ (JSON) │ │ (Evaluate Text) │
└──────┬───────┘ └────────────────────┘
│
┌───────────┴──────────┐
│ Structured Feedback │
└──────────────────────┘

````

---

## 6. Cấu Trúc Feedback Object

```json
{
  "overallScore": 85,
  "breakdown": {
    "grammar": {
      "score": 90,
      "feedback": "Ngữ pháp rất tốt, chỉ sai một lỗi nhỏ ở mạo từ.",
      "corrections": [
        { "userSaid": "I go to store", "correct": "I went to the store" }
      ]
    },
    "businessVocabulary": {
      "score": 85,
      "feedback": "Dùng từ phù hợp ngữ cảnh công sở.",
      "suggestions": [
        { "userUsed": "help", "professionalOption": "assist", "reason": "Dùng 'assist' nghe chuyên nghiệp hơn." }
      ]
    },
    "toneAndPoliteness": {
      "score": 80,
      "feedback": "Câu nói hơi trực diện, có thể thêm 'please' để lịch sự hơn.",
      "tips": ["Nên dùng 'Could you please...'"]
    },
    "coherence": {
      "score": 75,
      "feedback": "Mạch lạc, dễ hiểu nhưng các ý có thể liên kết chặt chẽ hơn."
    },
    "contentAccuracy": {
      "score": 100,
      "feedback": "Truyền đạt đầy đủ và chính xác nội dung yêu cầu.",
      "missedPoints": []
    }
  },
  "suggestedPhrases": [
    "I would be glad to assist you with that request.",
    "Could you please clarify the meeting agenda?"
  ],
  "nextSteps": ["Luyện tập thêm các cụm từ polite request", "Thực hành phản xạ nhanh hơn"]
}
````

---

## 7. Hệ Thống Level & Topic

Hệ thống SpeakEng sử dụng **2 chiều phân loại** cho mỗi câu đề bài (Exercise):

- **Level (Cấp độ):** 4 cấp từ Beginner → Intermediate, quy định độ phức tạp ngữ pháp và số câu đầu ra.
- **Topic (Chủ đề):** 3 nhóm lớn (Everyday English, Office Foundation, Niche Master) quy định ngữ cảnh nội dung.

```
Exercise = [Level Tag] + [Topic Tag]
```

> 📖 Chi tiết về hệ thống Level, yêu cầu đầu ra, ngưỡng đạt và điều kiện mở khoá: **[04-level-system.md](./04-level-system.md)**
>
> 📖 Chi tiết về hệ thống Topic, 3 nhóm chủ đề và mối quan hệ Topic ↔ Level: **[05-topic-system.md](./05-topic-system.md)**

---

## 8. 🎯 Hệ Thống Tính Điểm (Scoring System)

### 8.1 Điểm Mỗi Bài Tập (Exercise Score)

AI đánh giá mỗi lượt nói trên thang **0 - 100 điểm**, chia thành 5 tiêu chí:

> 📌 **Gói Free & Pro** đánh giá 3 tiêu chí cơ bản: Grammar, Vocabulary, Content Accuracy.
> **Chỉ gói Premium** đánh giá 5 tiêu chí nâng cao hướng tới **Business Communication** (Giao tiếp công việc): Tone & Politeness, Business Vocabulary, Grammar, Coherence, Content Accuracy.

| Tiêu chí                       | Trọng số | Mô tả                                | Gói             |
| ------------------------------ | -------- | ------------------------------------ | --------------- |
| 👔 Business Vocabulary         | 20%      | Từ vựng chuyên ngành, công sở        | 👑 Premium only |
| 📝 Grammar (Ngữ pháp)          | 20%      | Đúng cấu trúc câu, thì, chia động từ | 🆓 Tất cả       |
| 🤝 Tone & Politeness           | 20%      | Độ lịch sự, chuyên nghiệp, thái độ   | 👑 Premium only |
| 🔗 Coherence (Mạch lạc)        | 20%      | Tính logic, flow của câu khẳng định  | 👑 Premium only |
| 🎯 Content Accuracy (Nội dung) | 20%      | Mô tả đúng yêu cầu đề bài / mục đích | 🆓 Tất cả       |

**Công thức (Premium - 5 tiêu chí Business):**.

```
overallScore = grammar × 0.20
             + businessVocabulary × 0.20
             + toneAndPoliteness × 0.20
             + coherence × 0.20
             + contentAccuracy × 0.20
```

**Ví dụ minh hoạ:**

```
Bài tập: Tình huống gặp khách hàng Business
Level: 2 - Elementary

User nói: "I want you to sign this paper. Give it back to me tomorrow."

AI đánh giá:
┌────────────────────┬───────┬──────────────────────────────────────┐
│ Tiêu chí           │ Điểm  │ Nhận xét                             │
├────────────────────┼───────┼──────────────────────────────────────┤
│ Grammar            │ 90    │ Đúng ngữ pháp cơ bản                 │
│ Business Vocab     │ 60    │ Nên dùng "document" thay vì "paper"  │
│                    │       │ và "return" thay vì "give back"      │
│ Tone & Politeness  │ 40    │ Quá ra lệnh ("I want you to...").    │
│                    │       │ Cần dùng "Could you please..."       │
│ Coherence          │ 70    │ Đủ ý nhưng rời rạc                   │
│ Content Accuracy   │ 100   │ Khách hiểu mục đích                  │
├────────────────────┼───────┼──────────────────────────────────────┤
│ TỔNG ĐIỂM          │ 72    │ → ĐẠT ✅                              │
└────────────────────┴───────┴──────────────────────────────────────┘
```

### 8.2 Phân Loại Kết Quả

| Khoảng điểm | Xếp hạng      | Icon | Ý nghĩa                      |
| ----------- | ------------- | ---- | ---------------------------- |
| 90 - 100    | ⭐ Excellent  | 🌟   | Xuất sắc, gần như hoàn hảo   |
| 80 - 89     | 🟢 Good       | ✅   | Tốt, một vài lỗi nhỏ         |
| 70 - 79     | 🟡 Pass       | 👍   | Đạt, cần cải thiện thêm      |
| 50 - 69     | 🟠 Needs Work | ⚠️   | Chưa đạt, cần thử lại        |
| 0 - 49      | 🔴 Try Again  | ❌   | Yếu, cần luyện tập nhiều hơn |

**Ngưỡng ĐẠT (pass) thay đổi theo level:** Xem chi tiết tại [04-level-system.md](./04-level-system.md#3-ngưỡng-đạt-pass-threshold-theo-level).

### 8.3 XP (Experience Points) - Điểm Kinh Nghiệm

XP là điểm tích lũy dùng để đo lường nỗ lực luyện tập mỗi lần hoàn thành bài học.

**Công thức tính XP sau mỗi bài luyện đạt yêu cầu (Pass):**

```
XP Gain = overallScore + Bonus - Penalty
```

**Chi tiết thành phần:**

1. **baseXP = overallScore**:
   - Ví dụ: được 85 điểm → nhận 85 baseXP.
2. **Bonus (Cộng thêm):**
   - **First-time Completion**: +20 XP (chỉ nhận cho bài học chưa từng Pass).
   - **First-time Ranking Performance**:
     - `Excellent` (90+): +15 XP
     - `Perfect` (95+): +30 XP
   - **Daily Streak Bonus**:
     - Từ ngày 3+: +10% baseXP.
     - Từ ngày 7+: +20% baseXP.
     - Từ ngày 30+ (Duy trì streak): +30% baseXP.
3. **Penalty (Giảm trừ, chỉ áp dụng cho baseXP):**
   - Áp dụng khi người dùng phải thử lại bài (Re-attempt):
     - Thử lại lần 2: Nhận 80% baseXP.
     - Thử lại lần 3+: Nhận 50% baseXP (floor).
   - _Ghi chú: Bonus vẫn sẽ là số nguyên được cộng thêm đầy đủ._

**Ví dụ tính XP:**

```
User A hoàn thành bài tập lần đầu, được 85 điểm, đang streak ngày thứ 5:
  baseXP = 85
  + first-time bonus = +20
  + streak (ngày thứ 5, thuộc nhóm 3+) = +10% × 85 = +8.5 → +9
  = 85 + 20 + 9 = 114 XP

User B thử lại bài tập lần 2, được 92 điểm, không có streak:
  baseXP = 92 × 80% = 73.6 → 74
  + Excellent bonus (90+) = +30
  = 74 + 30 = 104 XP
```

### 8.4 Profile Level (Cấp Bậc Hồ Sơ)

XP tích lũy → tự động lên cấp profile:

| Profile Level | Tên         | XP Cần | Icon | Quyền lợi                          |
| ------------- | ----------- | ------ | ---- | ---------------------------------- |
| 1             | 🥉 Bronze   | 0      | 🥉   | Chơi bài tập cơ bản                |
| 2             | 🥈 Silver   | 500    | 🥈   | Mở khoá Explorer                   |
| 3             | 🥇 Gold     | 2,000  | 🥇   | Tạo lesson pack                    |
| 4             | 💎 Platinum | 5,000  | 💎   | Badge creator, profile nổi bật     |
| 5             | 👑 Diamond  | 15,000 | 👑   | Verified creator, ưu tiên hiển thị |
| 6             | 🔮 Master   | 50,000 | 🔮   | Custom badge, mentor role          |

### 8.5 Điểm Lesson Pack

Mỗi Lesson Pack có hai chỉ số quan trọng để người dùng theo dõi:

1. **Tiến độ (Progress):** Thể hiện số lượng bài tập người dùng đã "vượt qua" (đạt điểm >= ngưỡng của level).
   - Hiển thị: `[Số bài đạt] / [Tổng số bài] ([Phần trăm]%)`.
   - Ví dụ: 4/5 bài đạt → **80% Completion**.
   - _Lý do:_ Giúp người dùng biết còn bao nhiêu bài để hoàn thành và hiển thị trên các thanh tiến độ (Progress Bar) trực quan.

2. **Điểm Tổng Hợp (Pack Score):** Thể hiện chất lượng hoàn thành của người dùng, dựa trên điểm cao nhất của từng bài.
   - Công thức: `Pack Score = Trung bình điểm cao nhất của mỗi bài tập trong pack`.
   - Ví dụ: Pack "Daily Greetings" có 5 bài:
     - Bài 1: best score = 90
     - Bài 2: best score = 85
     - Bài 3: best score = 78
     - Bài 4: best score = 92
     - Bài 5: best score = 88
     - **Pack Score** = (90 + 85 + 78 + 92 + 88) / 5 = 86.6 → **87/100**.

**Pack Score + Star Rating:**

| Pack Score | Stars  | Hiển thị           |
| ---------- | ------ | ------------------ |
| 90 - 100   | ⭐⭐⭐ | 3 sao - Perfect    |
| 70 - 89    | ⭐⭐   | 2 sao - Good       |
| 50 - 69    | ⭐     | 1 sao - Needs Work |
| < 50       | ☆      | Chưa hoàn thành    |

---

## 9. 🏆 Hệ Thống Ranking (Bảng Xếp Hạng)

### 9.1 Các Bảng Xếp Hạng

Hệ thống có **4 bảng ranking chính**, mỗi bảng có tab **Tuần / Tháng / Tất cả**:

#### 🏅 Ranking 1: Top Learners (Theo Tổng Điểm XP)

> _"Ai luyện tập nhiều và tốt nhất?"_

| Hạng | User         | Total XP  | Profile Level | Streak     |
| ---- | ------------ | --------- | ------------- | ---------- |
| 🥇 1 | NgocAnh_2k3  | 12,450 XP | 💎 Platinum   | 🔥 45 ngày |
| 🥈 2 | MinhTuan.dev | 10,200 XP | 🥇 Gold       | 🔥 30 ngày |
| 🥉 3 | HuongGiang95 | 8,800 XP  | 🥇 Gold       | 🔥 12 ngày |
| 4    | DucAnh_HN    | 7,500 XP  | 🥈 Silver     | 🔥 5 ngày  |
| 5    | ThuyLinh.en  | 6,900 XP  | 🥈 Silver     | 🔥 8 ngày  |

**Cách tính:** Tổng XP tích lũy (weekly = XP kiếm được trong tuần đó)

---

#### 🎯 Ranking 2: Top Completers (Theo Số Bài Hoàn Thành)

> _"Ai hoàn thành nhiều bài nhất?"_

| Hạng | User         | Bài hoàn thành | Lesson Packs | Level cao nhất |
| ---- | ------------ | -------------- | ------------ | -------------- |
| 🥇 1 | MinhTuan.dev | 342 bài        | 28 packs     | Level 4        |
| 🥈 2 | NgocAnh_2k3  | 298 bài        | 25 packs     | Level 4        |
| 🥉 3 | DucAnh_HN    | 256 bài        | 20 packs     | Level 3        |

**Cách tính:** Tổng số bài tập đạt ĐẠT (>= ngưỡng pass của level)

---

#### 🔥 Ranking 3: Top Streakers (Streak Dài Nhất)

> _"Ai kiên trì nhất?"_

| Hạng | User         | Current Streak          | Longest Streak |
| ---- | ------------ | ----------------------- | -------------- |
| 🥇 1 | NgocAnh_2k3  | 🔥 45 ngày đang diễn ra | 45 ngày        |
| 🥈 2 | ThuyLinh.en  | 🔥 32 ngày đang diễn ra | 50 ngày        |
| 🥉 3 | MinhTuan.dev | 🔥 30 ngày đang diễn ra | 30 ngày        |

**Note:** Hiển thị cả streak hiện tại và streak dài nhất từng đạt.

---

#### ⭐ Ranking 4: Top Creators (Xếp Hạng Người Tạo Nội Dung)

> _"Ai tạo nội dung hay nhất?"_

| Hạng | Creator        | Packs    | Total Plays | Avg Rating | Followers |
| ---- | -------------- | -------- | ----------- | ---------- | --------- |
| 🥇 1 | Teacher_Mai    | 15 packs | 5,200 plays | ⭐ 4.8/5   | 320       |
| 🥈 2 | EnglishWithDuy | 12 packs | 3,800 plays | ⭐ 4.6/5   | 215       |
| 🥉 3 | SarahNguyen    | 8 packs  | 2,100 plays | ⭐ 4.9/5   | 180       |

**Cách tính điểm Creator:**

```
creatorScore = (avgRating × 100) × 0.4     // Chất lượng (40%)
             + totalPlays × 0.01 × 0.3      // Độ phổ biến (30%)
             + followers × 0.05 × 0.2       // Ảnh hưởng (20%)
             + totalPacks × 2 × 0.1         // Năng suất (10%)

Ví dụ Teacher_Mai:
  = (4.8 × 100) × 0.4 + 5200 × 0.01 × 0.3 + 320 × 0.05 × 0.2 + 15 × 2 × 0.1
  = 192 + 15.6 + 3.2 + 3.0
  = 213.8 điểm
```

### 9.2 Ranking cho Lesson Pack

Mỗi lesson pack cũng được xếp hạng:

#### 📊 Pack Rankings

| Tab            | Sắp xếp theo                            | Mô tả                |
| -------------- | --------------------------------------- | -------------------- |
| 🔥 Trending    | Lượt chơi trong 7 ngày gần nhất         | Pack hot nhất tuần   |
| ⭐ Top Rated   | Điểm rating trung bình (min 10 ratings) | Pack chất lượng nhất |
| 🆕 Newest      | Ngày publish                            | Pack mới nhất        |
| 📈 Most Played | Tổng lượt chơi all-time                 | Pack phổ biến nhất   |

### 9.3 Minh Hoạ Trang Profile

```
┌─────────────────────────────────────────────────────────┐
│  👤 NgocAnh_2k3                           [Edit Profile] │
│  💎 Platinum Level  •  🔥 45-day streak                  │
│  "Learning English every day! 🇬🇧"                       │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐            │
│  │  12,450    │ │   298      │ │   25       │            │
│  │  Total XP  │ │  Bài xong  │ │  Packs     │            │
│  └────────────┘ └────────────┘ └────────────┘            │
│                                                          │
│  📊 Thống kê                                             │
│  ├── Level cao nhất: Level 4 - Intermediate              │
│  ├── Điểm TB: 82/100                                    │
│  ├── Tổng giờ luyện tập: 48h 30m                        │
│  └── Xếp hạng: #3 tuần này                              │
│                                                          │
│  🏅 Achievements                                         │
│  🎤 First Words  🔥 On Fire  ⭐ Rising Star               │
│  👨‍🏫 Creator  🏆 Top Scorer  🌍 Explorer                   │
│                                                          │
│  📈 Tiến Trình Level                                     │
│  Level 1 Beginner         ██████████ 100% ⭐⭐⭐          │
│  Level 2 Elementary       ██████████ 100% ⭐⭐⭐          │
│  Level 3 Pre-Intermediate ████████░░  80% ⭐⭐            │
│  Level 4 Intermediate     █████░░░░░  50% ⭐              │
│                                                          │
│  📅 Lịch Streak (tháng này)                              │
│  Mo Tu We Th Fr Sa Su                                    │
│  🟢 🟢 🟢 🟢 🟢 🟡 🟡                                     │
│  🟢 🟢 🟢 🟢 🟢 🟢 🟢                                     │
│  🟢 🟢 🟢 🟢 🔵 ⬜ ⬜                                     │
│  (🟢=luyện tập 🟡=weekend 🔵=hôm nay ⬜=chưa đến)       │
└─────────────────────────────────────────────────────────┘
```

---

## 10. 🎮 Gamification System

### 10.1 Streak System

- Luyện tập mỗi ngày (hoàn thành ít nhất 1 bài) → Streak +1
- Streak rewards: 7 ngày → badge, 30 ngày → special badge, 365 ngày → legendary
- Mất streak → freeze available (1 miễn phí / tháng, mua thêm bằng XP)

### 10.2 Achievement Badges

| Badge              | Điều kiện                          | XP Thưởng |
| ------------------ | ---------------------------------- | --------- |
| 🎤 First Words     | Hoàn thành bài tập đầu tiên        | +10 XP    |
| 🔥 On Fire         | Streak 7 ngày                      | +50 XP    |
| 🔥🔥 Blazing       | Streak 30 ngày                     | +200 XP   |
| ⭐ Rising Star     | Đạt 500 XP                         | +50 XP    |
| 🎯 Sharpshooter    | Đạt 95+ ở 5 bài liên tiếp          | +100 XP   |
| 🏆 Top Scorer      | Đạt 100 (Perfect) ở bất kỳ bài nào | +150 XP   |
| 👨‍🏫 Content Creator | Tạo lesson pack đầu tiên           | +100 XP   |
| 🌍 Explorer        | Thử 10 lesson packs từ cộng đồng   | +75 XP    |
| 💎 Diamond Speaker | Đạt level 4                        | +500 XP   |
| 👑 Master Speaker  | Hoàn thành tất cả 4 level          | +1000 XP  |
| 📚 Bookworm        | Hoàn thành 100 bài tập             | +200 XP   |
| 🤝 Social Star     | Có 50 followers                    | +150 XP   |

---

## 11. MVP Scope (Phase 1)

**Mục tiêu Phase 1:** Hoàn thiện luồng học tập cốt lõi (Core Learning Loop), giúp người dùng có thể luyện tập nói tiếng Anh, nhận phản hồi cấu trúc từ AI và tự động lưu vết theo dõi tiến trình.

### Bao gồm (MVP - Phase 1):

**1. Authentication & Profile**

- [x] Đăng ký / Đăng nhập tài khoản (Email/Password + Google OAuth)
- [x] Trang Profile cơ bản (Hiển thị Avatar, Tên, Cấp bậc, Tổng XP, Chuỗi Streak hiện tại)

**2. Quản trị & Nội dung (Admin)**

- [ ] Hệ thống CMS cơ bản để Admin tạo Level, Lesson Packs và Exercises (Upload hình ảnh, Text prompt)
- [ ] Cấu hình mở khoá 4 Level theo chuẩn độ khó

**3. Luồng Luyện Tập (Learning Core)**

- [x] Hiển thị danh sách Level và Lesson Packs (có Progress Bar % và Pack Score)
- [x] Ghi âm bài tập: Hỗ trợ ghi âm từng câu và nối (concatenate) trước khi gửi server
- [x] Tích hợp API: Whisper (Speech-to-Text) và OpenAI (Đánh giá học thuật)
- [x] Hiển thị Feedback chi tiết (Giao diện hiển thị đủ 5 tiêu chí điểm thành phần từ JSON trả về)
- [x] Nút nghe lại Audio của mình

**4. Scoring & Gamification Cơ Bản**

- [ ] Ngưỡng ĐẠT (Pass/Fail) tuỳ theo Level
- [ ] Tính và lưu điểm Overall Score cho từng lượt làm bài
- [ ] Tính hệ thống XP (Base XP + Plus Bonus/Streak Bonus - Penalty re-attempt)
- [ ] Tính chuỗi ngày luyện tập (Streak cơ bản)
- [ ] Bảng xếp hạng cơ bản (Top Learners theo Tổng XP)

---

### Không bao gồm (Dành cho Phase 2+):

**1. Cấu phần Cộng đồng (User-Generated Content)**

- [ ] Chức năng User tự tạo Lesson Packs, Upload hình ảnh
- [ ] Trang Explorer KHÁM PHÁ để tìm các Pack của cộng đồng
- [ ] Đánh giá Lesson Pack (Rating ⭐) và Bình luận
- [ ] Hệ thống Follow/Follower các Creator

**2. Advanced Gamification & Ranking**

- [ ] Hệ thống Thành tựu chi tiết (Achievement Badges)
- [ ] Streak Freeze (bảo vệ chuỗi)
- [ ] Full bảng xếp hạng (Top Completers, Top Streakers, Top Creators)

**3. Khác**

- [ ] Membership / Payment Subscriptions (Phân loại gói Free/Pro/Premium)
- [ ] Mobile App (Hiện MVP chỉ tập trung Web / Web-view)

---

## 12. Success Metrics (KPIs)

| Metric                   | Target (3 tháng) | Target (6 tháng) |
| ------------------------ | ---------------- | ---------------- |
| DAU (Daily Active Users) | 500              | 2,000            |
| Retention D7             | 30%              | 40%              |
| Retention D30            | 15%              | 25%              |
| Avg sessions/user/day    | 1.5              | 2.0              |
| Avg exercises/session    | 5                | 8                |
| Avg score per exercise   | 65               | 72               |
| Users with streak >= 7   | 10%              | 20%              |
| User satisfaction (NPS)  | 40               | 50               |
| Creator lesson packs     | -                | 100+             |

---

## 13. Rủi Ro & Giải Pháp

| Rủi ro                                   | Impact | Giải pháp                                            |
| ---------------------------------------- | ------ | ---------------------------------------------------- |
| Chi phí API OpenAI cao                   | High   | Rate limiting, caching, dùng GPT-4o-mini trước       |
| Chất lượng đánh giá AI không ổn định     | High   | Prompt engineering tốt, A/B testing, fallback models |
| Tính điểm không công bằng giữa các level | High   | Calibrate prompt theo level, test kỹ với mẫu         |
| Người dùng bỏ giữa chừng                 | Medium | Gamification, push notification, email reminder      |
| Gaming the ranking (gian lận)            | Medium | Anti-cheat: detect repeated audio, rate limit        |
| Nội dung cộng đồng kém chất lượng        | Medium | Review system, reporting, moderation                 |
| Vấn đề bảo mật audio                     | Medium | Encryption, data retention policy, GDPR compliance   |
