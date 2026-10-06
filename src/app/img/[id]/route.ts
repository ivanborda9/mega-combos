import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const image = await prisma.storedImage.findUnique({ where: { id: params.id } });
  if (!image) return new Response("No encontrada", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mimeType,
      // Cada imagen tiene una URL única y nunca cambia: se puede guardar en caché para siempre
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
