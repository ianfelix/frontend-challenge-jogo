interface PresetButtonProps {
  amount: number;
  onClick: (amount: number) => void;
  disabled: boolean;
}

export const PresetButton = ({
  amount,
  onClick,
  disabled,
}: PresetButtonProps) => {
  return (
    <button
      className="h-8 cursor-pointer rounded-md bg-[#51417F] px-4 text-white hover:bg-[#51417F]/80 disabled:cursor-not-allowed disabled:bg-[#51417F]/50"
      onClick={() => onClick(amount)}
      disabled={disabled}
    >
      ${amount}
    </button>
  );
};
