import {
  CreateProductPayload,
  DeleteProductPayload,
  GetProductByIdPayload,
  GetProductListPayload,
  PRODUCT_COMMANDS,
  RmqInterceptor,
  UpdateProductPayload,
  UserDeletedEvent,
  DOMAIN_EVENTS,
} from '@app/common';
import { Controller, UseInterceptors } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ProductServiceService } from './product-service.service';

@Controller()
@UseInterceptors(RmqInterceptor)
export class ProductServiceController {
  constructor(private readonly productService: ProductServiceService) {}

  // ─── RPC Handlers (api-gateway → product-service) ─────────────────────────

  @MessagePattern({ cmd: PRODUCT_COMMANDS.CREATE })
  create(@Payload() data: CreateProductPayload) {
    return this.productService.create(data);
  }

  @MessagePattern({ cmd: PRODUCT_COMMANDS.GET_BY_ID })
  getById(@Payload() data: GetProductByIdPayload) {
    return this.productService.getById(data);
  }

  @MessagePattern({ cmd: PRODUCT_COMMANDS.GET_LIST })
  getList(@Payload() data: GetProductListPayload) {
    return this.productService.getList(data);
  }

  @MessagePattern({ cmd: PRODUCT_COMMANDS.UPDATE })
  update(@Payload() data: UpdateProductPayload) {
    return this.productService.update(data);
  }

  @MessagePattern({ cmd: PRODUCT_COMMANDS.DELETE })
  delete(@Payload() data: DeleteProductPayload) {
    return this.productService.delete(data);
  }

  // ─── Domain Event Handlers (Exchange Pub/Sub) ──────────────────────────────

  /**
   * Lắng nghe event user.deleted từ RabbitMQ Topic Exchange 'domain.events'.
   * Soft-delete toàn bộ sản phẩm của user bị xoá.
   * Handler này PHẢI idempotent.
   */
  @EventPattern(DOMAIN_EVENTS.USER_DELETED)
  handleUserDeleted(@Payload() event: UserDeletedEvent) {
    return this.productService.handleUserDeleted(event);
  }
}
