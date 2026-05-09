import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/api/api";

export default function OTPPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem("verificationEmail");
    if (!storedEmail) {
      navigate("/register");
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await api.post("/api/auth/verify-otp", { email, otp });
      toast.success("Email Verified", {
        description: "Your email has been verified successfully",
      });
      localStorage.removeItem("verificationEmail");
      navigate("/login");
    } catch (error: any) {
      toast.error("Verification Failed", {
        description: error.response?.data?.message || "Invalid OTP",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="max-w-md w-full space-y-8 p-8 bg-[var(--card)] rounded-lg shadow-lg border border-[var(--border)]">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-[var(--foreground)]">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">
            Please enter the OTP sent to {email}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="sr-only">
              OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-[var(--input)] bg-[var(--muted)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)] focus:border-transparent"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[var(--primary-foreground)] bg-[var(--gaming-purple)] hover:bg-[var(--gaming-purple-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--gaming-purple)] disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
