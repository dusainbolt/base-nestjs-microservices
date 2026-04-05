# 📗 04 — Lesson Pack List & Detail (Danh Sách Bài Học)

---

## 1. Mục Tiêu Trang

Hiển thị danh sách các Lesson Packs thuộc **1 category + 1 level** cụ thể. Mỗi pack chứa 5 bài tập (exercises). User chọn pack để bắt đầu hoặc tiếp tục luyện tập. Trang hiển thị progress, score, star rating, và **topic context** của từng pack.

### Cấu trúc navigation:

```
Category (Everyday/Office/Niche) → Level (1-4) → Lesson Packs → Exercises
```

---

## 2. Layout Tổng Quan

```
┌──────────────────────────────────────────────────────────┐
│  [← Level 2]      Lesson Packs           [🔍 Search]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🌍 Everyday English — Level 2 Elementary               │
│  "Shopping, Daily Routine, My Room"                      │
│  Tiến trình: ████░░░░░░ 37% (3/8 packs)                │
│                                                          │
│  ── LESSON PACKS ─────────────────────────────           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 📗 Daily Shopping                     ⭐⭐⭐      │    │
│  │ 👤 SpeakEng Official                            │    │
│  │ 🏷️ Everyday • Lv2 Elementary                    │    │
│  │ 🎯 5/5 xong  •  Score: 92/100  •  156 plays    │    │
│  │ ██████████ 100% ─── ĐÃ HOÀN THÀNH              │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 📗 Describing My Room                 ⭐⭐        │    │
│  │ 👤 SpeakEng Official                            │    │
│  │ 🏷️ Everyday • Lv2 Elementary                    │    │
│  │ 🎯 3/5 xong  •  Score: 78/100  •  89 plays     │    │
│  │ ██████░░░░ 60%                                  │    │
│  │                        [▶ Tiếp tục]             │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 📗 Morning & Night Routine            ☆          │    │
│  │ 👤 Teacher_Mai        ⭐ 4.8 rating              │    │
│  │ 🏷️ Everyday • Lv2 Elementary                    │    │
│  │ 🎯 0/5 xong  •  212 plays                      │    │
│  │ ░░░░░░░░░░ 0%                                   │    │
│  │                        [▶ Bắt đầu]              │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ... (scroll thêm)                                      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [🏠 Home]  [📚 Levels]  [🏆 Rank]  [👤 Profile]       │
└──────────────────────────────────────────────────────────┘
```

---

## 3. UI Components

### 3.1 Level + Topic Header

- **Category badge**: icon + tên (🌍 Everyday English / 💼 Office Foundation / 🎯 Niche Master)
- **Level badge**: "Level N — Tên Level"
- **Topic name**: hiển thị tên chủ đề tương ứng với category + level
  - Everyday Lv2: "Shopping, Daily Routine, My Room"
  - Office Lv2: "Daily Office Tasks"
  - Niche (IT) Lv2: "Hardware & Software"
- Overall progress bar cho level này: "N/M packs, X%"

### 3.2 Pack Card

Mỗi card hiển thị một Lesson Pack:

**Thông tin chính:**

- Tên pack: font-size 16px, bold
- Creator: avatar nhỏ (20px) + tên, gray-500
- **Category & Level tag**: Badge nhỏ hiển thị "Everyday • Lv2 Elementary"
- Loại: "Official" (badge xanh) hoặc "Community" (badge tím) — Phase 2
- Stats: số bài xong/tổng, Pack Score, lượt chơi
- Star rating (⭐ 1-3 sao) dựa trên Pack Score
- Progress bar: hiển thị % hoàn thành

**Trạng thái card:**

| Trạng thái   | Border-left | CTA          | Badge           |
| ------------ | ----------- | ------------ | --------------- |
| Chưa bắt đầu | gray-200    | "▶ Bắt đầu"  | —               |
| Đang làm     | blue-500    | "▶ Tiếp tục" | "Đang học"      |
| Hoàn thành   | green-500   | "🔄 Làm lại" | "Hoàn thành ✅" |

### 3.3 Sort & Filter Bar

- Dropdown sort: "Mặc định", "Điểm cao nhất", "Mới nhất", "Phổ biến nhất"
- Filter: "Tất cả", "Chưa xong", "Đã xong"
- Search: tìm theo tên pack

### 3.4 Pack Detail Bottom Sheet (tap vào card)

Khi tap card → slide-up bottom sheet (mobile) hoặc side panel (desktop):

```
┌──────────────────────────────────────────────────────┐
│  ──── ← kéo xuống để đóng                           │
│                                                      │
│  📗 Daily Shopping                                   │
│  👤 SpeakEng Official  •  Level 2 Elementary        │
│  🏷️ 🌍 Everyday English                            │
│  ⭐ 4.8 (45 ratings)  •  156 lượt chơi             │
│                                                      │
│  Mô tả: Học cách mô tả quần áo, hỏi giá tiền      │
│  và giao tiếp khi mua sắm.                          │
│                                                      │
│  📋 5 Câu Luyện Tập:                               │
│  1. ✅ "Describe the shirt"      — 92/100           │
│  2. ✅ "Ask about the price"     — 88/100           │
│  3. ✅ "Compare two items"       — 85/100           │
│  4. ⬜ "Return a product"        — chưa làm         │
│  5. ⬜ "Pay at the counter"      — chưa làm         │
│                                                      │
│  Pack Score: 87/100 ⭐⭐                             │
│                                                      │
│  [    ▶ Tiếp tục câu 4    ]  ← primary CTA         │
│  [    🔄 Làm lại từ đầu    ]  ← secondary          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 4. Trạng Thái Theo Gói (Pricing Logic)

| Element                 | 🆓 Free                   | ⭐ Pro               | 👑 Premium            |
| ----------------------- | ------------------------- | -------------------- | --------------------- |
| Packs hiển thị          | Tất cả (để thấy nội dung) | Tất cả               | Tất cả                |
| Packs có thể chơi       | Chỉ Level 1-2             | Tất cả level (1-4)   | Tất cả level (1-4)    |
| Daily limit             | 3 bài/ngày                | 20 bài/ngày          | Không giới hạn        |
| Pack > Level 2          | Khoá + overlay upsell     | Mở                   | Mở                    |
| Community packs         | Khoá (Phase 2)            | Mở (Phase 2)         | Mở + filter (Phase 2) |
| "Bắt đầu" khi hết quota | Đổi thành "Nâng cấp"      | Đổi thành "Hết lượt" | Không bao giờ         |

**Khi Free user tap pack Level 3-4:**

- Bottom sheet vẫn mở, hiển thị nội dung pack
- CTA đổi thành: "🔒 Yêu cầu gói PRO" → navigate Pricing page
- Overlay nhẹ với message: "Nâng cấp PRO để mở Level 3-4"

---

## 5. UX Interactions

### 5.1 Load Page

- Skeleton loading: 3 card placeholders
- Stagger-in animation cho cards (50ms delay mỗi card)
- Auto-scroll đến pack đang làm dở (nếu có)

### 5.2 Tap Card → Bottom Sheet / Side Panel

- Mobile: slide-up bottom sheet (60% viewport height), draggable
- Desktop: side panel bên phải (400px width), slide-in
- Hiển thị chi tiết pack + danh sách 5 câu + score từng câu

### 5.3 Tap "Tiếp tục" / "Bắt đầu"

- Navigate → trang Exercise Practice (05)
- Truyền params: packId, exerciseIndex (câu tiếp theo chưa làm)
- Transition: slide-right

### 5.4 Tap "Làm lại từ đầu"

- Confirm dialog: "Bạn muốn làm lại pack này? Điểm cũ vẫn được giữ."
- Confirm → navigate Exercise Practice, exerciseIndex = 0

### 5.5 Pull-to-Refresh

- Refresh danh sách packs + progress mới nhất

---

## 6. Responsive Design

### Mobile (< 640px)

- Full-width cards, stacked vertical
- Pack detail: bottom sheet
- Sort/filter: horizontal scroll pills

### Tablet (640px - 1024px)

- 2-column grid cho cards
- Pack detail: bottom sheet hoặc modal

### Desktop (> 1024px)

- 3-column grid cho cards
- Pack detail: persistent side panel bên phải
- Hover card → subtle shadow increase

---

## 7. Ghi Chú Kỹ Thuật

- API: `GET /levels/{levelId}/packs?category={category}&industry={industry}` → danh sách packs + user progress
- API: `GET /packs/{packId}/exercises` → chi tiết 5 câu + scores
- Pagination: infinite scroll hoặc "Load more" (20 packs/page)
- Search: debounce 300ms, client-side filter (nếu < 50 packs), server-side nếu nhiều hơn
- Image lazy loading cho pack thumbnails
- **Topic mapping**: Server trả về topic name dựa trên category + level:
  - Everyday + Lv1 → "Greeting, Family, Hobbies"
  - Office + Lv3 → "Weekly Recap"
  - Niche (IT) + Lv4 → "Technical Explanation"
