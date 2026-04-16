import { prisma } from "@repo/db";
import SubscribeSettingsClient from "./SubscribeSettingsClient";

export const dynamic = "force-dynamic";

export default async function SubscribeSettingsPage() {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of rows) map[s.key] = s.value;
  return <SubscribeSettingsClient initialSettings={map} />;
}
