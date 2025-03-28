import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  IBetDTO,
  IGameEvent,
  IHistoryCandles,
  IUserBetHistory,
} from "../models";
import { gameSocket } from "../services/gameSocket";
import {
  GamePhase,
  loadOrGenerateUserId,
  loadUserBetHistory,
  loadBetsHistory,
} from "./GameConstants";

// Game context state interface
interface GameState {
  phase: GamePhase;
  multiplier: number;
  nextGameAt: number | null;
  bets: IBetDTO[];
  history: IHistoryCandles[];
  isConnected: boolean;
  userId: string;
  placeBet: (amount: number) => void;
  cashout: () => void;
  cancelBet: () => void;
  userBet: IBetDTO | null;
  userBetHistory: IUserBetHistory[];
  clearBetHistory: () => void;
}

// Default game state
const defaultGameState: GameState = {
  phase: GamePhase.Betting,
  multiplier: 1.0,
  nextGameAt: null,
  bets: [],
  history: [],
  isConnected: false,
  userId: loadOrGenerateUserId(),
  placeBet: () => {},
  cashout: () => {},
  cancelBet: () => {},
  userBet: null,
  userBetHistory: loadUserBetHistory(),
  clearBetHistory: () => {},
};

const GameContext = createContext<GameState>(defaultGameState);

// Hook to use the game context
export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] =
    useState<
      Omit<
        GameState,
        | "placeBet"
        | "cashout"
        | "cancelBet"
        | "userBet"
        | "userBetHistory"
        | "clearBetHistory"
      >
    >(defaultGameState);
  const [userBet, setUserBet] = useState<IBetDTO | null>(null);
  const [userBetHistory, setUserBetHistory] = useState<IUserBetHistory[]>(
    defaultGameState.userBetHistory,
  );
  const [betsHistory, setBetsHistory] = useState<IBetDTO[]>(loadBetsHistory());
  const [lastBetTime, setLastBetTime] = useState(0);
  const [lastGameCrashPoint, setLastGameCrashPoint] = useState<number | null>(
    null,
  );
  const userId = gameState.userId;

  // Save bet history to session storage
  useEffect(() => {
    sessionStorage.setItem("userBetHistory", JSON.stringify(userBetHistory));
  }, [userBetHistory]);

  useEffect(() => {
    if (betsHistory.length > 0) {
      sessionStorage.setItem("betsHistory", JSON.stringify(betsHistory));
    }
  }, [betsHistory]);

  // Track game crashes
  useEffect(() => {
    if (
      lastGameCrashPoint !== null &&
      userBet &&
      (!userBet.prize || userBet.prize === 0)
    ) {
      // User bet but didn't cash out before crash
    }
  }, [lastGameCrashPoint, userBet]);

  // Handle game events from WebSocket
  useEffect(() => {
    const handleGameUpdate = (gameEvent: IGameEvent) => {
      if (!gameEvent || !gameEvent.data) return;

      const {
        phase = gameState.phase,
        multiplier = gameState.multiplier,
        nextGameAt = null,
        bets = [],
        history = [],
      } = gameEvent.data;

      // Update game state
      setGameState((prev) => {
        // Record crash point when game phase changes to crash
        if (prev.phase !== GamePhase.Crash && phase === GamePhase.Crash) {
          const crashPoint = multiplier;
          setLastGameCrashPoint(crashPoint);

          // Handle user bet loss on crash
          if (userBet && (!userBet.prize || userBet.prize === 0)) {
            const lostBet: IUserBetHistory = {
              ...userBet,
              timestamp: Date.now(),
              gameCrashPoint: crashPoint,
              status: "loss",
            };
            setUserBetHistory((prevHistory) => [lostBet, ...prevHistory]);
          }

          // Process all bets to find losses
          if (Array.isArray(bets)) {
            bets.forEach((bet) => {
              if (
                bet &&
                bet.userId === userId &&
                bet.amount > 0 &&
                (!bet.prize || bet.prize === 0) &&
                (!userBet || bet.amount !== userBet.amount)
              ) {
                const lostBet: IUserBetHistory = {
                  ...bet,
                  timestamp: Date.now(),
                  gameCrashPoint: crashPoint,
                  status: "loss",
                };

                setUserBetHistory((prevHistory) => {
                  // Avoid duplicate losses
                  if (
                    prevHistory.some(
                      (historyBet) =>
                        historyBet.userId === bet.userId &&
                        historyBet.amount === bet.amount &&
                        historyBet.status === "loss",
                    )
                  ) {
                    return prevHistory;
                  }
                  return [lostBet, ...prevHistory];
                });
              }
            });
          }

          // Save current bets to history
          if (Array.isArray(prev.bets) && prev.bets.length > 0) {
            const validBets = prev.bets.filter(
              (bet) => bet && bet.userId && bet.amount > 0,
            );
            if (validBets.length > 0) {
              setBetsHistory((prevHistory) => {
                const combined = [...prevHistory];
                validBets.forEach((bet) => {
                  const existingIndex = combined.findIndex(
                    (existing) =>
                      existing.userId === bet.userId &&
                      existing.amount === bet.amount &&
                      existing.prize === bet.prize,
                  );

                  if (existingIndex === -1) {
                    combined.unshift(bet);
                  } else if (bet.prize > 0) {
                    combined[existingIndex] = bet;
                  }
                });
                return combined.slice(0, 100); // Limit history length
              });
            }
          }
        }

        // Prevent unexpected phase transitions during bet operation
        const shouldPreserveBettingPhase =
          userBet !== null &&
          prev.phase === GamePhase.Betting &&
          phase !== GamePhase.Betting &&
          Date.now() - lastBetTime < 500;

        // Merge current game bets with history
        const combinedBets = [...bets].map((bet) => ({
          ...bet,
          timestamp: bet.timestamp || Date.now(),
        }));

        // Add historical bets
        betsHistory.forEach((historyBet) => {
          const isDuplicate = combinedBets.some(
            (bet) =>
              bet.userId === historyBet.userId &&
              bet.amount === historyBet.amount &&
              ((bet.prize > 0 &&
                historyBet.prize > 0 &&
                bet.prize === historyBet.prize) ||
                (bet.prize === 0 && historyBet.prize === 0)),
          );

          if (!isDuplicate) {
            combinedBets.push({
              ...historyBet,
              timestamp: historyBet.timestamp || Date.now(),
            });
          }
        });

        // Check if bets have changed
        const prevBets = prev.bets;
        const isDifferent =
          combinedBets.length !== prevBets.length ||
          combinedBets.some((bet, i) => {
            if (i >= prevBets.length) return true;
            const prevBet = prevBets[i];
            return (
              prevBet.userId !== bet.userId ||
              prevBet.amount !== bet.amount ||
              prevBet.prize !== bet.prize ||
              prevBet.cashoutAt !== bet.cashoutAt
            );
          });

        return {
          ...prev,
          phase: shouldPreserveBettingPhase ? prev.phase : (phase as GamePhase),
          multiplier,
          nextGameAt,
          bets: isDifferent ? combinedBets : prevBets,
          history: Array.isArray(history) ? history : [],
        };
      });

      // Update user bet
      if (Array.isArray(bets)) {
        const currentUserBet = bets.find((bet) => bet.userId === userId);

        // Preserve local bet state in specific cases
        if (phase === GamePhase.Running && userBet && !currentUserBet) {
          return; // Keep local userBet state for cashout
        } else if (
          !currentUserBet &&
          userBet &&
          phase === GamePhase.Betting &&
          Date.now() - lastBetTime < 500
        ) {
          // Preserve local bet state
        } else if (currentUserBet) {
          const completeUserBet: IBetDTO = {
            userId: currentUserBet.userId,
            amount: currentUserBet.amount,
            cashoutAt: currentUserBet.cashoutAt || 0,
            prize: currentUserBet.prize || 0,
          };
          setUserBet(completeUserBet);
        } else {
          setUserBet(null);
        }
      }
    };

    // Set up WebSocket event handlers
    gameSocket.on({
      onGameUpdate: handleGameUpdate,
      onConnect: () => setGameState((prev) => ({ ...prev, isConnected: true })),
      onDisconnect: () =>
        setGameState((prev) => ({ ...prev, isConnected: false })),
    });

    return () => {};
  }, [userId, betsHistory, gameState.phase, lastBetTime, userBet]);

  // Place a bet
  const placeBet = (amount: number) => {
    if (gameState.phase !== GamePhase.Betting) return;

    const tempBet: IBetDTO = {
      userId,
      amount,
      cashoutAt: 0,
      prize: 0,
      timestamp: Date.now(),
    };

    setUserBet(tempBet);
    setLastBetTime(Date.now());

    gameSocket.placeBet({
      userId,
      value: amount,
    });
  };

  // Cashout before crash
  const cashout = () => {
    if (
      gameState.phase !== GamePhase.Running ||
      !userBet ||
      (userBet.prize && userBet.prize > 0)
    ) {
      return;
    }

    const currentMultiplier = gameState.multiplier;
    const now = Date.now();

    const updatedBet = {
      ...userBet,
      cashoutAt: currentMultiplier,
      prize: userBet.amount * currentMultiplier,
      timestamp: now,
    };

    setUserBet(updatedBet);

    // Record win in history
    const cashoutHistory: IUserBetHistory = {
      ...updatedBet,
      timestamp: now,
      cashoutAt: currentMultiplier,
      status: "win",
    };

    setUserBetHistory((prevHistory) => [cashoutHistory, ...prevHistory]);

    gameSocket.cashout({ userId });

    setBetsHistory((prevHistory) => {
      const existingIndex = prevHistory.findIndex(
        (bet) =>
          bet.userId === updatedBet.userId &&
          bet.amount === updatedBet.amount &&
          bet.prize === 0,
      );

      if (existingIndex !== -1) {
        const newHistory = [...prevHistory];
        newHistory[existingIndex] = {
          ...updatedBet,
          timestamp: now,
        };
        return newHistory;
      } else {
        return [
          {
            ...updatedBet,
            timestamp: now,
          },
          ...prevHistory,
        ];
      }
    });
  };

  // Cancel a bet
  const cancelBet = () => {
    if (gameState.phase !== GamePhase.Betting || !userBet) return;

    // Record the cancelled bet in history
    const cancelledBet: IUserBetHistory = {
      ...userBet,
      timestamp: Date.now(),
      status: "cancelled",
    };

    setUserBetHistory((prevHistory) => [cancelledBet, ...prevHistory]);
    setUserBet(null);
    setLastBetTime(Date.now());

    gameSocket.placeBet({
      userId,
      value: 0,
    });
  };

  // Clear bet history
  const clearBetHistory = () => {
    setUserBetHistory([]);
    sessionStorage.removeItem("userBetHistory");
  };

  return (
    <GameContext.Provider
      value={{
        ...gameState,
        placeBet,
        cashout,
        cancelBet,
        userBet,
        userBetHistory,
        clearBetHistory,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
