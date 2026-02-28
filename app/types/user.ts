export interface User {
  id: number;
  name: string;
  username: string;
  bio: string;
  token?: string;
  status: "ONLINE" | "OFFLINE" | string;
}

export interface RegisterRequest {
  name: string;
  username: string;
  password: string;
  bio?: string;
}
