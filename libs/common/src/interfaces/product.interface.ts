// ─── Payloads (api-gateway → product-service via RMQ RPC) ────────────────────

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  createdByUserId: string;
}

export interface GetProductByIdPayload {
  id: string;
}

export interface GetProductListPayload {
  page?: number;
  limit?: number;
  createdByUserId?: string; // filter by user
  isActive?: boolean;
}

export interface UpdateProductPayload {
  id: string;
  requesterId: string;        // userId đang gửi request — dùng để check ownership
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export interface DeleteProductPayload {
  id: string;
  requesterId: string;
}

// ─── Domain Event Payloads (user-service → exchange → product-service) ───────

export interface UserDeletedEvent {
  userId: string;
  timestamp: number;          // Unix ms — dùng để check ordering
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface ProductResponse {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  createdByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductListResponse {
  items: ProductResponse[];
  total: number;
  page: number;
  limit: number;
}
