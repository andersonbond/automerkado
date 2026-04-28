"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/actions/admin-guard";
import { prisma } from "@/lib/db";

const profileSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export async function updateProfileAction(formData: FormData) {
  const session = await assertAdmin();
  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) redirect("/admin/settings?error=profile");

  const emailTaken = await prisma.user.findFirst({
    where: { email: parsed.data.email, NOT: { id: session.user.id } },
  });
  if (emailTaken) redirect("/admin/settings?error=email");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, email: parsed.data.email },
  });

  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=profile");
}

export async function updatePasswordAction(formData: FormData) {
  const session = await assertAdmin();
  const parsed = passwordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
  });
  if (!parsed.success) redirect("/admin/settings?error=password");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/admin/settings?error=password");

  const { compare } = await import("bcryptjs");
  const ok = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) redirect("/admin/settings?error=current");

  const passwordHash = await hash(parsed.data.newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  redirect("/admin/settings?ok=password");
}
