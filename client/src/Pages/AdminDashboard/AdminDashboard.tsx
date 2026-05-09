import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import useUserStore from "@/store/userStore";
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  User,
  Mail,
  Calendar,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
  _id: string;
  name: string;
  email: string;
  isGoogle: boolean;
  isVerified: boolean;
  onBoardingComplete: boolean;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token } = useUserStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/users");
      setUsers(response.data);
    } catch (error: any) {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to fetch users",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/api/users/${id}`);
      toast.success("Success", { description: "User deleted successfully" });
      fetchUsers();
    } catch (error: any) {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to delete user",
      });
    }
  };

  useEffect(() => {
    // Fetch users on component mount
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)] pt-20 px-4 md:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-[var(--gaming-purple)]" />
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 bg-[var(--dashboard-card-bg)] border border-[var(--dashboard-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)] w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={fetchUsers}
              className="p-2 bg-[var(--dashboard-card-bg)] border border-[var(--dashboard-border)] rounded-md hover:bg-[var(--dashboard-card-hover)] transition-colors"
              disabled={isLoading}
            >
              <RefreshCw
                size={18}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[var(--dashboard-card-bg)] border border-[var(--dashboard-border)] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--dashboard-card-hover)] border-b border-[var(--dashboard-border)]">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Auth</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw size={20} className="animate-spin mr-2" />
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-[var(--dashboard-border)] hover:bg-[var(--dashboard-card-hover)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[var(--gaming-purple)] flex items-center justify-center overflow-hidden mr-3">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={18} className="text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-[var(--dashboard-text-muted)]">
                              ID: {user._id.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Mail
                            size={16}
                            className="mr-2 text-[var(--dashboard-text-muted)]"
                          />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Calendar
                            size={16}
                            className="mr-2 text-[var(--dashboard-text-muted)]"
                          />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {user.isVerified ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <Check size={12} className="mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              <X size={12} className="mr-1" />
                              Unverified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {user.isGoogle ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              Google
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              Email
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteUser(user._id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Delete User"
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

         <div className="mt-6 bg-[var(--dashboard-card-bg)] border border-[var(--dashboard-border)] rounded-lg p-4">
          <h2 className="text-lg font-medium mb-2">Platform Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
              <p className="text-sm text-[var(--dashboard-text-muted)]">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
              <p className="text-sm text-[var(--dashboard-text-muted)]">Verified Users</p>
              <p className="text-2xl font-bold">{users.filter(u => u.isVerified).length}</p>
            </div>
            <div className="p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
              <p className="text-sm text-[var(--dashboard-text-muted)]">Google Auth</p>
              <p className="text-2xl font-bold">{users.filter(u => u.isGoogle).length}</p>
            </div>
            <div className="p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
              <p className="text-sm text-[var(--dashboard-text-muted)]">Active Now</p>
              <p className="text-2xl font-bold text-green-500">Live</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
