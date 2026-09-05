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

// Parse Cloudinary URL to extract cloud name and API key
function parseCloudinaryUrl() {
  const url = process.env.CLOUDINARY_URL;
  if (!url) {
    throw new Error("CLOUDINARY_URL is not set");
  }

  // Format: cloudinary://api_key:api_secret@cloud_name
  const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (!match) {
    throw new Error("Invalid CLOUDINARY_URL format. Expected: cloudinary://api_key:api_secret@cloud_name");
  }

  return {
    apiKey: match[1],
    apiSecret: match[2],
    cloudName: match[3],
  };
}

// Upload to Cloudinary using unsigned preset
async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  const { cloudName } = parseCloudinaryUrl();
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!uploadPreset) {
    throw new Error("CLOUDINARY_UPLOAD_PRESET is not configured. Create an unsigned upload preset in Cloudinary dashboard.");
  }

  // Create FormData with the file
  const formData = new FormData();
  const blob = new Blob([buffer], { type: "image/*" });
  formData.append("file", blob, filename);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "chitralnuts-products");

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary error response:", errorText);
      throw new Error(`Cloudinary upload failed with status ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as { secure_url?: string; error?: { message: string } };

    if (data.error) {
      throw new Error(`Cloudinary error: ${data.error.message}`);
    }

    if (!data.secure_url) {
      throw new Error("No URL returned from Cloudinary. Check your upload preset is set to 'Unsigned'.");
    }

    return data.secure_url;
  } catch (e) {
    console.error("Upload to Cloudinary failed:", e);
    throw e;
  }
}

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

    const baseName = String(form.get("name") ?? "product")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "product";

    const filename = `${baseName}-${randomBytes(4).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log(`Uploading file: ${filename} (${file.size} bytes)`);
    const url = await uploadToCloudinary(buffer, filename);

    console.log(`Successfully uploaded to: ${url}`);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("POST /api/upload error:", e);
    const errorMessage = e instanceof Error ? e.message : "Upload failed.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
