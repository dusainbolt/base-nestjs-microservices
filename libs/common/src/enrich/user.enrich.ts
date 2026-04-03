import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Redis from 'ioredis';
import { from, map, of, switchMap, OperatorFunction } from 'rxjs';

import { USER_SERVICE } from '../constants/services';
import { USER_COMMANDS } from '../constants/user.constants';
import { UserBasicInfoDto, UserRelation } from '../dto/user.dto';
import { REDIS_CLIENT, REDIS_KEYS, REDIS_TTL } from '../redis/redis.constants';
import { rpcToHttp } from '../utils/rpc-to-http.util';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserFieldMap = {
  from: string; // field chứa userId trên item
  to: string; // field để ghi UserBasicInfoDto vào
};

// ─── Mapping config ───────────────────────────────────────────────────────────

const USER_RELATION_FIELDS: Record<UserRelation, UserFieldMap> = {
  [UserRelation.CREATED_BY]: { from: 'createdByUserId', to: 'createdByUser' },
  [UserRelation.UPDATED_BY]: { from: 'updatedByUserId', to: 'updatedByUser' },
};

// ─── Pure helpers (không phụ thuộc DI) ────────────────────────────────────────

export const resolveUserFields = (include: UserRelation[]): UserFieldMap[] =>
  include.map((r) => USER_RELATION_FIELDS[r]).filter(Boolean);

const collectUserIds = (items: any[], fields: UserFieldMap[]): string[] =>
  [
    ...new Set(
      items.flatMap((item) => fields.map((f) => item[f.from])).filter(Boolean),
    ),
  ] as string[];

const applyUserMap = (
  item: any,
  userMap: Map<string, UserBasicInfoDto>,
  fields: UserFieldMap[],
): any => ({
  ...item,
  ...Object.fromEntries(
    fields
      .filter((f) => item[f.from])
      .map((f) => [f.to, userMap.get(item[f.from])]),
  ),
});

// ─── Injectable Service ───────────────────────────────────────────────────────

@Injectable()
export class UserEnrichService {
  constructor(
    @Inject(USER_SERVICE) private readonly userClient: ClientProxy,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * RxJS operator — enrich paginated list (hoặc plain array) với user info.
   *
   *   products$.pipe(this.userEnrich.list(fields))
   */
  list(fields: UserFieldMap[]): OperatorFunction<any, any> {
    return switchMap((result: any) => {
      const items: any[] = Array.isArray(result) ? result : result.items;
      const userIds = collectUserIds(items, fields);

      if (userIds.length === 0) return of(result);

      return this.fetchUserMap(userIds).pipe(
        map((userMap) => {
          const enriched = items.map((item) =>
            applyUserMap(item, userMap, fields),
          );
          return Array.isArray(result)
            ? enriched
            : { ...result, items: enriched };
        }),
      );
    });
  }

  /**
   * RxJS operator — enrich single item với user info.
   *
   *   product$.pipe(this.userEnrich.single(fields))
   */
  single(fields: UserFieldMap[]): OperatorFunction<any, any> {
    return switchMap((item: any) => {
      const userIds = collectUserIds([item], fields);

      if (userIds.length === 0) return of(item);

      return this.fetchUserMap(userIds).pipe(
        map((userMap) => applyUserMap(item, userMap, fields)),
      );
    });
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private fetchUserMap(userIds: string[]) {
    return from(this.fetchUsersWithCache(userIds));
  }

  private async fetchUsersWithCache(
    userIds: string[],
  ): Promise<Map<string, UserBasicInfoDto>> {
    // ── 1. Check Redis ────────────────────────────────────────────────────
    const keys = userIds.map((id) => REDIS_KEYS.ENRICH.USER_BASIC(id));
    const raw = await this.redis.mget(...keys);

    const cached: UserBasicInfoDto[] = raw
      .filter((v): v is string => v !== null)
      .map((v) => JSON.parse(v));

    const foundIds = new Set(cached.map((u) => u.id));
    const missingIds = userIds.filter((id) => !foundIds.has(id));

    // ── 2. RPC cho những id còn thiếu ─────────────────────────────────────
    let fetched: UserBasicInfoDto[] = [];
    if (missingIds.length > 0) {
      fetched = await new Promise<UserBasicInfoDto[]>((resolve) => {
        this.userClient
          .send(
            { cmd: USER_COMMANDS.GET_PROFILES_BY_IDS },
            { userIds: missingIds },
          )
          .pipe(rpcToHttp())
          .subscribe({
            next: (val) => resolve(val),
            error: () => resolve([]),
          });
      });

      // ── 3. Ghi cache (pipeline — fire-and-forget) ───────────────────────
      if (fetched.length > 0) {
        const pipe = this.redis.pipeline();
        for (const u of fetched) {
          pipe.set(
            REDIS_KEYS.ENRICH.USER_BASIC(u.id),
            JSON.stringify(u),
            'EX',
            REDIS_TTL.ENRICH_USER,
          );
        }
        pipe.exec().catch(() => {});
      }
    }

    // ── 4. Merge & return Map ─────────────────────────────────────────────
    const all = [...cached, ...fetched];
    return new Map(all.map((u) => [u.id, u]));
  }
}
