import { useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
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
import { Label } from "@/components/ui/label";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    try {
      setLoading(true);

      const cleanedEmail = form.email.trim().toLowerCase();

      const res = await API.post("/auth/login", {
        email: cleanedEmail,
        password: form.password,
      });

      // ✅ NORMAL LOGIN
      login(res.data);
      toast.success("Login successful 🎉");

      const role = res.data.user.role;

      if (role === "ADMIN") navigate("/admin");
      else if (role === "STORE_OWNER") navigate("/owner");
      else navigate("/user");
    } catch (err) {
      const data = err?.response?.data;

      // 🔥 HANDLE OTP FLOW
      if (data?.needVerification) {
        toast.warning("Please verify your email. OTP sent 📩");
        localStorage.setItem("verifyEmail", form.email);
        navigate("/verify-otp");
        return;
      }
      toast.error(data?.msg || "Login failed ❌");
      setError(data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md rounded-2xl border-0 shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Welcome back! Enter your credentials
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Error */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-sm text-right">
            <Link to="/forgot-password" className="text-blue-600">
              Forgot Password?
            </Link>
          </p>

          {/* Signup link */}
          <p className="text-sm text-center mt-2">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-medium">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
