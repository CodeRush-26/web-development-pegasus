import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import api from "@/api/api";
import useUserStore from "@/store/userStore";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { ThemeSwitcher } from "@/components/CustomComponents/ThemeSwitcher";

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
      navigate("/dashboard");
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
      navigate("/dashboard");
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
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-[var(--primary)] rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            Fleet Command
          </Link>
          <ThemeSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="hidden lg:block relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1541888062821-2e6f2122602f?w=800&h=900&fit=crop"
                alt="Fleet Command Center"
                className="w-full h-auto object-cover aspect-square"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  Global Fleet Operations
                </h3>
                <p className="text-sm text-gray-200">
                  Monitor and control your maritime fleet with real-time
                  precision
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div>
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">Welcome Back</h1>
                <p className="text-[var(--foreground-muted)]">
                  Sign in to your Fleet Command account
                </p>
              </div>

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--foreground)] mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-[var(--muted-foreground)]" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-[var(--foreground)]"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sm text-[var(--primary)] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-[var(--muted-foreground)]" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-[var(--primary)] text-white font-semibold rounded-lg hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--primary)]/30 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-[var(--background)] text-[var(--muted-foreground)]">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Login */}
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                />
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-[var(--foreground-muted)]">
                  Don't have an account?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="font-semibold text-[var(--primary)] hover:underline"
                  >
                    Create one now
                  </button>
                </p>
              </div>

              {/* Back to Home */}
              <div className="pt-4">
                <Link
                  to="/"
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors inline-flex items-center gap-1"
                >
                  ← Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
