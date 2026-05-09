import { create } from "zustand";
import type { ShipState, Alert, Zone, Port } from "../types/fleet";

interface FleetState {
  ships: ShipState[];
  alerts: Alert[];
  zones: Zone[];
  ports: Port[];
  selectedShipId: string | null;

  // Actions
  setInitialState: (data: { ships: ShipState[]; alerts: Alert[]; zones: Zone[]; ports: Port[] }) => void;
  applyUpdate: (data: { ships: ShipState[]; alerts: Alert[]; zones: Zone[] }) => void;
  setSelectedShip: (id: string | null) => void;
  addZone: (zone: Zone) => void;
  removeZone: (zoneId: string) => void;
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
}

export const useFleetStore = create<FleetState>((set) => ({
  ships: [],
  alerts: [],
  zones: [],
  ports: [],
  selectedShipId: null,

  setInitialState: (data) => set({ ...data }),

  applyUpdate: (data) =>
    set((state) => ({
      ships: data.ships,
      alerts: data.alerts, // Replace alerts entirely (server deduplicates and syncs state)
      zones: data.zones,
    })),

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
}));
