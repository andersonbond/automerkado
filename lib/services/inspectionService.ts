import { prisma } from "@/lib/db";

export class InspectionError extends Error {
  constructor(
    message: string,
    public code: "NOT_FOUND" | "UNAUTHORIZED",
  ) {
    super(message);
    this.name = "InspectionError";
  }
}

export async function createInspectionRequest(input: {
  carId: string;
  userId: string;
  note?: string;
}) {
  const car = await prisma.car.findFirst({
    where: { id: input.carId, status: "LISTED" },
  });
  if (!car) {
    throw new InspectionError("Car not found", "NOT_FOUND");
  }

  return prisma.inspectionRequest.create({
    data: {
      carId: input.carId,
      userId: input.userId,
      note: input.note?.trim() || null,
      status: "PENDING",
    },
  });
}
