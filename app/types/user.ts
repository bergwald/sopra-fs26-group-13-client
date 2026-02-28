export interface User {
  id: number;
  name: string;
  username: string;
  bio: string;
  token?: string;
  status: "ONLINE" | "OFFLINE" | string;
}
