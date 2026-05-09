import { useState } from "react";
import { X, Send, Navigation, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocketStore } from "@/store/socketStore";
import { toast } from "sonner";
import { ShipState } from "@/types/fleet";

interface IssueDirectiveModalProps {
  ship: ShipState;
  onClose: () => void;
}

export function IssueDirectiveModal({ ship, onClose }: IssueDirectiveModalProps) {
  const { send } = useSocketStore();
  const [directiveType, setDirectiveType] = useState<"hold_position" | "reroute_to_port" | "divert_to_waypoint" | "evacuate_zone">("hold_position");

  const handleIssue = () => {
    // Basic validation
    let payload: any = {
      shipId: ship.shipId,
      directiveType,
    };

    if (directiveType === "reroute_to_port") {
      // Hardcoded fallback for now, in a real app this would be a select dropdown
      payload.targetPortId = "port-shanghai";
    }

    if (directiveType === "divert_to_waypoint") {
      payload.targetWaypoint = [ship.position[0] + 0.1, ship.position[1] + 0.1]; // Slightly ahead for demo
    }

    send("directive_send", payload);
    toast.success(`Directive issued to ${ship.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--dashboard-card)] w-full max-w-md rounded-xl border border-[var(--dashboard-border)] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-[var(--dashboard-border)] flex justify-between items-center bg-[var(--dashboard-card-hover)]">
          <h2 className="font-semibold flex items-center gap-2">
            <Send size={18} className="text-[var(--primary)]" />
            Issue Directive to {ship.shipId}
          </h2>
          <button onClick={onClose} className="text-[var(--dashboard-text-muted)] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-[var(--dashboard-text-muted)] mb-4">
              Select an operational directive to immediately transmit to the captain of <strong>{ship.name}</strong>.
            </p>

            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${directiveType === 'hold_position' ? 'border-red-500 bg-red-500/10' : 'border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card-hover)]'}`}>
                <input 
                  type="radio" 
                  name="directive" 
                  value="hold_position" 
                  checked={directiveType === "hold_position"}
                  onChange={() => setDirectiveType("hold_position")}
                  className="hidden"
                />
                <Hand className={directiveType === 'hold_position' ? 'text-red-500' : 'text-[var(--dashboard-text-muted)]'} size={20} />
                <div>
                  <div className="font-medium">Hold Position</div>
                  <div className="text-xs text-[var(--dashboard-text-muted)]">Instruct vessel to drop anchor immediately.</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${directiveType === 'reroute_to_port' ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card-hover)]'}`}>
                <input 
                  type="radio" 
                  name="directive" 
                  value="reroute_to_port" 
                  checked={directiveType === "reroute_to_port"}
                  onChange={() => setDirectiveType("reroute_to_port")}
                  className="hidden"
                />
                <Navigation className={directiveType === 'reroute_to_port' ? 'text-blue-500' : 'text-[var(--dashboard-text-muted)]'} size={20} />
                <div>
                  <div className="font-medium">Reroute to Safe Port</div>
                  <div className="text-xs text-[var(--dashboard-text-muted)]">Divert to the nearest available safe harbor.</div>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${directiveType === 'evacuate_zone' ? 'border-amber-500 bg-amber-500/10' : 'border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card-hover)]'}`}>
                <input 
                  type="radio" 
                  name="directive" 
                  value="evacuate_zone" 
                  checked={directiveType === "evacuate_zone"}
                  onChange={() => setDirectiveType("evacuate_zone")}
                  className="hidden"
                />
                <Navigation className={directiveType === 'evacuate_zone' ? 'text-amber-500' : 'text-[var(--dashboard-text-muted)]'} size={20} />
                <div>
                  <div className="font-medium">Evacuate Restricted Zone</div>
                  <div className="text-xs text-[var(--dashboard-text-muted)]">Take the shortest path out of the restricted zone.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-[var(--dashboard-border)]">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white" onClick={handleIssue}>
              Transmit Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
