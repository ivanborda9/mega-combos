import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, saveImage } from "@/lib/images";

export async function POST(req: Request) {
  if (!(await verifySessionToken(cookies().get(SESSION_COOKIE_NAME)?.value))) {
    return NextResponse.json({ error: "Tu sesión venció. Volvé a entrar al admin." }, { status: 401 });
  }

  const file = (await req.formData()).get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No llegó ninguna imagen." }, { status: 400 });
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "La imagen tiene que ser JPG, PNG o WebP." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "La imagen es demasiado pesada (máximo 3 MB)." }, { status: 413 });
  }

  const url = await saveImage(Buffer.from(await file.arrayBuffer()), file.type);
  return NextResponse.json({ url });
}
