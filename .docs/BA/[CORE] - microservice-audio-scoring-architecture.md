# [CORE] Kiến trúc Microservice — Audio Pipeline & AI Scoring

> **Scope:** Thiết kế chi tiết luồng submit audio (Whisper STT) và AI scoring trên kiến trúc NestJS microservices hiện tại.
> **Tham chiếu:** `[CORE] - fe-audio-core-implementation.md`, `09-free-mode-scoring-prompt.md`, `10-guided-mode-scoring-prompt.md`, `[CORE] - content_monetization_and_pedagogy.md`

---

## 1. TỔNG QUAN KIẾN TRÚC HIỆN TẠI

```
                          ┌──────────────────────────┐
                          │       API Gateway        │ ← HTTP :3000
                          │   (JWT verify, routing)  │
                          └──────────┬───────────────┘
                                     │ RabbitMQ (RPC)
                    ┌────────────────┼────────────────────────┐
                    │                │                        │
              ┌─────▼─────┐   ┌─────▼──────┐          ┌──────▼──────┐
              │  auth-svc  │   │content-svc │          │ media-svc   │
              │  (JWT/Auth)│   │(Pack/Level)│          │ (S3 upload) │
              └───────────┘   └────────────┘          └─────────────┘
```

**Hiện trạng:** Chưa có service nào xử lý Whisper STT hoặc AI Scoring. Cần bổ sung luồng mới.

---

## 2. QUYẾT ĐỊNH KIẾN TRÚC: THÊM `ai-service`

### 2.1. Tại sao tạo service mới thay vì mở rộng content-service?

| Tiêu chí                | Mở rộng content-service                                  | Tạo ai-service mới                                 |
| :---------------------- | :------------------------------------------------------- | :------------------------------------------------- |
| Tách biệt trách nhiệm   | ❌ content-service vừa quản lý data CRUD, vừa gọi OpenAI | ✅ Rõ ràng: content = data, ai = external AI calls |
| Scaling độc lập         | ❌ Scale content kéo theo AI worker                      | ✅ AI calls chậm (3–6s) → scale riêng biệt         |
| API key management      | ❌ OpenAI key nằm trong content-service                  | ✅ Tập trung 1 nơi, dễ quản lý rate limit          |
| Retry & circuit breaker | ❌ Retry AI ảnh hưởng content queries                    | ✅ Retry policy riêng cho AI, không ảnh hưởng CRUD |
| Chi phí phát triển      | ✅ Không thêm service mới                                | ❌ Thêm setup, deploy, DB                          |

**Kết luận:** Tạo `ai-service` mới — chịu trách nhiệm duy nhất: gọi OpenAI (Whisper + ChatGPT scoring).

### 2.2. Kiến trúc mục tiêu

```
                              ┌──────────────────────────┐
                              │       API Gateway        │ ← HTTP :3000
                              │   (JWT, routing, upload)  │
                              └──────────┬───────────────┘
                                         │ RabbitMQ
                ┌───────────┬────────────┼────────────┬──────────────┐
                │           │            │            │              │
          ┌─────▼────┐ ┌────▼─────┐ ┌────▼─────┐ ┌───▼────┐ ┌──────▼──────┐
          │ auth-svc │ │content   │ │ ai-svc   │ │media   │ │ product-svc │
          │          │ │ -service │ │ (NEW)    │ │-service│ │             │
          └──────────┘ └──────────┘ └──────────┘ └────────┘ └─────────────┘
                                         │
                                    ┌────┴────┐
                                    │ OpenAI  │
                                    │ API     │
                                    │ - Whisper│
                                    │ - ChatGPT│
                                    └─────────┘
```

---

## 3. AI-SERVICE — CHI TIẾT THIẾT KẾ

### 3.1. Cấu trúc thư mục

```
apps/ai-service/
├── src/
│   ├── main.ts                     # RabbitMQ listener: ai_queue
│   ├── ai-service.module.ts
│   ├── whisper/
│   │   ├── whisper.module.ts
│   │   ├── whisper.controller.ts   # @MessagePattern handlers
│   │   └── whisper.service.ts      # Gọi OpenAI Whisper API
│   ├── scoring/
│   │   ├── scoring.module.ts
│   │   ├── scoring.controller.ts   # @MessagePattern handlers
│   │   ├── scoring.service.ts      # Orchestrator
│   │   ├── prompt-builder/
│   │   │   ├── free-mode.builder.ts    # buildFreeModeScoringSystemPrompt()
│   │   │   ├── guided-mode.builder.ts  # buildGuidedModeScoringSystemPrompt()
│   │   │   └── level-context.ts        # LEVEL_CONTEXTS map
│   │   └── schema/
│   │       ├── free-mode.schema.ts     # FREE_MODE_RESPONSE_SCHEMA
│   │       └── guided-mode.schema.ts   # GUIDED_MODE_RESPONSE_SCHEMA
│   └── common/
│       ├── openai.module.ts        # OpenAI client singleton
│       └── openai.service.ts       # Wrapper: retry, timeout, error handling
├── prisma/
│   └── schema.prisma               # ExerciseAttempt, PackScoring
└── test/
```

### 3.2. RabbitMQ Queue

```typescript
// apps/ai-service/src/main.ts
const app = await NestFactory.create(AiServiceModule);
app.connectMicroservice(rmqService.getOptions('AI_SERVICE', false));
// Queue: ai_queue
```

**Env config:**

```env
RABBIT_MQ_AI_SERVICE_QUEUE=ai_queue
OPENAI_API_KEY=sk-...
OPENAI_WHISPER_MODEL=whisper-1
OPENAI_SCORING_MODEL=gpt-4o-mini
```

### 3.3. Message Patterns (shared constants)

```typescript
// libs/common/src/constants/ai.constants.ts
export const AI_COMMANDS = {
  // Tầng 1: Whisper STT
  TRANSCRIBE_AUDIO: 'transcribe_audio',

  // Tầng 2: AI Scoring
  SCORE_PACK_FREE: 'score_pack_free',
  SCORE_PACK_GUIDED: 'score_pack_guided',
} as const;
```

---

## 4. LUỒNG CHI TIẾT — TẦNG 1: TRANSCRIPT PER EXERCISE

### 4.1. Sequence Diagram

```
FE              API Gateway        media-svc          content-svc       ai-svc           OpenAI
 │                  │                  │                  │                │               │
 │ [STEP 1] UPLOAD FILE                │                  │                │               │
 │ POST /media/upload                  │                  │                │               │
 ├─────────────────►│                  │                  │                │               │
 │                  │ ── RPC: UPLOAD ─►│                  │                │               │
 │                  │                  │ ── S3 Put ─────► S3               │               │
 │                  │                  │ ◄──── OK ─────── S3               │               │
 │                  │ ◄── { audioUrl } │                  │                │               │
 │ ◄─ { audioUrl } ─│                  │                  │                │               │
 │                  │                  │                  │                │               │
 │ [STEP 2] SUBMIT RECORDING           │                  │                │               │
 │ POST /exercises/{id}/transcript     │                  │                │               │
 │ { audioUrl, durationMs, seq }       │                  │                │               │
 ├─────────────────►│                  │                  │                │               │
 │                  │ [1] Verify JWT   │                  │                │               │
 │                  │ [2] Check credit (nếu seq=1, bài đầu)│                │               │
 │                  │                  │                  │                │               │
 │                  │ ────── RPC: SUBMIT_EXERCISE_AUDIO ─►│                │               │
 │                  │      (audioUrl, metadata)           │                │               │
 │                  │                  │                  │                │               │
 │                  │                  │                  │ ─ RPC: TRANSCRIBE_AUDIO ─►│               │
 │                  │                  │                  │   (audioUrl)              │               │
 │                  │                  │                  │                │ Whisper API ─┼──────────►│
 │                  │                  │                  │                │ ◄────────────┼───────────┤
 │                  │                  │                  │                │ transcript   │               │
 │                  │                  │                  │ ◄──────────────┤              │               │
 │                  │                  │                  │ { transcript } │              │               │
 │                  │                  │                  │                │              │               │
 │                  │                  │                  │ Save Attempt   │              │               │
 │                  │ ◄───────────────────────────────────┤ (status: OK)   │              │               │
 │ ◄── transcript ──┤                  │                  │                │              │               │
```

### 4.2. Phân chia trách nhiệm từng service

| Service             | Trách nhiệm                                              | Tại sao                                                              |
| :------------------ | :------------------------------------------------------- | :------------------------------------------------------------------- |
| **API Gateway**     | Route request, verify JWT, kiểm tra credit               | Gateway là entry point, điều phối flow cơ bản                        |
| **media-service**   | Nhận file từ FE (qua Gateway), upload S3, trả `audioUrl` | Gateway upload file trực tiếp rồi báo media-svc lưu metadata         |
| **content-service** | Orchestrate luồng: gọi whisper → lưu ExerciseAttempt     | Owns domain data (Exercise, Attempt); biết exerciseId thuộc pack nào |
| **ai-service**      | Gọi OpenAI Whisper API, trả transcript                   | Tách biệt AI calls; dễ retry/circuit-break; manage OpenAI rate limit |

### 4.3. Tại sao content-service orchestrate, không phải gateway?

Gateway nên là "thin proxy" — chỉ verify auth và route. Nếu gateway orchestrate (gọi media → gọi ai → gọi content), nó sẽ trở thành monolith ẩn. content-service sở hữu business logic: biết exercise thuộc pack nào, user đang ở bài thứ mấy, cần trừ credit hay không.

### 4.4. Upload Strategy — Two-Step (Khuyến nghị)

Tại sao chọn Two-Step (Upload riêng, Transcribe riêng)?

1. **Tránh lỗi RMQ:** Không gửi buffer file qua RabbitMQ.
2. **Re-usability:** Endpoint `/media/upload` dùng chung cho toàn hệ thống (avatar, bài tập, v.v.).
3. **Optimistic UI:** FE có thể thông báo "Upload xong, đang xử lý..." giúp trải nghiệm mượt hơn.

**Luồng code FE:**

```javascript
// Step 1: Upload file lấy URL
const { url: audioUrl } = await api.post('/media/upload', formData);

// Step 2: Gửi URL để transcribe
const { transcript } = await api.post(`/exercises/${id}/transcript`, { audioUrl, ... });
```

---

## 5. LUỒNG CHI TIẾT — TẦNG 2: AI SCORING PACK

### 5.1. Sequence Diagram

```
FE              API Gateway        content-svc        ai-svc                OpenAI
 │                  │                   │                │                     │
 │ POST /packs/{packId}/score           │                │                     │
 │ { mode: "FREE"|"GUIDED" }            │                │                     │
 ├─────────────────►│                   │                │                     │
 │                  │                   │                │                     │
 │                  │ [1] Verify JWT    │                │                     │
 │                  │ [2] Deduct 5 credit (AI feedback)  │                     │
 │                  │                   │                │                     │
 │                  │ ── RPC: SCORE_PACK ──────────────►│                     │
 │                  │    { packId, userId, mode }        │                     │
 │                  │                   │                │                     │
 │                  │                   │  [3] Load data:│                     │
 │                  │                   │   - Pack exercises (p, m, s)         │
 │                  │                   │   - ExerciseAttempts (transcripts)   │
 │                  │                   │   - Level context                    │
 │                  │                   │                │                     │
 │                  │                   │  ── RPC: SCORE_PACK_FREE/GUIDED ───►│
 │                  │                   │     { level, exercises[], mode }     │
 │                  │                   │                │                     │
 │                  │                   │                │  Build prompt       │
 │                  │                   │                │  (system + user msg)│
 │                  │                   │                │                     │
 │                  │                   │                │  ChatGPT API ──────►│
 │                  │                   │                │  (structured output)│
 │  [Loading...]    │                   │                │  ◄─────────────────┤
 │                  │                   │                │  { scores, feedback}│
 │                  │                   │                │                     │
 │                  │                   │  ◄─────────────┤                     │
 │                  │                   │  { overallScore, exercises[] }       │
 │                  │                   │                │                     │
 │                  │  Save PackScoring │                │                     │
 │                  │  (scores, feedback per exercise)   │                     │
 │                  │  ◄────────────────┤                │                     │
 │  ◄───────────────┤                   │                │                     │
 │  { overallScore, exercises[] }       │                │                     │
```

### 5.2. Phân chia trách nhiệm

| Service             | Trách nhiệm                                                                               |
| :------------------ | :---------------------------------------------------------------------------------------- |
| **API Gateway**     | Verify JWT, deduct 5 credit, gọi content-service                                          |
| **content-service** | Load exercise data + transcripts từ DB, gọi ai-service, lưu kết quả scoring               |
| **ai-service**      | Build prompt (dựa vào mode FREE/GUIDED), gọi ChatGPT, parse structured output, trả scores |

### 5.3. Dữ liệu content-service gửi cho ai-service

```typescript
// RPC payload: content-svc → ai-svc
interface ScorePackPayload {
  mode: 'FREE' | 'GUIDED';
  levelId: number; // 1, 2, 3
  exercises: Array<{
    seq: number;
    prompt: string; // p — luôn gửi
    instruction?: string; // m — chỉ gửi khi GUIDED
    sample?: string; // s — chỉ gửi khi GUIDED
    transcript: string; // từ ExerciseAttempt
  }>;
}
```

> **Lưu ý:** `h` (hint) KHÔNG bao giờ gửi cho AI — chỉ hiện trên FE.

### 5.4. ai-service xử lý nội bộ

```typescript
// apps/ai-service/src/scoring/scoring.service.ts
async scorePack(payload: ScorePackPayload) {
  const levelContext = LEVEL_CONTEXTS[payload.levelId];

  // 1. Build prompt dựa vào mode
  const systemPrompt = payload.mode === 'FREE'
    ? buildFreeModeScoringSystemPrompt(levelContext, payload.exercises.length)
    : buildGuidedModeScoringSystemPrompt(levelContext, payload.exercises.length);

  const userMessage = payload.mode === 'FREE'
    ? buildFreeModeUserMessage(payload.exercises)
    : buildGuidedModeUserMessage(payload.exercises);

  // 2. Chọn response schema
  const responseSchema = payload.mode === 'FREE'
    ? FREE_MODE_RESPONSE_SCHEMA
    : GUIDED_MODE_RESPONSE_SCHEMA;

  // 3. Gọi ChatGPT với structured output
  const result = await this.openaiService.chatCompletion({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: `${payload.mode.toLowerCase()}_mode_scoring`,
        strict: true,
        schema: responseSchema,
      },
    },
  });

  // 4. Parse & validate
  return JSON.parse(result.choices[0].message.content);
}
```

---

## 6. CREDIT FLOW — AI LÀM GÌ, AI KHÔNG LÀM GÌ

### 6.1. Ai kiểm tra credit?

| Hành động                       | Service                                  | Lý do                                             |
| :------------------------------ | :--------------------------------------- | :------------------------------------------------ |
| Kiểm tra đủ credit?             | **API Gateway** hoặc **product-service** | Gateway verify trước khi cho phép gọi tiếp        |
| Trừ credit Tầng 1 (transcript)  | **API Gateway** → product-service        | Trừ khi seq=1 bài đầu pack                        |
| Trừ credit Tầng 2 (AI feedback) | **API Gateway** → product-service        | Trừ 5 credit khi user nhấn "Nhận đánh giá AI"     |
| Hoàn trả credit khi lỗi         | **content-service** → product-service    | content-service biết khi nào Whisper/Scoring fail |

### 6.2. Credit service — mở rộng product-service

Hiện tại `product-service` quản lý Product. Mở rộng thêm `CreditModule`:

```typescript
// libs/common/src/constants/product.constants.ts
export const PRODUCT_COMMANDS = {
  // ... existing
  CHECK_CREDIT: 'check_credit',
  DEDUCT_CREDIT: 'deduct_credit',
  REFUND_CREDIT: 'refund_credit',
  GET_CREDIT_BALANCE: 'get_credit_balance',
};
```

```
product-service/
├── src/
│   ├── product/          # Existing
│   └── credit/           # NEW
│       ├── credit.module.ts
│       ├── credit.controller.ts   # @MessagePattern handlers
│       └── credit.service.ts      # Balance check, deduct, refund
```

**Prisma schema bổ sung (product-service):**

```prisma
model CreditBalance {
  id        String   @id @default(uuid())
  userId    String   @unique
  balance   Int      @default(0)
  updatedAt DateTime @updatedAt
}

model CreditTransaction {
  id            String   @id @default(uuid())
  userId        String
  amount        Int               // +20, -5, -7, +5 (refund)
  type          CreditTxType      // PURCHASE, DEDUCT_TRANSCRIPT, DEDUCT_SCORING, REFUND
  referenceType String?           // 'pack', 'pack_scoring'
  referenceId   String?           // packAttemptId
  description   String?
  createdAt     DateTime @default(now())

  @@index([userId, createdAt])
}

enum CreditTxType {
  PURCHASE
  DEDUCT_TRANSCRIPT
  DEDUCT_SCORING
  REFUND
}
```

---

## 7. DATABASE SCHEMA — AI-SERVICE & CONTENT-SERVICE

### 7.1. content-service (bổ sung)

```prisma
// apps/content-service/prisma/schema.prisma — BỔ SUNG

model ExerciseAttempt {
  id           String   @id @default(uuid())
  exerciseId   String
  userId       String
  packAttemptId String?
  sequenceOrder Int              // seq trong pack (1-5)
  audioUrl     String?           // S3 URL
  durationMs   Int?
  transcript   String?           // text từ Whisper
  status       AttemptStatus     @default(PENDING)
  attemptSeq   Int      @default(1)  // lần ghi thứ mấy (re-record)
  createdAt    DateTime @default(now())

  exercise     Exercise @relation(fields: [exerciseId], references: [id])

  @@index([userId, exerciseId])
  @@index([packAttemptId])
}

model PackAttempt {
  id           String   @id @default(uuid())
  userId       String
  lessonPackId String
  status       PackAttemptStatus @default(IN_PROGRESS)
  startedAt    DateTime @default(now())
  completedAt  DateTime?

  // Scoring (Tầng 2 — nullable, chỉ có khi user chọn AI feedback)
  scoringStatus ScoringStatus?
  overallScore  Int?             // 0–100
  passed        Boolean?
  scoringMode   ScoringMode?
  scoredAt      DateTime?
  aiResponseRaw Json?            // Raw JSON từ AI (debug/audit)

  lessonPack    LessonPack @relation(fields: [lessonPackId], references: [id])

  @@index([userId, lessonPackId])
}

model ExerciseScore {
  id             String   @id @default(uuid())
  packAttemptId  String
  exerciseId     String
  sequenceOrder  Int
  score          Int              // 0–100

  // Sub-scores
  criterion1Score Int             // Relevance (FREE) hoặc TaskCompletion (GUIDED)
  criterion1Feedback String?
  grammarScore    Int
  grammarFeedback String?
  vocabScore      Int
  vocabFeedback   String?

  // GUIDED only
  tasks          Json?            // [{task, completed}] — chỉ mode GUIDED

  // FREE only (L2, L3)
  suggestedPhrases Json?          // string[] — chỉ mode FREE, L2 & L3

  packAttempt    PackAttempt @relation(fields: [packAttemptId], references: [id])

  @@index([packAttemptId])
}

enum AttemptStatus {
  PENDING         // audio uploaded, chưa transcript
  TRANSCRIBED     // Whisper xong
  TRANSCRIPT_FAILED
}

enum PackAttemptStatus {
  IN_PROGRESS     // user đang làm pack
  COMPLETED       // tất cả exercises đã transcript
  SCORING         // đang chờ AI scoring
  SCORED          // AI scoring xong
}

enum ScoringStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum ScoringMode {
  FREE
  GUIDED
}
```

### 7.2. ai-service — Stateless (không cần DB riêng)

ai-service **không lưu state**. Nó nhận input → gọi OpenAI → trả output. Mọi persistence do content-service xử lý.

> Nếu sau này cần audit log riêng (token usage, latency, cost tracking), có thể thêm DB cho ai-service. Hiện tại giữ stateless cho đơn giản.

---

## 8. API GATEWAY — ENDPOINTS MỚI

### 8.1. Shared Constants

```typescript
// libs/common/src/constants/services.ts — BỔ SUNG
export const AI_SERVICE = 'AI_SERVICE';

// libs/common/src/constants/ai.constants.ts — MỚI
export const AI_COMMANDS = {
  TRANSCRIBE_AUDIO: 'transcribe_audio',
  SCORE_PACK_ATTEMPT: 'score_pack_attempt',
} as const;

// libs/common/src/constants/content.constants.ts — BỔ SUNG
export const CONTENT_COMMANDS = {
  // ... existing
  START_PACK_ATTEMPT: 'start_pack_attempt',
  SUBMIT_EXERCISE_AUDIO: 'submit_exercise_audio',
  SCORE_PACK_ATTEMPT: 'score_pack_attempt',
  GET_PACK_SCORING: 'get_pack_scoring',
} as const;

// libs/common/src/constants/product.constants.ts — BỔ SUNG
export const PRODUCT_COMMANDS = {
  // ... existing
  CHECK_CREDIT: 'check_credit',
  DEDUCT_CREDIT: 'deduct_credit',
  REFUND_CREDIT: 'refund_credit',
} as const;
```

### 8.2. Gateway Controller

```typescript
// apps/api-gateway/src/api/practice.controller.ts

@ApiTags('Practice')
@Controller('practice')
export class PracticeController {
  constructor(
    @Inject(CONTENT_SERVICE) private readonly contentClient: ClientProxy,
    // (Bổ sung PRODUCT_SERVICE credit checking tuỳ nhu cầu)
  ) {}

  /**
   * [STEP 0] Bắt đầu làm pack
   */
  @Post('packs/:packId/start')
  startPackAttempt(@Param('packId') packId: string, @CurrentUser() user: JwtPayload) {
    return this.contentClient
      .send({ cmd: CONTENT_COMMANDS.START_PACK_ATTEMPT }, { packId, userId: user.sub })
      .pipe(rpcToHttp());
  }

  /**
   * Tầng 1: Submit audio URL đã qua S3
   */
  @Post('exercise-attempts/:exerciseAttemptId/transcript')
  submitTranscript(
    @Param('exerciseAttemptId') exerciseAttemptId: string,
    @Body() dto: SubmitExerciseAudioDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contentClient
      .send(
        { cmd: CONTENT_COMMANDS.SUBMIT_EXERCISE_AUDIO },
        {
          exerciseAttemptId,
          userId: user.sub,
          audioId: dto.audioId,
          durationMs: dto.durationMs,
        },
      )
      .pipe(rpcToHttp());
  }

  /**
   * Tầng 2: Require AI Scoring
   */
  @Post('pack-attempts/:packAttemptId/score')
  scorePackAttempt(
    @Param('packAttemptId') packAttemptId: string,
    @Body() dto: ScorePackDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // NOTE: Sẽ có thể trừ Credit ở Gateway / Product svc tại đây trước khi routing.
    return this.contentClient
      .send(
        { cmd: CONTENT_COMMANDS.SCORE_PACK_ATTEMPT },
        { packAttemptId, userId: user.sub, mode: dto.mode },
      )
      .pipe(rpcToHttp());
  }
}
```

### 8.3. Xử lý credit ở Gateway — tại sao?

Credit check/deduct tại gateway vì:

- Fail-fast: nếu không đủ credit, trả 402 ngay, không cần gọi downstream
- Gateway đã có pattern này (verify JWT → check permissions → route)
- Tránh race condition: deduct trước khi cho phép request đi tiếp

---

## 9. CONTENT-SERVICE — ORCHESTRATOR

### 9.1. Xử lý Tầng 1 (Transcript)

```typescript
// apps/content-service/src/exercise-attempt/exercise-attempt.controller.ts

@MessagePattern({ cmd: CONTENT_COMMANDS.SUBMIT_EXERCISE_AUDIO })
async submitExerciseAudio(@Payload() payload: SubmitExerciseAudioPayload) {
  return this.exerciseAttemptService.submitAudio(payload);
}
```

```typescript
// apps/content-service/src/exercise-attempt/exercise-attempt.service.ts

@Injectable()
export class ExerciseAttemptService {
  constructor(
    private prisma: PrismaService,
    @Inject(AI_SERVICE) private aiClient: ClientProxy,
  ) {}

  async submitAudio(payload: SubmitExerciseAudioPayload) {
    // [1] Tạo ExerciseAttempt record (status: PENDING)
    const attempt = await this.prisma.exerciseAttempt.create({
      data: {
        exerciseId: payload.exerciseId,
        userId: payload.userId,
        audioUrl: payload.audioUrl,
        durationMs: payload.durationMs,
        attemptSeq: payload.attemptSeq,
        status: 'PENDING',
      },
    });

    // [2] Gọi ai-service transcribe
    try {
      const { transcript } = await firstValueFrom(
        this.aiClient.send({ cmd: AI_COMMANDS.TRANSCRIBE_AUDIO }, { audioUrl: payload.audioUrl }),
      );

      // [3] Update transcript
      await this.prisma.exerciseAttempt.update({
        where: { id: attempt.id },
        data: { transcript, status: 'TRANSCRIBED' },
      });

      return { attemptId: attempt.id, transcript };
    } catch (error) {
      await this.prisma.exerciseAttempt.update({
        where: { id: attempt.id },
        data: { status: 'TRANSCRIPT_FAILED' },
      });
      throw new RpcException({ code: 'STT_FAILED', message: error.message });
    }
  }
}
```

### 9.2. Xử lý Tầng 2 (Scoring) — Bất đồng bộ

Việc chấm điểm toàn bộ Pack thông qua ChatGPT tốn nhiều thời gian (~10 - 45s). Vì vậy, kiến trúc áp dụng mô hình Request-Acknowledge kết hợp Background Processing (thông qua `emit()`).

```typescript
// apps/content-service/src/practice/practice.service.ts

@Injectable()
export class PracticeService {
  constructor(
    private prisma: PrismaService,
    @Inject(AI_SERVICE) private aiClient: ClientProxy,
  ) {}

  async scorePackAttempt(payload: ScorePackPayload) {
    const { packAttemptId, userId, mode } = payload;

    // [1] Tìm PackAttempt, Pack, Exercises và ExerciseAttempts (status: TRANSCRIBED)
    // ...

    // [2] Build payload cho ai-service
    const exercisesForAI = pack.exercises.map((ex) => {
      const attempt = attempts.find((a) => a.exerciseId === ex.id);
      return {
        seq: ex.sequenceOrder,
        prompt: ex.previousPrompt ?? '',
        ...(mode === 'GUIDED' && {
          instruction: ex.myPrompt,
        }),
        transcript: attempt?.transcript ?? '',
      };
    });

    // [3] Update trạng thái sang PROCESSING để UI hiển thị màn hình Loading
    await this.prisma.packAttempt.update({
      where: { id: packAttempt.id },
      data: { scoringStatus: ScoringStatus.PROCESSING, scoringMode: mode },
    });

    // [4] Gọi ai-service qua Event Pattern thay vì Request/Response trực tiếp (tránh HTTP Gateway Timeout)
    this.aiClient
      .emit(AI_COMMANDS.SCORE_PACK_ATTEMPT, {
        packAttemptId: packAttempt.id,
        exercises: exercisesForAI,
        mode,
      })
      .subscribe({
        error: (err) => this.logger.error(`Failed to emit AI scoring event: ${err}`),
      });

    // Gateway nhận "PROCESSING" ngay lập tức, UI sẽ liên tục Polling API "Get Pack Scoring"
    return {
      packAttemptId: packAttempt.id,
      status: 'PROCESSING',
      mode,
      exerciseCount: exercisesForAI.length,
    };
  }
}
```
> **Lưu ý UI:** Sau khi nhận `status: 'PROCESSING'`, Client (FE) sẽ gọi Polling định kỳ khoảng 3-5s một lần xuống API `GET /practice/pack-attempts/{id}/score` cho tới khi nhận được `status: 'COMPLETED'` hoặc bị timeout ở giao diện. Ít tác động tiêu cực hơn so với ngâm kết nối HTTP mở ròng rã suốt 1 phút chờ AI phản hồi.

---

## 10. AI-SERVICE — HANDLERS

### 10.1. Whisper Handler

```typescript
// apps/ai-service/src/whisper/whisper.controller.ts

@Controller()
@UseInterceptors(RmqInterceptor)
export class WhisperController {
  constructor(private whisperService: WhisperService) {}

  @MessagePattern({ cmd: AI_COMMANDS.TRANSCRIBE_AUDIO })
  transcribe(@Payload() payload: { audioUrl: string }) {
    return this.whisperService.transcribe(payload.audioUrl);
  }
}
```

```typescript
// apps/ai-service/src/whisper/whisper.service.ts

@Injectable()
export class WhisperService {
  constructor(private openai: OpenAIService) {}

  async transcribe(audioUrl: string): Promise<{ transcript: string }> {
    // [1] Download audio từ S3 (hoặc dùng signed URL)
    const audioStream = await this.downloadFromS3(audioUrl);

    // [2] Gọi Whisper
    const result = await this.openai.client.audio.translations.create({
      model: 'whisper-1',
      file: audioStream,
      response_format: 'text',
    });

    const transcript = result.trim();

    // [3] Edge case: transcript rỗng
    if (!transcript) {
      throw new RpcException({
        code: 'EMPTY_TRANSCRIPT',
        message: 'Whisper returned empty transcript',
      });
    }

    return { transcript };
  }
}
```

### 10.2. Scoring Handler

```typescript
// apps/ai-service/src/scoring/scoring.controller.ts

@Controller()
@UseInterceptors(RmqInterceptor)
export class ScoringController {
  constructor(private scoringService: ScoringService) {}

  @MessagePattern({ cmd: AI_COMMANDS.SCORE_PACK_FREE })
  scoreFree(@Payload() payload: ScorePackAIPayload) {
    return this.scoringService.scorePack({ ...payload, mode: 'FREE' });
  }

  @MessagePattern({ cmd: AI_COMMANDS.SCORE_PACK_GUIDED })
  scoreGuided(@Payload() payload: ScorePackAIPayload) {
    return this.scoringService.scorePack({ ...payload, mode: 'GUIDED' });
  }
}
```

---

## 11. ERROR HANDLING & RETRY

### 11.1. Retry Strategy

```typescript
// apps/ai-service/src/common/openai.service.ts

@Injectable()
export class OpenAIService {
  private client: OpenAI;

  async chatCompletion(params: ChatCompletionParams, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.client.chat.completions.create(params);
      } catch (error) {
        if (attempt === retries) throw error;

        // Retry on rate limit or server error
        if (error.status === 429 || error.status >= 500) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw error; // Non-retryable error
      }
    }
  }
}
```

### 11.2. RabbitMQ Timeout

```typescript
// Scoring call có thể mất 3–8s → tăng timeout RMQ
this.aiClient.send({ cmd: scoringCommand }, payload).pipe(
  timeout(15000), // 15s timeout
  catchError((err) => {
    if (err instanceof TimeoutError) {
      throw new RpcException({ code: 'SCORING_TIMEOUT' });
    }
    throw err;
  }),
);
```

### 11.3. Error Matrix

| Lỗi                  | Service phát hiện            | Xử lý                                                          | Credit                                  |
| :------------------- | :--------------------------- | :------------------------------------------------------------- | :-------------------------------------- |
| Audio quá ngắn (<1s) | Gateway (validate)           | Reject 400, không gọi downstream                               | Không trừ                               |
| Whisper fail         | ai-service → content-service | Retry 1 lần. Vẫn fail →`TRANSCRIPT_FAILED`                     | Không hoàn (transcript free nếu bài 2+) |
| Whisper trả rỗng     | ai-service                   | Throw `EMPTY_TRANSCRIPT` → FE hiện "Không nhận được giọng nói" | Không hoàn                              |
| Scoring fail         | ai-service → content-service | Retry 1 lần. Vẫn fail → refund 5 credit                        | Hoàn 5 credit                           |
| Scoring timeout      | content-service              | 15s timeout → refund                                           | Hoàn 5 credit                           |
| RMQ connection lost  | Any service                  | Auto-reconnect (NestJS built-in)                               | N/A                                     |

---

## 12. TỔNG KẾT FLOW ĐẦY ĐỦ

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  TẦNG 1 — Per Exercise (bài 1 → 5)                                            │
│                                                                                 │
│  FE ──audio──► Gateway ──S3 upload──► media-svc                                │
│                   │                       │ audioUrl                            │
│                   │──── RMQ ─────────► content-svc ──── RMQ ────► ai-svc       │
│                   │                       │                        │ Whisper    │
│                   │                       │  ◄── transcript ──────┤            │
│                   │                       │  save ExerciseAttempt  │            │
│                   │  ◄── { attemptId,     │                        │            │
│                   │       transcript } ───┤                        │            │
│  ◄── JSON ────────┤                       │                        │            │
│                                                                                 │
│  Credit: trừ 1 lần ở bài đầu (Gateway → product-svc)                          │
│  Thời gian: ~1–3s (upload S3 + Whisper)                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  TẦNG 2 — Pack Scoring (tùy chọn, sau khi hoàn thành pack)                    │
│                                                                                 │
│  FE ── POST /packs/{id}/score ──► Gateway                                      │
│                                      │ deduct 5 credit                         │
│                                      │──── RMQ ──► content-svc                 │
│                                      │                │ load exercises          │
│                                      │                │ load transcripts        │
│                                      │                │── RMQ ──► ai-svc       │
│                                      │                │            │ ChatGPT   │
│                                      │                │  ◄─ scores ┤ ~3–6s     │
│                                      │                │ save PackScoring        │
│                                      │  ◄─────────────┤                        │
│  ◄── { overallScore, exercises[] } ──┤                                         │
│                                                                                 │
│  Credit: 5 credit / pack (refund nếu fail)                                     │
│  Thời gian: ~3–8s (ChatGPT structured output)                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. CHECKLIST TRIỂN KHAI

| #   | Task                                                                                 | Service                  | Priority |
| :-- | :----------------------------------------------------------------------------------- | :----------------------- | :------- |
| 1   | Tạo `ai-service` app mới + RMQ setup                                                 | ai-service               | P0       |
| 2   | OpenAI module (client singleton, retry, timeout)                                     | ai-service               | P0       |
| 3   | Whisper handler + service                                                            | ai-service               | P0       |
| 4   | Scoring handler + prompt builders (copy từ doc 09, 10)                               | ai-service               | P0       |
| 5   | Bổ sung `ExerciseAttempt`, `PackAttempt`, `ExerciseScore` vào content-service schema | content-service          | P0       |
| 6   | Exercise attempt module (submit audio → transcribe)                                  | content-service          | P0       |
| 7   | Pack scoring module (orchestrate scoring flow)                                       | content-service          | P0       |
| 8   | Thêm `EXERCISE_AUDIO` vào media-service ReferType                                    | media-service            | P0       |
| 9   | Credit module (balance, deduct, refund)                                              | product-service          | P0       |
| 10  | Gateway endpoints mới + S3 upload tại gateway                                        | api-gateway              | P0       |
| 11  | Register `AI_SERVICE` RMQ client trong gateway + content-service                     | api-gateway, content-svc | P0       |
| 12  | Error handling, retry, timeout config                                                | All                      | P1       |
| 13  | Integration test: full flow Tầng 1                                                   | E2E                      | P1       |
| 14  | Integration test: full flow Tầng 2                                                   | E2E                      | P1       |
