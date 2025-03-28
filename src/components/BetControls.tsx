import { Dispatch, SetStateAction, useState } from "react";
import { PresetButton } from "./buttons";

interface BetControlsProps {
  betAmount: number;
  setBetAmount: Dispatch<SetStateAction<number>>;
}

export const BetControls = ({ betAmount, setBetAmount }: BetControlsProps) => {
  const [inputValue, setInputValue] = useState(`${betAmount.toFixed(2)}`);

  const handlePresetClick = (amount: number) => {
    setBetAmount(amount);
    setInputValue(amount.toFixed(2));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric and non-decimal characters
    let value = e.target.value.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point exists
    const decimalCount = (value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      const parts = value.split(".");
      value = parts[0] + "." + parts.slice(1).join("");
    }

    setInputValue(value);

    // Convert to number and update if valid
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setBetAmount(numericValue);
    } else if (value === "" || value === ".") {
      setBetAmount(0);
    }
  };

  const handleBlur = () => {
    // Format the number with 2 decimal places on blur
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      setInputValue(numericValue.toFixed(2));
    } else {
      setInputValue("0.00");
      setBetAmount(0);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <button
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-l-md bg-[#AC8FFF] text-white hover:bg-[#AC8FFF]/80 disabled:cursor-not-allowed disabled:bg-[#AC8FFF]/50"
          onClick={() => {
            const newAmount = Math.max(0, betAmount - 1);
            setBetAmount(newAmount);
            setInputValue(newAmount.toFixed(2));
          }}
          disabled={betAmount <= 0}
        >
          -
        </button>
        <div className="relative flex h-8 w-24 items-center justify-center bg-[#000E3E]">
          <span className="absolute left-2 text-white">$</span>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className="h-full w-full [appearance:textfield] bg-transparent pr-1 pl-5 text-center text-white focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <button
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-r-md bg-[#AC8FFF] text-white hover:bg-[#AC8FFF]/80 disabled:cursor-not-allowed disabled:bg-[#AC8FFF]/50"
          onClick={() => {
            const newAmount = betAmount + 1;
            setBetAmount(newAmount);
            setInputValue(newAmount.toFixed(2));
          }}
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
