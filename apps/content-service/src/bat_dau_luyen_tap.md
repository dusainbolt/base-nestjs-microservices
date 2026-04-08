# Bắt Đầu Luyện Tập — API Design

## 1. Phân tích UI/UX

```
┌─────────────────────────────────────────────────────────────┐
│  SECTION 1 — Category Type chips                            │
│  [Everyday 25%]  [Office 23%]  [Niche 9%]                  │
├─────────────────────────────────────────────────────────────┤
│  SECTION 2 — Level chips (filter theo type đã chọn)        │
│  [✓ Lv1 100%]  [● Lv2 35%]  [🔒 Lv3]  [🔒 Lv4]          │
├─────────────────────────────────────────────────────────────┤
│  SECTION 3 — Category overview (most-progressed)            │
│  Everyday · Lv 2 Elementary                                 │
│  3/8 bài học · 14/40 câu · TB 78đ · 35%                   │
├─────────────────────────────────────────────────────────────┤
│  SECTION 4 — Danh sách pack gần đây (3 gần nhất)           │
│  Daily Shopping      88  Hoàn thành  5/5                   │
│  Describing My Room  78  Đang học    3/5                   │
│  Morning & Night Routine 82  Đang học  3/5                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Service Boundary — Nguyên tắc phân tách

| Loại dữ liệu | Service | Lý do |
|---|---|---|
| Category (tên, type, order) | **content-service** | Dữ liệu tĩnh, không đổi theo user |
| Level (id, passThreshold) | **content-service** | Dữ liệu tĩnh |
| LessonPack (title, totalExercises, status) | **content-service** | Nội dung học, không phụ thuộc user |
| Exercise (nội dung câu hỏi) | **content-service** | Nội dung tĩnh |
| User đã pass bao nhiêu exercise | **user-service** | Trạng thái tiến độ của từng user |
| User đã hoàn thành bao nhiêu pack | **user-service** | Trạng thái tiến độ |
| Điểm TB của user trong category/level | **user-service** | Dữ liệu hành vi user |
| Danh sách pack user làm gần đây | **user-service** | Lịch sử học tập của user |

---

## 3. Data Flow cho từng Section

### SECTION 1 — Category Type Completion %

**Công thức:** `completionPercent = passedExercises / totalExercises × 100`

```
content-service  →  GET_CATEGORIES_CONTENT_SUMMARY
                     Response: [{ type, totalPacks, totalExercises }]  ← mẫu số

user-service     →  GET_USER_CATEGORY_TYPE_PROGRESS_SUMMARY (NEW)
  Payload: { userId }
  Response: [{ categoryType, passedExercises }]  ← tử số

api-gateway      →  merge → Section 1 payload
```

---

### SECTION 2 — Level Chips (filtered by categoryType)

**Công thức:** `levelPercent = passedExercises / totalExercises × 100`
**Unlock logic:** Level N unlock khi Level N-1 đã pass hết (passedPacks = totalPacks).

```
content-service  →  GET_LEVELS
                     Response: [{ id, description, passThresholdScore }]

content-service  →  GET_TOTAL_EXERCISES_PER_LEVEL (×4 levels hoặc batch)
  Payload: { categoryType, levelId }
  Response: { categoryType, levelId, totalExercises }  ← mẫu số

user-service     →  GET_USER_LEVEL_PROGRESS (NEW)
  Payload: { userId, categoryType }
  Response: [{ levelId, passedExercises, completedPacks, totalPacks, isUnlocked }]
```

---

### SECTION 3 — Category Overview (most-progressed)

Hiển thị category mà user có số pack hoàn thành nhiều nhất nhưng chưa hoàn thành hết,
trong phạm vi `categoryType` + `levelId` đang chọn.

```
user-service     →  GET_USER_MOST_PROGRESSED_CATEGORY (NEW)
  Payload: { userId, categoryType, levelId }
  Response: { categoryId, completedPacks, completedExercises, avgScore } | null

content-service  →  GET_PACK_STATS_BY_CATEGORY_AND_LEVEL (NEW)
  Payload: { categoryId, levelId }
  Response: { categoryId, levelId, totalPacks, totalExercises }  ← mẫu số

content-service  →  GET_CATEGORY_BY_ID (đã có)
  Payload: { id: categoryId }
  Response: { id, name, type, ... }
```

---

### SECTION 4 — Recent Packs (3 gần nhất)

```
user-service     →  GET_USER_RECENT_PACKS (NEW)
  Payload: { userId, limit: 3 }
  Response: [{ packId, score, status, completedExercises, lastPlayedAt }]

content-service  →  GET_PACKS_BY_IDS (NEW)
  Payload: { ids: string[] }
  Response: [{ id, title, levelId, categoryId, totalExercises }]

api-gateway      →  zip by packId → Section 4 list
```

---

## 4. content-service — New Endpoints

### 4.1 LessonPack Controller

#### `GET_PACKS`
Lấy danh sách pack có filter. Dùng cho màn hình "Xem tất cả" trong level.

| Param | Type | Required | Mô tả |
|---|---|---|---|
| `categoryId` | `string` | ✗ | Filter theo category |
| `levelId` | `number` | ✗ | Filter theo level |
| `categoryType` | `CategoryType` | ✗ | Filter theo type (EVERYDAY/OFFICE/NICHE) |
| `status` | `PackStatus` | ✗ | Mặc định PUBLISHED |
| `limit` | `number` | ✗ | Số item mỗi trang, default 20 |
| `offset` | `number` | ✗ | Skip, default 0 |

Response: `{ items: LessonPackSummaryDto[], total: number }`

---

#### `GET_PACK_BY_ID`
Lấy chi tiết 1 pack (dùng khi user bấm vào play).

| Param | Type | Required | Mô tả |
|---|---|---|---|
| `id` | `string` | ✓ | Pack ID |

Response: `LessonPackDetailDto`

---

#### `GET_PACKS_BY_IDS`
Batch fetch nhiều pack theo danh sách IDs. Dùng cho Section 4 sau khi
user-service trả về `[{ packId, ... }]`.

| Param | Type | Required | Mô tả |
|---|---|---|---|
| `ids` | `string[]` | ✓ | Danh sách pack IDs (max 50) |

Response: `{ items: LessonPackSummaryDto[] }`
*Chú ý: thứ tự items giữ nguyên theo thứ tự `ids` truyền vào.*

---

#### `GET_PACK_STATS_BY_CATEGORY_AND_LEVEL`
Đếm tổng packs + exercises cho một category trong một level.
Dùng làm mẫu số cho Section 3 overview.

| Param | Type | Required | Mô tả |
|---|---|---|---|
| `categoryId` | `string` | ✓ | Category ID |
| `levelId` | `number` | ✓ | Level ID (1–4) |

Response: `{ categoryId, levelId, totalPacks, totalExercises }`

---

#### `GET_PACK_EXERCISES`
Lấy tất cả exercises trong một pack (dùng khi user bắt đầu làm bài).

| Param | Type | Required | Mô tả |
|---|---|---|---|
| `packId` | `string` | ✓ | Pack ID |

Response: `{ items: ExerciseSummaryDto[], total: number }`

---

## 5. user-service — Endpoints cần thêm mới

> **Scope tài liệu này**: Chỉ mô tả interface, không implement ở đây.

### `GET_USER_CATEGORY_TYPE_PROGRESS_SUMMARY`
```typescript
Payload: { userId: string }
Response: {
  items: Array<{
    categoryType: CategoryType;
    passedExercises: number;   // tử số
  }>
}
```

### `GET_USER_LEVEL_PROGRESS`
```typescript
Payload: { userId: string; categoryType: CategoryType }
Response: {
  items: Array<{
    levelId: number;
    passedExercises: number;
    completedPacks: number;
    isUnlocked: boolean;
  }>
}
```

### `GET_USER_MOST_PROGRESSED_CATEGORY`
```typescript
Payload: { userId: string; categoryType: CategoryType; levelId: number }
Response: {
  categoryId: string;
  completedPacks: number;
  completedExercises: number;
  avgScore: number;           // điểm TB
} | null
```

### `GET_USER_RECENT_PACKS`
```typescript
Payload: { userId: string; limit: number }
Response: {
  items: Array<{
    packId: string;
    score: number;
    status: 'IN_PROGRESS' | 'COMPLETED';
    completedExercises: number;
    lastPlayedAt: string;   // ISO timestamp
  }>
}
```

---

## 6. API Gateway — Orchestration (Bắt Đầu Luyện Tập Screen)

```typescript
// GET /learn/start?categoryType=EVERYDAY&levelId=2
async getBatDauLuyenTap(userId: string, categoryType: CategoryType, levelId: number) {

  // --- SECTION 1: Category type % ---
  const [contentSummary, userCategoryProgress] = await Promise.all([
    this.contentClient.send(GET_CATEGORIES_CONTENT_SUMMARY, {}),
    this.userClient.send(GET_USER_CATEGORY_TYPE_PROGRESS_SUMMARY, { userId }),
  ]);
  // merge để tính % per type

  // --- SECTION 2: Level chips ---
  const [levels, userLevelProgress] = await Promise.all([
    this.contentClient.send(GET_LEVELS, {}),
    this.userClient.send(GET_USER_LEVEL_PROGRESS, { userId, categoryType }),
  ]);
  // Đếm totalExercises per level từ contentSummary hoặc gọi thêm GET_TOTAL_EXERCISES_PER_LEVEL

  // --- SECTION 3: Most-progressed category ---
  const mostProgressed = await this.userClient.send(
    GET_USER_MOST_PROGRESSED_CATEGORY,
    { userId, categoryType, levelId }
  );
  if (mostProgressed) {
    const [categoryInfo, packStats] = await Promise.all([
      this.contentClient.send(GET_CATEGORY_BY_ID, { id: mostProgressed.categoryId }),
      this.contentClient.send(GET_PACK_STATS_BY_CATEGORY_AND_LEVEL, {
        categoryId: mostProgressed.categoryId,
        levelId,
      }),
    ]);
  }

  // --- SECTION 4: Recent packs ---
  const recentPacks = await this.userClient.send(GET_USER_RECENT_PACKS, { userId, limit: 3 });
  const packDetails = await this.contentClient.send(GET_PACKS_BY_IDS, {
    ids: recentPacks.items.map(p => p.packId),
  });
  // zip packDetails với recentPacks by packId
}
```

---

## 7. Response Shape cho Frontend

```typescript
// GET /learn/start
{
  categoryTypes: [
    { type: 'EVERYDAY', label: 'Everyday', completionPercent: 25, isSelected: true },
    { type: 'OFFICE',   label: 'Office',   completionPercent: 23, isSelected: false },
    { type: 'NICHE',    label: 'Niche',    completionPercent: 9,  isSelected: false },
  ],

  levels: [
    { id: 1, label: 'Lv 1', completionPercent: 100, isUnlocked: true,  isSelected: false },
    { id: 2, label: 'Lv 2', completionPercent: 35,  isUnlocked: true,  isSelected: true  },
    { id: 3, label: 'Lv 3', completionPercent: 0,   isUnlocked: false, isSelected: false },
    { id: 4, label: 'Lv 4', completionPercent: 0,   isUnlocked: false, isSelected: false },
  ],

  categoryOverview: {
    categoryId: 'uuid',
    categoryName: 'Everyday',
    levelLabel: 'Lv 2 Elementary',
    completedPacks: 3,
    totalPacks: 8,
    completedExercises: 14,
    totalExercises: 40,
    avgScore: 78,
    completionPercent: 35,
  },

  recentPacks: [
    {
      packId: 'uuid-1',
      title: 'Daily Shopping',
      score: 88,
      status: 'COMPLETED',
      completedExercises: 5,
      totalExercises: 5,
      lastPlayedAt: '2024-01-15T10:30:00Z',
    },
    {
      packId: 'uuid-2',
      title: 'Describing My Room',
      score: 78,
      status: 'IN_PROGRESS',
      completedExercises: 3,
      totalExercises: 5,
      lastPlayedAt: '2024-01-14T09:00:00Z',
    },
  ],
}
```
