# BÁO CÁO CHẤT LƯỢNG DỮ LIỆU SPEAKING PRACTICE

> Phân tích toàn bộ `input/` — 162 files, 2,522 packs, 12,610 exercises
> Mục tiêu: **Natural · Diverse · Context-appropriate · Non-repetitive**
> Chuẩn áp dụng: `data/level/level.json`

---

## TỔNG QUAN

|                      | Level 1 (BEGINNER) | Level 2 (ELEMENTARY) | Level 3 (PRE_INTERMEDIATE) |
| :------------------- | :----------------: | :------------------: | :------------------------: |
| Files                |         54         |          54          |             54             |
| Packs                |        823         |         830          |            869             |
| Exercises            |       4,115        |        4,150         |           4,345            |
| **Tổng lỗi**         |      **174**       |        **71**        |           **50**           |
| Avg opener diversity |        12%         |         15%          |            22%             |
| Context opener ratio |        24%         |         29%          |            44%             |

**Xu hướng tích cực:** Chất lượng cải thiện dần từ L1→L3, nhưng L1 và L2 còn nhiều vấn đề cần fix trước khi scale.

---

## ✅ NHỮNG GÌ ĐÃ ĐẠT ĐƯỢC

### 1. Cấu trúc JSON hoàn chỉnh và nhất quán

Tất cả 162 files đều có đủ 4 trường bắt buộc: `p` (prompt), `m` (instruction VI), `h` (hint), `s` (sample). Không có file nào bị lỗi cấu trúc hoặc thiếu field.

### 2. Placeholder đa dạng và đúng context

Dataset dùng đầy đủ 6 placeholder:

- Level 1–2: `[studentName]`, `[studentAge]`, `[studentCity]`, `[studentJob]`, `[studentSchool]`
- Level 3: bổ sung `[studentAddress]`, `[studentPhoneNumber]`

Placeholder được dùng đúng theo ngữ cảnh ở phần lớn file — ngoại trừ các vấn đề được ghi nhận bên dưới.

### 3. Level 1 — name intro đã cơ bản được xử lý

Sau đợt fix trước, Level 1 chỉ còn **2 instances** `My name is` — cả 2 nằm trong ngữ cảnh shipping/delivery (`"My name is on the package."`) có thể coi là hợp lệ về mặt ngữ cảnh.

### 4. Level 3 có opener đa dạng nhất

Context opener ratio ở L3 đạt **44%** — gần một nửa câu trả lời không bắt đầu bằng "I/My/Hi/Hello". Một số file tốt:

- `everyday-cultural-nuances-slang-idioms_level_3.json`
- `niche-e_commerce-customer-reviews-analysis_level_3.json`

### 5. Niche/e_commerce và Niche/finance ít lỗi nhất

Level 2–3 của 2 nhánh này gần như sạch — chủ yếu chỉ có vài repetitive opener, không có grammar violation.

---

## ❌ VẤN ĐỀ CẦN XỬ LÝ

---

## LEVEL 1 — BEGINNER (174 lỗi)

### 🔴 Vấn đề 1: Dùng connector "because / so / therefore" — vi phạm quy tắc Level 1

**61 instances** — Nghiêm trọng nhất ở Level 1.

Level 1 quy định: **Câu đơn, 1 ý, Present Simple, không connector nối câu.**
Tuy nhiên AI liên tục sinh ra câu ghép kiểu:

```
"I like the idea because it is simple."          ← niche-education
"I work hard because I like to help."            ← office-performance-review
"It is canceled because the boss is sick."       ← office-problem-solution
"He is late because of traffic."                 ← office-problem-solution
```

**Phân bố:**

| Category               | Số lỗi |
| :--------------------- | :----: |
| Niche/education        |   28   |
| Office                 |   15   |
| Everyday               |   14   |
| Niche/customer_service |   4    |

**→ Prompt fix:** Thêm hard rule vào system prompt:
`"Level 1 STRICT: Each sample answer must be ONE simple sentence. NEVER use 'because', 'so', 'therefore', 'but because'. Split into 2 separate sentences if needed."`

---

### 🔴 Vấn đề 2: Dùng Past Tense — vi phạm quy tắc Level 1

**34 instances** — Level 1 chỉ được dùng Present Simple.

```
"I bought a white shirt last week."              ← niche-e_commerce-discounts
"I saw a blue dress with 30% discount."          ← niche-e_commerce-discounts
"Yes, the service was good."                     ← niche-customer_service
"I do not know who did it."                      ← office-conflict-resolution
```

**Phân bố:**

| Category               | Số lỗi |
| :--------------------- | :----: |
| Everyday               |   25   |
| Niche/e_commerce       |   4    |
| Niche/education        |   3    |
| Office                 |   1    |
| Niche/customer_service |   1    |

**→ Prompt fix:**
`"Level 1 TENSE LOCK: Only Present Simple tense allowed. Replace any past tense verb (was/were/went/had/did/got/bought/saw) with present equivalent or rephrase entirely."`

---

### 🟡 Vấn đề 3: Opener lặp lại — quá nhiều câu bắt đầu bằng "I"

**36 files** có tỷ lệ "I" opener vượt 40% — nặng nhất là Office group:

| File                               | "I" opener |  Tỷ lệ  |
| :--------------------------------- | :--------: | :-----: |
| office-my-job_level_1              |   61/75    | **81%** |
| office-meeting-argument_level_1    |   52/75    | **69%** |
| office-daily-office-tasks_level_1  |   51/75    | **68%** |
| office-performance-review_level_1  |   49/75    | **65%** |
| office-conflict-resolution_level_1 |   47/80    | **59%** |

Khi học sinh nghe/đọc 15 bài liên tiếp trong 1 pack, đa số đều bắt đầu bằng "I" → cảm giác robot, thiếu tự nhiên.

**→ Prompt fix:**
`"DIVERSITY RULE: In each pack of 5 exercises, at most 2 sample answers should start with 'I'. Vary openers: use 'Yes,', 'Sure,', 'Of course.', 'There is...', 'The [noun]...', 'We...', 'It is...', question echoes, etc."`

---

### 🟡 Vấn đề 4: Duplicate prompt trong cùng 1 file

**36 instances** — cùng câu hỏi xuất hiện ở 2 pack khác nhau trong cùng file:

```
"What is the problem?"     → xuất hiện 2x trong office-conflict-resolution
"Where do you work?"       → xuất hiện 2x trong office-cross-team-collaboration
"What do you think...?"    → xuất hiện 2x trong office-meeting-argument
```

**→ Prompt fix:**
`"UNIQUENESS: Every prompt (p field) within a file must be unique. Before finalizing, check for duplicates across all packs in the file."`

---

### 🟠 Vấn đề 5: Từ vựng vượt A1 — "solution"

**5 instances** trong Office và customer_service — từ "solution" xuất hiện ở Level 1 dù thuộc nhóm từ nên tránh (nhiều âm tiết, trừu tượng).

```
"I want a solution."                        ← office-conflict-resolution
"We talk and find a solution."              ← office-weekly-recap
```

**→ Prompt fix:**
`"Vocab check L1: Replace 'solution' with 'answer', 'fix', or 'way'. Replace 'problem' with 'issue' only if simpler; otherwise keep 'problem'. Avoid abstract nouns."`

---

## LEVEL 2 — ELEMENTARY (71 lỗi)

### 🔴 Vấn đề 1: "My name is [studentName]" chưa được xử lý

**32 instances** — Level 2 chưa nhận được đợt fix name-intro như Level 1. Tập trung ở Office và Education:

| Category               | Số lỗi |
| :--------------------- | :----: |
| Office                 |   7    |
| Niche/education        |   8    |
| Everyday               |   8    |
| Niche/customer_service |   6    |
| Niche/finance          |   3    |

Ví dụ điển hình:

```
"My name is [studentName]. I am a [studentJob]."         ← office-cross-team
"My name is [studentName]. I work as a [studentJob]."    ← office-my-job
"Nice to meet you. I am [studentName]..."                 ← office-my-job
```

**→ Cần áp dụng lại toàn bộ logic fix name-intro cho Level 2**, tương tự đã làm với L1.

---

### 🟡 Vấn đề 2: Opener lặp lại — "I" vẫn chiếm quá nhiều

**38 files** bị flag — nặng nhất:

| File                               | "I" opener |  Tỷ lệ  |
| :--------------------------------- | :--------: | :-----: |
| office-conflict-resolution_level_2 |   75/85    | **88%** |
| office-daily-office-tasks_level_2  |   61/85    | **72%** |
| office-performance-review_level_2  |   50/75    | **67%** |

Xu hướng: Office group ở L2 còn tệ hơn L1 về opener diversity.

**→ Áp dụng cùng diversity rule như L1.**

---

## LEVEL 3 — PRE_INTERMEDIATE (50 lỗi)

### 🟡 Vấn đề 1: "My name is [studentName]" còn tồn tại

**25 instances** — ít hơn L2 nhưng vẫn cần xử lý. Nặng nhất ở Everyday và Education:

| Category               | Số lỗi |
| :--------------------- | :----: |
| Everyday               |   11   |
| Niche/education        |   8    |
| Niche/customer_service |   3    |
| Office                 |   2    |

Ở Level 3 việc dùng `[studentName]` trong câu trả lời còn kém tự nhiên hơn vì học sinh đã đủ trình độ giới thiệu bản thân theo cách khác.

---

### 🟡 Vấn đề 2: Opener lặp lại — cải thiện nhưng chưa đủ

**23 files** vẫn bị flag. Riêng `office-problem-solution_level_3` bị flag vì **"the"** chiếm 51% opener — tức là hầu hết sample answer đều bắt đầu bằng "The problem is..." / "The solution is..." — đều đúng ngữ pháp nhưng monotonous.

---

## TỔNG HỢP: MA TRẬN ƯU TIÊN FIX

| Vấn đề                     |    L1    |    L2    |    L3    |  Độ ưu tiên   |
| :------------------------- | :------: | :------: | :------: | :-----------: |
| `because/so` connector     |    61    |    —     |    —     |    🔴 Cao     |
| Past tense                 |    34    |    —     |    —     |    🔴 Cao     |
| `My name is [studentName]` |   2✅    |    32    |    25    |    🔴 Cao     |
| Opener "I" > 40%           | 36 files | 38 files | 23 files | 🟡 Trung bình |
| Duplicate prompt           |    36    |    1     |    2     | 🟡 Trung bình |
| Advanced vocab             |    5     |    —     |    —     |    🟠 Thấp    |

---

## GỢI Ý PROMPT CHO LẦN GENERATE TIẾP

### System prompt additions cho Level 1:

```
LEVEL 1 STRICT RULES:
1. TENSE: Present Simple ONLY. Forbidden: was/were/went/had/did/got/bought/saw/told/came.
2. CONNECTORS: Zero connectors. Never use 'because', 'so', 'therefore', 'but because'.
   If explanation needed → write as 2 separate short sentences.
3. OPENER DIVERSITY: Max 2/5 exercises per pack may start with "I".
   Vary with: Yes., Sure., There is/are., The [noun]., We., It is., Of course.
4. VOCAB: Use only A1 words. Replace 'solution'→'answer'/'fix', avoid abstract nouns.
5. UNIQUE: No duplicate prompts within the same file.
```

### System prompt additions cho Level 2:

```
LEVEL 2 RULES:
1. NAME INTRO: NEVER start sample answer with "My name is [studentName]."
   Use context-appropriate openers instead.
2. CONNECTORS: Only 'and' and 'but' allowed to join clauses.
3. OPENER DIVERSITY: Max 2/5 exercises per pack may start with "I".
4. TENSE: Present Simple + Present Continuous only.
```

### System prompt additions cho Level 3:

```
LEVEL 3 RULES:
1. NAME INTRO: Never use "My name is [studentName]" as a sample answer.
   At L3, introduce yourself naturally: role, task, context.
2. OPENER DIVERSITY: Vary sentence openers — avoid repeating the same
   starting word more than 2x per pack.
3. TENSE: Present Simple, Present Continuous, Past Simple, Future (will/going to).
4. CONNECTORS: 'and', 'but', 'so', 'because', 'then' — no academic connectors.
```

---

## PHỤ LỤC: THỐNG KÊ THEO CATEGORY

### Level 1

| Category               | Files | Issues | Vấn đề chính                                    |
| :--------------------- | :---: | :----: | :---------------------------------------------- |
| Everyday               |  12   |   64   | Past tense (25), connector (14), duplicate (16) |
| Office                 |  11   |   42   | Connector (15), duplicate (12), opener (10)     |
| Niche/education        |   9   |   35   | Connector (28) — cao nhất theo tỷ lệ            |
| Niche/e_commerce       |   8   |   17   | Past tense (4), opener (6), duplicate (5)       |
| Niche/customer_service |  10   |   15   | Opener (7), connector (4)                       |
| Niche/finance          |   2   |   1    | Duplicate (1)                                   |

### Level 2

| Category               | Files | Issues | Vấn đề chính                |
| :--------------------- | :---: | :----: | :-------------------------- |
| Office                 |  11   |   18   | Opener (11), name intro (7) |
| Everyday               |  12   |   18   | Opener (10), name intro (8) |
| Niche/education        |   9   |   15   | Opener (7), name intro (8)  |
| Niche/customer_service |  10   |   13   | Name intro (6), opener (6)  |
| Niche/finance          |   2   |   3    | Name intro (3)              |
| Niche/e_commerce       |   8   |   4    | Opener (4)                  |

### Level 3

| Category               | Files | Issues | Vấn đề chính                              |
| :--------------------- | :---: | :----: | :---------------------------------------- |
| Everyday               |  12   |   19   | Name intro (11), opener (8)               |
| Niche/education        |   9   |   10   | Name intro (8)                            |
| Office                 |  11   |   10   | Opener (7), name intro (2)                |
| Niche/customer_service |  10   |   7    | Opener (4), name intro (3)                |
| Niche/e_commerce       |   8   |   4    | Opener (2), duplicate (1), name intro (1) |
