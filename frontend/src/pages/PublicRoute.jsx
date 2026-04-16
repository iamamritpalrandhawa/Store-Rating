import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  // ✅ agar already login hai → dashboard pe bhej do
  if (user) {
    if (user.role === "ADMIN") return <Navigate to="/admin" />;
    if (user.role === "STORE_OWNER") return <Navigate to="/owner" />;
    return <Navigate to="/user" />;
  }

  return children;
};

export default PublicRoute;
