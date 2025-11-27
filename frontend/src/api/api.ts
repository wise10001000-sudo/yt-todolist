import api from './axios';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoListResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  TrashListResponse,
} from '../types/types';

// Authentication API
export const authAPI = {
  register: (data: RegisterRequest) => 
    api.post<ApiResponse<User>>('/auth/register', data),

  login: (data: LoginRequest) => 
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  refresh: (data: RefreshTokenRequest) => 
    api.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', data),

  logout: () => 
    api.post<ApiResponse<{ message: string }>>('/auth/logout'),
};

// Todo API
export const todoAPI = {
  getTodos: (params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => 
    api.get<ApiResponse<TodoListResponse>>('/todos', { params }),

  getTodo: (id: string) => 
    api.get<ApiResponse<{ todo: Todo }>>(`/todos/${id}`),

  createTodo: (data: CreateTodoRequest) => 
    api.post<ApiResponse<{ todo: Todo }>>('/todos', data),

  updateTodo: (id: string, data: UpdateTodoRequest) => 
    api.put<ApiResponse<{ todo: Todo }>>(`/todos/${id}`, data),

  deleteTodo: (id: string) => 
    api.delete<ApiResponse<{ message: string; todo: { id: string; status: string; deletedAt: string } }>>(`/todos/${id}`),
};

// Trash API
export const trashAPI = {
  getTrash: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<TrashListResponse>>('/todos/trash', { params }),

  restoreTodo: (id: string) =>
    api.post<ApiResponse<{ message: string; todo: { id: string; status: string; deletedAt: null } }>>(`/todos/trash/${id}/restore`),

  deletePermanently: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/todos/trash/${id}`),
};