import { prisma } from "@repo/db";
import MenuScheduleClient from "./MenuScheduleClient";

export const dynamic = "force-dynamic";

export default async function MenuSchedulePage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return <MenuScheduleClient initialProducts={JSON.parse(JSON.stringify(products))} />;
}
