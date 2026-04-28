"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/db";
import { storeUploadedImage } from "@/lib/upload";

export async function createStandaloneImageAction(formData: FormData) {
  await assertAdmin();
  const carIdRaw = String(formData.get("carId") ?? "").trim();
  const carId = carIdRaw.length ? carIdRaw : null;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/images?error=file");
  }
  const pathStr = await storeUploadedImage(file);
  if (!pathStr) redirect("/admin/images?error=type");

  const maxOrder =
    (
      await prisma.carImage.aggregate({
        where: carId ? { carId } : { carId: null },
        _max: { sortOrder: true },
      })
    )._max.sortOrder ?? -1;

  await prisma.carImage.create({
    data: {
      carId,
      path: pathStr,
      sortOrder: maxOrder + 1,
    },
  });

  revalidatePath("/admin/images");
  redirect("/admin/images");
}

export async function deleteImageAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.carImage.delete({ where: { id } });
  revalidatePath("/admin/images");
  redirect("/admin/images");
}
