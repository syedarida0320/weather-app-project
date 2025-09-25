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
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axios from "@/utils/axios";
import { toast, Bounce } from "react-toastify";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleRegister(e) {
    e.preventDefault();
    setError([]);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await axios.post("/auth/register", { email, password, confirmPassword: confirm });
      const { user, token } = res.data.data;
      if (!user || !token) throw new Error("Invalid registration response");
      login(user, token);
      toast.success("Registeration Successful", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      theme: "light",
      transition: Bounce,
    });

     setTimeout(() => navigate("/forecast"), 500); // navigate only if everything succeeds
    } catch (err) {
      if (err.response?.data?.errors) {
      setError(err.response.data.errors);
      toast.error("Registeration failed  ❌", {autoClose:2000});
    } else {
      setError([err.response?.data?.message || err.message]);
    }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600">
      <Card className="w-full md:m-0 mx-[20px] max-w-md bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Create an Account
          </CardTitle>
          <CardDescription className="text-[12px] text-gray-600">
            Sign up to get personalized weather forecasts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-2 md:space-y-4" onSubmit={handleRegister}>
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
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="******"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button variant="black" type="submit" className="w-full">
              Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 md:gap-3">
          <p className="md:text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
