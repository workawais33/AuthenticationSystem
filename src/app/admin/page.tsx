"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/Sidebar";

type AdminStats = {
  totalUsers: number;
  totalAdmins: number;
};

export default function AdminPage() {
  const router = useRouter();

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAdmins: 0,
  });

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        router.push("/unauthorized");
        return;
      }

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("role");

      if (error) {
        console.error("Admin stats error:", error);
        setErrorMessage("Unable to load admin statistics.");
        setLoading(false);
        return;
      }

      const totalUsers =
        profiles?.filter((profile) => profile.role === "user").length ?? 0;

      const totalAdmins =
        profiles?.filter((profile) => profile.role === "admin").length ?? 0;

      setStats({
        totalUsers,
        totalAdmins,
      });

      setLoading(false);
    };

    fetchAdminData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        <main className="min-h-screen md:ml-72 px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto animate-pulse">
            <div className="h-10 w-72 bg-gray-200 rounded-2xl mb-3" />
            <div className="h-5 w-96 max-w-full bg-gray-200 rounded mb-8" />

            <div className="h-28 bg-white border border-gray-200 rounded-3xl mb-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="h-40 bg-white border border-gray-200 rounded-3xl" />
              <div className="h-40 bg-white border border-gray-200 rounded-3xl" />
              <div className="h-40 bg-white border border-gray-200 rounded-3xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        <main className="min-h-screen md:ml-72 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-2xl font-bold text-red-500">
                !
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Admin Dashboard
            </h1>

            <p className="text-red-500 text-sm mb-6">
              {errorMessage}
            </p>

            <Button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white py-6 cursor-pointer"
            >
              Go to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />

      <main className="min-h-screen md:ml-72 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          <div className="mb-8">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">
              Control Center
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
              Admin Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your platform from one place.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-gray-500 text-sm">
                  Current Access
                </p>

                <h2 className="text-2xl font-bold text-gray-900 mt-1">
                  Administrator
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-2 w-fit">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />

                <span className="text-green-700 text-sm font-medium">
                  Admin Access Active
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">
                Total Users
              </p>

              <h2 className="text-4xl font-bold text-gray-900 mt-3">
                {stats.totalUsers}
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Registered user accounts
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">
                Total Admins
              </p>

              <h2 className="text-4xl font-bold text-gray-900 mt-3">
                {stats.totalAdmins}
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Accounts with admin access
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">
                Platform Status
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-3">
                ACTIVE
              </h2>

              <p className="text-gray-500 text-sm mt-2">
                Everything is running normally
              </p>
            </div>

          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Quick Actions
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Access the main administrative feature.
              </p>
            </div>

            <Button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="w-full h-auto py-5 px-5 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white cursor-pointer text-left justify-start"
            >
              <div>
                <p className="font-semibold text-lg">
                  Users Management
                </p>

                <p className="text-gray-400 text-sm mt-1">
                  View and manage registered users
                </p>
              </div>
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}