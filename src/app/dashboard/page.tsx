"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Sidebar from "@/components/layout/Sidebar";

type UserData = {
  id: string;
  email?: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [fullName, setFullName] = useState("User");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        setFullName("User");
        setRole("user");
      } else {
        setFullName(profile.full_name || "User");
        setRole(profile.role);
      }

      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        <main className="min-h-screen md:ml-72 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl animate-pulse">
            <div className="h-4 w-28 bg-gray-200 rounded mb-4" />

            <div className="h-12 w-80 bg-gray-200 rounded-xl" />

            <div className="h-5 w-full max-w-xl bg-gray-200 rounded mt-4" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />

      <main className="min-h-screen md:ml-72 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="flex min-h-[calc(100vh-4rem)] items-center">
            <div className="w-full">

              <div className="max-w-3xl">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-400">
                  {role === "admin"
                    ? "Administration"
                    : "Dashboard"}
                </p>

                <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
                  Welcome back, {fullName}
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
                  {role === "admin"
                    ? "Welcome to your administration workspace. Manage users, profiles, and account settings from the sidebar."
                    : "Welcome to your account workspace. Manage your profile and account settings from the sidebar."}
                </p>

                <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-bold text-white">
                    {role === "admin" ? "A" : "U"}
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Account
                    </p>

                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      {role === "admin"
                        ? "Administrator"
                        : "User Account"}
                    </p>
                  </div>
                </div>

                {user?.email && (
                  <p className="mt-4 text-sm text-gray-400 break-all">
                    {user.email}
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}