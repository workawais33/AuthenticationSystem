"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  type SignupFormData = z.infer<typeof signupSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage(
      "Account created successfully! Please check your email to verify your account."
    );
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img
                className="h-12 w-12 rounded-full"
                src="https://media.flaticon.com/dist/min/img/home/cards-products-section/circles/animated.png"
                alt="Call-Me"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create your account
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              Join Call-Me and start connecting with others.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-red-600 text-sm">
                  {errorMessage}
                </p>
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-green-600 text-sm">
                  {successMessage}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>

              <Input
                {...register("firstName")}
                placeholder="Enter your first name"
                className={`h-11 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 border ${
                  errors.firstName
                    ? "border-red-400 focus-visible:ring-red-400"
                    : "border-gray-200 focus-visible:ring-gray-400"
                }`}
              />

              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>

              <Input
                {...register("lastName")}
                placeholder="Enter your last name"
                className={`h-11 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 border ${
                  errors.lastName
                    ? "border-red-400 focus-visible:ring-red-400"
                    : "border-gray-200 focus-visible:ring-gray-400"
                }`}
              />

              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <Input
                {...register("email")}
                type="email"
                placeholder="example@email.com"
                className={`h-11 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 border ${
                  errors.email
                    ? "border-red-400 focus-visible:ring-red-400"
                    : "border-gray-200 focus-visible:ring-gray-400"
                }`}
              />

              {errors.email && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className={`h-11 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 pr-16 border ${
                  errors.password
                    ? "border-red-400 focus-visible:ring-red-400"
                    : "border-gray-200 focus-visible:ring-gray-400"
                }`}
              />

              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-[34px] h-8 px-2 text-xs font-medium text-gray-500 bg-transparent hover:bg-gray-100 hover:text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </Button>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>

              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={`h-11 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 pr-16 border ${
                  errors.confirmPassword
                    ? "border-red-400 focus-visible:ring-red-400"
                    : "border-gray-200 focus-visible:ring-gray-400"
                }`}
              />

              <Button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-2 top-[34px] h-8 px-2 text-xs font-medium text-gray-500 bg-transparent hover:bg-gray-100 hover:text-gray-700"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </Button>

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1.5">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium cursor-pointer transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-gray-500 pt-1">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="font-medium text-gray-900 hover:underline cursor-pointer"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

