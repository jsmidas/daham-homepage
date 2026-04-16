import { prisma } from "@repo/db";
import DeliveryCalendarClient from "./DeliveryCalendarClient";

export const dynamic = "force-dynamic";

export default async function DeliveryCalendarPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return <DeliveryCalendarClient initialProducts={JSON.parse(JSON.stringify(products))} />;
}
