import Link from "next/link";
import {
  createFileAssetAction,
  deleteFileAssetAction,
} from "@/lib/actions/files";
import { prisma } from "@/lib/db";

export default async function AdminFilesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [files, cars] = await Promise.all([
    prisma.fileAsset.findMany({
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
      <h1 className="mt-4 text-2xl font-bold">Files</h1>
      {sp.error ? (
        <p className="mt-2 text-sm text-red-600">Check file type and fields.</p>
      ) : null}

      <form
        action={createFileAssetAction}
        className="mt-8 max-w-xl space-y-4 rounded-lg border border-surface bg-white p-6"
      >
        <h2 className="font-semibold">Upload file</h2>
        <label className="block text-sm font-medium">
          Display name
          <input
            name="name"
            required
            className="mt-1 w-full rounded-md border border-surface px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Link to car (optional)
          <select name="carId" className="mt-1 w-full rounded-md border border-surface px-3 py-2">
            <option value="">None</option>
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          File (PDF, TXT, or images)
          <input name="file" type="file" required className="mt-1 w-full text-sm" />
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
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">MIME</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Car</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface">
            {files.map((f) => (
              <tr key={f.id}>
                <td className="px-4 py-3 font-medium">{f.name}</td>
                <td className="px-4 py-3 text-muted">{f.mime}</td>
                <td className="px-4 py-3">{f.size}</td>
                <td className="px-4 py-3 text-muted">{f.car?.title ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteFileAssetAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <button type="submit" className="text-red-600 hover:underline">
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
