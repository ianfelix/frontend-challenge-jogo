import { useState, useRef } from "react";
import { BetButton, CancelButton, CashoutButton } from "./buttons";
import { BetControls } from "./BetControls";
import { GamePhase } from "../contexts/GameConstants";
import { useGame } from "../contexts/GameContext";

export const GameControls = () => {
  const [betAmount, setBetAmount] = useState(1);
  const { phase, multiplier, placeBet, cashout, cancelBet, userBet } =
    useGame();
  const isProcessingActionRef = useRef(false);

  const handlePlaceBet = (amount: number) => {
    if (isProcessingActionRef.current) {
      return;
    }

    isProcessingActionRef.current = true;
    placeBet(amount);

    // Reset after a short delay
    setTimeout(() => {
      isProcessingActionRef.current = false;
    }, 1000);
  };

  const handleCashout = () => {
    // Basic validation - much less strict than before
    if (phase !== GamePhase.Running || !userBet) return;

    // No need to check processing state for cashout - it should be immediate
    // and UI feedback should be instant

    // Execute cashout immediately with no debounce or delay
    cashout();
  };

  const handleCancelBet = () => {
    if (isProcessingActionRef.current) return;
    isProcessingActionRef.current = true;
    cancelBet();
    setTimeout(() => {
      isProcessingActionRef.current = false;
    }, 1000);
  };

  const ActionButton = () => {
    // Safely determine if the bet is cashed out
    const isCashedOut = userBet && userBet.prize ? userBet.prize > 0 : false;

    if (phase === GamePhase.Running && userBet) {
      return (
        <CashoutButton
          amount={userBet.amount}
          multiplier={multiplier}
          cashout={handleCashout}
          isCashedOut={isCashedOut}
        />
      );
    } else if (phase === GamePhase.Betting) {
      if (userBet) {
        return (
          <CancelButton amount={userBet.amount} cancelBet={handleCancelBet} />
        );
      } else {
        return <BetButton betAmount={betAmount} placeBet={handlePlaceBet} />;
      }
    } else {
      return (
        <BetButton betAmount={betAmount} placeBet={() => {}} disabled={true} />
      );
    }
  };

  return (
    <footer className="mt-4 rounded-md bg-[#51417F] p-4">
      <div className="flex items-stretch justify-center gap-4">
        <BetControls betAmount={betAmount} setBetAmount={setBetAmount} />
        <ActionButton />
      </div>
    </footer>
  );
};
