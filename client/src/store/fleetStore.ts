import { create } from "zustand";
import type { ShipState, Alert, Zone, Port, Directive } from "../types/fleet";

interface FleetState {
  ships: ShipState[];
  alerts: Alert[];
  zones: Zone[];
  ports: Port[];
  selectedShipId: string | null;
  activeDirective: Directive | null;

  // Actions
  setInitialState: (data: { ships: ShipState[]; alerts: Alert[]; zones: Zone[]; ports: Port[] }) => void;
  applyUpdate: (data: { ships: ShipState[]; alerts: Alert[]; zones: Zone[] }) => void;
  setSelectedShip: (id: string | null) => void;
  addZone: (zone: Zone) => void;
  removeZone: (zoneId: string) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  setActiveDirective: (directive: Directive | null) => void;
}

export const useFleetStore = create<FleetState>((set) => ({
  ships: [],
  alerts: [],
  zones: [],
  ports: [],
  selectedShipId: null,
  activeDirective: null,

  setInitialState: (data) => set({ ...data }),

  applyUpdate: (data) =>
    set((state) => {
      // Merge zones by ID to preserve object identity across ticks.
      // This prevents ZonePolygon from flickering on every fleet_update.
      const existingZoneIds = new Set(state.zones.map(z => z.zoneId));
      const incomingZoneIds = new Set(data.zones.map((z: any) => z.zoneId));
      // Keep zones that exist in incoming, add new ones, remove deleted ones
      const mergedZones = [
        ...state.zones.filter(z => incomingZoneIds.has(z.zoneId)), // retain existing refs
        ...data.zones.filter((z: any) => !existingZoneIds.has(z.zoneId)), // add new
      ];
      return {
        ships: data.ships,
        alerts: data.alerts,
        zones: mergedZones,
      };
    }),

  setSelectedShip: (id) => set({ selectedShipId: id }),

  addZone: (zone) =>
    set((state) => ({
      zones: [...state.zones, zone],
    })),

  removeZone: (zoneId) =>
    set((state) => ({
      zones: state.zones.filter((z) => z.zoneId !== zoneId),
    })),

  addAlert: (alert) =>
    set((state) => {
      // Prevent duplicates in UI store if server hasn't synced yet
      if (state.alerts.some((a) => a.alertId === alert.alertId)) return state;
      return { alerts: [...state.alerts, alert] };
    }),

  acknowledgeAlert: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.alertId === alertId ? { ...a, acknowledged: true } : a)),
    })),

  setActiveDirective: (directive) => set({ activeDirective: directive }),
}));
