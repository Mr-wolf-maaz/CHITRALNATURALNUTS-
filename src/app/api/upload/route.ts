import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 10MB." }, { status: 400 });
    }

    const ext = EXT_BY_MIME[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WebP, AVIF or GIF images are allowed." },
        { status: 400 }
      );
    }

    // Get Cloudinary credentials
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName) {
      console.error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
      return NextResponse.json(
        { error: "Server configuration error: Cloud name not set" },
        { status: 500 }
      );
    }

    if (!uploadPreset) {
      console.error("Missing NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET");
      return NextResponse.json(
        { error: "Server configuration error: Upload preset not set" },
        { status: 500 }
      );
    }

    const baseName = String(form.get("name") ?? "product")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "product";

    const filename = `${baseName}-${randomBytes(4).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create FormData for Cloudinary
    const formData = new FormData();
    const blob = new Blob([buffer], { type: file.type });
    formData.append("file", blob, filename);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "chitralnuts-products");

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    console.log(`Uploading to Cloudinary: ${uploadUrl}`);
    console.log(`File: ${filename} (${file.size} bytes)`);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json() as { 
      secure_url?: string; 
      error?: { message: string };
      public_id?: string;
    };

    if (!response.ok) {
      console.error("Cloudinary error:", responseData);
      return NextResponse.json(
        { 
          error: responseData.error?.message || `Upload failed with status ${response.status}` 
        },
        { status: 500 }
      );
    }

    if (responseData.error) {
      console.error("Cloudinary error response:", responseData.error);
      return NextResponse.json(
        { error: `Cloudinary error: ${responseData.error.message}` },
        { status: 500 }
      );
    }

    if (!responseData.secure_url) {
      console.error("No URL in response:", responseData);
      return NextResponse.json(
        { error: "No URL returned from Cloudinary" },
        { status: 500 }
      );
    }

    console.log(`Successfully uploaded: ${responseData.secure_url}`);
    return NextResponse.json({ url: responseData.secure_url });
  } catch (e) {
    console.error("POST /api/upload error:", e);
    const errorMessage = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
