# Scoring & Feedback Design

> **Phạm vi:** Chấm điểm sau khi user hoàn thành toàn pack (không chấm per-exercise).
> **Không đánh giá phát âm** — chỉ đánh giá text transcript từ Whisper.
> **Chuẩn đánh giá:** `data/level/level.json` — mỗi level có grammar, vocab, tense, connector riêng.
> **2 mode:** Free (tự do) và Guided (theo gợi ý).

---

## 1. NGUYÊN TẮC CỐT LÕI

### Không đánh giá phát âm — Tại sao?

Whisper trả về **text transcript**. Từ transcript, ta chỉ có thể đánh giá:

- Ngữ pháp (grammar)
- Từ vựng (vocabulary)
- Sự phù hợp với ngữ cảnh (relevance)
- Độ phức tạp câu phù hợp level (complexity)

Phát âm cần audio waveform + phoneme model riêng → chi phí cao, không trong scope hiện tại.

### Feedback phải actionable

Không chỉ nói "Sai ngữ pháp". Phải chỉ ra **cụ thể sai gì** và **nên sửa thành gì**.

```
❌ Bad:  "Ngữ pháp chưa đúng."
✅ Good: "Bạn dùng 'goed' — động từ bất quy tắc, đúng là 'went'."
```

---

## 2. HAI MODE ĐÁNH GIÁ

### Mode A — FREE (Tự do)

User nói theo ý mình, không cần theo gợi ý `m`, `h`, `s`.

**Câu hỏi duy nhất AI cần trả lời:** _"Câu user nói có phù hợp với câu hỏi `p` không?"_

**Tiêu chí:**

| Tiêu chí                    | Mô tả                                                 | Trọng số |
| :-------------------------- | :---------------------------------------------------- | :------: |
| **Relevance**               | Câu trả lời có liên quan đến prompt `p`?              |   40%    |
| **Grammar (theo level)**    | Có vi phạm quy tắc ngữ pháp bắt buộc của level không? |   35%    |
| **Vocabulary (theo level)** | Từ vựng có phù hợp CEFR của level không?              |   25%    |

**Không penalize** nếu user dùng cấu trúc ngữ pháp hoặc từ vựng cao hơn level (dùng Past Simple ở L2 là tốt, không phải lỗi).

---

### Mode B — GUIDED (Theo gợi ý)

User chọn nói theo gợi ý — dựa vào `m` (nhiệm vụ), `h` (gợi ý ngữ pháp), `s` (mẫu).

**Câu hỏi AI cần trả lời:** _"User có hoàn thành các nhiệm vụ trong `m` không? Có dùng đúng cấu trúc `h` không?"_

**Tiêu chí:**

| Tiêu chí                    | Mô tả                                            | Trọng số |
| :-------------------------- | :----------------------------------------------- | :------: |
| **Task completion**         | Hoàn thành các ý trong `m`? (mỗi ý = 1 điểm nhỏ) |   40%    |
|                             |                                                  |          |
| **Structure match**         | Có dùng cấu trúc gợi ý trong `h`?                |   20%    |
| **Vocabulary (theo level)** | Từ vựng có phù hợp CEFR của level?               |   10%    |

---

## 3. CHUẨN ĐÁNH GIÁ THEO TỪNG LEVEL

### Nguyên tắc nền tảng: FLOOR-ONLY, KHÔNG CÓ CEILING

> **Level chỉ xác định `p` (độ khó của prompt), KHÔNG xác định trần ngữ pháp của người nói.**

| Trường hợp                                          | Xử lý                                  |
| :-------------------------------------------------- | :------------------------------------- |
| Người nói dùng grammar **đúng bằng** level          | ✅ Bình thường                         |
| Người nói dùng grammar **cao hơn** level            | ✅ Chấp nhận — cộng bonus nếu dùng tốt |
| Người nói dùng grammar **thấp hơn floor** của level | ❌ Trừ điểm complexity                 |
| Người nói dùng grammar **sai** (dù ở tầng nào)      | ❌ Trừ điểm grammar                    |
| Câu trả lời **không liên quan** đến `p`             | ❌ Trừ điểm relevance                  |

**2 loại lỗi duy nhất cần penalize:**

1. **Grammar sai** — dùng sai cấu trúc, sai chia động từ (bất kể grammar tầng nào)
2. **Complexity thiếu** — câu trả lời ở tầng thấp hơn floor kỳ vọng của level

**KHÔNG phạt** khi người nói dùng cấu trúc cao hơn level, miễn là dùng đúng.

---

### Level 1 — BEGINNER (A1)

**Grammar floor (tối thiểu):** Câu hoàn chỉnh — có Subject + Verb. Không chấp nhận câu rời rạc hoặc từ đơn lẻ.

**Cấu trúc chuẩn tham chiếu (dùng để score):**

- S + be (am/is/are) + N/Adj
- S + V(s/es) + O (Present Simple)
- S + can/can't + V
- There is/are

**Lỗi bị trừ điểm — CHỈ 2 loại:**

| Loại lỗi    | Ví dụ                           | Ghi chú                         |
| :---------- | :------------------------------ | :------------------------------ |
| Grammar sai | "I is happy", "He go school"    | Sai chia động từ, thiếu article |
| Dưới floor  | "Yes. Park. Nice." (chỉ từ đơn) | Không thành câu hoàn chỉnh      |

**KHÔNG phạt:**

- Dùng Past Tense đúng → không phạt (dùng được tầng cao hơn)
- Dùng connector (because, so, but) đúng → không phạt, có thể bonus
- Từ vựng cao hơn A1 dùng đúng ngữ cảnh → không phạt

**Ví dụ thực tế:**

```
p: "Nice park today, isn't it?"

User (Free): "Yes, it is nice. I like this park."
→ Relevance ✅ | Grammar ✅ (câu đúng, đủ S+V) | Score: 90

User (Free): "Yes, I came here yesterday because it was nice."
→ Relevance ✅ | Grammar ✅ (past tense dùng đúng, because dùng đúng)
→ Bonus: Dùng cấu trúc cao hơn L1
→ Score: 95
→ Feedback: "Tuyệt! Bạn dùng thì quá khứ và 'because' đúng — tiến bộ hơn mức Level 1."

User (Free): "Park. Nice. Yes."
→ Relevance ✅ | Complexity ❌ (không thành câu hoàn chỉnh)
→ Score: 40
→ Feedback: "Hãy nói thành câu hoàn chỉnh. Ví dụ: 'Yes, it is nice.'"

User (Free): "I is happy here."
→ Relevance ✅ | Grammar ❌ ('I is' → 'I am') | Score: 60
→ Feedback: "Dùng 'I am', không phải 'I is'."
```

---

### Level 2 — ELEMENTARY (A1–A2)

**Grammar floor (tối thiểu):** Câu có ít nhất **2 ý hoặc 1 câu có modifier** (tính từ, trạng từ tần suất, hoặc cụm thông tin). Câu đơn quá cụt (chỉ S+V+O đơn giản như Level 1) là thiếu complexity cho L2.

**Cấu trúc chuẩn tham chiếu:**

- Tất cả L1 + Present Continuous, frequency adverbs, "and/but" connector

**Lỗi bị trừ điểm — CHỈ 2 loại:**

| Loại lỗi                    | Ví dụ                                                     | Ghi chú                  |
| :-------------------------- | :-------------------------------------------------------- | :----------------------- |
| Grammar sai                 | "I am go", "She working hard" (thiếu be)                  | Sai cấu trúc             |
| Dưới floor (quá đơn như L1) | "I work. I talk." (mỗi câu chỉ S+V đơn, không có thêm gì) | Thiếu complexity kỳ vọng |

**KHÔNG phạt:**

- Dùng Past Simple đúng → không phạt
- Dùng "because", "so" đúng → không phạt, có thể bonus
- Từ vựng A2+ dùng đúng → không phạt

**Ví dụ thực tế:**

```
p: "What do you do here?" (office context)
m: "Nói công việc chính. Nói bạn làm việc với ai."
h: "I handle/do + công việc. I work with + người."
s: "I answer customer emails. I work with the support team."

User (Guided): "I answer emails and I work with my team."
→ Task ✅✅ | Grammar ✅ | Complexity ✅ (dùng 'and' nối 2 ý) | Score: 88

User (Guided): "I answer emails because my job is support."
→ Task ✅ | Grammar ✅ ('because' dùng đúng) | Complexity ✅
→ Bonus nhẹ: dùng connector cao hơn floor L2
→ Score: 85
→ Feedback: "Tốt! Câu rõ ràng. 'because' dùng đúng ngữ cảnh."

User (Guided): "I work. I talk."
→ Task ⚠️ (quá mơ hồ) | Complexity ❌ (quá đơn, thiếu thông tin)
→ Score: 48
→ Feedback: "Hãy thêm chi tiết: bạn làm gì cụ thể? Làm việc với ai?"
```

---

### Level 3 — PRE-INTERMEDIATE (A2–B1)

**Grammar floor (tối thiểu):** Phải dùng **đúng tense theo ngữ cảnh** — kể chuyện quá khứ phải dùng Past Simple. Câu phải có **logic trình tự hoặc quan hệ nhân quả**.

**Cấu trúc chuẩn tham chiếu:**

- Tất cả L1, L2 + Past Simple, Future (will/going to), connectors đầy đủ (because, so, then), comparatives

**Lỗi bị trừ điểm — CHỈ 2 loại:**

| Loại lỗi                            | Ví dụ                                                          | Ghi chú                                            |
| :---------------------------------- | :------------------------------------------------------------- | :------------------------------------------------- |
| Grammar sai                         | "I goed", "It more better"                                     | Sai cấu trúc                                       |
| Dưới floor: Sai tense theo ngữ cảnh | Kể chuyện quá khứ mà dùng hiện tại: "I go to Da Lat last week" | Tense không match ngữ cảnh = lỗi nghiêm trọng ở L3 |

**KHÔNG phạt:**

- Dùng connector học thuật (however, therefore) đúng ngữ cảnh → không phạt, bonus
- Dùng Present Perfect, conditionals đúng → bonus
- Từ vựng B1+ dùng đúng → không phạt

**Ví dụ thực tế:**

```
p: "How was your last trip?"
m: "Nói bạn đã đi đâu và khi nào. Nói một hoạt động bạn làm ở đó."
h: "Past Simple + time word (e.g., last week)."
s: "I went to a beach town last weekend. I walked on the sand and swam once."

User (Free): "I go to Da Lat last week. The weather is cold but the food is good."
→ Floor violation ❌ (kể chuyện quá khứ nhưng dùng hiện tại — sai tense theo ngữ cảnh)
→ Score: 55
→ Feedback: "'go' → 'went', 'is cold' → 'was cold'. Kể chuyện quá khứ cần dùng Past Simple."

User (Guided): "I went to Ha Noi last month. I visited Hoan Kiem Lake and ate pho."
→ Task ✅✅ | Grammar ✅ | Tense ✅ (Past Simple đúng ngữ cảnh) | Score: 92
→ Feedback: "Rất tốt! Câu rõ ràng, đúng thì quá khứ, có thời gian cụ thể."

User (Free): "I went to Da Lat. The scenery was beautiful. However, it was quite cold so I didn't go hiking."
→ Grammar ✅ | Tense ✅ | Connector: bonus ('however' — cấu trúc cao hơn L3)
→ Score: 97
→ Feedback: "Xuất sắc! Dùng 'however' và logic nhân quả rất tự nhiên."
```

---

## 4. ĐIỂM SỐ VÀ THANG ĐO

### 4.1 Thang điểm 0–100

| Khoảng | Ý nghĩa                          | Hiển thị   |
| :----- | :------------------------------- | :--------- |
| 90–100 | Xuất sắc — vượt yêu cầu level    | ⭐⭐⭐⭐⭐ |
| 75–89  | Tốt — đạt yêu cầu, lỗi nhỏ       | ⭐⭐⭐⭐   |
| 60–74  | Đạt — một số lỗi cần sửa         | ⭐⭐⭐     |
| 45–59  | Chưa đạt — nhiều lỗi cơ bản      | ⭐⭐       |
| 0–44   | Cần luyện lại — lỗi nghiêm trọng | ⭐         |

### 4.2 Ngưỡng pass

| Level                 | Pass threshold |
| :-------------------- | :------------: |
| L1 — Beginner         |       60       |
| L2 — Elementary       |       65       |
| L3 — Pre-Intermediate |       70       |

### 4.3 Pack score = trung bình các bài

```
packScore = avg(exercise[1].score, ..., exercise[N].score)
passed = packScore >= threshold[level]
```

---

## 5. CẤU TRÚC FEEDBACK TRẢ VỀ FE

### 5.1 Per exercise (trong mảng `exercises[]`)

```json
{
  "seq": 2,
  "score": 72,
  "transcript": "I answer emails because my job is support.",
  "sampleAnswer": "I answer customer emails. I work with the support team.",

  "checks": {
    "relevance": { "ok": true },
    "grammar": {
      "ok": false,
      "errors": [
        {
          "type": "WRONG_CONNECTOR",
          "found": "because",
          "message": "Ở Level 2 chỉ dùng 'and' hoặc 'but'. Tách thành 2 câu riêng."
        }
      ]
    },
    "vocabulary": { "ok": true },
    "taskCompletion": {
      "ok": true,
      "tasks": [
        { "task": "Nói công việc chính", "completed": true },
        { "task": "Nói bạn làm việc với ai", "completed": false }
      ]
    }
  },

  "highlight": "Câu đúng nhưng dùng 'because' chưa phù hợp Level 2.",
  "tip": "Thử: 'I answer emails. My job is in support.'"
}
```

### 5.2 Pack level summary

```json
{
  "packAttemptId": "uuid",
  "overallScore": 78,
  "passed": true,
  "mode": "GUIDED",
  "level": 2,

  "summary": {
    "strongPoints": [
      "Hoàn thành đủ task trong 4/5 bài",
      "Từ vựng phù hợp level"
    ],
    "weakPoints": ["Hay dùng connector 'because' — chỉ dùng ở Level 3 trở lên"],
    "nextFocus": "Luyện tách ý thành 2 câu ngắn thay vì dùng 'because'."
  },

  "exercises": [
    /* mảng per-exercise như trên */
  ]
}
```

---

## 6. SCORING PROMPT STRUCTURE (gửi cho AI model)

### 6.1 System prompt (cố định theo level)

```
You are an English speaking coach evaluating a student's spoken response.
The student is at LEVEL {level} ({levelCode}).

LEVEL CONTEXT (difficulty of the prompt, NOT a grammar ceiling):
- Grammar floor (minimum complexity expected): {floor}
- Reference structures at this level: {tense}, connectors: {conn}, vocab: CEFR {cefr}
- Complexity hint: {cmplx}

Scoring mode: {FREE | GUIDED}

EVALUATION RULES — read carefully:
1. RELEVANCE: Does the answer respond to the prompt `p`? (40% weight in FREE mode)
2. GRAMMAR ERRORS: Penalize only INCORRECT grammar — wrong verb forms, wrong agreement, etc.
   - Penalize regardless of which level the structure belongs to.
3. COMPLEXITY FLOOR: If the response is significantly simpler than the floor for this level
   (e.g., only single words, or much simpler sentences than expected), penalize complexity.
4. NEVER penalize for using grammar ABOVE the level — this is always acceptable and may earn bonus.
   - Example: A Level 1 student using past tense correctly → do NOT penalize, give bonus instead.
   - Example: A Level 2 student using "because" correctly → do NOT penalize.
5. BONUS (+5): Award when student uses grammar structures above their level correctly.

Do NOT evaluate pronunciation. You only have the transcript text.
Give specific, actionable feedback in Vietnamese.
Keep each feedback message under 20 words.
```

### 6.2 User message (per exercise, gửi cả pack 1 lần)

```
Evaluate {N} exercises from the same pack.

EXERCISE {seq}:
  Prompt (p): "{p}"
  [GUIDED only] Instruction (m): "{m}"
  [GUIDED only] Hint (h): "{h}"
  [GUIDED only] Sample answer (s): "{s}"
  Student transcript: "{transcript}"

EXERCISE {seq+1}:
  ...

Return JSON matching the schema provided.
```

### 6.3 Response schema (JSON mode)

```json
{
  "overallScore": 78,
  "passed": true,
  "summary": {
    "strongPoints": ["string"],
    "weakPoints": ["string"],
    "nextFocus": "string"
  },
  "exercises": [
    {
      "seq": 1,
      "score": 85,
      "checks": {
        "relevance": { "ok": true },
        "grammar": { "ok": true, "errors": [] },
        "vocabulary": { "ok": true },
        "taskCompletion": {
          "ok": true,
          "tasks": [{ "task": "string", "completed": true }]
        }
      },
      "highlight": "string",
      "tip": "string | null"
    }
  ]
}
```

---

## 7. CÁC TRƯỜNG HỢP ĐẶC BIỆT

### 7.1 Transcript rỗng hoặc quá ngắn (< 3 từ)

```
score = 0
highlight = "Không nhận được câu trả lời đầy đủ."
tip = "Hãy nói to và rõ hơn, ít nhất 1 câu hoàn chỉnh."
```

Không gọi scoring model — xử lý phía BE trước khi enqueue.

### 7.2 Transcript không phải tiếng Anh

```
score = 0
highlight = "Whisper nhận thấy câu trả lời không phải tiếng Anh."
tip = "Vui lòng trả lời bằng tiếng Anh."
```

Whisper trả `language` field — check trước khi score.

### 7.3 User dùng cấu trúc cao hơn level (bonus)

> **Nguyên tắc:** Level là FLOOR (sàn tối thiểu), không phải ceiling (trần). Dùng grammar cao hơn level và đúng → luôn được chấp nhận, có thể bonus.

```
L1 user dùng: "I came here because I like trees."
→ Past tense đúng ✅ | 'because' đúng ✅
→ Relevance ✅ | KHÔNG phạt — đây là cấu trúc cao hơn L1 dùng đúng
→ Bonus +5 | highlight: "Tốt! Bạn dùng thì quá khứ và 'because' đúng — vượt mức Level 1."

L2 user dùng: "I went to the office early because the meeting started at 8."
→ Đây là L3 structure dùng ở L2, dùng đúng → KHÔNG lỗi, cộng bonus +5
→ highlight: "Tốt! Bạn dùng cấu trúc nâng cao hơn level — dấu hiệu tiến bộ."

L1 user dùng: "I came here. It good."
→ "It good" = grammar sai (thiếu 'is') → phạt grammar ❌
→ Không liên quan đến việc là L1 hay L3 — grammar sai thì phạt dù ở tầng nào
```

### 7.4 Mode FREE — câu trả lời không liên quan (off-topic)

```
p: "What do you do here?"
transcript: "I like football very much."
→ Relevance ❌ → score tối đa 30
→ highlight: "Câu trả lời chưa liên quan đến câu hỏi."
→ tip: "Câu hỏi hỏi về công việc của bạn — hãy mô tả việc bạn làm."
```

---

## 8. FEEDBACK HIỂN THỊ TRÊN FE

### 8.1 Per exercise card (collapsed by default)

```
Bài 2 · 72 điểm ⚠️
"I answer emails because my job is support."
─────────────────────────────────────────
✅ Đúng chủ đề
⚠️ Connector: dùng 'because' — chỉ dùng từ Level 3 trở lên
💡 Thử: "I answer emails. My job is in support."
[▼ Xem câu mẫu]  →  "I answer customer emails. I work with the support team."
```

### 8.2 Pack summary (luôn hiện ở đầu)

```
🎯 Điểm tổng: 78/100  ⭐⭐⭐⭐

Làm tốt:  Hoàn thành đủ task, từ vựng phù hợp
Cần sửa:  Hay dùng 'because' — chỉ dùng ở Level 3
Tập trung tiếp: Tách ý thành 2 câu ngắn thay vì nối bằng 'because'
```

### 8.3 Nguyên tắc UX cho feedback

- Tối đa **3 điểm feedback** mỗi bài — không liệt kê hết mọi lỗi
- **Ưu tiên lỗi nghiêm trọng nhất** (tense violation > connector > vocab)
- `tip` luôn là câu gợi ý **cụ thể**, không phải lý thuyết chung
- Điểm cao (≥ 80) → tone tích cực là chính, feedback là phụ
- Điểm thấp (< 60) → tone khuyến khích, không chỉ trích

---

## 9. TÓM TẮT SO SÁNH 2 MODE

|                | Mode FREE              | Mode GUIDED                |
| :------------- | :--------------------- | :------------------------- |
| User nói       | Theo ý mình            | Theo gợi ý m/h/s           |
| Tiêu chí chính | Relevance (40%)        | Task completion (40%)      |
| Yêu cầu        | Câu phù hợp prompt `p` | Hoàn thành các ý trong `m` |
| Bonus          | Cấu trúc cao hơn level | Dùng đúng cấu trúc `h`     |
| Phù hợp        | User muốn nói tự nhiên | User cần hướng dẫn cụ thể  |
| Level nên dùng | L2, L3                 | L1, L2                     |
