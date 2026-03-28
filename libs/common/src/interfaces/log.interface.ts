export enum LogType {
  HTTP = 'HTTP_API_LOG',
  BUSINESS = 'BUSINESS_LOG',
  AUTH = 'AUTH_LOG',
  SYSTEM = 'SYSTEM_INFRA_LOG',
  ERROR = 'ERROR_EXCEPTION_LOG',
}

export interface HttpLogContext {
  method: string;
  url: string;
  statusCode: number;
  latencyMs: number;
  userId?: string;
  ip: string;
  [key: string]: any;
}

export interface BusinessLogContext {
  action: string;
  entityId: string;
  status: string;
  [key: string]: any;
}

export interface AuthLogContext {
  event: string;
  userId?: string;
  [key: string]: any;
}

export interface SystemLogContext {
  cpuUsagePercentage?: number;
  ramUsageMb?: number;
  connectionStatus?: string;
  [key: string]: any;
}

export interface ErrorLogContext {
  errorCode: string;
  inputPayload?: any;
  [key: string]: any;
}

export type LogContextVariant =
  | HttpLogContext
  | BusinessLogContext
  | AuthLogContext
  | SystemLogContext
  | ErrorLogContext
  | Record<string, any>;

export interface StandardLogPayload {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  traceId: string;
  message: string;
  logType: LogType;
  context?: LogContextVariant;
  exception?: {
    stack: string;
  };
}
