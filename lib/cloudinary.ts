import { v2 as cloudinary } from "cloudinary";

function ensureConfig() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function uploadAvatar(
  fileBuffer: Buffer,
  userId: string
): Promise<string> {
  ensureConfig();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "barberai/avatars",
        public_id: userId,
        overwrite: true,
        transformation: [{ width: 400, height: 400, crop: "fill" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
}
