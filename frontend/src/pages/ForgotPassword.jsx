import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      setLoading(true);

      await API.post("/auth/forgot-password", { email });

      toast.success("OTP sent to email");

      // ✅ Redirect with email
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      toast.error(err?.response?.data?.msg || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md border-0 shadow-none">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive OTP</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button onClick={handleSendOtp} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
