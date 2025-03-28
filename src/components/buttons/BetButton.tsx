import { useState, useEffect } from "react";

interface BetButtonProps {
  betAmount: number;
  placeBet: (amount: number) => void;
  disabled?: boolean; // Optional prop to force button disabled state
}

export const BetButton = ({
  betAmount,
  placeBet,
  disabled = false,
}: BetButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset processing state after 1 second
  useEffect(() => {
    if (isProcessing) {
      const timer = setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing]);

  const handleClick = () => {
    setIsProcessing(true);
    placeBet(betAmount);
  };

  return (
    <button
      className={`cursor-pointer rounded-md bg-[#4AE54A] px-6 text-center font-medium hover:bg-[#4AE54A]/80 disabled:cursor-not-allowed disabled:bg-[#4AE54A]/50 ${isProcessing ? "opacity-70" : ""}`}
      disabled={betAmount < 1 || isProcessing || disabled}
      onClick={handleClick}
    >
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        </div>
      )}
      <p className="text-sm font-light">PLACE BET</p>
      <div className="text-xl font-bold">$ {betAmount.toFixed(2)}</div>
    </button>
  );
};
