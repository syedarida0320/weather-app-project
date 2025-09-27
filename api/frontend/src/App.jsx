import React, { Fragment } from "react";
import { useAuth } from "@/context/AuthContext";
import PrivateRoutes from "@/routes/PrivateRoutes";
import PublicRoutes from "@/routes/PublicRoutes";
import { ToastContainer, Bounce } from "react-toastify";

const App = () => {
  const { user } = useAuth();

  return (
    <Fragment>
      {user ? <PrivateRoutes /> : <PublicRoutes />}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="light"
        transition={Bounce}
      />
    </Fragment>
  );
};

export default App;
