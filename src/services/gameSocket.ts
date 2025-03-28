import { IGameEvent, IPlaceBetDTO, ICashoutDTO } from "../models";
import { GamePhase } from "../contexts/GameConstants";
import { useEffect, useRef, useCallback } from "react";

// Define events we'll use
type GameSocketEventHandlers = {
  onGameUpdate?: (gameEvent: IGameEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
};

// Configuration constants
const SERVER_URL = "ws://localhost:8080";
const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_TIMEOUT = 1000;

export const useGameSocket = () => {
  const socketRef = useRef<WebSocket | null>(null);
  const eventHandlersRef = useRef<GameSocketEventHandlers>({});
  const reconnectAttemptsRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<number>(INITIAL_RECONNECT_TIMEOUT);
  const isConnectingRef = useRef<boolean>(false);
  const userIdRef = useRef<string>("");
  const reconnectTimerRef = useRef<number | null>(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const handleReconnect = useCallback(() => {
    clearReconnectTimer();

    if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttemptsRef.current++;

      reconnectTimerRef.current = window.setTimeout(() => {
        connect();
      }, reconnectTimeoutRef.current);

      // Exponential backoff with a maximum of 30 seconds
      reconnectTimeoutRef.current = Math.min(
        reconnectTimeoutRef.current * 1.5,
        30000,
      );
    }
  }, [clearReconnectTimer]);

  const connect = useCallback(() => {
    // Don't attempt to connect if already connecting or if there's an active connection
    if (
      isConnectingRef.current ||
      (socketRef.current &&
        (socketRef.current.readyState === WebSocket.CONNECTING ||
          socketRef.current.readyState === WebSocket.OPEN))
    ) {
      return;
    }

    isConnectingRef.current = true;
    clearReconnectTimer();

    try {
      socketRef.current = new WebSocket(SERVER_URL);

      socketRef.current.onopen = () => {
        reconnectAttemptsRef.current = 0;
        reconnectTimeoutRef.current = INITIAL_RECONNECT_TIMEOUT;
        isConnectingRef.current = false;

        if (eventHandlersRef.current.onConnect) {
          eventHandlersRef.current.onConnect();
        }
      };

      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Validate message structure
          if (!message || typeof message !== "object") {
            return;
          }

          // Transform message to expected format if needed
          let gameEvent: IGameEvent;

          if (message.type === "sync") {
            // Handle sync message type
            gameEvent = {
              type: message.gameState.phase,
              data: message.gameState,
            };
          } else if (message.type === "bet-added") {
            // Skip bet-added events
            return;
          } else if (
            message.type === "cashout" ||
            message.type === "cashout-success"
          ) {
            // Handle cashout events
            if (eventHandlersRef.current.onGameUpdate) {
              // Create a synthetic game event to update the UI
              const syntheticEvent: IGameEvent = {
                type: GamePhase.Running,
                data: {
                  ...message.data,
                  phase: GamePhase.Running,
                },
              };
              eventHandlersRef.current.onGameUpdate(syntheticEvent);
            }
            return;
          } else {
            // Handle standard game event
            gameEvent = message as IGameEvent;
          }

          if (eventHandlersRef.current.onGameUpdate) {
            eventHandlersRef.current.onGameUpdate(gameEvent);
          }
        } catch {
          // Silently handle errors
        }
      };

      socketRef.current.onclose = (event) => {
        isConnectingRef.current = false;

        if (eventHandlersRef.current.onDisconnect) {
          eventHandlersRef.current.onDisconnect();
        }

        // Only attempt to reconnect if the network is online
        if (navigator.onLine && !event.wasClean) {
          handleReconnect();
        }
      };

      socketRef.current.onerror = (error) => {
        isConnectingRef.current = false;

        if (eventHandlersRef.current.onError) {
          eventHandlersRef.current.onError(error);
        }
      };
    } catch {
      isConnectingRef.current = false;

      if (navigator.onLine) {
        handleReconnect();
      }
    }
  }, [clearReconnectTimer, handleReconnect]);

  const handleOnline = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      connect();
    }
  }, [connect]);

  const handleOffline = useCallback(() => {
    // Network is offline, no need to attempt reconnection
    clearReconnectTimer();
  }, [clearReconnectTimer]);

  const placeBet = useCallback(
    (betData: IPlaceBetDTO): void => {
      if (!betData || !betData.userId) {
        return;
      }

      // Store the user ID
      userIdRef.current = betData.userId;

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "bet",
            data: betData,
          }),
        );
      } else {
        // Try to reconnect and will send message on next game update
        connect();
      }
    },
    [connect],
  );

  const cashout = useCallback(
    (cashoutData: ICashoutDTO): void => {
      if (!cashoutData || !cashoutData.userId) {
        return;
      }

      // Store the user ID
      userIdRef.current = cashoutData.userId;

      // Create the message with proper format expected by the server
      const message = JSON.stringify({
        type: "cashout",
        data: cashoutData,
      });

      // High priority - try to send immediately regardless of connection state
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(message);
        } catch {
          // Silent fail, UI already updated locally
        }
      } else {
        // Force reconnection
        connect();

        // Aggressive retry with short delay
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              try {
                socketRef.current.send(message);
              } catch {
                // Silent fail
              }
            }
          }, i * 50); // Very short delays: 0ms, 50ms, 100ms
        }
      }
    },
    [connect],
  );

  const on = useCallback((eventHandlers: GameSocketEventHandlers): void => {
    eventHandlersRef.current = {
      ...eventHandlersRef.current,
      ...eventHandlers,
    };
  }, []);

  const disconnect = useCallback((): void => {
    clearReconnectTimer();

    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  }, [clearReconnectTimer, handleOnline, handleOffline]);

  useEffect(() => {
    // Immediate connection
    connect();

    // Set up event listeners for network status
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, handleOffline, handleOnline]);

  return {
    connect,
    disconnect,
    placeBet,
    cashout,
    on,
  };
};

// Create a singleton instance for compatibility with existing code
const createGameSocketInstance = () => {
  let socket: WebSocket | null = null;
  let eventHandlers: GameSocketEventHandlers = {};
  let reconnectAttempts = 0;
  let reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;
  let isConnecting = false;
  let reconnectTimer: number | null = null;

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const handleReconnect = () => {
    clearReconnectTimer();

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;

      reconnectTimer = window.setTimeout(() => {
        connect();
      }, reconnectTimeout);

      // Exponential backoff with a maximum of 30 seconds
      reconnectTimeout = Math.min(reconnectTimeout * 1.5, 30000);
    }
  };

  const handleOnline = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      connect();
    }
  };

  const handleOffline = () => {
    // Network is offline, no need to attempt reconnection
    clearReconnectTimer();
  };

  const connect = () => {
    // Don't attempt to connect if already connecting or if there's an active connection
    if (
      isConnecting ||
      (socket &&
        (socket.readyState === WebSocket.CONNECTING ||
          socket.readyState === WebSocket.OPEN))
    ) {
      return;
    }

    isConnecting = true;
    clearReconnectTimer();

    try {
      socket = new WebSocket(SERVER_URL);

      socket.onopen = () => {
        reconnectAttempts = 0;
        reconnectTimeout = INITIAL_RECONNECT_TIMEOUT;
        isConnecting = false;

        if (eventHandlers.onConnect) {
          eventHandlers.onConnect();
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Validate message structure
          if (!message || typeof message !== "object") {
            return;
          }

          // Transform message to expected format if needed
          let gameEvent: IGameEvent;

          if (message.type === "sync") {
            // Handle sync message type
            gameEvent = {
              type: message.gameState.phase,
              data: message.gameState,
            };
          } else if (message.type === "bet-added") {
            // Skip bet-added events
            return;
          } else if (
            message.type === "cashout" ||
            message.type === "cashout-success"
          ) {
            // Handle cashout events
            if (eventHandlers.onGameUpdate) {
              // Create a synthetic game event to update the UI
              const syntheticEvent: IGameEvent = {
                type: GamePhase.Running,
                data: {
                  ...message.data,
                  phase: GamePhase.Running,
                },
              };
              eventHandlers.onGameUpdate(syntheticEvent);
            }
            return;
          } else {
            // Handle standard game event
            gameEvent = message as IGameEvent;
          }

          if (eventHandlers.onGameUpdate) {
            eventHandlers.onGameUpdate(gameEvent);
          }
        } catch {
          // Silently handle errors
        }
      };

      socket.onclose = (event) => {
        isConnecting = false;

        if (eventHandlers.onDisconnect) {
          eventHandlers.onDisconnect();
        }

        // Only attempt to reconnect if the network is online
        if (navigator.onLine && !event.wasClean) {
          handleReconnect();
        }
      };

      socket.onerror = (error) => {
        isConnecting = false;

        if (eventHandlers.onError) {
          eventHandlers.onError(error);
        }
      };
    } catch {
      isConnecting = false;

      if (navigator.onLine) {
        handleReconnect();
      }
    }
  };

  // Setup event listeners for online/offline events
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Public API
  return {
    placeBet: (betData: IPlaceBetDTO): void => {
      if (!betData || !betData.userId) {
        return;
      }

      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "bet",
            data: betData,
          }),
        );
      } else {
        // Try to reconnect and will send message on next game update
        connect();
      }
    },

    cashout: (cashoutData: ICashoutDTO): void => {
      if (!cashoutData || !cashoutData.userId) {
        return;
      }

      // Create the message with proper format expected by the server
      const message = JSON.stringify({
        type: "cashout",
        data: cashoutData,
      });

      // High priority - try to send immediately regardless of connection state
      if (socket?.readyState === WebSocket.OPEN) {
        try {
          socket.send(message);
        } catch {
          // Silent fail, UI already updated locally
        }
      } else {
        // Force reconnection
        connect();

        // Aggressive retry with short delay
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            if (socket?.readyState === WebSocket.OPEN) {
              try {
                socket.send(message);
              } catch {
                // Silent fail
              }
            }
          }, i * 50); // Very short delays: 0ms, 50ms, 100ms
        }
      }
    },

    on: (handlers: GameSocketEventHandlers): void => {
      eventHandlers = { ...eventHandlers, ...handlers };
    },

    disconnect: (): void => {
      clearReconnectTimer();

      // Remove event listeners
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (socket) {
        socket.close();
        socket = null;
      }
    },

    _connect: connect,
  };
};

// Initialize the WebSocket connection
const gameSocket = createGameSocketInstance();

// Force initial connection
gameSocket._connect();

// Expose the instance
export { gameSocket };
