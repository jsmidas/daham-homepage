import { prisma } from "@repo/db";
import { TEMPLATE_PREVIEW } from "../../lib/notification";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

const LIMIT = 30;

export default async function NotificationsPage() {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { type: "ALIMTALK" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
      take: LIMIT,
    }),
    prisma.notification.count({ where: { type: "ALIMTALK" } }),
  ]);

  const liveMode = Boolean(
    process.env.SOLAPI_API_KEY &&
      process.env.SOLAPI_API_SECRET &&
      process.env.SOLAPI_PFID,
  );

  const initialData = {
    notifications: JSON.parse(JSON.stringify(notifications)),
    pagination: {
      page: 1,
      limit: LIMIT,
      total,
      totalPages: Math.max(1, Math.ceil(total / LIMIT)),
    },
    mode: (liveMode ? "live" : "mock") as "live" | "mock",
    templates: Object.entries(TEMPLATE_PREVIEW).map(([code, preview]) => ({
      code,
      preview,
    })),
  };

  return <NotificationsClient initialData={initialData} />;
}
