"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPassword() {

const router = useRouter();
const [errorMessage, setErrorMessage] = useState("");
const [successMessage, setSuccessMessage] = useState("");
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<ResetPasswordFormData>({
  resolver: zodResolver(resetPasswordSchema),
});

const onSubmit = async (data: ResetPasswordFormData) => {
  setErrorMessage("");
  setSuccessMessage("");
  setLoading(true);

  const { error } = await supabase.auth.updateUser({
    password: data.password,
  });

  if (error) {
    setErrorMessage(error.message);
    setLoading(false);
    return;
  }

  setSuccessMessage("Password updated successfully!");
  setLoading(false);
};

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
  <div className="w-full max-w-md bg-gray-700 rounded-2xl p-6 shadow-xl">
    <h1 className="text-2xl font-bold text-white text-center mb-6">
      Reset Password
    </h1>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {errorMessage && (
        <p className="text-red-400 text-sm text-center">
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p className="text-green-400 text-sm text-center">
          {successMessage}
        </p>
      )}

      <div className="relative">
        <label className="block text-gray-200 mb-2">
          New Password
        </label>

        <Input
          {...register("password")}
          type={showPassword ? "text" : "password"}
          className="rounded-xl bg-gray-900 text-gray-200 border-0 pr-16"
          placeholder="Enter your new password"
        />

        <Button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-10 text-sm text-gray-300 pb-4 bg-transparent hover:bg-transparent"
        >
          {showPassword ? "Hide" : "Show"}
        </Button>

        {errors.password && (
          <p className="text-red-500 text-sm mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="relative">
        <label className="block text-gray-200 mb-2">
          Confirm Password
        </label>

        <Input
          {...register("confirmPassword")}
          type={showConfirmPassword ? "text" : "password"}
          className="rounded-xl bg-gray-900 text-gray-200 border-0 pr-16"
          placeholder="Confirm your new password"
        />

        <Button
          type="button"
          onClick={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          className="absolute right-2 top-10 text-sm text-gray-300 pb-4 bg-transparent hover:bg-transparent"
        >
          {showConfirmPassword ? "Hide" : "Show"}
        </Button>

        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gray-900 hover:bg-gray-800"
      >
        {loading ? "Updating..." : "Update Password"}
      </Button>

      <Button
        onClick={() => router.push("/login")}
        type="button"
        className="w-full rounded-xl bg-gray-900 hover:bg-gray-800"
      >
        Back to Login
      </Button>

    </form>
  </div>
</div>
  );
}