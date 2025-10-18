// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadResult = {
  url: string;
  public_id: string;
  format: string;
  bytes: number;
  duration?: number; // for audio/video
  width?: number;    // for images/video
  height?: number;   // for images/video
};

export const uploadToCloudinary = async (
  file: Buffer, 
  originalName: string,
  folder: string = 'chat-app'
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        filename_override: originalName,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
            duration: result.duration,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(file);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  return await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;