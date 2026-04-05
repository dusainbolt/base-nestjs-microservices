# 🗺️ 03 — Level & Topic Selection (Chọn Cấp Độ & Chủ Đề)

---

## 1. Mục Tiêu Trang

Hiển thị toàn bộ **4 cấp độ** (Beginner → Intermediate) kết hợp với **3 nhóm chủ đề** (Everyday English, Office Foundation, Niche Master) dưới dạng roadmap trực quan. User thấy rõ mình đang ở đâu trong từng category, đã hoàn thành gì, và cần làm gì để mở khoá level tiếp theo.

### Cấu trúc hệ thống:

```
┌─────────────────────────────────────────────────────┐
│  3 CATEGORIES × 4 LEVELS                            │
│                                                     │
│  🌍 Everyday English    │ Lv1 │ Lv2 │ Lv3 │ Lv4 │  │
│  💼 Office Foundation   │ Lv1 │ Lv2 │ Lv3 │ Lv4 │  │
│  🎯 Niche Master        │ Lv1 │ Lv2 │ Lv3 │ Lv4 │  │
│     ├── 🏥 Y Tế                                    │
│     ├── 👥 Nhân Sự                                 │
│     ├── 🏨 Dịch Vụ                                 │
│     ├── 💻 Công Nghệ                               │
│     └── 💰 Tài Chính                               │
└─────────────────────────────────────────────────────┘
```

---

## 2. Layout Tổng Quan

Tab-based layout, mỗi tab là 1 category, bên trong hiển thị roadmap 4 levels dọc.

```
┌──────────────────────────────────────────────────────────┐
│  [← Back]        Cấp Độ & Chủ Đề        [🔔] [👤]       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [🌍 Everyday]  [💼 Office]  [🎯 Niche ▾]              │
│                                                          │
│  Bạn đang ở: Level 2 — Elementary 🟢                    │
│  ████████░░░░░░░░ 45% hoàn thành                        │
│                                                          │
│  ── ROADMAP ─────────────────────────────────────        │
│                                                          │
│  ⓵ Beginner ✅                                          │
│  │  "Greeting, Family, Hobbies"                         │
│  │  ⭐⭐⭐ 95/100  •  5/5 packs xong                    │
│  │  ─────────────── 100% ██████████                     │
│  │                                                       │
│  ⓶ Elementary 🔵 ← ĐANG HỌC                            │
│  │  "Shopping, Daily Routine, My Room"                   │
│  │  ⭐⭐  78/100  •  3/8 packs xong                     │
│  │  ─────────────── 37% ████░░░░░░                      │
│  │  [▶ Tiếp tục học]                                    │
│  │                                                       │
│  ⓷ Pre-Intermediate 🔒                                  │
│  │  "Travel Memories, My Last Weekend"                   │
│  │  Yêu cầu: Level 2 ≥ 70%, Streak ≥ 3 ngày           │
│  │  [🔒 Chưa mở]                                       │
│  │                                                       │
│  ⓸ Intermediate 🔒                                      │
│     "Lifestyle Choices, Healthy Living"                  │
│     [🔒 Chưa mở]                                        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [🏠 Home]  [📚 Levels]  [🏆 Rank]  [👤 Profile]       │
└──────────────────────────────────────────────────────────┘
```

### Niche Master — Có thêm industry selector:

```
┌──────────────────────────────────────────────────────────┐
│  [🌍 Everyday]  [💼 Office]  [🎯 Niche ▾]              │
│                                                          │
│  Chọn ngành nghề:                                       │
│  [🏥 Y Tế] [👥 Nhân Sự] [🏨 Dịch Vụ]                  │
│  [💻 Công Nghệ] [💰 Tài Chính]                         │
│                                                          │
│  ── 🏥 Y TẾ: ROADMAP ───────────────────────            │
│                                                          │
│  ⓵ Beginner ✅                                          │
│  │  "Hospital Basics"                                    │
│  │  ⭐⭐⭐ 90/100  •  5/5 packs xong                    │
│  │                                                       │
│  ⓶ Elementary 🔵 ← ĐANG HỌC                            │
│  │  "Body & Symptoms"                                    │
│  │  ⭐⭐  75/100  •  2/5 packs xong                     │
│  │  [▶ Tiếp tục học]                                    │
│  │                                                       │
│  ⓷ Pre-Intermediate 🔒                                  │
│  │  "Medical History"                                    │
│  │                                                       │
│  ⓸ Intermediate 🔒                                      │
│     "Diagnosis"                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. UI Components

### 3.1 Header

- Tiêu đề "Cấp Độ & Chủ Đề" — centered, font-size 18px bold
- Nút Back (←) về Dashboard

### 3.2 Category Tabs

- 3 tabs ngang: 🌍 Everyday English | 💼 Office Foundation | 🎯 Niche Master
- Active tab: underline primary + bold, inactive: gray-500
- Niche tab có dropdown indicator (▾) để mở industry selector
- Tabs cố định khi scroll (sticky)

### 3.3 Industry Selector (Chỉ cho Niche Master)

- Hiển thị khi chọn tab Niche
- 5 chip buttons: Y Tế, Nhân Sự, Dịch Vụ, Công Nghệ, Tài Chính
- Mỗi chip có icon + tên ngành
- Active chip: background primary-100, border primary
- Horizontal scroll trên mobile

### 3.4 Current Position Indicator

- Banner nhỏ phía trên roadmap
- "Bạn đang ở: Level N — Tên" + overall progress bar cho category hiện tại

### 3.5 Level Card (Mở — Completed)

- Background: white, border-left 4px green
- Icon level: số trong circle xanh lá + ✅
- Tên level: font bold, font-size 16px
- **Tên topic**: hiển thị topic tương ứng level & category (1 dòng italic, gray-500)
- Stats: Pack Score (⭐ rating) + số packs hoàn thành
- Progress bar: full green (100%)

### 3.6 Level Card (Mở — In Progress)

- Background: white, border-left 4px blue, shadow-md (nổi bật hơn)
- Icon level: số trong circle xanh dương + pulse animation
- Badge "ĐANG HỌC" nhỏ, background blue-100, text blue-700
- **Tên topic**: hiển thị topic tương ứng level & category
- Progress bar: partial fill, color blue
- CTA: "▶ Tiếp tục học" button — primary style

### 3.7 Level Card (Khoá)

- Background: gray-50, border-left 4px gray-300
- Icon level: 🔒 grayscale
- Tên + mô tả: color gray-400
- Hiển thị unlock requirements:
  - "Level N ≥ 70% hoàn thành"
  - "Streak ≥ 3 ngày"
  - "Điểm TB ≥ 70"
- Không có CTA, opacity 0.6

### 3.8 Roadmap Line (đường nối)

- Vertical line (2px) nối các level card (chỉ 4 trạm)
- Đoạn đã xong: solid green
- Đoạn đang học: dashed blue
- Đoạn khoá: dotted gray

---

## 4. Trạng Thái Theo Gói (Pricing Logic)

| Element            | 🆓 Free                           | ⭐ Pro                    | 👑 Premium     |
| ------------------ | --------------------------------- | ------------------------- | -------------- |
| Levels hiển thị    | Tất cả 4 level                    | Tất cả 4 level            | Tất cả 4 level |
| Levels có thể mở   | Chỉ Level 1-2                     | Level 1-4 (theo progress) | Level 1-4      |
| Level 3-4 cho Free | Hiển thị + overlay "Nâng cấp PRO" | N/A                       | N/A            |
| Category tabs      | Tất cả category visible           | Tất cả                    | Tất cả         |
| Pack limit warning | "Còn N/3 bài hôm nay"             | "Còn N/20"                | Không hiển thị |

**Free user nhấn vào Level 3-4:**

- Modal popup: "Level này yêu cầu gói PRO trở lên"
- CTA: "Xem gói PRO — 79K/tháng" + "Dùng thử 7 ngày miễn phí"

---

## 5. UX Interactions

### 5.1 Tap vào Category Tab

- Chuyển roadmap sang category tương ứng
- Giữ trạng thái progress riêng cho mỗi category
- Animation: slide/fade transition
- Niche → mở industry selector bên dưới tabs

### 5.2 Tap vào Industry Chip (Niche)

- Chuyển roadmap sang ngành nghề được chọn
- Mỗi ngành có progress riêng biệt
- Smooth transition content

### 5.3 Tap vào Level Card (Mở)

- Navigate → trang Lesson Pack List (04) với filter: category + level
- Transition: slide-right

### 5.4 Tap vào Level Card (Khoá)

- Nếu khoá do chưa đủ progress → tooltip/toast: "Hoàn thành 70% Level N trước"
- Nếu khoá do gói Free → upsell modal (xem mục 4)

### 5.5 Scroll Behavior

- Khi load trang: auto-scroll đến level đang học (centered trên viewport)
- Smooth scroll, có thể manual scroll xem tất cả

### 5.6 Animation

- Level cards stagger-in khi load (mỗi card delay 50ms)
- Progress bar animate fill khi visible (intersection observer)
- Roadmap line "draw" animation từ trên xuống (4 trạm)

### 5.7 Achievement Unlock

- Khi user vừa mở khoá level mới → confetti animation nhẹ + toast "🎉 Level N đã mở!"

---

## 6. Responsive Design

### Mobile (< 640px)

- Full-width cards, padding 16px
- Category tabs: horizontal scroll pills (sticky top)
- Industry chips: horizontal scroll
- Roadmap line: absolute left 24px
- Level icon: 40px circle
- Progress bar dưới mô tả, full-width

### Tablet (640px - 1024px)

- Cards max-width 600px, centered
- Roadmap line vẫn bên trái
- Category tabs và industry chips centered

### Desktop (> 1024px)

- 2-column: trái = roadmap (60%), phải = detail panel (40%)
- Detail panel: khi hover/click level → hiển thị danh sách packs của level đó
- Category tabs nằm trên cùng, full-width
- Niche industry selector: grid 5 columns
- Transition: fade-in cho detail panel

---

## 7. Ghi Chú Kỹ Thuật

- API: `GET /levels?category={category}&industry={industry}` → trả về 4 level + user progress
- Unlock logic server-side: kiểm tra `completion_rate >= 0.7 AND avg_score >= pass_threshold AND streak >= 3`
- Pass threshold per level:
  - Level 1 (Beginner): 60 điểm
  - Level 2 (Elementary): 65 điểm
  - Level 3 (Pre-Intermediate): 70 điểm
  - Level 4 (Intermediate): 70 điểm
- Cache level data: 10 phút, invalidate khi hoàn thành bài
- Deep link: `/levels?category=everyday&level=3` → tự chọn tab + scroll đến Level 3
- Category/industry selection: persist trong localStorage
