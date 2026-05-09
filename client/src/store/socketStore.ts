import { create } from "zustand";

interface SocketState {
  ws: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Actions
  connect: (token: string) => void;
  disconnect: () => void;
  send: (type: string, payload: any) => void;
}

/** Reconnect delay bounds */
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10000;

let _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let _reconnectAttempt = 0;
let _lastToken: string | null = null;
let _intentionalClose = false;

export const useSocketStore = create<SocketState>((set, get) => ({
  ws: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  connect: (token: string) => {
    const { ws, isConnecting } = get();
    // If already connected or connecting with an active socket, skip
    if ((ws && ws.readyState <= WebSocket.OPEN) || isConnecting) return;

    _lastToken = token;
    _intentionalClose = false;
    set({ isConnecting: true, error: null });

    // Use WSS (WebSocket Secure) in production, WS in development
    let wsUrl = import.meta.env.VITE_WS_URL;
    if (!wsUrl) {
      if (import.meta.env.PROD) {
        // Use relative path so Netlify can redirect to your backend
        wsUrl = `wss://${window.location.host}/ws`;
      } else {
        wsUrl = "ws://localhost:4000/ws";
      }
    }

    // We append the token to the URL for authentication
    const newWs = new WebSocket(`${wsUrl}?token=${token}`);

    newWs.onopen = () => {
      console.log("[WS] Connected");
      _reconnectAttempt = 0; // Reset backoff on success
      set({ ws: newWs, isConnected: true, isConnecting: false, error: null });
    };

    newWs.onclose = (event) => {
      console.log("[WS] Disconnected:", event.code, event.reason);
      set({ ws: null, isConnected: false, isConnecting: false });

      // Auto-reconnect unless we intentionally called disconnect()
      if (!_intentionalClose && _lastToken) {
        const delay = Math.min(
          RECONNECT_BASE_MS * Math.pow(2, _reconnectAttempt),
          RECONNECT_MAX_MS
        );
        _reconnectAttempt++;
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${_reconnectAttempt})...`);
        if (_reconnectTimer) clearTimeout(_reconnectTimer);
        _reconnectTimer = setTimeout(() => {
          get().connect(_lastToken!);
        }, delay);
      }
    };

    newWs.onerror = (error) => {
      console.error("[WS] Error:", error);
      set({ error: "Connection failed", isConnecting: false });
    };

    // Note: onmessage is handled by the hook to link with fleetStore
  },

  disconnect: () => {
    _intentionalClose = true;
    if (_reconnectTimer) {
      clearTimeout(_reconnectTimer);
      _reconnectTimer = null;
    }
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, isConnected: false });
    }
  },

  send: (type: string, payload: any) => {
    const { ws, isConnected } = get();
    if (ws && isConnected && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn(`[WS] Cannot send ${type} — socket disconnected`);
    }
  },
}));
