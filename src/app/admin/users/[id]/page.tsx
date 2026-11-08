"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/layout/Sidebar";

type UserProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
  updated_at: string | null;
  email: string;
};

export default function AdminUserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const { data: adminProfile, error: adminError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single();

      if (adminError || adminProfile?.role !== "admin") {
        router.push("/unauthorized");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, bio, avatar_url, role, created_at, updated_at"
        )
        .eq("id", id)
        .single();

      if (profileError || !profile) {
        console.error("User profile error:", profileError);
        setErrorMessage("Unable to load user profile.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        setErrorMessage("Unable to load user email.");
        setLoading(false);
        return;
      }

      const result = await response.json();

      const authUser = result.users?.find(
        (authUser: { id: string }) => authUser.id === id
      );

      const formattedUser: UserProfile = {
        ...profile,
        email: authUser?.email ?? "",
      };

      setUser(formattedUser);
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setBio(profile.bio ?? "");
      setRole(profile.role);

      setLoading(false);
    };

    if (id) {
      fetchUser();
    }
  }, [id, router]);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !user) return;

    setAvatarLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please select a valid image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size cannot exceed 5MB.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/admin/users/${user.id}/avatar`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Unable to update avatar.");
        return;
      }

      setUser((previous) =>
        previous
          ? {
              ...previous,
              avatar_url: result.avatar_url,
            }
          : previous
      );

      setSuccessMessage("Profile picture updated successfully.");
    } catch (error) {
      console.error("Avatar update error:", error);
      setErrorMessage(
        "Something went wrong while updating the profile picture."
      );
    } finally {
      setAvatarLoading(false);
      event.target.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.avatar_url) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this user's profile picture?"
    );

    if (!confirmed) return;

    setAvatarLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(
        `/api/admin/users/${user.id}/avatar`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || "Unable to remove avatar.");
        return;
      }

      setUser((previous) =>
        previous
          ? {
              ...previous,
              avatar_url: null,
            }
          : previous
      );

      setSuccessMessage("Profile picture removed successfully.");
    } catch (error) {
      console.error("Avatar remove error:", error);
      setErrorMessage(
        "Something went wrong while removing the profile picture."
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedName = fullName.trim();

    if (!trimmedName) {
      setErrorMessage("Full name is required.");
      setSaving(false);
      return;
    }

    if (trimmedName.length < 3) {
      setErrorMessage("Full name must be at least 3 characters.");
      setSaving(false);
      return;
    }

    if (trimmedName.length > 50) {
      setErrorMessage("Full name cannot exceed 50 characters.");
      setSaving(false);
      return;
    }

    if (phone.length > 20) {
      setErrorMessage("Phone number cannot exceed 20 characters.");
      setSaving(false);
      return;
    }

    if (bio.length > 250) {
      setErrorMessage("Bio cannot exceed 250 characters.");
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        role,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, full_name, phone, bio, avatar_url, role, created_at, updated_at"
      )
      .single();

    if (error) {
      console.error("Update user error:", error);
      setErrorMessage("Unable to update user profile.");
      setSaving(false);
      return;
    }

    setUser((previous) =>
      previous
        ? {
            ...previous,
            ...data,
            email: previous.email,
          }
        : previous
    );

    setFullName(data.full_name ?? "");
    setPhone(data.phone ?? "");
    setBio(data.bio ?? "");
    setRole(data.role);

    setSuccessMessage("User profile updated successfully.");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        <main className="min-h-screen md:ml-72 px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto animate-pulse">
            <div className="h-10 w-64 bg-gray-200 rounded-2xl mb-6" />
            <div className="h-[650px] bg-white border border-gray-200 rounded-3xl" />
          </div>
        </main>
      </div>
    );
  }

  if (errorMessage && !user) {
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
              User Profile
            </h1>

            <p className="text-red-500 text-sm mb-6">
              {errorMessage}
            </p>

            <Button
              type="button"
              onClick={() => router.push("/admin")}
              className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white py-6 cursor-pointer"
            >
              Go to Admin Dashboard
            </Button>

          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />

      <main className="min-h-screen md:ml-72 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          <div className="mb-6 sm:mb-8">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">
              Administration
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
              User Profile
            </h1>

            <p className="text-gray-500 mt-2">
              View and edit user information.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 shadow-sm">

            <div className="flex flex-col items-center mb-8">

              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name ?? "User"}
                  className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow-sm"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 text-4xl font-bold">
                  {(user.full_name?.charAt(0) ?? "U").toUpperCase()}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">

                <label
                  className={`inline-flex items-center justify-center h-10 px-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium cursor-pointer ${
                    avatarLoading
                      ? "opacity-50 pointer-events-none"
                      : ""
                  }`}
                >
                  {avatarLoading
                    ? "Uploading..."
                    : user.avatar_url
                      ? "Change Picture"
                      : "Upload Picture"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={avatarLoading}
                    className="hidden"
                  />
                </label>

                {user.avatar_url && (
                  <Button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={avatarLoading}
                    className="h-10 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer disabled:opacity-50"
                  >
                    {avatarLoading
                      ? "Processing..."
                      : "Remove Picture"}
                  </Button>
                )}

              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-5">
                {user.full_name || "Unnamed User"}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                {user.email || "No email"}
              </p>

              <div className="mt-3">
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-purple-50 text-purple-700 border border-purple-100"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {user.role}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-red-600 text-sm">
                  {errorMessage}
                </p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
                <p className="text-green-600 text-sm">
                  {successMessage}
                </p>
              </div>
            )}

            <div className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={50}
                  className="h-12 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <Input
                  type="email"
                  value={user.email}
                  readOnly
                  className="h-12 rounded-xl bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                />

                <p className="text-gray-400 text-xs mt-2">
                  Email address cannot be changed from this page.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>

                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                  placeholder="Enter phone number"
                  className="h-12 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bio / About
                  </label>

                  <span className="text-xs text-gray-400">
                    {bio.length}/250
                  </span>
                </div>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={250}
                  rows={5}
                  placeholder="Write something about this user..."
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "user" | "admin")
                  }
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-gray-900 outline-none focus:border-gray-400 cursor-pointer"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Account Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <p className="text-gray-500 text-xs mb-1">
                    Account Created
                  </p>

                  <p className="text-gray-900 text-sm font-medium">
                    {new Date(user.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <p className="text-gray-500 text-xs mb-1">
                    Last Updated
                  </p>

                  <p className="text-gray-900 text-sm font-medium">
                    {user.updated_at
                      ? new Date(user.updated_at).toLocaleString()
                      : "Not updated"}
                  </p>
                </div>

              </div>

              <div className="flex pt-3">

                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || avatarLoading}
                  className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>

              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}