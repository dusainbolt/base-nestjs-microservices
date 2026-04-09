# FE → BE Technical Flow — Audio Pipeline

> **Core flow (user-defined):**
> Record → Nghe lại → OK → Submit → Whisper trả transcript → Hiện text → Next
> Bài cuối cùng: submit xong → loading → nhận full feedback chấm điểm toàn pack.
>
> **Backend:** OpenAI Whisper Translate (STT) + 1 scoring model (TBD).

---

## 1. TỔNG QUAN LUỒNG — 2 TẦNG TÁCH BIỆT

```
┌──────────────────────────────────────────────────────────────────┐
│  TẦNG 1 — Per Exercise (bài 1 → N-1)                            │
│                                                                  │
│  Record → Playback → Submit → Whisper STT → Transcript          │
│                                                                  │
│  → Chỉ gọi Whisper, KHÔNG gọi scoring model                     │
│  → FE tích lũy transcript tại local session                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  TẦNG 2 — Pack Complete (sau bài cuối)                          │
│                                                                  │
│  Submit cuối → Whisper → Transcript → gộp tất cả → Score model │
│                                                                  │
│  → Gửi 1 lần duy nhất toàn bộ {prompt, transcript} của pack    │
│  → Nhận full feedback + điểm                                    │
└──────────────────────────────────────────────────────────────────┘
```

**Lý do tách 2 tầng:**

- Whisper per exercise → user thấy transcript ngay, UX tự nhiên
- Scoring 1 lần cuối → AI có đủ context toàn pack → chấm chính xác hơn + giảm API cost từ N calls xuống còn 1

---

## 2. LUỒNG CHI TIẾT — PER EXERCISE (Bài 1 → N-1)

```
FE                                    BE
 │                                     │
 │  [1] User nhấn Record               │
 │  MediaRecorder + silence detection  │
 │                                     │
 │  [2] User nhấn Stop                 │
 │  → Blob trong memory                │
 │  → Hiện nút [▶ Nghe lại] + [✓ OK]  │
 │                                     │
 │  [3] User nhấn ▶ Nghe lại           │
 │  → HTMLAudioElement play Blob URL   │
 │  (local, không gọi server)          │
 │                                     │
 │  [4] User nhấn ✓ OK / Submit        │
 │  POST /exercises/{id}/transcript    │
 │  body: FormData { audio: Blob }     │
 ├────────────────────────────────────►│
 │                                     │ Whisper Translate
 │                                     │ → transcript: string
 │                                     │ Save ExerciseAttempt {
 │                                     │   audioPath, transcript,
 │                                     │   status: TRANSCRIBED }
 │◄────────────────────────────────────┤
 │  { transcript: "I work as a..." }   │
 │                                     │
 │  [5] Hiện transcript lên màn hình   │
 │  (user đọc lại những gì mình nói)   │
 │                                     │
 │  [6] User nhấn Next → bài kế        │
 │  FE lưu vào session:                │
 │  attempts.push({ exerciseId,        │
 │    transcript, seq })               │
```

**Response time mục tiêu:** Whisper ~1–2s → hiện transcript nhanh, không cần loading dài.

---

## 3. LUỒNG CHI TIẾT — BÀI CUỐI (Exercise N)

```
FE                                    BE                      AI
 │                                     │                       │
 │  [1–4] Giống các bài trên           │                       │
 │  POST /exercises/{id}/transcript    │                       │
 ├────────────────────────────────────►│                       │
 │◄────────────────────────────────────┤                       │
 │  { transcript: "..." }              │                       │
 │                                     │                       │
 │  [5] Hiện transcript                │                       │
 │                                     │                       │
 │  [6] User nhấn Next (bài cuối)      │                       │
 │  → KHÔNG chuyển bài, thay vào đó:  │                       │
 │                                     │                       │
 │  POST /packs/{packId}/score         │                       │
 │  body: {                            │                       │
 │    attempts: [                      │                       │
 │      { exerciseId, seq,             │                       │
 │        transcript },                │                       │
 │      ... x N bài                   │                       │
 │    ]                                │                       │
 │  }                                  │                       │
 ├────────────────────────────────────►│                       │
 │                                     │ Load exercise data    │
 │                                     │ (prompt, hint, sample)│
 │  [Loading screen]                   │                       │
 │  "Đang chấm điểm..."               │                       │
 │                                     │ Scoring Model:        │
 │                                     ├──────────────────────►│
 │                                     │ Input:                │
 │                                     │  level, N × {         │
 │                                     │    prompt (p),        │
 │                                     │    instruction (m),   │
 │                                     │    hint (h),          │
 │                                     │    sample (s),        │
 │                                     │    transcript (user)  │
 │                                     │  }                    │
 │                                     │◄──────────────────────┤
 │                                     │ Output: {             │
 │                                     │   overallScore,       │
 │                                     │   exercises: [{       │
 │                                     │     seq, score,       │
 │                                     │     feedback }]       │
 │                                     │ }                     │
 │                                     │                       │
 │◄────────────────────────────────────┤                       │
 │  { overallScore, exercises: [...] } │                       │
 │                                     │                       │
 │  [Pack Complete Screen]             │                       │
```

---

## 4. API ENDPOINTS

### 4.1 STT per exercise

```
POST /api/v1/exercises/{exerciseId}/transcript
Authorization: Bearer {jwt}
Content-Type: multipart/form-data

Body:
  audio       : Blob (webm/opus hoặc mp4)
  durationMs  : number
  attemptSeq  : number   (1 = lần đầu, 2+ = re-record)

Response 200:
  {
    attemptId  : string,
    transcript : string    // text từ Whisper
  }

Response 4xx/5xx:
  { code: "STT_FAILED" | "AUDIO_TOO_SHORT" | ... }
```

**Lưu ý:** Endpoint này chỉ gọi Whisper, không gọi scoring model. Response nhanh ~1–2s.

---

### 4.2 Pack scoring (cuối pack)

```
POST /api/v1/packs/{packId}/score
Authorization: Bearer {jwt}
Content-Type: application/json

Body:
  {
    attempts: [
      {
        exerciseId : string,
        seq        : number,
        attemptId  : string,   // từ response của bước transcript
        transcript : string    // FE gửi lại để BE verify / đỡ phải query lại
      },
      ...
    ]
  }

Response 200:
  {
    packAttemptId : string,
    overallScore  : number,     // 0–100
    passed        : boolean,
    exercises: [
      {
        seq         : number,
        score       : number,
        transcript  : string,
        feedback: {
          grammar     : { ok: boolean, note?: string },
          vocabulary  : { ok: boolean, note?: string },
          fluency     : { ok: boolean, note?: string },
          suggestion? : string
        },
        sampleAnswer : string   // trả về ở đây, không phải lúc đầu
      }
    ]
  }
```

---

## 5. STATE FE CẦN GIỮ TRONG SESSION PACK

FE cần tích lũy dữ liệu suốt quá trình làm pack — không được mất khi re-render:

```typescript
interface PackSession {
  packId: string;
  levelId: number;
  currentSeq: number; // bài đang làm (1-indexed)
  totalExercises: number;

  // Tích lũy sau mỗi bài submit thành công
  attempts: Array<{
    exerciseId: string;
    seq: number;
    attemptId: string; // từ BE
    transcript: string; // từ Whisper
    audioBlob: Blob; // giữ để playback, xóa sau khi next
  }>;
}
```

**Lưu ý quan trọng:**

- `audioBlob` chỉ cần giữ cho bài hiện tại (playback). Sau khi Next → có thể `URL.revokeObjectURL` và xóa blob khỏi session để tiết kiệm memory.
- Nếu user thoát giữa chừng → session mất, không cần persist (pack sẽ bắt đầu lại).

---

## 6. STATES MÀN HÌNH PER EXERCISE

```
                     ┌──────────────┐
                     │    IDLE      │  Hiện prompt + nút Record
                     └──────┬───────┘
                            │ tap Record
                     ┌──────▼───────┐
                     │  RECORDING   │  Waveform + timer + nút Stop
                     └──────┬───────┘
                            │ tap Stop / auto-stop
                     ┌──────▼───────┐
              ┌──────│   PREVIEW    │  Nút ▶ Nghe lại + ✓ OK + 🔄 Ghi lại
              │      └──────┬───────┘
              │             │ tap Ghi lại
              │      ┌──────▼───────┐
              │      │  RECORDING   │  (vòng lại)
              │      └──────────────┘
              │
              │ tap ✓ OK
       ┌──────▼──────────┐
       │   UPLOADING     │  Progress bar upload + "Đang xử lý..."
       └──────┬──────────┘
              │ Whisper xong
       ┌──────▼──────────┐
       │   TRANSCRIPT    │  Hiện text transcript + nút Next
       └──────┬──────────┘
              │ tap Next
              │
         seq < total?
         YES ──► IDLE (bài mới)
         NO  ──► SCORING (loading toàn pack)
                     │
              ┌──────▼──────────┐
              │  PACK COMPLETE  │  Score + feedback từng bài
              └─────────────────┘
```

---

## 7. SCORING SCREEN — LOADING + RESULT

### 7.1 Loading (sau bài cuối)

```
POST /packs/{id}/score đang chạy (~3–6s):

  Scoring model đọc toàn bộ N bài cùng lúc
  → không cần fake suspense, thời gian thực là đủ

  Hiện:
  "Đang chấm điểm toàn bộ bài tập..."
  [Spinner đơn giản]
```

### 7.2 Pack Complete Screen

```
┌────────────────────────────────────────┐
│  🎉  Hoàn thành pack!                  │
│                                        │
│       Điểm tổng: 78 / 100             │
│         ⭐⭐⭐⭐☆                      │
│                                        │
│  ──────────────────────────────────   │
│  Bài 1 · 85đ  ✅                      │
│  "I usually check email first..."     │
│  ✅ Ngữ pháp  ✅ Từ vựng  ⚠️ Trôi chảy│
│                                        │
│  Bài 2 · 62đ  ⚠️                      │
│  "I go to meeting every morning..."   │
│  ⚠️ Ngữ pháp  ✅ Từ vựng  ✅ Trôi chảy│
│  💡 Gợi ý: "I attend meetings..."    │
│                                        │
│  ... (accordion từng bài)             │
│                                        │
│  [▶ Bắt đầu pack tiếp theo]           │
│  [← Về danh sách]                     │
└────────────────────────────────────────┘
```

---

## 8. ERROR HANDLING

| Tình huống                    | Xử lý                                                                         |
| :---------------------------- | :---------------------------------------------------------------------------- |
| Whisper fail (bài lẻ)         | Retry tự động 1 lần. Vẫn fail → cho phép "Bỏ qua bài này" (transcript = null) |
| Scoring model fail            | Retry 1 lần. Vẫn fail → "Chưa chấm được, thử lại sau" + không mất credit      |
| User thoát giữa pack          | Session mất, pack reset về đầu. Credit chưa trừ hoặc refund                   |
| Network drop khi upload audio | Toast lỗi + cho phép ghi lại. Audio blob vẫn còn trong memory                 |
| Whisper trả transcript trống  | Hiện "Không nhận được giọng nói rõ" → user ghi lại, không tiếp tục            |

---

## 9. CREDIT FLOW (chốt logic, số TBD)

```
Credit chỉ trừ 1 lần duy nhất khi:
  → User nhấn ✓ OK ở bài đầu tiên của pack (attemptSeq === 1, seq === 1)

Các bài sau (seq 2, 3, 4, 5): không trừ thêm
Re-record (ghi lại cùng bài): không trừ thêm

Hoàn trả credit khi:
  → POST /packs/{id}/score trả lỗi và không có kết quả nào
  → Whisper fail toàn bộ (không có transcript nào)
```

---

## 10. SEQUENCE DIAGRAM ĐẦY ĐỦ

```
FE              API GW        Content Svc      Whisper      Scoring Model
 │                │                │              │               │
 │── bài 1 ───────────────────────────────────────────────────── │
 │                │                │              │               │
 │ POST transcript│                │              │               │
 ├───────────────►│ verify JWT     │              │               │
 │                │ deduct credit  │              │               │
 │                ├───────────────►│              │               │
 │                │                │ upload audio │               │
 │                │                │ save attempt │               │
 │                │                ├─────────────►│               │
 │                │                │◄─────────────┤               │
 │                │                │  transcript  │               │
 │◄───────────────┤◄───────────────┤              │               │
 │ { transcript } │                │              │               │
 │                │                │              │               │
 │── bài 2, 3, 4 ─ (tương tự, không trừ credit) ─────────────── │
 │                │                │              │               │
 │── bài cuối ────────────────────────────────────────────────── │
 │                │                │              │               │
 │ POST transcript│                │              │               │
 ├───────────────►│                │              │               │
 │◄───────────────┤◄───────────────┤◄─────────────┤               │
 │ { transcript } │                │              │               │
 │                │                │              │               │
 │ POST score     │                │              │               │
 │ { attempts[] } │                │              │               │
 ├───────────────►│                │              │               │
 │                ├───────────────►│              │               │
 │                │                │ load exercise│               │
 │                │                │ data (p,m,h,s)              │
 │                │                ├──────────────────────────── ►│
 │  [loading]     │                │              │               │ ~3–6s
 │                │                │◄─────────────────────────────┤
 │                │                │  scores[]    │               │
 │◄───────────────┤◄───────────────┤              │               │
 │ { overallScore │                │              │               │
 │   exercises[] }│                │              │               │
 │                │                │              │               │
 │ [Pack Complete]│                │              │               │
```

---

## 11. ĐIỂM TỐI ƯU CHÍNH

| Điểm             | Cách tối ưu                                                                |
| :--------------- | :------------------------------------------------------------------------- |
| Whisper latency  | Audio nhỏ (WebM/Opus ~20KB/5s) → Whisper xử lý nhanh ~1s                   |
| Scoring context  | Gửi 1 lần toàn pack → model có đủ context → chính xác hơn per-exercise     |
| Cost             | 1 scoring call/pack thay vì N calls → giảm chi phí N lần                   |
| UX trong lúc chờ | Mỗi bài chỉ chờ Whisper ~1–2s (nhanh) — chờ scoring chỉ 1 lần cuối (~4–6s) |
| Memory           | Revoke audio Blob URL sau khi Next → không giữ N blobs trong RAM           |
| Prefetch         | Fetch toàn bộ exercise data của pack khi mở pack — không fetch từng bài    |
