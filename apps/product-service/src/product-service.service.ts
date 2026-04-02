import {
  CreateProductPayload,
  DeleteProductPayload,
  GetProductByIdPayload,
  GetProductListPayload,
  ProductListResponse,
  ProductResponse,
  UpdateProductPayload,
  UserDeletedEvent,
} from '@app/common';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ProductServiceService {
  private readonly logger = new Logger(ProductServiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  CREATE
  // ═══════════════════════════════════════════════════════════════════════════

  async create(payload: CreateProductPayload): Promise<ProductResponse> {
    const product = await this.prisma.product.create({
      data: {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        stock: payload.stock ?? 0,
        createdByUserId: payload.createdByUserId,
      },
    });

    this.logger.log(
      `Product created: id=${product.id} by userId=${payload.createdByUserId}`,
    );
    return this.toResponse(product);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  GET BY ID
  // ═══════════════════════════════════════════════════════════════════════════

  async getById(payload: GetProductByIdPayload): Promise<ProductResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id: payload.id },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  GET LIST (với pagination và filter)
  // ═══════════════════════════════════════════════════════════════════════════

  async getList(payload: GetProductListPayload): Promise<ProductListResponse> {
    const page = payload.page ?? 1;
    const limit = Math.min(payload.limit ?? 20, 100); // max 100 per page
    const skip = (page - 1) * limit;

    const where = {
      isActive: payload.isActive ?? true,
      ...(payload.createdByUserId && {
        createdByUserId: payload.createdByUserId,
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map(this.toResponse),
      total,
      page,
      limit,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  UPDATE
  // ═══════════════════════════════════════════════════════════════════════════

  async update(payload: UpdateProductPayload): Promise<ProductResponse> {
    const product = await this.prisma.product.findUnique({
      where: { id: payload.id },
    });

    if (!product || !product.isActive)
      throw new NotFoundException('Product not found');

    // Chỉ owner mới được sửa
    if (product.createdByUserId !== payload.requesterId) {
      throw new ForbiddenException(
        'You do not have permission to update this product',
      );
    }

    const updated = await this.prisma.product.update({
      where: { id: payload.id },
      data: {
        ...(payload.name !== undefined && { name: payload.name }),
        ...(payload.description !== undefined && {
          description: payload.description,
        }),
        ...(payload.price !== undefined && { price: payload.price }),
        ...(payload.stock !== undefined && { stock: payload.stock }),
      },
    });

    this.logger.log(`Product updated: id=${payload.id}`);
    return this.toResponse(updated);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  DELETE (soft delete)
  // ═══════════════════════════════════════════════════════════════════════════

  async delete(payload: DeleteProductPayload): Promise<{ message: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id: payload.id },
    });

    if (!product || !product.isActive)
      throw new NotFoundException('Product not found');

    if (product.createdByUserId !== payload.requesterId) {
      throw new ForbiddenException(
        'You do not have permission to delete this product',
      );
    }

    await this.prisma.product.update({
      where: { id: payload.id },
      data: { isActive: false },
    });

    this.logger.log(`Product soft-deleted: id=${payload.id}`);
    return { message: 'Product deleted successfully' };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HANDLE USER DELETED (Domain Event — Pub/Sub)
  //  Idempotent: chạy lại nhiều lần vẫn cho kết quả đúng
  // ═══════════════════════════════════════════════════════════════════════════

  async handleUserDeleted(event: UserDeletedEvent): Promise<void> {
    // Soft delete toàn bộ sản phẩm của user
    // updateMany idempotent: lần 2 không có row active nào → no-op
    const result = await this.prisma.product.updateMany({
      where: {
        createdByUserId: event.userId,
        isActive: true,
      },
      data: { isActive: false },
    });

    this.logger.log(
      `[user.deleted] Soft-deleted ${result.count} products for userId=${event.userId}`,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private toResponse(product: any): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      isActive: product.isActive,
      createdByUserId: product.createdByUserId,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
