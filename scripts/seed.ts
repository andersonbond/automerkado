import "dotenv/config";

import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.bid.deleteMany();
  await prisma.inspectionRequest.deleteMany();
  await prisma.carInquiry.deleteMany();
  await prisma.carImage.deleteMany();
  await prisma.fileAsset.deleteMany();
  await prisma.car.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  const passwordHash = await hash("ChangeMe123!", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@automerkado.local",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
      lastLoginAt: new Date(),
    },
  });

  const buyer = await prisma.user.create({
    data: {
      email: "buyer@automerkado.local",
      name: "Buyer One",
      passwordHash,
      role: "USER",
      lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.category.createMany({
    data: [
      { slug: "certified", name: "Certified" },
      { slug: "repossessed", name: "Repossessed" },
    ],
  });

  console.log(
    "Seed OK.",
    "0 cars (add inventory from Admin → Cars).",
    "Admin:",
    admin.email,
    "Buyer:",
    buyer.email,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
