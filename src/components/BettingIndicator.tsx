import { useGame } from "../contexts/GameContext";
import { GamePhase } from "../contexts/GameConstants";

export const BettingIndicator = () => {
  const { phase } = useGame();
  const isBettingPhase = phase === GamePhase.Betting;

  if (!isBettingPhase) return null;

  return (
    <div className="absolute top-0 right-0 left-0 z-10 mx-auto flex w-full max-w-md animate-pulse justify-center rounded-b-md bg-gradient-to-r from-[#4AE54A]/80 to-[#4AE54A]/80 py-2 text-center text-white">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-white"></div>
        <span className="text-sm font-bold uppercase">Betting Open</span>
        <div className="h-3 w-3 rounded-full bg-white"></div>
      </div>
    </div>
  );
};
