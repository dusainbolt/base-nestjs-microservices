import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CreateProductDto,
  ProductQueryDto,
  ProductResponseDto,
  ProductListDto,
  GetProductByIdDto,
  DeleteProductDto,
} from '@app/common/dto/product.dto';
import { UserDeletedEvent } from '@app/common/dto/auth.dto';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class ProductServiceService {
  private readonly logger = new Logger(ProductServiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  //  CREATE
  // ═══════════════════════════════════════════════════════════════════════════

  async create(
    payload: CreateProductDto & { createdByUserId: string },
  ): Promise<ProductResponseDto> {
    const product = await this.prisma.product.create({
      data: {
        name: payload.name,
        description: payload.description,
        price: payload.price,
        stock: payload.stock ?? 0,
        createdByUserId: payload.createdByUserId,
      },
    });

    this.logger.log(`Product created: id=${product.id} by userId=${payload.createdByUserId}`);
    return this.toResponse(product);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  GET BY ID
  // ═══════════════════════════════════════════════════════════════════════════

  async getById(payload: GetProductByIdDto): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: payload.id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponse(product);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  GET LIST (với pagination và filter)
  // ═══════════════════════════════════════════════════════════════════════════

  async getList(payload: ProductQueryDto): Promise<ProductListDto> {
    const page = Math.max(payload.page ?? 1, 1);
    const take = Math.min(payload.take ?? 20, 100);
    const skip = (page - 1) * take;
    const orderByField = payload.orderBy || 'createdAt';
    const sortOrder = payload.sortBy || 'desc';

    const where = {
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      ...(payload.createdByUserId && {
        createdByUserId: payload.createdByUserId,
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: take,
        orderBy: { [orderByField]: sortOrder },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map(this.toResponse),
      total,
      page,
      limit: take,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  UPDATE
  // ═══════════════════════════════════════════════════════════════════════════

  async update(payload: any): Promise<ProductResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: payload.id },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (product.createdByUserId !== payload.requesterId) {
      throw new ForbiddenException('You do not have permission to update this product');
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

  async delete(payload: DeleteProductDto): Promise<{ message: string }> {
    const product = await this.prisma.product.findUnique({
      where: { id: payload.id },
    });

    if (!product) throw new NotFoundException('Product not found');

    if (product.createdByUserId !== payload.requesterId) {
      throw new ForbiddenException('You do not have permission to delete this product');
    }

    await this.prisma.product.delete({
      where: { id: payload.id },
    });

    this.logger.log(`Product soft-deleted: id=${payload.id}`);
    return { message: 'Product deleted successfully' };
  }

  async handleUserDeleted(event: UserDeletedEvent): Promise<void> {
    const result = await this.prisma.product.deleteMany({
      where: {
        createdByUserId: event.userId,
      },
    });

    this.logger.log(
      `[user.deleted] Soft-deleted ${result.count} products for userId=${event.userId}`,
    );
  }

  private toResponse(product: any): ProductResponseDto {
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
