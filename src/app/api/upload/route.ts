import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "UNSUPPORTED_FILE_TYPE" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".png";
    const fileName = `${randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error("UPLOAD_ERROR", error);
    return NextResponse.json({ error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
