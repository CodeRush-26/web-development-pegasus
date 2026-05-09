import { useState } from "react";
import {
  Gamepad2,
  Search,
  Filter,
  ArrowUpDown,
  Star,
  Trophy,
  Clock,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedBorder } from "@/components/ui/animated-border";

// Data will be fetched from API in production
const games = [];

export default function DashboardGames() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastPlayed"); // 'lastPlayed', 'hoursPlayed', 'title'

  // Filter games based on search query
  const filteredGames = games.filter(
    (game) =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort games based on sortBy
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "hoursPlayed") {
      return b.hoursPlayed - a.hoursPlayed;
    }
    // Default sort by lastPlayed (most recent first)
    return 0; // In a real app, we'd compare dates
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gamepad2 className="text-[var(--gaming-purple)]" />
          My Games
        </h1>
        <Button className="bg-[var(--gaming-purple)] hover:bg-[var(--gaming-purple-light)]">
          Add Game
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--dashboard-text-muted)]"
            size={18}
          />
          <input
            type="text"
            placeholder="Search games..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
          >
            <Filter size={16} className="flex-shrink-0" />
            <span className="truncate">Filter</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
            onClick={() =>
              setSortBy(sortBy === "title" ? "hoursPlayed" : "title")
            }
          >
            <ArrowUpDown size={16} className="flex-shrink-0" />
            <span className="truncate">
              Sort by:{" "}
              {sortBy === "title"
                ? "Name"
                : sortBy === "hoursPlayed"
                ? "Hours"
                : "Recent"}
            </span>
          </Button>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sortedGames.map((game) => (
          <MagicCard
            key={game.id}
            className="bg-[var(--dashboard-card)] rounded-xl overflow-hidden border border-[var(--dashboard-border)]"
            glowColor="var(--gaming-purple)"
          >
            <div className="h-32 sm:h-40 overflow-hidden relative">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
                <h3 className="text-white font-bold truncate-1-line">
                  {game.title}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm truncate">
                  {game.genre}
                </p>
              </div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Star className="text-yellow-500 mr-0.5 sm:mr-1" size={14} />
                  <Star className="text-yellow-500 mr-0.5 sm:mr-1" size={14} />
                  <Star className="text-yellow-500 mr-0.5 sm:mr-1" size={14} />
                  <Star className="text-yellow-500 mr-0.5 sm:mr-1" size={14} />
                  <Star
                    className="text-[var(--dashboard-text-muted)]"
                    size={14}
                  />
                </div>
                <div className="flex items-center text-xs sm:text-sm text-[var(--dashboard-text-muted)]">
                  <Clock size={12} className="mr-1 flex-shrink-0" />
                  <span>{game.hoursPlayed} hrs</span>
                </div>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-[var(--dashboard-text-muted)]">
                <Activity size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">Last played: {game.lastPlayed}</span>
              </div>
            </div>
          </MagicCard>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12">
          <Gamepad2
            className="mx-auto mb-4 text-[var(--dashboard-text-muted)]"
            size={48}
          />
          <h3 className="text-lg font-medium mb-2">No games found</h3>
          <p className="text-[var(--dashboard-text-muted)]">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
