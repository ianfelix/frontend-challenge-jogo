import { useGame } from "../contexts/GameContext";

export const GameDebug = () => {
  const { phase, userBet, bets, multiplier, nextGameAt, isConnected } =
    useGame();

  // Only show in development mode
  if (import.meta.env.MODE !== "development") {
    return null;
  }

  return (
    <div className="fixed right-0 bottom-0 z-50 m-4 max-w-sm overflow-hidden rounded-md bg-black/80 p-3 text-xs text-white">
      <h3 className="mb-2 font-bold">Debug Info</h3>
      <div>
        <p>
          Phase: <span className="text-yellow-400">{phase}</span>
        </p>
        <p>
          Multiplier:{" "}
          <span className="text-yellow-400">{multiplier.toFixed(2)}x</span>
        </p>
        <p>
          Next game:{" "}
          <span className="text-yellow-400">
            {nextGameAt ? new Date(nextGameAt).toLocaleTimeString() : "N/A"}
          </span>
        </p>
        <p>
          Connected:{" "}
          <span className={isConnected ? "text-green-400" : "text-red-400"}>
            {isConnected ? "Yes" : "No"}
          </span>
        </p>
        <p>
          User bet:{" "}
          <span className="text-yellow-400">
            {userBet ? `$${userBet.amount}` : "none"}
          </span>
        </p>
        <p>
          Total bets: <span className="text-yellow-400">{bets.length}</span>
        </p>
        <button
          className="mt-2 rounded bg-gray-700 px-2 py-1 text-xs hover:bg-gray-600"
          onClick={() =>
            console.log({ phase, userBet, bets, multiplier, nextGameAt })
          }
        >
          Log to console
        </button>
      </div>
    </div>
  );
};
