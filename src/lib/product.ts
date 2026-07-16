import type { Product } from "@/generated/prisma/client";

export type ProductView = Product & {
  imageList: string[];
  colorList: string[];
  sizeList: string[];
  effectivePrice: number;
  onSale: boolean;
  discountPct: number;
};

export function toProductView(product: Product): ProductView {
  const imageList = safeParse<string[]>(product.images, []);
  const colorList = safeParse<string[]>(product.colors, []);
  const sizeList = safeParse<string[]>(product.sizes, []);
  const effectivePrice = product.salePrice ?? product.price;
  const onSale = product.salePrice != null && product.salePrice < product.price;
  const discountPct = onSale
    ? Math.round((1 - (product.salePrice as number) / product.price) * 100)
    : 0;

  return { ...product, imageList, colorList, sizeList, effectivePrice, onSale, discountPct };
}

function safeParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
