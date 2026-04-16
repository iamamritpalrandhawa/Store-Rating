import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const VerifyOtp = () => {
  const navigate = useNavigate();

  const email = localStorage.getItem("verifyEmail");
  const [otp, setOtp] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/verify-otp", { email, otp });

      toast.success("Account verified successfully ✅");

      localStorage.removeItem("verifyEmail");

      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Invalid or expired OTP");
    }
  };

  const resendOtp = async () => {
    try {
      await API.post("/auth/forgot-password", { email });
      toast.warning("OTP resent successfully");
    } catch (err) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-xl">Verify OTP</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <Label>Email</Label>
              <Input value={email} disabled />
            </div>

            {/* OTP */}
            <div className="space-y-1">
              <Label>Enter OTP</Label>
              <Input
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <Button className="w-full">Verify OTP</Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={resendOtp}
            >
              Resend OTP
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOtp;
