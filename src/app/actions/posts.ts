"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/require-admin";

if (process.env.CLOUDINARY_URL) cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
else cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });

export async function updatePostContent(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  const current = await prisma.post.findUnique({ where: { id }, select: { title: true, excerpt: true, content: true, category: { select: { slug: true } }, slug: true } });
  if (!current) throw new Error("La noticia no existe.");
  const saved = typeof current.content === "object" && current.content !== null ? current.content as Record<string, unknown> : {};
  const title = formData.has("title") ? String(formData.get("title") ?? "").trim() : current.title;
  const excerpt = formData.has("excerpt") ? String(formData.get("excerpt") ?? "").trim() : (current.excerpt ?? "");
  const image = formData.has("image") ? String(formData.get("image") ?? "").trim() : (typeof current.content === "object" && current.content !== null && "image" in current.content && typeof current.content.image === "string" ? current.content.image : "/brand/MINIATURA_F1_ALL_BOYS_20261002_003446_0000.png");
  if (!id || !title) throw new Error("El título es obligatorio.");
  const currentParagraphs = Array.isArray(saved.paragraphs) ? saved.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === "string") : [excerpt || "Texto de prueba de la noticia."];
  const paragraphs = Array.from({ length: 5 }, (_, index) => currentParagraphs[index] ?? "");
  const paragraphTitles = Array.from({ length: 5 }, (_, index) => Array.isArray(saved.paragraphTitles) && typeof saved.paragraphTitles[index] === "string" ? saved.paragraphTitles[index] as string : "");
  const media = Array.from({ length: 5 }, (_, index) => Array.isArray(saved.media) && typeof saved.media[index] === "object" && saved.media[index] !== null ? { ...(saved.media[index] as Record<string, unknown>) } : { url: "", kind: "IMAGE", caption: "" });
  for (let index = 1; index <= 5; index += 1) {
    if (formData.has(`paragraph${index}`)) paragraphs[index - 1] = String(formData.get(`paragraph${index}`) ?? "").trim();
    if (formData.has(`paragraphTitle${index}`)) paragraphTitles[index - 1] = String(formData.get(`paragraphTitle${index}`) ?? "").trim();
    if (formData.has(`mediaUrl${index}`)) media[index - 1].url = String(formData.get(`mediaUrl${index}`) ?? "").trim();
    if (formData.has(`mediaKind${index}`)) media[index - 1].kind = String(formData.get(`mediaKind${index}`)) === "VIDEO" ? "VIDEO" : "IMAGE";
    if (formData.has(`mediaCaption${index}`)) media[index - 1].caption = String(formData.get(`mediaCaption${index}`) ?? "").trim();
  }
  const content: Record<string, unknown> = { ...saved, type: "doc", image: image || "/brand/MINIATURA_F1_ALL_BOYS_20261002_003446_0000.png", paragraphs, paragraphTitles, media };
  if (formData.has("metaDate")) content.metaDate = String(formData.get("metaDate") ?? "").trim();
  if (formData.has("metaAuthor")) content.metaAuthor = String(formData.get("metaAuthor") ?? "").trim();
  if (formData.has("imageCaption")) content.imageCaption = String(formData.get("imageCaption") ?? "").trim();
  await prisma.post.update({ where: { id }, data: { title, excerpt: excerpt || null, content: content as Prisma.InputJsonObject } });
  revalidatePath(`/noticia/${current.category.slug}/${current.slug}`);
  revalidatePath(`/${current.category.slug}`);
  revalidatePath("/admin/posts");
}

function getZirasportCloudinaryAsset(value: string, kind: "IMAGE" | "VIDEO") {
  try {
    const url = new URL(value);
    if (url.hostname !== "res.cloudinary.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[1] !== (kind === "VIDEO" ? "video" : "image") || parts[2] !== "upload") return null;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.CLOUDINARY_URL?.match(/@([^/?]+)/)?.[1];
    if (!cloudName || parts[0] !== cloudName) return null;
    const uploadIndex = parts.indexOf("upload");
    const assetParts = parts.slice(uploadIndex + 1);
    if (assetParts[0]?.startsWith("v") && /^v\d+$/.test(assetParts[0])) assetParts.shift();
    const filename = assetParts.pop();
    if (!filename || assetParts[0] !== "zirasport") return null;
    assetParts.push(filename.replace(/\.[^.]+$/, ""));
    return { publicId: assetParts.join("/"), resourceType: kind === "VIDEO" ? "video" as const : "image" as const };
  } catch {
    return null;
  }
}

export async function deletePostMedia(formData: FormData) {
  const user = await requireSuperAdmin();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" }, select: { editModeEnabled: true } });
  if (!settings?.editModeEnabled) throw new Error("Activá el modo de edición antes de cambiar el contenido.");

  const id = String(formData.get("id") ?? "");
  const target = String(formData.get("target") ?? "");
  const paragraph = Number(formData.get("paragraph"));
  if (!id || (target !== "main-image" && !(target === "paragraph" && Number.isInteger(paragraph) && paragraph >= 1 && paragraph <= 5))) throw new Error("El recurso seleccionado no es válido.");

  const post = await prisma.post.findUnique({ where: { id }, select: { content: true, category: { select: { slug: true } }, slug: true } });
  if (!post) throw new Error("La noticia no existe.");
  const saved = typeof post.content === "object" && post.content !== null ? post.content as Record<string, unknown> : {};
  let oldUrl = "";
  let oldKind: "IMAGE" | "VIDEO" = "IMAGE";
  let content: Record<string, unknown>;
  if (target === "main-image") {
    oldUrl = typeof saved.image === "string" ? saved.image : "";
    content = { ...saved, image: "", imageCaption: "" };
  } else {
    const media: Record<string, unknown>[] = Array.from({ length: 5 }, (_, index) => Array.isArray(saved.media) && typeof saved.media[index] === "object" && saved.media[index] !== null ? { ...(saved.media[index] as Record<string, unknown>) } : { url: "", kind: "IMAGE", caption: "" });
    const current = media[paragraph - 1];
    oldUrl = typeof current.url === "string" ? current.url : "";
    oldKind = current.kind === "VIDEO" ? "VIDEO" : "IMAGE";
    media[paragraph - 1] = { ...current, url: "", caption: "" };
    content = { ...saved, media };
  }

  await prisma.post.update({ where: { id }, data: { content: content as Prisma.InputJsonObject } });
  const asset = getZirasportCloudinaryAsset(oldUrl, oldKind);
  if (asset) {
    try {
      await cloudinary.uploader.destroy(asset.publicId, { resource_type: asset.resourceType, invalidate: true });
    } catch (error) {
      console.error("Could not remove media from Cloudinary", error);
    }
  }
  await prisma.auditLog.create({ data: { action: "DELETE_POST_MEDIA", entity: "Post", entityId: id, actorId: user.id, metadata: { target, ...(target === "paragraph" ? { paragraph } : {}) } } });
  revalidatePath(`/noticia/${post.category.slug}/${post.slug}`);
  revalidatePath(`/${post.category.slug}`);
  revalidatePath("/");
}
