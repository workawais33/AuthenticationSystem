"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">

        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
          <span className="text-3xl font-bold text-red-500">
            !
          </span>
        </div>

        <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">
          Access Denied
        </p>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Unauthorized
        </h1>

        <p className="text-gray-600 text-sm leading-6 mb-7">
          You do not have permission to access this page.
          Please contact an administrator if you believe this is a mistake.
        </p>

        <div className="space-y-3">
          <Button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white py-6 cursor-pointer transition"
          >
            Go to Dashboard
          </Button>

          <Button
            type="button"
            onClick={() => router.push("/profile")}
            className="w-full rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 py-6 cursor-pointer transition"
          >
            View Profile
          </Button>
        </div>

      </div>
    </div>
  );
}