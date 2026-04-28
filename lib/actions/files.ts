"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/db";
import { storeUploadedFile } from "@/lib/upload";

export async function createFileAssetAction(formData: FormData) {
  await assertAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const carIdRaw = String(formData.get("carId") ?? "").trim();
  const carId = carIdRaw.length ? carIdRaw : null;
  const file = formData.get("file");
  if (!name || !(file instanceof File) || file.size === 0) {
    redirect("/admin/files?error=input");
  }
  const pathStr = await storeUploadedFile(file);
  if (!pathStr) redirect("/admin/files?error=type");

  await prisma.fileAsset.create({
    data: {
      name,
      path: pathStr,
      mime: file.type || "application/octet-stream",
      size: file.size,
      carId,
    },
  });

  revalidatePath("/admin/files");
  redirect("/admin/files");
}

export async function deleteFileAssetAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.fileAsset.delete({ where: { id } });
  revalidatePath("/admin/files");
  redirect("/admin/files");
}
