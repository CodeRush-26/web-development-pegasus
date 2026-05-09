import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/api";
import { Lock, ArrowRight, Compass, ArrowLeft } from "lucide-react";
import { ThemeSwitcher } from "@/components/CustomComponents/ThemeSwitcher";
import { motion } from "motion/react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Redirect if no token or email
  if (!token || !email) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">Invalid Reset Link</h1>
          <p className="text-[var(--foreground-muted)]">
            The password reset link is missing or expired.
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:shadow-lg transition"
          >
            Back to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      toast.error("Error", {
        description: "Please fill in all fields",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Error", {
        description: "Password must be at least 8 characters",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Error", {
        description: "Passwords do not match",
      });
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/api/auth/reset-password", {
        token,
        email,
        password: formData.password,
      });

      toast.success("Success", {
        description: "Password reset successfully",
      });
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      toast.error("Error", {
        description:
          error.response?.data?.message ||
          "Failed to reset password. Link may have expired.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 -right-40 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl"
          animate={{
            y: [0, 50, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 -left-40 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl"
          animate={{
            y: [0, -50, 0],
            x: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Top Navigation */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/50 backdrop-blur-xl border-b border-[var(--border)]/30"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-3 font-bold text-lg group"
          >
            <motion.div
              className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <Compass className="w-5 h-5 text-white" />
            </motion.div>
            <span>Fleet</span>
          </Link>
          <ThemeSwitcher />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-8 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-8">
            {/* Header */}
            <motion.div
              className="space-y-2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl font-bold">Set New Password</h1>
              <p className="text-[var(--foreground-muted)] text-lg">
                Create a strong password for your account
              </p>
            </motion.div>

            {!isSuccess ? (
              /* Reset Password Form */
              <motion.form
                className="space-y-6"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--foreground)] mb-3"
                  >
                    New Password
                  </label>
                  <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
                    <Lock className="absolute left-4 top-4 w-5 h-5 text-[var(--muted-foreground)]" />
                    <motion.input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all backdrop-blur"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      whileHover={{ borderColor: "var(--primary)" }}
                    />
                  </motion.div>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Must be at least 8 characters
                  </p>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[var(--foreground)] mb-3"
                  >
                    Confirm Password
                  </label>
                  <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
                    <Lock className="absolute left-4 top-4 w-5 h-5 text-[var(--muted-foreground)]" />
                    <motion.input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all backdrop-blur"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      whileHover={{ borderColor: "var(--primary)" }}
                    />
                  </motion.div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[var(--primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      Resetting...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              /* Success Message */
              <motion.div
                className="space-y-6 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Lock className="w-8 h-8 text-green-500" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
                  <p className="text-[var(--foreground-muted)]">
                    Your password has been successfully reset. Redirecting to
                    login...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Back to Login */}
            {!isSuccess && (
              <motion.div
                className="pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1 group"
                >
                  <motion.span
                    animate={{ x: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </motion.span>
                  Back to login
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
