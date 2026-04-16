import { prisma } from "@repo/db";
import MembersClient from "./MembersClient";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const members = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      permissions: true,
      provider: true,
      createdAt: true,
    },
  });

  return <MembersClient initialMembers={JSON.parse(JSON.stringify(members))} />;
}
