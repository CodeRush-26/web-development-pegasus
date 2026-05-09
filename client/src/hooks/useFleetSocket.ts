import { useEffect } from "react";
import { toast } from "sonner";
import { useSocketStore } from "../store/socketStore";
import { useFleetStore } from "../store/fleetStore";
import { usePlaybackStore } from "../store/playbackStore";
import useUserStore from "../store/userStore";

export function useFleetSocket() {
  const { ws, connect, disconnect } = useSocketStore();
  const { setInitialState, applyUpdate, setActiveDirective } = useFleetStore();
  const { setSnapshotsList, setCurrentSnapshot, setMarkers } = usePlaybackStore();
  const token = useUserStore((state) => state.token);

  useEffect(() => {
    if (token) {
      connect(token);
    }
    return () => disconnect();
  }, [token, connect, disconnect]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "fleet_init":
            setInitialState(msg.payload);
            break;

          case "fleet_update":
            applyUpdate(msg.payload);
            break;

          case "zone_created":
            toast.success(`Restricted zone "${msg.payload.zone.name}" activated`);
            break;

          case "directive_issued":
            toast.info(`Directive issued to ${msg.payload.directive.shipId}`);
            break;

          case "directive_received":
            setActiveDirective(msg.payload.directive);
            toast.error("NEW DIRECTIVE RECEIVED FROM COMMAND");
            const audio2 = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..."); 
            audio2.play().catch(() => {});
            break;

          case "directive_accepted":
            setActiveDirective(null);
            toast.success("Directive accepted");
            break;

          case "distress_parsed":
            toast.error(`Distress message received from ${msg.payload.shipId}!`);
            // Audio beep for distress
            const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..."); 
            audio.play().catch(() => {}); // Ignore auto-play blocks
            break;

          case "snapshots_list":
            setSnapshotsList(msg.payload.snapshots);
            break;

          case "snapshot_data":
            setCurrentSnapshot(msg.payload);
            break;

          case "timeline_markers":
            setMarkers(msg.payload.markers);
            break;

          case "error":
            toast.error(msg.payload.message);
            break;

          default:
            // Handle other specific messages if needed
            break;
        }
      } catch (err) {
        console.error("[WS] Failed to parse message", err);
      }
    };

    ws.addEventListener("message", handleMessage);

    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, setInitialState, applyUpdate]);
}
