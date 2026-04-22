import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage, deleteImage, extractPublicId, extractFolderFromUrl } from "@/lib/cloudinary";
import { z } from "zod";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, name: true, images: true },
  });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  if (property.images.length >= 40) {
    return NextResponse.json(
      { error: "Maximum 40 images per property" },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File must be JPEG, PNG, or WebP" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File must be under 10 MB" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    let folder = `rammies-vacation/${property.name}`;
    if (property.images.length > 0) {
      try {
        folder = extractFolderFromUrl(property.images[0]);
      } catch {
        // Existing images are at the Cloudinary root with no folder — use property name folder
      }
    }
    const { url } = await uploadImage(buffer, { folder });

    const updated = await prisma.property.update({
      where: { id },
      data: { images: { push: url } },
      select: { images: true },
    });

    return NextResponse.json({ url, images: updated.images });
  } catch (err) {
    console.error("[POST /api/admin/properties/[id]/images] Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

const deleteSchema = z.object({ url: z.string().url() });

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid URL is required" }, { status: 400 });
  }

  const { url } = parsed.data;

  if (!url.includes("res.cloudinary.com")) {
    return NextResponse.json(
      { error: "Not a valid Cloudinary URL" },
      { status: 400 }
    );
  }

  const property = await prisma.property.findUnique({
    where: { id },
    select: { id: true, images: true },
  });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  if (!property.images.includes(url)) {
    return NextResponse.json(
      { error: "Image not found in this property" },
      { status: 404 }
    );
  }

  try {
    const publicId = extractPublicId(url);
    await deleteImage(publicId);

    const newImages = property.images.filter((img) => img !== url);
    const updated = await prisma.property.update({
      where: { id },
      data: { images: newImages },
      select: { images: true },
    });

    return NextResponse.json({ success: true, images: updated.images });
  } catch (err) {
    console.error("[DELETE /api/admin/properties/[id]/images] Delete error:", err);
    return NextResponse.json(
      { error: "Delete failed. Please try again." },
      { status: 500 }
    );
  }
}
