"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAdmin } from "@/lib/actions/admin-guard";
import { allocateUniqueCarSlug, slugFromTitle } from "@/lib/carSlug";
import { prisma } from "@/lib/db";
import { REPOSSESSED_CATEGORY_SLUG } from "@/lib/repossessedListing";
import { syncCarTags } from "@/lib/syncCarTags";
import { storeUploadedImage } from "@/lib/upload";

/**
 * Canonical shape for paths produced by `storeUploadedImage`. Used to validate
 * `imagePaths` form values supplied by the new-car form (which pre-uploads
 * images via the dedicated route handler so the picker can show progress + ETA).
 */
const UPLOADED_IMAGE_PATH_RE = /^\/uploads\/images\/[a-f0-9]{32}\.[a-z0-9]+$/i;

async function applyFeaturedImageForCar(carId: string, formData: FormData) {
  const rows = await prisma.carImage.findMany({
    where: { carId },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });
  if (rows.length === 0) return;

  const raw = String(formData.get("featuredImageId") ?? "").trim();
  const valid = new Set(rows.map((r) => r.id));
  const chosen = raw && valid.has(raw) ? raw : rows[0]!.id;

  await prisma.$transaction([
    prisma.carImage.updateMany({ where: { carId }, data: { isFeatured: false } }),
    prisma.carImage.update({
      where: { id: chosen },
      data: { isFeatured: true },
    }),
  ]);
}

const carSchema = z
  .object({
    title: z.string().min(1).max(200),
    slug: z
      .string()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    brand: z.string().min(1).max(80),
    model: z.string().min(1).max(80),
    year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 1),
    price: z.coerce.number().positive(),
    salePrice: z.string(),
    description: z.string().min(1).max(20000),
    categoryId: z.string().min(1),
    status: z.enum(["LISTED", "SOLD", "INACTIVE"]),
  })
  .superRefine((data, ctx) => {
    const t = normalizePriceInput(data.salePrice);
    if (!t) return;
    const n = Number(t);
    if (!Number.isFinite(n) || n <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salePrice"],
        message: "Invalid sale price",
      });
    }
  })
  .transform(({ salePrice: saleRaw, ...rest }) => {
    const t = normalizePriceInput(saleRaw);
    if (!t) {
      return { ...rest, salePrice: null as number | null };
    }
    const n = Number(t);
    return {
      ...rest,
      salePrice: Number.isFinite(n) && n > 0 ? n : null,
    };
  });

function normalizePriceInput(raw: FormDataEntryValue | null): string {
  return String(raw ?? "")
    .replace(/,/g, "")
    .replace(/\s/g, "")
    .trim();
}

function readCarForm(formData: FormData) {
  const biddingManuallyClosed = formData.get("biddingManuallyClosed") === "on";
  return {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    brand: String(formData.get("brand") ?? ""),
    model: String(formData.get("model") ?? ""),
    year: formData.get("year"),
    price: normalizePriceInput(formData.get("price")),
    salePrice: normalizePriceInput(formData.get("salePrice")),
    description: String(formData.get("description") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    status: String(formData.get("status") ?? "LISTED"),
    biddingManuallyClosed,
  };
}

export async function createCarAction(formData: FormData) {
  await assertAdmin();
  const raw = readCarForm(formData);
  const userSlugInput = raw.slug;
  const slugBase = userSlugInput ? userSlugInput : slugFromTitle(raw.title);

  const parsed = carSchema.safeParse({ ...raw, slug: slugBase });
  if (!parsed.success) {
    redirect("/admin/cars/new?error=1");
  }
  const data = parsed.data;

  let finalSlug = data.slug;
  if (userSlugInput) {
    const existing = await prisma.car.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      redirect("/admin/cars/new?error=slug");
    }
  } else {
    finalSlug = await allocateUniqueCarSlug(prisma, slugBase);
  }

  const car = await prisma.car.create({
    data: {
      title: data.title,
      slug: finalSlug,
      brand: data.brand,
      model: data.model,
      year: data.year,
      price: new Prisma.Decimal(data.price),
      salePrice:
        data.salePrice != null ? new Prisma.Decimal(data.salePrice) : null,
      description: data.description,
      categoryId: data.categoryId,
      status: data.status,
      biddingManuallyClosed: raw.biddingManuallyClosed,
    },
  });

  // The new-car form pre-uploads each image to /api/admin/uploads/car-image
  // and submits the resulting paths as hidden inputs, so we can read them
  // straight from the form. We still validate every path against the regex
  // produced by `storeUploadedImage` to prevent a tampered submit from writing
  // arbitrary `CarImage.path` values.
  const paths = formData
    .getAll("imagePaths")
    .map((v) => String(v).trim())
    .filter((p) => UPLOADED_IMAGE_PATH_RE.test(p));

  const featuredPath = String(formData.get("featuredImagePath") ?? "").trim();
  let featuredIdx = paths.indexOf(featuredPath);
  if (featuredIdx < 0) featuredIdx = 0;

  if (paths.length > 0) {
    for (let i = 0; i < paths.length; i++) {
      await prisma.carImage.create({
        data: {
          carId: car.id,
          path: paths[i]!,
          sortOrder: i,
          isFeatured: i === featuredIdx,
        },
      });
    }
  }

  await syncCarTags(car.id, String(formData.get("tags") ?? ""));

  revalidatePath("/");
  revalidatePath("/listings/certified");
  revalidatePath("/listings/repossessed");
  revalidatePath("/listings/all");
  revalidatePath(`/listings/${finalSlug}`);
  revalidatePath("/admin/cars");
  revalidatePath(`/admin/cars/${car.id}/edit`);
  redirect(`/admin/cars/${car.id}/edit?created=1`);
}

export async function updateCarAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/cars?error=id");

  const existing = await prisma.car.findUnique({
    where: { id },
    select: { status: true },
  });
  if (!existing) redirect("/admin/cars?error=id");

  const raw = readCarForm(formData);
  const parsed = carSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/admin/cars/${id}/edit?error=1`);
  }
  const data = parsed.data;

  const slugOwner = await prisma.car.findUnique({ where: { slug: data.slug } });
  if (slugOwner && slugOwner.id !== id) {
    redirect(`/admin/cars/${id}/edit?error=slug`);
  }

  const nextCat = await prisma.category.findUnique({
    where: { id: data.categoryId },
    select: { slug: true },
  });
  if (!nextCat) redirect(`/admin/cars/${id}/edit?error=1`);

  const nextIsRepo = nextCat.slug === REPOSSESSED_CATEGORY_SLUG;
  const becomingListed =
    parsed.data.status === "LISTED" && existing.status !== "LISTED";

  await prisma.car.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      brand: data.brand,
      model: data.model,
      year: data.year,
      price: new Prisma.Decimal(data.price),
      salePrice:
        data.salePrice != null ? new Prisma.Decimal(data.salePrice) : null,
      description: data.description,
      categoryId: data.categoryId,
      status: data.status,
      biddingManuallyClosed: raw.biddingManuallyClosed,
      ...(nextIsRepo && becomingListed ? { repossessedManualRelistAt: new Date() } : {}),
      ...(nextIsRepo && parsed.data.status !== "LISTED"
        ? { repossessedManualRelistAt: null }
        : {}),
      ...(!nextIsRepo ? { repossessedManualRelistAt: null } : {}),
    },
  });

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  let maxOrder =
    (
      await prisma.carImage.aggregate({
        where: { carId: id },
        _max: { sortOrder: true },
      })
    )._max.sortOrder ?? -1;

  for (const file of files) {
    const pathStr = await storeUploadedImage(file);
    if (!pathStr) continue;
    maxOrder += 1;
    await prisma.carImage.create({
      data: { carId: id, path: pathStr, sortOrder: maxOrder, isFeatured: false },
    });
  }

  await applyFeaturedImageForCar(id, formData);

  await syncCarTags(id, String(formData.get("tags") ?? ""));

  revalidatePath("/");
  revalidatePath("/listings/certified");
  revalidatePath("/listings/repossessed");
  revalidatePath("/listings/all");
  revalidatePath(`/listings/${data.slug}`);
  revalidatePath("/admin/cars");
  redirect("/admin/cars");
}

export async function deleteCarAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.car.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/listings/certified");
  revalidatePath("/listings/repossessed");
  revalidatePath("/listings/all");
  revalidatePath("/admin/cars");
  redirect("/admin/cars");
}
