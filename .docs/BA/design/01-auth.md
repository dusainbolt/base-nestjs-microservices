# 🔐 01 — Authentication (Đăng Ký / Đăng Nhập)

---

## 1. Mục Tiêu Trang

Cho phép người dùng đăng ký tài khoản mới hoặc đăng nhập vào hệ thống một cách nhanh chóng, tối ưu cho mobile-first. Ưu tiên Google OAuth để giảm ma sát, kết hợp Email/Password cho người dùng truyền thống.

---

## 2. Layout Tổng Quan

Thiết kế single-column, centered content, background gradient nhẹ (xanh dương → tím nhạt) gợi cảm giác giáo dục hiện đại.

```
┌──────────────────────────────────────────────────┐
│                                                   │
│              [Logo SpeakEng]                      │
│         "Luyện nói tiếng Anh với AI"              │
│                                                   │
│  ┌──────────────────────────────────────────┐     │
│  │                                          │     │
│  │   [🔵 Đăng nhập bằng Google]             │     │
│  │                                          │     │
│  │   ──────── hoặc ────────                 │     │
│  │                                          │     │
│  │   Email:    [___________________________]│     │
│  │   Mật khẩu: [___________________________]│     │
│  │                                          │     │
│  │   [   Đăng nhập   ]  ← primary CTA      │     │
│  │                                          │     │
│  │   Quên mật khẩu?                        │     │
│  │                                          │     │
│  │   ─────────────────────────────          │     │
│  │   Chưa có tài khoản? Đăng ký ngay       │     │
│  │                                          │     │
│  └──────────────────────────────────────────┘     │
│                                                   │
│         Illustration: người nói chuyện            │
│         với AI bot (minh hoạ nhẹ)                 │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## 3. UI Components

### 3.1 Logo & Tagline

- Logo SpeakEng (SVG, ~40px height)
- Tagline: "Luyện nói tiếng Anh với AI" — font-size 16px, color gray-500

### 3.2 Auth Card

- Background: white, border-radius 16px, shadow-lg
- Max-width: 420px, centered
- Padding: 32px

### 3.3 Google OAuth Button

- Full-width, height 48px
- Icon Google bên trái, text "Đăng nhập bằng Google"
- Border: 1px solid gray-300, hover: shadow-md
- Đặt trên cùng vì là phương thức ưu tiên

### 3.4 Divider

- Text "hoặc" centered, đường kẻ hai bên
- Color gray-300, text gray-400

### 3.5 Form Fields

- Input: full-width, height 44px, border-radius 8px
- Label: float trên input (floating label pattern)
- Validation: real-time, hiển thị lỗi dưới field bằng text đỏ nhỏ
- Password: có icon toggle show/hide (👁)

### 3.6 Primary CTA Button

- Full-width, height 48px, border-radius 12px
- Background: primary blue (#2563EB), text white, font-weight 600
- Hover: darken 10%, disabled: opacity 50%
- Loading state: spinner thay text

### 3.7 Toggle Login/Register

- Text link ở dưới card
- "Chưa có tài khoản? **Đăng ký ngay**" / "Đã có tài khoản? **Đăng nhập**"

---

## 4. Trạng Thái Theo Gói (Pricing Logic)

Trang Auth không phân biệt gói. Mọi user đều đăng ký vào gói Free mặc định. Sau khi đăng nhập lần đầu sẽ thấy onboarding gợi ý nâng cấp.

---

## 5. UX Interactions

### 5.1 Flow Đăng Ký

1. User nhấn "Đăng ký ngay" → form chuyển thành Register mode
2. Thêm field: Tên hiển thị, Xác nhận mật khẩu
3. Submit → loading spinner → redirect Home Dashboard
4. Nếu lỗi (email đã tồn tại, password yếu) → hiển thị inline error

### 5.2 Flow Đăng Nhập

1. User nhập Email + Password → nhấn "Đăng nhập"
2. Loading spinner 1-2s → redirect Home Dashboard
3. Nếu sai credentials → shake animation trên form + error message
4. "Quên mật khẩu?" → modal nhập email → gửi link reset

### 5.3 Google OAuth

1. Nhấn button → popup Google consent
2. Thành công → tự tạo account (nếu mới) hoặc login → redirect Home
3. Popup bị chặn → fallback redirect flow

### 5.4 Validation Rules

- Email: format hợp lệ, kiểm tra tồn tại khi blur
- Password: tối thiểu 8 ký tự, ít nhất 1 số + 1 chữ hoa
- Tên hiển thị: 2-30 ký tự, không ký tự đặc biệt

---

## 6. Responsive Design

### Mobile (< 640px)

- Card chiếm full-width, padding 20px, no shadow (flat)
- Logo nhỏ hơn (32px), tagline font-size 14px
- Input height giữ 44px (dễ tap)
- Illustration ẩn

### Tablet (640px - 1024px)

- Card max-width 420px, centered
- Illustration hiển thị nhỏ bên dưới

### Desktop (> 1024px)

- Split layout: trái = illustration lớn (50%), phải = auth card (50%)
- Illustration: người đang nói chuyện với AI, phong cách flat/isometric

---

## 7. Ghi Chú Kỹ Thuật

- Google OAuth: dùng `@react-oauth/google` hoặc NextAuth
- Session: JWT stored in httpOnly cookie
- Rate limit: max 5 login attempts / 5 phút / IP
- CSRF protection cho form submit
- Redirect sau login: nếu có `?redirect=` param thì về đó, nếu không về `/dashboard`
