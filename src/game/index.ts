import { AnimatedSprite, Text, Assets } from "pixi.js";
import { stall } from "../utils/staller";

let spinningTopSprite: AnimatedSprite;
let multiplierText: Text;

(async () => {
  // Load assets
  await loadAssets();
  // Create a new application
  // Initialize the application
  // Append the application canvas to the document body or div
  // Create sprite with textures. Use alias spinning-top
  // Add sprite to scene
  // Position sprite at the center of the screen
  // Create multiplier text
  // Add text to scene
  // Position text at the center of the screen
})();

// This function load assets for the game that can be used in the code
async function loadAssets() {
  await Assets.init({
    manifest: {
      bundles: [
        {
          name: "spinning-top",
          assets: [
            {
              alias: "spinning-top",
              src: "./assets/texture.json",
            },
          ],
        },
        {
          name: "sounds",
          assets: [
            {
              alias: "bg-sound",
              src: "./assets/bg-sound.mp3",
            },
          ],
        },
      ],
    },
  });

  await stall();
  await Assets.loadBundle("spinning-top", (p) => {
    const loadingScreen = document.getElementById("loading-screen");
    const loadingProgress = document.getElementById("progress-bar");
    if (loadingProgress) {
      // @ts-expect-error - loadingProgress is a HTMLProgressElement
      loadingProgress.value = p * 100;
    }
    if (loadingScreen) {
      if (p == 1) {
        loadingScreen.style.display = "none";
      }
    }
  });
  await Assets.loadBundle("sounds");
}
