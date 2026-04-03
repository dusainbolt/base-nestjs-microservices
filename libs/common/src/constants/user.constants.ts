export const USER_COMMANDS = {
  // System / Demo
  PING: 'ping',
  WELCOME: 'welcome',
  TRIGGER_ERROR: 'trigger-error',

  // Profile CRUD
  CREATE_PROFILE: 'CREATE_PROFILE', // event từ auth-service sau khi register
  GET_PROFILE: 'GET_PROFILE',
  GET_PROFILES_BY_IDS: 'GET_PROFILES_BY_IDS', // batch fetch để enrich relation
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  DELETE_PROFILE: 'DELETE_PROFILE',
} as const;
