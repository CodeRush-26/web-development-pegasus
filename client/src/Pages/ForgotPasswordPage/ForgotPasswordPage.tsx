import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/api";
import { Mail, ArrowRight, Compass, ArrowLeft } from "lucide-react";
import { ThemeSwitcher } from "@/components/CustomComponents/ThemeSwitcher";
import { motion } from "motion/react";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post("/api/auth/forgot-password", { email });

      toast.success("Email Sent", {
        description: "Check your email for password reset instructions",
      });
      setIsSubmitted(true);
    } catch (error: any) {
      toast.error("Error", {
        description:
          error.response?.data?.message ||
          "Failed to send reset email. Please try again.",
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
              <h1 className="text-4xl font-bold">Reset Password</h1>
              <p className="text-[var(--foreground-muted)] text-lg">
                Enter your email to receive password reset instructions
              </p>
            </motion.div>

            {!isSubmitted ? (
              /* Forgot Password Form */
              <motion.form
                className="space-y-6"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--foreground)] mb-3"
                  >
                    Email Address
                  </label>
                  <motion.div className="relative" whileFocus={{ scale: 1.02 }}>
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-[var(--muted-foreground)]" />
                    <motion.input
                      id="email"
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all backdrop-blur"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
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
                  <Mail className="w-8 h-8 text-green-500" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
                  <p className="text-[var(--foreground-muted)]">
                    We've sent password reset instructions to{" "}
                    <strong>{email}</strong>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Back to Login */}
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
