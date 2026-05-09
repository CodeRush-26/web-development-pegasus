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

export const useSocketStore = create<SocketState>((set, get) => ({
  ws: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  connect: (token: string) => {
    const { ws, isConnecting, isConnected } = get();
    if (ws || isConnecting || isConnected) return;

    set({ isConnecting: true, error: null });

    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:4000/ws";
    // We append the token to the URL for authentication
    const newWs = new WebSocket(`${wsUrl}?token=${token}`);

    newWs.onopen = () => {
      console.log("[WS] Connected");
      set({ ws: newWs, isConnected: true, isConnecting: false, error: null });
    };

    newWs.onclose = (event) => {
      console.log("[WS] Disconnected:", event.code, event.reason);
      set({ ws: null, isConnected: false, isConnecting: false });
    };

    newWs.onerror = (error) => {
      console.error("[WS] Error:", error);
      set({ error: "Connection failed", isConnecting: false });
    };

    // Note: onmessage is handled by the hook to link with fleetStore
  },

  disconnect: () => {
    const { ws } = get();
    if (ws) {
      ws.close();
      set({ ws: null, isConnected: false });
    }
  },

  send: (type: string, payload: any) => {
    const { ws, isConnected } = get();
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn(`[WS] Cannot send ${type} — socket disconnected`);
    }
  },
}));
