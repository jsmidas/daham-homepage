import { prisma } from "@repo/db";
import SubscriptionsClient from "./SubscriptionsClient";

export const dynamic = "force-dynamic";

const LIMIT = 20;

export default async function AdminSubscriptionsPage() {
  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      include: {
        user: true,
        items: { include: { product: true } },
        periods: { orderBy: { year: "desc" }, take: 3 },
      },
      orderBy: { createdAt: "desc" },
      take: LIMIT,
    }),
    prisma.subscription.count(),
  ]);

  const initialData = {
    subscriptions: JSON.parse(JSON.stringify(subscriptions)),
    pagination: {
      page: 1,
      limit: LIMIT,
      total,
      totalPages: Math.max(1, Math.ceil(total / LIMIT)),
    },
  };

  return <SubscriptionsClient initialData={initialData} />;
}
