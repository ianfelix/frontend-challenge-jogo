import { Dispatch, SetStateAction } from "react";
import { PresetButton } from "./buttons";

interface BetControlsProps {
  betAmount: number;
  setBetAmount: Dispatch<SetStateAction<number>>;
}

export const BetControls = ({ betAmount, setBetAmount }: BetControlsProps) => {
  const handlePresetClick = (amount: number) => {
    setBetAmount(amount);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <button
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-l-md bg-[#AC8FFF] text-white hover:bg-[#AC8FFF]/80 disabled:cursor-not-allowed disabled:bg-[#AC8FFF]/50"
          onClick={() => setBetAmount(Math.max(1, betAmount - 1))}
          disabled={betAmount <= 1}
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
          className="flex h-8 w-24 [appearance:textfield] items-center justify-center bg-[#000E3E] text-center text-white [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-r-md bg-[#AC8FFF] text-white hover:bg-[#AC8FFF]/80 disabled:cursor-not-allowed disabled:bg-[#AC8FFF]/50"
          onClick={() => setBetAmount(betAmount + 1)}
        >
          +
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <PresetButton amount={1} onClick={handlePresetClick} />
        <PresetButton amount={5} onClick={handlePresetClick} />
        <PresetButton amount={10} onClick={handlePresetClick} />
        <PresetButton amount={20} onClick={handlePresetClick} />
      </div>
    </div>
  );
};
