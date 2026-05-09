import { useState } from "react";
import {
  Trophy,
  Search,
  Filter,
  ArrowUpDown,
  Star,
  Shield,
  Zap,
  Flame,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedBorder } from "@/components/ui/animated-border";
import { Marquee } from "@/components/ui/marquee";

// Data will be fetched from API in production
const achievements = [];

export default function DashboardAchievements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date"); // 'date', 'rarity', 'game'
  const [filter, setFilter] = useState("all"); // 'all', 'rare', 'common', etc.

  // Filter achievements based on search query and filter
  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.game.toLowerCase().includes(searchQuery.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "rare")
      return matchesSearch && achievement.rarityPercent < 15;
    if (filter === "common")
      return matchesSearch && achievement.rarityPercent >= 15;

    return matchesSearch;
  });

  // Sort achievements based on sortBy
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (sortBy === "game") {
      return a.game.localeCompare(b.game);
    } else if (sortBy === "rarity") {
      return a.rarityPercent - b.rarityPercent;
    }
    // Default sort by date (most recent first)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Get rarity color
  const getRarityColor = (rarityPercent: number) => {
    if (rarityPercent < 5) return "text-[var(--gaming-purple)]";
    if (rarityPercent < 15) return "text-blue-500";
    if (rarityPercent < 30) return "text-green-500";
    return "text-gray-400";
  };

  // Get rarity icon
  const getRarityIcon = (rarityPercent: number) => {
    if (rarityPercent < 5) return Flame;
    if (rarityPercent < 15) return Trophy;
    if (rarityPercent < 30) return Shield;
    return Star;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="text-[var(--gaming-purple)]" />
          Achievements
        </h1>
        <div className="text-[var(--dashboard-text-muted)]">
          {achievements.length} achievements unlocked
        </div>
      </div>

      {/* Recent Achievements Marquee */}
      {achievements.length > 0 && (
        <div className="mb-6 overflow-hidden">
          <div className="text-sm font-medium text-[var(--dashboard-text-muted)] mb-2 flex items-center">
            <Award className="mr-1" size={16} />
            Recent Unlocks
          </div>
          <Marquee speed={30} className="py-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-2 mx-4 px-3 py-1.5 bg-[var(--dashboard-card-hover)]/50 rounded-full"
              >
                <div
                  className={`p-1 rounded-full ${getRarityColor(
                    achievement.rarityPercent
                  )}`}
                >
                  <Trophy size={14} />
                </div>
                <span className="font-medium whitespace-nowrap">
                  {achievement.title}
                </span>
                <span className="text-xs text-[var(--dashboard-text-muted)] whitespace-nowrap">
                  • {achievement.game}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--dashboard-text-muted)]"
            size={18}
          />
          <input
            type="text"
            placeholder="Search achievements..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
            onClick={() =>
              setFilter(
                filter === "all" ? "rare" : filter === "rare" ? "common" : "all"
              )
            }
          >
            <Filter size={16} className="flex-shrink-0" />
            <span className="truncate">
              {filter === "all" ? "All" : filter === "rare" ? "Rare" : "Common"}
            </span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
            onClick={() =>
              setSortBy(
                sortBy === "date"
                  ? "rarity"
                  : sortBy === "rarity"
                  ? "game"
                  : "date"
              )
            }
          >
            <ArrowUpDown size={16} className="flex-shrink-0" />
            <span className="truncate">
              Sort:{" "}
              {sortBy === "date"
                ? "Recent"
                : sortBy === "rarity"
                ? "Rarity"
                : "Game"}
            </span>
          </Button>
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-4">
        {sortedAchievements.map((achievement) => {
          const RarityIcon = getRarityIcon(achievement.rarityPercent);

          return (
            <AnimatedBorder
              key={achievement.id}
              borderColor={
                achievement.rarityPercent < 5
                  ? "var(--gaming-purple)"
                  : achievement.rarityPercent < 15
                  ? "var(--gaming-blue)"
                  : achievement.rarityPercent < 30
                  ? "var(--gaming-green)"
                  : "var(--dashboard-border)"
              }
              animateGlow={achievement.rarityPercent < 15}
              containerClassName="w-full"
            >
              <div className="p-4 flex flex-col sm:flex-row items-start gap-4">
                <div
                  className={`p-3 rounded-lg ${getRarityColor(
                    achievement.rarityPercent
                  )} bg-[var(--dashboard-card-hover)] mb-2 sm:mb-0`}
                >
                  <RarityIcon size={24} />
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                    <div>
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-[var(--dashboard-text-muted)] mb-1">
                        {achievement.game}
                      </p>
                    </div>
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded-full ${getRarityColor(
                        achievement.rarityPercent
                      )} bg-[var(--dashboard-card-hover)] self-start`}
                    >
                      {achievement.rarity} ({achievement.rarityPercent}%)
                    </div>
                  </div>

                  <p className="text-sm text-[var(--dashboard-text-muted)] mb-2">
                    {achievement.description}
                  </p>

                  <div className="text-xs text-[var(--dashboard-text-muted)]">
                    Unlocked on{" "}
                    {new Date(achievement.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </AnimatedBorder>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy
            className="mx-auto mb-4 text-[var(--dashboard-text-muted)]"
            size={48}
          />
          <h3 className="text-lg font-medium mb-2">No achievements found</h3>
          <p className="text-[var(--dashboard-text-muted)]">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
