import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/api/api";
import useUserStore from "@/store/userStore";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Calendar,
  AtSign,
  Camera,
  Upload,
  Check,
  BellRing,
} from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { IKContext, IKUpload } from "imagekitio-react";

export default function DashboardProfile() {
  const { user, setUser } = useUserStore();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("info"); // 'info' or 'security'
  const [formData, setFormData] = useState({
    name: "",
    profilePicture: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setIsPushEnabled(Notification.permission === "granted");
    }
  }, []);

  const handleEnablePush = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast.error("Push Notifications are not supported by this browser");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const response = await api.get("/api/push/vapid-public-key");
      const publicKey = response.data.publicKey;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      await api.post("/api/push/subscribe", {
        subscription,
        userId: user?.id
      });

      setIsPushEnabled(true);
      toast.success("Push Notifications Enabled", { description: "You will now receive emergency alerts" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to enable push notifications");
    }
  };

  useEffect(() => {
    // Set initial form data from user store
    if (user) {
      setFormData({
        name: user.name || "",
        profilePicture: user.profilePicture || "",
      });
    }
  }, [user]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Error", { description: "Passwords do not match" });
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.post("/api/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Success", {
        description: "Password changed successfully",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error("Failed", {
        description:
          error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const onUploadError = (err: any) => {
    toast.error("Upload Failed", { description: "Failed to upload image" });
  };

  const onUploadSuccess = (res: any) => {
    setFormData({ ...formData, profilePicture: res.url });
    toast.success("Uploaded", { description: "Profile picture uploaded" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await api.put("/api/users/profile", formData);

      // Update user in store
      setUser(response.data);

      toast.success("Profile Updated", {
        description: "Your profile has been updated successfully",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast.error("Update Failed", {
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="text-[var(--gaming-purple)]" />
          My Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile Card */}
        <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[var(--gaming-purple)] mb-2"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-[var(--dashboard-card-hover)] flex items-center justify-center border-4 border-[var(--gaming-purple)] mb-2">
                  <User className="w-16 h-16 text-[var(--dashboard-text-muted)]" />
                </div>
              )}
              {isEditing && (
                <button
                  className="absolute bottom-0 right-0 p-2 bg-[var(--gaming-purple)] rounded-full text-white hover:bg-[var(--gaming-purple-light)] transition-colors"
                  onClick={() =>
                    document.getElementById("profilePicture")?.focus()
                  }
                >
                  <Camera size={18} />
                </button>
              )}
            </div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-[var(--dashboard-text-muted)]">{user?.email}</p>

            <div className="mt-6 w-full">
              <div className="flex items-center gap-3 p-3 bg-[var(--dashboard-card-hover)]/50 rounded-lg mb-3">
                <div className="p-2 bg-[var(--dashboard-card-hover)] rounded-lg">
                  <Mail
                    size={16}
                    className="text-[var(--dashboard-text-muted)]"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs text-[var(--dashboard-text-muted)]">
                    Email
                  </p>
                  <p className="text-sm">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[var(--dashboard-card-hover)]/50 rounded-lg mb-3">
                <div className="p-2 bg-[var(--dashboard-card-hover)] rounded-lg">
                  <AtSign
                    size={16}
                    className="text-[var(--dashboard-text-muted)]"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs text-[var(--dashboard-text-muted)]">
                    Account Type
                  </p>
                  <p className="text-sm">
                    {user?.isGoogle ? "Google Account" : "Email Account"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
                <div className="p-2 bg-[var(--dashboard-card-hover)] rounded-lg">
                  <Calendar
                    size={16}
                    className="text-[var(--dashboard-text-muted)]"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs text-[var(--dashboard-text-muted)]">
                    Joined
                  </p>
                  <p className="text-sm">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-1">
            <div className="flex">
              <button
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                  activeTab === "info"
                    ? "bg-[var(--gaming-purple)] text-white"
                    : "text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]"
                }`}
                onClick={() => setActiveTab("info")}
              >
                Personal Information
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
                  activeTab === "security"
                    ? "bg-[var(--gaming-purple)] text-white"
                    : "text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]"
                }`}
                onClick={() => setActiveTab("security")}
              >
                Security
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "info" ? (
            <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">Personal Information</h2>
                {!isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] bg-[var(--dashboard-card-hover)]/50 hover:bg-[var(--dashboard-card-hover)] border-[var(--dashboard-border)]"
                  >
                    Edit
                  </Button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-[var(--dashboard-text)] mb-1"
                      >
                        Full Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)]"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-[var(--dashboard-text)] mb-1"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        disabled
                        className="w-full px-3 py-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)]/50 text-[var(--dashboard-text-muted)] rounded-md cursor-not-allowed"
                        value={user?.email || ""}
                      />
                      <p className="mt-1 text-xs text-[var(--dashboard-text-muted)]">
                        Email cannot be changed
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="profilePicture"
                      className="block text-sm font-medium text-[var(--dashboard-text)] mb-1"
                    >
                      Profile Picture
                    </label>
                    <div className="flex flex-col gap-4">
                      <div className="flex">
                        <input
                          id="profilePicture"
                          name="profilePicture"
                          type="text"
                          className="flex-1 px-3 py-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)] rounded-l-md focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)]"
                          placeholder="https://example.com/your-image.jpg"
                          value={formData.profilePicture}
                          onChange={handleChange}
                        />
                        <div className="relative">
                          <IKContext
                            publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
                            urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
                            authenticator={async () => {
                              try {
                                const response = await api.get("/api/upload/auth");
                                return response.data;
                              } catch (error) {
                                throw new Error(`Authentication request failed`);
                              }
                            }}
                          >
                            <IKUpload
                              fileName={`profile-${user?.id || "temp"}.jpg`}
                              tags={["profile_picture"]}
                              useUniqueFileName={true}
                              onError={onUploadError}
                              onSuccess={onUploadSuccess}
                              className="hidden"
                              id="ik-upload"
                            />
                          </IKContext>
                          <button
                            type="button"
                            className="px-3 py-2 bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)] rounded-r-md hover:bg-[var(--gaming-purple)] hover:text-white transition-colors h-full"
                            onClick={() => document.getElementById("ik-upload")?.click()}
                          >
                            <Upload size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--dashboard-text-muted)]">
                        Enter a URL or click the upload icon to choose an image
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[var(--gaming-purple)] hover:bg-[var(--gaming-purple-light)]"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[var(--dashboard-border)] text-[var(--dashboard-text)] hover:bg-[var(--dashboard-card-hover)]"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data
                        if (user) {
                          setFormData({
                            name: user.name || "",
                            profilePicture: user.profilePicture || "",
                          });
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
                      <p className="text-sm text-[var(--dashboard-text-muted)] mb-1">
                        Full Name
                      </p>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                    <div className="p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
                      <p className="text-sm text-[var(--dashboard-text-muted)] mb-1">
                        Email Address
                      </p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
                    <p className="text-sm text-[var(--dashboard-text-muted)] mb-1">
                      Profile Picture
                    </p>
                    {user?.profilePicture ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={user.profilePicture}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-[var(--gaming-purple)]"
                        />
                        <p className="font-medium text-[var(--gaming-purple)] break-all">
                          {user.profilePicture}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[var(--dashboard-text-muted)]">
                        No profile picture set
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[var(--dashboard-card)] rounded-xl border border-[var(--dashboard-border)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">Security Settings</h2>
              </div>

              <div className="space-y-6">
                {!user?.isGoogle && (
                  <div className="p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
                    <h3 className="font-medium mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm text-[var(--dashboard-text-muted)] mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            required
                            className="w-full px-3 py-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)]"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[var(--dashboard-text-muted)] mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            required
                            className="w-full px-3 py-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)]"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-[var(--dashboard-text-muted)] mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            required
                            className="w-full px-3 py-2 border border-[var(--dashboard-border)] bg-[var(--dashboard-card-hover)] text-[var(--dashboard-text)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)]"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isChangingPassword}
                        className="bg-[var(--gaming-purple)] hover:bg-[var(--gaming-purple-light)]"
                      >
                        {isChangingPassword ? "Updating..." : "Update Password"}
                      </Button>
                    </form>
                  </div>
                )}

                <div className="p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium mb-1">Account Verification</p>
                      <p className="text-sm text-[var(--dashboard-text-muted)]">
                        {user?.isVerified
                          ? "Your account is verified"
                          : "Verify your account to access all features"}
                      </p>
                    </div>
                    {user?.isVerified ? (
                      <div className="flex items-center gap-1 text-green-500 text-sm">
                        <Check size={16} />
                        <span>Verified</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)] bg-[var(--dashboard-card-hover)]/50 hover:bg-[var(--dashboard-card-hover)] border-[var(--dashboard-border)]"
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[var(--dashboard-card-hover)]/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium mb-1 flex items-center gap-2">
                        <BellRing size={16} className="text-[var(--primary)]" />
                        Push Notifications
                      </p>
                      <p className="text-sm text-[var(--dashboard-text-muted)]">
                        {isPushEnabled
                          ? "You are receiving crisis alerts on this device"
                          : "Enable to receive emergency directives instantly"}
                      </p>
                    </div>
                    {isPushEnabled ? (
                      <div className="flex items-center gap-1 text-green-500 text-sm">
                        <Check size={16} />
                        <span>Enabled</span>
                      </div>
                    ) : (
                      <Button
                        onClick={handleEnablePush}
                        variant="outline"
                        size="sm"
                        className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white border-transparent"
                      >
                        Enable Push
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
