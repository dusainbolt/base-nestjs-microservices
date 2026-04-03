import { USER_COMMANDS } from '../constants/user.constants';
import { UserBasicInfoDto, UserRelation } from '../dto/user.dto';
import { rpcToHttp } from '../utils/rpc-to-http.util';
import { ClientProxy } from '@nestjs/microservices';
import { map, of, switchMap, OperatorFunction } from 'rxjs';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserFieldMap = {
  from: string; // field chứa userId trên item
  to: string;   // field để ghi UserBasicInfoDto vào
};

// ─── Mapping config ───────────────────────────────────────────────────────────
// Thêm relation mới chỉ cần thêm 1 dòng ở đây, không đụng gì khác.

const USER_RELATION_FIELDS: Record<UserRelation, UserFieldMap> = {
  [UserRelation.CREATED_BY]: { from: 'createdByUserId', to: 'createdByUser' },
  [UserRelation.UPDATED_BY]: { from: 'updatedByUserId', to: 'updatedByUser' },
};

export const resolveUserFields = (include: UserRelation[]): UserFieldMap[] =>
  include.map((r) => USER_RELATION_FIELDS[r]).filter(Boolean);

// ─── Private helpers ──────────────────────────────────────────────────────────

/** Batch fetch rồi trả về Map<userId, UserBasicInfoDto> để lookup O(1). */
const fetchUserMap = (userClient: ClientProxy, userIds: string[]) =>
  userClient
    .send({ cmd: USER_COMMANDS.GET_PROFILES_BY_IDS }, { userIds })
    .pipe(
      rpcToHttp(),
      map((users: UserBasicInfoDto[]) => new Map(users.map((u) => [u.id, u]))),
    );

/** Thu thập tất cả unique userIds từ nhiều items × nhiều fields — 1 lần duy nhất. */
const collectUserIds = (items: any[], fields: UserFieldMap[]): string[] =>
  [
    ...new Set(
      items.flatMap((item) => fields.map((f) => item[f.from])).filter(Boolean),
    ),
  ] as string[];

/** Trả về item mới (immutable) với các user fields đã được map vào. */
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

// ─── Public operators ─────────────────────────────────────────────────────────

/**
 * RxJS operator — enrich paginated list response với user info.
 * Hỗ trợ cả plain array lẫn { items, total, page, limit }.
 *
 *   const fields = resolveUserFields(include);
 *   products$.pipe(enrichListWithUser(this.userClient, fields))
 */
export function enrichListWithUser(
  userClient: ClientProxy,
  fields: UserFieldMap[],
): OperatorFunction<any, any> {
  return switchMap((result: any) => {
    const items: any[] = Array.isArray(result) ? result : result.items;
    const userIds = collectUserIds(items, fields);

    if (userIds.length === 0) return of(result);

    return fetchUserMap(userClient, userIds).pipe(
      map((userMap) => {
        const enriched = items.map((item) => applyUserMap(item, userMap, fields));
        return Array.isArray(result) ? enriched : { ...result, items: enriched };
      }),
    );
  });
}

/**
 * RxJS operator — enrich single item response với user info.
 * Reuse toàn bộ helpers, không duplicate logic.
 *
 *   const fields = resolveUserFields(include);
 *   product$.pipe(enrichSingleWithUser(this.userClient, fields))
 */
export function enrichSingleWithUser(
  userClient: ClientProxy,
  fields: UserFieldMap[],
): OperatorFunction<any, any> {
  return switchMap((item: any) => {
    const userIds = collectUserIds([item], fields);

    if (userIds.length === 0) return of(item);

    return fetchUserMap(userClient, userIds).pipe(
      map((userMap) => applyUserMap(item, userMap, fields)),
    );
  });
}
