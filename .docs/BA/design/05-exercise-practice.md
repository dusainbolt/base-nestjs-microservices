# 🎙️ 05 — Exercise Practice (Màn Hình Luyện Tập)

---

## 1. Mục Tiêu Trang

Đây là trang **core** của ứng dụng — nơi user thực sự luyện nói. Hiển thị 5 câu lần lượt, user ghi âm từng câu, xem lại, và submit toàn bộ để nhận feedback từ AI. Trải nghiệm cần mượt mà, không gây áp lực, nhưng khuyến khích tập trung.

### Yêu cầu đầu ra theo Level:

| Level                | Yêu cầu output                                        |
| -------------------- | ----------------------------------------------------- |
| Lv1 Beginner         | 1 câu đơn (S + be/can/V)                              |
| Lv2 Elementary       | 2–3 câu (tính từ + trạng từ, nối bằng and/but)        |
| Lv3 Pre-Intermediate | 3–4 câu (Past Simple, liên từ: and/but/so/because)    |
| Lv4 Intermediate     | 4–5 câu (câu phức: If/When/Which, so sánh, quan điểm) |

---

## 2. Layout Tổng Quan

Thiết kế full-screen immersive, giảm tối đa distraction.

### 2.1 Màn Hình Chính (Ghi Âm Từng Câu)

```
┌──────────────────────────────────────────────────────────┐
│  [✕ Thoát]     Câu 3/5      [⏸ Tạm dừng]              │
│  ████████████░░░░░░░░ 60%                                │
│  🏷️ 🌍 Everyday • Lv2 Elementary                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │                                                  │    │
│  │           [  🖼️ Hình ảnh minh hoạ  ]            │    │
│  │           (nếu exercise có ảnh)                  │    │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  📝 Hãy nói bằng tiếng Anh (2-3 câu):                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │  "Bạn thường làm gì mỗi buổi sáng trước khi    │    │
│  │   đi làm?"                                      │    │
│  │                                                  │    │
│  │  🔊 Nghe mẫu (nếu có)                          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  💡 Level 2: Nói 2-3 câu, dùng tính từ và "and/but"    │
│                                                          │
│            ┌───────────────────────┐                     │
│            │                       │                     │
│            │    🎙️ GHI ÂM         │                     │
│            │   (Nhấn để bắt đầu)  │                     │
│            │                       │                     │
│            └───────────────────────┘                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Trạng Thái Đang Ghi Âm

```
┌──────────────────────────────────────────────────────────┐
│  [✕ Thoát]     Câu 3/5      [⏸ Tạm dừng]              │
│  ████████████░░░░░░░░ 60%                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📝 "Bạn thường làm gì mỗi buổi sáng trước khi         │
│      đi làm?"                                            │
│                                                          │
│            ╔═══════════════════════╗                     │
│            ║                       ║                     │
│            ║   🔴 ĐANG GHI ÂM     ║                     │
│            ║   ▁▂▃▅▇▅▃▂▁▂▃▅▇▅   ║                     │
│            ║   00:03               ║                     │
│            ║                       ║                     │
│            ╚═══════════════════════╝                     │
│                                                          │
│            [⏹ Dừng ghi]                                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.3 Sau Khi Ghi Âm Xong (Review)

```
┌──────────────────────────────────────────────────────────┐
│  [✕ Thoát]     Câu 3/5      [⏸ Tạm dừng]              │
│  ████████████░░░░░░░░ 60%                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📝 "Bạn thường làm gì mỗi buổi sáng trước khi         │
│      đi làm?"                                            │
│                                                          │
│  ✅ Đã ghi âm — 4 giây                                  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  [▶ Nghe lại]  ▁▂▃▅▇▅▃▂▁  [00:04]              │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [🔄 Ghi lại]              [▶ Câu tiếp theo →]         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.4 Câu Cuối Cùng (Câu 5/5 — Submit)

```
┌──────────────────────────────────────────────────────────┐
│  [✕ Thoát]     Câu 5/5                                  │
│  ████████████████████ 100%                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ✅ Tất cả 5 câu đã ghi âm!                             │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  1. ✅ "Describe your morning"    — 5s  [▶]     │    │
│  │  2. ✅ "What you eat"             — 4s  [▶]     │    │
│  │  3. ✅ "Your commute"             — 4s  [▶]     │    │
│  │  4. ✅ "Arrive at work"           — 6s  [▶]     │    │
│  │  5. ✅ "Evening routine"          — 3s  [▶]     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  Tap vào câu nào để ghi lại nếu chưa hài lòng.         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │          [  📤 GỬI BÀI ĐỂ CHẤM ĐIỂM  ]         │    │
│  │          (AI sẽ đánh giá trong ~3 giây)          │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.5 Trạng Thái Đang Chấm (Loading)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                                                          │
│              🤖 AI đang đánh giá...                      │
│                                                          │
│              ┌────────────────────┐                      │
│              │  ░░░░░░░░░░░░░░░  │                      │
│              │  Analyzing audio   │                      │
│              └────────────────────┘                      │
│                                                          │
│              Đợi khoảng 2-4 giây                         │
│                                                          │
│              💡 Bạn biết không?                           │
│              Luyện tập 15 phút mỗi ngày                 │
│              giúp cải thiện 40% kỹ năng nói!            │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. UI Components

### 3.1 Progress Bar (Top)

- Thin bar (4px) full-width, top of screen
- Color: primary blue
- Fill: (current sentence / 5) × 100%
- "Câu N/5" text centered dưới bar
- **Category & Level tag**: badge nhỏ dưới progress bar (ví dụ: "🌍 Everyday • Lv2")

### 3.2 Exercise Prompt Card

- Background: white card, border-radius 12px, shadow-sm
- Nội dung:
  - Image (nếu exercise có ảnh): aspect-ratio 16:9, border-radius 8px, object-fit cover
  - Vietnamese prompt: font-size 18px, bold, color dark
  - "Nghe mẫu" button: chỉ hiển thị nếu có audio sample (Phase 2)

### 3.3 Level Hint

- Text nhỏ dưới prompt, color gray-500, italic
- Nội dung gợi ý dựa trên level:
  - Lv1: "💡 Nói 1 câu đơn, rõ ràng"
  - Lv2: "💡 Level 2: Nói 2-3 câu, dùng tính từ và 'and/but'"
  - Lv3: "💡 Level 3: Nói 3-4 câu dùng quá khứ, nối bằng so/because"
  - Lv4: "💡 Level 4: Nói 4-5 câu có quan điểm, dùng câu phức If/When"

### 3.4 Record Button

- Kích thước lớn: 80px × 80px circle
- Trạng thái idle: background gray-100, icon 🎙️ gray-600
- Trạng thái recording: background red-500, icon pulse, waveform animation
- Trạng thái done: background green-100, icon ✅

### 3.5 Audio Waveform Visualizer

- Khi đang ghi: real-time waveform bars (10-15 bars)
- Khi review: static waveform + play button + timeline
- Minimal design, height 40px

### 3.6 Timer

- Hiển thị khi đang ghi âm: "00:04"
- Auto-stop nếu > 30 giây (với warning ở 25s)

### 3.7 Navigation Buttons

- "Ghi lại" (🔄): secondary style, bên trái
- "Câu tiếp theo →" (▶): primary style, bên phải
- Câu cuối: đổi thành "Xem lại & Gửi bài"

### 3.8 Submit Review Panel

- Hiển thị sau câu 5: danh sách 5 câu đã ghi
- Mỗi câu: tên + duration + nút play nhỏ + nút ghi lại
- CTA lớn: "📤 GỬI BÀI ĐỂ CHẤM ĐIỂM"

### 3.9 Loading Screen

- Full-screen overlay, background white
- Animation: AI bot thinking (lottie hoặc CSS animation)
- Fun fact / tip hiển thị ngẫu nhiên
- Progress indicator (fake percentage để giảm perceived latency)

---

## 4. Trạng Thái Theo Gói (Pricing Logic)

| Element           | 🆓 Free                | ⭐ Pro                 | 👑 Premium               |
| ----------------- | ---------------------- | ---------------------- | ------------------------ |
| Ghi âm            | Bình thường            | Bình thường            | Bình thường              |
| Daily limit check | Check trước khi vào    | Check trước khi vào    | Không check              |
| Submit            | Bình thường            | Bình thường            | Bình thường              |
| AI feedback level | overallScore only      | 3 tiêu chí chi tiết    | 5 tiêu chí Business      |
| Loading message   | "AI đang chấm điểm..." | "AI đang phân tích..." | "Coach đang đánh giá..." |
| Level hint        | Hiển thị               | Hiển thị               | Hiển thị                 |

**Khi hết daily quota:**

- Chặn trước khi vào trang Practice (ở trang Pack List)
- Nếu user bookmark URL trực tiếp → redirect về Dashboard + toast "Bạn đã hết lượt hôm nay"

---

## 5. UX Interactions

### 5.1 Flow Ghi Âm

1. User tap nút Record → request microphone permission (lần đầu)
2. Permission granted → bắt đầu ghi + waveform animation + timer
3. User tap Stop (hoặc auto-stop sau 30s) → hiển thị review: play/re-record
4. User tap "Câu tiếp theo" → slide-left transition → câu kế tiếp
5. Sau câu 5 → Submit Review Panel

### 5.2 Microphone Permission

- Lần đầu: browser native permission dialog
- Nếu denied: hiển thị hướng dẫn bật microphone (screenshots cho iOS/Android/Chrome)
- Nếu không hỗ trợ: error message "Trình duyệt chưa hỗ trợ ghi âm"

### 5.3 Re-record

- Ở bất kỳ câu nào: tap "Ghi lại" → overwrite audio cũ
- Ở Submit Review: tap câu → quay lại màn hình ghi âm câu đó
- Không giới hạn số lần ghi lại

### 5.4 Audio Concatenation (Client-side)

- Sau khi ghi xong 5 câu → client nối 5 audio blobs thành 1 file
- Format: WebM (default) hoặc MP3 (fallback)
- Thêm 0.5s silence giữa các câu khi nối
- Gửi 1 request duy nhất lên server

### 5.5 Submit & Wait

1. Tap "Gửi bài" → loading screen
2. Upload audio → Whisper STT → GPT evaluate (~2-4 giây)
3. Thành công → navigate → Feedback Results (06)
4. Lỗi (network/server) → retry button + "Thử lại"

### 5.6 Exit Warning

- Tap "✕ Thoát" giữa chừng → confirm dialog:
  - "Bạn đang ghi âm dở. Thoát sẽ mất tiến trình câu hiện tại."
  - [Tiếp tục] [Thoát]
- Audio đã ghi xong của các câu trước → lưu local (resumable)

### 5.7 Pause

- Tap ⏸ → pause timer, dim screen
- Hiển thị: "Đang tạm dừng. Tap để tiếp tục."
- Không mất audio đã ghi

---

## 6. Responsive Design

### Mobile (< 640px)

- Full-screen immersive, ẩn bottom tab bar
- Record button: bottom-center, cách bottom 60px
- Prompt card: top half, image chiếm 40% viewport
- Navigation buttons: fixed bottom

### Tablet (640px - 1024px)

- Giữ layout mobile nhưng prompt card rộng hơn (max-width 600px)
- Record button lớn hơn: 96px

### Desktop (> 1024px)

- 2 columns: trái = prompt + image (50%), phải = recording controls (50%)
- Record button centered trong panel phải
- Waveform visualizer rộng hơn
- Submit Review: 2-column grid cho danh sách câu

---

## 7. Ghi Chú Kỹ Thuật

- Audio recording: `MediaRecorder` API, format `audio/webm;codecs=opus`
- Fallback: `audio/mp4` cho Safari
- Audio concat: Web Audio API `AudioContext.decodeAudioData()` + `OfflineAudioContext`
- Max file size: 5MB sau concat (ước tính 5 câu × 10s × 50KB/s ≈ 2.5MB)
- Upload: `POST /exercises/{exerciseId}/submit` với `multipart/form-data`
- API response: JSON feedback object (xem PRD section 6)
- Local storage: lưu draft audio blobs cho resumable sessions
- Permissions: check `navigator.mediaDevices.getUserMedia` support
- **Level-aware prompt**: Server/client cung cấp level hint text dựa trên `exercise.level`
