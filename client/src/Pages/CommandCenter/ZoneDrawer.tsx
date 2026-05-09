import { useState, useEffect } from "react";
import { useMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Plus, X, Check, Hexagon, Trash2 } from "lucide-react";
import { useSocketStore } from "@/store/socketStore";
import { useFleetStore } from "@/store/fleetStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ZoneDrawer() {
  const map = useMap();
  const { send } = useSocketStore();
  const { zones } = useFleetStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [vertices, setVertices] = useState<[number, number][]>([]);
  const [zoneName, setZoneName] = useState("");
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showZoneList, setShowZoneList] = useState(false);

  // We add a click listener to the map when drawing mode is active
  useEffect(() => {
    if (!map) return;
    
    const listener = map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!isDrawing) return;
      if (!e.latLng) return;
      
      const newVertex: [number, number] = [e.latLng.lat(), e.latLng.lng()];
      setVertices(prev => [...prev, newVertex]);
    });

    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [map, isDrawing]);

  const handleCancel = () => {
    setIsDrawing(false);
    setVertices([]);
    setShowNameDialog(false);
    setZoneName("");
  };

  const handleFinishDrawing = () => {
    if (vertices.length < 3) {
      toast.error("A zone must have at least 3 points");
      return;
    }
    setShowNameDialog(true);
  };

  const handleSaveZone = () => {
    if (!zoneName.trim()) {
      toast.error("Please enter a zone name");
      return;
    }

    send("zone_create", {
      name: zoneName,
      polygon: vertices,
    });

    handleCancel();
  };

  const handleDeleteZone = (zoneId: string) => {
    if (!window.confirm("Are you sure you want to remove this restricted zone?")) return;
    send("zone_delete", { zoneId });
  };

  return (
    <>
      {/* Floating Toolbar */}
      <div className="absolute top-4 left-4 z-[100] flex flex-col gap-2">
        <div className="bg-[var(--dashboard-card)] rounded-lg shadow-lg border border-[var(--dashboard-border)] overflow-hidden">
          {!isDrawing ? (
            <div className="flex">
              <button
                onClick={() => setIsDrawing(true)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-[var(--dashboard-card-hover)] transition-colors text-sm font-medium border-r border-[var(--dashboard-border)]"
                title="Draw Restricted Zone"
              >
                <Hexagon size={16} className="text-red-500" />
                Add Restricted Zone
              </button>
              <button
                onClick={() => setShowZoneList(!showZoneList)}
                className={`px-4 py-2 hover:bg-[var(--dashboard-card-hover)] transition-colors text-sm font-medium ${showZoneList ? 'bg-[var(--dashboard-card-hover)]' : ''}`}
              >
                Manage Zones ({zones.length})
              </button>
            </div>
          ) : (
          <div className="flex items-center">
            <div className="px-4 py-2 bg-red-500/10 text-red-500 text-sm font-medium border-r border-[var(--dashboard-border)]">
              Drawing Mode Active: Click map to add points
            </div>
            <button
              onClick={handleFinishDrawing}
              disabled={vertices.length < 3}
              className="p-2 hover:bg-green-500/20 text-green-500 disabled:opacity-50 transition-colors"
              title="Finish shape"
            >
              <Check size={18} />
            </button>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-red-500/20 text-red-500 transition-colors border-l border-[var(--dashboard-border)]"
              title="Cancel drawing"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Active Zones List */}
        {showZoneList && !isDrawing && (
          <div className="bg-[var(--dashboard-card)] rounded-lg shadow-lg border border-[var(--dashboard-border)] p-3 w-80 max-h-64 overflow-y-auto animate-in slide-in-from-top-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--dashboard-text-muted)] mb-2">Active Restricted Zones</h4>
            {zones.length === 0 ? (
              <p className="text-sm text-[var(--dashboard-text-muted)]">No active zones.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {zones.map((zone) => (
                  <div key={zone.zoneId} className="flex items-center justify-between bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] p-2 rounded">
                    <span className="text-sm font-medium truncate max-w-[200px]">{zone.name}</span>
                    <button
                      onClick={() => handleDeleteZone(zone.zoneId)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                      title="Remove Zone"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Name Input Dialog Overlay */}
      {showNameDialog && (
        <div className="absolute inset-0 z-[200] bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[var(--dashboard-card)] p-6 rounded-xl border border-[var(--dashboard-border)] w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Hexagon className="text-red-500" />
              Name Restricted Zone
            </h3>
            <p className="text-sm text-[var(--dashboard-text-muted)] mb-4">
              Ships entering this zone will trigger a severity 4 geofence breach alert.
            </p>
            <input
              type="text"
              autoFocus
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="e.g. Navigational Hazard Alpha"
              className="w-full px-3 py-2 bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveZone();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleSaveZone}>
                Activate Zone
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Render the current drawing polygon points as markers (Google Maps Polygon is tricky in react-google-maps without advanced setup, markers give immediate feedback) */}
      {isDrawing && vertices.map((vertex, i) => (
        <AdvancedMarker key={i} position={{ lat: vertex[0], lng: vertex[1] }} zIndex={200}>
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
        </AdvancedMarker>
      ))}
    </>
  );
}
