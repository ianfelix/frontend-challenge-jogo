import { useState, useEffect, useRef } from "react";

interface CashoutButtonProps {
  amount: number;
  multiplier: number;
  cashout: () => void;
  isCashedOut?: boolean;
}

export const CashoutButton = ({
  amount,
  multiplier,
  cashout,
  isCashedOut: externalCashoutState,
}: CashoutButtonProps) => {
  // These state variables track the button's visual appearance
  const [isProcessing, setIsProcessing] = useState(false);
  const [internalCashedOut, setInternalCashedOut] = useState(false);
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(
    null,
  );
  const timerRef = useRef<number | null>(null);

  // This ensures we don't fire multiple cashouts even with fast clicks
  const hasClickedRef = useRef(false);

  const isCashedOut =
    externalCashoutState !== undefined
      ? externalCashoutState
      : internalCashedOut;

  const handleCashout = () => {
    // Prevent multiple cashout attempts regardless of UI state
    if (hasClickedRef.current || isCashedOut) {
      return;
    }

    // Immediately mark as clicked to prevent double-cashouts
    hasClickedRef.current = true;

    // Show processing state
    setIsProcessing(true);

    // Store the current multiplier value when cashing out
    setCashedOutMultiplier(multiplier);

    // Execute cashout without any delay
    cashout();

    // Optimistically update UI immediately
    if (externalCashoutState === undefined) {
      setInternalCashedOut(true);
    }

    // Reset visual processing state after a very short delay
    timerRef.current = window.setTimeout(() => {
      setIsProcessing(false);
    }, 50);
  };

  // Reset internal state if external props change
  useEffect(() => {
    if (externalCashoutState === false) {
      setInternalCashedOut(false);
      hasClickedRef.current = false;
      setCashedOutMultiplier(null);
    }
  }, [externalCashoutState]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Immediately reset the reference if the game phase changes
  // This allows clicking again in a new game
  useEffect(() => {
    const resetOnPhaseChange = () => {
      hasClickedRef.current = false;
    };

    window.addEventListener("phasechange", resetOnPhaseChange);

    return () => {
      window.removeEventListener("phasechange", resetOnPhaseChange);
    };
  }, []);

  if (isCashedOut) {
    // Use the stored multiplier value when showing the cashed out state
    const displayMultiplier = cashedOutMultiplier || multiplier;

    return (
      <button
        className="relative cursor-not-allowed rounded-md bg-[#FAFF00]/70 px-6 text-center font-medium"
        disabled
      >
        <p className="text-sm font-light">CASHED OUT!</p>
        <div className="text-xl font-bold">
          $ {(amount * displayMultiplier).toFixed(2)}
        </div>
      </button>
    );
  }

  // Use onMouseDown instead of onClick for faster response
  return (
    <button
      className={`relative cursor-pointer rounded-md bg-[#FAFF00] px-6 text-center font-medium hover:bg-[#FAFF00]/80 ${
        isProcessing ? "opacity-70" : ""
      }`}
      onMouseDown={handleCashout}
      onTouchStart={handleCashout}
      disabled={isProcessing}
    >
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/20">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
        </div>
      )}
      <p className="text-sm font-light">CASHOUT</p>
      <div className="text-xl font-bold">
        $ {(amount * multiplier).toFixed(2)}
      </div>
    </button>
  );
};
