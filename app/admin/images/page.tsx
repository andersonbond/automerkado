import Link from "next/link";
import {
  createStandaloneImageAction,
  deleteImageAction,
} from "@/lib/actions/images";
import { prisma } from "@/lib/db";

export default async function AdminImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [images, cars] = await Promise.all([
    prisma.carImage.findMany({
      orderBy: { createdAt: "desc" },
      include: { car: { select: { title: true } } },
    }),
    prisma.car.findMany({ orderBy: { title: "asc" } }),
  ]);
  const sp = await searchParams;

  return (
    <div className="p-8">
      <Link href="/admin" className="text-sm text-brand hover:underline">
        ← Dashboard
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Images</h1>
      {sp.error ? (
        <p className="mt-2 text-sm text-red-600">Upload a valid JPEG, PNG, or WebP.</p>
      ) : null}

      <form action={createStandaloneImageAction} className="mt-8 max-w-xl space-y-4 rounded-lg border border-surface bg-white p-6">
        <h2 className="font-semibold">Upload image</h2>
        <label className="block text-sm font-medium">
          Attach to car (optional)
          <select name="carId" className="mt-1 w-full rounded-md border border-surface px-3 py-2">
            <option value="">Library only</option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          File
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="mt-1 w-full text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
        >
          Upload
        </button>
      </form>

      <div className="mt-10 overflow-x-auto rounded-lg border border-surface bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-surface bg-surface/80 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Path</th>
              <th className="px-4 py-3">Car</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface">
            {images.map((im) => (
              <tr key={im.id}>
                <td className="px-4 py-3 font-mono text-xs">{im.path}</td>
                <td className="px-4 py-3 text-muted">
                  {im.car?.title ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteImageAction}>
                    <input type="hidden" name="id" value={im.id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
