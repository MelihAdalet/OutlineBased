export interface Country {
  name: string;
  code: string;
  // path and viewBox are removed as we now use external images
}

export interface ScoreEntry {
  name: string;
  score: number;
  date: string;
}

export type GameState = 'landing' | 'playing' | 'gameover' | 'leaderboard';

export interface HintResponse {
  text: string;
  mapLink?: string;
  placeName?: string;
}

export interface GuessHistoryItem {
  countryName: string;
  userGuess: string;
  correct: boolean;
}