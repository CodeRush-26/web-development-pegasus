/**
 * FleetMapPage.tsx
 * Full-page wrapper for the Fleet Map command centre.
 * Accessible at /dashboard/map for all logged-in users.
 */
import { useFleetSocket } from "@/hooks/useFleetSocket";
import FleetMap from "./FleetMap";
import { useFleetStore } from "@/store/fleetStore";
import { ZoneDrawer } from "./ZoneDrawer";
import useUserStore from "@/store/userStore";
import { MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";
import { NotificationCenter } from "@/components/NotificationCenter";

export default function FleetMapPage() {
  // Connect to live fleet data
  useFleetSocket();

  const { ships, alerts, zones } = useFleetStore();
  const { user } = useUserStore();

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="text-[var(--primary)]" />
            Fleet Map
          </h1>
          <p className="text-sm text-[var(--dashboard-text-muted)] mt-1">
            Live positions for {ships.length} vessel{ships.length !== 1 ? "s" : ""} · {zones.length} restricted zone{zones.length !== 1 ? "s" : ""} active
          </p>
        </div>

        {/* Alert Summary Badge */}
        {unacknowledgedAlerts.length > 0 ? (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-lg text-red-400 text-sm animate-pulse">
            <AlertTriangle size={16} />
            {unacknowledgedAlerts.length} unacknowledged alert{unacknowledgedAlerts.length !== 1 ? "s" : ""}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg text-green-400 text-sm">
            <CheckCircle2 size={16} />
            All clear
          </div>
        )}
      </div>

      {/* Map and Notification Split */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-[500px]">
        {/* Map */}
        <div className="flex-1 rounded-xl border border-[var(--dashboard-border)] overflow-hidden relative">
          <FleetMap />
        </div>

        {/* Unified Notifications Sidebar */}
        <div className="w-full lg:w-96 rounded-xl border border-[var(--dashboard-border)] bg-[var(--dashboard-card)] p-4 overflow-hidden flex flex-col">
          <NotificationCenter />
        </div>
      </div>

      {/* Admin hint */}
      {user?.role === "admin" && (
        <p className="text-xs text-[var(--dashboard-text-muted)] text-center">
          Admin: Click the draw tool on the map to create restricted zones. Click a ship marker to select it.
        </p>
      )}
    </div>
  );
}
