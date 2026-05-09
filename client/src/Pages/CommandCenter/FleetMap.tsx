import { useEffect, useState } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useFleetStore } from "@/store/fleetStore";
import { ShipState, Zone } from "@/types/fleet";
import { ZoneDrawer } from "./ZoneDrawer";
import useUserStore from "@/store/userStore";
import { useMap } from "@vis.gl/react-google-maps";

const MAP_ID = "FLEET_COMMAND_MAP_ID";

function ShipMarker({ ship, selected }: { ship: ShipState; selected: boolean }) {
  const isAdverse = ship.weatherPenaltyActive;
  const { user } = useUserStore();
  
  // Status colors matching our design system
  let color = "#10b981"; // green (normal/arrived)
  if (ship.status === "rerouting") color = "#f59e0b"; // amber
  if (ship.status === "holding") color = "#f97316"; // orange — blocked by zone
  if (ship.status === "distressed" || ship.status === "stranded" || ship.status === "out_of_fuel") color = "#ef4444"; // red
  if (ship.status === "stopped") color = "#6b7280"; // gray

  // Override with purple if it's the captain's assigned ship
  if (user?.role === "captain" && user?.assignedShipId === ship.shipId) {
    color = "#8b5cf6"; // purple-500
  }

  return (
    <AdvancedMarker
      position={{ lat: ship.position[0], lng: ship.position[1] }}
      title={`${ship.name} (${ship.status})`}
      zIndex={selected ? 100 : 1}
      onClick={() => useFleetStore.getState().setSelectedShip(ship.shipId)}
    >
      <div 
        className={`relative flex items-center justify-center transition-transform ${selected ? 'scale-125' : 'scale-100 hover:scale-110'}`}
        style={{ transform: `rotate(${ship.heading}deg)` }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill={color} 
          stroke={selected ? "white" : "black"} 
          strokeWidth="1.5"
          className="drop-shadow-md"
        >
          {/* Top-down ship silhouette */}
          <path d="M12 2 L16 8 L16 20 C16 21.1 15.1 22 14 22 L10 22 C8.9 22 8 21.1 8 20 L8 8 Z" />
        </svg>
        
        {isAdverse && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white animate-pulse" title="Adverse Weather" />
        )}
      </div>
    </AdvancedMarker>
  );
}



/** Helper component to render a polygon using Google Maps API */
function ZonePolygon({ zone }: { zone: Zone }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const paths = zone.polygon.map(p => ({ lat: p[0], lng: p[1] }));
    
    // Color: ship-specific zones are amber, fleet-wide are red
    const isShipSpecific = zone.restrictedShipIds && zone.restrictedShipIds.length > 0;
    const strokeColor = isShipSpecific ? "#f59e0b" : "#ef4444";
    const fillColor   = isShipSpecific ? "#f59e0b" : "#ef4444";

    const p = new google.maps.Polygon({
      paths,
      strokeColor,
      strokeOpacity: 0.9,
      strokeWeight: 2,
      fillColor,
      fillOpacity: 0.3,
      map,
    });

    const label = isShipSpecific
      ? `⚠ ${zone.name}<br/><small>Restricts: ${zone.restrictedShipIds!.join(", ")}</small>`
      : `🚫 ${zone.name}`;

    const infoWindow = new google.maps.InfoWindow({
      content: `<div style="padding:6px;font-weight:bold;color:${strokeColor};line-height:1.4">${label}</div>`
    });

    p.addListener('click', (e: any) => {
      infoWindow.setPosition(e.latLng);
      infoWindow.open(map);
    });

    p.addListener('mouseout', () => infoWindow.close());

    return () => {
      p.setMap(null);
      infoWindow.close();
    };
    // Only depend on zone identity + map, not the full zone object reference.
    // This prevents polygon being destroyed/recreated every fleet_update tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, zone.zoneId]);

  return null;
}

/** Helper component to render ship routes (multiple alternative paths) */
function ShipRoute({ ship, selected }: { ship: ShipState; selected: boolean }) {
  const map = useMap();
  const [primaryLine, setPrimaryLine] = useState<google.maps.Polyline | null>(null);
  const [altLineA, setAltLineA] = useState<google.maps.Polyline | null>(null);
  const [altLineB, setAltLineB] = useState<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !ship.currentPath || ship.currentPath.length < 1) return;

    // Always start the visual route from the ship's current position
    const fullPath = [ship.position, ...ship.currentPath];
    const path = fullPath.map(p => ({ lat: p[0], lng: p[1] }));

    // Primary Line
    const pLine = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: ship.weatherPenaltyActive ? "#f59e0b" : "#3b82f6",
      strokeOpacity: selected ? 1.0 : 0.6,
      strokeWeight: selected ? 4 : 3,
      map
    });

    setPrimaryLine(pLine);

    // Alternative lines (only show when selected to avoid clutter)
    let aLine: google.maps.Polyline | null = null;
    let bLine: google.maps.Polyline | null = null;

    if (selected && window.google?.maps?.geometry) {
      // Create alternative routes by offsetting the path using spherical geometry
      const altPathA = path.map(p => {
        const latLng = new google.maps.LatLng(p.lat, p.lng);
        // Offset by ~50km to the right
        return google.maps.geometry.spherical.computeOffset(latLng, 50000, 90).toJSON();
      });

      aLine = new google.maps.Polyline({
        path: altPathA,
        geodesic: true,
        strokeColor: "#9ca3af",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 },
          offset: '0',
          repeat: '20px'
        }],
        map
      });

      const altPathB = path.map(p => {
        const latLng = new google.maps.LatLng(p.lat, p.lng);
        // Offset by ~50km to the left
        return google.maps.geometry.spherical.computeOffset(latLng, 50000, -90).toJSON();
      });

      bLine = new google.maps.Polyline({
        path: altPathB,
        geodesic: true,
        strokeColor: "#ef4444",
        strokeOpacity: 0.6,
        strokeWeight: 2,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 },
          offset: '0',
          repeat: '20px'
        }],
        map
      });

      setAltLineA(aLine);
      setAltLineB(bLine);
    }

    return () => {
      pLine.setMap(null);
      if (aLine) aLine.setMap(null);
      if (bLine) bLine.setMap(null);
    };
  }, [map, ship.currentPath, selected, ship.weatherPenaltyActive]);

  return null;
}

export default function FleetMap() {
  const { ships, zones, selectedShipId } = useFleetStore();
  const [apiKey, setApiKey] = useState("");
  const { user } = useUserStore();

  useEffect(() => {
    setApiKey(import.meta.env.VITE_GOOGLE_MAPS_KEY || "");
  }, []);

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-[var(--dashboard-bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Google Maps API Key Missing</p>
          <p className="text-sm text-[var(--dashboard-text-muted)]">Check your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId={MAP_ID}
        defaultCenter={{ lat: 26.5, lng: 56.0 }} // Strait of Hormuz
        defaultZoom={7}
        gestureHandling="greedy"
        disableDefaultUI={true}
        className="w-full h-full relative"
      >
        {/* Render Ships & Routes */}
        {ships.map((ship) => {
          // Captains: only show route for their own ship
          // Admins: show route for the selected ship
          const showRoute =
            user?.role === "captain"
              ? ship.shipId === user?.assignedShipId
              : user?.role === "admin"
                ? ship.shipId === selectedShipId
                : false;

          return (
            <div key={ship.shipId}>
              {showRoute && (
                <ShipRoute
                  ship={ship}
                  selected={ship.shipId === selectedShipId}
                />
              )}
              <ShipMarker
                ship={ship}
                selected={ship.shipId === selectedShipId}
              />
            </div>
          );
        })}

        {/* Render Zones */}
        {zones.map((zone) => (
          <ZonePolygon key={zone.zoneId} zone={zone} />
        ))}

        {/* Zone Drawing Tools (Admin only) */}
        {user?.role === "admin" && <ZoneDrawer />}
      </Map>
    </APIProvider>
  );
}
