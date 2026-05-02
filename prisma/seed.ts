import "dotenv/config";

import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLACEHOLDER_IMAGE = "/car_images/IMG_01.webp";

type SeedCar = {
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  description: string;
  certified: boolean;
  imageAlts?: [string] | [string, string];
};

const CARS: SeedCar[] = [
  {
    slug: "2022-toyota-camry-certified",
    title: "2022 Toyota Camry LE",
    brand: "Toyota",
    model: "Camry",
    year: 2022,
    price: 1_250_000,
    description:
      "Low mileage certified unit with full service history and warranty.",
    certified: true,
    imageAlts: ["Front", "Side"],
  },
  {
    slug: "2021-honda-civic-repo",
    title: "2021 Honda Civic RS",
    brand: "Honda",
    model: "Civic",
    year: 2021,
    price: 920_000,
    description:
      "Repossessed unit, as-is where-is. Inspect before bidding.",
    certified: false,
    imageAlts: ["Exterior"],
  },
  {
    slug: "2023-mitsubishi-xpander-cross-certified",
    title: "2023 Mitsubishi Xpander Cross",
    brand: "Mitsubishi",
    model: "Xpander Cross",
    year: 2023,
    price: 1_180_000,
    description:
      "Seven-seat MPV, certified checklist completed. Popular family unit.",
    certified: true,
    imageAlts: ["Front", "Rear"],
  },
  {
    slug: "2021-ford-ranger-xlt-repo",
    title: "2021 Ford Ranger XLT",
    brand: "Ford",
    model: "Ranger",
    year: 2021,
    price: 1_350_000,
    description:
      "4x4 pickup, diesel. Repossessed; mileage as declared on title.",
    certified: false,
  },
  {
    slug: "2022-nissan-navara-calibrated",
    title: "2022 Nissan Navara VE Calibrated",
    brand: "Nissan",
    model: "Navara",
    year: 2022,
    price: 1_285_000,
    description:
      "Certified pre-owned pickup with documented service intervals.",
    certified: true,
  },
  {
    slug: "2020-mazda-cx5-sport-certified",
    title: "2020 Mazda CX-5 Sport",
    brand: "Mazda",
    model: "CX-5",
    year: 2020,
    price: 1_085_000,
    description:
      "SUV with SkyActiv drivetrain. Certified bumper-to-bumper check.",
    certified: true,
  },
  {
    slug: "2023-isuzu-dmax-ls-repo",
    title: "2023 Isuzu D-Max LS-A",
    brand: "Isuzu",
    model: "D-Max",
    year: 2023,
    price: 1_420_000,
    description: "Nearly new diesel AT. Repo unit; verify accessories with VIN.",
    certified: false,
  },
  {
    slug: "2021-toyota-fortuner-g-certified",
    title: "2021 Toyota Fortuner G",
    brand: "Toyota",
    model: "Fortuner",
    year: 2021,
    price: 1_890_000,
    description:
      "Popular seven-seater SUV, certified emissions and underside inspection.",
    certified: true,
  },
  {
    slug: "2022-honda-crv-s-repo",
    title: "2022 Honda CR-V S",
    brand: "Honda",
    model: "CR-V",
    year: 2022,
    price: 1_650_000,
    description: "Turbo gasoline SUV. Bank repo; cosmetics may need attention.",
    certified: false,
  },
  {
    slug: "2022-suzuki-ertiga-glx-certified",
    title: "2022 Suzuki Ertiga GLX",
    brand: "Suzuki",
    model: "Ertiga",
    year: 2022,
    price: 958_000,
    description:
      "Three-row compact MPV, certified fluids and belts replaced as needed.",
    certified: true,
  },
  {
    slug: "2023-toyota-vios-g-certified",
    title: "2023 Toyota Vios G",
    brand: "Toyota",
    model: "Vios",
    year: 2023,
    price: 848_000,
    description:
      "Fuel-efficient sedan, low kms, dealer-certified inspection report.",
    certified: true,
  },
  {
    slug: "2021-mitsubishi-mirage-gls-repo",
    title: "2021 Mitsubishi Mirage GLS",
    brand: "Mitsubishi",
    model: "Mirage",
    year: 2021,
    price: 528_000,
    description:
      "Hatchback, repossessed. Ideal city runabout; priced for quick disposition.",
    certified: false,
  },
  {
    slug: "2022-ford-territory-titanium-certified",
    title: "2022 Ford Territory Titanium",
    brand: "Ford",
    model: "Territory",
    year: 2022,
    price: 1_520_000,
    description: "Crossover with tech pack. Full certified multipoint inspection.",
    certified: true,
  },
  {
    slug: "2020-nissan-terra-el-repo",
    title: "2020 Nissan Terra EL",
    brand: "Nissan",
    model: "Terra",
    year: 2020,
    price: 1_195_000,
    description: "Body-on-frame SUV, repo status. Verify 4WD operation on test drive.",
    certified: false,
  },
  {
    slug: "2023-mazda3-sport-certified",
    title: "2023 Mazda 3 Sport",
    brand: "Mazda",
    model: "Mazda3",
    year: 2023,
    price: 1_245_000,
    description: "Sport sedan, certified with remaining manufacturer warranty where applicable.",
    certified: true,
  },
  {
    slug: "2022-isuzu-mux-ls-a-repo",
    title: "2022 Isuzu mu-X LS-A",
    brand: "Isuzu",
    model: "mu-X",
    year: 2022,
    price: 1_755_000,
    description: "Seven-seat diesel SUV, repossessed from fleet return.",
    certified: false,
  },
  {
    slug: "2021-toyota-innova-e-certified",
    title: "2021 Toyota Innova E",
    brand: "Toyota",
    model: "Innova",
    year: 2021,
    price: 1_125_000,
    description: "Diesel MPV, certified drivetrain check and full detail.",
    certified: true,
  },
  {
    slug: "2023-honda-city-rs-certified",
    title: "2023 Honda City RS",
    brand: "Honda",
    model: "City",
    year: 2023,
    price: 998_000,
    description: "Subcompact sedan with Honda Sensing on certified units.",
    certified: true,
  },
  {
    slug: "2022-suzuki-jimny-gl-repo",
    title: "2022 Suzuki Jimny GL",
    brand: "Suzuki",
    model: "Jimny",
    year: 2022,
    price: 1_075_000,
    description: "Off-road favorite, repossessed. Check underbody and transfer case.",
    certified: false,
  },
  {
    slug: "2021-mitsubishi-strada-gls-certified",
    title: "2021 Mitsubishi Strada GLS",
    brand: "Mitsubishi",
    model: "Strada",
    year: 2021,
    price: 1_198_000,
    description: "Double-cab pickup, certified load bed and suspension report.",
    certified: true,
  },
];

async function main() {
  await prisma.bid.deleteMany();
  await prisma.inspectionRequest.deleteMany();
  await prisma.carImage.deleteMany();
  await prisma.fileAsset.deleteMany();
  await prisma.car.deleteMany();
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

  const catCert = await prisma.category.create({
    data: { slug: "certified", name: "Certified" },
  });
  const catRepo = await prisma.category.create({
    data: { slug: "repossessed", name: "Repossessed" },
  });

  const createdCars: { id: string }[] = [];

  for (const c of CARS) {
    const alts = c.imageAlts ?? ["Exterior"];
    const secondAlt = alts.length > 1 ? alts[1] : null;
    const car = await prisma.car.create({
      data: {
        slug: c.slug,
        title: c.title,
        brand: c.brand,
        model: c.model,
        year: c.year,
        price: c.price,
        description: c.description,
        categoryId: c.certified ? catCert.id : catRepo.id,
        status: "LISTED",
        images: {
          create: [
            { path: PLACEHOLDER_IMAGE, sortOrder: 0, alt: alts[0] ?? "Exterior" },
            ...(secondAlt
              ? [{ path: PLACEHOLDER_IMAGE, sortOrder: 1, alt: secondAlt }]
              : []),
          ],
        },
      },
    });
    createdCars.push(car);
  }

  await prisma.bid.create({
    data: {
      carId: createdCars[0]!.id,
      userId: buyer.id,
      amount: 1_100_000,
    },
  });

  await prisma.inspectionRequest.create({
    data: {
      carId: createdCars[1]!.id,
      userId: buyer.id,
      note: "Prefer weekend slot",
      status: "PENDING",
    },
  });

  await prisma.post.create({
    data: {
      slug: "welcome-to-automerkado",
      title: "Welcome to Automerkado",
      body: "We list certified and repossessed vehicles with transparent bidding every week.",
      published: true,
      publishedAt: new Date(),
    },
  });

  console.log(
    "Seed OK.",
    CARS.length,
    "cars.",
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
