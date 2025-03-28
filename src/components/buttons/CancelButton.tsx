interface CancelButtonProps {
  amount: number;
  cancelBet: () => void;
}

export const CancelButton = ({ amount, cancelBet }: CancelButtonProps) => {
  return (
    <button
      className="relative cursor-pointer overflow-hidden rounded-md bg-[#FF4A4A] px-6 text-center font-medium hover:bg-[#FF4A4A]/80"
      onClick={cancelBet}
    >
      <div className="absolute inset-0 animate-pulse bg-white opacity-10"></div>
      <p className="text-sm font-light">CANCEL</p>
      <div className="text-xl font-bold">$ {amount.toFixed(2)}</div>
    </button>
  );
};
