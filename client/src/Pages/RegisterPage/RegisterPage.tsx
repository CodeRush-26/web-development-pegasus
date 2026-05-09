import { useState } from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import useUserStore from "@/store/userStore";

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
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
      const response = await api.post("/api/auth/register", formData);
      toast.success("Registration Successful", {
        description: "Please check your email for OTP verification",
      });
      // Store email for OTP verification
      localStorage.setItem("verificationEmail", formData.email);
      navigate("/verify-otp");
    } catch (error: any) {
      toast.error("Registration Failed", {
        description: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
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
      const response = await api.post("/auth/google", {
        name: decoded.name,
        email: decoded.email,
        profilePicture: decoded.picture,
      });

      const { token, user } = response.data;
      useUserStore.getState().setToken(token);
      useUserStore.getState().setUser(user);

      toast.success("Success", {
        description: "Successfully registered with Google",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Google Registration Failed", {
        description:
          error.response?.data?.message ||
          "An error occurred during Google sign-in",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google Registration Failed", {
      description: "Unable to register with Google. Please try again.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="max-w-sm w-full space-y-8 p-8 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)]">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-[var(--foreground)]">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--input)] bg-[var(--muted)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)] focus:border-transparent"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--input)] bg-[var(--muted)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)] focus:border-transparent"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--input)] bg-[var(--muted)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)] focus:border-transparent"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--gaming-purple)] hover:bg-[var(--gaming-purple-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gaming-purple)] disabled:opacity-50"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[var(--card)] text-[var(--muted-foreground)]">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
            />
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-medium text-[var(--gaming-purple)] hover:text-[var(--gaming-purple-light)]"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
