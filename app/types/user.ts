export interface User {
  id: number;
  username: string;
  bio: string;
  creationDate: string;
  status?: string;
  // score: number;
  // creation_date: string;
  // game_count: number;
  // win_rate: number;
  // average_distance: number;
  // mascot_id: number;
}

export interface AuthResponse {
  id: number;
  username: string;
  bio: string;
  token: string;
  status: string;
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
  panorama_id: string;
  round_number: number;
  latitude: number;
  longitude: number;
  expiry_date: string;
  // wikidata_url: string;
  // location_name?: string;
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

export interface BackendSessionUserDetails {
  id: number;
  sessionId: string;
  sessionExpiryDateTime: string;
  roundNumber: number;
  score: number;
  userRole: "OWNER" | "PLAYER";
}

export interface BackendGameData {
  imageUrl: string;
  roundNumber: number;
  sessionId: string;
}

export interface GameRoundResult {
  round_number: number;
  distance: number;
  scoreRound: number;
  scoreOverall: number;
  latitude: number;
  longitude: number;
}
