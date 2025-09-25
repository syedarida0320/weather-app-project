import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log("window.location.pathname", window.location.pathname);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  //  else if (window.location.pathname !== '/forecast') {
  //   return <Navigate from={window.location.pathname} to='/forecast' />
  // };

  return children;
};

export default ProtectedRoute;
