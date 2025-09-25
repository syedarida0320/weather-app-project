import Forecast from "@/pages/Forcast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Route, Routes } from "react-router-dom";
import NotFound from "@/pages/NotFound";

function PrivateRoutes() {
  return (
    <Routes>
      <Route
        path="/forecast"
        element={
          <ProtectedRoute>
            <Forecast />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={ <NotFound />} />
    </Routes>
  );
}

export default PrivateRoutes;
