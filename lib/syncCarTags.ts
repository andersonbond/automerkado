import { prisma } from "@/lib/db";
import { parseTagsInput, slugFromTagLabel } from "@/lib/tagSlug";

export async function syncCarTags(carId: string, tagsRaw: string) {
  const labels = parseTagsInput(tagsRaw);

  await prisma.$transaction(async (tx) => {
    const refs: { id: string }[] = [];
    for (const name of labels) {
      const slug = slugFromTagLabel(name);
      const tag = await tx.tag.upsert({
        where: { slug },
        create: { slug, name: name.slice(0, 120) },
        update: { name: name.slice(0, 120) },
      });
      refs.push({ id: tag.id });
    }
    await tx.car.update({
      where: { id: carId },
      data: { tags: { set: refs } },
    });
  });
}
