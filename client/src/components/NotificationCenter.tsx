import React, { useState } from "react";
import { useFleetStore } from "@/store/fleetStore";
import { useSocketStore } from "@/store/socketStore";
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Info,
  CheckCircle2,
  Navigation,
  MapPin,
  Hand,
  Check,
  MessageSquareWarning,
  Bell,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationCenterProps {
  assignedShipId?: string; // If provided, filters for Captain's specific ship. If undefined, shows all (Admin view).
}

export function NotificationCenter({ assignedShipId }: NotificationCenterProps) {
  const { alerts, activeDirective } = useFleetStore();
  const { send } = useSocketStore();
  const [isEscalating, setIsEscalating] = useState(false);
  const [distressMessage, setDistressMessage] = useState("");

  // Filter alerts based on role
  const myAlerts = assignedShipId
    ? alerts.filter(
        (a) => a.shipId === assignedShipId || a.relatedShipId === assignedShipId
      )
    : alerts;

  // Filter directive based on role
  // If Captain, show directive only if it's for their ship.
  // If Admin, show the currently active directive fleet-wide (if we track a single one),
  // but fleetStore's activeDirective is currently typed as a single Directive object.
  const myDirective = assignedShipId
    ? activeDirective?.shipId === assignedShipId
      ? activeDirective
      : null
    : activeDirective;

  // --- Handlers for Directive ---
  const handleAcceptDirective = () => {
    send("directive_accept", {});
    toast.success("Directive accepted. Course updated.");
  };

  const handleEscalate = () => {
    if (!distressMessage.trim()) {
      toast.error("Please provide details for the escalation.");
      return;
    }
    send("directive_escalate", { message: distressMessage });
    setIsEscalating(false);
    setDistressMessage("");
    toast.error("Emergency distress signal sent to Command.");
  };

  const renderDirectiveIcon = (type: string) => {
    switch (type) {
      case "reroute_to_port":
        return <Navigation className="text-amber-500" size={20} />;
      case "divert_to_waypoint":
        return <MapPin className="text-blue-500" size={20} />;
      case "hold_position":
        return <Hand className="text-red-500" size={20} />;
      default:
        return <AlertCircle className="text-primary" size={20} />;
    }
  };

  const renderDirectiveText = (dir: any) => {
    switch (dir.type) {
      case "reroute_to_port":
        return `Reroute to Port: ${dir.targetPortId}`;
      case "divert_to_waypoint":
        return `Divert to coordinates: ${dir.targetWaypoint?.map((c: any) => c.toFixed(4)).join(", ")}`;
      case "hold_position":
        return "Hold current position immediately.";
      default:
        return "Unknown directive.";
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-h-full">
      <div className="flex items-center gap-2 mb-2 bg-black/40 p-2 rounded-lg border border-white/10">
        <Bell size={16} className="text-white/70" />
        <h3 className="text-white font-bold uppercase tracking-widest text-xs font-mono">
          Notification Center
        </h3>
        <span className="ml-auto text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/50">
          {myAlerts.length + (myDirective ? 1 : 0)} Active
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto pb-4 pr-1 scrollbar-hide">
        {/* Directives Section */}
        {myDirective && (
          <div className="bg-amber-50 border border-amber-500/50 rounded-xl overflow-hidden shadow-lg animate-in slide-in-from-right duration-300">
            <div className="bg-amber-500/20 px-3 py-2 border-b border-amber-500/20 flex justify-between items-center">
              <span className="text-[10px] text-amber-700 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <AlertOctagon size={12} />
                Priority Directive
              </span>
              <span className="text-[9px] text-amber-700/60 font-mono">
                {myDirective.directiveId.split("-")[1]}
              </span>
            </div>
            <div className="p-3">
              <div className="flex gap-3 mb-3">
                <div className="mt-1">{renderDirectiveIcon(myDirective.type)}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 capitalize">
                    {myDirective.type.replace(/_/g, " ")}
                  </h4>
                  <p className="text-xs text-slate-800 font-medium mt-1 leading-relaxed">
                    {renderDirectiveText(myDirective)}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">
                    Issued: {new Date(myDirective.issuedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {assignedShipId && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-amber-500/20">
                  {isEscalating ? (
                    <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                      <input
                        type="text"
                        value={distressMessage}
                        onChange={(e) => setDistressMessage(e.target.value)}
                        placeholder="State reason for escalation..."
                        className="w-full bg-black/50 border border-red-500/30 text-white text-xs rounded px-3 py-2 outline-none focus:border-red-400"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleEscalate}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 rounded transition-colors"
                        >
                          Send Alert
                        </button>
                        <button
                          onClick={() => setIsEscalating(false)}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleAcceptDirective}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 text-[10px] font-bold uppercase tracking-widest py-1.5 rounded transition-colors"
                      >
                        <Check size={12} /> Accept
                      </button>
                      <button
                        onClick={() => setIsEscalating(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-[10px] font-bold uppercase tracking-widest py-1.5 rounded transition-colors"
                      >
                        <MessageSquareWarning size={12} /> Escalate
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts Section */}
        {myAlerts.map((alert) => {
          let bgClass = "bg-blue-500/10 border-blue-500/20";
          let textClass = "text-blue-400";
          let Icon = Info;

          if (alert.severity === 4) {
            bgClass = "bg-red-100 border-red-500/50 shadow-md";
            textClass = "text-red-700";
            Icon = ShieldAlert;
          } else if (alert.severity === 3) {
            bgClass = "bg-orange-100 border-orange-500/50 shadow-md";
            textClass = "text-orange-700";
            Icon = AlertTriangle;
          } else if (alert.severity === 2) {
            bgClass = "bg-amber-100 border-amber-500/50 shadow-md";
            textClass = "text-amber-700";
            Icon = AlertTriangle;
          } else {
            bgClass = "bg-blue-100 border-blue-500/50 shadow-md";
            textClass = "text-blue-700";
          }

          return (
            <div
              key={alert.alertId}
              className={`border rounded-xl p-3 flex gap-3 animate-in slide-in-from-right duration-300 ${bgClass}`}
            >
              <div className={`mt-0.5 ${textClass}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${textClass}`}>
                    {alert.type.replace(/_/g, " ")}
                  </h4>
                  <span className="text-[9px] font-mono text-slate-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-900 text-xs font-medium leading-relaxed">
                  {alert.message}
                </p>
                {!assignedShipId && (
                  <span className="inline-block mt-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-white/50 border border-white/5">
                    Ship: {alert.shipId}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {myAlerts.length === 0 && !myDirective && (
          <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-xl border border-white/5 text-center h-32">
            <CheckCircle2 size={24} className="text-green-500/50 mb-2" />
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
              No Active Notifications
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
