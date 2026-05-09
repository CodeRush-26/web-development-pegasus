import { useState, useEffect } from "react";
import useUserStore from "@/store/userStore";
import {
  ArrowRight,
  Users,
  Gamepad2,
  Trophy,
  Clock,
  Activity,
  TrendingUp,
  Flame,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/theme-provider";
import { StatsCard } from "@/components/ui/stats-card";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";

// Data will be fetched from API in production
const recentGames = [];
const recentAchievements = [];
const friendsActivity = [];

export default function DashboardHome() {
  const { user } = useUserStore();
  const { theme } = useTheme();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Gamepad2 className="text-[var(--gaming-purple)]" />
          {greeting}, {user?.name}
        </h1>
        <p className="text-[var(--dashboard-text-muted)]">
          Welcome to your gaming dashboard. Here's what's happening.
        </p>
      </div>

      {/* Recent Achievements Marquee */}
      {recentAchievements.length > 0 && (
        <div className="mb-6 overflow-hidden">
          <Marquee speed={30} className="py-2">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-1 sm:gap-2 mx-2 sm:mx-4 px-2 sm:px-3 py-1.5 bg-[var(--dashboard-card-hover)]/50 rounded-full"
              >
                <div className="p-1 rounded-full text-[var(--gaming-purple)] flex-shrink-0">
                  <Trophy size={14} />
                </div>
                <span className="font-medium whitespace-nowrap text-xs sm:text-sm">
                  {achievement.title}
                </span>
                <span className="text-xs text-[var(--dashboard-text-muted)] whitespace-nowrap hidden xs:inline">
                  • {achievement.game}
                </span>
              </div>
            ))}
          </Marquee>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* Gaming Stats */}
        <div className="space-y-4 sm:space-y-6 order-1">
          <StatsCard
            title="Games Played"
            value="0"
            icon={
              <Gamepad2 size={18} className="text-[var(--gaming-purple)]" />
            }
            iconClassName="bg-[var(--gaming-purple-light)]/20 text-[var(--gaming-purple)]"
          />

          <StatsCard
            title="Total Hours"
            value="0"
            icon={<Clock size={18} className="text-[var(--gaming-blue)]" />}
            iconClassName="bg-[var(--gaming-blue-light)]/20 text-[var(--gaming-blue)]"
          />

          <div className="mt-4">
            <Link
              to="/dashboard/games"
              className="text-[var(--gaming-purple)] text-sm flex items-center hover:underline"
            >
              View all games
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-[var(--dashboard-card)] rounded-xl p-4 sm:p-6 border border-[var(--dashboard-border)] order-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Achievements</h2>
            <div className="p-2 bg-[var(--gaming-purple-light)]/20 text-[var(--gaming-purple)] rounded-lg">
              <Trophy size={18} />
            </div>
          </div>
          <div className="space-y-3">
            {recentAchievements.length > 0 ? (
              recentAchievements.slice(0, 1).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-[var(--dashboard-card-hover)]/50 rounded-lg"
                >
                  <div className="p-2 bg-[var(--dashboard-card-hover)] rounded-lg flex-shrink-0">
                    <achievement.icon
                      size={16}
                      className="text-[var(--gaming-purple)]"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {achievement.title}
                    </p>
                    <p className="text-xs text-[var(--dashboard-text-muted)] truncate">
                      {achievement.game} • {achievement.date}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-[var(--dashboard-text-muted)] text-sm">
                No achievements yet
              </div>
            )}
          </div>
          <div className="mt-4">
            <Link
              to="/dashboard/achievements"
              className="text-[var(--gaming-purple)] text-sm flex items-center hover:underline"
            >
              View all achievements
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>

        {/* Friends */}
        <div className="bg-[var(--dashboard-card)] rounded-xl p-4 sm:p-6 border border-[var(--dashboard-border)] order-3 sm:order-3 lg:order-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Friends</h2>
            <div className="p-2 bg-[var(--gaming-purple-light)]/20 text-[var(--gaming-purple)] rounded-lg">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">0 friends online</p>
              <p className="text-xs text-[var(--dashboard-text-muted)] truncate">
                0 friends total
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/dashboard/friends"
              className="text-[var(--gaming-purple)] text-sm flex items-center hover:underline"
            >
              View all friends
              <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Games */}
      <div className="bg-[var(--dashboard-card)] rounded-xl p-4 sm:p-6 border border-[var(--dashboard-border)] mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Recent Games</h2>
          <Link
            to="/dashboard/games"
            className="text-[var(--gaming-purple)] text-sm flex items-center hover:underline"
          >
            View all
            <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentGames.length > 0 ? (
            recentGames.map((game) => (
              <MagicCard
                key={game.id}
                className="bg-[var(--dashboard-card-hover)]/50 rounded-lg overflow-hidden"
                glowColor="var(--gaming-purple)"
              >
                <div className="h-32 overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1 truncate">{game.title}</h3>
                  <div className="flex flex-col xs:flex-row justify-between text-xs text-[var(--dashboard-text-muted)] gap-1 xs:gap-0">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">
                        Last played: {game.lastPlayed}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Activity size={14} className="mr-1 flex-shrink-0" />
                      <span>{game.hoursPlayed} hrs</span>
                    </div>
                  </div>
                </div>
              </MagicCard>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-[var(--dashboard-text-muted)] text-sm bg-[var(--dashboard-card-hover)]/20 rounded-lg">
              No recent games. Start playing to see them here!
            </div>
          )}
        </div>
      </div>

      {/* Friends Activity */}
      <div className="bg-[var(--dashboard-card)] rounded-xl p-4 sm:p-6 border border-[var(--dashboard-border)]">
        <h2 className="text-lg font-medium mb-4 sm:mb-6">Friends Activity</h2>
        <div className="space-y-4">
          {friendsActivity.length > 0 ? (
            friendsActivity.map((friend) => (
              <div
                key={friend.id}
                className="flex items-start gap-3 sm:gap-4 p-3 hover:bg-[var(--dashboard-card-hover)]/50 rounded-lg transition-colors"
              >
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{friend.name}</p>
                  <p className="text-xs text-[var(--dashboard-text-muted)] truncate">
                    {friend.activity}
                  </p>
                </div>
                <div className="text-xs text-[var(--dashboard-text-muted)] whitespace-nowrap">
                  {friend.time}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[var(--dashboard-text-muted)] text-sm">
              No recent activity from friends.
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link
            to="/dashboard/friends"
            className="text-[var(--gaming-purple)] text-sm hover:underline"
          >
            View all friends
          </Link>
        </div>
      </div>
    </div>
  );
}
