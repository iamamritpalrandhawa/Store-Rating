/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const UserDashboard = () => {
  const { user, logout } = useAuth();

  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  // 🔐 Profile state
  const [showProfile, setShowProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const fetchStores = async () => {
    try {
      const res = await API.get("/user/stores");
      setStores(res.data);
    } catch {
      toast.error("Failed to fetch stores ❌");
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // ⭐ Submit rating
  const submitRating = async (storeId, rating) => {
    try {
      await API.post("/user/ratings", {
        store_id: storeId,
        rating,
      });

      toast.success("Rating submitted ⭐");
      fetchStores();
    } catch {
      toast.error("Failed to submit rating ❌");
    }
  };

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

  // 🔍 Filter logic
  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase());

    const matchesRating = ratingFilter
      ? s.avgRating >= Number(ratingFilter)
      : true;

    return matchesSearch && matchesRating;
  });

  return (
    <div className="p-6 space-y-6">
      {/* 🔝 HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stores</h1>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowProfile(true)}>
            Profile
          </Button>

          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* 🔍 FILTERS */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search by name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">All Ratings</option>
          <option value="4">4+ ⭐</option>
          <option value="3">3+ ⭐</option>
          <option value="2">2+ ⭐</option>
        </select>
      </div>

      {/* 🏪 STORE LIST */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map((store) => (
          <Card key={store.id} className="shadow-md">
            <CardHeader>
              <CardTitle>{store.name}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{store.address}</p>

              <p className="text-sm">
                ⭐ Avg Rating:{" "}
                <span className="font-semibold">
                  {store.avgRating || "No ratings"}
                </span>
              </p>

              <p className="text-sm">
                Your Rating:{" "}
                <span className="font-semibold">
                  {store.userRating || "Not rated"}
                </span>
              </p>

              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    size="sm"
                    variant="outline"
                    onClick={() => submitRating(store.id, n)}
                  >
                    {n} ⭐
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 👤 PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md shadow-2xl border bg-background">
            <CardHeader className="text-center border-b">
              <CardTitle className="text-xl font-semibold">
                👤 Profile
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* User Info */}
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <span className="font-medium">{user?.name}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{user?.email}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Address:</span>{" "}
                  <span className="font-medium">{user?.address}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Role:</span>{" "}
                  <span className="font-medium">{user?.role}</span>
                </p>
              </div>

              {/* Divider */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">
                  🔐 Update Password
                </p>

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

              {/* Close */}
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

export default UserDashboard;
