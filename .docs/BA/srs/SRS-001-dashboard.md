# 📋 SRS-001: Home Dashboard

> **Module:** Home Dashboard (Trang Chủ Sau Đăng Nhập)
> **Phiên bản:** 1.0
> **Ngày tạo:** 2026-04-06
> **Tài liệu thiết kế gốc:** [02-home-dashboard.md](../design/02-home-dashboard.md)
> **PRD tham chiếu:** [01-PRD.md](../01-PRD.md) — Mục 8 (Scoring), Mục 9 (Ranking)

---

## 1. Tổng Quan

### 1.1 Mục đích

Trang Home Dashboard là hub trung tâm sau đăng nhập, cung cấp cho người dùng cái nhìn tổng quan về tiến trình học tập, nhanh chóng quay lại bài học dở dang, và điều hướng tới các khu vực chính của ứng dụng.

### 1.2 Phạm vi

Tài liệu này mô tả chi tiết các yêu cầu chức năng (Functional Requirements) cho **2 khu vực chính** trên Dashboard:

| Khu vực                                     | Mô tả                                                                                    |
| :------------------------------------------ | :--------------------------------------------------------------------------------------- |
| **Section A** — Welcome & Continue Learning | Lời chào, badge thống kê nhanh (Streak, XP), thẻ tiếp tục bài học, Quick Stats           |
| **Section B** — Bắt Đầu Luyện Tập           | Bộ chọn Category & Level, tổng quan tiến trình, danh sách bài học trong level, CTA chính |

### 1.3 Actors

| Actor              | Vai trò                                                 |
| :----------------- | :------------------------------------------------------ |
| **Learner (User)** | Người dùng đã đăng nhập, có thể là Free / Pro / Premium |
| **System**         | Backend API tính toán và trả về dữ liệu dashboard       |

---

## 2. Section A — Welcome & Continue Learning

### 2.1 Feature: Welcome Header

#### FR-A01: Hiển thị lời chào cá nhân hóa

| Thuộc tính    | Chi tiết                                                      |
| :------------ | :------------------------------------------------------------ |
| **ID**        | FR-A01                                                        |
| **Mô tả**     | Hiển thị lời chào có tên người dùng và câu hỏi khuyến khích   |
| **Hiển thị**  | `"Chào {displayName}! 👋"` — dùng displayName từ profile user |
| **Phụ đề**    | `"Hôm nay học gì nào?"`                                       |
| **Vị trí**    | Góc trên trái trang Dashboard                                 |
| **Điều kiện** | User đã đăng nhập thành công                                  |

#### FR-A02: Badge Streak

| Thuộc tính     | Chi tiết                                                                     |
| :------------- | :--------------------------------------------------------------------------- |
| **ID**         | FR-A02                                                                       |
| **Mô tả**      | Hiển thị badge chuỗi ngày luyện tập liên tiếp                                |
| **Hiển thị**   | `"🔥 {currentStreak} ngày"`                                                  |
| **Vị trí**     | Góc trên phải cạnh badge XP                                                  |
| **Style**      | Chip/badge có nền nhạt, icon lửa, chữ số nổi bật                             |
| **Giá trị**    | `currentStreak` — số nguyên >= 0 lấy từ API                                  |
| **Edge case**  | Nếu `currentStreak = 0` → hiển thị `"🔥 0 ngày"` hoặc ẩn badge (TBD theo UX) |
| **Tap action** | Mở modal/popup chi tiết Streak (tính năng Phase 2, hiện không hành động)     |

#### FR-A03: Badge XP

| Thuộc tính     | Chi tiết                                                                   |
| :------------- | :------------------------------------------------------------------------- |
| **ID**         | FR-A03                                                                     |
| **Mô tả**      | Hiển thị tổng điểm kinh nghiệm tích lũy                                    |
| **Hiển thị**   | `"🏆 {totalXP} XP"` — format số có dấu phẩy ngăn hàng nghìn (ví dụ: 2,450) |
| **Vị trí**     | Góc trên phải, bên phải badge Streak                                       |
| **Style**      | Chip/badge có nền nhạt, icon trophy/globe                                  |
| **Giá trị**    | `totalXP` — số nguyên >= 0 lấy từ API                                      |
| **Tap action** | Điều hướng tới trang Profile                                               |

---

### 2.2 Feature: Continue Learning Card

#### FR-A04: Thẻ "Tiếp Tục Học"

| Thuộc tính     | Chi tiết                                                                     |
| :------------- | :--------------------------------------------------------------------------- |
| **ID**         | FR-A04                                                                       |
| **Mô tả**      | Card nổi bật hiển thị bài học (Lesson Pack) gần nhất mà user chưa hoàn thành |
| **Vị trí**     | Ngay dưới Welcome Header, full-width                                         |
| **Background** | Gradient xanh dương (blue → cyan), border-radius lớn                         |

**Nội dung bên trong card:**

| Trường         | Giá trị                                                           | Mô tả                                                                    |
| :------------- | :---------------------------------------------------------------- | :----------------------------------------------------------------------- |
| Label          | `"TIẾP TỤC HỌC"`                                                  | Text cố định, in hoa, font nhỏ, màu trắng mờ                             |
| Title          | `"{lessonPack.title}"`                                            | Tên Lesson Pack, font lớn bold, màu trắng                                |
| Subtitle       | `"{category.name} · Level {level.id}"`                            | Tên category + level, font nhỏ, màu trắng mờ                             |
| Progress Label | `"Tiến trình"`                                                    | Label cố định bên trái                                                   |
| Progress Value | `"{completionPercent}% ({passedExercises}/{totalExercises} câu)"` | Bên phải                                                                 |
| Progress Bar   | Thanh ngang                                                       | Chiều dài proportional với `completionPercent`, nền trắng mờ, fill trắng |
| Play Button    | Icon ▶ tròn                                                       | Góc phải, background trắng mờ, tap → vào bài tập tiếp theo               |

#### FR-A05: Logic xác định bài "Tiếp Tục Học"

| Thuộc tính          | Chi tiết                                                                                                                                                                                                                                                                        |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**              | FR-A05                                                                                                                                                                                                                                                                          |
| **Mô tả**           | Quy tắc xác định Lesson Pack nào hiển thị trên Continue Learning Card                                                                                                                                                                                                           |
| **Ưu tiên**         | 1. LessonPack có exercise cuối cùng user đã hoàn thành nhưng pack chưa 100%`<br>` 2. Nếu không có → LessonPack đầu tiên theo thứ tự (order) trong Category/Level thấp nhất chưa hoàn thành `<br>` 3. Nếu tất cả đã hoàn thành → hiển thị pack có điểm thấp nhất (gợi ý làm lại) |
| **Tính toán**       | `completionPercent = (passedExercises / totalExercises) × 100`, làm tròn xuống                                                                                                                                                                                                  |
| **passedExercises** | Số exercise trong pack mà user đã đạt >= ngưỡng pass của level tương ứng                                                                                                                                                                                                        |
| **totalExercises**  | Tổng số exercise trong pack (thường = 5)                                                                                                                                                                                                                                        |

#### FR-A06: Trạng thái khi chưa có bài nào

| Thuộc tính   | Chi tiết                                                                                              |
| :----------- | :---------------------------------------------------------------------------------------------------- |
| **ID**       | FR-A06                                                                                                |
| **Mô tả**    | Trạng thái Continue Learning Card cho user mới chưa học bài nào                                       |
| **Hiển thị** | Label đổi thành `"BẮT ĐẦU HỌC"`, Title = Pack đầu tiên (Level 1, Everyday), Progress = `0% (0/5 câu)` |
| **CTA**      | Nút đổi thành `"🚀 Bắt đầu học ngay"`                                                                 |

---

### 2.3 Feature: Quick Stats Row

#### FR-A07: Thống kê nhanh — Bài xong

| Thuộc tính   | Chi tiết                                                                     |
| :----------- | :--------------------------------------------------------------------------- |
| **ID**       | FR-A07                                                                       |
| **Mô tả**    | Hiển thị tổng số bài tập user đã hoàn thành (đạt Pass)                       |
| **Hiển thị** | Icon 📖 + số lớn `"{totalCompletedExercises}"` + label `"Bài xong"`          |
| **Vị trí**   | Card 1/3 trong row, bên trái                                                 |
| **Giá trị**  | Tổng tất cả exercise đã Pass trên toàn bộ hệ thống (mọi category, mọi level) |
| **Style**    | Card có border nhẹ, icon trên, số lớn giữa (font 28px bold), label nhỏ dưới  |

#### FR-A08: Thống kê nhanh — Điểm TB

| Thuộc tính    | Chi tiết                                                                                    |
| :------------ | :------------------------------------------------------------------------------------------ |
| **ID**        | FR-A08                                                                                      |
| **Mô tả**     | Hiển thị điểm trung bình tất cả bài tập đã hoàn thành                                       |
| **Hiển thị**  | Icon 📈 + số lớn `"{averageScore}"` + label `"Điểm TB"`                                     |
| **Vị trí**    | Card 2/3 trong row, ở giữa                                                                  |
| **Giá trị**   | `averageScore = SUM(bestScorePerExercise) / totalCompletedExercises`, làm tròn về số nguyên |
| **Edge case** | Nếu chưa hoàn thành bài nào → hiển thị `"--"`                                               |

#### FR-A09: Thống kê nhanh — Xếp hạng

| Thuộc tính     | Chi tiết                                                          |
| :------------- | :---------------------------------------------------------------- |
| **ID**         | FR-A09                                                            |
| **Mô tả**      | Hiển thị vị trí xếp hạng tuần của user trong bảng Top Learners    |
| **Hiển thị**   | Icon 🏆 + số lớn `"#{weeklyRank}"` + label `"Xếp hạng"`           |
| **Vị trí**     | Card 3/3 trong row, bên phải                                      |
| **Giá trị**    | Vị trí (rank) của user theo Tổng XP kiếm được trong tuần hiện tại |
| **Edge case**  | Nếu user chưa có XP trong tuần → hiển thị `"#--"`                 |
| **Tap action** | Điều hướng tới trang Rankings                                     |

#### FR-A10: Quick Stats theo gói dịch vụ

| Thuộc tính      | Chi tiết                                                                  |
| :-------------- | :------------------------------------------------------------------------ |
| **ID**          | FR-A10                                                                    |
| **Mô tả**       | Giới hạn hiển thị Quick Stats theo gói subscription                       |
| **Gói Free**    | Chỉ hiển thị "Bài xong", 2 card còn lại hiển thị với icon 🔒 + "Nâng cấp" |
| **Gói Pro**     | Hiển thị đầy đủ cả 3 stats                                                |
| **Gói Premium** | Hiển thị đầy đủ cả 3 stats                                                |

---

## 3. Section B — Bắt Đầu Luyện Tập

### 3.1 Feature: Section Header

#### FR-B01: Header "Bắt Đầu Luyện Tập"

| Thuộc tính   | Chi tiết                                                                            |
| :----------- | :---------------------------------------------------------------------------------- |
| **ID**       | FR-B01                                                                              |
| **Mô tả**    | Tiêu đề section với icon và subtitle                                                |
| **Hiển thị** | Icon ⚙️ +`"Bắt Đầu Luyện Tập"` (bold) + `"Chọn chủ đề & cấp độ"` (subtitle)         |
| **Link**     | `"Chi tiết >"` góc phải → điều hướng tới trang Level Selection (03-level-selection) |

---

### 3.2 Feature: Category Selector

#### FR-B02: Tab chọn Category

| Thuộc tính           | Chi tiết                                                                                                     |
| :------------------- | :----------------------------------------------------------------------------------------------------------- |
| **ID**               | FR-B02                                                                                                       |
| **Mô tả**            | 3 tab cho phép chọn nhóm chủ đề lớn                                                                          |
| **Danh sách tab**    | `Everyday` (🏠), `Office` (🏢), `Niche` (🎯)                                                                 |
| **Hiển thị mỗi tab** | Icon + Tên category type + Progress % của category đó                                                        |
| **Progress %**       | `categoryProgress = (totalPassedExercisesInCategory / totalExercisesInCategory) × 100`                       |
| **Active state**     | Border highlight xanh, icon nổi bật, font bold                                                               |
| **Inactive state**   | Border mờ, icon grayscale nhẹ                                                                                |
| **Default**          | Tab cuối cùng user đã chọn (lưu localStorage key:`lastSelectedCategory`). Nếu không có → mặc định `Everyday` |
| **Interaction**      | Tap tab → cập nhật Level Selector + Summary + Lesson List phía dưới, animation fade-transition               |

---

### 3.3 Feature: Level Selector

#### FR-B03: Dãy chọn Level (Chips)

| Thuộc tính    | Chi tiết                                                                                 |
| :------------ | :--------------------------------------------------------------------------------------- |
| **ID**        | FR-B03                                                                                   |
| **Mô tả**     | Dãy ngang 4 chip đại diện cho 4 Level, hiển thị theo Category đã chọn                    |
| **Danh sách** | `Lv 1` (Beginner), `Lv 2` (Elementary), `Lv 3` (Pre-Intermediate), `Lv 4` (Intermediate) |

**Trạng thái mỗi Level chip:**

| Trạng thái          | Điều kiện                        | Hiển thị                                                                  |
| :------------------ | :------------------------------- | :------------------------------------------------------------------------ |
| **Hoàn thành (✅)** | `levelProgress == 100%`          | Icon ✅, text xanh lá, progress 100%, có thể tap                          |
| **Đang học (🔵)**   | Level đã mở khóa nhưng chưa 100% | Icon 🔵 (dot), nền xanh nổi bật (active), hiển thị progress %, có thể tap |
| **Khóa (🔒)**       | Chưa đáp ứng điều kiện mở khóa   | Icon 🔒, text xám, nền xám nhạt, KHÔNG thể tap                            |

#### FR-B04: Logic hiển thị progress mỗi Level

| Thuộc tính    | Chi tiết                                                                                      |
| :------------ | :-------------------------------------------------------------------------------------------- |
| **ID**        | FR-B04                                                                                        |
| **Mô tả**     | Tính toán và hiển thị % hoàn thành cho mỗi Level trong Category đã chọn                       |
| **Công thức** | `levelProgress = (totalPassedExercisesInLevel / totalExercisesInLevel) × 100`, làm tròn xuống |
| **Scope**     | Chỉ tính các exercise thuộc các LessonPack trong Category đang chọn + Level tương ứng         |
| **Hiển thị**  | Số % ngay dưới tên Level (ví dụ:`"35%"`)                                                      |

#### FR-B05: Logic mở khóa Level

| Thuộc tính          | Chi tiết                                                                                                                                |
| :------------------ | :-------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**              | FR-B05                                                                                                                                  |
| **Mô tả**           | Điều kiện để một Level chuyển từ 🔒 sang mở khóa                                                                                        |
| **Level 1**         | Luôn mở khóa                                                                                                                            |
| **Level N (N > 1)** | Mở khóa khi Level N-1 đáp ứng đồng thời:`<br>` 1. Hoàn thành >= 70% bài tập ở Level N-1 `<br>` 2. Điểm trung bình >= 70/100 ở Level N-1 |
| **Tham chiếu**      | [04-level-system.md — Mục 4](../04-level-system.md)                                                                                     |

#### FR-B06: Default Level khi chọn Category

| Thuộc tính  | Chi tiết                                                                               |
| :---------- | :------------------------------------------------------------------------------------- |
| **ID**      | FR-B06                                                                                 |
| **Mô tả**   | Logic chọn Level mặc định khi user chuyển Category                                     |
| **Ưu tiên** | 1. Level cao nhất đang mở khóa mà chưa 100% (đang học)`<br>` 2. Nếu không có → Level 1 |

---

### 3.4 Feature: Level Summary (Tổng Quan)

#### FR-B07: Thông tin tổng quan Category + Level

| Thuộc tính | Chi tiết                                                      |
| :--------- | :------------------------------------------------------------ |
| **ID**     | FR-B07                                                        |
| **Mô tả**  | Card tổng quan hiển thị khi user đã chọn cả Category và Level |
| **Header** | `"Tổng quan {categoryType} · Lv {levelId} {levelName}"`       |
| **Ví dụ**  | `"Tổng quan Everyday · Lv 2 Elementary"`                      |

**Các chỉ số trong Summary:**

| Chỉ số           | Hiển thị                                      | Tính toán                                                                                                     |
| :--------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Số bài học**   | `"📖 {passedPacks}/{totalPacks} bài học"`     | `passedPacks` = số LessonPack mà user đã Pass **tất cả** exercise. `totalPacks` = tổng LessonPack trong scope |
| **Số câu**       | `"📚 {passedExercises}/{totalExercises} câu"` | Tổng exercise đã Pass / Tổng exercise trong scope                                                             |
| **Điểm TB**      | `"📈 {avgScore} điểm TB"`                     | Trung bình**best score** của các exercise đã làm trong scope. Nếu chưa làm = `"--"`                           |
| **% Hoàn thành** | `"{levelProgress}% hoàn thành"`               | =`passedExercises / totalExercises × 100`, font lớn, bold                                                     |

**Progress Bar tổng:**

- Thanh ngang full-width, chiều dài theo `levelProgress`
- Màu gradient xanh dương → cyan

---

### 3.5 Feature: Danh Sách Bài Học Trong Level

#### FR-B08: Lesson Pack List Header

| Thuộc tính            | Chi tiết                                                                         |
| :-------------------- | :------------------------------------------------------------------------------- |
| **ID**                | FR-B08                                                                           |
| **Mô tả**             | Header cho danh sách Lesson Pack                                                 |
| **Hiển thị**          | `"Bài học trong Lv {levelId}"` (bên trái) + `"Xem tất cả >"` (bên phải, link)    |
| **Link "Xem tất cả"** | Điều hướng tới trang Level Selection, pre-filter theo Category + Level đang chọn |

#### FR-B09: Lesson Pack Item

| Thuộc tính | Chi tiết                                              |
| :--------- | :---------------------------------------------------- |
| **ID**     | FR-B09                                                |
| **Mô tả**  | Mỗi item trong danh sách đại diện cho một Lesson Pack |

**Hiển thị mỗi Lesson Pack Item:**

| Thành phần         | Chi tiết                                                                                            |
| :----------------- | :-------------------------------------------------------------------------------------------------- |
| **Status Dot**     | Chấm tròn nhỏ bên trái, màu theo trạng thái                                                         |
| **Title**          | `"{lessonPack.title}"` — font bold                                                                  |
| **Score**          | `"{packBestScore}"` — điểm cao nhất (best score trung bình), bên phải, font bold, màu theo xếp hạng |
| **Status Label**   | Text trạng thái bên phải (xem FR-B10)                                                               |
| **Progress Bar**   | Thanh ngang nhỏ dưới title                                                                          |
| **Exercise Count** | `"{passedExercises}/{totalExercises} câu"` — font nhỏ, bên phải dưới                                |
| **Play Button**    | Icon ▶ bên phải, tap → vào exercise tiếp theo chưa hoàn thành                                       |

#### FR-B10: Trạng thái Lesson Pack

| Thuộc tính | Chi tiết                                              |
| :--------- | :---------------------------------------------------- |
| **ID**     | FR-B10                                                |
| **Mô tả**  | 3 trạng thái của mỗi Lesson Pack theo tiến trình user |

| Trạng thái     | Điều kiện                                       | Hiển thị                                                                                   |
| :------------- | :---------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **Hoàn thành** | Tất cả exercise trong pack đã Pass              | Dot xanh lá ●, Score màu xanh lá, label `"Hoàn thành"`, progress bar xanh lá 100%          |
| **Đang học**   | Có ít nhất 1 exercise đã Pass nhưng chưa tất cả | Dot xanh dương ●, Score màu xanh dương, label `"Đang học"`, progress bar xanh dương theo % |
| **Chưa học**   | Chưa có exercise nào được Pass                  | Dot xám ○, không hiển thị Score, label `"Chưa học"`, progress bar xám 0%                   |

#### FR-B11: Giới hạn hiển thị và "Xem thêm"

| Thuộc tính            | Chi tiết                                                                                                |
| :-------------------- | :------------------------------------------------------------------------------------------------------ |
| **ID**                | FR-B11                                                                                                  |
| **Mô tả**             | Giới hạn số lượng Lesson Pack hiển thị trên Dashboard                                                   |
| **Mặc định hiển thị** | Tối đa**4 Lesson Packs**                                                                                |
| **Ưu tiên sắp xếp**   | 1. Pack "Đang học" ở trên cùng`<br>` 2. Pack "Chưa học" tiếp theo `<br>` 3. Pack "Hoàn thành" cuối cùng |
| **Xem thêm**          | Nếu tổng packs > 4 → hiển thị link `"+{remaining} bài học khác"` ở cuối danh sách                       |
| **Tap "Xem thêm"**    | Điều hướng tới trang Level Selection chi tiết                                                           |

#### FR-B12: Màu sắc Score theo điểm

| Thuộc tính | Chi tiết                               |
| :--------- | :------------------------------------- |
| **ID**     | FR-B12                                 |
| **Mô tả**  | Quy tắc màu hiển thị cho packBestScore |

| Khoảng điểm | Màu            | Xếp hạng   |
| :---------- | :------------- | :--------- |
| 90 - 100    | 🟢 Xanh lá đậm | Excellent  |
| 80 - 89     | 🟢 Xanh lá     | Good       |
| 70 - 79     | 🔵 Xanh dương  | Pass       |
| 50 - 69     | 🟠 Cam         | Needs Work |
| 0 - 49      | 🔴 Đỏ          | Try Again  |

---

### 3.6 Feature: CTA "Tiếp Tục Học Ngay"

#### FR-B13: Nút hành động chính

| Thuộc tính              | Chi tiết                                                                                                                                                                                                                                                     |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                  | FR-B13                                                                                                                                                                                                                                                       |
| **Mô tả**               | Nút CTA cố định ở cuối Section B                                                                                                                                                                                                                             |
| **Hiển thị**            | `"▶ Tiếp tục học ngay"` — full-width button                                                                                                                                                                                                                  |
| **Style**               | Gradient xanh dương → cyan (giống Continue Learning Card), border-radius lớn, shadow nhẹ, font bold trắng, height 56px                                                                                                                                       |
| **Hành động**           | Điều hướng tới exercise tiếp theo chưa hoàn thành trong Level/Category đang chọn                                                                                                                                                                             |
| **Logic chọn exercise** | 1. Lấy Lesson Pack đầu tiên theo trạng thái "Đang học" → exercise chưa Pass đầu tiên`<br>` 2. Nếu không có "Đang học" → Pack "Chưa học" đầu tiên → exercise 1 `<br>` 3. Nếu tất cả "Hoàn thành" → Pack có score thấp nhất → exercise đầu tiên (gợi ý ôn tập) |
| **Trạng thái thay thế** | Nếu user mới chưa học gì →`"🚀 Bắt đầu học ngay"`                                                                                                                                                                                                            |

---

## 4. API Requirements

### 4.1 Endpoint: GET /api/dashboard

**Mô tả:** Trả về toàn bộ dữ liệu cần thiết cho Dashboard.

**Request:**

```
GET /api/dashboard
Headers: Authorization: Bearer {accessToken}
```

**Response Schema:**

```json
{
  "user": {
    "displayName": "string",
    "totalXP": "number",
    "currentStreak": "number",
    "profileLevel": {
      "level": "number",
      "name": "string",
      "icon": "string"
    },
    "subscription": "FREE | PRO | PREMIUM"
  },

  "continueLearning": {
    "lessonPackId": "string",
    "lessonPackTitle": "string",
    "categoryName": "string",
    "categoryType": "EVERYDAY | OFFICE | NICHE",
    "levelId": "number",
    "levelName": "string",
    "passedExercises": "number",
    "totalExercises": "number",
    "completionPercent": "number",
    "nextExerciseId": "string"
  },

  "quickStats": {
    "totalCompletedExercises": "number",
    "averageScore": "number | null",
    "weeklyRank": "number | null"
  },

  "categories": [
    {
      "type": "EVERYDAY | OFFICE | NICHE",
      "icon": "string",
      "name": "string",
      "progressPercent": "number"
    }
  ],

  "selectedCategoryLevels": [
    {
      "levelId": "number",
      "levelName": "string",
      "progressPercent": "number",
      "isUnlocked": "boolean",
      "isCompleted": "boolean"
    }
  ]
}
```

### 4.2 Endpoint: GET /api/dashboard/level-detail

**Mô tả:** Trả về tổng quan và danh sách bài học cho một Category + Level cụ thể.

**Request:**

```
GET /api/dashboard/level-detail?categoryType={EVERYDAY|OFFICE|NICHE}&levelId={1|2|3|4}
Headers: Authorization: Bearer {accessToken}
```

**Response Schema:**

```json
{
  "summary": {
    "categoryType": "string",
    "levelId": "number",
    "levelName": "string",
    "passedPacks": "number",
    "totalPacks": "number",
    "passedExercises": "number",
    "totalExercises": "number",
    "averageScore": "number | null",
    "levelProgress": "number"
  },

  "lessonPacks": [
    {
      "id": "string",
      "title": "string",
      "status": "COMPLETED | IN_PROGRESS | NOT_STARTED",
      "packBestScore": "number | null",
      "passedExercises": "number",
      "totalExercises": "number",
      "progressPercent": "number",
      "nextExerciseId": "string | null"
    }
  ]
}
```

### 4.3 Caching Strategy

| Item                                         | TTL    | Invalidation                                                |
| :------------------------------------------- | :----- | :---------------------------------------------------------- |
| Dashboard data (`/api/dashboard`)            | 5 phút | Khi user hoàn thành exercise, khi ngày mới bắt đầu (streak) |
| Level detail (`/api/dashboard/level-detail`) | 5 phút | Khi user hoàn thành exercise thuộc category+level đó        |

---

## 5. Business Rules

### BR-01: Tính passedExercises

Một exercise được coi là **Passed** khi user đạt điểm `overallScore >= passThresholdScore` của level tương ứng:

| Level                      | Ngưỡng Pass |
| :------------------------- | :---------- |
| Level 1 — Beginner         | >= 60 điểm  |
| Level 2 — Elementary       | >= 65 điểm  |
| Level 3 — Pre-Intermediate | >= 70 điểm  |
| Level 4 — Intermediate     | >= 70 điểm  |

### BR-02: Tính packBestScore

```
packBestScore = AVG(bestScore of each exercise in pack)
```

- Chỉ tính các exercise mà user đã làm ít nhất 1 lần.
- `bestScore` = điểm cao nhất trong tất cả các lần thử (attempts) của exercise đó.
- Nếu chưa làm exercise nào → `packBestScore = null`.

### BR-03: Tính averageScore (Quick Stats)

```
averageScore = SUM(bestScore of all passed exercises) / totalPassedExercises
```

- Scope: toàn bộ exercises của user trên tất cả categories và levels.
- Làm tròn thành số nguyên.

### BR-04: Tính weeklyRank

- Xếp hạng dựa trên **tổng XP kiếm được trong tuần hiện tại** (Thứ 2 00:00 → Chủ Nhật 23:59, timezone UTC+7).
- Nếu user chưa có XP trong tuần → `weeklyRank = null`.

### BR-05: Tính categoryProgress

```
categoryProgress = (totalPassedExercisesInCategory / totalExercisesInCategory) × 100
```

- Scope: tất cả exercises thuộc tất cả levels trong category type đó.

### BR-06: Tính levelProgress

```
levelProgress = (totalPassedExercisesInLevel / totalExercisesInLevel) × 100
```

- Scope: tất cả exercises thuộc category type đang chọn + level ID cụ thể.

---

## 6. UI States & Edge Cases

### 6.1 Loading State

| Component              | Loading UX                                      |
| :--------------------- | :---------------------------------------------- |
| Welcome Header         | Skeleton: 2 thanh text placeholder              |
| Streak / XP Badge      | Skeleton: 2 chip placeholder hình chữ nhật      |
| Continue Learning Card | Skeleton: Card hình chữ nhật với shimmer effect |
| Quick Stats            | Skeleton: 3 card vuông với shimmer              |
| Category Tabs          | Skeleton: 3 tab placeholder                     |
| Level Summary          | Skeleton: Card dài với 4 placeholder ngang      |
| Lesson Pack List       | Skeleton: 4 row placeholder                     |

> Mỗi section load **độc lập** (không block toàn trang).

### 6.2 Empty States

| Tình huống                                 | Hiển thị                                                                              |
| :----------------------------------------- | :------------------------------------------------------------------------------------ |
| User mới, chưa học bài nào                 | Continue Card → "BẮT ĐẦU HỌC", Stats hiển thị 0/--/#--, Lesson list tất cả "Chưa học" |
| Category chưa có LessonPack (ví dụ: Niche) | Hiển thị message:`"Nội dung đang được cập nhật. Hãy quay lại sau! 📝"`                |
| Level bị khóa                              | Chip xám + icon 🔒, tap → hiển thị tooltip `"Hoàn thành 70% Level {N-1} để mở khóa"`  |

### 6.3 Error State

| Lỗi               | Xử lý                                                     |
| :---------------- | :-------------------------------------------------------- |
| API timeout / 5xx | Hiển thị thông báo lỗi + nút "Thử lại"                    |
| Token hết hạn     | Redirect về trang Login                                   |
| Network offline   | Hiển thị cached data (nếu có) + banner "Đang ngoại tuyến" |

---

## 7. Responsive Behavior

| Breakpoint              | Layout                                                                                                       |
| :---------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Mobile** (< 640px)    | Single column full-width. Category tabs horizontal scroll. Bottom tab bar 60px. CTA button sticky bottom.    |
| **Tablet** (640-1024px) | 2-column: Section A bên trái, Section B bên phải. Bottom tab bar → sidebar collapse.                         |
| **Desktop** (> 1024px)  | Sidebar cố định trái 200px. Main 2-column: trái 60% (Continue + Practice), phải 40% (Stats + Quick actions). |

---

## 8. Acceptance Criteria

### AC-01: Welcome & Badges

- [ ] Hiển thị đúng tên user sau đăng nhập
- [ ] Badge Streak hiển thị đúng số ngày streak hiện tại
- [ ] Badge XP hiển thị đúng tổng XP với format có dấu phẩy

### AC-02: Continue Learning

- [ ] Hiển thị đúng Lesson Pack gần nhất chưa hoàn thành
- [ ] Progress bar phản ánh đúng % exercise đã Pass
- [ ] Tap Play button → điều hướng tới exercise tiếp theo chưa Pass
- [ ] User mới → hiển thị "BẮT ĐẦU HỌC" với Pack đầu tiên

### AC-03: Quick Stats

- [ ] Hiển thị đúng tổng bài hoàn thành
- [ ] Hiển thị đúng điểm trung bình (hoặc "--" nếu chưa có)
- [ ] Hiển thị đúng xếp hạng tuần (hoặc "#--" nếu chưa có)
- [ ] Gói Free chỉ thấy "Bài xong", 2 stats còn lại bị khóa

### AC-04: Category Selector

- [ ] 3 tab Category hiển thị đúng tên, icon, progress %
- [ ] Chuyển tab → cập nhật Level chips + Summary + Lesson list
- [ ] Lưu tab cuối vào localStorage, load lại đúng tab khi quay lại

### AC-05: Level Selector

- [ ] 4 Level chips hiển thị đúng trạng thái (✅ / 🔵 / 🔒)
- [ ] Level đã hoàn thành hiển thị 100% và icon ✅
- [ ] Level đang học nổi bật với nền xanh + progress %
- [ ] Level khóa hiển thị 🔒, không tap được, có tooltip giải thích

### AC-06: Level Summary

- [ ] Hiển thị đúng 4 chỉ số: bài học, câu, điểm TB, % hoàn thành
- [ ] Dữ liệu cập nhật khi đổi Category hoặc Level

### AC-07: Lesson Pack List

- [ ] Hiển thị tối đa 4 packs, sắp xếp đúng ưu tiên
- [ ] Mỗi pack hiển thị đúng: title, score, status, progress, exercise count
- [ ] Link "+N bài học khác" hiển thị khi > 4 packs
- [ ] Tap play button → vào đúng exercise tiếp theo

### AC-08: CTA Button

- [ ] Nút "Tiếp tục học ngay" điều hướng đúng tới exercise tiếp theo
- [ ] User mới → nút đổi thành "Bắt đầu học ngay"

---

## 9. Traceability Matrix

| Requirement     | PRD Ref                    | Design Ref             | User Story   |
| :-------------- | :------------------------- | :--------------------- | :----------- |
| FR-A01 ~ FR-A03 | —                          | 02-home-dashboard §3.2 | US-04        |
| FR-A04 ~ FR-A06 | PRD §8.5                   | 02-home-dashboard §3.3 | US-10, US-11 |
| FR-A07 ~ FR-A10 | PRD §8.1, §8.3             | 02-home-dashboard §3.4 | US-04        |
| FR-B01          | —                          | 02-home-dashboard §3.5 | —            |
| FR-B02          | PRD §7                     | 02-home-dashboard §3.5 | US-10        |
| FR-B03 ~ FR-B06 | PRD §7, 04-level-system §4 | 02-home-dashboard §3.5 | US-10, US-16 |
| FR-B07          | PRD §8.5                   | 02-home-dashboard §3.5 | US-04        |
| FR-B08 ~ FR-B12 | PRD §8.5                   | — (cải tiến mới)       | US-10, US-11 |
| FR-B13          | —                          | 02-home-dashboard §3.3 | US-11, US-12 |
