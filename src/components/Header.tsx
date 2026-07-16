import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";

const DEPARTMENTS = ["Women", "Men", "Shoes", "Handbags", "Home"];

export default async function Header() {
  const user = await getCurrentUser();

  let cartCount = 0;
  let wishlistCount = 0;
  if (user) {
    const [cart, wishlist] = await Promise.all([
      db.cart.findUnique({ where: { userId: user.id }, include: { items: true } }),
      db.wishlist.findUnique({ where: { userId: user.id }, include: { items: true } }),
    ]);
    cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    wishlistCount = wishlist?.items.length ?? 0;
  }

  return (
    <header className="border-b border-(--color-line) bg-(--color-paper) sticky top-0 z-40">
      <div className="container-page flex items-center justify-between gap-6 py-4">
        <Link href="/" className="font-display text-xl md:text-2xl tracking-wide">
          SAKS <span className="text-(--color-gold)">OFF 5TH</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {DEPARTMENTS.map((dept) => (
            <Link
              key={dept}
              href={`/products?department=${encodeURIComponent(dept)}`}
              className="link-quiet"
            >
              {dept}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-sm">
          <Link href={user ? "/account" : "/login"} className="link-quiet">
            {user ? `Hi, ${user.firstName}` : "Sign In"}
          </Link>
          <Link href="/wishlist" className="link-quiet">
            Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </Link>
          <Link href="/cart" className="link-quiet">
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>
        </div>
      </div>
      <nav className="md:hidden flex gap-4 overflow-x-auto container-page pb-3 text-sm">
        {DEPARTMENTS.map((dept) => (
          <Link
            key={dept}
            href={`/products?department=${encodeURIComponent(dept)}`}
            className="link-quiet whitespace-nowrap"
          >
            {dept}
          </Link>
        ))}
      </nav>
    </header>
  );
}
