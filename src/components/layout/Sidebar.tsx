"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [role, setRole] = useState<"user" | "admin" | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Sidebar role error:", error);
        return;
      }

      setRole(profile?.role ?? "user");
    };

    fetchRole();
  }, [router]);

  const handleLogout = async () => {
    setLogoutLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLogoutLoading(false);
      return;
    }

    router.push("/login");
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItemClass = (path: string) =>
    `w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left cursor-pointer transition ${
      isActive(path)
        ? "bg-gray-900 text-white"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    }`;

  return (
    <>
      {sidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-white shadow-sm">
          <div className="flex h-full flex-col">

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-5">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white font-bold">
                  C
                </div>

                <div className="text-left">
                  <p className="font-bold text-gray-900">
                    Call-Me
                  </p>

                  <p className="text-xs text-gray-500">
                    {role === "admin"
                      ? "Administration"
                      : "Account"}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 cursor-pointer transition"
                aria-label="Close sidebar"
              >
                ×
              </button>
            </div>

            <nav className="flex-1 space-y-2 p-4">

<button
  type="button"
  onClick={() => router.push("/")}
  className={navItemClass("/")}
>
  <span className="text-lg">⌂</span>
  Home
</button>

              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className={navItemClass("/dashboard")}
              >
                <span className="text-lg">⌂</span>
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile")}
                className={navItemClass("/profile")}
              >
                <span className="text-lg">◯</span>
                Profile
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile/edit")}
                className={navItemClass("/profile/edit")}
              >
                <span className="text-lg">✎</span>
                Edit Profile
              </button>

              

               

              {role === "admin" && (
                <button
                  type="button"
                  onClick={() => router.push("/admin")}
                  className={navItemClass("/admin")}
                >
                  <span className="text-lg">▦</span>
                  Admin Dashboard
                </button>
              )}

              <Button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                className="w-full flex items-center justify-start gap-3 rounded-xl px-4 py-3 text-left bg-transparent text-red-600 hover:bg-red-50 hover:text-red-600 cursor-pointer transition disabled:opacity-50"
              >
                <span className="text-lg">↪</span>
                {logoutLoading ? "Signing out..." : "Logout"}
              </Button>

            </nav>

            <div className="border-t border-gray-200 p-4">
              <p className="text-xs text-gray-400">
                Account Management
              </p>

              <p className="mt-1 text-sm font-medium text-gray-700">
                Call-Me
              </p>
            </div>

          </div>
        </aside>
      )}

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer transition shadow-sm"
          aria-label="Open sidebar"
        >
          ☰
        </button>
      )}
    </>
  );
}