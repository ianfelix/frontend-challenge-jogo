import { useEffect, useState } from "react";
import { initGame } from "../game";

export const GameInitializer = () => {
  const [initialized, setInitialized] = useState(false);

  // Initialize the game when the component mounts
  useEffect(() => {
    let mounted = true;

    // Make sure loading screen is visible on mount/restart
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.display = "flex";
    }

    const init = async () => {
      try {
        if (!initialized) {
          await initGame();
          if (mounted) {
            setInitialized(true);
          }
        }
      } catch (error) {
        console.error("Failed to initialize game:", error);
        // Hide loading screen on error
        if (loadingScreen) {
          loadingScreen.style.display = "none";
        }
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
