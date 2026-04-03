export const customCss = (logoUrl: string) => `
/* 🌙 Nền tổng thể */
.swagger-ui {
  background-color: #f9fafb;
  font-family: 'Inter', 'Roboto', sans-serif;
}

/* 🧭 Giới hạn chiều rộng container */
.swagger-ui .wrapper {
  max-width: 1200px;
  margin: auto;
}
  

/* ⚡ Một chút bóng mờ nhẹ cho toàn trang */
.swagger-ui {
  background-color: #f9fafb;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
  font-family: 'Inter', 'Roboto', sans-serif;
}

/* 🧭 Header */
.topbar {
  background: #111827 !important;
  border-bottom: 3px solid #2563eb;
}

/* ẨN LOGO MẶC ĐỊNH (SVG) */
.topbar-wrapper svg {
  display: none; /* Ẩn toàn bộ khối SVG inline */
}

/* THAY THẾ LOGO BẰNG ẢNH CỦA BẠN */
.topbar-wrapper a.link {
  /* Đảm bảo nó có kích thước để chứa logo mới */
  height: 40px; 
  width: 150px; /* Điều chỉnh chiều rộng phù hợp với logo mới */
  display: block; 
  /* Chèn logo mới vào làm hình nền */
  background-image: url('${logoUrl}'); 
  background-size: contain; /* Đảm bảo hình ảnh vừa vặn */
  background-repeat: no-repeat;
  background-position: left center;
}

.topbar-wrapper img {
  /* Bỏ hoặc giữ nguyên phần này nếu bạn đã dùng thẻ <img> cho logo cũ */
  display: none !important; 
}
.topbar a span {
  color: #f3f4f6 !important;
  font-weight: 600;
}

/* 🔹 Tiêu đề tài liệu */
.swagger-ui .info h2,
.swagger-ui .info h1 {
  color: #111827;
  font-weight: 700;
}

/* 📄 Thẻ operation */
.opblock {
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  margin-bottom: 16px !important;
}

/* 🔘 Nút “Try it out” (Execute) */
.try-out__btn:not(.cancel):not(.reset), /* Áp dụng cho nút Try it out/Execute */
.execute-wrapper .btn:not(.cancel):not(.reset) {
  background-color: #2563eb !important; /* Xanh dương nổi bật (Primary) */
  color: white !important;
  border-radius: 8px !important;
  transition: all 0.2s ease;
}
.try-out__btn:not(.cancel):not(.reset):hover,
.execute-wrapper .btn:not(.cancel):not(.reset):hover {
  background-color: #1d4ed8 !important;
  transform: scale(1.03);
}

/* ❌ Nút Cancel */
.btn.try-out__btn.cancel {
  background-color: #dc2626 !important; /* 🔴 Đỏ chính */
  color: #ffffff !important;
  border-radius: 8px !important;
  border: none !important;
  transition: all 0.2s ease;
}

.btn.try-out__btn.cancel:hover {
  background-color: #b91c1c !important; /* 🔥 Đỏ đậm hơn khi hover */
  color: #fff !important;
  transform: scale(1.03);
}

/* 🔄 Nút Reset */
.btn.try-out__btn.reset {
  background-color: #f59e0b !important; /* Màu Cam (Warning) */
  color: #1f2937 !important; /* Chữ tối trên nền cam */
  border-radius: 8px !important;
  transition: all 0.2s ease;
  font-weight: 600;
}
.btn.try-out__btn.reset:hover {
  background-color: #d97706 !important; /* Hover cam đậm hơn */
  transform: scale(1.03);
}

/* 🔑 Nút Authorize */
.authorize__btn {
  background-color: #16a34a !important;
  color: white !important;
  border-radius: 8px !important;
  font-weight: 500;
}
.authorize__btn:hover {
  background-color: #15803d !important;
}

/* ⏱ Hiển thị thời gian request */
.opblock-summary-operation-id {
  white-space: nowrap;
  color: #4b5563;
  font-weight: 500;
}

/* ⚡ Tô màu các method */
.opblock.opblock-get { border-left: 5px solid #2563eb; }
.opblock.opblock-post { border-left: 5px solid #16a34a; }
.opblock.opblock-put { border-left: 5px solid #d97706; }
.opblock.opblock-delete { border-left: 5px solid #dc2626; }

/* ---------------------------------------------------- */
/* 🔑 TÙY CHỈNH MODAL AUTHORIZATIONS (LIGHT MODE) */
/* ---------------------------------------------------- */

/* Nền Modal tổng thể */
.swagger-ui .dialog-ux .modal-ux {
  background-color: rgba(0, 0, 0, 0.6); /* Nền mờ tối */
  max-width: 500px;
}

/* Khung hộp thoại */
.swagger-ui .dialog-ux .modal-dialog-ux {
  background-color: #ffffff; /* Nền trắng sáng */
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  color: #1f2937; /* Chữ tối */
}

/* Header Modal */
.swagger-ui .dialog-ux .modal-ux-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
}

/* Tiêu đề Modal */
.swagger-ui .dialog-ux .modal-ux-header h3 {
  color: #111827; /* Tiêu đề rất tối */
  font-weight: 700;
  margin: 0;
}

/* Nút Close Modal (X) */
.swagger-ui .dialog-ux .close-modal {
  background: none;
  border: none;
  color: #4b5563; /* Màu Xám */
  transition: color 0.2s ease;
}
.swagger-ui .dialog-ux .close-modal:hover {
  color: #ef4444; /* Đỏ khi hover */
}
.swagger-ui .dialog-ux .close-modal svg path {
    fill: currentColor;
}

/* Nội dung Modal */
.swagger-ui .dialog-ux .modal-ux-content {
  padding: 20px;
}

/* Tiêu đề Authorization */
.swagger-ui .dialog-ux .auth-container h4 {
  color: #111827;
  font-weight: 600;
  border-bottom: 2px solid #2563eb; /* Đường gạch chân xanh */
  padding-bottom: 4px;
  margin-top: 10px;
}

/* Trạng thái Authorized/Unauthorized */
.swagger-ui .dialog-ux .auth-container h6 {
  color: #10b981; /* Màu xanh lá cho trạng thái Authorized */
  font-weight: 500;
}

/* Thông tin chi tiết (Name, In, Value) */
.swagger-ui .dialog-ux .auth-container p,
.swagger-ui .dialog-ux .auth-container label,
.swagger-ui .dialog-ux .auth-container code {
  color: #374151;
}

/* Vùng nút (Logout, Close) */
.swagger-ui .dialog-ux .auth-btn-wrapper {
  border-top: 1px solid #e5e7eb;
  padding-top: 15px;
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Nút Logout */
.swagger-ui .dialog-ux .modal-btn.auth {
  background-color: #f9fafb !important; /* Nền trắng xám */
  color: #dc2626 !important; /* Chữ màu đỏ (Nguy hiểm) */
  border: 1px solid #fca5a5 !important;
  border-radius: 6px !important;
  font-weight: 600;
}
.swagger-ui .dialog-ux .modal-btn.auth:hover {
  background-color: #fef2f2 !important;
}

/* Nút Close (Done) */
.swagger-ui .dialog-ux .modal-btn.btn-done {
  background-color: #2563eb !important; /* Xanh dương (Primary) */
  color: white !important;
  border-radius: 6px !important;
  font-weight: 600;
}
.swagger-ui .dialog-ux .modal-btn.btn-done:hover {
  background-color: #1d4ed8 !important;
}

`;
