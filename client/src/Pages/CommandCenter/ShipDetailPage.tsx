import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Navigation, ShieldAlert, Gauge, Activity, Radio, AlertTriangle, Wind, Package } from "lucide-react";
import { useFleetStore } from "@/store/fleetStore";
import { useFleetSocket } from "@/hooks/useFleetSocket";
import { MapPin } from "lucide-react";
import { Map, AdvancedMarker, APIProvider, MapCameraChangedEvent } from "@vis.gl/react-google-maps";
import { useState } from "react";

export default function ShipDetailPage() {
  useFleetSocket();
  const { shipId } = useParams();
  const { ships, activeDirective } = useFleetStore();
  const ship = ships.find(s => s.shipId === shipId);
  const [apiKey] = useState(import.meta.env.VITE_GOOGLE_MAPS_KEY || "");

  if (!ship) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-[var(--dashboard-text-muted)]">
        <AlertTriangle size={48} className="mb-4 text-[var(--primary)] opacity-50" />
        <h2 className="text-xl font-bold mb-2 text-[var(--dashboard-text)]">Ship Not Found</h2>
        <p>Telemetry for {shipId} is not available in the current simulation instance.</p>
        <Link to="/dashboard/map" className="mt-6 text-[var(--primary)] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Return to Fleet Map
        </Link>
      </div>
    );
  }

  const fuelPercentage = Math.round((ship.fuel / ship.fuelCapacity) * 100);

  let statusColor = "text-green-500";
  if (ship.status === "rerouting" || ship.status === "evacuating") statusColor = "text-amber-500";
  if (ship.status === "distressed" || ship.status === "stranded" || ship.status === "out_of_fuel") statusColor = "text-red-500 animate-pulse";
  if (ship.status === "holding") statusColor = "text-gray-500";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/map" className="p-2 bg-[var(--dashboard-card)] hover:bg-[var(--dashboard-card-hover)] rounded-md border border-[var(--dashboard-border)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            {ship.name}
            <span className="text-sm font-mono bg-[var(--dashboard-card)] px-2 py-1 rounded text-[var(--dashboard-text-muted)] border border-[var(--dashboard-border)]">
              {ship.shipId}
            </span>
          </h1>
          <p className="text-sm text-[var(--dashboard-text-muted)] flex items-center gap-2 mt-1">
            <span className={`capitalize font-medium ${statusColor}`}>{ship.status.replace(/_/g, " ")}</span>
            • Assigned Destination: {ship.destinationName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Telemetry Panel */}
        <div className="space-y-6">
          <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-5">
            <h2 className="text-sm font-semibold text-[var(--dashboard-text-muted)] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={16} /> Live Telemetry
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--dashboard-bg)] rounded-lg border border-[var(--dashboard-border)]">
                <p className="text-xs text-[var(--dashboard-text-muted)] mb-1 flex items-center gap-1"><Gauge size={14} /> Speed</p>
                <p className="text-2xl font-mono font-medium">{ship.speed.toFixed(1)}<span className="text-sm text-[var(--dashboard-text-muted)] ml-1">knots</span></p>
              </div>
              <div className="p-4 bg-[var(--dashboard-bg)] rounded-lg border border-[var(--dashboard-border)]">
                <p className="text-xs text-[var(--dashboard-text-muted)] mb-1 flex items-center gap-1"><Navigation size={14} /> Heading</p>
                <p className="text-2xl font-mono font-medium">{Math.round(ship.heading)}°</p>
              </div>
              <div className="p-4 bg-[var(--dashboard-bg)] rounded-lg border border-[var(--dashboard-border)] col-span-2">
                <p className="text-xs text-[var(--dashboard-text-muted)] mb-1 flex items-center gap-1"><MapPin size={14} /> Position (Lat, Lng)</p>
                <p className="text-lg font-mono font-medium">
                  {ship.position[0].toFixed(6)}, {ship.position[1].toFixed(6)}
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-[var(--dashboard-bg)] rounded-lg border border-[var(--dashboard-border)]">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-[var(--dashboard-text-muted)] flex items-center gap-1"><Package size={14} /> Cargo Type</p>
                <span className="text-xs font-medium uppercase px-2 py-0.5 bg-[var(--dashboard-card)] rounded border border-[var(--dashboard-border)]">{ship.cargo}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--dashboard-text-muted)]">Fuel Reserves</span>
                <span className={fuelPercentage < 20 ? "text-red-500 font-medium" : ""}>{fuelPercentage}%</span>
              </div>
              <div className="w-full bg-[var(--dashboard-bg)] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${fuelPercentage < 20 ? "bg-red-500" : "bg-[var(--primary)]"}`}
                  style={{ width: `${Math.max(0, Math.min(100, fuelPercentage))}%` }}
                ></div>
              </div>
              <p className="text-xs text-[var(--dashboard-text-muted)] mt-2 text-right">
                {Math.round(ship.fuel)} / {ship.fuelCapacity} tons
              </p>
            </div>
            
            {ship.weatherPenaltyActive && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                <Wind className="text-blue-400 mt-0.5" size={16} />
                <div>
                  <p className="text-sm font-medium text-blue-400">Adverse Weather Encountered</p>
                  <p className="text-xs text-blue-400/80">Speed reduced by 30%, fuel consumption increased.</p>
                </div>
              </div>
            )}
          </div>

          {/* Active Directive if applicable */}
          {activeDirective && activeDirective.shipId === ship.shipId && (
             <div className="bg-amber-500/10 rounded-xl border border-amber-500/30 p-5">
              <h2 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Radio size={16} /> Command Directive
              </h2>
              <div className="p-3 bg-[var(--dashboard-card)]/50 rounded border border-amber-500/20">
                <p className="font-medium capitalize mb-1">{activeDirective.type.replace(/_/g, " ")}</p>
                <p className="text-xs text-[var(--dashboard-text-muted)]">Issued {new Date(activeDirective.issuedAt).toLocaleTimeString()}</p>
              </div>
             </div>
          )}
        </div>

        {/* Mini Map */}
        <div className="lg:col-span-2 bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden h-[400px] lg:h-[600px] relative">
           {apiKey ? (
             <APIProvider apiKey={apiKey}>
               <Map
                 mapId="MINI_SHIP_MAP"
                 center={{ lat: ship.position[0], lng: ship.position[1] }}
                 zoom={12}
                 disableDefaultUI={true}
                 gestureHandling="cooperative"
               >
                 <AdvancedMarker
                    position={{ lat: ship.position[0], lng: ship.position[1] }}
                 >
                   <div className="relative">
                      {/* Pulse ring */}
                      <div className="absolute -inset-4 bg-[var(--primary)]/20 rounded-full animate-ping" />
                      {/* Ship dot */}
                      <div className="relative w-4 h-4 bg-[var(--primary)] rounded-full border-2 border-white shadow-lg" />
                   </div>
                 </AdvancedMarker>
               </Map>
             </APIProvider>
           ) : (
             <div className="flex items-center justify-center h-full text-[var(--dashboard-text-muted)]">
               Map Unavailable
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
