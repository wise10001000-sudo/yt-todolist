// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

// Todo Types
export interface Todo {
  id: string;
  title: string;
  content?: string;
  startDate?: string;
  endDate: string;
  status: 'active' | 'trash';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateTodoRequest {
  title: string;
  content?: string;
  startDate?: string;
  endDate: string;
}

export interface UpdateTodoRequest {
  title?: string;
  content?: string;
  startDate?: string;
  endDate?: string;
}

export interface TodoListResponse {
  todos: Todo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Public Holiday Types
export interface PublicHoliday {
  id: string;
  title: string;
  holidayDate: string;
  type: 'national' | 'memorial';
  isRecurring: boolean;
  createdAt: string;
}

export interface CalendarItem {
  type: 'todo' | 'holiday';
  id: string;
  title: string;
  startDate?: string;
  endDate?: string;
  date?: string;
  editable: boolean;
}

export interface CalendarResponse {
  items: CalendarItem[];
}

// Trash Types
export interface TrashListResponse {
  todos: Todo[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}