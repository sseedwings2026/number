
export interface GameState {
  target: number;
  guesses: number[];
  feedback: string;
  isGameOver: boolean;
  attempts: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: string;
}
