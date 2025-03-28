import { AnimatedSprite, Text, Assets, Application, TextStyle } from "pixi.js";
import { stall } from "../utils/staller";
import { GamePhase } from "../contexts/GameConstants";

// Create variables to store game objects
let app: Application;
let spinningTopSprite: AnimatedSprite;
let multiplierText: Text;
let gameContainer: HTMLElement | null;
let bgSound: HTMLAudioElement;

// Game state
let currentPhase: GamePhase = GamePhase.Betting;
let currentMultiplier: number = 1.0;

// Initialize the game
export const initGame = async (): Promise<void> => {
  // Load assets first
  await loadAssets();

  // Get the game container
  gameContainer = document.getElementById("game-container");
  if (!gameContainer) {
    return;
  }

  // Create a new Pixi application
  app = new Application();

  // Initialize the application
  await app.init({
    background: "#3e346d",
    width: gameContainer.clientWidth,
    height: gameContainer.clientHeight,
  });

  // Add the canvas to the game view element
  const gameView = document.getElementById("gameView");
  if (gameView) {
    gameView.innerHTML = "";
    gameView.appendChild(app.canvas);
  }

  // Create and set up the spinning top sprite
  setupSpinningTop();

  // Create and set up the multiplier text
  setupMultiplierText();

  // Setup background sound
  setupSound();
};

// Set up the spinning top sprite
function setupSpinningTop(): void {
  // Get the textures from the loaded assets
  const spinningTextures = Assets.get("spinning-top")?.animations?.spinning;

  if (!spinningTextures) {
    return;
  }

  // Create the animated sprite
  spinningTopSprite = new AnimatedSprite(spinningTextures);

  // Set the animation settings
  spinningTopSprite.animationSpeed = 0.2; // Adjust as needed
  spinningTopSprite.anchor.set(0.5);
  spinningTopSprite.scale.set(0.7); // Adjust scale as needed

  // Center the sprite in the stage
  spinningTopSprite.x = app.renderer.width / 2;
  spinningTopSprite.y = app.renderer.height / 2;

  // Add the sprite to the stage
  app.stage.addChild(spinningTopSprite);

  // Initially stop the animation
  spinningTopSprite.stop();
}

// Set up the multiplier text
function setupMultiplierText(): void {
  // Create text style
  const style = new TextStyle({
    fontFamily: "Arial",
    fontSize: 64,
    fontWeight: "bold",
    fill: "#ffffff",
    align: "center",
  });

  // Create the text object
  multiplierText = new Text({
    text: `${currentMultiplier.toFixed(2)}x`,
    style: style,
  });
  multiplierText.anchor.set(0.5);

  // Position the text above the spinning top
  multiplierText.x = app.renderer.width / 2;
  multiplierText.y = app.renderer.height / 3;

  // Add the text to the stage
  app.stage.addChild(multiplierText);
}

// Set up the background sound
function setupSound(): void {
  try {
    bgSound = new Audio("./assets/bg-sound.mp3");
    bgSound.loop = true;
    bgSound.volume = 0.3;

    // Preload the audio
    bgSound.load();

    // Add user interaction handler to start audio (browsers require user interaction)
    document.addEventListener(
      "click",
      () => {
        if (bgSound && currentPhase === GamePhase.Running) {
          bgSound.play().catch(() => {
            // Silent error handling for audio play errors
          });
        }
      },
      { once: true },
    );
  } catch {
    // Silent error handling for sound setup
  }
}

// Update the game phase and animation
export const updateGamePhase = (
  phase: GamePhase,
  multiplier: number = 1.0,
): void => {
  if (!spinningTopSprite || !multiplierText) return;

  // Update the current phase and multiplier
  currentPhase = phase;
  currentMultiplier = multiplier;

  // Update the multiplier text
  multiplierText.text = `${currentMultiplier.toFixed(2)}x`;

  // Adjust the text color based on the multiplier
  if (multiplier >= 2) {
    multiplierText.style.fill = "#76FF46"; // Green for 2x or higher
  } else {
    multiplierText.style.fill = "#ffffff"; // White for less than 2x
  }

  // Update animation based on game phase
  switch (phase) {
    case GamePhase.Betting:
      spinningTopSprite.stop();
      spinningTopSprite.gotoAndStop(0); // First frame (stopped)
      spinningTopSprite.rotation = 0; // Reset rotation
      if (bgSound) {
        try {
          bgSound.pause();
          bgSound.currentTime = 0;
        } catch {
          // Silent error handling
        }
      }
      break;

    case GamePhase.Running:
      spinningTopSprite.play();
      spinningTopSprite.rotation = 0; // Reset rotation
      if (bgSound) {
        try {
          bgSound.play().catch(() => {
            // Silent error handling
          });
        } catch {
          // Silent error handling
        }
      }
      break;

    case GamePhase.Crash:
      spinningTopSprite.stop();
      spinningTopSprite.gotoAndStop(spinningTopSprite.totalFrames - 1); // Last frame (crashed)
      spinningTopSprite.rotation = 0.6; // Add tilt effect when crashed
      multiplierText.style.fill = "#FF3A3A"; // Red text for crash
      if (bgSound) {
        try {
          bgSound.pause();
        } catch {
          // Silent error handling
        }
      }
      break;
  }
};

// This function loads assets for the game
async function loadAssets(): Promise<void> {
  try {
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

    // Add a small delay to show the loading screen
    await stall(500);

    // Load the spinning top textures
    await Assets.loadBundle("spinning-top", (p) => {
      const loadingScreen = document.getElementById("loading-screen");
      const loadingProgress = document.getElementById("progress-bar");
      if (loadingProgress) {
        // @ts-expect-error - loadingProgress is an HTMLProgressElement
        loadingProgress.value = p * 100;
      }

      // Hide loading screen when loading is complete
      if (loadingScreen && p === 1) {
        loadingScreen.style.display = "none";
      }
    });

    // Load the sounds
    await Assets.loadBundle("sounds");
  } catch {
    // Silent error handling for asset loading
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.display = "none";
    }
  }
}

// Set up resize handling
window.addEventListener("resize", () => {
  if (gameContainer && app?.renderer) {
    app.renderer.resize(gameContainer.clientWidth, gameContainer.clientHeight);

    // Position elements if they exist
    if (spinningTopSprite) {
      spinningTopSprite.x = app.renderer.width / 2;
      spinningTopSprite.y = app.renderer.height / 2;
    }

    if (multiplierText) {
      multiplierText.x = app.renderer.width / 2;
      multiplierText.y = app.renderer.height / 3;
    }
  }
});
