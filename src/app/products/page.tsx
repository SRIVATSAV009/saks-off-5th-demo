import { db } from "@/lib/db";
import { toProductView, type ProductView } from "@/lib/product";
import ProductCard from "@/components/ProductCard";
import ContentSlot from "@/components/ContentSlot";

type SearchParams = {
  department?: string;
  category?: string;
  color?: string;
  sort?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const department = params.department ?? "";
  const category = params.category ?? "";
  const color = params.color ?? "";
  const sort = params.sort ?? "newest";

  const where = {
    ...(department ? { department } : {}),
    ...(category ? { category } : {}),
  };

  const products = await db.product.findMany({ where, orderBy: { createdAt: "desc" } });
  let views: ProductView[] = products.map(toProductView);

  if (color) {
    views = views.filter((p) => p.colorList.includes(color));
  }

  views = sortProducts(views, sort);

  const categoryOptions = Array.from(
    new Set(
      (
        await db.product.findMany({
          where: department ? { department } : {},
          select: { category: true },
        })
      ).map((p) => p.category)
    )
  ).sort();

  const colorOptions = Array.from(
    new Set(products.flatMap((p) => toProductView(p).colorList))
  ).sort();

  return (
    <div className="container-page py-8">
      <ContentSlot slotId="plp-banner" />

      <div className="flex items-baseline justify-between mt-6 mb-4 flex-wrap gap-3">
        <h1 className="font-display text-3xl">
          {department || "All Products"}
          {category ? ` — ${category}` : ""}
        </h1>
        <p className="text-sm text-(--color-muted)">{views.length} items</p>
      </div>

      <form method="get" className="flex flex-wrap gap-3 mb-8 items-end">
        {department && <input type="hidden" name="department" value={department} />}

        <div>
          <label className="field-label" htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={category} className="field-input">
            <option value="">All Categories</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="color">Color</label>
          <select id="color" name="color" defaultValue={color} className="field-input">
            <option value="">All Colors</option>
            {colorOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label" htmlFor="sort">Sort By</label>
          <select id="sort" name="sort" defaultValue={sort} className="field-input">
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>

        <button type="submit" className="btn btn-outline btn-sm">Apply</button>
        {(category || color || sort !== "newest") && (
          <a
            href={department ? `/products?department=${encodeURIComponent(department)}` : "/products"}
            className="link-quiet text-sm mb-2"
          >
            Clear filters
          </a>
        )}
      </form>

      {views.length === 0 ? (
        <p className="text-(--color-muted)">No products match these filters.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {views.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function sortProducts(views: ProductView[], sort: string): ProductView[] {
  const copy = [...views];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.effectivePrice - b.effectivePrice);
    case "price-desc":
      return copy.sort((a, b) => b.effectivePrice - a.effectivePrice);
    case "discount":
      return copy.sort((a, b) => b.discountPct - a.discountPct);
    default:
      return copy;
  }
}
