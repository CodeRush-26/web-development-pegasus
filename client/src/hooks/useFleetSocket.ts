/**
 * hooks/useFleetSocket.ts
 *
 * Manages the WebSocket lifecycle and routes all incoming fleet messages
 * to the appropriate stores. Also exposes a `sendMessage` helper so
 * consuming components (e.g. CaptainView) can transmit typed messages
 * without importing socketStore directly.
 */

import { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useSocketStore } from "../store/socketStore";
import { useFleetStore } from "../store/fleetStore";
import { usePlaybackStore } from "../store/playbackStore";
import useUserStore from "../store/userStore";
import { useNavigate } from "react-router-dom";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFleetSocket() {
  const { ws, connect, disconnect, send } = useSocketStore();
  const { setInitialState, applyUpdate, setActiveDirective, addZone, removeZone, addAlert } = useFleetStore();
  const { setSnapshotsList, setCurrentSnapshot, setMarkers } = usePlaybackStore();
  const token = useUserStore((state) => state.token);
  const navigate = useNavigate();

  // ── Connect / Disconnect lifecycle ─────────────────────────────────────────
  useEffect(() => {
    if (token) {
      connect(token);
    }
    return () => disconnect();
  }, [token, connect, disconnect]);

  // ── Incoming message router ─────────────────────────────────────────────────
  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          // ── Fleet state ──────────────────────────────────────────────────
          case "fleet_init":
            setInitialState(msg.payload);
            break;

          case "fleet_update":
            applyUpdate(msg.payload);
            break;

          // ── Zone events ──────────────────────────────────────────────────
          case "zone_created":
            addZone(msg.payload.zone);
            toast.success(`Restricted zone "${msg.payload.zone.name}" activated`, {
              description: "Affected ships are being automatically rerouted."
            });
            break;

          case "zone_deleted":
            removeZone(msg.payload.zoneId);
            toast.info("Restricted zone removed. Ships may recalculate routes.");
            break;

          // ── Directive events ─────────────────────────────────────────────
          case "directive_issued":
            toast.info(`Directive issued to ${msg.payload.directive.shipId}`);
            break;

          case "directive_received":
            setActiveDirective(msg.payload.directive);
            toast.error("NEW DIRECTIVE RECEIVED FROM COMMAND", {
              description: "Click here to view in your inbox.",
              action: {
                label: "View",
                onClick: () => navigate("/captain"),
              },
              duration: 10000,
            });
            break;

          case "directive_accepted":
            setActiveDirective(null);
            toast.success("Directive accepted by captain.");
            break;

          // ── Distress / Alert events ──────────────────────────────────────
          case "distress_parsed":
            toast.error(`Distress signal from ${msg.payload.shipId}!`, {
              description: "Open Command Center for details.",
              action: {
                label: "Command Center",
                onClick: () => navigate("/dashboard"),
              },
              duration: 12000,
            });
            break;

          case "alert_acknowledged":
            // No-op: store update arrives via next fleet_update broadcast
            break;

          case "captain_report_ack":
            // Confirmation that the server accepted our captain_report_alert.
            // The toast was already shown optimistically on send — nothing to do here.
            break;

          // ── Playback / Snapshot events ───────────────────────────────────
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
            // Unknown types are silently ignored in production
            break;
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [ws, setInitialState, applyUpdate, setActiveDirective, navigate]);

  // ── Public send helper ──────────────────────────────────────────────────────
  /**
   * Sends a typed WebSocket message to the server.
   * Wraps `socketStore.send` so consumers don't need to import the store.
   *
   * @param type  - The message type string (e.g. "captain_plot_course")
   * @param payload - Arbitrary JSON payload
   */
  const sendMessage = useCallback(
    (msg: { type: string; payload: Record<string, unknown> }) => {
      send(msg.type, msg.payload);
    },
    [send]
  );

  return { sendMessage };
}
