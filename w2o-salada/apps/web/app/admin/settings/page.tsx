import { prisma } from "@repo/db";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const rows = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  for (const s of rows) map[s.key] = s.value;
  return <SettingsClient initialSettings={map} />;
}
