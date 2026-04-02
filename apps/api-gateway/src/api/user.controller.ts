import {
  AUTH_COMMANDS,
  AUTH_SERVICE,
  CurrentUser,
  JwtPayload,
  rpcToHttp,
  UpdateProfilePayload,
  USER_COMMANDS,
  USER_SERVICE,
} from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
@Controller('users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  /** GET /users/me — lấy profile đầy đủ của user hiện tại */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.userClient
      .send({ cmd: USER_COMMANDS.GET_PROFILE }, { userId: user.sub })
      .pipe(rpcToHttp());
  }

  /** PATCH /users/me — cập nhật profile */
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  updateMyProfile(
    @Body() body: Omit<UpdateProfilePayload, 'userId'>,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userClient
      .send(
        { cmd: USER_COMMANDS.UPDATE_PROFILE },
        { ...body, userId: user.sub },
      )
      .pipe(rpcToHttp());
  }

  /** GET /users/:id — public profile (có thể thêm @Public() nếu muốn) */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getProfile(@Param('id') id: string) {
    return this.userClient
      .send({ cmd: USER_COMMANDS.GET_PROFILE }, { userId: id })
      .pipe(rpcToHttp());
  }
}
