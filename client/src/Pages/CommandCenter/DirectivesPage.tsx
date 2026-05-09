/**
 * DirectivesPage.tsx
 * Command-centre directive management panel.
 * Admins can view all active directives and issue new ones.
 * Captains see their own active/past directives.
 * Route: /dashboard/directives
 */
import { useState } from "react";
import { useFleetSocket } from "@/hooks/useFleetSocket";
import { useFleetStore } from "@/store/fleetStore";
import { useSocketStore } from "@/store/socketStore";
import useUserStore from "@/store/userStore";
import { IssueDirectiveModal } from "@/components/ui/issue-directive-modal";
import { ShipState } from "@/types/fleet";
import { Link } from "react-router-dom";
import {
  FileText,
  Ship,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Hand,
  MapPin,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Status badge helper ──────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    normal: "bg-green-500/10 text-green-400 border-green-500/20",
    rerouting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    distressed: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
    stopped: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    stranded: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
    arrived: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    out_of_fuel: "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium capitalize ${
        colorMap[status] ?? "bg-gray-500/10 text-gray-400 border-gray-500/20"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ─── Directive type icon ──────────────────────────────────────────────────────
function DirectiveIcon({ type }: { type: string }) {
  if (type === "reroute_to_port") return <Navigation size={16} className="text-blue-400" />;
  if (type === "hold_position") return <Hand size={16} className="text-red-400" />;
  if (type === "divert_to_waypoint") return <MapPin size={16} className="text-amber-400" />;
  return <AlertCircle size={16} className="text-gray-400" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DirectivesPage() {
  useFleetSocket();

  const { ships, activeDirective } = useFleetStore();
  const { send } = useSocketStore();
  const { user } = useUserStore();
  const [selectedShip, setSelectedShip] = useState<ShipState | null>(null);

  const isAdmin = user?.role === "admin";
  const isCaptain = user?.role === "captain";

  // Ships that have an active directive pending
  const shipsWithDirectives = ships.filter((s) => s.activeDirective);
  // Ships in crisis that need attention
  const shipsInCrisis = ships.filter((s) =>
    ["distressed", "stranded", "out_of_fuel"].includes(s.status)
  );

  const handleAcceptDirective = () => {
    send("directive_accept", {});
    toast.success("Directive acknowledged. Adjusting course.");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-[var(--primary)]" />
          Directives
        </h1>
        <p className="text-sm text-[var(--dashboard-text-muted)] mt-1">
          {isAdmin
            ? "Issue and track operational orders across the fleet."
            : "Your active and historical command directives."}
        </p>
      </div>

      {/* ── CAPTAIN VIEW ── */}
      {isCaptain && (
        <div className="space-y-4">
          {activeDirective ? (
            <div className="bg-[var(--dashboard-card)] rounded-xl border border-amber-500/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <DirectiveIcon type={activeDirective.type} />
                </div>
                <div>
                  <h2 className="font-semibold text-amber-400">Active Directive Received</h2>
                  <p className="text-xs text-[var(--dashboard-text-muted)]">
                    ID: {activeDirective.directiveId} · Issued{" "}
                    {new Date(activeDirective.issuedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <p className="text-sm mb-4 text-[var(--dashboard-text-muted)]">
                Type:{" "}
                <span className="font-medium text-[var(--dashboard-text)] capitalize">
                  {activeDirective.type.replace(/_/g, " ")}
                </span>
                {activeDirective.targetPortId && ` → Port: ${activeDirective.targetPortId}`}
                {activeDirective.targetWaypoint &&
                  ` → Waypoint: ${activeDirective.targetWaypoint.map((c) => c.toFixed(4)).join(", ")}`}
              </p>
              <Button
                onClick={handleAcceptDirective}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <CheckCircle2 size={16} className="mr-2" />
                Acknowledge & Comply
              </Button>
            </div>
          ) : (
            <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-10 text-center">
              <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold">No Active Directives</h2>
              <p className="text-sm text-[var(--dashboard-text-muted)] mt-1">
                Continue on your current assigned route. Fleet Command will notify you of any orders.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── ADMIN VIEW ── */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ships in Crisis */}
          <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--dashboard-border)] flex items-center gap-2">
              <AlertCircle size={18} className="text-red-400" />
              <h2 className="font-semibold">Crisis Vessels</h2>
              {shipsInCrisis.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {shipsInCrisis.length}
                </span>
              )}
            </div>
            <div className="divide-y divide-[var(--dashboard-border)]">
              {shipsInCrisis.length === 0 ? (
                <div className="p-6 text-center text-[var(--dashboard-text-muted)] text-sm">
                  <CheckCircle2 size={24} className="text-green-500 mx-auto mb-2" />
                  All vessels operating normally.
                </div>
              ) : (
                shipsInCrisis.map((ship) => (
                  <div
                    key={ship.shipId}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/10 rounded-lg">
                        <Ship size={18} className="text-red-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{ship.name}</div>
                        <div className="text-xs text-[var(--dashboard-text-muted)] font-mono">
                          {ship.shipId}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ship.status} />
                      <Button
                        size="sm"
                        onClick={() => setSelectedShip(ship)}
                        className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white"
                      >
                        <Send size={14} className="mr-1" />
                        Issue
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Directives */}
          <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--dashboard-border)] flex items-center gap-2">
              <FileText size={18} className="text-amber-400" />
              <h2 className="font-semibold">Pending Orders</h2>
              {shipsWithDirectives.length > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {shipsWithDirectives.length}
                </span>
              )}
            </div>
            <div className="divide-y divide-[var(--dashboard-border)]">
              {shipsWithDirectives.length === 0 ? (
                <div className="p-6 text-center text-[var(--dashboard-text-muted)] text-sm">
                  No pending orders.
                </div>
              ) : (
                shipsWithDirectives.map((ship) => (
                  <div
                    key={ship.shipId}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Ship size={18} className="text-amber-400" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{ship.name}</div>
                        <div className="text-xs font-mono text-[var(--dashboard-text-muted)]">
                          Awaiting acknowledgement
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={ship.status} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* All Ships — Issue Directive */}
          <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden lg:col-span-2">
            <div className="p-4 border-b border-[var(--dashboard-border)] flex items-center gap-2">
              <Ship size={18} className="text-[var(--primary)]" />
              <h2 className="font-semibold">Fleet Roster — Issue Directive</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[var(--dashboard-bg)] border-b border-[var(--dashboard-border)]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">
                      Vessel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">
                      Fuel
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--dashboard-border)]">
                  {ships.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-[var(--dashboard-text-muted)]"
                      >
                        <Ship size={28} className="mx-auto mb-2 opacity-20" />
                        Connecting to fleet network...
                      </td>
                    </tr>
                  ) : (
                    ships.map((ship) => (
                      <tr
                        key={ship.shipId}
                        className="hover:bg-[var(--dashboard-card-hover)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link to={`/dashboard/ships/${ship.shipId}`} className="hover:text-[var(--primary)] transition-colors inline-block">
                            <div className="font-medium">{ship.name}</div>
                            <div className="text-xs font-mono text-[var(--dashboard-text-muted)]">
                              {ship.shipId}
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ship.status} />
                        </td>
                        <td className="px-4 py-3 text-[var(--dashboard-text-muted)] truncate max-w-[150px]">
                          {ship.destinationName}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-[var(--dashboard-bg)] rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  ship.insufficientFuel
                                    ? "bg-red-500"
                                    : "bg-[var(--primary)]"
                                }`}
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      (ship.fuel / ship.fuelCapacity) * 100
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-[var(--dashboard-text-muted)]">
                              {Math.round((ship.fuel / ship.fuelCapacity) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedShip(ship)}
                            className="border-[var(--primary)]/50 text-[var(--primary)] hover:bg-[var(--primary)]/10 text-xs"
                          >
                            <Send size={12} className="mr-1" />
                            Issue Directive
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Directive Issue Modal */}
      {selectedShip && (
        <IssueDirectiveModal
          ship={selectedShip}
          onClose={() => setSelectedShip(null)}
        />
      )}
    </div>
  );
}
