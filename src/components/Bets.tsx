import React from "react";
import { IBetDTO } from "../models";
import { useGame } from "../contexts/GameContext";

const BetRow = React.memo(({ bet }: { bet: IBetDTO }) => {
  const userId = bet.userId;
  const maskedId =
    userId.length > 6
      ? `${userId.substring(0, 2)}****${userId.substring(userId.length - 2)}`
      : userId;

  const hasCashedOut = bet.prize > 0;
  const multiplier = hasCashedOut ? bet.prize / bet.amount : 0;

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <tr className="border-b border-[#3A5588]">
      <td className="py-2">{maskedId}</td>
      <td className="py-2">{formatNumber(bet.amount)}</td>
      <td className="py-2 text-center">
        {hasCashedOut ? (
          <span className="font-bold text-[#4AE54A]">
            {multiplier.toFixed(2)}x
          </span>
        ) : (
          <span className="text-[#FF4A4A]">-</span>
        )}
      </td>
      <td className="py-2 text-right">
        {hasCashedOut ? (
          <span className="text-[#4AE54A]">{formatNumber(bet.prize)}</span>
        ) : (
          <span className="text-[#FF4A4A]">{formatNumber(bet.amount)}</span>
        )}
      </td>
    </tr>
  );
});

const Bets = () => {
  const { bets } = useGame();

  return (
    <aside className="h-full w-full">
      <div className="h-full rounded-sm bg-[#51417F]">
        <div className="flex items-center justify-center border-b border-[#3A5588] p-2">
          <h2 className="text-lg text-white">Bets</h2>
          <span className="ml-2 text-xs font-medium text-[#40EFFA]">
            ({bets.length})
          </span>
        </div>
        <div className="max-h-[40vh] rounded-sm border-t border-[#3A5588] p-4 md:max-h-full">
          <table className="w-full text-left text-sm text-white">
            <thead className="sticky top-0 z-10 bg-[#51417F]">
              <tr className="border-b border-[#3A5588] text-[#2BADCA]">
                <th className="pb-3">User</th>
                <th className="pb-3">Bet USD</th>
                <th className="pb-3 text-center">Multiplier</th>
                <th className="pb-3 text-right">Bet</th>
              </tr>
            </thead>
            <tbody className="overflow-y-auto">
              {bets.map((bet, index) => (
                <BetRow key={index} bet={bet} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </aside>
  );
};

export { Bets };
