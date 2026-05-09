import { useEffect, useState } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { usePlaybackStore } from "@/store/playbackStore";
import { useSocketStore } from "@/store/socketStore";
import { ShipState, Zone } from "@/types/fleet";
import { TimelineScrubber } from "@/components/ui/timeline-scrubber";
import { History, ShieldAlert } from "lucide-react";

const MAP_ID = "FLEET_PLAYBACK_MAP_ID";

/** Maps a ship's heading to a rotation angle for the marker icon */
function ShipMarker({ ship }: { ship: ShipState }) {
  const isAdverse = ship.weatherPenaltyActive;
  
  let color = "#10b981"; // green
  if (ship.status === "rerouting") color = "#f59e0b"; // amber
  if (ship.status === "distressed" || ship.status === "stranded" || ship.status === "out_of_fuel") color = "#ef4444"; // red
  if (ship.status === "stopped") color = "#6b7280"; // gray

  return (
    <AdvancedMarker
      position={{ lat: ship.position[0], lng: ship.position[1] }}
      title={`${ship.name} (${ship.status})`}
      zIndex={1}
    >
      <div 
        className="relative flex items-center justify-center transition-transform scale-100 hover:scale-110"
        style={{ transform: `rotate(${ship.heading}deg)` }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill={color} 
          stroke="black" 
          strokeWidth="1.5"
          className="drop-shadow-md opacity-80"
        >
          <path d="M12 2 L16 8 L16 20 C16 21.1 15.1 22 14 22 L10 22 C8.9 22 8 21.1 8 20 L8 8 Z" />
        </svg>
        
        {isAdverse && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white" />
        )}
      </div>
    </AdvancedMarker>
  );
}

function ZonePolygon({ zone }: { zone: Zone }) {
  const map = useMap();
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;

    const paths = zone.polygon.map(p => ({ lat: p[0], lng: p[1] }));
    const p = new google.maps.Polygon({
      paths,
      strokeColor: "#ef4444",
      strokeOpacity: 0.6,
      strokeWeight: 2,
      fillColor: "#ef4444",
      fillOpacity: 0.2,
      map,
    });

    setPolygon(p);
    return () => p.setMap(null);
  }, [map, zone]);

  return null;
}

export default function PlaybackDashboard() {
  const { currentSnapshot, clearPlayback } = usePlaybackStore();
  const { send } = useSocketStore();
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    setApiKey(import.meta.env.VITE_GOOGLE_MAPS_KEY || "");
    
    // Request initial playback data
    send("get_snapshots", {});
    send("get_timeline_markers", {});

    return () => {
      clearPlayback(); // Cleanup when leaving page
    };
  }, [send, clearPlayback]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -mx-4 md:-mx-8">
      {/* Header bar */}
      <div className="bg-[var(--dashboard-card)] px-6 py-3 border-b border-[var(--dashboard-border)] flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg">
            <History size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Historical Playback</h1>
            <p className="text-xs text-[var(--dashboard-text-muted)]">Review the last 60 minutes of fleet operations</p>
          </div>
        </div>
        
        {/* Playback Stats */}
        {currentSnapshot && (
          <div className="flex gap-4">
            <div className="bg-red-500/10 px-3 py-1.5 rounded-md border border-red-500/20 flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-500" />
              <span className="text-sm font-medium text-red-500">
                {currentSnapshot.alerts.length} Active Alerts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        {!apiKey ? (
          <div className="w-full h-full flex items-center justify-center bg-[var(--dashboard-bg)]">
            <p>Loading Map...</p>
          </div>
        ) : (
          <APIProvider apiKey={apiKey}>
            <Map
              mapId={MAP_ID}
              defaultCenter={{ lat: 26.5, lng: 56.0 }} // Strait of Hormuz
              defaultZoom={7}
              gestureHandling="greedy"
              disableDefaultUI={true}
              className="w-full h-full"
            >
              {/* Render Historical Ships */}
              {currentSnapshot?.ships.map((ship) => (
                <ShipMarker key={ship.shipId} ship={ship} />
              ))}

              {/* Render Historical Zones */}
              {currentSnapshot?.zones.map((zone) => (
                <ZonePolygon key={zone.zoneId} zone={zone} />
              ))}
            </Map>
          </APIProvider>
        )}
        
        {/* Playback Overlay Label */}
        <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-full text-xs font-mono border border-white/20 uppercase tracking-widest shadow-lg backdrop-blur-sm animate-pulse">
          Playback Mode Active
        </div>
      </div>

      {/* Bottom Timeline Scrubber */}
      <TimelineScrubber />
    </div>
  );
}
