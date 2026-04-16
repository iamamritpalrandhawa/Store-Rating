import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState = location.state?.email || "";

  const [form, setForm] = useState({
    email: emailFromState,
    otp: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);

      await API.post("/auth/reset-password", form);

      toast.success("Password reset successful");

      // ✅ redirect to login
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md border-0 shadow-none">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter OTP and new password</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* OTP */}
          <Input
            placeholder="Enter OTP"
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
          />

          {/* New Password */}
          <Input
            type="password"
            placeholder="New Password"
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />

          <Button onClick={handleReset} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
