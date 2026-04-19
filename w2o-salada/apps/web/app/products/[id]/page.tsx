import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { parseProductPage } from "../../components/ProductPageView";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 기본 상품 + 상세페이지 데이터를 서버에서 병렬 prefetch
  const [product, page] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: true },
    }),
    prisma.productPage.findUnique({
      where: { productId: id },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const productPage = page && page.isPublished ? parseProductPage(page) : null;

  return (
    <ProductDetailClient
      product={JSON.parse(JSON.stringify(product))}
      productPage={productPage}
    />
  );
}
