import { useFleetStore } from "@/store/fleetStore";
import { useFleetSocket } from "@/hooks/useFleetSocket";
import { AlertTriangle, History, Search, Filter, ShieldAlert, Radio, Info, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AlertHistoryPage() {
  useFleetSocket();
  const { alerts } = useFleetStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<number | 'all'>('all');

  const filteredAlerts = alerts
    .filter(a => 
      (a.message.toLowerCase().includes(searchTerm.toLowerCase()) || a.shipId.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterSeverity === 'all' || a.severity === filterSeverity)
    )
    .sort((a, b) => b.timestamp - a.timestamp);

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 4: return { label: "Critical", class: "bg-red-500/10 text-red-500 border-red-500/20", icon: ShieldAlert };
      case 3: return { label: "High", class: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertTriangle };
      case 2: return { label: "Medium", class: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: AlertTriangle };
      default: return { label: "Low", class: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Info };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="text-[var(--primary)]" />
            Alert History
          </h1>
          <p className="text-sm text-[var(--dashboard-text-muted)] mt-1">
            Complete logs of all fleet notifications, breaches, and distress signals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-text-muted)]" size={16} />
            <input
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <select 
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-lg text-sm focus:outline-none focus:border-[var(--primary)]"
          >
            <option value="all">All Severities</option>
            <option value="4">Critical Only</option>
            <option value="3">High Severity</option>
            <option value="2">Medium Severity</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden">
        <div className="divide-y divide-[var(--dashboard-border)]">
          {filteredAlerts.map((alert) => {
            const { label, class: colorClass, icon: Icon } = getSeverityLabel(alert.severity);
            const isCaptainReport = alert.type === "captain_report";

            return (
              <div key={alert.alertId} className="p-6 hover:bg-[var(--dashboard-card-hover)] transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl border ${colorClass} group-hover:scale-110 transition-transform`}>
                    {isCaptainReport ? <Radio size={20} /> : <Icon size={20} />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${colorClass}`}>
                          {isCaptainReport ? "Captain Report" : label}
                        </span>
                        <span className="text-xs font-mono text-[var(--dashboard-text-muted)] bg-[var(--dashboard-bg)] px-2 py-0.5 rounded border border-[var(--dashboard-border)]">
                          {alert.shipId}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--dashboard-text-muted)]">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{alert.type.replace(/_/g, ' ')}</h3>
                    <p className="text-[var(--dashboard-text-muted)] leading-relaxed">{alert.message}</p>
                    
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-[10px] font-mono text-[var(--dashboard-text-muted)]">ID: {alert.alertId}</span>
                      {alert.acknowledged && (
                        <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest">
                          <CheckCircle2 size={12} /> Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredAlerts.length === 0 && (
            <div className="p-12 text-center text-[var(--dashboard-text-muted)]">
              <History size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg font-medium">No historical logs found</p>
              <p className="text-sm">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
