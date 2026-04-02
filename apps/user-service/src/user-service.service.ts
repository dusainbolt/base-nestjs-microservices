import {
  CreateProfilePayload,
  GetProfilePayload,
  UpdateProfilePayload,
  UserProfileResponse,
} from '@app/common';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class UserServiceService {
  private readonly logger = new Logger(UserServiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── CREATE PROFILE  (event từ auth-service sau register) ─────────────────

  async createProfile(payload: CreateProfilePayload): Promise<void> {
    const { id, email, username, firstName = '', lastName = '' } = payload;

    // Idempotent: nếu profile đã tồn tại thì bỏ qua (tránh lỗi khi retry message)
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

  async getProfile(payload: GetProfilePayload): Promise<UserProfileResponse> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id: payload.userId },
    });

    if (!profile) throw new NotFoundException('User profile not found');

    return this.toResponse(profile);
  }

  // ─── UPDATE PROFILE ───────────────────────────────────────────────────────

  async updateProfile(
    payload: UpdateProfilePayload,
  ): Promise<UserProfileResponse> {
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

  // ─── DELETE PROFILE  (idempotent — subscribe từ domain exchange) ─────────
  //  auth-service đã emit user.deleted lên exchange,
  //  user-service chỉ cần xử lý phần của mình: xoá profile. Không relay gì thêm.

  async deleteProfile(userId: string): Promise<void> {
    await this.prisma.userProfile
      .delete({ where: { id: userId } })
      .catch(() => { /* idempotent: bỏ qua nếu không tồn tại */ });

    this.logger.log(`Profile deleted for userId=${userId}`);
  }

  // ─── Mapper ───────────────────────────────────────────────────────────────

  /**
   * Chuyển đổi từ Prisma Entity sang Common Response Interface.
   * Điều này đảm bảo tính đóng gói (encapsulation).
   */
  private toResponse(p: UserProfileResponse): UserProfileResponse {
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
