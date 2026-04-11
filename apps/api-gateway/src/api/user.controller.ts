import {
  ApiHandleResponse,
  CurrentUser,
  JwtPayload,
  rpcToHttp,
  UpdateProfileDto,
  USER_COMMANDS,
  USER_SERVICE,
} from '@app/common';

import { UpdateAvatarDto, UserProfileResponseDto } from '@app/common/dto/user.dto';
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Patch } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('User')
@Controller('users')
@Throttle({ default: { limit: 60, ttl: 60000 } })
export class UserController {
  constructor(@Inject(USER_SERVICE) private readonly userClient: ClientProxy) {}

  @Patch('me/avatar')
  @ApiHandleResponse({
    summary: 'Update current user avatar using an existing media ID',
    type: UserProfileResponseDto,
  })
  async updateMyAvatar(@Body() body: UpdateAvatarDto, @CurrentUser() user: JwtPayload) {
    return this.userClient
      .send(
        { cmd: USER_COMMANDS.UPDATE_AVATAR },
        {
          userId: user.sub,
          mediaId: body.mediaId,
        },
      )
      .pipe(rpcToHttp());
  }

  /** GET /users/me — lấy profile đầy đủ của user hiện tại */

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
  updateMyProfile(@Body() body: UpdateProfileDto, @CurrentUser() user: JwtPayload) {
    return this.userClient
      .send({ cmd: USER_COMMANDS.UPDATE_PROFILE }, { ...body, userId: user.sub })
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
