import type { Metadata } from "next";
import { prisma } from "@repo/db";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return { title: "상품을 찾을 수 없습니다" };
    }

    const title = product.name;
    const description = product.description
      || `${product.name} - ${product.category?.name || "샐러드"} | ${product.price.toLocaleString()}원`;

    return {
      title,
      description,
      openGraph: {
        title: `${title} | W2O SALADA`,
        description,
        ...(product.imageUrl ? { images: [{ url: product.imageUrl, width: 600, height: 600, alt: product.name }] } : {}),
      },
    };
  } catch {
    return { title: "W2O SALADA" };
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
