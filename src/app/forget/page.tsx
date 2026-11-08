"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgetPasswordSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Forget() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  type ForgetPasswordFormData = z.infer<
    typeof forgetPasswordSchema
  >;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordFormData>({
    resolver: zodResolver(forgetPasswordSchema),
  });

  const onSubmit = async (data: ForgetPasswordFormData) => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/reset`,
        }
      );

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage(
      "Password reset link has been sent to your email."
    );

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="text-center mb-7">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4">
            <span className="text-white text-xl font-bold">
              C
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Forgot Password?
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            Enter your email and we'll send you a password
            reset link.
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
              Email Address
            </label>

            <Input
              {...register("email")}
              type="email"
              className={`h-11 rounded-xl bg-gray-50 text-gray-900 border ${
                errors.email
                  ? "border-red-500 focus-visible:ring-red-500"
                  : "border-gray-200 focus-visible:ring-gray-900"
              }`}
              placeholder="example@gmail.com"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white cursor-pointer transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <Button
            onClick={() => router.push("/login")}
            type="button"
            className="w-full h-11 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 cursor-pointer transition"
          >
            Back to Login
          </Button>
        </form>
      </div>
    </div>
  );
}