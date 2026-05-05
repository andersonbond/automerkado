"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/db";
import {
  deleteStoredHeroBackgroundFiles,
  storeHeroBackground,
} from "@/lib/upload";

const focusSchema = z.object({
  heroFocusX: z.coerce.number().int().min(0).max(100),
  heroFocusY: z.coerce.number().int().min(0).max(100),
});

function revalidateHome() {
  revalidatePath("/", "layout");
}

export async function updateHeroBackgroundAction(formData: FormData) {
  await assertAdmin();
  const file = formData.get("heroBackground");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/admin/settings?error=hero");
  }
  const pathStr = await storeHeroBackground(file);
  if (!pathStr) redirect("/admin/settings?error=hero");

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      heroBackgroundPath: pathStr,
    },
    update: {
      heroBackgroundPath: pathStr,
    },
  });

  revalidateHome();
  redirect("/admin/settings?ok=hero");
}

export async function clearHeroBackgroundAction() {
  await assertAdmin();

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", heroBackgroundPath: null },
    update: { heroBackgroundPath: null },
  });
  await deleteStoredHeroBackgroundFiles();

  revalidateHome();
  redirect("/admin/settings?ok=hero-clear");
}

export async function saveHeroFocusAction(formData: FormData) {
  await assertAdmin();
  const parsed = focusSchema.safeParse({
    heroFocusX: formData.get("heroFocusX"),
    heroFocusY: formData.get("heroFocusY"),
  });
  if (!parsed.success) redirect("/admin/settings?error=hero-focus");

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      heroFocusX: parsed.data.heroFocusX,
      heroFocusY: parsed.data.heroFocusY,
    },
    update: {
      heroFocusX: parsed.data.heroFocusX,
      heroFocusY: parsed.data.heroFocusY,
    },
  });

  revalidateHome();
  redirect("/admin/settings?ok=hero-focus");
}
