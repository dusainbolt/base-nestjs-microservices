import {
  CreateProfileDto,
  UserProfileResponseDto,
  UpdateProfileDto,
  UserBasicInfoDto,
} from '@app/common/dto/user.dto';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MEDIA_COMMANDS, MEDIA_SERVICE } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { MediaResponseDto, ReferType } from '@app/common/dto/media.dto';

@Injectable()
export class UserServiceService {
  private readonly logger = new Logger(UserServiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(MEDIA_SERVICE) private readonly mediaClient: ClientProxy,
  ) {}

  // ─── UPDATE AVATAR (Orchestration) ──────────────────────────────────────────

  async updateAvatar(payload: {
    userId: string;
    mediaId: string;
  }): Promise<UserProfileResponseDto> {
    const { userId, mediaId } = payload;

    // 1. Sang Media Service lấy path
    const media: MediaResponseDto = await lastValueFrom(
      this.mediaClient.send({ cmd: MEDIA_COMMANDS.GET_BY_ID }, { id: mediaId }),
    );

    // 2. Cập nhật database của chính nó
    const updated = await this.prisma.userProfile.update({
      where: { id: userId },
      data: { avatar: media.path },
    });

    // 3. Quay lại Media Service chốt hạ mark used
    await lastValueFrom(
      this.mediaClient.send(
        { cmd: MEDIA_COMMANDS.MARK_USED },
        {
          id: media.id,
          referType: ReferType.USER_AVATAR,
          referId: userId,
        },
      ),
    );

    this.logger.log(`Avatar updated for userId=${userId}, mediaId=${mediaId}`);
    return this.toResponse(updated);
  }

  // ─── CREATE PROFILE ───────────────────────────────────────────────────────

  async createProfile(payload: CreateProfileDto): Promise<void> {
    const { id, email, username, firstName = '', lastName = '' } = payload;

    const exists = await this.prisma.userProfile.findUnique({
      where: { id },
      select: { id: true },
    });

    if (exists) {
      this.logger.warn(`Profile already exists for userId=${id}, skipping.`);
      return;
    }

    await this.prisma.userProfile.create({
      data: {
        id,
        email,
        username,
        firstName,
        lastName,
      },
    });

    this.logger.log(`Profile created for userId=${id} (${email})`);
  }

  // ─── GET PROFILE ──────────────────────────────────────────────────────────

  async getProfile(payload: {
    userId: string;
  }): Promise<UserProfileResponseDto> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: payload.userId },
    });

    if (!profile) throw new NotFoundException('User profile not found');

    return this.toResponse(profile);
  }

  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────

  async updateProfile(
    payload: UpdateProfileDto & { userId: string },
  ): Promise<UserProfileResponseDto> {
    const { userId, ...data } = payload;

    const exists = await this.prisma.userProfile.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!exists) throw new NotFoundException('User profile not found');

    const updated = await this.prisma.userProfile.update({
      where: { id: userId },
      data,
    });

    this.logger.log(`Profile updated for userId=${userId}`);
    return this.toResponse(updated);
  }

  // ─── GET PROFILES BY IDS (batch — dùng cho relation enrichment) ──────────

  async getProfilesByIds(payload: {
    userIds: string[];
  }): Promise<UserBasicInfoDto[]> {
    const { userIds } = payload;

    if (!userIds || userIds.length === 0) return [];

    const profiles = await this.prisma.userProfile.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    return profiles.map((p) => ({
      id: p.id,
      email: p.email,
      username: p.username,
      firstName: p.firstName,
      lastName: p.lastName,
      avatar: p.avatar ?? undefined,
    }));
  }

  // ─── DELETE PROFILE ───────────────────────────────────────────────────────

  async deleteProfile(userId: string): Promise<void> {
    await this.prisma.userProfile
      .delete({ where: { id: userId } })
      .catch(() => {});

    this.logger.log(`Profile deleted for userId=${userId}`);
  }

  private toResponse(p: any): UserProfileResponseDto {
    return {
      id: p.id,
      email: p.email,
      username: p.username,
      firstName: p.firstName,
      lastName: p.lastName,
      avatar: p.avatar,
      bio: p.bio,
      phone: p.phone,
      address: p.address,
      timezone: p.timezone,
      locale: p.locale,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
