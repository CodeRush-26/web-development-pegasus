import { useFleetStore } from "@/store/fleetStore";
import { useFleetSocket } from "@/hooks/useFleetSocket";
import { Ship, Wind, Navigation, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ManifestPage() {
  useFleetSocket();
  const { ships } = useFleetStore();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredShips = ships.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.shipId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ship className="text-[var(--primary)]" />
            Full Fleet Manifest
          </h1>
          <p className="text-sm text-[var(--dashboard-text-muted)] mt-1">
            Real-time status and telemetry for all active vessels.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-text-muted)]" size={16} />
          <input
            type="text"
            placeholder="Search vessels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>
      </div>

      <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[var(--dashboard-bg)] border-b border-[var(--dashboard-border)]">
                <th className="px-6 py-4 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Ship ID</th>
                <th className="px-6 py-4 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Vessel Name</th>
                <th className="px-6 py-4 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Operational Status</th>
                <th className="px-6 py-4 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Fuel Level</th>
                <th className="px-6 py-4 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Speed</th>
                <th className="px-6 py-4 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Destination</th>
                <th className="px-6 py-4 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dashboard-border)]">
              {filteredShips.map((ship) => (
                <tr key={ship.shipId} className="hover:bg-[var(--dashboard-card-hover)] transition-colors">
                  <td className="px-6 py-4 font-mono text-xs">{ship.shipId}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/dashboard/ships/${ship.shipId}`} className="font-medium hover:text-[var(--primary)] transition-colors">
                        {ship.name}
                      </Link>
                      {ship.weatherPenaltyActive && <Wind size={14} className="text-amber-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      ship.status === 'normal' || ship.status === 'arrived' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                      ship.status === 'distressed' || ship.status === 'out_of_fuel' || ship.status === 'stranded' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {ship.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-[var(--dashboard-bg)] rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${ship.insufficientFuel ? 'bg-red-500' : 'bg-[var(--primary)]'}`} 
                          style={{ width: `${(ship.fuel / ship.fuelCapacity) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{Math.round((ship.fuel / ship.fuelCapacity) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{ship.speed.toFixed(1)} kn</td>
                  <td className="px-6 py-4 text-[var(--dashboard-text-muted)] truncate max-w-[180px]">
                    {ship.destinationName}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/dashboard/ships/${ship.shipId}`}>
                        <Navigation size={14} className="mr-2" />
                        Details
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredShips.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--dashboard-text-muted)]">
                    <Ship size={40} className="mx-auto mb-4 opacity-10" />
                    <p>No vessels matching "{searchTerm}"</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
