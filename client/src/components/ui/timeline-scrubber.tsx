import { useEffect, useState } from "react";
import { usePlaybackStore } from "@/store/playbackStore";
import { useSocketStore } from "@/store/socketStore";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "./button";

export function TimelineScrubber() {
  const { snapshotsList, currentSnapshot, markers, isPlaying, setIsPlaying } = usePlaybackStore();
  const { send } = useSocketStore();
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Auto-playback logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && snapshotsList.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= snapshotsList.length) {
            setIsPlaying(false);
            return prev;
          }
          send("get_snapshot", { timestamp: snapshotsList[next].timestamp });
          return next;
        });
      }, 1000); // 1 snapshot per second during playback (fast-forward)
    }
    return () => clearInterval(interval);
  }, [isPlaying, snapshotsList, send, setIsPlaying]);

  // Sync currentIndex when snapshotsList loads
  useEffect(() => {
    if (snapshotsList.length > 0 && currentIndex === -1) {
      setCurrentIndex(snapshotsList.length - 1);
      send("get_snapshot", { timestamp: snapshotsList[snapshotsList.length - 1].timestamp });
    }
  }, [snapshotsList, currentIndex, send]);

  const handleSeek = (index: number) => {
    if (index >= 0 && index < snapshotsList.length) {
      setCurrentIndex(index);
      send("get_snapshot", { timestamp: snapshotsList[index].timestamp });
    }
  };

  if (snapshotsList.length === 0) {
    return (
      <div className="w-full bg-[var(--dashboard-card)] border-t border-[var(--dashboard-border)] p-4 flex items-center justify-center text-[var(--dashboard-text-muted)]">
        Gathering historical fleet data...
      </div>
    );
  }

  const startTime = snapshotsList[0].timestamp;
  const endTime = snapshotsList[snapshotsList.length - 1].timestamp;
  const timeSpan = endTime - startTime;

  return (
    <div className="w-full bg-[var(--dashboard-card)] border-t border-[var(--dashboard-border)] p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] relative z-20">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-6">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleSeek(0)}
            disabled={currentIndex <= 0}
          >
            <SkipBack size={16} />
          </Button>
          <Button 
            variant="default" 
            size="icon"
            className="w-10 h-10 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={currentIndex >= snapshotsList.length - 1}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => handleSeek(snapshotsList.length - 1)}
            disabled={currentIndex >= snapshotsList.length - 1}
          >
            <SkipForward size={16} />
          </Button>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 w-full relative h-10 flex items-center">
          {/* Base track */}
          <div className="absolute left-0 right-0 h-2 bg-[var(--dashboard-card-hover)] rounded-full overflow-hidden border border-[var(--dashboard-border)]">
            {/* Progress fill */}
            <div 
              className="absolute top-0 bottom-0 left-0 bg-[var(--primary)] opacity-50"
              style={{ width: `${(currentIndex / Math.max(1, snapshotsList.length - 1)) * 100}%` }}
            ></div>
          </div>

          {/* Markers */}
          {timeSpan > 0 && markers.map((m, i) => {
            const percent = ((m.timestamp - startTime) / timeSpan) * 100;
            const colorClass = m.type === 'distress' ? 'bg-red-500' : 'bg-amber-500';
            return (
              <div 
                key={i} 
                className={`absolute w-3 h-3 rounded-full -mt-0.5 transform -translate-x-1/2 border border-white shadow-sm cursor-pointer z-10 ${colorClass}`}
                style={{ left: `${percent}%` }}
                title={`Event: ${m.type} at ${new Date(m.timestamp).toLocaleTimeString()}`}
                onClick={() => {
                  const closestIdx = snapshotsList.findIndex(s => s.timestamp >= m.timestamp);
                  if (closestIdx !== -1) handleSeek(closestIdx);
                }}
              />
            );
          })}

          {/* Scrubber Knob */}
          <input 
            type="range" 
            min={0} 
            max={Math.max(0, snapshotsList.length - 1)} 
            value={currentIndex === -1 ? 0 : currentIndex}
            onChange={(e) => handleSeek(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          
          {/* Visual Knob */}
          {currentIndex !== -1 && (
            <div 
              className="absolute w-4 h-4 bg-white border-2 border-[var(--primary)] rounded-full shadow-md pointer-events-none transform -translate-x-1/2 transition-all duration-100 ease-linear"
              style={{ left: `${(currentIndex / Math.max(1, snapshotsList.length - 1)) * 100}%` }}
            />
          )}
        </div>

        {/* Time Display */}
        <div className="text-right min-w-[140px] font-mono text-sm">
          {currentSnapshot ? (
            <div className="flex flex-col">
              <span className="font-semibold text-[var(--primary)]">
                {new Date(currentSnapshot.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-[var(--dashboard-text-muted)] text-xs">
                {new Date(currentSnapshot.timestamp).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <span className="text-[var(--dashboard-text-muted)]">--:--:--</span>
          )}
        </div>
      </div>
    </div>
  );
}
