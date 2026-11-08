"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useEffect, useState } from "react";

export default function Login() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { data: authData, error } =
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", authData.user.id)
      .single();

    if (profileError || profile?.status === "inactive") {
      await supabase.auth.signOut();
      setErrorMessage(
        "Your account has been deactivated. Please contact support."
      );
      setLoading(false);
      return;
    }

    localStorage.setItem("rememberMe", String(rememberMe));

    setSuccessMessage("Login successful!");
    router.push("/dashboard");
  };

  useEffect(() => {
    const savedRememberMe = localStorage.getItem("rememberMe");

    if (savedRememberMe !== null) {
      setRememberMe(savedRememberMe === "true");
    }
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="text-center mb-7">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Login to your Call-Me account
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-red-600 text-sm text-center">
                {errorMessage}
              </p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-green-600 text-sm text-center">
                {successMessage}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>

            <Input
              {...register("email")}
              type="email"
              className={`h-11 rounded-xl bg-gray-50 text-gray-900 border ${
                errors.email
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-200 focus-visible:ring-gray-900"
              }`}
              placeholder="example@email.com"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                className={`h-11 rounded-xl bg-gray-50 text-gray-900 border pr-20 ${
                  errors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "border-gray-200 focus-visible:ring-gray-900"
                }`}
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
              />
              Remember Me
            </label>

            <button
              onClick={() => router.push("/forget")}
              type="button"
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 cursor-pointer rounded-xl bg-gray-900 hover:bg-gray-800 text-white transition"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-center pt-1">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth")}
                className="font-medium text-gray-900 hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}