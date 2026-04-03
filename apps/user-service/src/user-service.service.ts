import {
  CreateProfileDto,
  UserProfileResponseDto,
  UpdateProfileDto,
} from '@app/common/dto/user.dto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class UserServiceService {
  private readonly logger = new Logger(UserServiceService.name);

  constructor(private readonly prisma: PrismaService) {}

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

  async getProfile(payload: { userId: string }): Promise<UserProfileResponseDto> {
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
