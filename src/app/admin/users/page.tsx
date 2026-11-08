"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  status: "active" | "inactive";
  created_at: string;
  updated_at: string | null;
  email: string;
};

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setErrorMessage("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: adminProfile, error: adminError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (adminError || adminProfile?.role !== "admin") {
        router.push("/unauthorized");
        return;
      }

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, phone, bio, avatar_url, role, status, created_at, updated_at"
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Users fetch error:", error);
        setErrorMessage("Unable to load users.");
        setLoading(false);
        return;
      }

      const userIds = profiles?.map((profile) => profile.id) ?? [];

      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        setErrorMessage("Unable to load user email addresses.");
        setLoading(false);
        return;
      }

      const result = await response.json();

      const emailMap: Record<string, string> = {};

      result.users?.forEach(
        (authUser: { id: string; email?: string }) => {
          if (userIds.includes(authUser.id)) {
            emailMap[authUser.id] = authUser.email ?? "";
          }
        }
      );

      const formattedUsers: UserProfile[] =
        profiles?.map((profile) => ({
          ...profile,
          email: emailMap[profile.id] ?? "",
        })) ?? [];

      setUsers(formattedUsers);
      setLoading(false);
    };

    fetchUsers();
  }, [router]);

  const handleStatusChange = async (
    userId: string,
    currentStatus: "active" | "inactive"
  ) => {
    const newStatus =
      currentStatus === "active" ? "inactive" : "active";

    setUpdatingStatusId(userId);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        toast.error("Your session has expired. Please login again.");
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(
          result.error || "Unable to update user status."
        );
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : user
        )
      );

      toast.success(
        newStatus === "active"
          ? "User activated successfully."
          : "User deactivated successfully."
      );
    } catch (error) {
      console.error("Status update error:", error);

      toast.error(
        "Something went wrong while updating user status."
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto animate-pulse">

          <div className="h-10 w-72 bg-gray-200 rounded-2xl mb-3" />

          <div className="h-5 w-96 max-w-full bg-gray-200 rounded mb-8" />

          <div className="h-20 bg-white border border-gray-200 rounded-3xl mb-6" />

          <div className="h-96 bg-white border border-gray-200 rounded-3xl" />

        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">

          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-2xl font-bold text-red-500">
              !
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Users Management
          </h1>

          <p className="text-red-500 text-sm mb-6">
            {errorMessage}
          </p>

          <Button
            type="button"
            onClick={() => router.push("/admin")}
            className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white py-6 cursor-pointer"
          >
            Back to Admin Dashboard
          </Button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-8">

          <div>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">
              Administration
            </p>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-1">
              Users Management
            </h1>

            <p className="text-gray-500 mt-2">
              View and manage registered users.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => router.push("/admin")}
            className="rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 cursor-pointer"
          >
            Back to Admin
          </Button>

        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-5 mb-6 shadow-sm">

          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Search Users
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Search registered users by name or email.
            </p>
          </div>

          <Input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 rounded-xl bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-400"
          />

        </div>

        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

          <div className="p-5 sm:p-6 border-b border-gray-200">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Registered Users
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  {filteredUsers.length} user
                  {filteredUsers.length !== 1 ? "s" : ""} found
                </p>
              </div>

              {search && (
                <p className="text-sm text-gray-500">
                  Search:{" "}
                  <span className="font-medium text-gray-900">
                    "{search}"
                  </span>
                </p>
              )}

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1150px]">

              <thead className="bg-gray-50 border-b border-gray-200">

                <tr>

                  <th className="text-left px-5 py-4 text-gray-500 text-sm font-semibold">
                    User
                  </th>

                  <th className="text-left px-5 py-4 text-gray-500 text-sm font-semibold">
                    Email
                  </th>

                  <th className="text-left px-5 py-4 text-gray-500 text-sm font-semibold">
                    Phone
                  </th>

                  <th className="text-left px-5 py-4 text-gray-500 text-sm font-semibold">
                    Role
                  </th>

                  <th className="text-left px-5 py-4 text-gray-500 text-sm font-semibold">
                    Status
                  </th>

                  <th className="text-left px-5 py-4 text-gray-500 text-sm font-semibold">
                    Created
                  </th>

                  <th className="text-left px-5 py-4 text-gray-500 text-sm font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredUsers.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name ?? "User"}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-bold">
                            {(
                              user.full_name?.charAt(0) ?? "U"
                            ).toUpperCase()}
                          </div>
                        )}

                        <div>
                          <p className="text-gray-900 font-semibold">
                            {user.full_name || "Unnamed User"}
                          </p>

                          <p className="text-gray-400 text-xs mt-0.5">
                            {user.id}
                          </p>
                        </div>

                      </div>

                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {user.email || "No email"}
                    </td>

                    {/* Phone */}
                    <td className="px-5 py-4 text-gray-600">
                      {user.phone || "—"}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-700 border border-purple-100"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {user.role}
                      </span>

                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === "active"
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}
                      >

                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />

                        {user.status}

                      </span>

                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {new Date(
                        user.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2 whitespace-nowrap">

                        <Button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/users/${user.id}`
                            )
                          }
                          className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white cursor-pointer"
                        >
                          View / Edit
                        </Button>

                        <Button
                          type="button"
                          onClick={() =>
                            handleStatusChange(
                              user.id,
                              user.status
                            )
                          }
                          disabled={
                            updatingStatusId === user.id ||
                            user.role === "admin"
                          }
                          className={`rounded-xl text-white cursor-pointer ${
                            user.status === "active"
                              ? "bg-orange-600 hover:bg-orange-700"
                              : "bg-green-600 hover:bg-green-700"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {updatingStatusId === user.id
                            ? "Updating..."
                            : user.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                        </Button>

                      </div>

                    </td>

                  </tr>

                ))}

                {filteredUsers.length === 0 && (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >

                      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xl text-gray-400">
                          —
                        </span>
                      </div>

                      <p className="text-gray-900 font-semibold">
                        No users found
                      </p>

                      <p className="text-gray-500 text-sm mt-1">
                        Try changing your search.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </div>
  );
}
