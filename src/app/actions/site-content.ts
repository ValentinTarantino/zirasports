"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { SiteContentKind } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { fixedSiteContent } from "@/lib/site-content";
import { requireSuperAdmin } from "@/lib/require-admin";

export async function setSiteEditMode(formData: FormData) {
  const user = await requireSuperAdmin();
  const editModeEnabled = String(formData.get("enabled")) === "true";
  await prisma.siteSettings.upsert({
    where: { id: "global" },
    create: { id: "global", editModeEnabled },
    update: { editModeEnabled },
  });
  await prisma.auditLog.create({
    data: { action: editModeEnabled ? "ENABLE_SITE_EDIT_MODE" : "DISABLE_SITE_EDIT_MODE", entity: "SiteSettings", entityId: "global", actorId: user.id },
  });
  revalidatePath("/");
  revalidatePath("/masculino");
  revalidatePath("/femenino");
  revalidatePath("/f1");
  revalidatePath("/seleccion");
}

export async function saveFixedSiteContent(formData: FormData) {
  const user = await requireSuperAdmin();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" }, select: { editModeEnabled: true } });
  if (!settings?.editModeEnabled) throw new Error("Activá el modo de edición antes de cambiar el contenido.");
  const key = String(formData.get("key") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  const definition = getTextDefinition(key);
  if (!definition || value.length > 10_000) throw new Error("El campo de contenido no es válido.");

  await prisma.siteContent.upsert({
    where: { key },
    create: { key, kind: definition.kind, value },
    update: { kind: definition.kind, value },
  });
  await prisma.auditLog.create({
    data: { action: "UPDATE_SITE_CONTENT", entity: "SiteContent", entityId: key, actorId: user.id },
  });
  revalidateSiteContent();
}

function getTextDefinition(key: string) {
  const fixedDefinition = fixedSiteContent[key as keyof typeof fixedSiteContent];
  if (fixedDefinition?.kind === SiteContentKind.TEXT) return fixedDefinition;

  const articleTextKey = key.match(/^(.*\.body)\.(?:heading|paragraph\.[1-5]|subtitle\.[1-5]|meta\.(?:date|author))$/);
  if (articleTextKey && fixedSiteContent[articleTextKey[1] as keyof typeof fixedSiteContent]?.kind === SiteContentKind.TEXT) {
    return { kind: SiteContentKind.TEXT, value: "" };
  }

  if (key.endsWith(".caption")) {
    const mediaKey = key.slice(0, -".caption".length);
    const mediaDefinition = fixedSiteContent[mediaKey as keyof typeof fixedSiteContent];
    const isBodyMediaKey = /\.body\.media\.[1-5]$/.test(mediaKey);
    if (mediaDefinition?.kind === SiteContentKind.IMAGE || mediaDefinition?.kind === SiteContentKind.VIDEO || isBodyMediaKey) {
      return { kind: SiteContentKind.TEXT, value: "" };
    }
  }

  return null;
}

function getMediaDefinition(key: string, kind: SiteContentKind) {
  const fixedDefinition = fixedSiteContent[key as keyof typeof fixedSiteContent];
  if (fixedDefinition?.kind === SiteContentKind.IMAGE || fixedDefinition?.kind === SiteContentKind.VIDEO) return fixedDefinition;

  const bodyMediaKey = key.match(/^(.*\.body)\.media\.[1-5]$/);
  if (bodyMediaKey && fixedSiteContent[bodyMediaKey[1] as keyof typeof fixedSiteContent]?.kind === SiteContentKind.TEXT) {
    return { kind, value: "" };
  }

  throw new Error("El campo multimedia no es válido.");
}

function revalidateSiteContent() {
  revalidatePath("/");
  revalidatePath("/masculino");
  revalidatePath("/femenino");
  revalidatePath("/f1");
  revalidatePath("/seleccion");
  revalidatePath("/noticia/[section]/[story]", "page");
}

export async function saveFixedSiteMedia(formData: FormData) {
  const user = await requireSuperAdmin();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" }, select: { editModeEnabled: true } });
  if (!settings?.editModeEnabled) throw new Error("Activá el modo de edición antes de cambiar el contenido.");

  const key = String(formData.get("key") ?? "");
  const kind = String(formData.get("kind")) === SiteContentKind.VIDEO ? SiteContentKind.VIDEO : SiteContentKind.IMAGE;
  const definition = getMediaDefinition(key, kind);
  const value = String(formData.get("value") ?? "").trim();
  if (value && !/^https?:\/\//i.test(value) && !/^\/uploads\//i.test(value)) throw new Error("La dirección debe comenzar con http://, https:// o /uploads/.");

  await prisma.siteContent.upsert({
    where: { key },
    create: { key, kind: definition.kind, value },
    update: { kind: definition.kind, value },
  });
  await prisma.auditLog.create({
    data: { action: "UPDATE_SITE_MEDIA", entity: "SiteContent", entityId: key, actorId: user.id },
  });
  revalidateSiteContent();
}

export async function uploadFixedSiteMedia(formData: FormData) {
  const user = await requireSuperAdmin();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" }, select: { editModeEnabled: true } });
  if (!settings?.editModeEnabled) throw new Error("Activá el modo de edición antes de cambiar el contenido.");

  const key = String(formData.get("key") ?? "");
  const kind = String(formData.get("kind")) === SiteContentKind.VIDEO ? SiteContentKind.VIDEO : SiteContentKind.IMAGE;
  const definition = getMediaDefinition(key, kind);

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Seleccioná un archivo.");

  const allowedTypes = kind === SiteContentKind.IMAGE
    ? ["image/avif", "image/gif", "image/jpeg", "image/png", "image/webp"]
    : ["video/mp4", "video/ogg", "video/webm"];
  if (!allowedTypes.includes(file.type)) throw new Error(kind === SiteContentKind.IMAGE ? "Formato de imagen no compatible." : "Formato de video no compatible.");
  const maxSize = kind === SiteContentKind.IMAGE ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > maxSize) throw new Error(`El archivo no puede superar los ${kind === SiteContentKind.IMAGE ? 10 : 50} MB.`);

  const extensionByType: Record<string, string> = {
    "image/avif": "avif",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/ogg": "ogv",
    "video/webm": "webm",
  };
  const extension = extensionByType[file.type];
  if (!extension) throw new Error("Formato no compatible.");

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));
  const value = `/uploads/${filename}`;

  await prisma.siteContent.upsert({
    where: { key },
    create: { key, kind: definition.kind, value },
    update: { kind: definition.kind, value },
  });
  await prisma.auditLog.create({
    data: { action: "UPLOAD_SITE_MEDIA", entity: "SiteContent", entityId: key, actorId: user.id },
  });
  revalidateSiteContent();
}

export async function deleteFixedSiteMedia(formData: FormData) {
  const user = await requireSuperAdmin();
  const settings = await prisma.siteSettings.findUnique({ where: { id: "global" }, select: { editModeEnabled: true } });
  if (!settings?.editModeEnabled) throw new Error("Activá el modo de edición antes de cambiar el contenido.");

  const key = String(formData.get("key") ?? "");
  getMediaDefinition(key, SiteContentKind.IMAGE);
  const current = await prisma.siteContent.findUnique({ where: { key }, select: { value: true } });
  if (current?.value.startsWith("/uploads/")) {
    const uploadDirectory = path.resolve(process.cwd(), "public", "uploads");
    const filePath = path.resolve(process.cwd(), "public", current.value.slice(1));
    if (path.dirname(filePath) === uploadDirectory) {
      await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      });
    }
  }

  await prisma.siteContent.deleteMany({ where: { key } });
  await prisma.auditLog.create({
    data: { action: "DELETE_SITE_MEDIA", entity: "SiteContent", entityId: key, actorId: user.id },
  });
  revalidateSiteContent();
}
