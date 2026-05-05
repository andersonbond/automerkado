"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/actions/admin-guard";
import { allocateUniquePostSlug, postSlugFromTitle } from "@/lib/postSlug";
import { prisma } from "@/lib/db";

const SLUG = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const postFields = z.object({
  title: z.string().min(1).max(200),
  slug: SLUG,
  body: z.string().min(1).max(100_000),
  published: z.boolean(),
});

function readPostForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    body: String(formData.get("body") ?? ""),
    published: formData.get("published") === "on",
  };
}

export async function createPostAction(formData: FormData) {
  await assertAdmin();
  const raw = readPostForm(formData);
  const slugBase = raw.slug.length ? raw.slug : postSlugFromTitle(raw.title);

  const parsed = postFields.safeParse({
    title: raw.title.trim(),
    slug: slugBase,
    body: raw.body,
    published: raw.published,
  });
  if (!parsed.success) {
    redirect("/admin/blog/new?error=1");
  }
  const data = parsed.data;

  const finalSlug = await allocateUniquePostSlug(prisma, data.slug);

  const now = new Date();
  await prisma.post.create({
    data: {
      title: data.title,
      slug: finalSlug,
      body: data.body,
      published: data.published,
      publishedAt: data.published ? now : null,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${finalSlug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updatePostAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/blog?error=id");

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) redirect("/admin/blog?error=notfound");

  const raw = readPostForm(formData);
  const slugInput = raw.slug.length ? raw.slug : postSlugFromTitle(raw.title);

  const parsed = postFields.safeParse({
    title: raw.title.trim(),
    slug: slugInput,
    body: raw.body,
    published: raw.published,
  });
  if (!parsed.success) {
    redirect(`/admin/blog/${id}/edit?error=1`);
  }
  const data = parsed.data;

  const owner = await prisma.post.findFirst({
    where: { slug: data.slug, NOT: { id } },
  });
  if (owner) {
    redirect(`/admin/blog/${id}/edit?error=slug`);
  }

  const finalSlug = await allocateUniquePostSlug(prisma, data.slug, id);
  const oldSlug = existing.slug;

  let publishedAt = existing.publishedAt;
  if (data.published && !publishedAt) {
    publishedAt = new Date();
  }

  await prisma.post.update({
    where: { id },
    data: {
      title: data.title,
      slug: finalSlug,
      body: data.body,
      published: data.published,
      publishedAt,
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${oldSlug}`);
  if (finalSlug !== oldSlug) {
    revalidatePath(`/blog/${finalSlug}`);
  }
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deletePostAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const post = await prisma.post.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!post) return;

  await prisma.post.delete({ where: { id } });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}
