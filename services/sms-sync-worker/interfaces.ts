// User Service - TypeScript Interfaces
// Domain-specific types for user management


export interface ApiError {
  status: 'error' | 'fail';
  message: string;
  statusCode: number;
}

export interface HealthResponse {
  status: 'success';
  message: string;
  service: string;
  timestamp: string;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
}

// Configuration interfaces
export interface DatabaseConfig {
  url?: string;
  logQueries: boolean;
  logSlowQueries: boolean;
  slowQueryThreshold: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface CorsConfig {
  origin: string;
  credentials: boolean;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface LoggingConfig {
  level: string;
  format: string;
}

export interface SecurityConfig {
  bcryptRounds: number;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  serviceName: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  logging: LoggingConfig;
  security: SecurityConfig;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}

// Prisma middleware types
export interface PrismaQueryParams {
  model?: string;
  action: string;
  args?: any;
  dataPath?: string[];
  runInTransaction?: boolean;
}

export interface PrismaQueryEvent {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
}

export interface PrismaLogEvent {
  timestamp: Date;
  message: string;
  target: string;
}
