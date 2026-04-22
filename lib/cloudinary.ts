import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: Buffer,
  options: { folder: string; filename?: string }
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        ...(options.filename ? { public_id: options.filename } : {}),
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(file);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  const result = await cloudinary.uploader.destroy(publicId);
  console.log(`[deleteImage] publicId="${publicId}" result="${result.result}"`);
  if (result.result === "not found") {
    throw new Error(`Cloudinary image not found: ${publicId}`);
  }
  if (result.result !== "ok") {
    throw new Error(`Cloudinary delete failed: ${result.result}`);
  }
}

/**
 * Extracts the Cloudinary public_id from a full delivery URL.
 * Handles URLs with and without version segments, and with transformation
 * segments before the version (e.g. q_auto,f_auto/v1234/folder/photo.jpg).
 *
 * Input:  https://res.cloudinary.com/cloud/image/upload/v1234/folder/photo.jpg
 * Output: folder/photo
 */
export function extractPublicId(cloudinaryUrl: string): string {
  const uploadIdx = cloudinaryUrl.indexOf("/upload/");
  if (uploadIdx === -1) throw new Error(`Invalid Cloudinary URL: ${cloudinaryUrl}`);

  const afterUpload = decodeURIComponent(cloudinaryUrl.slice(uploadIdx + 8));
  const segments = afterUpload.split("/");

  // Find the version segment (v followed only by digits, e.g. "v1717000000")
  const vIdx = segments.findIndex((s) => /^v\d+$/.test(s));

  // Real path starts after the version segment; if no version, start at 0
  // then skip any leading transformation segments (they contain underscores or commas)
  let start = vIdx !== -1 ? vIdx + 1 : 0;
  if (vIdx === -1) {
    while (start < segments.length - 1 && /[_,]/.test(segments[start])) {
      start++;
    }
  }

  const publicIdWithExt = segments.slice(start).join("/");
  return publicIdWithExt.replace(/\.[^/.]+$/, "");
}

/**
 * Extracts the folder path from a Cloudinary delivery URL, stripping any
 * transformation segments, the version segment, and the filename.
 * Handles URLs with transformations before the version (e.g. q_auto,f_auto/v1234/...)
 * and URLs with no version segment at all.
 *
 * Input:  https://res.cloudinary.com/cloud/image/upload/v1234/rammies-vacation/My%20Property/photo.jpg
 * Output: rammies-vacation/My Property
 *
 * Input:  https://res.cloudinary.com/cloud/image/upload/q_auto,f_auto/v1234/rammies-vacation/My%20Property/photo.jpg
 * Output: rammies-vacation/My Property
 */
export function extractFolderFromUrl(cloudinaryUrl: string): string {
  const uploadIdx = cloudinaryUrl.indexOf("/upload/");
  if (uploadIdx === -1) throw new Error(`Invalid Cloudinary URL: ${cloudinaryUrl}`);

  const afterUpload = decodeURIComponent(cloudinaryUrl.slice(uploadIdx + 8));
  const segments = afterUpload.split("/");

  // Find the version segment (v followed only by digits, e.g. "v1717000000")
  const vIdx = segments.findIndex((s) => /^v\d+$/.test(s));

  // Real path starts after the version segment; if no version, start at 0
  // then skip any leading transformation segments (they contain underscores or commas)
  let start = vIdx !== -1 ? vIdx + 1 : 0;
  if (vIdx === -1) {
    while (start < segments.length - 1 && /[_,]/.test(segments[start])) {
      start++;
    }
  }

  // Folder = all segments from start except the last one (the filename)
  const folderSegments = segments.slice(start, segments.length - 1);
  if (folderSegments.length === 0) {
    throw new Error(`No folder found in Cloudinary URL: ${cloudinaryUrl}`);
  }
  return folderSegments.join("/");
}
