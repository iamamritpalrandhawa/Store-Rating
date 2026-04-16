import { useEffect, useState } from "react";
import API from "../api/axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminDashboard = () => {
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const [showProfile, setShowProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  // ================= FETCH =================
  const fetchUsers = async () => {
    const res = await API.get("/admin/users");
    setUsers(res.data);
  };

  const fetchStores = async () => {
    const res = await API.get("/admin/stores");
    setStores(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchStores();
  }, []);

  // ================= CREATE =================
  const createUser = async () => {
    try {
      await API.post("/admin/users", newUser);
      toast.success("User created ✅");
      fetchUsers();
    } catch {
      toast.error("Failed ❌");
    }
  };

  const createStore = async () => {
    try {
      await API.post("/admin/stores", newStore);
      toast.success("Store created ✅");
      fetchStores();
    } catch {
      toast.error("Failed ❌");
    }
  };

  // ================= PASSWORD =================
  const updatePassword = async () => {
    try {
      await API.put("/user/update-password", passwordForm);
      toast.success("Password updated ✅");
    } catch (err) {
      toast.error(err.response?.data?.msg || "Failed ❌");
    }
  };

  // ================= FILTER =================
  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.address, u.role]
      .join(" ")
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  );

  const filteredStores = stores.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
      s.address.toLowerCase().includes(storeSearch.toLowerCase());

    const matchRating =
      !ratingFilter ||
      ratingFilter === "all" ||
      Math.floor(s.averageRating || 0) === Number(ratingFilter);

    return matchSearch && matchRating;
  });

  const availableOwners = users.filter(
    (u) => u.role === "STORE_OWNER" && !stores.some((s) => s.owner_id === u.id),
  );

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowProfile(true)}>
            Profile
          </Button>

          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {/* ================= USERS ================= */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Users</CardTitle>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">+ Add User</Button>
            </DialogTrigger>

            <DialogContent
              className="
      bg-white 
      border 
      shadow-2xl 
      rounded-xl 
      backdrop-blur-none
    "
            >
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  Create User
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Name"
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Email"
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                />
                <Input
                  type="password"
                  placeholder="Password"
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                />
                <Input
                  placeholder="Address"
                  onChange={(e) =>
                    setNewUser({ ...newUser, address: e.target.value })
                  }
                />

                <Select
                  defaultValue="USER"
                  onValueChange={(val) => setNewUser({ ...newUser, role: val })}
                >
                  <SelectTrigger className="bg-white border shadow-sm">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>

                  <SelectContent
                    className="
      bg-white 
      border 
      shadow-xl 
      rounded-md 
      backdrop-blur-md
    "
                  >
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="STORE_OWNER">Store Owner</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={createUser}
                  className="
    w-full 
    bg-white 
    text-black 
    border 
    border-gray-300 
    shadow-sm
    hover:bg-gray-100 
    hover:shadow-md
    transition-all
  "
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />

          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="border rounded-lg p-3 flex justify-between"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
              <span className="text-sm font-semibold">{u.role}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= STORES ================= */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Stores</CardTitle>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">+ Add Store</Button>
            </DialogTrigger>

            <DialogContent
              className="
      bg-white
      border
      shadow-2xl
      rounded-xl
    "
            >
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">
                  Create Store
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <Input
                  placeholder="Name"
                  onChange={(e) =>
                    setNewStore({ ...newStore, name: e.target.value })
                  }
                />

                <Input
                  placeholder="Email"
                  onChange={(e) =>
                    setNewStore({ ...newStore, email: e.target.value })
                  }
                />

                <Input
                  placeholder="Address"
                  onChange={(e) =>
                    setNewStore({ ...newStore, address: e.target.value })
                  }
                />

                {/* OWNER SELECT */}
                <Select
                  onValueChange={(val) =>
                    setNewStore({ ...newStore, owner_id: val })
                  }
                >
                  <SelectTrigger className="bg-white border">
                    <SelectValue placeholder="Select Owner" />
                  </SelectTrigger>

                  <SelectContent className="bg-white border shadow-xl">
                    {availableOwners.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={createStore}
                  className="
          w-full
          bg-white
          text-black
          border
          border-gray-300
          shadow-sm
          hover:bg-gray-100
          transition
        "
                >
                  Create Store
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search stores..."
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
            />

            <Select onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[120px] bg-white border shadow-sm">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>

              <SelectContent className="bg-white border shadow-xl rounded-md backdrop-blur-md">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="5">5 ⭐</SelectItem>
                <SelectItem value="4">4 ⭐</SelectItem>
                <SelectItem value="3">3 ⭐</SelectItem>
                <SelectItem value="2">2 ⭐</SelectItem>
                <SelectItem value="1">1 ⭐</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredStores.map((s) => (
            <div
              key={s.id}
              className="border rounded-lg p-3 flex justify-between"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted-foreground">{s.address}</p>
              </div>
              <span>⭐ {Number(s.averageRating || 0).toFixed(1)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= PROFILE ================= */}
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

export default AdminDashboard;
