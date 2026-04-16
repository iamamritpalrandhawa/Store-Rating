import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomeRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/admin" />;
  }

  if (user.role === "STORE_OWNER") {
    return <Navigate to="/owner" />;
  }

  return <Navigate to="/user" />;
};

export default HomeRedirect;
