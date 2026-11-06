import { Readable } from "node:stream";
import { Prisma, SiteContentKind, UserRole } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fixedSiteContent } from "@/lib/site-content";

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function uploadToCloudinary(file: File, kind: SiteContentKind) {
  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const options = {
      folder: "zirasport",
      resource_type: kind === SiteContentKind.VIDEO ? "video" : "image",
      ...(kind === SiteContentKind.VIDEO ? { chunk_size: 6 * 1024 * 1024 } : {}),
    } as const;
    const handleUpload = (error: unknown, result?: { secure_url: string; public_id: string }) => {
      if (error) reject(error);
      else if (result) resolve({ secure_url: result.secure_url, public_id: result.public_id });
      else reject(new Error("Cloudinary terminó la subida sin devolver el recurso."));
    };
    const uploader = kind === SiteContentKind.VIDEO
      ? cloudinary.uploader.upload_chunked_stream(options, handleUpload)
      : cloudinary.uploader.upload_stream(options, handleUpload);
    Readable.fromWeb(file.stream() as unknown as import("node:stream/web").ReadableStream<Uint8Array>).pipe(uploader);
  });
}

function isValidMediaKey(key: string) {
  if (/^post:[A-Za-z0-9_-]+:(?:paragraph:[1-5]:media|main-image)$/.test(key)) return true;
  const fixed = fixedSiteContent[key as keyof typeof fixedSiteContent];
  if (fixed?.kind === SiteContentKind.IMAGE || fixed?.kind === SiteContentKind.VIDEO) return true;
  const match = key.match(/^(.*\.body)\.media\.[1-5]$/);
  return Boolean(match && fixedSiteContent[match[1] as keyof typeof fixedSiteContent]?.kind === SiteContentKind.TEXT);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (session?.user.role !== UserRole.SUPER_ADMIN) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    const settings = await prisma.siteSettings.findUnique({ where: { id: "global" }, select: { editModeEnabled: true } });
    if (!settings?.editModeEnabled) return NextResponse.json({ error: "Activá el modo de edición." }, { status: 409 });

    const formData = await request.formData();
    const key = String(formData.get("key") ?? "");
    const kind = String(formData.get("kind")) === SiteContentKind.VIDEO ? SiteContentKind.VIDEO : SiteContentKind.IMAGE;
    const file = formData.get("file");
    if (!isValidMediaKey(key)) return NextResponse.json({ error: "El campo multimedia no es válido." }, { status: 400 });
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Seleccioná un archivo." }, { status: 400 });

    const allowed = kind === SiteContentKind.IMAGE
      ? ["image/avif", "image/gif", "image/jpeg", "image/png", "image/webp"]
      : ["video/mp4", "video/ogg", "video/webm"];
    const maxSize = kind === SiteContentKind.IMAGE ? 50 * 1024 * 1024 : 500 * 1024 * 1024;
    if (!allowed.includes(file.type)) return NextResponse.json({ error: "Formato no compatible." }, { status: 415 });
    if (file.size > maxSize) return NextResponse.json({ error: `El archivo no puede superar los ${kind === SiteContentKind.IMAGE ? 50 : 500} MB.` }, { status: 413 });

    const hasCloudinaryConfig = Boolean(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET));
    if (!hasCloudinaryConfig) {
      return NextResponse.json({ error: "Cloudinary no está configurado en las variables de entorno." }, { status: 500 });
    }

    const uploaded = await uploadToCloudinary(file, kind);
    const value = uploaded.secure_url;

    const postMediaMatch = key.match(/^post:([A-Za-z0-9_-]+):(paragraph:([1-5]):media|main-image)$/);
    if (postMediaMatch) {
      const [, postId, target] = postMediaMatch;
      const post = await prisma.post.findUnique({ where: { id: postId }, select: { content: true, category: { select: { slug: true } }, slug: true } });
      if (!post) return NextResponse.json({ error: "La noticia no existe." }, { status: 404 });
      const saved = typeof post.content === "object" && post.content !== null ? post.content as Record<string, unknown> : {};
      let nextContent: Prisma.InputJsonObject;
      let paragraph: number | undefined;
      if (target === "main-image") {
        nextContent = { ...saved, image: value } as unknown as Prisma.InputJsonObject;
      } else {
        const media: Record<string, Prisma.InputJsonValue>[] = Array.from({ length: 5 }, (_, index) => Array.isArray(saved.media) && typeof saved.media[index] === "object" && saved.media[index] !== null ? { ...(saved.media[index] as Record<string, Prisma.InputJsonValue>) } : { url: "", kind: "IMAGE", caption: "" });
        paragraph = Number(postMediaMatch[3]);
        media[paragraph - 1] = { ...media[paragraph - 1], url: value, kind };
        nextContent = { ...saved, media } as unknown as Prisma.InputJsonObject;
      }
      await prisma.post.update({ where: { id: postId }, data: { content: nextContent } });
      await prisma.auditLog.create({ data: { action: "UPLOAD_POST_MEDIA", entity: "Post", entityId: postId, actorId: session.user.id, metadata: { ...(paragraph ? { paragraph } : { mainImage: true }), originalName: file.name, mimeType: file.type, sizeBytes: file.size, storagePath: value, cloudinaryPublicId: uploaded.public_id } } });
      revalidatePath(`/noticia/${post.category.slug}/${post.slug}`);
      revalidatePath(`/${post.category.slug}`);
      revalidatePath("/");
      return NextResponse.json({ value });
    }

    await prisma.siteContent.upsert({
      where: { key },
      create: { key, kind, value },
      update: { kind, value },
    });
    await prisma.auditLog.create({
      data: {
        action: "UPLOAD_SITE_MEDIA",
        entity: "SiteContent",
        entityId: key,
        actorId: session.user.id,
        metadata: { originalName: file.name, mimeType: file.type, sizeBytes: file.size, storagePath: value, cloudinaryPublicId: uploaded.public_id },
      },
    });
    revalidatePath("/");
    revalidatePath("/masculino");
    revalidatePath("/femenino");
    revalidatePath("/f1");
    revalidatePath("/seleccion");
    revalidatePath("/noticia/[section]/[story]", "page");
    return NextResponse.json({ value });
  } catch (error) {
    console.error("Site media upload failed", error);
    const details = error instanceof Error ? error.message : "";
    const safeDetails = details.includes("__TURBOPACK__") ? "Error interno al iniciar la subida." : details.slice(0, 240);
    return NextResponse.json({ error: safeDetails ? `No se pudo subir el archivo: ${safeDetails}` : "No se pudo subir el archivo. Revisá el formato, el tamaño y la configuración de Cloudinary." }, { status: 500 });
  }
}
