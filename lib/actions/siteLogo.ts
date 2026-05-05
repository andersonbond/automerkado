"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/db";
import { deleteStoredSiteLogoFiles, storeSiteLogo } from "@/lib/upload";

function revalidatePublicSite() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function updateSiteLogoAction(formData: FormData) {
  await assertAdmin();
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/settings?error=logo");
  }
  const pathStr = await storeSiteLogo(file);
  if (!pathStr) redirect("/admin/settings?error=logo");

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", logoPath: pathStr },
    update: { logoPath: pathStr },
  });

  revalidatePublicSite();
  redirect("/admin/settings?ok=logo");
}

export async function clearSiteLogoAction() {
  await assertAdmin();

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", logoPath: null },
    update: { logoPath: null },
  });
  await deleteStoredSiteLogoFiles();

  revalidatePublicSite();
  redirect("/admin/settings?ok=logo-clear");
}
