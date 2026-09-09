import { NextResponse } from "next/server";
import { s3 } from "@/lib/r2";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const key = path.join("/");

    if (!key) {
      return new NextResponse("File tidak ditemukan", { status: 404 });
    }

    const bucketName = process.env.R2_BUCKET_NAME || "titipit";

    const response = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );

    if (!response.Body) {
      return new NextResponse("File kosong", { status: 404 });
    }

    // Convert stream to buffer
    const bytes = await response.Body.transformToByteArray();
    const buffer = Buffer.from(bytes);
    const contentType = response.ContentType || "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${key.split("/").pop()}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    console.error("Error serving file from R2:", error);
    return new NextResponse("File tidak ditemukan atau terjadi kesalahan.", { status: 404 });
  }
}
