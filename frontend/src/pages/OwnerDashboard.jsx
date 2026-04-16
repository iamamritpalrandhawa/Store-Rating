/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const OwnerDashboard = () => {
  const { user, logout } = useAuth();

  const [data, setData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/owner/dashboard");
      setData(res.data);
    } catch {
      toast.error("Failed to load dashboard ❌");
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // 🔐 Update password
  const updatePassword = async () => {
    try {
      await API.put("/user/update-password", passwordForm);
      toast.success("Password updated ✅");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed ❌");
    }
  };

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* 🔝 HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowProfile(true)}>
            Profile
          </Button>

          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* 🏪 STORE INFO */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>{data.store.name}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="text-muted-foreground">{data.store.address}</p>

          <p>
            ⭐ Average Rating:{" "}
            <span className="font-semibold">
              {Number(data.averageRating).toFixed(1)}
            </span>
          </p>
        </CardContent>
      </Card>

      {/* 👥 USERS RATINGS */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Users & Ratings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {data.ratings.length === 0 ? (
            <p className="text-muted-foreground">No ratings yet</p>
          ) : (
            data.ratings.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{r.User.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.User.email}
                  </p>
                </div>

                <span className="font-semibold">{r.rating} ⭐</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 👤 PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md shadow-2xl bg-background">
            <CardHeader className="text-center border-b">
              <CardTitle>👤 Profile</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              <p>
                <b>Name:</b> {user?.name}
              </p>
              <p>
                <b>Email:</b> {user?.email}
              </p>
              <p>
                <b>Address:</b> {user?.address}
              </p>
              <p>
                <b>Role:</b> {user?.role}
              </p>

              <div className="border-t pt-4 space-y-3">
                <Input
                  placeholder="Old Password"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                />

                <Input
                  placeholder="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                />

                <Button onClick={updatePassword} className="w-full">
                  Update Password
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowProfile(false)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
