import { create } from "zustand";
import { ShipState, Alert, Zone } from "@/types/fleet";

export interface Snapshot {
  timestamp: number;
  ships: ShipState[];
  alerts: Alert[];
  zones: Zone[];
}

export interface TimelineMarker {
  timestamp: number;
  type: string;
}

interface PlaybackState {
  snapshotsList: { timestamp: number }[];
  currentSnapshot: Snapshot | null;
  markers: TimelineMarker[];
  isPlaying: boolean;

  // Actions
  setSnapshotsList: (list: { timestamp: number }[]) => void;
  setCurrentSnapshot: (snapshot: Snapshot | null) => void;
  setMarkers: (markers: TimelineMarker[]) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  clearPlayback: () => void;
}

export const usePlaybackStore = create<PlaybackState>((set) => ({
  snapshotsList: [],
  currentSnapshot: null,
  markers: [],
  isPlaying: false,

  setSnapshotsList: (list) => set({ snapshotsList: list }),
  setCurrentSnapshot: (snapshot) => set({ currentSnapshot: snapshot }),
  setMarkers: (markers) => set({ markers }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  clearPlayback: () => set({
    snapshotsList: [],
    currentSnapshot: null,
    markers: [],
    isPlaying: false
  })
}));
