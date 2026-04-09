# Mode B — GUIDED: Scoring Prompt Specification

> **Scope:** Prompt + Response schema cho Mode GUIDED (có hướng dẫn).
> **Áp dụng:** Chung 1 system prompt cho cả 3 level — level context được inject qua biến.
> **Tham chiếu:** `08-scoring-feedback-design.md`, `data/level/level.json`
> **Xem thêm:** `09-free-mode-scoring-prompt.md` cho Mode FREE — dùng chung level context.

---

## So sánh nhanh với Mode FREE

GUIDED mode có cấu trúc gần giống FREE — cùng 3 sub-scores, cùng thang 0–100, cùng level context. Điểm khác duy nhất:

|                    | Mode FREE                                 | Mode GUIDED                                       |
| :----------------- | :---------------------------------------- | :------------------------------------------------ |
| Tiêu chí #1        | **Relevance** (trả lời có liên quan `p`?) | **Task Completion** (hoàn thành các ý trong `m`?) |
| Input cho AI       | `p` + `transcript`                        | `p` + `m` + `s` + `transcript`                    |
| `h` (hint)         | Không gửi                                 | Không gửi (chỉ hiện trên FE cho user xem)         |
| `suggestedPhrases` | Có (L2 & L3)                              | Không (user đã có `s` làm mẫu)                    |

> **`h` (hint) là gợi ý UI** — hiển thị trên FE để user tham khảo trước khi nói, không phải tiêu chí chấm điểm.

---

## 1. SYSTEM PROMPT

```
You are an English speaking coach evaluating a Vietnamese student's spoken responses.
You are scoring an entire pack of {exerciseCount} exercises at once.

═══════════════════════════════════════
STUDENT LEVEL: {level} — {levelCode}
═══════════════════════════════════════

LEVEL CONTEXT — this defines the FLOOR (minimum complexity), NOT a ceiling:
  • Grammar floor: {grammarFloor}
  • Reference structures: {referenceStructures}
  • Tenses expected: {tenses}
  • Connectors expected: {connectors}
  • Vocabulary scope: {vocabScope}
  • Complexity hint: {complexityHint}

═══════════════════════════════════════
SCORING MODE: GUIDED
═══════════════════════════════════════

In GUIDED mode, the student follows specific Vietnamese instructions (`m`) that tell them what to say.
You evaluate how well the student completed the tasks described in `m`.

Each exercise provides:
  • Prompt (p): the conversation prompt the student responds to.
  • Instruction (m): Vietnamese instructions listing what the student should say (task checklist).
  • Sample (s): a reference answer showing one correct way to respond.
  • Student transcript: what the student actually said.

─── SCORING CRITERIA (per exercise) ───

Each exercise is scored 0–100. There are 3 sub-scores, each on a 0–100 scale:

1. TASK COMPLETION (weight: 40%, score: 0–100)
   - Did the student complete each task listed in `m`?
   - Each task in `m` is a separate checkpoint. Evaluate each one individually.
   - All tasks completed → 90–100.
   - Most tasks completed (≥ 50%) → 60–80.
   - Few or no tasks completed → 0–50.
   - Evaluate generously: if the student conveys the same meaning using different words → task completed.
   - Only mark a task as NOT completed if the meaning is clearly missing.

2. GRAMMAR (weight: 35%, score: 0–100)
   - Penalize ONLY incorrect grammar: wrong verb forms, wrong agreement, missing articles, wrong tense usage.
   - Penalize regardless of which level the grammar structure belongs to.
   - If the student uses grammar ABOVE their level correctly → do NOT penalize. Award bonus instead.
   - If the response is significantly below the grammar floor → penalize by lowering grammar score.
   - Bonus (+5 to grammar score, max 100): when student correctly uses structures above their level.

3. VOCABULARY (weight: 25%, score: 0–100)
   - Is the vocabulary appropriate for the student's CEFR level?
   - Using vocabulary ABOVE the level correctly → do NOT penalize, may bonus.
   - Very limited or repetitive vocabulary → lower score.
   - Vocabulary errors (wrong word choice causing meaning change) → penalize.

─── EXERCISE SCORE FORMULA ───

exerciseScore = round(taskCompletion × 0.40 + grammar × 0.35 + vocabulary × 0.25)

─── OVERALL PACK SCORE ───

overallScore = round(average of all exercise scores)

─── CRITICAL RULES ───

1. FLOOR-ONLY PRINCIPLE: The level defines the minimum expected complexity, NOT a ceiling.
   - Student using past tense at Level 1? → GOOD, bonus if correct.
   - Student using "because" at Level 2? → GOOD, bonus if correct.
   - ONLY penalize when grammar is WRONG, never when it's "too advanced".

2. DO NOT evaluate pronunciation — you only have text transcripts.

3. FEEDBACK LANGUAGE: All feedback messages MUST be in Vietnamese.

4. FEEDBACK QUALITY:
   - Each sub-score (taskCompletion, grammar, vocabulary) has its own feedback string.
   - Be specific and actionable — point out exact errors and provide corrections.
   - BAD: "Chưa hoàn thành nhiệm vụ."
   - GOOD: "Thiếu ý 'nói bạn làm việc với ai'. Thử thêm: 'I work with the marketing team.'"
   - Keep each feedback message concise (under 25 words).

5. FEEDBACK TONE:
   - Score ≥ 80: Positive tone, highlight what's good.
   - Score 60–79: Encouraging, focus on 1–2 key improvements.
   - Score < 60: Supportive, never critical. Guide toward improvement.

─── RESPONSE FORMAT ───

Return a valid JSON object matching the schema below. No markdown, no explanation outside JSON.
```

---

## 2. LEVEL CONTEXT

> **Dùng chung với Mode FREE** — xem bảng chi tiết tại `09-free-mode-scoring-prompt.md` Section 2.
> BE dùng cùng `LEVEL_CONTEXTS` map cho cả 2 mode.

| Level | `{levelCode}`      | `{grammarFloor}` (tóm tắt)                                    |
| :---- | :----------------- | :------------------------------------------------------------ |
| 1     | `BEGINNER`         | Câu hoàn chỉnh S+V. Từ rời rạc không chấp nhận.               |
| 2     | `ELEMENTARY`       | Ít nhất 2 ý hoặc 1 câu có modifier. S+V+O đơn = dưới sàn.     |
| 3     | `PRE_INTERMEDIATE` | Đúng tense theo ngữ cảnh. Past events → Past Simple bắt buộc. |

---

## 3. USER MESSAGE TEMPLATE

```
Evaluate {exerciseCount} exercises from the same pack (Level {level}, GUIDED mode).

{exercises}

Return JSON matching the provided schema.
```

Trong đó `{exercises}` được build theo format:

```
EXERCISE 1:
  Prompt (p): "{p}"
  Instruction (m): "{m}"
  Sample (s): "{s}"
  Student transcript: "{transcript}"

EXERCISE 2:
  ...
```

> **Không gửi `h`** — hint chỉ hiển thị trên FE, không phải input cho AI scoring.

---

## 4. USER MESSAGE EXAMPLES

### 4.1 Level 1 — BEGINNER

```
Evaluate 3 exercises from the same pack (Level 1, GUIDED mode).

EXERCISE 1:
  Prompt (p): "What is the problem?"
  Instruction (m): "Nói một câu: có một vấn đề ở công việc."
  Sample (s): "There is a problem at work."
  Student transcript: "There is a problem."

EXERCISE 2:
  Prompt (p): "Are you okay?"
  Instruction (m): "Trả lời một câu: bạn buồn hay không."
  Sample (s): "I am sad."
  Student transcript: "I is not happy."

EXERCISE 3:
  Prompt (p): "Can I help you with the task?"
  Instruction (m): "Trả lời một câu: bạn có chấp nhận giúp hay không."
  Sample (s): "You can help me."
  Student transcript: "Help. Yes."

Return JSON matching the provided schema.
```

### 4.2 Level 2 — ELEMENTARY

```
Evaluate 3 exercises from the same pack (Level 2, GUIDED mode).

EXERCISE 1:
  Prompt (p): "What do you do here?"
  Instruction (m): "Nói công việc chính. Nói bạn làm việc với ai."
  Sample (s): "I answer customer emails. I work with the support team."
  Student transcript: "I answer emails and I work with my team."

EXERCISE 2:
  Prompt (p): "How often do you have meetings?"
  Instruction (m): "Nói tần suất họp. Nói bạn thường họp với ai."
  Sample (s): "I usually have meetings on Monday. I meet with my manager."
  Student transcript: "I have meeting."

EXERCISE 3:
  Prompt (p): "What are you working on today?"
  Instruction (m): "Nói dự án hoặc việc đang làm. Nói bạn đang làm gì cụ thể."
  Sample (s): "I am writing a report for my boss. I am also preparing for a meeting."
  Student transcript: "I am working on a report and I am preparing slides for the meeting tomorrow."

Return JSON matching the provided schema.
```

### 4.3 Level 3 — PRE-INTERMEDIATE

```
Evaluate 3 exercises from the same pack (Level 3, GUIDED mode).

EXERCISE 1:
  Prompt (p): "How was your last trip?"
  Instruction (m): "Nói bạn đã đi đâu và khi nào. Nói một hoạt động bạn làm ở đó."
  Sample (s): "I went to a beach town last weekend. I walked on the sand and swam once."
  Student transcript: "I went to Ha Noi last month. I visited Hoan Kiem Lake and ate pho."

EXERCISE 2:
  Prompt (p): "Can we start the meeting about the report now?"
  Instruction (m): "Nói rõ bạn gặp vấn đề gì. Nói khi nào vấn đề xảy ra. Đề xuất hành động tiếp theo."
  Sample (s): "I found errors in the report yesterday. The team missed some figures. I will fix them and send the new file."
  Student transcript: "I find problem in the report. It have error. I will fix."

EXERCISE 3:
  Prompt (p): "Do you want to hang out this weekend?"
  Instruction (m): "1) Trả lời đồng ý hoặc không bằng 'I'm going to' hoặc 'I will'. 2) Nói khi cụ thể hoặc lý do."
  Sample (s): "I'm going to hang out on Saturday afternoon. I will meet a friend at the park."
  Student transcript: "I'm going to go out on Saturday because I want to relax. I will probably visit a coffee shop."

Return JSON matching the provided schema.
```

---

## 5. RESPONSE JSON SCHEMA

```json
{
  "overallScore": 78,
  "summary": {
    "strongPoints": ["string", "string"],
    "weakPoints": ["string", "string"],
    "nextFocus": ["string", "string"]
  },
  "exercises": [
    {
      "score": 85,
      "taskCompletion": {
        "score": 90,
        "feedback": "Hoàn thành cả 2 ý: nói công việc + nói làm việc với ai.",
        "tasks": [
          { "task": "Nói công việc chính", "completed": true },
          { "task": "Nói bạn làm việc với ai", "completed": true }
        ]
      },
      "grammar": {
        "score": 85,
        "feedback": "Câu đúng ngữ pháp. Dùng 'and' nối 2 ý rất tốt."
      },
      "vocabulary": {
        "score": 80,
        "feedback": "Từ vựng phù hợp level, dùng đúng ngữ cảnh."
      }
    }
  ]
}
```

### 5.1 Schema Definition

```typescript
interface GuidedModeScoringResponse {
  /** Điểm trung bình toàn pack (0–100) */
  overallScore: number;

  /** Tổng kết toàn pack */
  summary: {
    /** Điểm mạnh nổi bật (1–3 items) */
    strongPoints: string[];
    /** Điểm yếu cần cải thiện (1–3 items) */
    weakPoints: string[];
    /** Gợi ý tập trung luyện tiếp (1–3 items) */
    nextFocus: string[];
  };

  /**
   * Kết quả từng bài — THỨ TỰ TRONG MẢNG = seq.
   * exercises[0] = bài 1, exercises[1] = bài 2, ...
   */
  exercises: GuidedExerciseResult[];
}

interface GuidedExerciseResult {
  /** Điểm tổng bài (0–100) = taskCompletion×0.4 + grammar×0.35 + vocab×0.25 */
  score: number;

  /** Đánh giá mức hoàn thành nhiệm vụ từ `m` */
  taskCompletion: TaskCompletionScore;

  /** Đánh giá ngữ pháp */
  grammar: SubScore;

  /** Đánh giá từ vựng */
  vocabulary: SubScore;
}

interface TaskCompletionScore {
  /** Điểm thành phần (0–100) */
  score: number;
  /** Feedback tổng quan về việc hoàn thành task */
  feedback: string;
  /** Danh sách từng task trong `m` — đánh dấu completed hay chưa */
  tasks: Array<{
    /** Nội dung task (tách từ `m`) */
    task: string;
    /** User đã hoàn thành task này chưa */
    completed: boolean;
  }>;
}

interface SubScore {
  /** Điểm thành phần (0–100) */
  score: number;
  /** Feedback bằng tiếng Việt, ngắn gọn, actionable (≤ 25 từ) */
  feedback: string;
}
```

---

## 6. RESPONSE EXAMPLES

### 6.1 Level 1 — BEGINNER

```json
{
  "overallScore": 55,
  "summary": {
    "strongPoints": ["Bài 1 dùng đúng 'There is' — hoàn thành ý chính"],
    "weakPoints": [
      "Bài 2 sai chia động từ 'be': 'I is' → 'I am'",
      "Bài 3 chỉ nói từ rời rạc, chưa thành câu"
    ],
    "nextFocus": [
      "Ôn chia động từ 'be': I am, He/She is, They are",
      "Luôn nói thành câu có Subject + Verb"
    ]
  },
  "exercises": [
    {
      "score": 80,
      "taskCompletion": {
        "score": 75,
        "feedback": "Nói được 'có vấn đề' nhưng thiếu chi tiết 'ở công việc'.",
        "tasks": [
          {
            "task": "Nói một câu: có một vấn đề ở công việc",
            "completed": true
          }
        ]
      },
      "grammar": {
        "score": 90,
        "feedback": "'There is a problem.' — câu đúng ngữ pháp. Tốt!"
      },
      "vocabulary": {
        "score": 70,
        "feedback": "Từ vựng ổn nhưng thiếu 'at work' để hoàn chỉnh ý."
      }
    },
    {
      "score": 50,
      "taskCompletion": {
        "score": 70,
        "feedback": "Có trả lời về cảm xúc ('not happy') — đúng ý.",
        "tasks": [
          { "task": "Trả lời một câu: bạn buồn hay không", "completed": true }
        ]
      },
      "grammar": {
        "score": 25,
        "feedback": "'I is not happy' → 'I am not happy'. 'I' luôn đi với 'am'."
      },
      "vocabulary": {
        "score": 65,
        "feedback": "Dùng 'happy' thay 'sad' — vẫn phù hợp ngữ cảnh."
      }
    },
    {
      "score": 28,
      "taskCompletion": {
        "score": 35,
        "feedback": "Có ý đồng ý ('Yes') nhưng chưa diễn đạt thành câu.",
        "tasks": [
          {
            "task": "Trả lời một câu: bạn có chấp nhận giúp hay không",
            "completed": false
          }
        ]
      },
      "grammar": {
        "score": 10,
        "feedback": "'Help. Yes.' — chưa thành câu. Thử: 'Yes, you can help me.'"
      },
      "vocabulary": {
        "score": 50,
        "feedback": "Từ 'help' đúng chủ đề nhưng cần đặt trong câu hoàn chỉnh."
      }
    }
  ]
}
```

### 6.2 Level 2 — ELEMENTARY

```json
{
  "overallScore": 74,
  "summary": {
    "strongPoints": [
      "Bài 1 hoàn thành cả 2 ý, dùng 'and' nối câu tốt",
      "Bài 3 dùng Present Continuous chính xác, câu chi tiết"
    ],
    "weakPoints": [
      "Bài 2 chỉ nói 1 ý rất ngắn, thiếu tần suất và người họp cùng"
    ],
    "nextFocus": [
      "Thêm trạng từ tần suất (usually, often) khi nói về thói quen",
      "Luôn hoàn thành đủ các ý trong hướng dẫn"
    ]
  },
  "exercises": [
    {
      "score": 88,
      "taskCompletion": {
        "score": 95,
        "feedback": "Hoàn thành cả 2 ý: nói công việc + nói làm việc với ai.",
        "tasks": [
          { "task": "Nói công việc chính", "completed": true },
          { "task": "Nói bạn làm việc với ai", "completed": true }
        ]
      },
      "grammar": {
        "score": 90,
        "feedback": "Câu đúng ngữ pháp. Dùng 'and' nối 2 ý rất tự nhiên."
      },
      "vocabulary": {
        "score": 75,
        "feedback": "'my team' hơi chung — thử cụ thể hơn: 'the support team'."
      }
    },
    {
      "score": 35,
      "taskCompletion": {
        "score": 25,
        "feedback": "Thiếu tần suất họp và người họp cùng.",
        "tasks": [
          { "task": "Nói tần suất họp", "completed": false },
          { "task": "Nói bạn thường họp với ai", "completed": false }
        ]
      },
      "grammar": {
        "score": 40,
        "feedback": "'I have meeting' → 'I have meetings' (thiếu 's'). Câu quá đơn cho Level 2."
      },
      "vocabulary": {
        "score": 45,
        "feedback": "Chỉ có 1 từ 'meeting'. Thử: 'I usually meet with my manager.'"
      }
    },
    {
      "score": 95,
      "taskCompletion": {
        "score": 100,
        "feedback": "Hoàn thành cả 2 ý: nói việc đang làm + chi tiết cụ thể.",
        "tasks": [
          { "task": "Nói dự án hoặc việc đang làm", "completed": true },
          { "task": "Nói bạn đang làm gì cụ thể", "completed": true }
        ]
      },
      "grammar": {
        "score": 95,
        "feedback": "Present Continuous ('am working', 'am preparing') dùng đúng. Tuyệt!"
      },
      "vocabulary": {
        "score": 85,
        "feedback": "Từ vựng đa dạng: 'report', 'slides', 'meeting'. Rất tốt."
      }
    }
  ]
}
```

### 6.3 Level 3 — PRE-INTERMEDIATE

```json
{
  "overallScore": 73,
  "summary": {
    "strongPoints": [
      "Bài 1 dùng Past Simple đúng, đủ cả 2 ý",
      "Bài 3 dùng future tense tự nhiên, có connector 'because'"
    ],
    "weakPoints": [
      "Bài 2 dùng sai tense: kể chuyện quá khứ mà dùng present ('find', 'have')"
    ],
    "nextFocus": [
      "Ôn Past Simple bất quy tắc: find → found, have → had",
      "Dùng connector 'so', 'because' để nối ý khi kể sự kiện"
    ]
  },
  "exercises": [
    {
      "score": 94,
      "taskCompletion": {
        "score": 100,
        "feedback": "Hoàn thành đủ: nơi đến + khi nào + hoạt động.",
        "tasks": [
          { "task": "Nói bạn đã đi đâu và khi nào", "completed": true },
          { "task": "Nói một hoạt động bạn làm ở đó", "completed": true }
        ]
      },
      "grammar": {
        "score": 95,
        "feedback": "Past Simple ('went', 'visited', 'ate') đúng hoàn toàn."
      },
      "vocabulary": {
        "score": 85,
        "feedback": "Từ vựng phù hợp: 'visited', 'Hoan Kiem Lake'."
      }
    },
    {
      "score": 38,
      "taskCompletion": {
        "score": 50,
        "feedback": "Nói được vấn đề và đề xuất sửa, nhưng thiếu thời gian cụ thể.",
        "tasks": [
          { "task": "Nói rõ bạn gặp vấn đề gì", "completed": true },
          { "task": "Nói khi nào vấn đề xảy ra", "completed": false },
          { "task": "Đề xuất hành động tiếp theo", "completed": true }
        ]
      },
      "grammar": {
        "score": 25,
        "feedback": "'I find' → 'I found', 'It have' → 'It had'. Kể quá khứ phải dùng Past Simple."
      },
      "vocabulary": {
        "score": 50,
        "feedback": "Từ vựng ổn nhưng câu thiếu connector. Thử: 'so I will fix them.'"
      }
    },
    {
      "score": 93,
      "taskCompletion": {
        "score": 95,
        "feedback": "Hoàn thành cả 2 ý: trả lời đồng ý + nói lý do.",
        "tasks": [
          {
            "task": "Trả lời đồng ý hoặc không bằng 'I'm going to' hoặc 'I will'",
            "completed": true
          },
          { "task": "Nói khi cụ thể hoặc lý do", "completed": true }
        ]
      },
      "grammar": {
        "score": 95,
        "feedback": "Future tense đúng. Bonus: dùng 'because' đúng — vượt mức Level 3 cơ bản."
      },
      "vocabulary": {
        "score": 85,
        "feedback": "Từ vựng tốt: 'relax', 'probably', 'coffee shop'."
      }
    }
  ]
}
```

---

## 7. EDGE CASES

> Xử lý giống Mode FREE — xem `09-free-mode-scoring-prompt.md` Section 7.

---

## 8. CODE MẪU GỌI OPENAI CHATGPT

### 8.1 Build system prompt

```typescript
// scoring/build-guided-system-prompt.ts

import { LevelContext } from './level-context'; // dùng chung với FREE mode

export function buildGuidedModeScoringSystemPrompt(ctx: LevelContext): string {
  return `You are an English speaking coach evaluating a Vietnamese student's spoken responses.
You are scoring an entire pack of exercises at once.

═══════════════════════════════════════
STUDENT LEVEL: ${ctx.level} — ${ctx.levelCode}
═══════════════════════════════════════

LEVEL CONTEXT — this defines the FLOOR (minimum complexity), NOT a ceiling:
  • Grammar floor: ${ctx.grammarFloor}
  • Reference structures: ${ctx.referenceStructures}
  • Tenses expected: ${ctx.tenses}
  • Connectors expected: ${ctx.connectors}
  • Vocabulary scope: ${ctx.vocabScope}
  • Complexity hint: ${ctx.complexityHint}

═══════════════════════════════════════
SCORING MODE: GUIDED
═══════════════════════════════════════

In GUIDED mode, the student follows specific Vietnamese instructions (\`m\`) that tell them what to say.
You evaluate how well the student completed the tasks described in \`m\`.

Each exercise provides:
  • Prompt (p): the conversation prompt.
  • Instruction (m): Vietnamese task checklist — what the student should say.
  • Sample (s): a reference answer showing one correct way to respond.
  • Student transcript: what the student actually said.

─── SCORING CRITERIA (per exercise) ───

Each exercise is scored 0–100. There are 3 sub-scores, each on a 0–100 scale:

1. TASK COMPLETION (weight: 40%, score: 0–100)
   - Did the student complete each task listed in \`m\`?
   - Evaluate each task individually. Same meaning with different words = completed.
   - All tasks completed → 90–100. Most (≥ 50%) → 60–80. Few or none → 0–50.

2. GRAMMAR (weight: 35%, score: 0–100)
   - Penalize ONLY incorrect grammar. Grammar ABOVE level and correct → bonus (+5, max 100).
   - Response below grammar floor → penalize.

3. VOCABULARY (weight: 25%, score: 0–100)
   - Appropriate for CEFR level? Above level and correct → bonus.
   - Limited or repetitive → lower score.

─── EXERCISE SCORE FORMULA ───

exerciseScore = round(taskCompletion × 0.40 + grammar × 0.35 + vocabulary × 0.25)

─── OVERALL PACK SCORE ───

overallScore = round(average of all exercise scores)

─── CRITICAL RULES ───

1. FLOOR-ONLY: Only penalize WRONG grammar, never "too advanced".
2. TASK EVALUATION: Evaluate generously — same meaning with different words = completed.
3. No pronunciation evaluation — text transcripts only.
4. FEEDBACK: Vietnamese. Specific and actionable. Under 25 words each.
5. TONE: Score ≥ 80 → positive. 60–79 → encouraging. < 60 → supportive.

─── RESPONSE FORMAT ───

Return a valid JSON object matching the schema below. No markdown, no explanation outside JSON.`;
}
```

### 8.2 Build user message

```typescript
// scoring/build-guided-user-message.ts

interface GuidedExerciseInput {
  prompt: string; // field `p`
  instruction: string; // field `m`
  sample: string; // field `s`
  transcript: string; // từ Whisper STT
  // `h` (hint) không gửi — chỉ hiện trên FE
}

export function buildGuidedModeUserMessage(
  level: number,
  exercises: GuidedExerciseInput[],
): string {
  const exerciseBlock = exercises
    .map(
      (ex, i) =>
        `EXERCISE ${i + 1}:
  Prompt (p): "${ex.prompt}"
  Instruction (m): "${ex.instruction}"
  Sample (s): "${ex.sample}"
  Student transcript: "${ex.transcript}"`,
    )
    .join('\n\n');

  return `Evaluate ${exercises.length} exercises from the same pack (Level ${level}, GUIDED mode).

${exerciseBlock}

Return JSON matching the provided schema.`;
}
```

### 8.3 Response schema (JSON Schema cho OpenAI Structured Outputs)

```typescript
// scoring/guided-mode-response-schema.ts

export const GUIDED_MODE_RESPONSE_SCHEMA = {
  name: 'guided_mode_scoring',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      overallScore: {
        type: 'number',
      },
      summary: {
        type: 'object',
        properties: {
          strongPoints: { type: 'array', items: { type: 'string' } },
          weakPoints: { type: 'array', items: { type: 'string' } },
          nextFocus: { type: 'array', items: { type: 'string' } },
        },
        required: ['strongPoints', 'weakPoints', 'nextFocus'],
        additionalProperties: false,
      },
      exercises: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            score: { type: 'number' },
            taskCompletion: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                feedback: { type: 'string' },
                tasks: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      task: { type: 'string' },
                      completed: { type: 'boolean' },
                    },
                    required: ['task', 'completed'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['score', 'feedback', 'tasks'],
              additionalProperties: false,
            },
            grammar: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                feedback: { type: 'string' },
              },
              required: ['score', 'feedback'],
              additionalProperties: false,
            },
            vocabulary: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                feedback: { type: 'string' },
              },
              required: ['score', 'feedback'],
              additionalProperties: false,
            },
          },
          required: ['score', 'taskCompletion', 'grammar', 'vocabulary'],
          additionalProperties: false,
        },
      },
    },
    required: ['overallScore', 'summary', 'exercises'],
    additionalProperties: false,
  },
} as const;
```

### 8.4 Gọi OpenAI ChatGPT

```typescript
// scoring/guided-mode-scoring.service.ts

import OpenAI from 'openai';
import { LEVEL_CONTEXTS } from './level-context';
import { buildGuidedModeScoringSystemPrompt } from './build-guided-system-prompt';
import { buildGuidedModeUserMessage } from './build-guided-user-message';
import { GUIDED_MODE_RESPONSE_SCHEMA } from './guided-mode-response-schema';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GuidedScoringInput {
  levelId: number;
  exercises: Array<{
    prompt: string;
    instruction: string;
    sample: string;
    transcript: string;
  }>;
}

export async function scoreGuidedMode(input: GuidedScoringInput) {
  const levelCtx = LEVEL_CONTEXTS[input.levelId];
  if (!levelCtx) throw new Error(`Unknown level: ${input.levelId}`);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    max_tokens: 3072,
    messages: [
      { role: 'system', content: buildGuidedModeScoringSystemPrompt(levelCtx) },
      {
        role: 'user',
        content: buildGuidedModeUserMessage(input.levelId, input.exercises),
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: GUIDED_MODE_RESPONSE_SCHEMA,
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty response');

  return JSON.parse(content);
}
```

### 8.5 Ví dụ sử dụng

```typescript
const result = await scoreGuidedMode({
  levelId: 2,
  exercises: [
    {
      prompt: 'What do you do here?',
      instruction: 'Nói công việc chính. Nói bạn làm việc với ai.',
      sample: 'I answer customer emails. I work with the support team.',
      transcript: 'I answer emails and I work with my team.',
    },
    {
      prompt: 'How often do you have meetings?',
      instruction: 'Nói tần suất họp. Nói bạn thường họp với ai.',
      sample: 'I usually have meetings on Monday. I meet with my manager.',
      transcript: 'I have meeting.',
    },
  ],
});

console.log(result.overallScore); // 62
console.log(result.exercises[0].taskCompletion.tasks); // [{task: "Nói công việc chính", completed: true}, ...]
console.log(result.exercises[1].grammar.feedback); // "'I have meeting' → 'I have meetings'..."
```

---

## 9. SO SÁNH MODE FREE vs GUIDED

|                     | Mode FREE (`09-...`) | Mode GUIDED (`10-...`)         |
| :------------------ | :------------------- | :----------------------------- |
| Input cho AI        | `p` + `transcript`   | `p` + `m` + `s` + `transcript` |
| Tiêu chí #1 (40%)   | Relevance            | Task Completion                |
| Tiêu chí #2 (35%)   | Grammar              | Grammar                        |
| Tiêu chí #3 (25%)   | Vocabulary           | Vocabulary                     |
| `suggestedPhrases`  | Có (Level 2 & 3)     | Không (đã có `s` làm mẫu)      |
| `tasks[]` checklist | Không                | Có — từng task trong `m`       |
| `h` (hint)          | Không gửi            | Không gửi (chỉ hiện FE)        |
| Phù hợp nhất        | Level 2, Level 3     | Level 1, Level 2               |
