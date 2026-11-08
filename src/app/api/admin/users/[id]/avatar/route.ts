import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "avatars";
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
];

async function getAdminClient() {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !currentUser) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  const { data: adminProfile, error: adminError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single();

  if (adminError || adminProfile?.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      error: NextResponse.json(
        { error: "Server environment variables are missing." },
        { status: 500 }
      ),
    };
  }

  const supabaseAdmin = createSupabaseClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return {
    supabaseAdmin,
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const adminResult = await getAdminClient();

    if ("error" in adminResult) {
      return adminResult.error;
    }

    const { supabaseAdmin } = adminResult;

    // Get existing profile
    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("avatar_url")
        .eq("id", id)
        .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    // Get uploaded file
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select an image." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only JPG, JPEG, and PNG images are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size - 2MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "Image size cannot exceed 2MB.",
        },
        { status: 400 }
      );
    }

    // Get safe extension
    let extension = "jpg";

    if (file.type === "image/png") {
      extension = "png";
    } else if (file.type === "image/jpeg") {
      extension = "jpg";
    }

    const filePath = `${id}/${Date.now()}.${extension}`;

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload new avatar
    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(filePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Avatar upload error:",
        uploadError
      );

      return NextResponse.json(
        {
          error:
            "Unable to upload profile picture.",
        },
        { status: 500 }
      );
    }

    // Delete old avatar after successful upload
    if (profile.avatar_url) {
      const marker =
        `/storage/v1/object/public/${BUCKET_NAME}/`;

      const markerIndex =
        profile.avatar_url.indexOf(marker);

      if (markerIndex !== -1) {
        const oldPath =
          profile.avatar_url.substring(
            markerIndex + marker.length
          );

        if (oldPath) {
          const {
            error: deleteOldError,
          } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .remove([oldPath]);

          if (deleteOldError) {
            console.error(
              "Old avatar delete error:",
              deleteOldError
            );
          }
        }
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // Update profile
    const {
      data: updatedProfile,
      error: updateError,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        "id, full_name, phone, bio, avatar_url, role, created_at, updated_at"
      )
      .single();

    if (updateError) {
      console.error(
        "Avatar profile update error:",
        updateError
      );

      // Remove uploaded file if database update fails
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      return NextResponse.json(
        {
          error:
            "Unable to update profile picture.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Profile picture updated successfully.",
      avatar_url: publicUrl,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error(
      "Avatar upload API error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const adminResult = await getAdminClient();

    if ("error" in adminResult) {
      return adminResult.error;
    }

    const { supabaseAdmin } = adminResult;

    // Get user's avatar
    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("profiles")
        .select("avatar_url")
        .eq("id", id)
        .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 }
      );
    }

    // Delete avatar from Storage
    if (profile.avatar_url) {
      const marker =
        `/storage/v1/object/public/${BUCKET_NAME}/`;

      const markerIndex =
        profile.avatar_url.indexOf(marker);

      if (markerIndex !== -1) {
        const oldPath =
          profile.avatar_url.substring(
            markerIndex + marker.length
          );

        if (oldPath) {
          const {
            error: deleteError,
          } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .remove([oldPath]);

          if (deleteError) {
            console.error(
              "Avatar delete error:",
              deleteError
            );

            return NextResponse.json(
              {
                error:
                  "Unable to remove profile picture.",
              },
              { status: 500 }
            );
          }
        }
      }
    }

    // Remove avatar URL from database
    const { error: updateError } =
      await supabaseAdmin
        .from("profiles")
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (updateError) {
      console.error(
        "Avatar URL removal error:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Unable to remove profile picture.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message:
        "Profile picture removed successfully.",
      avatar_url: null,
    });
  } catch (error) {
    console.error(
      "Avatar delete API error:",
      error
    );

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}