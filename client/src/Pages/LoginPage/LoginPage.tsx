import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import api from "@/api/api";
import useUserStore from "@/store/userStore";
import { Lock, Mail, ArrowRight, Compass } from "lucide-react";
import { ThemeSwitcher } from "@/components/CustomComponents/ThemeSwitcher";
import { motion } from "motion/react";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
      const response = await api.post("/api/auth/login", formData);

      // Check if user needs verification
      if (response.data.needsVerification) {
        // Store email for OTP verification
        localStorage.setItem("verificationEmail", formData.email);
        toast.info("Verification Required", {
          description: "Please check your email for the OTP",
        });
        navigate("/verify-otp");
        return;
      }

      const { token, user } = response.data;
      useUserStore.getState().setToken(token);
      useUserStore.getState().setUser(user);

      toast.success("Login Successful", {
        description: "Welcome back!",
      });
      if (user.role === "captain") {
        navigate("/captain");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error("Login Failed", {
        description: error.response?.data?.message || "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse,
  ) => {
    try {
      setIsLoading(true);
      if (!credentialResponse.credential) {
        toast.error("Authentication Failed", {
          description: "No credentials received from Google",
        });
        return;
      }

      const decoded = jwtDecode<GoogleUser>(credentialResponse.credential);
      const response = await api.post("/api/auth/google", {
        name: decoded.name,
        email: decoded.email,
        profilePicture: decoded.picture,
      });

      const { token, user } = response.data;
      useUserStore.getState().setToken(token);
      useUserStore.getState().setUser(user);

      toast.success("Success", {
        description: "Successfully logged in with Google",
      });
      if (user.role === "captain") {
        navigate("/captain");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error("Google Login Failed", {
        description:
          error.response?.data?.message ||
          "An error occurred during Google sign-in",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google Login Failed", {
      description: "Unable to login with Google. Please try again.",
    });
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
          <Link to="/" className="flex items-center gap-3 font-bold text-lg group">
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
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <motion.div
            className="hidden lg:block relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              <motion.img
                src="https://images.unsplash.com/photo-1578574494640-8f5fcbdc0e98?w=800&h=900&fit=crop"
                alt="Fleet Command Center"
                className="w-full h-auto object-cover aspect-square"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                initial={{ opacity: 0.3 }}
                whileHover={{ opacity: 0.5 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-8 text-white"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-3xl font-bold mb-2">Maritime Command</h3>
                <p className="text-sm text-gray-200">
                  Real-time control of your entire fleet operations
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-8">
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-5xl font-bold">Welcome Back</h1>
                <p className="text-[var(--foreground-muted)] text-lg">
                  Access your Fleet Command operations center
                </p>
              </motion.div>

              {/* Login Form */}
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
                  <motion.div
                    className="relative"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-[var(--muted-foreground)]" />
                    <motion.input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/50 text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all backdrop-blur"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      whileHover={{ borderColor: "var(--primary)" }}
                    />
                  </motion.div>
                </motion.div>

                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[var(--foreground)]"
                    >
                      Password
                    </label>
                    <motion.button
                      type="button"
                      className="text-sm text-[var(--primary)] hover:underline"
                      whileHover={{ scale: 1.05 }}
                    >
                      Forgot?
                    </motion.button>
                  </div>
                  <motion.div
                    className="relative"
                    whileFocus={{ scale: 1.02 }}
                  >
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </>
                  )}
                </motion.button>
              </motion.form>

              {/* Divider */}
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-[var(--background)] text-[var(--muted-foreground)]">
                    Or continue with
                  </span>
                </div>
              </motion.div>

              {/* Google Login */}
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                />
              </motion.div>

              {/* Register Link */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-[var(--foreground-muted)]">
                  Don't have an account?{" "}
                  <motion.button
                    onClick={() => navigate("/register")}
                    className="font-semibold text-[var(--primary)] hover:underline"
                    whileHover={{ scale: 1.05 }}
                  >
                    Create one now
                  </motion.button>
                </p>
              </motion.div>

              {/* Back to Home */}
              <motion.div
                className="pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                <Link
                  to="/"
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1 group"
                >
                  <motion.span
                    animate={{ x: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ←
                  </motion.span>
                  Back to home
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
