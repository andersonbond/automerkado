import Link from "next/link";
import { prisma } from "@/lib/db";
import { createCarAction } from "@/lib/actions/cars";

export default async function NewCarPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const sp = await searchParams;

  return (
    <div className="p-8">
      <Link href="/admin/cars" className="text-sm text-brand hover:underline">
        ← Back to cars
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New car</h1>
      {sp.error ? (
        <p className="mt-2 text-sm text-red-600">
          Could not save. Check slug uniqueness and required fields.
        </p>
      ) : null}
      <form action={createCarAction} className="mt-8 max-w-2xl space-y-4">
        <Field label="Title" name="title" required />
        <Field
          label="Slug (URL)"
          name="slug"
          required
          hint="Lowercase letters, numbers, hyphens only."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand" name="brand" required />
          <Field label="Model" name="model" required />
        </div>
        <Field label="Year" name="year" type="number" required />
        <Field label="Price (PHP)" name="price" type="number" required />
        <label className="block text-sm font-medium">
          Category
          <select
            name="categoryId"
            required
            className="mt-1 w-full rounded-md border border-surface px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Status
          <select
            name="status"
            className="mt-1 w-full rounded-md border border-surface px-3 py-2"
          >
            <option value="LISTED">LISTED</option>
            <option value="SOLD">SOLD</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="biddingManuallyClosed" className="rounded" />
          Manually close bidding
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea
            name="description"
            required
            rows={6}
            className="mt-1 w-full rounded-md border border-surface px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Images (optional — uses placeholder if empty)
          <input
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="mt-1 w-full text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground"
        >
          Create car
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-md border border-surface px-3 py-2"
      />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
