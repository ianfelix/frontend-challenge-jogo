import { useEffect } from "react";
import { useGame } from "../contexts/GameContext";
import { updateGamePhase } from "../game";
import { BettingIndicator } from "./BettingIndicator";
import { GamePhaseIndicator } from "./GamePhase";

export const GameView = () => {
  const { phase, multiplier } = useGame();

  // Update the game visuals when the game state changes
  useEffect(() => {
    updateGamePhase(phase, multiplier);
  }, [phase, multiplier]);

  return (
    <div className="relative">
      <BettingIndicator />
      <div
        id="game-container"
        className="h-[40vh] rounded-sm bg-[#3e346d] md:h-[50vh]"
      >
        <div id="gameView" className="h-full w-full"></div>
        <GamePhaseIndicator />
      </div>
    </div>
  );
};
