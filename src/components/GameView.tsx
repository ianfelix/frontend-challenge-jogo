import { useEffect, useRef } from "react";
import { useGame } from "../contexts/GameContext";
import { updateGamePhase } from "../game";
import { BettingIndicator } from "./BettingIndicator";
import { GamePhaseIndicator } from "./GamePhase";

export const GameView = () => {
  const { phase, multiplier } = useGame();
  const containerRef = useRef<HTMLDivElement>(null);

  // Update the game visuals when the game state changes
  useEffect(() => {
    updateGamePhase(phase, multiplier);
  }, [phase, multiplier]);

  // Handle window resize to keep the game canvas responsive
  useEffect(() => {
    const handleResize = () => {
      const gameView = document.getElementById("gameView");
      const canvas = gameView?.querySelector("canvas");

      if (canvas && containerRef.current) {
        // Update canvas size to match container
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;

        // Force the canvas to use the container's dimensions
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.objectFit = "contain";
      }
    };

    // Initial sizing
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    // Force recalculation on orientation change for mobile
    window.addEventListener("orientationchange", () => {
      setTimeout(handleResize, 100);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return (
    <div className="relative">
      <BettingIndicator />
      <div
        id="game-container"
        ref={containerRef}
        className="h-[35vh] w-full rounded-sm bg-[#3e346d] shadow-lg sm:h-[38vh] md:h-[45vh] lg:h-[50vh] xl:h-[55vh]"
      >
        <div id="gameView" className="h-full w-full"></div>
        <GamePhaseIndicator />
      </div>
    </div>
  );
};
