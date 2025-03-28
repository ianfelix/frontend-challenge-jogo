import { useGame } from "../contexts/GameContext";

export const GameHistory = () => {
  const { history } = useGame();

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCrashPointColor = (crashPoint: number) => {
    if (crashPoint >= 2) {
      return "bg-[#4AE54A] text-black";
    } else if (crashPoint >= 1.5) {
      return "bg-[#40EFFA] text-black";
    } else {
      return "bg-[#FF4A4A] text-white";
    }
  };

  return (
    <header className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {history
          .slice(-10)
          .reverse()
          .map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <span
                className={`min-w-16 rounded-2xl p-1 text-center text-xs font-bold ${getCrashPointColor(item.crashPoint)}`}
              >
                {item.crashPoint.toFixed(2)}x
              </span>
              <span className="mt-1 text-[10px] text-gray-300">
                {formatTime(item.timestamp)}
              </span>
            </div>
          ))}
      </div>
    </header>
  );
};
