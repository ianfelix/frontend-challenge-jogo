import { useEffect, useState } from "react";
import { initGame } from "../game";

export const GameInitializer = () => {
  const [initialized, setInitialized] = useState(false);

  // Initialize the game when the component mounts
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        if (!initialized) {
          await initGame();
          if (mounted) {
            setInitialized(true);
          }
        }
      } catch {
        // Silent error handling
      }
    };

    init();

    // Cleanup
    return () => {
      mounted = false;
    };
  }, [initialized]);

  return null;
};
