// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Domain types
export interface ITodo {
  id: string;
  title: string;
  content: string | null;
  startDate: string | null;
  endDate: string;
  status: 'active' | 'trash';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


// Environment configuration type
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN: string;
}
