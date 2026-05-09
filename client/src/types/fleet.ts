export interface ShipState {
  shipId: string;
  name: string;
  position: [number, number]; // [lat, lng]
  speed: number; // knots
  heading: number; // degrees
  destination: string; // portId
  destinationName: string;
  destinationPosition: [number, number];
  fuel: number; // tons
  fuelCapacity: number;
  cargo: string;
  status:
    | "normal"
    | "rerouting"
    | "distressed"
    | "stopped"
    | "stranded"
    | "arrived"
    | "out_of_fuel";
  weatherPenaltyActive: boolean;
  insufficientFuel: boolean;
  isSimulating: boolean;
  currentPath: [number, number][]; // Remaining waypoints
  activeDirective: string | null;
}

export interface Alert {
  alertId: string;
  type:
    | "geofence_breach"
    | "proximity_warning"
    | "stranded"
    | "insufficient_fuel"
    | "distress"
    | "captain_report";
  severity: number; // 1-5
  shipId: string;
  message: string;
  timestamp: number; // unix ms
  acknowledged: boolean;
  relatedShipId: string | null;
  aiParsed: any | null; // Gemini structured output
}

export interface Zone {
  zoneId: string;
  name: string;
  polygon: [number, number][]; // [lat, lng][]
  createdAt: number;
  createdBy: string;
  restrictedShipIds?: string[];
}

export interface Port {
  id: string;
  name: string;
  position: [number, number];
}

export interface Directive {
  directiveId: string;
  shipId: string;
  type: "reroute_to_port" | "divert_to_waypoint" | "hold_position" | "evacuate_zone";
  targetPortId: string | null;
  targetWaypoint: [number, number] | null;
  issuedAt: number;
  status: "pending" | "accepted" | "escalated";
  issuedBy: string;
}
