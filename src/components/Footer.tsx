import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-(--color-line) mt-16 bg-(--color-paper-alt)">
      <div className="container-page py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h3 className="eyebrow mb-3">Shop</h3>
          <ul className="space-y-2">
            <li><Link href="/products?department=Women" className="link-quiet">Women</Link></li>
            <li><Link href="/products?department=Men" className="link-quiet">Men</Link></li>
            <li><Link href="/products?department=Shoes" className="link-quiet">Shoes</Link></li>
            <li><Link href="/products?department=Handbags" className="link-quiet">Handbags</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-3">Account</h3>
          <ul className="space-y-2">
            <li><Link href="/account" className="link-quiet">My Account</Link></li>
            <li><Link href="/account/orders" className="link-quiet">Order History</Link></li>
            <li><Link href="/wishlist" className="link-quiet">Wishlist</Link></li>
            <li><Link href="/cart" className="link-quiet">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-3">This Project</h3>
          <ul className="space-y-2">
            <li><Link href="/admin" className="link-quiet">Business Manager (Admin)</Link></li>
            <li><a href="https://github.com" className="link-quiet">Source (Bitbucket stand-in)</a></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-3">About</h3>
          <p className="text-(--color-muted)">
            A local, self-contained portfolio build demonstrating SFCC-style
            storefront and Business Manager customization. Not affiliated
            with Saks OFF 5TH or Salesforce.
          </p>
        </div>
      </div>
    </footer>
  );
}
