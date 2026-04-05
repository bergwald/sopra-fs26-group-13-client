export interface User {
  id: number;
  name: string;
  username: string;
  bio: string;
  token?: string;
  status: "ONLINE" | "OFFLINE" | string;
  creationDate?: string;
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
