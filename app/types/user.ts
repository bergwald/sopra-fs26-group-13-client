export interface User {
  id: number;
  username: string;
  bio: string;
  creationDate: string;
  mascot_id?: number | null;
  rounds_played?: number | null;
  avg_distance?: number | null;
  avg_score?: number | null;
}

export interface AuthResponse {
  id: number;
  username: string;
  bio: string;
  token: string;
  mascot_id?: number | null;
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
  round_started: string;
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
  username: string;
  userRole: string;
  roundNumber: number;
  score: number;

  guessSubmitted: boolean;
  guessLatitude: number;
  guessLongitude: number;
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
  guessLatitude: number;
  guessLongitude: number;
}
