export interface IBetDTO {
  userId: string;
  amount: number;
  cashoutAt: number;
  prize: number;
  timestamp?: number; // Add timestamp to track when bets were created
}

export interface IHistoryCandles {
  crashPoint: number; // multiplier at which crash ocurred
  timestamp: number;
}

// New interface for user bet history
export interface IUserBetHistory extends IBetDTO {
  timestamp: number;
  gameCrashPoint?: number; // The crash point of the game this bet was placed in
  status: "win" | "loss" | "cancelled"; // Outcome of the bet
}

export interface IPlaceBetDTO {
  userId: string;
  value: number;
}

export interface ICashoutDTO {
  userId: string;
}

enum GamePhase {
  Running = "running",
  Betting = "betting",
  Crash = "crash",
}

export interface IGameEvent {
  type: GamePhase;
  data: {
    phase: GamePhase;
    multiplier: number;
    nextGameAt: number;
    bets: IBetDTO[];
    history: IHistoryCandles[];
  };
}
