import { useState } from "react";
import { useSocketStore } from "@/store/socketStore";
import { Directive } from "@/types/fleet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  AlertCircle, 
  MapPin, 
  Navigation, 
  Hand, 
  CheckCircle2, 
  AlertOctagon,
  MessageSquareWarning 
} from "lucide-react";

interface DirectiveInboxProps {
  directive: Directive | null;
  shipId: string;
}

export function DirectiveInbox({ directive, shipId }: DirectiveInboxProps) {
  const { send } = useSocketStore();
  const [isEscalating, setIsEscalating] = useState(false);
  const [distressMessage, setDistressMessage] = useState("");

  if (!directive) {
    return (
      <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6 text-center">
        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 size={24} />
        </div>
        <h3 className="font-semibold text-lg">No Active Directives</h3>
        <p className="text-sm text-[var(--dashboard-text-muted)] mt-1">
          Continue on your current assigned route.
        </p>
      </div>
    );
  }

  const handleAccept = () => {
    send("directive_accept", {});
    toast.success("Directive accepted. Adjusting course.");
  };

  const handleEscalate = () => {
    if (!distressMessage.trim()) {
      toast.error("Please provide details for the escalation");
      return;
    }
    
    send("directive_escalate", { message: distressMessage });
    setIsEscalating(false);
    setDistressMessage("");
    toast.error("Emergency distress signal sent to Command.");
  };

  const renderIcon = () => {
    switch (directive.type) {
      case "reroute_to_port": return <Navigation className="text-amber-500" />;
      case "divert_to_waypoint": return <MapPin className="text-blue-500" />;
      case "hold_position": return <Hand className="text-red-500" />;
      default: return <AlertCircle className="text-primary" />;
    }
  };

  const renderActionText = () => {
    switch (directive.type) {
      case "reroute_to_port": return `Reroute to Port: ${directive.targetPortId}`;
      case "divert_to_waypoint": return `Divert to coordinates: ${directive.targetWaypoint?.map(c => c.toFixed(4)).join(", ")}`;
      case "hold_position": return "Hold current position immediately";
      default: return "Unknown directive";
    }
  };

  return (
    <div className="bg-[var(--dashboard-card)] rounded-xl border border-amber-500/50 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
      
      <div className="p-4 border-b border-[var(--dashboard-border)] flex items-center justify-between bg-amber-500/5">
        <h2 className="font-semibold flex items-center gap-2 text-amber-500">
          <AlertCircle size={18} />
          Priority Directive Received
        </h2>
        <span className="text-xs text-[var(--dashboard-text-muted)] font-mono">
          ID: {directive.directiveId.split('-')[1]}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-[var(--dashboard-bg)] rounded-lg border border-[var(--dashboard-border)]">
            {renderIcon()}
          </div>
          <div>
            <h3 className="font-medium text-lg capitalize">{directive.type.replace(/_/g, " ")}</h3>
            <p className="text-[var(--dashboard-text-muted)] mt-1">{renderActionText()}</p>
            <p className="text-xs text-[var(--dashboard-text-muted)] mt-2">
              Issued at: {new Date(directive.issuedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {!isEscalating ? (
          <div className="flex gap-3 mt-6">
            <Button 
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" 
              onClick={handleAccept}
            >
              <CheckCircle2 size={16} className="mr-2" />
              Acknowledge & Comply
            </Button>
            <Button 
              variant="outline" 
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              onClick={() => setIsEscalating(true)}
            >
              <AlertOctagon size={16} className="mr-2" />
              Unable to Comply
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 mb-3">
              <h4 className="text-red-500 font-medium flex items-center gap-2 mb-2 text-sm">
                <MessageSquareWarning size={16} />
                Distress Signal / Escalation
              </h4>
              <p className="text-xs text-[var(--dashboard-text-muted)]">
                Provide reason for non-compliance. This will be analyzed by Fleet Command AI.
              </p>
            </div>
            
            <textarea
              autoFocus
              className="w-full bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
              placeholder="e.g. Engine failure, cannot change course. Require tug assistance."
              value={distressMessage}
              onChange={(e) => setDistressMessage(e.target.value)}
            />
            
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                onClick={handleEscalate}
              >
                Transmit Distress Signal
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setIsEscalating(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
