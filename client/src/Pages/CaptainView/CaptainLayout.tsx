import { Outlet } from "react-router-dom";
import useUserStore from "@/store/userStore";
import { LogOut, Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CaptainLayout() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[var(--primary)] selection:text-white">
      {/* HUD Header */}
      <header className="h-14 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-3">
          <Anchor className="text-[var(--primary)]" size={20} />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-widest uppercase text-white/90">
              Vessel Command
            </span>
            <span className="text-[10px] text-[var(--primary)] font-mono tracking-wider uppercase">
              {user?.assignedShipId || "UNASSIGNED"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs">
                {user?.name?.charAt(0) || "C"}
              </div>
            )}
            <span className="text-xs text-white/70 font-medium">Capt. {user?.name}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors bg-red-400/10 hover:bg-red-400/20 px-3 py-1.5 rounded"
          >
            <LogOut size={14} />
            DISENGAGE
          </button>
        </div>
      </header>

      {/* Main Cockpit Area */}
      <main className="flex-1 relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
