import { NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "briefs";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    // Maksimal 25MB
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file maksimal 25MB." },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await uploadToR2({
      fileBuffer: buffer,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      folder,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      url: result.url,
      key: result.key,
      fileName: file.name,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Gagal mengunggah file." },
      { status: 500 },
    );
  }
}
