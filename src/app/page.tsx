import Link from "next/link";
import { db } from "@/lib/db";
import { toProductView } from "@/lib/product";
import ProductCard from "@/components/ProductCard";
import ContentSlot from "@/components/ContentSlot";

export default async function HomePage() {
  const featured = await db.product.findMany({
    where: { featured: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  const departments = ["Women", "Men", "Shoes", "Handbags", "Home"];

  return (
    <div>
      <ContentSlot slotId="home-top-banner" />

      <section className="container-page py-14 text-center">
        <p className="eyebrow">Designer Brands, Discounted</p>
        <h1 className="font-display text-4xl md:text-5xl mt-2">
          The Off-Price Edit
        </h1>
        <p className="mt-4 max-w-xl mx-auto text-(--color-muted)">
          A local demo storefront built to showcase SFCC-style storefront and
          Business Manager customization — product pages, cart, checkout,
          promotions, content slots, and more, all running on your machine.
        </p>
        <div className="mt-6">
          <Link href="/products" className="btn btn-primary">
            Shop All
          </Link>
        </div>
      </section>

      <section className="container-page pb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {departments.map((dept) => (
            <Link
              key={dept}
              href={`/products?department=${encodeURIComponent(dept)}`}
              className="card-outline text-center py-6 text-sm uppercase tracking-wide hover:bg-(--color-paper-alt) transition-colors"
            >
              {dept}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-2xl">Featured Markdowns</h2>
          <Link href="/products" className="link-quiet text-sm">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {featured.map((p) => (
            <ProductCard key={p.id} product={toProductView(p)} />
          ))}
        </div>
      </section>
    </div>
  );
}
