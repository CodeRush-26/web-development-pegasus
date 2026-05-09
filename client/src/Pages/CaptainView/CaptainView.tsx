/**
 * CaptainView.tsx — Captain's Bridge HUD
 *
 * Full-screen map with telemetry overlay, nav computer, directive inbox,
 * and the new "Report Operational Alert" panel that lets captains push
 * real alerts to Fleet Command via WebSocket.
 */

import { useState } from "react";
import { useFleetStore } from "@/store/fleetStore";
import useUserStore from "@/store/userStore";
import { useFleetSocket } from "@/hooks/useFleetSocket";
import FleetMap from "../CommandCenter/FleetMap";
import { DirectiveInbox } from "./DirectiveInbox";
import {
  Ship,
  Navigation,
  Wind,
  Activity,
  Zap,
  ShieldAlert,
  Cpu,
  AlertTriangle,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

// ─── Severity config ──────────────────────────────────────────────────────────
interface SeverityOption {
  label: string;
  value: number;
  color: string;
}

const SEVERITY_OPTIONS: SeverityOption[] = [
  { label: "Low",      value: 1, color: "text-blue-400"   },
  { label: "Medium",   value: 2, color: "text-amber-400"  },
  { label: "High",     value: 3, color: "text-orange-500" },
  { label: "Critical", value: 4, color: "text-red-500"    },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CaptainView() {
  const { user } = useUserStore();
  const assignedShipId = user?.assignedShipId;
  const [strategy, setStrategy] = useState("optimized");

  // Nav computer state
  const [isNavOpen, setIsNavOpen] = useState(true);

  // Report-alert panel state
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<number>(2);
  const [isSending, setIsSending] = useState(false);

  // Connect to live fleet data + get sendMessage
  const { sendMessage } = useFleetSocket();
  const { ships, activeDirective, alerts } = useFleetStore();

  const myAlerts = alerts.filter(
    (a) => a.shipId === assignedShipId || a.relatedShipId === assignedShipId
  );

  const myShip = ships.find((s) => s.shipId === assignedShipId);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handlePlotCourse = () => {
    sendMessage({ type: "captain_plot_course", payload: { strategy } });
  };

  const handleSimulate = () => {
    sendMessage({ type: "captain_start_simulation", payload: {} });
  };

  const handleReportAlert = () => {
    const trimmed = alertMessage.trim();
    if (!trimmed) {
      toast.error("Please describe the operational issue before submitting.");
      return;
    }

    setIsSending(true);
    sendMessage({
      type: "captain_report_alert",
      payload: {
        message: trimmed,
        severity: selectedSeverity,
      } as Record<string, unknown>,
    });

    toast.success("Alert transmitted to Fleet Command.", {
      description: "Command center has been notified.",
      duration: 5000,
    });

    // Reset form
    setAlertMessage("");
    setSelectedSeverity(2);
    setIsReportOpen(false);
    setIsSending(false);
  };

  // ── Guard: no ship assigned ─────────────────────────────────────────────────
  if (!assignedShipId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 bg-black/50 backdrop-blur-md absolute inset-0 z-10">
        <Ship size={64} className="text-white/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-white">No Assigned Ship</h2>
        <p className="text-white/60 max-w-md">
          Your captain account has not been assigned to a vessel. Please contact Fleet Command.
        </p>
      </div>
    );
  }

  // ── Guard: ship not yet in store ────────────────────────────────────────────
  if (!myShip) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 bg-black/50 backdrop-blur-md absolute inset-0 z-10">
        <div className="animate-pulse flex flex-col items-center">
          <Ship size={48} className="text-[var(--primary)] mb-4" />
          <p className="text-white/60 font-mono text-sm tracking-widest uppercase">
            Locating {assignedShipId} on satellite network...
          </p>
        </div>
      </div>
    );
  }

  const activeSeverity = SEVERITY_OPTIONS.find((o) => o.value === selectedSeverity)!;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Background Map — Fullscreen */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto">
        <FleetMap />
      </div>

      {/* HUD Overlay */}
      <div className="absolute inset-0 w-full h-full pointer-events-none p-4 md:p-6 flex flex-col justify-between">

        {/* ── Top — Telemetry Bar ─────────────────────────────────────────── */}
        <div className="flex justify-center w-full">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-3 md:p-4 flex items-center gap-4 md:gap-8 pointer-events-auto shadow-2xl">
            {/* Speed */}
            <div className="flex flex-col items-center">
              <Activity size={14} className="text-blue-400 mb-1" />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Speed</span>
              <span className="text-base md:text-lg font-bold text-white font-mono">
                {myShip.speed.toFixed(1)} <span className="text-xs font-normal">KN</span>
              </span>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Heading */}
            <div className="flex flex-col items-center">
              <Navigation
                size={14}
                className="text-[var(--primary)] mb-1"
                style={{ transform: `rotate(${myShip.heading}deg)` }}
              />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Heading</span>
              <span className="text-base md:text-lg font-bold text-white font-mono">
                {myShip.heading.toFixed(0)}°
              </span>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Fuel */}
            <div className="flex flex-col items-center">
              <Zap size={14} className={myShip.insufficientFuel ? "text-red-400 mb-1" : "text-green-400 mb-1"} />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono mb-1">Fuel</span>
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${myShip.insufficientFuel ? "bg-red-400" : "bg-green-400"}`}
                  style={{ width: `${Math.round((myShip.fuel / myShip.fuelCapacity) * 100)}%` }}
                />
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Weather */}
            <div className="flex flex-col items-center">
              <Wind size={14} className={myShip.weatherPenaltyActive ? "text-amber-400 mb-1" : "text-green-400 mb-1"} />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Weather</span>
              <span className={`text-xs font-bold font-mono ${myShip.weatherPenaltyActive ? "text-amber-400" : "text-green-400"}`}>
                {myShip.weatherPenaltyActive ? "ADVERSE" : "CLEAR"}
              </span>
            </div>

            <div className="hidden md:block w-px h-8 bg-white/10" />

            {/* Ship ID badge */}
            <div className="hidden md:flex flex-col items-center">
              <ShieldAlert size={14} className="text-[var(--primary)] mb-1" />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Vessel</span>
              <span className="text-xs font-bold text-white font-mono">{myShip.shipId}</span>
            </div>
          </div>
        </div>

        {/* ── Bottom — Control Panels ─────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-end w-full gap-3 md:gap-0">

          {/* Left column — Nav Computer + Report Alert */}
          <div className="flex flex-col gap-3 w-full md:w-80 pointer-events-auto">

            {/* Nav Computer */}
            <div className="bg-black/70 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <button
                onClick={() => setIsNavOpen((p) => !p)}
                className="w-full px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors"
              >
                <span className="text-xs font-bold text-white/70 uppercase tracking-widest font-mono flex items-center gap-2">
                  <Cpu size={14} /> Nav Computer
                </span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${(myShip.status === "normal" || myShip.status === "rerouting") ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
                  <span className="text-[10px] font-mono text-white/50 uppercase">
                    {(myShip.status === "normal" || myShip.status === "rerouting") ? "ENGAGED" : "STANDBY"}
                  </span>
                  {isNavOpen ? <ChevronDown size={14} className="text-white/40" /> : <ChevronUp size={14} className="text-white/40" />}
                </div>
              </button>

              {isNavOpen && (
                <div className="p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
                      Routing Strategy
                    </label>
                    <select
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      className="bg-black/50 border border-white/20 text-white text-sm rounded px-3 py-2 outline-none focus:border-[var(--primary)] font-mono disabled:opacity-50"
                      disabled={myShip.isSimulating}
                    >
                      <option value="optimized">Optimized (Balanced)</option>
                      <option value="fastest">Fastest (Ignore Weather)</option>
                      <option value="fuel_efficient">Fuel Efficient (Avoid Storms)</option>
                    </select>
                  </div>

                    <button
                      onClick={handlePlotCourse}
                      className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded transition-colors"
                    >
                      Plot Course
                    </button>
                </div>
              )}
            </div>

            {/* Always visible Simulate Button */}
            <button
              onClick={handleSimulate}
              className="w-full bg-[var(--primary)] hover:bg-blue-600 text-white text-sm font-bold uppercase tracking-widest py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(0,123,255,0.4)] flex items-center justify-center gap-2"
            >
              <Navigation size={16} />
              Start Simulation
            </button>

            {/* ── Report Operational Alert ─────────────────────────────────── */}
            <div className="bg-black/70 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <button
                onClick={() => setIsReportOpen((p) => !p)}
                className="w-full px-4 py-2 bg-red-500/10 border-b border-white/10 flex items-center justify-between hover:bg-red-500/15 transition-colors"
              >
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest font-mono flex items-center gap-2">
                  <AlertTriangle size={14} /> Report Operational Alert
                </span>
                {isReportOpen
                  ? <ChevronDown size={14} className="text-white/40" />
                  : <ChevronUp size={14} className="text-white/40" />}
              </button>

              {isReportOpen && (
                <div className="p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Severity selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
                      Severity Level
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {SEVERITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedSeverity(opt.value)}
                          className={`py-1.5 text-[10px] font-bold uppercase tracking-wider rounded border transition-colors font-mono ${
                            selectedSeverity === opt.value
                              ? `border-current ${opt.color} bg-white/10`
                              : "border-white/10 text-white/40 hover:text-white/70"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
                      Situation Report
                    </label>
                    <textarea
                      rows={3}
                      value={alertMessage}
                      onChange={(e) => setAlertMessage(e.target.value)}
                      placeholder="e.g. Starboard engine losing pressure, requesting inspection at next port..."
                      className="w-full bg-black/50 border border-white/20 text-white text-xs rounded px-3 py-2 outline-none focus:border-red-400 placeholder-white/20 resize-none font-mono leading-relaxed"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleReportAlert}
                    disabled={isSending || !alertMessage.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest rounded transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
                      activeSeverity.value >= 3
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]"
                        : "bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    }`}
                  >
                    <Send size={13} />
                    {isSending ? "Transmitting..." : "Transmit to Fleet Command"}
                  </button>

                  <p className="text-[9px] text-white/25 text-center font-mono leading-tight">
                    Alert will appear on the admin dashboard immediately.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right column — Directive Inbox & Alerts */}
          <div className="w-full md:w-96 pointer-events-auto flex flex-col gap-3">
            {/* Alerts Window */}
            {myAlerts.length > 0 && (
              <div className="bg-black/70 backdrop-blur-lg border border-red-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(220,38,38,0.2)] animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-2 mb-3 border-b border-red-500/20 pb-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs font-mono">
                    System Alerts ({myAlerts.length})
                  </h3>
                </div>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {myAlerts.map((alert) => (
                    <div
                      key={alert.alertId}
                      className="bg-red-500/10 border border-red-500/20 rounded p-2.5"
                    >
                      <p className="text-white text-xs leading-relaxed">
                        {alert.message}
                      </p>
                      <span className="text-[10px] text-red-300/60 font-mono block mt-1.5">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DirectiveInbox directive={activeDirective} shipId={myShip.shipId} />
          </div>
        </div>
      </div>
    </div>
  );
}
