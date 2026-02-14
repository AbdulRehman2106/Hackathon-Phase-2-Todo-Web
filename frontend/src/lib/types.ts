// User types
export interface User {
  id: number;
  email: string;
  created_at: string;
  updated_at: string;
}

// Subtask types
export interface Subtask {
  id: number;
  task_id: number;
  title: string;
  completed: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

// Task types
export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  completed: boolean;
  category: string | null;
  due_date: string | null;
  priority: string | null;
  is_recurring: boolean;
  recurrence_type: string | null;
  recurrence_interval: number | null;
  recurrence_end_date: string | null;
  parent_task_id: number | null;
  created_at: string;
  updated_at: string;
  subtasks?: Subtask[];
}

// API Request/Response types
export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  category?: string | null;
  due_date?: string | null;
  priority?: string | null;
  is_recurring?: boolean;
  recurrence_type?: string | null;
  recurrence_interval?: number;
  recurrence_end_date?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  completed?: boolean;
  category?: string | null;
  due_date?: string | null;
  priority?: string | null;
  is_recurring?: boolean;
  recurrence_type?: string | null;
  recurrence_interval?: number;
  recurrence_end_date?: string | null;
}

export interface CreateSubtaskPayload {
  title: string;
  order?: number;
}

export interface UpdateSubtaskPayload {
  title?: string;
  completed?: boolean;
  order?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignUpRequest {
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

// Password Reset types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  email?: string;
  error?: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// API Error types
export interface APIError {
  error: string;
  details?: string;
}

// Task list response
export interface TaskListResponse {
  tasks: Task[];
}

// Chat types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
}

export interface ConversationHistory {
  conversation_id: string;
  messages: ChatMessage[];
}
