# 🏠 02 — Home Dashboard (Trang Chủ Sau Đăng Nhập)

---

## 1. Mục Tiêu Trang

Là trang đầu tiên sau đăng nhập. Hiển thị tổng quan tiến trình học tập, khuyến khích user tiếp tục luyện tập (continue last lesson), và giới thiệu nhanh các tính năng chính. Đây là hub điều hướng trung tâm.

---

## 2. Layout Tổng Quan

Mobile-first single column, desktop chuyển thành 2-column layout.

```
┌──────────────────────────────────────────────────────────┐
│  [☰ Menu]    SpeakEng    [🔔] [👤 Avatar]                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Chào Du! 👋                                             │
│  🔥 Streak: 12 ngày  •  💎 2,450 XP  •  🥈 Silver       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  📚 TIẾP TỤC HỌC                                │    │
│  │  ┌──────────────────────────────────────────┐    │    │
│  │  │ 📗 Daily Greetings — Level 2             │    │    │
│  │  │ 🏷️ Everyday English                     │    │    │
│  │  │ ████████░░ 80% (4/5 câu)                │    │    │
│  │  │ Điểm cao nhất: 85/100 ⭐⭐               │    │    │
│  │  │                    [▶ Tiếp tục]          │    │    │
│  │  └──────────────────────────────────────────┘    │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  📊 THỐNG KÊ NHANH                              │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │    │
│  │  │  42     │ │  87     │ │  #15    │            │    │
│  │  │ Bài xong│ │ Điểm TB │ │ Rank    │            │    │
│  │  └─────────┘ └─────────┘ └─────────┘            │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  🗺️ CHỌN CATEGORY & LEVEL                       │    │
│  │  [🌍 Everyday] [💼 Office] [🎯 Niche]            │    │
│  │  [Lv1 ✅] [Lv2 🔵] [Lv3 🔒] [Lv4 🔒]           │    │
│  │                            [Xem tất cả →]       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  🔥 BÀI HỌC PHỔ BIẾN                           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │    │
│  │  │ Pack 1   │ │ Pack 2   │ │ Pack 3   │         │    │
│  │  │ ⭐ 4.8   │ │ ⭐ 4.6   │ │ ⭐ 4.5   │         │    │
│  │  └──────────┘ └──────────┘ └──────────┘         │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  👑 NÂNG CẤP PREMIUM  (nếu Free/Pro)            │    │
│  │  "Học giao tiếp công sở chuyên nghiệp"          │    │
│  │  [Tìm hiểu thêm]                                │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [🏠 Home]  [📚 Levels]  [🏆 Rank]  [👤 Profile]       │
└──────────────────────────────────────────────────────────┘
```

---

## 3. UI Components

### 3.1 Top Navigation Bar

- Chiều cao: 56px, background white, border-bottom 1px gray-100
- Trái: hamburger menu (☰) → slide-out sidebar (Settings, Pricing, Help)
- Giữa: Logo text "SpeakEng"
- Phải: notification bell (🔔) + avatar nhỏ (32px circle)

### 3.2 Welcome Banner

- Greeting: "Chào {Tên}! 👋" — font-size 20px, font-weight 700
- Stats inline: Streak badge (🔥 N ngày), XP count, Profile Level icon
- Background: subtle gradient card hoặc transparent

### 3.3 Continue Learning Card

- Card nổi bật nhất trang, background gradient xanh dương nhạt
- Hiển thị lesson pack gần nhất chưa hoàn thành
- **Topic Category badge**: hiển thị tag (🌍 Everyday / 💼 Office / 🎯 Niche) dưới tên pack
- Progress bar (chiều ngang, color primary)
- CTA button "▶ Tiếp tục" — primary style, border-radius 8px
- Nếu chưa bắt đầu bài nào → đổi thành "🚀 Bắt đầu học ngay"

### 3.4 Quick Stats Row

- 3 stat cards ngang hàng (flex)
- Mỗi card: số lớn (font-size 28px, bold) + label nhỏ dưới
- Stat 1: Tổng bài hoàn thành
- Stat 2: Điểm trung bình
- Stat 3: Xếp hạng tuần (nếu có leaderboard)

### 3.5 Category & Level Selector

**Category tabs (hàng 1):**

- 3 tab ngang: 🌍 Everyday English | 💼 Office Foundation | 🎯 Niche Master
- Active tab: underline primary + bold
- Mỗi tab filter danh sách level/topic theo category

**Level chips (hàng 2):**

- Dãy ngang 4 level (Level 1-4), hiển thị tương ứng category đã chọn
- Level đã mở: icon + số, clickable
- Level đang học: highlight viền xanh, pulse animation nhẹ
- Level khoá: grayscale + icon 🔒
- "Xem tất cả →" link sang trang Level Selection

> **Hệ thống 4 Level:**
>
> - Level 1: Beginner
> - Level 2: Elementary
> - Level 3: Pre-Intermediate
> - Level 4: Intermediate

### 3.6 Popular Packs Carousel

- Horizontal scroll, 3 cards visible trên desktop, 1.5 trên mobile
- Mỗi card: thumbnail, tên pack, **category badge**, rating, lượt chơi
- Tap → đi đến trang Lesson Pack

### 3.7 Upsell Banner (Conditional)

- Chỉ hiển thị cho user Free hoặc Pro
- Card với gradient vàng/tím, icon 👑
- Copy: tuỳ gói hiện tại:
  - Free → "Nâng cấp PRO để xem feedback chi tiết!"
  - Pro → "Nâng cấp PREMIUM để học giao tiếp công sở!"
- CTA: "Tìm hiểu thêm" → link sang Pricing page
- Có nút X để dismiss (ẩn 7 ngày)

### 3.8 Bottom Tab Bar (Mobile)

- Fixed bottom, height 60px, background white, shadow-top
- 4 tabs: Home (🏠), Levels (📚), Rankings (🏆), Profile (👤)
- Active tab: icon + text color primary, inactive: gray-400

---

## 4. Trạng Thái Theo Gói (Pricing Logic)

| Element           | 🆓 Free                                     | ⭐ Pro             | 👑 Premium        |
| ----------------- | ------------------------------------------- | ------------------ | ----------------- |
| Continue Learning | Hiển thị bình thường                        | Bình thường        | Bình thường       |
| Quick Stats       | Chỉ "Bài xong"                              | Đầy đủ 3 stats     | Đầy đủ 3 stats    |
| Level Selector    | Chỉ Level 1-2 mở                            | Tất cả 4 level mở  | Tất cả 4 level mở |
| Category tabs     | Hiển thị tất cả, nhưng packs Level 3-4 khoá | Tất cả             | Tất cả            |
| Popular Packs     | Hiển thị, nhưng khoá nếu > Level 2          | Hiển thị tất cả    | Hiển thị tất cả   |
| Upsell Banner     | "Nâng cấp PRO"                              | "Nâng cấp PREMIUM" | Ẩn                |
| Lessons remaining | "Còn 2/3 bài hôm nay"                       | "Còn 15/20 bài"    | "Không giới hạn"  |

---

## 5. UX Interactions

### 5.1 First-time User (Onboarding)

1. Sau đăng ký → redirect về Dashboard
2. Hiển thị onboarding overlay nhẹ (3 bước):
   - "Chọn category và level phù hợp với bạn"
   - "Ghi âm và nhận phản hồi từ AI"
   - "Luyện tập mỗi ngày để giữ streak!"
3. Dismiss → hiển thị Dashboard bình thường
4. Continue Learning → suggest Level 1, Pack đầu tiên (Everyday English)

### 5.2 Returning User

1. Auto-load Continue Learning card với bài gần nhất
2. Streak count update realtime (nếu hôm nay chưa luyện → hiển thị warning "Luyện 1 bài để giữ streak! 🔥")
3. Notification bell: đỏ nếu có achievement mới, ranking thay đổi

### 5.3 Daily Limit Indicator

- Hiển thị ở góc card Continue Learning hoặc banner nhỏ
- Free: "Còn 2/3 bài hôm nay" với progress ring
- Pro: "Còn 15/20 bài hôm nay"
- Premium: badge "♾️ Không giới hạn"
- Khi hết quota → CTA đổi thành "Nâng cấp để học thêm"

### 5.4 Category Switching

- Tap category tab → cập nhật level chips + hiển thị topics thuộc category
- Animation: fade-transition content bên dưới
- Remember last selected category (localStorage)

### 5.5 Pull-to-Refresh

- Kéo xuống → refresh stats, streak, continue learning card

---

## 6. Responsive Design

### Mobile (< 640px)

- Single column, full-width cards
- Category tabs: horizontal scroll pills
- Level selector: horizontal scroll với snap
- Bottom tab bar cố định
- Popular packs: 1 card visible + peek vào card tiếp theo

### Tablet (640px - 1024px)

- 2-column grid: Quick Stats + Continue ở trên, Levels + Packs ở dưới
- Bottom tab bar → chuyển thành sidebar collapse

### Desktop (> 1024px)

- Left sidebar cố định (200px): navigation menu
- Main content 2 columns: trái (60%) = Continue + Levels, phải (40%) = Stats + Upsell
- Popular packs: 3 cards per row
- Bottom tab bar ẩn, dùng sidebar

---

## 7. Ghi Chú Kỹ Thuật

- API calls khi load: `GET /me/dashboard` (stats, streak, current lesson, quota remaining)
- Cache: dashboard data cache 5 phút, invalidate khi hoàn thành bài
- Skeleton loading cho từng section (không block toàn page)
- Lazy load Popular Packs section
- Streak warning: check local time so với server time (timezone user)
- Category preference: lưu `lastSelectedCategory` trong localStorage
