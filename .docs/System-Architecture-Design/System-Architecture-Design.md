# 🏗️ TÀI LIỆU THIẾT KẾ KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE DESIGN)

*Tài liệu này tổng hợp toàn bộ các phân tích, thiết kế hệ thống, lược đồ cơ sở dữ liệu và kiến trúc microservices cho dự án SpeakEng.*

---

## 📅 MỤC LỤC
1. [Phần 1: Tổng Quan Phân Tích Sản Phẩm](#phần-1-tổng-quan-phân-tích-sản-phẩm)
2. [Phần 2: Mô Hình Hóa Domain (Domain-Driven Design)](#phần-2-mô-hình-hóa-domain)
3. [Phần 3: Bounded Contexts](#phần-3-bounded-contexts)
4. [Phần 4: Lược Đồ Cơ Sở Dữ Liệu (Prisma Schema)](#phần-4-lược-đồ-cơ-sở-dữ-liệu-prisma-schema)
5. [Phần 5: Thiết Kế Kiến Trúc Microservices](#phần-5-thiết-kế-kiến-trúc-microservices)
6. [Phần 6: Các Luồng Hệ Thống Chi Tiết](#phần-6-các-luồng-hệ-thống-chi-tiết)
7. [Phần 7: Đánh Giá Chuyên Sâu & Tối Ưu (Principal Review)](#phần-7-đánh-giá-chuyên-sâu--tối-ưu)

---

## Phần 1: Tổng Quan Phân Tích Sản Phẩm

### 1.1 Tổng Quan 
- **Hệ thống là gì?** SpeakEng là nền tảng luyện nói tiếng Anh tích hợp AI (Web MVP, sau này là mobile app). Ứng dụng sử dụng Whisper (Speech-to-Text) và ChatGPT để chấm điểm và đưa ra phản hồi chi tiết cho người học.
- **Người dùng:** 
  - *Người học (Learner)*: Tuổi 16-45, cần môi trường thực hành nói.
  - *Người tạo nội dung (Creator)*: Giáo viên/người giỏi tiếng Anh tạo ra bộ bài tập.
  - *Admin*: Quản lý hệ thống, kiểm duyệt nội dung, quản lý bài tập Official.

### 1.2 Các Tính Năng Cốt Lõi
- Quản lý tài khoản & Hồ sơ (Email/Google).
- Luyện nói & Chấm điểm bằng AI: Chọn chủ đề, ghi âm từng câu, nhận phản hồi ngay lập tức.
- Phân quyền Gói Đăng ký:
  - **Free**: 3 bài/ngày, chấm điểm cơ bản, giới hạn Level 1-2.
  - **Pro**: Mở khóa 4 levels, phân tích 3 tiêu chí cốt lõi (Ngữ pháp, Từ vựng, Nội dung).
  - **Premium (Business)**: Không giới hạn, chấm 5 tiêu chí nâng cao (thêm Từ vựng Công sở và Độ Lịch sự).
- Gamification: Hệ thống tính điểm XP, Chuỗi ngày học (Streak), Huy hiệu (Achievements), và Bảng xếp hạng.
- Cộng đồng (Giai đoạn 2): Cho phép người dùng tạo Lesson Packs và đánh giá/Follow.

### 1.3 Quy Tắc Tính Điểm & Nội Dung
- **Nội dung:** Gồm 3 Nhóm chính (Everyday, Office, Niche) → 4 Level (Từ câu đơn đến đoạn văn) → Các Topics tương ứng. Một Lesson Pack chứa đúng 5 Câu Tập (Exercises).
- **Điểm XP:** XP Nhận = Điểm Assessment + Bonus (Thử lần đầu, Điểm cao, Streak) - Kỷ luật (Trừ XP khi thử lại).

---

## Phần 2: Mô Hình Hóa Domain

Dựa trên phân tích, hệ thống bao gồm các thực thể chính như sau:

### 2.1 Các Nhóm Domain Chính
1. **Domain Người dùng & Gamification**: `User`, `Subscription Plan`, `Achievement`, `User Achievement`, `User Level Progress`.
2. **Domain Nội dung (Catalog)**: `Category`, `Level`, `Topic`, `Lesson Pack`, `Exercise`.
3. **Domain Luyện Tập (Practice/Learning)**: `Pack Attempt`, `Exercise Attempt`.
4. **Domain Đánh giá AI (AI/Evaluation)**: `AI Evaluation`.

### 2.2 Vòng đời Của Thực Thể Cốt Lõi
`Category/Level` ➔ `Topic` ➔ Admin tạo `Lesson Pack` (chứa 5 `Exercise`) ➔ User click bắt đầu tạo ra 1 `Pack Attempt` ➔ User thu âm từng câu tạo ra `Exercise Attempt` ➔ AI chấm điểm tạo `AI Evaluation` ➔ Tính điểm Pack ➔ Cộng XP, xét thành tích.

---

## Phần 3: Bounded Contexts

Chia hệ thống thành 4 Bounded Contexts ranh giới rõ ràng tránh phụ thuộc chéo:

1. **User Identity & Gamification Context**: Quản lý ai đang dùng, gói gì, tiến độ ra sao (XP, Streak, Level của user).
2. **Content Catalog Context**: Từ điển dữ liệu của hệ thống, chỉ phục vụ thao tác đọc nhiều lần (Read-heavy) và thông tin bài học tĩnh.
3. **Practice Session Context**: Trái tim giao dịch của ứng dụng, lưu trữ các phiên thu âm, giới hạn mỗi ngày và điều hành luồng gửi AI.
4. **AI Evaluation Context**: Context nền (worker) dùng để làm việc với API của Whisper & OpenAI.

---

## Phần 4: Lược Đồ Cơ Sở Dữ Liệu (Prisma Schema)

*Thiết kế chuẩn hóa, tách biệt dữ liệu cốt lõi (Read-heavy) và dữ liệu Tracking hành vi (Write-heavy). Tránh Join phức tạp khi truy xuất AI.*

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ======================= ENUMS =======================
enum Role { LEARNER, CREATOR, ADMIN }
enum SubscriptionTier { FREE, PRO, PREMIUM }
enum CategoryType { EVERYDAY, OFFICE, NICHE }
enum PackStatus { DRAFT, PUBLISHED, ARCHIVED }
enum AttemptStatus { IN_PROGRESS, PENDING_EVALUATION, COMPLETED, FAILED }

// ======================= DOMAIN 1: IDENTITY & GAMIFICATION =======================
model User {
  id               String           @id @default(uuid())
  email            String           @unique
  fullName         String
  avatar           String?
  role             Role             @default(LEARNER)
  subscriptionTier SubscriptionTier @default(FREE)
  totalXp          Int              @default(0)
  currentStreak    Int              @default(0)
  longestStreak    Int              @default(0)
  profileLevel     Int              @default(1)

  achievements       UserAchievement[]
  levelProgresses    UserLevelProgress[]
  createdLessonPacks LessonPack[]        @relation("PackCreator")
  packAttempts       PackAttempt[]
}

model Achievement {
  id              String            @id @default(uuid())
  badgeName       String            @unique
  description     String
  iconUrl         String?
  unlockCondition String            
  xpReward        Int               @default(0)
  userAchievements UserAchievement[]
}

model UserAchievement {
  id            String      @id @default(uuid())
  userId        String
  achievementId String
  unlockedAt    DateTime    @default(now())
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement   Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  @@unique([userId, achievementId])
}

model UserLevelProgress {
  id                   String  @id @default(uuid())
  userId               String
  levelId              String
  totalPacksCompleted  Int     @default(0)
  unlockedStatus       Boolean @default(false)
  user                 User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  level                Level   @relation(fields: [levelId], references: [id], onDelete: Restrict)
  @@unique([userId, levelId])
}

// ======================= DOMAIN 2: CONTENT CÂTLOG =======================
model Category {
  id          String       @id @default(uuid())
  name        String
  type        CategoryType
  description String?
  topics      Topic[]
  lessonPacks LessonPack[]
}

model Level {
  id                 String              @id @default(uuid())
  levelNumber        Int                 @unique 
  name               String              
  passThresholdScore Int                 
  outputRequirement  String

  topics             Topic[]
  lessonPacks        LessonPack[]
  userProgresses     UserLevelProgress[] 
}

model Topic {
  id          String   @id @default(uuid())
  categoryId  String
  levelId     String
  name        String   
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  level       Level    @relation(fields: [levelId], references: [id], onDelete: Restrict)
  lessonPacks LessonPack[]
}

model LessonPack {
  id            String     @id @default(uuid())
  creatorId     String
  categoryId    String
  levelId       String
  topicId       String
  title         String
  isOfficial    Boolean    @default(false)
  status        PackStatus @default(DRAFT)
  totalPlays    Int        @default(0)
  averageRating Float      @default(0.0)

  creator       User       @relation("PackCreator", fields: [creatorId], references: [id])
  category      Category   @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  level         Level      @relation(fields: [levelId], references: [id], onDelete: Restrict)
  topic         Topic      @relation(fields: [topicId], references: [id], onDelete: Restrict)
  exercises     Exercise[]
  attempts      PackAttempt[]
  @@index([categoryId, levelId, status]) 
}

model Exercise {
  id             String  @id @default(uuid())
  lessonPackId   String
  sequenceOrder  Int         
  promptText     String
  levelHint      String?

  lessonPack       LessonPack        @relation(fields: [lessonPackId], references: [id], onDelete: Cascade)
  exerciseAttempts ExerciseAttempt[]
  @@unique([lessonPackId, sequenceOrder])
}

// ======================= DOMAIN 3 & 4: PRACTICE & AI EVALUATION =======================
model PackAttempt {
  id                   String        @id @default(uuid())
  userId               String
  lessonPackId         String
  attemptNumber        Int           @default(1)
  status               AttemptStatus @default(IN_PROGRESS)
  packScore            Int?          
  earnedXp             Int?

  user                 User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  lessonPack           LessonPack        @relation(fields: [lessonPackId], references: [id], onDelete: Cascade)
  exerciseAttempts     ExerciseAttempt[]
}

model ExerciseAttempt {
  id                  String   @id @default(uuid())
  packAttemptId       String
  exerciseId          String
  retryCount          Int      @default(0)
  audioUrl            String?  // Thay vì Gộp audio, ta lưu từng audio cho mỗi câu.

  packAttempt         PackAttempt  @relation(fields: [packAttemptId], references: [id], onDelete: Cascade)
  exercise            Exercise     @relation(fields: [exerciseId], references: [id], onDelete: Restrict)
  aiEvaluation        AIEvaluation? 
}

model AIEvaluation {
  id                   String @id @default(uuid())
  exerciseAttemptId    String @unique 
  overallScore         Int
  transcription        String
  grammarScore         Int
  vocabScore           Int
  businessVocabScore   Int?   
  toneScore            Int?   
  coherenceScore       Int?   
  contentAccuracyScore Int
  
  // JSONB optimizes queries avoiding multiple table JOINS for text chunks
  suggestions          Json   @default("[]") 
  corrections          Json   @default("[]")
  nextSteps            Json   @default("[]")

  exerciseAttempt      ExerciseAttempt @relation(fields: [exerciseAttemptId], references: [id], onDelete: Cascade)
}
```

---

## Phần 5: Thiết Kế Kiến Trúc Microservices

Để bảo đảm tính độc lập, hệ thống được cấu trúc dựa trên giao tiếp bằng RestAPI / gRPC cho các truy vấn lấy dữ liệu đồng bộ (Sync), và Message Queue (RabbitMQ) cho các thay đổi trạng thái bất đồng bộ (Async).

1. **User Service 👤**: Cung cấp xác thực đăng nhập, cấu hình User, Cấp quyền gói Subscription. DB: `User`.
2. **Content Service 📚**: Quản trị tài liệu tham khảo đọc tần suất lớn, cung cấp giao diện hiển thị danh sách bài học. DB: `Category`, `Level`, `Topic`, `LessonPack`, `Exercise`.
3. **Learning Service 🎙️**: Quản lý phiên làm việc của user (Session). Nhận âm thanh nộp lên, kiểm soát giới hạn hằng ngày. DB: `PackAttempt`, `ExerciseAttempt`.
4. **AI Evaluation Service 🤖**: Worker chuyên biệt kéo file âm thanh về, phân tách gọi OpenAI, chấm điểm, nhả JSON về. DB: `AIEvaluation`.
5. **Progress Service 🏆**: Tách biệt luồng Gamification. Lắng nghe các event từ Learning Service (Ví dụ: Chơi xong) để tĩnh toán XP, tính Streak mà không làm chậm máy chủ xử lý học tập.

---

## Phần 6: Các Luồng Hệ Thống Chi Tiết

### 6.1 Luồng Thu Âm & Chấm Điểm Cơ Bản (Theo Đề Xuất Tối Ưu Mới)
*Sử dụng Queue để Xử lý ngầm (Background Optimistic Processing)*
1. **Client**: Thu âm Câu số 1 (Exercise 1). Ngay khi bấm "Tiếp Tục", đưa audio Câu 1 tự động upload lên S3.
2. **Client ➔ Learning Service**: REST `POST /attempts/{id}/exercise/1/submit-audio`. Cập nhật `ExerciseAttempt` chứa link S3 của Câu 1.
3. **Learning Service ➔ RabbitMQ**: Publish sự kiện `evaluation.requested` chứa link audio Câu 1.
4. **RabbitMQ ➔ AI Service**: Mở API qua Whisper dịch Text, sau đó gọi mô hình GPT để chấm điểm. AI lưu dữ liệu, sau đó publish `evaluation.completed`.
5. *(Cùng lúc đó)*: User đang ung dung bấm thu âm câu số 2, câu số 3. Khi tới ghi âm xong câu số 5, hệ thống đã hoàn tất chấm cả 4 câu trước đó.
6. Khi bấm nút "Gửi bài chấm điểm Pack", Loading Screen chỉ mất 1-2 giây cho câu số 5 chứ không mất 10s.

### 6.2 Luồng Cộng XP & Thăng Cấp (Event-Driven)
1. **Learning Service**: Publish Message `pack.completed` (Chứa `userId`, `packId`, `score`).
2. **Progress Service**: Tiêu thụ Message ➔ Dựa vào `score` tính Base XP ➔ Kiểm tra DB nếu có First-time bonus thì +20 XP.
3. Cập nhật `totalXp` tại DB Gamification. Kiểm tra xem điểm đã nhảy qua mốc level ProfileLevel chưa. Nếu có ➔ Publish message `user.leveled_up`. 
4. Kiểm tra UserLevelProgress. Nếu tiến độ bài tập vượt mức yêu cầu (VD >= 70%) ➔ Mở level Content tiếp theo, publish message `content.level.unlocked`.

---

## Phần 7: Đánh Giá Chuyên Sâu & Tối Ưu (Principal Review)

### 1. Điểm Nghẽn Lớn Nhất (Bottleneck) Đã Xử Lý
**Khách hàng gom file (Concatenate) & LLM Quá Tải**: Trong BRD, quy trình thu gộp 5 file audio thành 1 file rồi bắt AI phải phân tách văn bản trả về 5 object điểm số khác nhau có độ trễ siêu cao (10s+) và cực kỳ rủi ro việc AI bị ảo giác (chấm nhầm đánh giá câu này vào câu kia).
➔ **Giải pháp**: Phá vỡ việc ghép file. Áp dụng quy trình gửi Asynchronous (Async) cho TỪNG CÂU một (Đã cập nhật ở Phần 6.1). Vừa an toàn, LLM làm việc rất nhẹ, UI tốc độ phản hồi nhanh như Elsa Speak.

### 2. Tối Ưu Hóa Chi Phí Lớn (OpenAI Cost)
- **Kỹ thuật Semantic Caching**: Áp dụng Redis Cache cho khâu Text ➔ Phản hồi GPT. Trong tiếng Anh cơ bản, các học viên phát âm sai/đúng khá giống hệt nhau (Ví dụ: "I go to store"). Khi Whisper xuất ra text, ta băm sha256 (Hash: Text + Prompt ID) và check xem AI đã từng giải thích lỗi này chưa. Nếu có, bốc luôn trong Cache xuất ra JSON ➔ Tốc độ 10ms, triệt tiêu 100% Request Call GPT, tiết kiệm ngàn USD tiền API.
- **Micro-routing Tier LLM**: Người dùng `Free/Pro` ➔ Trỏ prompt về `gpt-4o-mini` (rẻ bèo, nhanh, đủ để chấm lỗi Grammar). Chỉ User `Premium` ➔ gọi `gpt-4o` để phân tích độ lịch sự nâng cao & từ vựng công sở (Business).

### 3. Nguy Cơ Rủi Ro Dữ Liệu Phân Tán
- Việc update thành tựu XP và TotalPlays ở Content Service có thể sai kết quả nếu tiến trình tắt OOM (Failed Queues).
- **Cách khắc phục**: Thiết lập Dead-Letter-Queues (DLQ) cho RabbitMQ trên mọi Microservice. Ứng dụng mô hình xử lý Idempotent (Các event mang ID nhất định, để nhỡ Service B có load lại 2 lần do mạng chập chờn thì không bao giờ cộng dư XP 2 lần).
