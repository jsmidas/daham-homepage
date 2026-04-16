import { prisma } from "@repo/db";
import PricingClient from "./PricingClient";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      orderBy: { sortOrder: "asc" },
      include: { category: true },
    }),
    prisma.setting.findMany(),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const s of settings) settingsMap[s.key] = s.value;

  return (
    <PricingClient
      initialProducts={JSON.parse(JSON.stringify(products))}
      initialSettings={settingsMap}
    />
  );
}
