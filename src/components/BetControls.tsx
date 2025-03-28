import { Dispatch, SetStateAction } from "react";
import { PresetButton } from "./buttons";
import { useGame } from "../contexts/GameContext";
import { GamePhase } from "../contexts/GameConstants";

interface BetControlsProps {
  betAmount: number;
  setBetAmount: Dispatch<SetStateAction<number>>;
}

export const BetControls = ({ betAmount, setBetAmount }: BetControlsProps) => {
  const { phase, userBet } = useGame();

  const handlePresetClick = (amount: number) => {
    setBetAmount(amount);
  };

  const isDisabled = phase !== GamePhase.Betting || userBet !== null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-[#51417F] text-white hover:bg-[#51417F]/80 disabled:cursor-not-allowed disabled:bg-[#51417F]/50"
          onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
          disabled={betAmount <= 1 || isDisabled}
        >
          -
        </button>
        <input
          type="text"
          value={`$${betAmount.toFixed(2)}`}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.]/g, "");
            const numericValue = parseFloat(value);
            if (!isNaN(numericValue)) {
              setBetAmount(numericValue);
            }
          }}
          className="flex h-8 w-24 [appearance:textfield] items-center justify-center rounded-md bg-[#51417F] text-center text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          disabled={isDisabled}
        />
        <button
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-[#51417F] text-white hover:bg-[#51417F]/80 disabled:cursor-not-allowed disabled:bg-[#51417F]/50"
          onClick={() => setBetAmount(betAmount + 1)}
          disabled={isDisabled}
        >
          +
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <PresetButton
          amount={1}
          onClick={handlePresetClick}
          disabled={isDisabled}
        />
        <PresetButton
          amount={5}
          onClick={handlePresetClick}
          disabled={isDisabled}
        />
        <PresetButton
          amount={10}
          onClick={handlePresetClick}
          disabled={isDisabled}
        />
        <PresetButton
          amount={20}
          onClick={handlePresetClick}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};
