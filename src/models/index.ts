export interface IBetDTO {
  userId: string;
  amount: number;
  cashoutAt: number;
  prize: number;
}

export interface IHistoryCandles {
  crashPoint: number; // multiplier at which crash ocurred
  timestamp: number;
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
