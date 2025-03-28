import { Bets } from "./Bets";
import { GameHistory } from "./GameHistory";
import { GameView } from "./GameView";
import { GameControls } from "./GameControls";
import { GameDebug } from "./GameDebug";

export const MainContent = () => {
  return (
    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[360px_1fr]">
      {/* On desktop view, show Bets and UserBetHistory on the left */}
      <div className="hidden space-y-4 md:block">
        <Bets />
      </div>

      <section>
        <GameHistory />
        <GameView />
        <GameControls />
      </section>

      <div className="block space-y-4 md:hidden">
        <Bets />
      </div>

      {/* Debug panel */}
      <GameDebug />
    </div>
  );
};
