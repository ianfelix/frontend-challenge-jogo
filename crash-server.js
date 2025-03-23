import { WebSocketServer } from 'ws';

// Game state
const gameState = {
  phase: 'init', // BETTING or RUNNING
  multiplier: 1.00,
  crashPoint: 0,
  nextGameAt: 0,
  bets: [], // userId -> {amount, cashoutAt}
  history: []
};

// Constants
const BETTING_PHASE_DURATION = 5000; // 5 seconds
const TICK_INTERVAL = 100; // 100ms
const MULTIPLIER_INCREMENT = 0.01;
const MAX_MULTIPLIER = 2; // For simplicity, limit the max multiplier

// Initialize WebSocket server
const wss = new WebSocketServer({ port: 8080 });
console.log('Crash game server running on port 8080');

// Game loop timers
let bettingTimer = null;
let runningTimer = null;

// Start the game cycle
startBettingPhase();

wss.on('connection', function connection(ws, req) {
  console.log('Client connected');

  // Send sync event with current game state
  sendSyncEvent(ws);

  // Handle messages from clients
  ws.on('message', function message(data) {
    try {
      const message = JSON.parse(data);
      console.log(message)
      handleClientMessage(message);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle disconnection
  ws.on('close', function () {
    console.log('Client disconnected');
  });
});

function sendBetAddedEvent(userId, value) {
  wss.clients.forEach((client) => {
      client.send(JSON.stringify({ type: 'bet-added',data: {
        userId, 
        value
      }}));
  });
}

function handleClientMessage(message) {
  const { type, data: {userId, value, cashoutAt} } = message;

  switch (type) {
    case 'bet':
      if (gameState.phase === 'betting' && userId && value > 0) {
        gameState.bets.push({ userId, amount: value, cashoutAt });
        broadcastGameState();
        sendBetAddedEvent(userId, value);
      }
      break;

    case 'cashout':
      const userBet = gameState.bets.find(u => u.userId == userId)
      if (gameState.phase === 'running' && userBet) {
        if(!userBet) return null;
        userBet.prize = userBet.amount * gameState.multiplier;
        broadcastGameState();
      }
      break;
  }
}

function sendSyncEvent(ws) {
  const syncData = {
    type: 'sync',
    gameState: {
      phase: gameState.phase,
      multiplier: gameState.multiplier,
      nextGameAt: gameState.nextGameAt,
      history: gameState.history.slice(-10), // Last 10 games
      bets: gameState.bets
    }
  };

  ws.send(JSON.stringify(syncData));
}

function broadcastGameState() {
  const stateUpdate = {
    type: gameState.phase,
    data: {
      phase: gameState.phase,
      multiplier: gameState.multiplier,
      nextGameAt: gameState.phase === 'betting' ? gameState.nextGameAt : null,
      bets: gameState.bets,
      history: gameState.history,
    }
  };

  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(JSON.stringify(stateUpdate));
    }
  });
}

function startBettingPhase() {
  // Reset game state
  gameState.phase = 'betting';
  gameState.multiplier = 1.00;
  gameState.bets = [];

  // Calculate next game time
  gameState.nextGameAt = Date.now() + BETTING_PHASE_DURATION;

  // Generate random crash point (between 1.00 and MAX_MULTIPLIER)
  gameState.crashPoint = 1 + Math.random() * (MAX_MULTIPLIER - 1);

  // Broadcast the new game state
  broadcastGameState();

  // Schedule the start of the running phase
  bettingTimer = setTimeout(() => {
    startRunningPhase();
  }, BETTING_PHASE_DURATION);
}

function startRunningPhase() {
  gameState.phase = 'running';
  broadcastGameState();

  // Start the multiplier ticker
  runningTimer = setInterval(() => {
    // Increase multiplier
    gameState.multiplier += MULTIPLIER_INCREMENT;
    gameState.multiplier = parseFloat(gameState.multiplier.toFixed(2));

    // Broadcast updated multiplier
    gameState.bets.forEach((bet) => {
      if (bet.cashoutAt === gameState.multiplier) {
        bet.prize = bet.amount * gameState.multiplier;
      }
    });

    broadcastGameState();

    // Check if we've reached the crash point
    if (gameState.multiplier >= gameState.crashPoint) {
      // Game crashed
      clearInterval(runningTimer);

      // Record in history
      gameState.history.push({
        crashPoint: gameState.multiplier,
        timestamp: Date.now()
      });

      gameState.phase = 'crash'

      // Notify clients about crash
      broadcastGameState();

      // Start a new game after a short delay
      setTimeout(() => {
        startBettingPhase();
      }, 3000);
    }
  }, TICK_INTERVAL);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  clearTimeout(bettingTimer);
  clearInterval(runningTimer);
  wss.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
