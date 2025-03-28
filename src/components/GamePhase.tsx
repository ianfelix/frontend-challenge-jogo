import { useEffect, useState } from "react";
import { useGame } from "../contexts/GameContext";
import { GamePhase } from "../contexts/GameConstants";

export const GamePhaseIndicator = () => {
  const { phase, multiplier, nextGameAt } = useGame();
  const [countdown, setCountdown] = useState<number | null>(null);

  // Handle countdown timer
  useEffect(() => {
    // Only count down during betting phase
    if (phase !== GamePhase.Betting || !nextGameAt) {
      setCountdown(null);
      return;
    }

    // Calculate initial countdown value
    const initialCountdown = Math.max(
      0,
      Math.floor((nextGameAt - Date.now()) / 1000), // Convert to seconds
    );
    setCountdown(initialCountdown);

    // Set up countdown timer
    const intervalId = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((nextGameAt - Date.now()) / 1000),
      );
      setCountdown(remaining);

      // Stop countdown when it reaches 0
      if (remaining <= 0) {
        clearInterval(intervalId);
      }
    }, 1000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [phase, nextGameAt]);

  // Define colors and text for each phase
  const phaseConfig = {
    [GamePhase.Betting]: {
      bg: "bg-[#4AE54A]",
      text:
        countdown !== null ? `BETTING PHASE (${countdown}s)` : "BETTING PHASE",
      textColor: "text-black",
    },
    [GamePhase.Running]: {
      bg: "bg-[#FAFF00]",
      text: `GAME RUNNING: ${multiplier.toFixed(2)}x`,
      textColor: "text-black",
    },
    [GamePhase.Crash]: {
      bg: "bg-[#FF4A4A]",
      text: `CRASHED AT ${multiplier.toFixed(2)}x`,
      textColor: "text-white",
    },
  };

  const { bg, text, textColor } = phaseConfig[phase];

  return (
    <div
      className={`absolute right-0 bottom-4 left-0 mx-auto w-64 rounded-md ${bg} py-2 text-center font-bold shadow-md`}
    >
      <p className={`uppercase ${textColor}`}>{text}</p>
    </div>
  );
};
