import { useEffect } from "react";
import { useFleetStore } from "@/store/fleetStore";
import useUserStore from "@/store/userStore";
import { useFleetSocket } from "@/hooks/useFleetSocket";
import FleetMap from "../CommandCenter/FleetMap";
import { DirectiveInbox } from "./DirectiveInbox";
import { Ship, Navigation, Wind, Activity } from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";

export default function CaptainView() {
  const { user } = useUserStore();
  const assignedShipId = user?.assignedShipId;
  
  // Connect to live fleet data
  useFleetSocket();
  const { ships, activeDirective } = useFleetStore();

  const myShip = ships.find(s => s.shipId === assignedShipId);

  if (!assignedShipId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <Ship size={64} className="text-[var(--dashboard-text-muted)] mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Assigned Ship</h2>
        <p className="text-[var(--dashboard-text-muted)] max-w-md">
          Your captain account has not been assigned to a vessel. Please contact Fleet Command.
        </p>
      </div>
    );
  }

  if (!myShip) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="animate-pulse flex flex-col items-center">
          <Ship size={48} className="text-[var(--primary)] mb-4" />
          <p className="text-[var(--dashboard-text-muted)]">Locating {assignedShipId} on satellite network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="text-[var(--primary)]" />
            {myShip.name} ({myShip.shipId})
          </h1>
          <p className="text-[var(--dashboard-text-muted)]">
            En route to <span className="font-medium text-[var(--dashboard-text)]">{myShip.destinationName}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[var(--dashboard-card)] px-4 py-2 rounded-lg border border-[var(--dashboard-border)]">
          <div className={`w-3 h-3 rounded-full ${
            myShip.status === 'normal' || myShip.status === 'arrived' ? 'bg-green-500' :
            myShip.status === 'distressed' || myShip.status === 'stranded' || myShip.status === 'out_of_fuel' ? 'bg-red-500 animate-pulse' :
            'bg-amber-500'
          }`}></div>
          <span className="font-medium capitalize">{myShip.status.replace("_", " ")}</span>
        </div>
      </div>

      {/* Ship Telemetry */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Speed"
          value={`${myShip.speed.toFixed(1)} kn`}
          icon={<Activity size={18} className="text-blue-500" />}
          iconClassName="bg-blue-500/10"
        />
        <StatsCard
          title="Heading"
          value={`${myShip.heading.toFixed(0)}°`}
          icon={<Navigation size={18} className="text-[var(--primary)]" style={{ transform: `rotate(${myShip.heading}deg)` }} />}
          iconClassName="bg-[var(--primary)]/10"
        />
        <StatsCard
          title="Fuel Remaining"
          value={`${Math.round((myShip.fuel / myShip.fuelCapacity) * 100)}%`}
          icon={<div className={`w-full h-1.5 rounded-full ${myShip.insufficientFuel ? 'bg-red-500' : 'bg-green-500'}`}></div>}
          iconClassName="w-10 bg-transparent flex items-center"
        />
        <StatsCard
          title="Weather"
          value={myShip.weatherPenaltyActive ? "Adverse" : "Clear"}
          icon={<Wind size={18} className={myShip.weatherPenaltyActive ? "text-amber-500" : "text-green-500"} />}
          iconClassName={myShip.weatherPenaltyActive ? "bg-amber-500/10" : "bg-green-500/10"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Map */}
        <div className="lg:col-span-2 flex flex-col h-[500px] bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden">
          <div className="p-3 border-b border-[var(--dashboard-border)] bg-[var(--dashboard-bg)]/50">
            <h3 className="font-medium text-sm">Navigational Chart</h3>
          </div>
          <div className="flex-1 relative">
            {/* We reuse the FleetMap. Since Zustand's selectedShipId is null by default, it will show all ships.
                Ideally, we could center it on this specific ship, but for MVP seeing the fleet is fine. */}
            <FleetMap />
          </div>
        </div>

        {/* Directive Inbox */}
        <div className="lg:col-span-1">
          <DirectiveInbox directive={activeDirective} shipId={myShip.shipId} />
        </div>
      </div>
    </div>
  );
}
