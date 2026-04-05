# 📊 06 — AI Feedback Results (Kết Quả Đánh Giá)

---

## 1. Mục Tiêu Trang

Hiển thị kết quả đánh giá từ AI sau khi user hoàn thành bài luyện tập. Đây là trang **tạo giá trị chính** — nơi user thấy rõ điểm mạnh, điểm yếu, và gợi ý cải thiện. Layout và nội dung khác nhau tuỳ theo gói (Free/Pro/Premium), tạo động lực upsell tự nhiên.

---

## 2. Layout Tổng Quan

### 2.1 Gói FREE — Chỉ điểm tổng

```
┌──────────────────────────────────────────────────────────┐
│  [← Back]        Kết Quả                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              🎉 KẾT QUẢ BÀI LUYỆN TẬP                  │
│                                                          │
│              ┌─────────────────────┐                     │
│              │                     │                     │
│              │       85            │                     │
│              │      /100           │                     │
│              │    ✅ GOOD          │                     │
│              │                     │                     │
│              └─────────────────────┘                     │
│              (vòng tròn progress animated)               │
│                                                          │
│  +85 XP  •  🔥 Streak: 13 ngày                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  📝 Bạn đã nói:                                 │    │
│  │  "I sorry for late. I have traffic jam..."       │    │
│  │                         [🔊 Nghe lại]           │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  🔒 Muốn xem chi tiết điểm từng tiêu chí?      │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐               │    │
│  │  │Grammar │ │ Vocab  │ │Content │               │    │
│  │  │  🔒    │ │  🔒    │ │  🔒    │               │    │
│  │  └────────┘ └────────┘ └────────┘               │    │
│  │                                                  │    │
│  │  [⭐ Nâng cấp PRO — Xem phản hồi chi tiết]     │    │
│  │  Chỉ 79K/tháng • Dùng thử 7 ngày miễn phí     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [🔄 Thử lại]        [▶ Bài tiếp theo]                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Gói PRO — 3 Tiêu Chí Chi Tiết

```
┌──────────────────────────────────────────────────────────┐
│  [← Back]        Kết Quả                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              🎉 KẾT QUẢ BÀI LUYỆN TẬP                  │
│                                                          │
│              ┌─────────────────────┐                     │
│              │       82            │                     │
│              │      /100           │                     │
│              │    ✅ GOOD          │                     │
│              └─────────────────────┘                     │
│                                                          │
│  +82 XP  •  🔥 Streak: 13 ngày  •  First-time +20 XP   │
│                                                          │
│  ── ĐÁNH GIÁ CHI TIẾT ──────────────────────────        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  📝 Grammar                              85/100  │    │
│  │  ████████░░                                      │    │
│  │  "Ngữ pháp tốt, sai 1 lỗi nhỏ ở thì quá khứ." │    │
│  │                                                  │    │
│  │  ❌ "I sorry for late"                           │    │
│  │  ✅ "I'm sorry for being late"                   │    │
│  │  📖 Cần dùng "be sorry for + V-ing"             │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  📚 Vocabulary                           80/100  │    │
│  │  ████████░░                                      │    │
│  │  "Dùng từ đúng ngữ cảnh. Gợi ý thêm:"          │    │
│  │                                                  │    │
│  │  💡 "traffic jam" → Có thể dùng                  │    │
│  │     "heavy traffic" để tự nhiên hơn.             │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  🎯 Content Accuracy                    90/100   │    │
│  │  █████████░                                      │    │
│  │  "Truyền tải đúng ý nghĩa yêu cầu."            │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ── GỢI Ý CẢI THIỆN ────────────────────────────        │
│                                                          │
│  💬 Cách nói hay hơn:                                   │
│  • "I apologize for the delay. I got stuck in traffic." │
│  • "Sorry I'm late — there was heavy traffic."         │
│                                                          │
│  📌 Bước tiếp theo:                                     │
│  • Luyện thêm cấu trúc "sorry for + V-ing"            │
│  • Thử thêm bài tập về tình huống xin lỗi             │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  👔 Muốn AI Coach giao tiếp công sở?             │    │
│  │  🔒 Tone & Politeness  🔒 Business Vocab         │    │
│  │  🔒 Coherence                                    │    │
│  │                                                  │    │
│  │  [👑 Nâng cấp PREMIUM — Coaching Business]       │    │
│  │  149K/tháng • Dùng thử 7 ngày miễn phí         │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  📝 Bạn đã nói:                                 │    │
│  │  "I sorry for late. I have traffic jam..."       │    │
│  │                         [🔊 Nghe lại]           │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  [🔄 Thử lại]        [▶ Bài tiếp theo]                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.3 Gói PREMIUM — 5 Tiêu Chí Business

```
┌──────────────────────────────────────────────────────────┐
│  [← Back]        Kết Quả                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              🎉 KẾT QUẢ BÀI LUYỆN TẬP                  │
│                                                          │
│              ┌─────────────────────┐                     │
│              │       72            │                     │
│              │      /100           │                     │
│              │    👍 PASS          │                     │
│              └─────────────────────┘                     │
│                                                          │
│  +72 XP  •  🔥 Streak: 13 ngày                          │
│                                                          │
│  ── ĐÁNH GIÁ CHUYÊN SÂU (5 tiêu chí) ──────────        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  📝 Grammar                              90/100  │    │
│  │  █████████░                                      │    │
│  │  "Ngữ pháp cơ bản đúng."                        │    │
│  │  ❌ "I want you to sign" → ✅ "Could you please  │    │
│  │     sign..."                                     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  👔 Business Vocabulary                  60/100  │    │
│  │  ██████░░░░                                      │    │
│  │  "Từ vựng chưa chuyên nghiệp đủ cho văn phòng." │    │
│  │                                                  │    │
│  │  💡 "paper" → "document" (chuyên nghiệp hơn)    │    │
│  │  💡 "give back" → "return" (formal hơn)          │    │
│  │  💡 "help" → "assist" (phù hợp công sở)         │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  🤝 Tone & Politeness                   40/100  │    │
│  │  ████░░░░░░                                      │    │
│  │  "Câu nói quá trực diện, thiếu lịch sự."        │    │
│  │                                                  │    │
│  │  💡 Thay "I want you to..." bằng                 │    │
│  │     "Could you please..." hoặc                   │    │
│  │     "Would you mind..."                          │    │
│  │  💡 Thêm "at your earliest convenience"          │    │
│  │     thay vì "tomorrow" (ít ra lệnh hơn)         │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  🔗 Coherence                            70/100  │    │
│  │  ███████░░░                                      │    │
│  │  "Đủ ý nhưng câu rời rạc, thiếu liên kết."     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  🎯 Content Accuracy                   100/100   │    │
│  │  ██████████                                      │    │
│  │  "Truyền tải đúng ý nghĩa yêu cầu."            │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ── GỢI Ý BUSINESS ENGLISH ─────────────────────        │
│                                                          │
│  💬 Cách nói chuyên nghiệp:                             │
│  • "Could you please sign this document and return it   │
│     at your earliest convenience?"                      │
│  • "I would appreciate it if you could review and sign  │
│     this document by tomorrow."                         │
│  • "Would you mind signing this document? I'll need it  │
│     back by end of day tomorrow."                       │
│                                                          │
│  📌 Bước tiếp theo:                                     │
│  • Luyện các cấu trúc polite request: "Could you...",  │
│    "Would you mind..."                                  │
│  • Học thêm business vocabulary thay thế từ cơ bản     │
│                                                          │
│  ── TRANSCRIPTION ───────────────────────────────        │
│                                                          │
│  📝 Bạn đã nói:                                         │
│  "I want you to sign this paper. Give it back to me     │
│   tomorrow."                                            │
│                         [🔊 Nghe lại]                   │
│                                                          │
│  [🔄 Thử lại]        [▶ Bài tiếp theo]                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. UI Components

### 3.1 Score Circle (Animated)

- Circular progress ring, diameter 120px
- Score number lớn (font-size 48px, bold) ở giữa
- Ring color theo thang điểm:
  - 90-100: gold (#F59E0B)
  - 80-89: green (#10B981)
  - 70-79: yellow (#EAB308)
  - 50-69: orange (#F97316)
  - 0-49: red (#EF4444)
- Rating text dưới số: "Excellent" / "Good" / "Pass" / "Needs Work" / "Try Again"
- Animation: ring fill từ 0% → actual score trong 1.5s

### 3.2 XP & Streak Banner

- Inline row dưới score circle
- "+N XP" badge (green background)
- Streak icon + count
- Bonus tags (nếu có): "First-time +20", "Streak bonus +9"
- Animation: XP counter count-up

### 3.3 Criteria Cards (Pro + Premium)

- Stack vertical, mỗi tiêu chí 1 card
- Card: white background, border-radius 12px, shadow-sm
- Header: icon + tên tiêu chí + score (phải)
- Progress bar mini: full-width, 6px height, color theo điểm
- Body: feedback text (tiếng Việt)
- Corrections/Suggestions: expandable section
  - ❌ userSaid → ✅ correct
  - 💡 suggestion with context
- Default: 2 cards đầu expanded, còn lại collapsed

### 3.4 Upsell Card (Free → Pro, Pro → Premium)

- Background: gradient nhẹ (vàng/tím)
- Hiển thị preview các tiêu chí bị khoá (blur/locked icon)
- CTA button nổi bật
- Dismiss: tap "Bỏ qua" hoặc X nhỏ (ẩn 24h)

### 3.5 Suggested Phrases Section

- Heading: "💬 Cách nói hay hơn" (Pro) / "💬 Cách nói chuyên nghiệp" (Premium)
- Bulleted list, mỗi phrase trong quote block
- Font-size 15px, color dark, italic

### 3.6 Next Steps Section

- Heading: "📌 Bước tiếp theo"
- Bulleted list, actionable advice
- Link nếu có: "Thử bài tập X" → navigate

### 3.7 Transcription Section

- Collapsible, mặc định expanded
- Background gray-50, border-radius 8px
- Text trong quotes: italic
- "Nghe lại" button: play audio gốc của user

### 3.8 Action Buttons (Bottom)

- 2 buttons ngang hàng:
  - "🔄 Thử lại" — secondary outline style
  - "▶ Bài tiếp theo" — primary fill style
- Sticky bottom trên mobile

---

## 4. Trạng Thái Theo Gói (Pricing Logic)

| Element             | 🆓 Free           | ⭐ Pro                | 👑 Premium                  |
| ------------------- | ----------------- | --------------------- | --------------------------- |
| Score circle        | ✅ Hiển thị       | ✅ Hiển thị           | ✅ Hiển thị                 |
| XP & Streak         | ✅ Hiển thị       | ✅ Hiển thị           | ✅ Hiển thị                 |
| Grammar card        | 🔒 Locked preview | ✅ Full detail        | ✅ Full detail              |
| Vocabulary card     | 🔒 Locked preview | ✅ Full detail        | ✅ Full detail              |
| Content Accuracy    | 🔒 Locked preview | ✅ Full detail        | ✅ Full detail              |
| Business Vocabulary | ❌ Không hiển thị | 🔒 Locked preview     | ✅ Full detail              |
| Tone & Politeness   | ❌ Không hiển thị | 🔒 Locked preview     | ✅ Full detail              |
| Coherence           | ❌ Không hiển thị | 🔒 Locked preview     | ✅ Full detail              |
| Suggested Phrases   | ❌ Không hiển thị | ✅ "Cách nói hay hơn" | ✅ "Cách nói chuyên nghiệp" |
| Next Steps          | ❌ Không hiển thị | ✅ Hiển thị           | ✅ Hiển thị                 |
| Transcription       | ✅ Hiển thị       | ✅ Hiển thị           | ✅ Hiển thị                 |
| Upsell card         | "Nâng cấp PRO"    | "Nâng cấp PREMIUM"    | ❌ Ẩn                       |

### Locked Preview (Free)

- Hiển thị 3 tiêu chí dưới dạng cards nhưng:
  - Score: hiển thị "🔒"
  - Feedback text: blur (CSS filter blur 4px)
  - Overlay: "Nâng cấp PRO để xem chi tiết"

### Locked Preview (Pro → Premium)

- Hiển thị 2 tiêu chí Business dưới dạng cards:
  - Score: hiển thị "🔒"
  - Feedback preview 1 dòng + blur phần còn lại
  - Overlay: "Nâng cấp PREMIUM để nhận coaching Business English"

---

## 5. UX Interactions

### 5.1 Page Load Animation

1. Score circle: animate fill (0 → score) trong 1.5s, easing ease-out
2. Rating text: fade-in sau khi ring hoàn thành
3. XP banner: slide-up + count-up animation
4. Criteria cards: stagger-in (200ms delay mỗi card)

### 5.2 Expand/Collapse Criteria

- Tap card header → toggle expand/collapse body
- Animated height transition (200ms)
- Icon chevron rotate

### 5.3 Play Audio

- Tap "Nghe lại" → play audio gốc của user
- Audio player inline: play/pause + waveform + time
- Auto-pause nếu user scroll ra khỏi viewport

### 5.4 Thử Lại

- Tap "🔄 Thử lại" → confirm: "Làm lại bài này? Điểm cũ được giữ."
- Navigate → Exercise Practice (05), cùng pack, cùng exercises
- Lần thử lại: XP penalty áp dụng (80% → 50% baseXP)

### 5.5 Bài Tiếp Theo

- Tap "▶ Bài tiếp theo" → navigate Exercise Practice (05), câu tiếp trong pack
- Nếu đã xong pack → navigate Pack Complete screen (mini celebration)
- Pack Complete: confetti + "🎉 Hoàn thành!" + Pack Score + star rating

### 5.6 Share Score (Phase 2)

- Button "📤 Chia sẻ" → generate image card + share via native share API
- Image: score circle + username + streak

### 5.7 Achievement Popup

- Nếu bài này trigger achievement (ví dụ first 95+) → modal popup:
  - "🏆 Achievement Unlocked: Sharpshooter!"
  - "+100 XP bonus"
  - CTA: "Tuyệt vời!" → dismiss

---

## 6. Responsive Design

### Mobile (< 640px)

- Single column, full-width
- Score circle: centered, 120px
- Criteria cards: full-width, stacked
- Action buttons: sticky bottom bar
- Upsell card: full-width banner

### Tablet (640px - 1024px)

- Score circle centered, max-width 600px content
- Criteria cards: có thể 2-column grid nếu đủ rộng
- Action buttons: centered, max-width 400px

### Desktop (> 1024px)

- 2-column layout:
  - Trái (40%): Score circle + XP + Transcription + Audio player
  - Phải (60%): Criteria cards + Suggestions + Next Steps
- Action buttons: bottom of right column
- Upsell card: sidebar widget (nếu có)

---

## 7. Ghi Chú Kỹ Thuật

- Data source: JSON response từ AI (xem PRD section 6)
- Score rendering: parse `overallScore`, `breakdown.*` từ response
- Conditional rendering dựa trên `user.subscription_tier`:
  - Free: chỉ render `overallScore` + `transcription`
  - Pro: render `grammar`, `vocabulary`, `contentAccuracy` + `suggestedPhrases` + `nextSteps`
  - Premium: render tất cả 5 tiêu chí + business suggestions
- XP calculation: server-side, response bao gồm `xpGained`, `bonuses[]`, `newStreak`
- Audio playback: HTML5 `<audio>` element, load từ blob URL (client-side cache)
- Achievement check: server-side, response bao gồm `newAchievements[]` nếu có
- Analytics events: `feedback_viewed`, `criteria_expanded`, `upsell_clicked`, `retry_clicked`
