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
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme-provider";
import { StatsCard } from "@/components/ui/stats-card";

export default function DashboardHome() {
  const { user } = useUserStore();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

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
          value="15"
          icon={<Ship size={20} className="text-[var(--primary)]" />}
          iconClassName="bg-[var(--primary)]/10"
        />
        <StatsCard
          title="Critical Alerts"
          value="0"
          icon={<AlertTriangle size={20} className="text-red-500" />}
          iconClassName="bg-red-500/10"
        />
        <StatsCard
          title="Adverse Weather"
          value="2"
          icon={<Wind size={20} className="text-amber-500" />}
          iconClassName="bg-amber-500/10"
        />
        <StatsCard
          title="System Latency"
          value="342ms"
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
          <div className="flex-1 bg-[var(--dashboard-bg)] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            <div className="text-center z-10 p-6">
              <Ship size={48} className="mx-auto mb-4 text-[var(--primary)] animate-pulse" />
              <p className="text-[var(--dashboard-text-muted)] max-w-xs">
                Ship Simulator is initializing. Real-time geospatial data will appear here once Step 1 is complete.
              </p>
            </div>
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
          <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-3">
              <ShieldAlert size={24} />
            </div>
            <p className="font-medium text-sm">All clear</p>
            <p className="text-xs text-[var(--dashboard-text-muted)] mt-1">
              No geofence breaches or proximity warnings detected.
            </p>
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
              {[
                { id: "MV-1", name: "Alcyon", status: "Normal", fuel: "82%", dest: "Bandar Abbas" },
                { id: "MV-2", name: "Borealis", status: "Normal", fuel: "95%", dest: "Dubai" },
                { id: "MV-3", name: "Cygnus", status: "Rerouting", fuel: "45%", dest: "Kuwait" },
              ].map((ship) => (
                <tr key={ship.id} className="hover:bg-[var(--dashboard-card-hover)] transition-colors">
                  <td className="px-6 py-4 font-mono font-medium">{ship.id}</td>
                  <td className="px-6 py-4">{ship.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      ship.status === 'Normal' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                      'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {ship.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-[var(--dashboard-bg)] rounded-full h-1.5 max-w-[100px]">
                      <div className="bg-[var(--primary)] h-1.5 rounded-full" style={{ width: ship.fuel }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[var(--dashboard-text-muted)]">{ship.dest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
