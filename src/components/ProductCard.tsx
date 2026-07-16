import Link from "next/link";
import Image from "next/image";
import Money from "@/components/Money";
import type { ProductView } from "@/lib/product";

export default function ProductCard({ product }: { product: ProductView }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[7/9] overflow-hidden bg-(--color-paper-alt)">
        <Image
          src={product.imageList[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.onSale && (
          <span className="absolute top-2 left-2 bg-(--color-ink) text-(--color-paper) text-[0.65rem] tracking-wide uppercase px-2 py-1">
            {product.discountPct}% Off
          </span>
        )}
      </div>
      <div className="pt-3 text-sm">
        <p className="eyebrow">{product.brand}</p>
        <p className="mt-0.5 text-(--color-ink)">{product.name}</p>
        <p className="mt-1 flex items-center gap-2">
          {product.onSale ? (
            <>
              <span className="badge-sale"><Money amount={product.effectivePrice} /></span>
              <span className="line-through text-(--color-muted)">
                <Money amount={product.price} />
              </span>
            </>
          ) : (
            <span><Money amount={product.effectivePrice} /></span>
          )}
        </p>
      </div>
    </Link>
  );
}
