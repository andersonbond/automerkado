import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCarAction, updateCarAction } from "@/lib/actions/cars";
import { prisma } from "@/lib/db";

export default async function EditCarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const car = await prisma.car.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!car) notFound();

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="p-8">
      <Link href="/admin/cars" className="text-sm text-brand hover:underline">
        ← Back to cars
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit car</h1>
      {sp.error ? (
        <p className="mt-2 text-sm text-red-600">Check slug and required fields.</p>
      ) : null}

      <form action={updateCarAction} className="mt-8 max-w-2xl space-y-4">
        <input type="hidden" name="id" value={car.id} />
        <Field label="Title" name="title" defaultValue={car.title} required />
        <Field label="Slug" name="slug" defaultValue={car.slug} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand" name="brand" defaultValue={car.brand} required />
          <Field label="Model" name="model" defaultValue={car.model} required />
        </div>
        <Field
          label="Year"
          name="year"
          type="number"
          defaultValue={String(car.year)}
          required
        />
        <Field
          label="Price (PHP)"
          name="price"
          type="number"
          defaultValue={String(car.price)}
          required
        />
        <label className="block text-sm font-medium">
          Category
          <select
            name="categoryId"
            required
            defaultValue={car.categoryId}
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
            defaultValue={car.status}
            className="mt-1 w-full rounded-md border border-surface px-3 py-2"
          >
            <option value="LISTED">LISTED</option>
            <option value="SOLD">SOLD</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="biddingManuallyClosed"
            defaultChecked={car.biddingManuallyClosed}
            className="rounded"
          />
          Manually close bidding
        </label>
        <label className="block text-sm font-medium">
          Description
          <textarea
            name="description"
            required
            rows={6}
            defaultValue={car.description}
            className="mt-1 w-full rounded-md border border-surface px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Add images
          <input
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="mt-1 w-full text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground"
          >
            Save changes
          </button>
        </div>
      </form>

      <section className="mt-10 max-w-2xl">
        <h2 className="text-lg font-semibold">Current images</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {car.images.map((im) => (
            <li key={im.id}>{im.path}</li>
          ))}
        </ul>
      </section>

      <form action={deleteCarAction} className="mt-10 max-w-2xl border-t border-surface pt-8">
        <input type="hidden" name="id" value={car.id} />
        <p className="text-sm text-muted">Delete this listing permanently.</p>
        <button
          type="submit"
          className="mt-3 rounded-md border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Delete car
        </button>
      </form>
    </div>
  );
}

function Field(props: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium">
      {props.label}
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        defaultValue={props.defaultValue}
        className="mt-1 w-full rounded-md border border-surface px-3 py-2"
      />
    </label>
  );
}
