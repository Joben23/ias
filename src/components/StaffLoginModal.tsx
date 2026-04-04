import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import emailjs from "@emailjs/browser";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, AuthUser } from "@/contexts/AuthContext";
import { hasRole, getUserRoles, validateCredentials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HeartPulse, Mail, Lock, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Initialize EmailJS
emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

interface StaffLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme?: "light" | "dark";
}

export function StaffLoginModal({ open, onOpenChange, theme = "light" }: StaffLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otpCode, setOtpCode] = useState("");
  const [userOtpInput, setUserOtpInput] = useState("");
  const [codeExpiry, setCodeExpiry] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { authUser, setAuthUser, isDeviceTrusted, trustDevice } = useAuth();

  // Redirect if user already authenticated
  useEffect(() => {
    if (authUser && open) {
      console.log("[STAFFLOGIN] User already authenticated, redirecting...");
      const redirectUrl = authUser.roles.includes("admin") || authUser.roles.includes("hr")
        ? "/hr1/dashboard"
        : "/employee-portal";
      window.scrollTo(0, 0);
      navigate(redirectUrl, { replace: true });
      onOpenChange(false);
    }
  }, [authUser, open, navigate, onOpenChange]);

  // Countdown timer for OTP
  useEffect(() => {
    if (!codeExpiry) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((codeExpiry - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        setStep("credentials");
        setCodeExpiry(null);
        toast({
          title: "OTP Expired",
          description: "Verification code has expired. Please try again.",
          variant: "destructive",
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [codeExpiry]);

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("[AUTH] Validating credentials for:", email);

      // Validate email and password
      const validatedUser = await validateCredentials(email, password);
      if (!validatedUser) {
        toast({
          title: "Invalid Credentials",
          description: "Email or password is incorrect.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log("[AUTH] Credentials valid, checking device trust");

      // Check if device is trusted
      if (isDeviceTrusted(email)) {
        console.log("[AUTH] Device is trusted, skipping OTP");
        
        // Get user roles
        const roles = await getUserRoles(validatedUser.id);
        console.log("[AUTH] User roles:", roles);

        // Create auth session
        const authUser = {
          id: validatedUser.id,
          email: validatedUser.email,
          roles,
          fullName: validatedUser.fullName,
        };

        setAuthUser(authUser);

        toast({
          title: "Logged In",
          description: "Welcome back! Redirecting...",
        });

        setTimeout(() => {
          const redirectUrl = roles.includes("admin") || roles.includes("hr")
            ? "/hr1/dashboard"
            : "/employee-portal";
          window.scrollTo(0, 0);
          navigate(redirectUrl, { replace: true });
          onOpenChange(false);
        }, 1000);

        return;
      }

      console.log("[AUTH] Device not trusted, sending OTP");
      setCurrentUserId(validatedUser.id);
      setCurrentUserEmail(validatedUser.email);

      // Generate and send OTP
      const newOtp = generateOTP();
      setOtpCode(newOtp);

      const templateParams = {
        to_email: email,
        user_email: email,
        otp_code: newOtp,
      };

      console.log("[EMAILJS] Sending OTP");
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_OTP,
        templateParams
      );

      const expiryTime = Date.now() + 5 * 60 * 1000;
      setCodeExpiry(expiryTime);
      setTimeRemaining(300);
      setStep("otp");
      setUserOtpInput("");

      toast({
        title: "OTP Sent",
        description: `A verification code has been sent to ${email}. It will expire in 5 minutes.`,
      });
    } catch (error) {
      console.error("[AUTH] Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (userOtpInput !== otpCode) {
      toast({
        title: "Invalid OTP",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (!currentUserId || !currentUserEmail) {
        throw new Error("User information missing");
      }

      console.log("[AUTH] OTP verified, fetching user roles");

      const roles = await getUserRoles(currentUserId);
      console.log("[AUTH] User roles:", roles);

      trustDevice(currentUserId, currentUserEmail);

      const authUserData: AuthUser = {
        id: currentUserId,
        email: currentUserEmail,
        roles,
      };

      setAuthUser(authUserData);

      toast({
        title: "Verification Successful",
        description: "Logging you in...",
      });

      setTimeout(() => {
        const redirectUrl = roles.includes("admin") || roles.includes("hr")
          ? "/hr1/dashboard"
          : "/employee-portal";
        window.scrollTo(0, 0);
        navigate(redirectUrl, { replace: true });
        onOpenChange(false);

        setStep("credentials");
        setEmail("");
        setPassword("");
        setCodeExpiry(null);
        setUserOtpInput("");
        setCurrentUserId(null);
        setCurrentUserEmail(null);
      }, 1000);
    } catch (error) {
      console.error("[AUTH] Verification error:", error);
      toast({
        title: "Error",
        description: "An error occurred during verification.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!currentUserEmail) return;

    setLoading(true);
    try {
      const newOtp = generateOTP();
      setOtpCode(newOtp);

      const templateParams = {
        to_email: currentUserEmail,
        user_email: currentUserEmail,
        otp_code: newOtp,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_OTP,
        templateParams
      );

      const expiryTime = Date.now() + 5 * 60 * 1000;
      setCodeExpiry(expiryTime);
      setTimeRemaining(300);
      setUserOtpInput("");

      toast({
        title: "OTP Resent",
        description: `A new verification code has been sent to ${currentUserEmail}.`,
      });
    } catch (error) {
      console.error("[AUTH] Resend error:", error);
      toast({
        title: "Error",
        description: "Failed to resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="w-full max-w-md transition-all duration-500">
      <div
        className={`rounded-2xl shadow-2xl border transition-all duration-300 ${
          isDark
            ? "bg-slate-800 border-slate-700 shadow-xl"
            : "bg-white border-slate-300 shadow-xl"
        }`}
      >
        <div
          className={`p-8 pb-6 text-center border-b transition-colors duration-300 ${
            isDark ? "border-slate-700/50" : "border-slate-200/50"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-500 hover:scale-110 ${
              isDark
                ? "bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                : "bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20"
            }`}
          >
            <HeartPulse className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2
            className={`text-2xl font-bold mb-1 transition-colors duration-300 ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Staff Login
          </h2>
          <p
            className={`text-sm transition-colors duration-300 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {step === "credentials" && "Enter your email and password"}
            {step === "otp" && "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        <div className="p-8 space-y-6">
          {step === "credentials" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="email" className={isDark ? "text-slate-300" : "text-slate-700"}>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 h-11 rounded-lg ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={isDark ? "text-slate-300" : "text-slate-700"}>
                  Password
                </Label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`} />
                  <Input
                    id="password"
                    type="password"
                    placeholder="��������"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 h-11 rounded-lg ${
                      isDark
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                        : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                    }`}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full ${
                  isDark
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                }`}
                disabled={loading || !email || !password}
              >
                {loading ? "Verifying�" : "Continue"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div
                className={`p-4 rounded-xl flex gap-3 ${
                  isDark
                    ? "bg-blue-900/30 border border-blue-800/50"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <Clock
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 animate-spin ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                />
                <div className="text-sm">
                  <p className={`font-semibold ${isDark ? "text-blue-300" : "text-blue-900"}`}>
                    Code expires in
                  </p>
                  <p className={`text-lg font-mono ${isDark ? "text-blue-200" : "text-blue-800"}`}>
                    {timeRemaining
                      ? `${Math.floor(timeRemaining / 60)}:${String(timeRemaining % 60).padStart(2, "0")}`
                      : "Expired"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="otp" className={isDark ? "text-slate-300" : "text-slate-700"}>
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={userOtpInput}
                  onChange={(e) => setUserOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className={`text-center text-2xl tracking-widest font-mono h-14 rounded-lg ${
                    isDark
                      ? "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                  required
                />
              </div>

              <Button
                type="button"
                onClick={handleOTPVerification}
                className={`w-full ${
                  isDark
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                }`}
                disabled={loading || userOtpInput.length !== 6}
              >
                {loading ? "Verifying�" : "Verify Code"}
              </Button>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("credentials");
                    setCodeExpiry(null);
                    setUserOtpInput("");
                  }}
                  className={isDark ? "bg-slate-700 border-slate-600 text-slate-200" : ""}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOTP}
                  className={isDark ? "flex-1 bg-slate-700 border-slate-600 text-slate-200" : "flex-1"}
                  disabled={loading || !timeRemaining || timeRemaining > 290}
                >
                  {loading ? "Sending�" : "Resend"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
