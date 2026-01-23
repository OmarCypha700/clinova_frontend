"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, loading, login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      checkUserRoleAndRedirect();
    }
  }, [loading, isAuthenticated, router]);

  const checkUserRoleAndRedirect = async () => {
    try {
      const res = await api.get("/accounts/me/");

      if (res.data.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/programs");
      }
    } catch (err) {
      console.error("Failed to check user role", err);
      router.replace("/programs");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/accounts/login/", {
        username,
        password,
      });

      const { access, refresh, user } = res.data;

      // Store tokens
      login(access, refresh);

      // Set the token immediately for this Axios instance
      api.defaults.headers.Authorization = `Bearer ${access}`;

      // Store user data
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        router.push("/admin");
        toast.success(`Welcome ${user.username}!`);
      } else if (user.role === "examiner") {
        router.push("/programs");
        toast.success(`Welcome ${user.username}!`);
      }
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left image skeleton, hidden on mobile */}
            <div className="hidden md:block">
              <div className="animate-pulse">
                <div className="h-[420px] w-full rounded-xl bg-gray-200"></div>
              </div>
            </div>

            {/* Right login form skeleton */}
            <div className="w-full max-w-md mx-auto">
              <div className="animate-pulse space-y-6">
                {/* Title */}
                <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto"></div>

                {/* Input fields */}
                <div className="space-y-4">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>

                {/* Button */}
                <div className="h-12 bg-gray-200 rounded"></div>

                {/* Extra links */}
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center rounded-l-lg">
        <Image
          src="/ClinOva.webp"
          alt="Login illustration"
          width={1080}
          height={720}
          priority
          className="w-3/4 max-w-md"
          sizes="(max-width: 768px) 100vw, 75vw"
        />
      </div>

      {/* Login form */}
      <div className="w-full m-auto md:w-1/2 flex flex-col items-center justify-center p-6 bg-white rounded-r-lg">
        <div className="flex items-center justify-center mb-6">
          <Image
            src="/logo.webp"
            fetchPriority="high"
            alt="Logo"
            width={90}
            height={90}
            priority
          />
          <div className="ml-3">
            <p className="font-bold text-2xl text-center">NURSING</p>
            <p className="text-center">PRACTICALS APP</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            EXAMINER LOGIN
          </h2>

          {error && (
            <p className="mb-3 text-sm text-red-600 text-center">{error}</p>
          )}

          <input
            type="text"
            placeholder="Username"
            className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={submitting}
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-2 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              disabled={submitting}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-400 to-green-400 text-white font-semibold"
            disabled={submitting}
          >
            {submitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}