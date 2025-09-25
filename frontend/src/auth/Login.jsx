import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axios from "@/utils/axios";
import { toast, Bounce } from "react-toastify";
// Firebase imports (frontend SDK just for popup)
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

const googleProvider=new GoogleAuthProvider();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("/auth/login", { email, password });

      //  Check your backend response structure
      const { user, token } = res.data.data;
      if (!user || !token) throw new Error("Invalid login response");

      login(user, token);


     toast.success("Login Successful", {autoClose:2000});

    // small delay so toast appears before navigation
    setTimeout(() => navigate("/forecast"), 500);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      toast.error("Login failed  ❌", {autoClose:2000});
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const res = await axios.post("/auth/google-login", {token});

     const { user, token: backendToken } = res.data.data;
      login(user, backendToken);

      toast.success("Google Login Successful ✅", { autoClose: 2000 });

      setTimeout(() => navigate("/forecast"), 500);
    } catch (err) {
      console.error("Google login failed:", err);
      setError("Google login failed.");
      toast.error("Google login failed ❌", { autoClose: 2000 });
    }
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600">
      <Card className="w-full md:m-0 mx-[20px] max-w-md bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-[14px] md:text-2xl font-bold text-gray-800">
            <NavLink className={"text-[24px]"} to="/">
              WeatherView
            </NavLink>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Login to explore forecasts in your city
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-2 md:space-y-4" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button variant="black" type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 md:gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            Login with Google
          </Button>
          <p className="md:text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
