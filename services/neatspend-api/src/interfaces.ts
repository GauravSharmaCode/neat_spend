// NeatSpend API Gateway - TypeScript Interfaces  
// API Gateway specific types and DTOs

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  status: string;
  token: string;
  data: {
    user: UserDTO;
  };
}

export interface ApiRequest<T = unknown> {
  body: T;
  params: Record<string, string>;
  query: Record<string, unknown>;
  headers: Record<string, string>;
  user?: UserDTO;
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error' | 'fail';
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  status: 'success';
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ServiceConfig {
  userService: string;
  smsService: string;
  insightService: string;
}

export interface ProxyRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface ProxyResponse {
  statusCode: number;
  headers: Record<string, string>;
  data: unknown;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  responseTime?: number | undefined;
  error?: string;
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
  services?: Record<string, HealthCheck>;
}

export interface ApiError {
  status: 'error' | 'fail';
  message: string;
  statusCode: number;
  errors?: string[];
  stack?: string;
}

// Configuration interfaces
export interface ServiceUrls {
  userService: string;
  smsService: string;
  insightService: string;
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

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface SecurityConfig {
  bcryptRounds: number;
}

export interface ApiGatewayConfig {
  port: number;
  nodeEnv: string;
  services: ServiceUrls;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  logging: LoggingConfig;
  jwt: JwtConfig;
  security: SecurityConfig;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
}
