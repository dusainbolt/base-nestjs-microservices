# TÀI LIỆU MAPPING PHIÊN ÂM DỮ LIỆU (JSON KEY MAPPING)

Tài liệu này dùng để tra cứu và ánh xạ (mapping) các ký tự viết tắt trong bộ dữ liệu bài tập (exercises) được sinh ra từ AI sau khi đã tối ưu hóa Token.

---

## 1. BẢNG TRA CỨU CÁC KHÓA (KEYS)

Dữ liệu JSON trả về sẽ sử dụng các ký tự viết tắt để tiết kiệm chi phí và tăng tốc độ xử lý:

| Key Viết Tắt | Tên Đầy Đủ | Kiểu Dữ Liệu | Mô Tả |
| :--- | :--- | :--- | :--- |
| **l** | `level` | `number` | Cấp độ bài học (1, 2, 3, 4). |
| **d** | `data` | `array` | Danh sách các Gói bài tập (Packs). |
| **t** | `title` | `string` | Tiêu đề của Gói (Viết bằng Tiếng Việt). |
| **e** | `exercises` | `array` | Danh sách 5 bài tập trong mỗi Gói. |
| **p** | `previousPrompt` | `string` | Câu thoại dẫn dắt của đối phương (Tiếng Anh). |
| **m** | `myPrompt` | `string` | Câu lệnh/Hướng dẫn phản hồi cho người học (Tiếng Việt). |
| **h** | `levelHint` | `string` | Gợi ý công thức ngữ pháp rút gọn (Tiếng Việt). |
| **s** | `sampleAnswer` | `string` | Đáp án mẫu hoàn chỉnh (Tiếng Anh). |

---

## 2. BẢNG MAPPING FILE CẤU HÌNH LEVEL (level.json)

Dữ liệu đầu vào mô tả cấp độ học (level definition) cũng được rút gọn để giảm Token đầu vào:

| Key Viết Tắt | Tên Đầy Đủ | Mô Tả |
| :--- | :--- | :--- |
| **lvl** | `level` | Số thứ tự cấp độ (1, 2, 3, 4). |
| **code** | `code` | Mã định danh trình độ (BEGINNER, ELEMENTARY...). |
| **desc** | `description` | Mô tả tổng quan về trình độ. |
| **req** | `outputRequirements` | Các yêu cầu kỹ thuật về đầu ra cho level này. |
| **count** | `sentenceCount` | Số lượng câu yêu cầu trong mỗi câu trả lời. |
| **gram** | `grammar` | Các cấu trúc ngữ pháp trọng tâm. |
| **vocab** | `vocabulary` | Phạm vi từ vựng khuyến nghị. |
| **conn** | `connectors` | Các từ nối (and, but, so...) yêu cầu sử dụng. |
| **tense** | `tense` | Các thì (tenses) cần tập trung. |
| **fluen** | `fluency` | Yêu cầu về độ trôi chảy. |
| **cmplx** | `complexity` | Đánh giá độ phức tạp tổng thể. |
| **ex** | `examples` | Danh sách các ví dụ minh họa trình độ. |
| **vi** | `vietnamese` | Nội dung ví dụ bằng Tiếng Việt. |
| **en** | `english` | Nội dung ví dụ bằng Tiếng Anh. |


---

## 3. CÁC QUY TẮC ĐẶC BIỆT

1.  **Placeholder `[Your Name]`:**
    - Cả trong trường `m` (câu lệnh) và `s` (đáp án mẫu), hễ nhắc đến tên riêng của người học thì AI luôn dùng chuỗi `[Your Name]`.
    - **Nhiệm vụ Backend:** Replace `[Your Name]` bằng tên thật của User trước khi gửi trả về Client.

2.  **Sequence Order (Thứ tự):**
    - Không có trường `sequenceOrder` trong JSON.
    - **Nhiệm vụ Backend:** Gán thứ tự bài tập dựa trên vị trí (`index`) của phần tử trong mảng `e`. (VD: `exercise.sequenceOrder = index + 1`).

---

## 4. MẪU CODE ÁNH XẠ (TYPESCRIPT/NESTJS)

Dưới đây là một hàm mẫu để convert dữ liệu rút gọn về dạng Object đầy đủ:

```typescript
function mapShorthandToFull(shorthandData: any) {
  return {
    level: shorthandData.l,
    packs: shorthandData.d.map((pack: any) => ({
      title: pack.t,
      exercises: pack.e.map((ex: any, index: number) => ({
        sequenceOrder: index + 1,
        previousPrompt: ex.p,
        myPrompt: ex.m,
        levelHint: ex.h,
        sampleAnswer: ex.s,
      })),
    })),
  };
}
```

---

## 5. LỢI ÍCH KỸ THUẬT

- **Giảm dung lượng:** Giảm ~25% kích thước File JSON.
- **Tiết kiệm Token:** Giảm chi phí API OpenAI/Gemini/Claude đáng kể.
- **Tính ổn định:** AI sinh được nhiều nội dung hơn trong 1 lần phản hồi mà không bị lỗi cấu trúc JSON.
