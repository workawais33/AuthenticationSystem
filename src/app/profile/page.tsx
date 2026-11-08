"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/layout/Sidebar";

type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        setErrorMessage("Unable to load your profile.");
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        <main className="min-h-screen md:ml-72 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl animate-pulse">
            <div className="h-[620px] rounded-3xl bg-white border border-gray-200" />
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        <main className="min-h-screen md:ml-72 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <span className="text-red-500 text-xl">
                !
              </span>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Profile
            </h1>

            <p className="text-red-500 text-sm mb-6">
              {errorMessage || "Profile not found."}
            </p>

            <Button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full h-11 rounded-xl bg-gray-900 hover:bg-gray-800 text-white cursor-pointer"
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
        <div className="mx-auto max-w-4xl">

          <div className="min-h-[calc(100vh-3rem)] flex items-center">
            <div className="w-full">

              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

                <div className="bg-gray-900 px-5 py-8 sm:px-8 sm:py-10">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || "Profile"}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white/20"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white flex items-center justify-center border-4 border-gray-700">
                        <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                          {profile.full_name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-gray-400 text-sm mb-1">
                        Profile
                      </p>

                      <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">
                        {profile.full_name || "User"}
                      </h1>

                      <p className="text-gray-400 text-sm mt-2 break-all">
                        {email}
                      </p>
                    </div>

                  </div>
                </div>

                <div className="p-5 sm:p-8">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>

                      <div className="min-h-12 flex items-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 px-4 py-3 break-all">
                        {email}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>

                      <div className="min-h-12 flex items-center rounded-xl bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3">
                        {profile.phone || "Not provided"}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio / About
                      </label>

                      <div className="min-h-28 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 whitespace-pre-wrap break-words">
                        {profile.bio || "No bio added yet."}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Created
                      </label>

                      <div className="min-h-12 flex items-center rounded-xl bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 text-sm">
                        {new Date(
                          profile.created_at
                        ).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Updated
                      </label>

                      <div className="min-h-12 flex items-center rounded-xl bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 text-sm">
                        {new Date(
                          profile.updated_at
                        ).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Role
                      </label>

                      <div className="min-h-12 flex items-center rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                        <span className="inline-flex px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-semibold capitalize">
                          {profile.role}
                        </span>
                      </div>
                    </div>

                  </div>

                  <div className="border-t border-gray-200 mt-7 pt-6">
                    <Button
                      type="button"
                      onClick={() => router.push("/profile/edit")}
                      className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white cursor-pointer transition"
                    >
                      Edit Profile
                    </Button>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}