import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID || "b456e767d6306149a24d6228c8a65b6d";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const bucketName = process.env.R2_BUCKET_NAME || "titipit";
const publicDomain = process.env.R2_PUBLIC_URL?.replace(/\/$/, "") || "";

export const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadToR2({
  fileBuffer,
  fileName,
  contentType,
  folder = "uploads",
}: {
  fileBuffer: Buffer;
  fileName: string;
  contentType: string;
  folder?: string;
}) {
  // Sanitize filename and create unique path
  const ext = fileName.split(".").pop() || "";
  const random = Math.random().toString(36).substring(2, 9);
  const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${folder}/${Date.now()}-${random}-${cleanName}`;

  if (!accessKeyId || !secretAccessKey) {
    console.warn("R2 Access Key / Secret Key belum diset di .env");
    return {
      success: false,
      error: "R2_ACCESS_KEY_ID dan R2_SECRET_ACCESS_KEY wajib diisi di .env",
    };
  }

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      }),
    );

    // Jika ada domain publik R2 dev, gunakan langsung sebagai URL publik yang cepat
    const url = publicDomain ? `${publicDomain}/${key}` : `/api/files/${key}`;

    return {
      success: true,
      key,
      url,
    };
  } catch (err: any) {
    console.error("Gagal upload ke R2:", err);
    return {
      success: false,
      error: err.message || "Gagal mengunggah file ke Cloudflare R2",
    };
  }
}
