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

// Using Cloudinary for image hosting (free tier supports ~25,000 images)
async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  
  if (!cloudinaryUrl) {
    throw new Error("CLOUDINARY_URL environment variable is not configured");
  }

  const formData = new FormData();
  const blob = new Blob([buffer], { type: "image/*" });
  formData.append("file", blob, filename);
  formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET || "unnamed");

  const response = await fetch("https://api.cloudinary.com/v1_1/chitralnuts/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }

  const data = await response.json() as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("No URL returned from Cloudinary");
  }

  return data.secure_url;
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

    // Upload to Cloudinary
    const url = await uploadToCloudinary(buffer, filename);

    return NextResponse.json({ url });
  } catch (e) {
    console.error("POST /api/upload", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed." },
      { status: 500 }
    );
  }
}
