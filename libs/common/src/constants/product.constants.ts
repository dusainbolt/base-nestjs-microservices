export const PRODUCT_COMMANDS = {
  // CRUD via RPC
  CREATE: 'PRODUCT_CREATE',
  GET_BY_ID: 'PRODUCT_GET_BY_ID',
  GET_LIST: 'PRODUCT_GET_LIST',
  UPDATE: 'PRODUCT_UPDATE',
  DELETE: 'PRODUCT_DELETE',

  // Batch fetch for API Composition (createdBy enrichment)
  GET_LIST_BY_USER: 'PRODUCT_GET_LIST_BY_USER',
} as const;

/** Domain Events — routing keys trên topic exchange 'domain.events' */
export const DOMAIN_EVENTS = {
  USER_DELETED: 'user.deleted',
  USER_UPDATED: 'user.updated',
} as const;

export const DOMAIN_EXCHANGE = 'domain.events';
