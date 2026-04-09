# Mode A — FREE: Scoring Prompt Specification

> **Scope:** Prompt + Response schema cho Mode FREE (phản xạ tự nhiên).
> **Áp dụng:** Chung 1 system prompt cho cả 3 level — level context được inject qua biến.
> **Tham chiếu:** `08-scoring-feedback-design.md`, `data/level/level.json`

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
SCORING MODE: FREE
═══════════════════════════════════════

In FREE mode, the student speaks freely. You evaluate based on the prompt and the student's transcript only.

─── SCORING CRITERIA (per exercise) ───

Each exercise is scored 0–100. There are 3 sub-scores, each also on a 0–100 scale:

1. RELEVANCE (weight: 40%, score: 0–100)
   - Does the student's response address the prompt?
   - Completely off-topic → relevance score ≤ 20, cap total exercise score at 30.
   - Partially relevant → relevance score 40–60.
   - Fully relevant → relevance score 80–100.

2. GRAMMAR (weight: 35%, score: 0–100)
   - Penalize ONLY incorrect grammar: wrong verb forms, wrong agreement, missing articles, wrong tense usage.
   - Penalize regardless of which level the grammar structure belongs to.
   - If the student uses grammar ABOVE their level correctly → do NOT penalize. Award bonus instead.
   - If the response is significantly below the grammar floor (e.g., only fragments or single words at Level 1, or only simple S+V+O at Level 2) → penalize by lowering grammar score.
   - Bonus (+5 to grammar score, max 100): when student correctly uses structures above their level.

3. VOCABULARY (weight: 25%, score: 0–100)
   - Is the vocabulary appropriate for the student's CEFR level?
   - Using vocabulary ABOVE the level correctly → do NOT penalize, may bonus.
   - Very limited or repetitive vocabulary → lower score.
   - Vocabulary errors (wrong word choice causing meaning change) → penalize.

─── EXERCISE SCORE FORMULA ───

exerciseScore = round(relevance × 0.40 + grammar × 0.35 + vocabulary × 0.25)

─── OVERALL PACK SCORE ───

overallScore = round(average of all exercise scores)

─── CRITICAL RULES ───

1. FLOOR-ONLY PRINCIPLE: The level defines the minimum expected complexity, NOT a ceiling.
   - Student using past tense at Level 1? → GOOD, bonus if correct.
   - Student using "because" at Level 2? → GOOD, bonus if correct.
   - Student using "however" at Level 3? → GOOD, bonus if correct.
   - ONLY penalize when grammar is WRONG, never when it's "too advanced".

2. DO NOT evaluate pronunciation — you only have text transcripts.

3. FEEDBACK LANGUAGE: All feedback messages MUST be in Vietnamese.

4. FEEDBACK QUALITY:
   - Each sub-score (relevance, grammar, vocabulary) has its own feedback string.
   - Be specific and actionable — point out exact errors and provide corrections.
   - BAD: "Ngữ pháp chưa đúng."
   - GOOD: "'I is' → 'I am'. Chủ ngữ 'I' luôn đi với 'am'."
   - Keep each feedback message concise (under 25 words).

5. FEEDBACK TONE:
   - Score ≥ 80: Positive tone, highlight what's good. Feedback is secondary.
   - Score 60–79: Encouraging, focus on 1–2 key improvements.
   - Score < 60: Supportive, never critical. Guide toward improvement.

6. SUGGESTED PHRASES (Level 2 & 3 only):
   - Provide 2–3 natural alternative phrases the student could have used.
   - These should match the prompt context and be at or slightly above the student's level.
   - Purpose: expand the student's active vocabulary and expression range.

─── RESPONSE FORMAT ───

Return a valid JSON object matching the schema below. No markdown, no explanation outside JSON.
```

---

## 2. LEVEL CONTEXT — Giá trị inject cho từng level

Khi gọi AI, BE thay thế các placeholder `{...}` trong system prompt bằng giá trị tương ứng từ `level.json`:

### Level 1 — BEGINNER

| Placeholder | Giá trị |
| :--- | :--- |
| `{level}` | `1` |
| `{levelCode}` | `BEGINNER` |
| `{grammarFloor}` | `Complete sentence with Subject + Verb. Single words or fragments are NOT acceptable.` |
| `{referenceStructures}` | `S + be (am/is/are) + N/Adj, S + V(s/es) + O, S + can/can't + V, There is/are, What/Who/Where + be...?, Do/Does + S + V?` |
| `{tenses}` | `Present Simple` |
| `{connectors}` | `None required` |
| `{vocabScope}` | `CEFR A1 — basic nouns (family, objects, food), common verbs (be, have, go, like, want), simple adjectives (big, small, good, bad), numbers, colors, simple time words (today, now, every day). Max ~300 words.` |
| `{complexityHint}` | `Very low — single idea, 1 sentence expected.` |

### Level 2 — ELEMENTARY

| Placeholder | Giá trị |
| :--- | :--- |
| `{level}` | `2` |
| `{levelCode}` | `ELEMENTARY` |
| `{grammarFloor}` | `Sentence with at least 2 ideas OR 1 sentence with modifier (adjective, frequency adverb, or extra info). Bare S+V+O like Level 1 is below floor.` |
| `{referenceStructures}` | `All L1 + S + be + V-ing, S + V + adv of freq (always/often/sometimes), How much/many...?, I like/want/need + N/to V, There are + number + N, Prepositions (in/on/at/to)` |
| `{tenses}` | `Present Simple, Present Continuous` |
| `{connectors}` | `and, but` |
| `{vocabScope}` | `CEFR A1–A2 — all L1 vocab + 2-syllable adjectives (happy, hungry, tired, busy), frequency adverbs (always, often, usually, sometimes, never), common phrasal verbs (get up, go out, come back, wake up), emotion words (love, hate, enjoy, miss, feel), time words (yesterday, tomorrow, last week). Max ~600 words.` |
| `{complexityHint}` | `Low — 2 connected sentences or 1 sentence with details.` |

### Level 3 — PRE-INTERMEDIATE

| Placeholder | Giá trị |
| :--- | :--- |
| `{level}` | `3` |
| `{levelCode}` | `PRE_INTERMEDIATE` |
| `{grammarFloor}` | `Must use correct tense matching context — past events require Past Simple. Sentences must show logical sequence or cause-and-effect. Using present tense for past events is a serious floor violation.` |
| `{referenceStructures}` | `All L1, L2 + Past Simple (regular/irregular), Future (will/going to), Comparatives (more/adj-er + than), Should/Must/Have to + V, Compound sentences with connectors` |
| `{tenses}` | `Present Simple, Present Continuous, Past Simple, Future Simple (will/going to)` |
| `{connectors}` | `and, but, so, because, then` |
| `{vocabScope}` | `CEFR A2–B1 — all L1-L2 vocab + emotions (excited, nervous, disappointed, surprised), travel (airport, hotel, ticket, luggage), shopping (cheap, expensive, discount, price), work (office, meeting, deadline, project), weather (sunny, cloudy, rainy), common phrasal verbs (look for, find out, give up), comparatives (better, worse, more comfortable). Max ~1200 words.` |
| `{complexityHint}` | `Medium-low — 2–3 sentences with time sequence, cause-effect, or comparison.` |

---

## 3. USER MESSAGE TEMPLATE

```
Evaluate {exerciseCount} exercises from the same pack (Level {level}, FREE mode).

{exercises}

Return JSON matching the provided schema.
```

Trong đó `{exercises}` được build theo format:

```
EXERCISE 1:
  Prompt (p): "{p}"
  Student transcript: "{transcript}"

EXERCISE 2:
  Prompt (p): "{p}"
  Student transcript: "{transcript}"

...
```

> **Lưu ý:** Mode FREE chỉ gửi `p` (prompt) và `transcript` cho AI.

---

## 4. USER MESSAGE EXAMPLES

### 4.1 Level 1 — BEGINNER

```
Evaluate 3 exercises from the same pack (Level 1, FREE mode).

EXERCISE 1:
  Prompt (p): "Nice park today, isn't it?"
  Student transcript: "Yes, it is nice. I like this park."

EXERCISE 2:
  Prompt (p): "What do you do every morning?"
  Student transcript: "I is wake up and eat."

EXERCISE 3:
  Prompt (p): "Do you have any pets?"
  Student transcript: "Yes. Dog. Big."

Return JSON matching the provided schema.
```

### 4.2 Level 2 — ELEMENTARY

```
Evaluate 3 exercises from the same pack (Level 2, FREE mode).

EXERCISE 1:
  Prompt (p): "What are you doing this weekend?"
  Student transcript: "I am going to the mall with my friend. We usually go shopping on Saturday."

EXERCISE 2:
  Prompt (p): "Tell me about your daily routine."
  Student transcript: "I work. I eat."

EXERCISE 3:
  Prompt (p): "What do you like about your job?"
  Student transcript: "I like my job because the people are friendly and I am learning new things."

Return JSON matching the provided schema.
```

### 4.3 Level 3 — PRE-INTERMEDIATE

```
Evaluate 3 exercises from the same pack (Level 3, FREE mode).

EXERCISE 1:
  Prompt (p): "How was your last trip?"
  Student transcript: "I went to Da Lat last month. The weather was cold but the food was amazing. I will go back next year."

EXERCISE 2:
  Prompt (p): "Tell me about a problem you had at work recently."
  Student transcript: "Last week I have a problem with my computer. It not working so I call IT."

EXERCISE 3:
  Prompt (p): "What's the best restaurant you've been to?"
  Student transcript: "I go to a Japanese restaurant last week. The sushi is very fresh and the price is cheap."

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
      "relevance": {
        "score": 90,
        "feedback": "Câu trả lời đúng chủ đề, trả lời trực tiếp câu hỏi."
      },
      "grammar": {
        "score": 80,
        "feedback": "'I is' → 'I am'. Chủ ngữ 'I' luôn đi với 'am'."
      },
      "vocabulary": {
        "score": 85,
        "feedback": "Từ vựng phù hợp level, dùng đúng ngữ cảnh."
      }
    }
  ],
  "suggestedPhrases": [
    "I usually go there on weekends.",
    "The weather was really nice last time.",
    "I'm planning to visit again soon."
  ]
}
```

### 5.1 Schema Definition

```typescript
interface FreeModeScoringResponse {
  /** Điểm trung bình toàn pack (0–100) */
  overallScore: number;

  /** Tổng kết toàn pack */
  summary: {
    /** Điểm mạnh nổi bật (1–3 items) */
    strongPoints: string[];
    /** Điểm yếu cần cải thiện (1–3 items) */
    weakPoints: string[];
    /** Gợi ý tập trung luyện tiếp (1–3 items) — ARRAY vì có thể nhiều hướng */
    nextFocus: string[];
  };

  /**
   * Kết quả từng bài — THỨ TỰ TRONG MẢNG = seq.
   * exercises[0] = bài 1, exercises[1] = bài 2, ...
   * FE tự map index, không cần field `seq` trong response.
   */
  exercises: ExerciseResult[];

  /**
   * Gợi ý cụm từ / câu mẫu tự nhiên liên quan đến chủ đề pack.
   * CHỈ CÓ Ở LEVEL 2 VÀ 3. Level 1: field này = null hoặc không có.
   * Mục đích: mở rộng vốn diễn đạt cho người học.
   * 2–3 câu, phù hợp hoặc hơi cao hơn level hiện tại.
   */
  suggestedPhrases?: string[] | null;
}

interface ExerciseResult {
  /** Điểm tổng bài này (0–100) = relevance×0.4 + grammar×0.35 + vocab×0.25 */
  score: number;

  /** Đánh giá mức độ liên quan đến prompt */
  relevance: SubScore;

  /** Đánh giá ngữ pháp */
  grammar: SubScore;

  /** Đánh giá từ vựng */
  vocabulary: SubScore;
}

interface SubScore {
  /** Điểm thành phần (0–100) */
  score: number;
  /** Feedback bằng tiếng Việt, ngắn gọn, actionable (≤ 25 từ) */
  feedback: string;
}
```

### 5.2 Quy tắc cho `suggestedPhrases`

| Level | `suggestedPhrases` | Ghi chú |
| :--- | :--- | :--- |
| Level 1 | `null` hoặc không trả | Người mới — tập trung nói đúng câu cơ bản trước. |
| Level 2 | 2–3 câu | Câu dùng connector `and/but`, frequency adverb, Present Continuous. |
| Level 3 | 2–3 câu | Câu dùng Past Simple, connectors `because/so/then`, comparatives. |

`suggestedPhrases` phải liên quan đến chủ đề chung của pack (không phải random), và phải là những câu người học có thể dùng trong giao tiếp thực tế.

---

## 6. RESPONSE EXAMPLES

### 6.1 Level 1 — BEGINNER (example response)

```json
{
  "overallScore": 63,
  "summary": {
    "strongPoints": [
      "Bài 1 trả lời đúng chủ đề, câu hoàn chỉnh"
    ],
    "weakPoints": [
      "Bài 2 sai chia động từ 'be'",
      "Bài 3 chỉ nói từ rời rạc, chưa thành câu"
    ],
    "nextFocus": [
      "Luyện nói thành câu hoàn chỉnh có Subject + Verb",
      "Ôn chia động từ 'be': I am, He/She is, They are"
    ]
  },
  "exercises": [
    {
      "score": 90,
      "relevance": {
        "score": 95,
        "feedback": "Trả lời đúng chủ đề, phù hợp ngữ cảnh."
      },
      "grammar": {
        "score": 90,
        "feedback": "Câu đúng ngữ pháp, đủ S + V. Tốt!"
      },
      "vocabulary": {
        "score": 85,
        "feedback": "Từ vựng đơn giản, phù hợp Level 1."
      }
    },
    {
      "score": 55,
      "relevance": {
        "score": 80,
        "feedback": "Đúng chủ đề — nói về buổi sáng."
      },
      "grammar": {
        "score": 35,
        "feedback": "'I is wake up' → 'I wake up'. Không dùng 'is' trước động từ chính."
      },
      "vocabulary": {
        "score": 60,
        "feedback": "Từ vựng ổn nhưng câu quá ngắn, thiếu chi tiết."
      }
    },
    {
      "score": 35,
      "relevance": {
        "score": 80,
        "feedback": "Có liên quan đến câu hỏi về thú cưng."
      },
      "grammar": {
        "score": 10,
        "feedback": "'Yes. Dog. Big.' — chưa thành câu. Thử: 'Yes, I have a big dog.'"
      },
      "vocabulary": {
        "score": 40,
        "feedback": "Chỉ có 3 từ rời rạc. Cần nói thành câu đầy đủ."
      }
    }
  ],
  "suggestedPhrases": null
}
```

### 6.2 Level 2 — ELEMENTARY (example response)

```json
{
  "overallScore": 75,
  "summary": {
    "strongPoints": [
      "Bài 1 dùng Present Continuous đúng, có connector 'and'",
      "Bài 3 dùng 'because' đúng — vượt mức Level 2"
    ],
    "weakPoints": [
      "Bài 2 quá đơn giản, thiếu chi tiết — dưới floor Level 2"
    ],
    "nextFocus": [
      "Thêm trạng từ tần suất (usually, often, sometimes) vào câu",
      "Nối 2 ý bằng 'and' hoặc 'but' thay vì tách thành 2 câu cụt"
    ]
  },
  "exercises": [
    {
      "score": 92,
      "relevance": {
        "score": 95,
        "feedback": "Trả lời chính xác về kế hoạch cuối tuần."
      },
      "grammar": {
        "score": 95,
        "feedback": "Dùng Present Continuous ('am going') và 'usually' rất tốt."
      },
      "vocabulary": {
        "score": 85,
        "feedback": "Từ vựng đa dạng, phù hợp Level 2."
      }
    },
    {
      "score": 40,
      "relevance": {
        "score": 60,
        "feedback": "Có liên quan nhưng quá mơ hồ — 'work' và 'eat' không đủ chi tiết."
      },
      "grammar": {
        "score": 30,
        "feedback": "Câu quá đơn (chỉ S+V). Level 2 cần thêm chi tiết. Thử: 'I usually work from 9 to 5.'"
      },
      "vocabulary": {
        "score": 35,
        "feedback": "Chỉ dùng 2 động từ cơ bản. Cần đa dạng hơn."
      }
    },
    {
      "score": 93,
      "relevance": {
        "score": 90,
        "feedback": "Trả lời đúng về điều thích ở công việc."
      },
      "grammar": {
        "score": 95,
        "feedback": "Dùng 'because' đúng ngữ cảnh — bonus! Vượt mức Level 2."
      },
      "vocabulary": {
        "score": 90,
        "feedback": "Từ vựng tốt: 'friendly', 'learning new things'."
      }
    }
  ],
  "suggestedPhrases": [
    "I often go shopping with my friends on the weekend.",
    "I'm working on a new project at the office.",
    "The food is always delicious but sometimes expensive."
  ]
}
```

### 6.3 Level 3 — PRE-INTERMEDIATE (example response)

```json
{
  "overallScore": 72,
  "summary": {
    "strongPoints": [
      "Bài 1 dùng Past Simple đúng, có logic thời gian rõ ràng",
      "Bài 1 dùng 'but' và future tense — vượt mức cơ bản"
    ],
    "weakPoints": [
      "Bài 2 và 3 dùng sai tense — kể chuyện quá khứ mà dùng hiện tại",
      "Bài 2 thiếu connector logic giữa các ý"
    ],
    "nextFocus": [
      "Ôn Past Simple: go → went, have → had, is → was",
      "Dùng connector 'so', 'because', 'then' để nối ý logic"
    ]
  },
  "exercises": [
    {
      "score": 94,
      "relevance": {
        "score": 95,
        "feedback": "Trả lời đầy đủ về chuyến đi, có địa điểm + thời gian + kế hoạch."
      },
      "grammar": {
        "score": 95,
        "feedback": "Past Simple ('went', 'was') đúng hoàn toàn. Future 'will go back' cũng đúng."
      },
      "vocabulary": {
        "score": 90,
        "feedback": "Từ vựng đa dạng: 'amazing', 'weather', phù hợp Level 3."
      }
    },
    {
      "score": 52,
      "relevance": {
        "score": 75,
        "feedback": "Đúng chủ đề — nói về vấn đề ở công việc."
      },
      "grammar": {
        "score": 35,
        "feedback": "'I have a problem' → 'I had a problem'. 'It not working' → 'It wasn't working'. Kể quá khứ phải dùng Past Simple."
      },
      "vocabulary": {
        "score": 55,
        "feedback": "Từ vựng ổn nhưng câu thiếu connector. Thử thêm 'so' hoặc 'because'."
      }
    },
    {
      "score": 58,
      "relevance": {
        "score": 80,
        "feedback": "Đúng chủ đề về nhà hàng."
      },
      "grammar": {
        "score": 40,
        "feedback": "'I go' → 'I went', 'is very fresh' → 'was very fresh'. Đây là chuyện đã xảy ra — cần Past Simple."
      },
      "vocabulary": {
        "score": 65,
        "feedback": "Từ vựng phù hợp: 'fresh', 'price'. Thử thêm so sánh: 'cheaper than...'."
      }
    }
  ],
  "suggestedPhrases": [
    "I went there last weekend because my friend recommended it.",
    "The food was better than I expected, so I will go back soon.",
    "I had a great time even though the weather was not perfect."
  ]
}
```

---

## 7. EDGE CASES — XỬ LÝ TRƯỚC KHI GỌI AI

Các trường hợp sau được BE xử lý **trước khi gọi scoring model**, không cần gửi cho AI:

### 7.1 Transcript rỗng hoặc quá ngắn (< 3 từ)

```json
{
  "score": 0,
  "relevance": { "score": 0, "feedback": "Không nhận được câu trả lời đầy đủ." },
  "grammar": { "score": 0, "feedback": "Không có nội dung để đánh giá." },
  "vocabulary": { "score": 0, "feedback": "Hãy nói to và rõ hơn, ít nhất 1 câu hoàn chỉnh." }
}
```

### 7.2 Transcript không phải tiếng Anh

Whisper trả `language` field — BE check trước khi score.

```json
{
  "score": 0,
  "relevance": { "score": 0, "feedback": "Câu trả lời không phải tiếng Anh." },
  "grammar": { "score": 0, "feedback": "Không có nội dung tiếng Anh để đánh giá." },
  "vocabulary": { "score": 0, "feedback": "Vui lòng trả lời bằng tiếng Anh." }
}
```

> **Lưu ý:** Nếu cả pack đều là transcript rỗng/không phải tiếng Anh → không gọi AI, trả kết quả `overallScore: 0` trực tiếp và hoàn trả credit.

---

## 8. CODE MẪU GỌI OPENAI CHATGPT

### 8.1 Level context map (dùng chung)

```typescript
// scoring/level-context.ts

export interface LevelContext {
  level: number;
  levelCode: string;
  grammarFloor: string;
  referenceStructures: string;
  tenses: string;
  connectors: string;
  vocabScope: string;
  complexityHint: string;
}

export const LEVEL_CONTEXTS: Record<number, LevelContext> = {
  1: {
    level: 1,
    levelCode: 'BEGINNER',
    grammarFloor:
      'Complete sentence with Subject + Verb. Single words or fragments are NOT acceptable.',
    referenceStructures:
      'S + be (am/is/are) + N/Adj, S + V(s/es) + O, S + can/can\'t + V, There is/are, What/Who/Where + be...?, Do/Does + S + V?',
    tenses: 'Present Simple',
    connectors: 'None required',
    vocabScope:
      'CEFR A1 — basic nouns (family, objects, food), common verbs (be, have, go, like, want), simple adjectives (big, small, good, bad), numbers, colors, simple time words (today, now, every day). Max ~300 words.',
    complexityHint: 'Very low — single idea, 1 sentence expected.',
  },
  2: {
    level: 2,
    levelCode: 'ELEMENTARY',
    grammarFloor:
      'Sentence with at least 2 ideas OR 1 sentence with modifier (adjective, frequency adverb, or extra info). Bare S+V+O like Level 1 is below floor.',
    referenceStructures:
      'All L1 + S + be + V-ing, S + V + adv of freq (always/often/sometimes), How much/many...?, I like/want/need + N/to V, There are + number + N, Prepositions (in/on/at/to)',
    tenses: 'Present Simple, Present Continuous',
    connectors: 'and, but',
    vocabScope:
      'CEFR A1–A2 — all L1 vocab + 2-syllable adjectives (happy, hungry, tired, busy), frequency adverbs (always, often, usually, sometimes, never), common phrasal verbs (get up, go out, come back, wake up), emotion words (love, hate, enjoy, miss, feel), time words (yesterday, tomorrow, last week). Max ~600 words.',
    complexityHint: 'Low — 2 connected sentences or 1 sentence with details.',
  },
  3: {
    level: 3,
    levelCode: 'PRE_INTERMEDIATE',
    grammarFloor:
      'Must use correct tense matching context — past events require Past Simple. Sentences must show logical sequence or cause-and-effect. Using present tense for past events is a serious floor violation.',
    referenceStructures:
      'All L1, L2 + Past Simple (regular/irregular), Future (will/going to), Comparatives (more/adj-er + than), Should/Must/Have to + V, Compound sentences with connectors',
    tenses:
      'Present Simple, Present Continuous, Past Simple, Future Simple (will/going to)',
    connectors: 'and, but, so, because, then',
    vocabScope:
      'CEFR A2–B1 — all L1-L2 vocab + emotions (excited, nervous, disappointed, surprised), travel (airport, hotel, ticket, luggage), shopping (cheap, expensive, discount, price), work (office, meeting, deadline, project), weather (sunny, cloudy, rainy), common phrasal verbs (look for, find out, give up), comparatives (better, worse, more comfortable). Max ~1200 words.',
    complexityHint:
      'Medium-low — 2–3 sentences with time sequence, cause-effect, or comparison.',
  },
};
```

### 8.2 Build system prompt

```typescript
// scoring/build-system-prompt.ts

import { LevelContext } from './level-context';

export function buildFreeModeScoringSystemPrompt(ctx: LevelContext): string {
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
SCORING MODE: FREE
═══════════════════════════════════════

In FREE mode, the student speaks freely. You evaluate based on the prompt and the student's transcript only.

─── SCORING CRITERIA (per exercise) ───

Each exercise is scored 0–100. There are 3 sub-scores, each also on a 0–100 scale:

1. RELEVANCE (weight: 40%, score: 0–100)
   - Does the student's response address the prompt?
   - Completely off-topic → relevance score ≤ 20, cap total exercise score at 30.
   - Partially relevant → relevance score 40–60.
   - Fully relevant → relevance score 80–100.

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

exerciseScore = round(relevance × 0.40 + grammar × 0.35 + vocabulary × 0.25)

─── OVERALL PACK SCORE ───

overallScore = round(average of all exercise scores)

─── CRITICAL RULES ───

1. FLOOR-ONLY PRINCIPLE: The level defines the minimum expected complexity, NOT a ceiling.
   - ONLY penalize when grammar is WRONG, never when it's "too advanced".
2. DO NOT evaluate pronunciation — you only have text transcripts.
3. FEEDBACK LANGUAGE: All feedback messages MUST be in Vietnamese.
4. FEEDBACK QUALITY:
   - Each sub-score (relevance, grammar, vocabulary) has its own feedback string.
   - Be specific and actionable — point out exact errors and provide corrections.
   - BAD: "Ngữ pháp chưa đúng."
   - GOOD: "'I is' → 'I am'. Chủ ngữ 'I' luôn đi với 'am'."
   - Keep each feedback message concise (under 25 words).

5. FEEDBACK TONE:
   - Score ≥ 80: Positive tone, highlight what's good.
   - Score 60–79: Encouraging, focus on 1–2 key improvements.
   - Score < 60: Supportive, never critical. Guide toward improvement.

6. SUGGESTED PHRASES (Level 2 & 3 only):
   - Provide 2–3 natural alternative phrases the student could have used.
   - These should match the prompt context and be at or slightly above the student's level.

─── RESPONSE FORMAT ───

Return a valid JSON object matching the schema below. No markdown, no explanation outside JSON.`;
}
```

### 8.3 Build user message

```typescript
// scoring/build-user-message.ts

interface ExerciseInput {
  prompt: string;     // field `p` từ exercise data
  transcript: string; // từ Whisper STT
}

export function buildFreeModeUserMessage(
  level: number,
  exercises: ExerciseInput[],
): string {
  const exerciseBlock = exercises
    .map(
      (ex, i) =>
        `EXERCISE ${i + 1}:\n  Prompt (p): "${ex.prompt}"\n  Student transcript: "${ex.transcript}"`,
    )
    .join('\n\n');

  return `Evaluate ${exercises.length} exercises from the same pack (Level ${level}, FREE mode).

${exerciseBlock}

Return JSON matching the provided schema.`;
}
```

### 8.4 Response schema (JSON Schema cho OpenAI Structured Outputs)

```typescript
// scoring/free-mode-response-schema.ts

/**
 * JSON Schema dùng với OpenAI response_format: { type: "json_schema" }
 * Xem: https://platform.openai.com/docs/guides/structured-outputs
 */
export const FREE_MODE_RESPONSE_SCHEMA = {
  name: 'free_mode_scoring',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      overallScore: {
        type: 'number',
        description: 'Điểm trung bình toàn pack (0–100)',
      },
      summary: {
        type: 'object',
        properties: {
          strongPoints: {
            type: 'array',
            items: { type: 'string' },
            description: 'Điểm mạnh nổi bật (1–3 items)',
          },
          weakPoints: {
            type: 'array',
            items: { type: 'string' },
            description: 'Điểm yếu cần cải thiện (1–3 items)',
          },
          nextFocus: {
            type: 'array',
            items: { type: 'string' },
            description: 'Gợi ý tập trung luyện tiếp (1–3 items)',
          },
        },
        required: ['strongPoints', 'weakPoints', 'nextFocus'],
        additionalProperties: false,
      },
      exercises: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            score: {
              type: 'number',
              description: 'Điểm tổng bài (0–100)',
            },
            relevance: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                feedback: { type: 'string' },
              },
              required: ['score', 'feedback'],
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
          required: ['score', 'relevance', 'grammar', 'vocabulary'],
          additionalProperties: false,
        },
        description: 'Kết quả từng bài — thứ tự = seq',
      },
      suggestedPhrases: {
        type: ['array', 'null'],
        items: { type: 'string' },
        description:
          'Gợi ý câu mẫu (Level 2 & 3 only, null cho Level 1)',
      },
    },
    required: [
      'overallScore',
      'summary',
      'exercises',
      'suggestedPhrases',
    ],
    additionalProperties: false,
  },
} as const;
```

### 8.5 Gọi OpenAI ChatGPT (full example)

```typescript
// scoring/free-mode-scoring.service.ts

import OpenAI from 'openai';
import { LEVEL_CONTEXTS, LevelContext } from './level-context';
import { buildFreeModeScoringSystemPrompt } from './build-system-prompt';
import { buildFreeModeUserMessage } from './build-user-message';
import { FREE_MODE_RESPONSE_SCHEMA } from './free-mode-response-schema';

// ── Types ────────────────────────────────────────────────

interface SubScore {
  score: number;
  feedback: string;
}

interface ExerciseResult {
  score: number;
  relevance: SubScore;
  grammar: SubScore;
  vocabulary: SubScore;
}

interface FreeModeScoringResponse {
  overallScore: number;
  summary: {
    strongPoints: string[];
    weakPoints: string[];
    nextFocus: string[];
  };
  exercises: ExerciseResult[];
  suggestedPhrases: string[] | null;
}

interface ScoringInput {
  levelId: number;
  exercises: Array<{
    prompt: string;      // field `p`
    transcript: string;  // từ Whisper
  }>;
}

// ── Service ──────────────────────────────────────────────

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function scoreFreeMode(
  input: ScoringInput,
): Promise<FreeModeScoringResponse> {
  const levelCtx = LEVEL_CONTEXTS[input.levelId];
  if (!levelCtx) {
    throw new Error(`Unknown level: ${input.levelId}`);
  }

  const systemPrompt = buildFreeModeScoringSystemPrompt(levelCtx);
  const userMessage = buildFreeModeUserMessage(
    input.levelId,
    input.exercises,
  );

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',           // hoặc 'gpt-4o' nếu cần accuracy cao hơn
    temperature: 0.3,                // thấp để scoring ổn định
    max_tokens: 2048,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: FREE_MODE_RESPONSE_SCHEMA,
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned empty response');
  }

  const result: FreeModeScoringResponse = JSON.parse(content);
  return result;
}
```

### 8.6 Ví dụ sử dụng

```typescript
// Ví dụ gọi scoring cho 1 pack Level 2
const result = await scoreFreeMode({
  levelId: 2,
  exercises: [
    {
      prompt: 'What are you doing this weekend?',
      transcript:
        'I am going to the mall with my friend. We usually go shopping on Saturday.',
    },
    {
      prompt: 'Tell me about your daily routine.',
      transcript: 'I work. I eat.',
    },
    {
      prompt: 'What do you like about your job?',
      transcript:
        'I like my job because the people are friendly and I am learning new things.',
    },
  ],
});

console.log(result.overallScore);       // 75
console.log(result.exercises[0].score); // 92
console.log(result.suggestedPhrases);   // ["I often go...", ...]
```

> **Ghi chú về model:**
> - `gpt-4o-mini`: chi phí thấp, tốc độ nhanh (~2–3s), phù hợp cho scoring cơ bản.
> - `gpt-4o`: chính xác hơn khi đánh giá grammar phức tạp (L3), chi phí cao hơn ~10x.
> - `temperature: 0.3`: giữ scoring nhất quán giữa các lần gọi. Không dùng 0 để tránh repetitive.
