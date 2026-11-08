"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/layout/Sidebar";

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [errors, setErrors] = useState({
    fullName: "",
    phone: "",
    bio: "",
    avatar: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
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

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, bio, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        setErrorMessage("Unable to load your profile.");
        setLoading(false);
        return;
      }

      setFullName(data.full_name ?? "");
      setPhone(data.phone ?? "");
      setBio(data.bio ?? "");
      setAvatarUrl(data.avatar_url ?? "");
      setPreviewUrl(data.avatar_url ?? "");

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      phone: "",
      bio: "",
      avatar: "",
    };

    const trimmedName = fullName.trim();

    if (!fullName) {
      newErrors.fullName = "Full name is required.";
    } else if (fullName !== trimmedName) {
      newErrors.fullName =
        "Full name cannot have leading or trailing spaces.";
    } else if (trimmedName.length < 3) {
      newErrors.fullName =
        "Full name must be at least 3 characters.";
    } else if (trimmedName.length > 50) {
      newErrors.fullName =
        "Full name cannot exceed 50 characters.";
    }

    if (phone.length > 20) {
      newErrors.phone =
        "Phone number cannot exceed 20 characters.";
    } else if (phone && !/^[0-9+\-()\s]+$/.test(phone)) {
      newErrors.phone =
        "Please enter a valid phone number.";
    }

    if (bio.length > 250) {
      newErrors.bio =
        "Bio cannot exceed 250 characters.";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(
      (error) => error
    );
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setErrors((prev) => ({
      ...prev,
      avatar: "",
    }));

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        avatar:
          "Only JPG, JPEG, and PNG images are allowed.",
      }));

      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        avatar: "Image size must be less than 2 MB.",
      }));

      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setAvatarUrl("");
    setPreviewUrl("");

    const fileInput = document.getElementById(
      "avatar"
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSave = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage(
        "Your session has expired. Please login again."
      );
      setSaving(false);
      return;
    }

    let finalAvatarUrl = avatarUrl;

    if (selectedFile) {
      const fileExtension =
        selectedFile.name.split(".").pop();

      const filePath = `${user.id}/avatar-${Date.now()}.${fileExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("avatars")
          .upload(filePath, selectedFile, {
            contentType: selectedFile.type,
          });

      if (uploadError) {
        console.error(
          "Avatar upload error:",
          uploadError
        );

        setErrorMessage(
          "Unable to upload profile picture."
        );

        setSaving(false);
        return;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

      finalAvatarUrl =
        publicUrlData.publicUrl;
    }

    const { error: updateError } =
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone || null,
          bio: bio || null,
          avatar_url: finalAvatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (updateError) {
      console.error(
        "Profile update error:",
        updateError
      );

      setErrorMessage(
        "Unable to update your profile."
      );

      setSaving(false);
      return;
    }

    setSuccessMessage(
      "Profile updated successfully."
    );

    setSaving(false);

    setTimeout(() => {
      router.push("/profile");
    }, 800);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />

        <main className="min-h-screen md:ml-72 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl animate-pulse">
            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="h-28 bg-gray-200" />

              <div className="p-5 sm:p-8 space-y-6">
                <div className="h-28 w-28 bg-gray-200 rounded-full mx-auto" />

                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
                <div className="h-32 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />

      <main className="min-h-screen md:ml-72 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">

          <div className="min-h-[calc(100vh-3rem)] flex items-center">
            <div className="w-full">

              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

                {/* Card Header */}
                <div className="bg-gray-900 px-5 py-7 sm:px-8 sm:py-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Edit Profile
                  </h1>

                  <p className="text-gray-400 text-sm mt-2">
                    Update your personal information and profile picture.
                  </p>
                </div>

                <form
                  onSubmit={handleSave}
                  className="p-5 sm:p-8 space-y-6"
                >

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
                      Profile Picture
                    </label>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
                      <div className="flex flex-col items-center gap-5">

                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Profile Preview"
                            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-28 h-28 rounded-full bg-gray-900 flex items-center justify-center border-4 border-white shadow-md">
                            <span className="text-3xl font-bold text-white">
                              {fullName?.charAt(0).toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                        )}

                        <div className="w-full">
                          <Input
                            id="avatar"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleImageChange}
                            className={`h-12 rounded-xl bg-white text-gray-700 border ${
                              errors.avatar
                                ? "border-red-500"
                                : "border-gray-200"
                            } cursor-pointer`}
                          />

                          <p className="text-gray-500 text-xs mt-2">
                            JPG, JPEG or PNG — Maximum 2 MB
                          </p>

                          {errors.avatar && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.avatar}
                            </p>
                          )}
                        </div>

                        {selectedFile && (
                          <Button
                            type="button"
                            onClick={handleRemoveImage}
                            className="rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 cursor-pointer"
                          >
                            Remove Selected Image
                          </Button>
                        )}

                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>

                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);

                        if (errors.fullName) {
                          setErrors((prev) => ({
                            ...prev,
                            fullName: "",
                          }));
                        }
                      }}
                      placeholder="Enter your full name"
                      className={`h-12 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 border ${
                        errors.fullName
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />

                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>

                    <Input
                      type="tel"
                      value={phone}
                      maxLength={20}
                      onChange={(e) => {
                        setPhone(e.target.value);

                        if (errors.phone) {
                          setErrors((prev) => ({
                            ...prev,
                            phone: "",
                          }));
                        }
                      }}
                      placeholder="Enter your phone number"
                      className={`h-12 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 border ${
                        errors.phone
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />

                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Bio / About
                      </label>

                      <span
                        className={`text-xs ${
                          bio.length > 250
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        {bio.length}/250
                      </span>
                    </div>

                    <textarea
                      value={bio}
                      maxLength={250}
                      onChange={(e) => {
                        setBio(e.target.value);

                        if (errors.bio) {
                          setErrors((prev) => ({
                            ...prev,
                            bio: "",
                          }));
                        }
                      }}
                      placeholder="Tell us something about yourself..."
                      className={`w-full min-h-32 rounded-xl bg-white text-gray-900 px-4 py-3 outline-none resize-none placeholder:text-gray-400 border ${
                        errors.bio
                          ? "border-red-500"
                          : "border-gray-200"
                      }`}
                    />

                    {errors.bio && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:flex-1 h-12 cursor-pointer rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>

                    <Button
                      type="button"
                      disabled={saving}
                      onClick={() => router.push("/profile")}
                      className="w-full sm:flex-1 h-12 cursor-pointer rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-900"
                    >
                      Cancel
                    </Button>
                  </div>

                </form>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}