import { prisma } from "@repo/db";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return <CategoriesClient initialCategories={JSON.parse(JSON.stringify(categories))} />;
}
