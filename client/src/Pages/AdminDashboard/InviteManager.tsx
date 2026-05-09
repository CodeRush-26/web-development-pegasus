import { useState, useEffect } from "react";
import { UserPlus, Trash2, CheckCircle2, Shield, Ship, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/api";
import { useFleetStore } from "@/store/fleetStore";
import { Button } from "@/components/ui/button";

interface Invite {
  _id: string;
  email: string;
  role: string;
  assignedShipId: string | null;
  status: string;
  invitedBy: {
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export function InviteManager() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const { ships } = useFleetStore();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [assignedShipId, setAssignedShipId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/invites");
      setInvites(res.data);
    } catch (err) {
      toast.error("Failed to fetch invites");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      await api.post("/api/invites", {
        email,
        role,
        assignedShipId: role === "captain" ? assignedShipId : null,
      });
      toast.success("Invite created successfully");
      setEmail("");
      setRole("user");
      setAssignedShipId("");
      fetchInvites();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create invite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm("Are you sure you want to revoke this invite?")) return;
    
    try {
      await api.delete(`/api/invites/${id}`);
      toast.success("Invite revoked");
      setInvites(invites.filter((i) => i._id !== id));
    } catch (error) {
      toast.error("Failed to revoke invite");
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Invite Form */}
      <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--dashboard-border)] flex items-center gap-2">
          <UserPlus size={18} className="text-[var(--primary)]" />
          <h2 className="font-semibold text-[var(--dashboard-text)]">Create New Invite</h2>
        </div>
        <form onSubmit={handleInvite} className="p-4 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-text-muted)]" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to whitelist"
                className="w-full bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48 space-y-1">
            <label className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-wider">Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-text-muted)]" size={16} />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[var(--primary)] appearance-none"
              >
                <option value="user">Observer (User)</option>
                <option value="captain">Captain</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {role === "captain" && (
            <div className="w-full md:w-64 space-y-1">
              <label className="text-xs text-[var(--dashboard-text-muted)] uppercase tracking-wider">Assigned Ship</label>
              <div className="relative">
                <Ship className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dashboard-text-muted)]" size={16} />
                <select
                  required
                  value={assignedShipId}
                  onChange={(e) => setAssignedShipId(e.target.value)}
                  className="w-full bg-[var(--dashboard-bg)] border border-[var(--dashboard-border)] rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[var(--primary)] appearance-none"
                >
                  <option value="" disabled>Select a ship</option>
                  {ships.map((ship) => (
                    <option key={ship.shipId} value={ship.shipId}>
                      {ship.name} ({ship.shipId})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white py-2.5 h-auto">
            {isSubmitting ? "Inviting..." : "Send Invite"}
          </Button>
        </form>
      </div>

      {/* Invites Table */}
      <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--dashboard-border)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--dashboard-text)]">Active & Pending Invites</h2>
          <span className="text-sm bg-[var(--dashboard-bg)] px-2 py-1 rounded text-[var(--dashboard-text-muted)]">{invites.length} Total</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--dashboard-bg)] text-xs text-[var(--dashboard-text-muted)] uppercase border-b border-[var(--dashboard-border)]">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Assignment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Invited By</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dashboard-border)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--dashboard-text-muted)]">Loading...</td>
                </tr>
              ) : invites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--dashboard-text-muted)]">No invites found.</td>
                </tr>
              ) : (
                invites.map((invite) => (
                  <tr key={invite._id} className="hover:bg-[var(--dashboard-card-hover)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--dashboard-text)]">{invite.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                        invite.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        invite.role === 'captain' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {invite.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--dashboard-text-muted)]">
                      {invite.assignedShipId || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {invite.status === "accepted" ? (
                        <span className="flex items-center gap-1 text-green-500 text-xs font-medium">
                          <CheckCircle2 size={14} /> Accepted
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500 text-xs font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--dashboard-text-muted)] text-xs">
                      {invite.invitedBy ? invite.invitedBy.name : "System Seed"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleRevoke(invite._id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                        title="Revoke Invite"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
