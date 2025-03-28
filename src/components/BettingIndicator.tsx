import { useGame } from "../contexts/GameContext";
import { GamePhase } from "../contexts/GameConstants";

export const BettingIndicator = () => {
  const { phase } = useGame();
  const isBettingPhase = phase === GamePhase.Betting;

  if (!isBettingPhase) return null;

  return (
    <div className="absolute top-0 right-0 left-0 z-10 mx-auto flex w-full max-w-xs animate-pulse justify-center rounded-b-md bg-gradient-to-r from-[#4AE54A]/80 to-[#4AE54A]/80 py-1 text-center text-white sm:max-w-sm sm:py-2 md:max-w-md">
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="h-2 w-2 rounded-full bg-white sm:h-3 sm:w-3"></div>
        <span className="text-xs font-bold uppercase sm:text-sm">
          Betting Open
        </span>
        <div className="h-2 w-2 rounded-full bg-white sm:h-3 sm:w-3"></div>
      </div>
    </div>
  );
};
