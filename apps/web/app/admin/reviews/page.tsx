import { prisma } from "@repo/db";
import ReviewsClient from "./ReviewsClient";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ReviewsClient initialReviews={JSON.parse(JSON.stringify(reviews))} />;
}
