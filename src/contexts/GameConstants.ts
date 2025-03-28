import { IBetDTO, IUserBetHistory } from "../models";

// Game phases
export enum GamePhase {
  Running = "running",
  Betting = "betting",
  Crash = "crash",
}

// Helper functions for loading/generating user data
export const loadOrGenerateUserId = (): string => {
  const storedUserId = sessionStorage.getItem("userId");
  if (storedUserId) return storedUserId;

  const newUserId = `user-${Math.floor(Math.random() * 10000)}`;
  sessionStorage.setItem("userId", newUserId);
  return newUserId;
};

export const loadUserBetHistory = (): IUserBetHistory[] => {
  const storedHistory = sessionStorage.getItem("userBetHistory");
  if (storedHistory) {
    try {
      return JSON.parse(storedHistory);
    } catch {
      return [];
    }
  }
  return [];
};

export const loadBetsHistory = (): IBetDTO[] => {
  const storedHistory = sessionStorage.getItem("betsHistory");
  if (storedHistory) {
    try {
      return JSON.parse(storedHistory);
    } catch {
      return [];
    }
  }
  return [];
};
