import { PRODUCT_COMMANDS, RmqInterceptor, DOMAIN_EVENTS } from '@app/common';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
  GetProductByIdDto,
  DeleteProductDto,
} from '@app/common/dto/product.dto';
import { UserDeletedEvent } from '@app/common/dto/auth.dto';
import { Controller, UseInterceptors } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ProductServiceService } from './product-service.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class ProductServiceController {
  constructor(
    private readonly productService: ProductServiceService,
    private readonly prisma: PrismaService,
  ) {}

  @MessagePattern({ cmd: PRODUCT_COMMANDS.PING })
  async ping() {
    let dbStatus = 'up';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'down';
    }
    return { db: dbStatus };
  }

  // ─── RPC Handlers (api-gateway → product-service) ─────────────────────────

  @MessagePattern({ cmd: PRODUCT_COMMANDS.CREATE })
  create(@Payload() data: CreateProductDto & { createdByUserId: string }) {
    return this.productService.create(data);
  }

  @MessagePattern({ cmd: PRODUCT_COMMANDS.GET_BY_ID })
  getById(@Payload() data: GetProductByIdDto) {
    return this.productService.getById(data);
  }

  @MessagePattern({ cmd: PRODUCT_COMMANDS.GET_LIST })
  getList(@Payload() data: ProductQueryDto) {
    return this.productService.getList(data);
  }

  @MessagePattern({ cmd: PRODUCT_COMMANDS.UPDATE })
  update(
    @Payload() data: UpdateProductDto & { requesterId: string; id: string },
  ) {
    return this.productService.update(data);
  }

  @MessagePattern({ cmd: PRODUCT_COMMANDS.DELETE })
  delete(@Payload() data: DeleteProductDto) {
    return this.productService.delete(data);
  }

  // ─── Domain Event Handlers (Exchange Pub/Sub) ──────────────────────────────

  @EventPattern(DOMAIN_EVENTS.USER_DELETED)
  handleUserDeleted(@Payload() event: UserDeletedEvent) {
    return this.productService.handleUserDeleted(event);
  }
}
