import { unauthorized } from "next/navigation";
import { auth } from "@/auth";

export async function assertAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    unauthorized();
  }
  return session;
}
