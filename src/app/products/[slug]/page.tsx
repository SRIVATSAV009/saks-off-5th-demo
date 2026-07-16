import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { toProductView } from "@/lib/product";
import Money from "@/components/Money";
import ProductCard from "@/components/ProductCard";
import { addToCart, addToWishlist } from "@/app/products/actions";

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ added?: string; wishlisted?: string }>;
}) {
  const { slug } = await params;
  const { added, wishlisted } = await searchParams;

  const product = await db.product.findUnique({ where: { slug } });
  if (!product) notFound();
  const view = toProductView(product);

  const related = await db.product.findMany({
    where: { category: product.category, id: { not: product.id } },
    take: 4,
  });

  return (
    <div className="container-page py-8">
      <nav className="text-sm text-(--color-muted) mb-6">
        <Link href="/" className="link-quiet">Home</Link>
        {" / "}
        <Link href={`/products?department=${product.department}`} className="link-quiet">
          {product.department}
        </Link>
        {" / "}
        <span>{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-3">
          {view.imageList.map((src, i) => (
            <div key={i} className="relative aspect-[7/9] bg-(--color-paper-alt)">
              <Image
                src={src}
                alt={`${product.name} view ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div>
          <p className="eyebrow">{product.brand}</p>
          <h1 className="font-display text-3xl mt-1">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3 text-lg">
            {view.onSale ? (
              <>
                <span className="badge-sale"><Money amount={view.effectivePrice} /></span>
                <span className="line-through text-(--color-muted) text-base">
                  <Money amount={product.price} />
                </span>
                <span className="text-sm text-(--color-sale)">{view.discountPct}% off</span>
              </>
            ) : (
              <span><Money amount={view.effectivePrice} /></span>
            )}
          </div>

          {added === "1" && (
            <p className="toast-success mt-4 px-4 py-2 text-sm">
              Added to your bag. <Link href="/cart" className="underline">View bag</Link>
            </p>
          )}
          {wishlisted === "1" && (
            <p className="toast-success mt-4 px-4 py-2 text-sm">
              Added to your wishlist. <Link href="/wishlist" className="underline">View wishlist</Link>
            </p>
          )}

          <form action={addToCart} className="mt-6 space-y-4">
            <input type="hidden" name="slug" value={product.slug} />
            <input type="hidden" name="productId" value={product.id} />

            <div>
              <label className="field-label" htmlFor="color">Color</label>
              <select id="color" name="color" required className="field-input" defaultValue="">
                <option value="" disabled>Select a color</option>
                {view.colorList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="size">Size</label>
              <select id="size" name="size" required className="field-input" defaultValue="">
                <option value="" disabled>Select a size</option>
                {view.sizeList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="w-24">
              <label className="field-label" htmlFor="quantity">Qty</label>
              <select id="quantity" name="quantity" defaultValue="1" className="field-input">
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary flex-1">
                Add to Bag
              </button>
            </div>
          </form>

          <form action={addToWishlist} className="mt-3">
            <input type="hidden" name="slug" value={product.slug} />
            <input type="hidden" name="productId" value={product.id} />
            <button type="submit" className="btn btn-outline w-full">
              Add to Wishlist
            </button>
          </form>

          <div className="mt-8 border-t border-(--color-line) pt-6">
            <h2 className="eyebrow mb-2">Details</h2>
            <p className="text-sm leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={toProductView(p)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
