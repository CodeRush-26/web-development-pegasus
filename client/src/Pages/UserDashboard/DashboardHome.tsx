import { useState, useEffect } from "react";
import useUserStore from "@/store/userStore";
import {
  Ship,
  AlertTriangle,
  Wind,
  Map as MapIcon,
  ShieldAlert,
  ArrowRight,
  Activity,
  History,
} from "lucide-react";
import { StatsCard } from "@/components/ui/stats-card";
import { useFleetStore } from "@/store/fleetStore";
import { useFleetSocket } from "@/hooks/useFleetSocket";
import FleetMap from "@/Pages/CommandCenter/FleetMap";

export default function DashboardHome() {
  const { user } = useUserStore();
  const [greeting, setGreeting] = useState("");
  
  // Connect WebSocket to live fleet data
  useFleetSocket();
  const { ships, alerts } = useFleetStore();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Compute live stats
  const activeShips = ships.filter(s => s.status !== "arrived" && s.status !== "out_of_fuel").length;
  const criticalAlerts = alerts.filter(a => !a.acknowledged && a.severity >= 4).length;
  const weatherAffected = ships.filter(s => s.weatherPenaltyActive).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-[var(--foreground)]">
          <ShieldAlert className="text-[var(--primary)]" />
          {greeting}, Commander {user?.name.split(' ')[0]}
        </h1>
        <p className="text-[var(--dashboard-text-muted)]">
          Fleet Status: <span className="text-green-500 font-medium">Operational</span> • 15 ships tracked in the Strait of Hormuz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Ships"
          value={activeShips.toString()}
          icon={<Ship size={20} className="text-[var(--primary)]" />}
          iconClassName="bg-[var(--primary)]/10"
        />
        <StatsCard
          title="Critical Alerts"
          value={criticalAlerts.toString()}
          icon={<AlertTriangle size={20} className={criticalAlerts > 0 ? "text-red-500" : "text-[var(--dashboard-text-muted)]"} />}
          iconClassName={criticalAlerts > 0 ? "bg-red-500/10" : "bg-[var(--dashboard-card-hover)]"}
        />
        <StatsCard
          title="Adverse Weather"
          value={weatherAffected.toString()}
          icon={<Wind size={20} className={weatherAffected > 0 ? "text-amber-500" : "text-[var(--dashboard-text-muted)]"} />}
          iconClassName={weatherAffected > 0 ? "bg-amber-500/10" : "bg-[var(--dashboard-card-hover)]"}
        />
        <StatsCard
          title="System Latency"
          value="Live"
          icon={<Activity size={20} className="text-green-500" />}
          iconClassName="bg-green-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fleet Overview Map Placeholder */}
        <div className="lg:col-span-2 bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-[var(--dashboard-border)] flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <MapIcon size={18} className="text-[var(--primary)]" />
              Live Fleet Position
            </h2>
            <Link to="/dashboard" className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1">
              Full Map <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 relative overflow-hidden bg-[#e5e3df]">
            <FleetMap />
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] flex flex-col">
          <div className="p-4 border-b border-[var(--dashboard-border)] flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              Active Alerts
            </h2>
          </div>
          <div className="flex-1 p-0 overflow-y-auto max-h-[300px]">
            {alerts.filter(a => !a.acknowledged).length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3">
                  <ShieldAlert size={24} />
                </div>
                <p className="font-medium text-sm">All clear</p>
                <p className="text-xs text-[var(--dashboard-text-muted)] mt-1">
                  No active alerts detected across the fleet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--dashboard-border)]">
                {alerts.filter(a => !a.acknowledged).sort((a, b) => b.timestamp - a.timestamp).slice(0, 4).map(alert => (
                  <li key={alert.alertId} className="p-4 hover:bg-[var(--dashboard-card-hover)] transition-colors flex gap-3">
                    <div className={`mt-1 flex-shrink-0 ${alert.severity >= 4 ? 'text-red-500' : alert.severity === 3 ? 'text-amber-500' : 'text-blue-500'}`}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--dashboard-bg)] text-[var(--dashboard-text-muted)] border border-[var(--dashboard-border)] font-mono">
                          {alert.shipId}
                        </span>
                        <span className="text-xs text-[var(--dashboard-text-muted)]">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="p-4 border-t border-[var(--dashboard-border)]">
            <Link to="/dashboard" className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/5 rounded-lg transition-colors">
              <History size={16} />
              View Alert History
            </Link>
          </div>
        </div>
      </div>

      {/* Fleet List Preview */}
      <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--dashboard-border)]">
          <h2 className="font-semibold">Fleet Manifest</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[var(--dashboard-bg)] border-b border-[var(--dashboard-border)]">
                <th className="px-6 py-3 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Ship ID</th>
                <th className="px-6 py-3 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Fuel</th>
                <th className="px-6 py-3 font-medium text-[var(--dashboard-text-muted)] uppercase tracking-wider">Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dashboard-border)]">
              {ships.slice(0, 5).map((ship) => (
                <tr key={ship.shipId} className="hover:bg-[var(--dashboard-card-hover)] transition-colors">
                  <td className="px-6 py-4 font-mono font-medium">{ship.shipId}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {ship.name}
                    {ship.weatherPenaltyActive && <Wind size={14} className="text-amber-500" title="Adverse Weather" />}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      ship.status === 'normal' || ship.status === 'arrived' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      ship.status === 'distressed' || ship.status === 'out_of_fuel' || ship.status === 'stranded' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {ship.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-[var(--dashboard-bg)] rounded-full h-1.5 max-w-[100px] relative" title={`${Math.round(ship.fuel)} / ${ship.fuelCapacity} tons`}>
                      <div 
                        className={`h-1.5 rounded-full ${ship.insufficientFuel ? 'bg-red-500' : 'bg-[var(--primary)]'}`} 
                        style={{ width: `${Math.max(0, Math.min(100, (ship.fuel / ship.fuelCapacity) * 100))}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--dashboard-text-muted)] truncate max-w-[150px]" title={ship.destinationName}>
                    {ship.destinationName}
                  </td>
                </tr>
              ))}
              {ships.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--dashboard-text-muted)]">
                    <Ship size={32} className="mx-auto mb-3 opacity-20" />
                    Connecting to simulator...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)]/30 text-center">
          <Link to="/dashboard" className="text-sm font-medium text-[var(--primary)] hover:underline">
            View full manifest ({ships.length} ships)
          </Link>
        </div>
      </div>
    </div>
  );
}
