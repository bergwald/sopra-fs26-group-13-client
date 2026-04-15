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

export interface UserSelfUpdateRequest {
  bio?: string;
  newPassword?: string;
  mascot_id?: number;
}

export interface SessionUser {
  user_id: number;
  session_id: string;
}

export interface GameSession {
  session_id: string;
  expiry_date: string;
  round_number: number;
  total_rounds: number;
  mode: "singleplayer" | "multiplayer";
}

export interface GameData {
  wikidata_url: string;
  round_number: number;
  latitude: number;
  longitude: number;
  location_name?: string;
  expiry_date: string;
}

export interface UserGuess {
  user_id: number;
  session_id: string;
  round_number: number;
  latitude: number;
  longitude: number;
}

export interface GameResult {
  username: string;
  score: number;
}
