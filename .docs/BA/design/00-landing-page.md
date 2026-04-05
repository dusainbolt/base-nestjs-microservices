# 🌐 00 — Landing Page (Trang Giới Thiệu — Chưa Đăng Nhập)

---

## 1. Mục Tiêu Trang

Trang đầu tiên người dùng thấy khi truy cập SpeakEng. Mục tiêu:

- **Truyền tải giá trị** của sản phẩm trong 5 giây đầu (above the fold)
- **Giảm rào cản** bằng cách nhấn mạnh "chỉ nói 5 giây → AI chấm ngay"
- **Chuyển đổi** visitor → đăng ký (Free) hoặc dùng thử Pro/Premium
- **SEO-friendly**: rank cho "luyện nói tiếng Anh AI", "app nói tiếng Anh online"

> 🎯 Target conversion: 15-25% visitor → signup (Free)

---

## 2. Layout Tổng Quan

Thiết kế single-page scroll, chia thành **8 sections** theo thứ tự:

```
┌──────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky)                                              │
│  Logo    [Tính năng] [Cách hoạt động] [Giá]  [Đăng nhập] [CTA]│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ①  HERO — "Luyện nói tiếng Anh với AI — Chỉ 5 giây"        │
│                                                               │
│  ②  SOCIAL PROOF — Số liệu nổi bật                           │
│                                                               │
│  ③  HOW IT WORKS — 3 bước đơn giản                            │
│                                                               │
│  ④  FEATURES — Tính năng nổi bật                              │
│                                                               │
│  ⑤  LEVELS & TOPICS — Lộ trình học 4 cấp × 3 chủ đề          │
│                                                               │
│  ⑥  PRICING — So sánh 3 gói Free / Pro / Premium             │
│                                                               │
│  ⑦  FAQ — Câu hỏi thường gặp                                 │
│                                                               │
│  ⑧  FINAL CTA — Kêu gọi đăng ký cuối trang                  │
│                                                               │
│  FOOTER                                                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Chi Tiết Từng Section

### Section ① — Hero

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│                     SpeakEng                                  │
│                                                               │
│         Luyện Nói Tiếng Anh Với AI                            │
│      Chỉ 5 Giây — Nhận Phản Hồi Ngay                        │
│                                                               │
│    Không cần giáo viên. Không cần hoàn hảo.                  │
│    AI đánh giá ngữ pháp, từ vựng & gợi ý cách nói           │
│    chuyên nghiệp hơn — mọi lúc, mọi nơi.                    │
│                                                               │
│    [🚀 Bắt đầu miễn phí]   [▶ Xem demo]                     │
│                                                               │
│    Không cần thẻ tín dụng • Đăng ký trong 10 giây            │
│                                                               │
│           ┌──────────────────────────────┐                    │
│           │  🖼️  App screenshot / Hero   │                    │
│           │  illustration (người nói     │                    │
│           │  vào micro + AI feedback)    │                    │
│           └──────────────────────────────┘                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Specs:**

- Background: gradient đậm (#0F172A → #1E293B) hoặc animated gradient tím-xanh
- Headline: font-size 48px (desktop) / 32px (mobile), font-weight 800, color white
- Subheadline: font-size 20px, color gray-300, max-width 600px, centered
- Primary CTA: gradient button (blue→violet), font-size 18px, height 56px, border-radius 16px, glow animation nhẹ
- Secondary CTA: ghost button (outline), play icon, hover → subtle background
- Trust line: font-size 14px, color gray-400
- Hero image/illustration: app mockup hoặc isometric illustration, max-width 500px, float animation

---

### Section ② — Social Proof (Stats Bar)

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│   │  🎯 10,000+ │  │  🎙️ 50,000+ │  │  ⭐ 4.8/5   │          │
│   │  Người dùng  │  │  Bài đã chấm │  │  Đánh giá   │          │
│   └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                               │
│   "SpeakEng giúp tôi tự tin nói tiếng Anh trước khách hàng!" │
│   — Minh Tuấn, Product Manager                               │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Specs:**

- Background: white hoặc gray-50
- 3 stat cards: count-up animation khi scroll vào (IntersectionObserver)
- Testimonial quote: italic, font-size 16px, avatar nhỏ + tên + chức danh
- Carousel nếu có nhiều testimonial (auto-slide 5s)

---

### Section ③ — How It Works (3 Bước)

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│              🎯 Cách SpeakEng Hoạt Động                      │
│              Đơn giản 3 bước — dưới 1 phút!                  │
│                                                               │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│   │              │  │              │  │              │       │
│   │  📷 Bước 1   │  │  🎙️ Bước 2   │  │  📊 Bước 3   │       │
│   │  XEM ĐỀ BÀI  │  │  GHI ÂM      │  │  NHẬN FEEDBACK│       │
│   │              │  │              │  │              │       │
│   │  Đọc tình    │  │  Nhấn record │  │  AI đánh giá │       │
│   │  huống bằng  │  │  và nói bằng │  │  ngữ pháp,   │       │
│   │  tiếng Việt  │  │  tiếng Anh   │  │  từ vựng &   │       │
│   │  + xem ảnh   │  │  (chỉ 5s!)   │  │  gợi ý cách  │       │
│   │              │  │              │  │  diễn đạt    │       │
│   └──────────────┘  └──────────────┘  └──────────────┘       │
│         ①  ─────────→  ②  ─────────→  ③                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Specs:**

- 3 cards ngang (desktop) / dọc stacked (mobile)
- Mỗi card: icon lớn (48px) + tiêu đề bold + mô tả 2-3 dòng
- Connecting arrows giữa các cards (svg lines)
- Stagger-in animation khi scroll vào
- Background: subtle gradient nhạt hoặc pattern dots

---

### Section ④ — Features (Tính Năng Nổi Bật)

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│               ✨ Tại Sao Chọn SpeakEng?                      │
│                                                               │
│   ┌───────────────────────┐  ┌───────────────────────┐       │
│   │ 🤖 AI Chấm Điểm Thông│  │ 📚 3 Nhóm Chủ Đề     │       │
│   │    Minh                │  │    Phong Phú           │       │
│   │                        │  │                        │       │
│   │ Ngữ pháp, từ vựng,    │  │ 🌍 Đời sống hàng ngày │       │
│   │ gợi ý cách diễn đạt   │  │ 💼 Giao tiếp công sở  │       │
│   │ hay hơn — giống 1     │  │ 🎯 Chuyên ngành: Y tế,│       │
│   │ gia sư riêng.         │  │    IT, Tài chính...    │       │
│   └───────────────────────┘  └───────────────────────┘       │
│                                                               │
│   ┌───────────────────────┐  ┌───────────────────────┐       │
│   │ 👔 Coaching Business  │  │ 🏆 Gamification       │       │
│   │    English (Premium)  │  │    & Xếp Hạng          │       │
│   │                        │  │                        │       │
│   │ Đánh giá Tone lịch sự,│  │ XP, Streak, Badge,    │       │
│   │ từ vựng chuyên nghiệp,│  │ Bảng xếp hạng —      │       │
│   │ tính mạch lạc — để    │  │ học mà như chơi game! │       │
│   │ giao tiếp sếp & khách.│  │                        │       │
│   └───────────────────────┘  └───────────────────────┘       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Specs:**

- 2×2 grid (desktop), stacked (mobile)
- Mỗi feature card: icon gradient, tiêu đề bold 18px, mô tả 14px gray-600
- Card hover: scale(1.02) + shadow-lg transition
- Premium feature card: subtle gold border + 👑 badge

---

### Section ⑤ — Levels & Topics (Lộ Trình Học)

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│              📈 Lộ Trình Học 4 Cấp Độ                        │
│              Từ Beginner đến Intermediate                     │
│                                                               │
│   ┌──────────────────────────────────────────────────────┐   │
│   │                                                      │   │
│   │  ⓵ Beginner ──→ ⓶ Elementary ──→ ⓷ Pre-Inter ──→ ⓸ Inter│
│   │  1 câu đơn      2-3 câu          3-4 câu        4-5 câu │
│   │                                                      │   │
│   └──────────────────────────────────────────────────────┘   │
│                                                               │
│   Kết hợp 3 nhóm chủ đề:                                    │
│                                                               │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│   │ 🌍 Everyday│  │ 💼 Office  │  │ 🎯 Niche   │             │
│   │   English  │  │ Foundation │  │   Master   │             │
│   │            │  │            │  │            │             │
│   │ Greeting   │  │ My Job     │  │ 🏥 Y Tế    │             │
│   │ Shopping   │  │ Daily Task │  │ 💻 IT      │             │
│   │ Travel     │  │ Weekly Rec │  │ 💰 Finance │             │
│   │ Lifestyle  │  │ Problem &  │  │ 👥 HR      │             │
│   │            │  │ Solution   │  │ 🏨 Service │             │
│   └────────────┘  └────────────┘  └────────────┘             │
│                                                               │
│   = 3 categories × 4 levels = 12+ lộ trình riêng biệt       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Specs:**

- Level roadmap: horizontal progress bar với 4 node circles
- Mỗi node: icon số + tên level + số câu yêu cầu
- 3 category cards dưới roadmap: mỗi card liệt kê 4 topics
- Niche Master card: hiển thị 5 ngành nghề nhỏ bên trong
- Animation: roadmap "draw-in" từ trái → phải khi visible
- Color scheme: xanh lá cho completed feel, xanh dương cho progress

---

### Section ⑥ — Pricing (So Sánh 3 Gói)

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│              💎 Chọn Gói Phù Hợp Với Bạn                    │
│                                                               │
│   ┌──────────┐   ┌──────────────┐   ┌──────────────┐         │
│   │ 🆓 FREE  │   │ ⭐ PRO       │   │ 👑 PREMIUM   │         │
│   │          │   │ Phổ biến 🔥  │   │              │         │
│   │ Miễn phí │   │ 79K/tháng   │   │ 149K/tháng  │         │
│   │          │   │ 499K/năm    │   │ 999K/năm    │         │
│   │          │   │ (tiết kiệm  │   │ (tiết kiệm  │         │
│   │          │   │  47%)        │   │  44%)        │         │
│   ├──────────┤   ├──────────────┤   ├──────────────┤         │
│   │✅ 3 bài  │   │✅ 20 bài/ngày│   │✅ Không giới │         │
│   │  /ngày   │   │✅ All levels │   │   hạn        │         │
│   │✅ Lv 1-2 │   │✅ Feedback   │   │✅ All levels │         │
│   │✅ Điểm   │   │  chi tiết    │   │✅ 5 tiêu chí │         │
│   │  tổng    │   │  (3 tiêu chí)│   │  Business    │         │
│   │❌ Ko gợi │   │✅ Gợi ý cách │   │✅ Coaching   │         │
│   │  ý       │   │  nói hay hơn │   │  Tone & Vocab│         │
│   │❌ Ko lịch│   │✅ Lịch sử    │   │✅ Lịch sử    │         │
│   │  sử      │   │  30 ngày     │   │  vĩnh viễn   │         │
│   │Có QC     │   │Ko QC         │   │✅ 3 streak   │         │
│   │          │   │              │   │  freeze/tháng│         │
│   ├──────────┤   ├──────────────┤   ├──────────────┤         │
│   │[Bắt đầu]│   │[Dùng thử 7  │   │[Dùng thử 7  │         │
│   │          │   │ ngày FREE]  │   │ ngày FREE]   │         │
│   └──────────┘   └──────────────┘   └──────────────┘         │
│                                                               │
│   Tất cả gói đều không cần thẻ tín dụng để bắt đầu.         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Specs:**

- 3 columns (desktop), stacked + horizontal swipe (mobile)
- PRO card: nổi bật nhất, scale(1.05), border gradient, badge "Phổ biến 🔥"
- PREMIUM card: subtle gold accent border
- Feature list: ✅/❌ icons + text, max 8 items mỗi card
- CTA buttons: Free = outline, Pro = primary gradient, Premium = gold gradient
- Toggle switch phía trên: "Hàng tháng / Hàng năm (tiết kiệm 44%)"
- Responsive: swipe carousel trên mobile, Pro card center

---

### Section ⑦ — FAQ

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│              ❓ Câu Hỏi Thường Gặp                           │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ ▸ SpeakEng có phù hợp cho người mới bắt đầu?         │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ ▸ AI đánh giá có chính xác không?                     │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ ▸ Tôi cần micro gì để ghi âm?                         │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ ▸ Gói Free có giới hạn gì?                            │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ ▸ Tôi có thể huỷ gói Pro/Premium bất cứ lúc nào?     │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │ ▸ SpeakEng khác gì ELSA Speak hay Duolingo?           │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**FAQ Answers (expand on click):**

1. **Phù hợp cho mới bắt đầu?** → Hoàn toàn! Level 1 (Beginner) chỉ yêu cầu nói 1 câu đơn. AI chấm rất nhẹ nhàng ở cấp này.
2. **AI chính xác không?** → SpeakEng dùng GPT-4o-mini + Whisper, đánh giá dựa trên văn bản, rất phù hợp cho luyện giao tiếp (không chấm phát âm chuyên sâu).
3. **Cần micro gì?** → Chỉ cần micro tích hợp trên laptop/điện thoại. Không cần thiết bị đặc biệt.
4. **Free giới hạn gì?** → 3 bài/ngày, chỉ Level 1-2, chỉ xem điểm tổng. Nâng PRO để mở tất cả level + feedback chi tiết.
5. **Huỷ bất cứ lúc nào?** → Có, huỷ ngay trong Settings. Không bị tính phí sau khi huỷ.
6. **Khác Duolingo/ELSA?** → SpeakEng tập trung vào **luyện nói** thực tế (không quiz ngữ pháp), dùng AI đánh giá câu nói thật, có coaching Business English cho dân văn phòng.

**Specs:**

- Accordion pattern: click → expand answer với slide animation
- Mỗi item: border-bottom 1px, height 56px collapsed
- Icon chevron rotate khi expand
- Schema markup FAQ cho SEO

---

### Section ⑧ — Final CTA

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│        🎙️ Sẵn Sàng Luyện Nói Tiếng Anh?                    │
│                                                               │
│        Đăng ký miễn phí. Nói câu đầu tiên trong 30 giây.    │
│                                                               │
│        [🚀 Bắt Đầu Ngay — Miễn Phí]                         │
│                                                               │
│        Đã có tài khoản? Đăng nhập →                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Specs:**

- Background: gradient đậm giống Hero (dark theme)
- Headline: font-size 36px, bold, white
- Sub: 18px, gray-300
- CTA: giống Hero button, lớn, glow animation
- Minimal — không quá nhiều element, focus vào CTA

---

### Footer

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  SpeakEng          Sản phẩm        Hỗ trợ        Pháp lý    │
│  Luyện nói tiếng   Tính năng       FAQ            Điều khoản │
│  Anh với AI        Bảng giá        Liên hệ        Bảo mật   │
│                    Blog            Discord         GDPR       │
│                                                               │
│  [Facebook] [TikTok] [Email]                                 │
│                                                               │
│  © 2026 SpeakEng. Made with ❤️ in Vietnam.                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Navbar (Sticky)

```
┌──────────────────────────────────────────────────────────────┐
│  🎙️ SpeakEng   [Tính năng] [Cách dùng] [Giá]  [Đăng nhập] [Đăng ký →] │
└──────────────────────────────────────────────────────────────┘
```

**Specs:**

- Height: 64px, fixed top, z-index 50
- Background: transparent khi ở top, rgba(15,23,42,0.95) + backdrop-blur khi scroll
- Logo: icon micro + text "SpeakEng", font-weight 700
- Nav links: smooth scroll đến section tương ứng (anchor links)
- "Đăng nhập": ghost button, "Đăng ký →": primary gradient button nhỏ
- Mobile: hamburger menu → slide-down overlay menu

---

## 5. SEO & Meta

```html
<title>SpeakEng — Luyện Nói Tiếng Anh Với AI | Chấm Điểm Ngay</title>
<meta
  name="description"
  content="Luyện nói tiếng Anh mọi lúc mọi nơi. AI đánh giá ngữ pháp, từ vựng, coaching giao tiếp công sở. 4 cấp độ, 3 nhóm chủ đề. Bắt đầu miễn phí!"
/>
<meta
  name="keywords"
  content="luyện nói tiếng anh, app nói tiếng anh AI, luyện speaking, IELTS speaking, học tiếng anh online"
/>
<meta property="og:title" content="SpeakEng — AI Chấm Điểm Nói Tiếng Anh Của Bạn" />
<meta property="og:description" content="Nói 5 giây, AI chấm ngay! Luyện giao tiếp tiếng Anh với AI thông minh." />
<meta property="og:image" content="/og-image.png" />
```

- Heading hierarchy: 1 `<h1>` (Hero headline), `<h2>` per section
- Alt text cho mọi image
- FAQ schema markup (JSON-LD) cho Google rich snippets
- Lazy load images below fold
- Core Web Vitals: LCP < 2.5s, CLS < 0.1

---

## 6. UX Interactions

### 6.1 Scroll Animations

- Các section fade-in + slide-up khi scroll vào (IntersectionObserver)
- Stats counter: count-up animation (0 → final number trong 2s)
- Level roadmap: draw-in animation from left to right
- Stagger delay 100ms giữa các cards

### 6.2 Pricing Toggle

- Switch "Hàng tháng / Hàng năm" → giá thay đổi với counter flip animation
- Badge "Tiết kiệm 47%" xuất hiện khi chọn năm

### 6.3 Demo Video (Optional)

- Hero "Xem demo" → modal video player (YouTube embed hoặc self-hosted)
- Auto-pause khi đóng modal

### 6.4 Smooth Scroll Navigation

- Click nav link → smooth scroll đến section (offset 80px cho navbar)
- Navbar active link highlight theo scroll position

### 6.5 CTA Hover Effects

- Primary button: glow pulse softly, scale(1.02)
- Pricing card hover: lift shadow + border highlight

---

## 7. Responsive Design

### Mobile (< 640px)

- Navbar: logo + hamburger, menu overlay khi mở
- Hero: headline 28px, CTA full-width stack (primary on top)
- How it Works: 3 cards vertical, arrows → vertial dots
- Features: single column stacked cards
- Pricing: horizontal swipe carousel, Pro card centered first
- Stats: 1×3 vertical
- FAQ: full-width accordion

### Tablet (640px - 1024px)

- Navbar: hiển thị đủ links, CTA button nhỏ lại
- Hero: 2-column (text trái, image phải)
- Features: 2×2 grid
- Pricing: 3 columns compressed
- Level roadmap: horizontal scroll nếu chật

### Desktop (> 1024px)

- Max-width container: 1200px, centered
- Hero: 2-column 50/50 (text + hero image)
- Pricing: 3 columns với PRO card nổi bật (scale)
- Features: 2×2 grid, hover effects
- Footer: 4-column grid

---

## 8. Ghi Chú Kỹ Thuật

- **Routing**: Landing page = `/` (public, không cần auth)
- **Redirect**: Nếu đã login → redirect thẳng về `/dashboard`
- **Analytics**: Track scroll depth, CTA clicks, pricing toggle, FAQ opens
- **A/B testing**: Hero headline variants, CTA text variants
- **Performance**:
  - Hero image: WebP + preload, fallback PNG
  - Font: preload Inter/Outfit from Google Fonts
  - CSS: critical CSS inlined, rest deferred
  - JS: lazy load animation libraries
- **i18n ready**: Content text trong language file, switch Việt/Anh sau
- **Dark mode**: Landing page mặc định dark theme (hero + final CTA), sections giữa light
