import Homepage from "@/pages/Homepage";
import Login from "@/auth/Login";
import Register from "@/auth/Register";
import NotFound from "@/pages/NotFound";
import { Route, Routes } from "react-router-dom";

function PublicRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={ <NotFound />} />
    </Routes>
  );
}

export default PublicRoutes;
