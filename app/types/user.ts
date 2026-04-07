export interface User {
  username: string;
  score: number;
  creation_date: string;
  bio: string;
  game_count: number;
  win_rate: number;
  average_distance: number;
  mascot_id: number;
}

export interface RegisterRequest {
  username: string;
  password: string;
  bio?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ChangePasswordRequest {
  newPassword: string;
}
