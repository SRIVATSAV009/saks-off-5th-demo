import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { addAddress, deleteAddress, setDefaultAddress } from "@/app/account/actions";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-3xl mb-3">Addresses</h1>
        <p className="text-(--color-muted) mb-6">Sign in to manage your addresses.</p>
        <Link href="/login?next=/account/addresses" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  const addresses = await db.address.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });

  return (
    <div className="container-page py-8 max-w-2xl">
      <h1 className="font-display text-3xl mb-8">Addresses</h1>

      <div className="space-y-4 mb-10">
        {addresses.length === 0 ? (
          <p className="text-sm text-(--color-muted)">No saved addresses yet.</p>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="card-outline p-4 flex items-start justify-between gap-4">
              <div className="text-sm">
                <p className="font-medium">
                  {addr.label} {addr.isDefault && <span className="text-(--color-gold)">(Default)</span>}
                </p>
                <p className="text-(--color-muted)">
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                  <br />
                  {addr.city}, {addr.state} {addr.zip}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end shrink-0">
                {!addr.isDefault && (
                  <form action={setDefaultAddress}>
                    <input type="hidden" name="addressId" value={addr.id} />
                    <button type="submit" className="link-quiet text-xs underline">Make Default</button>
                  </form>
                )}
                <form action={deleteAddress}>
                  <input type="hidden" name="addressId" value={addr.id} />
                  <button type="submit" className="link-quiet text-xs underline">Delete</button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>

      <section className="card-outline p-6">
        <h2 className="eyebrow mb-4">Add a New Address</h2>
        <form action={addAddress} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="field-label" htmlFor="label">Label</label>
            <input id="label" name="label" placeholder="Home, Work, etc." className="field-input" />
          </div>
          <div className="col-span-2">
            <label className="field-label" htmlFor="line1">Address Line 1</label>
            <input id="line1" name="line1" required className="field-input" />
          </div>
          <div className="col-span-2">
            <label className="field-label" htmlFor="line2">Address Line 2</label>
            <input id="line2" name="line2" className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="city">City</label>
            <input id="city" name="city" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="state">State</label>
            <input id="state" name="state" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="zip">ZIP Code</label>
            <input id="zip" name="zip" required className="field-input" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="btn btn-primary">Add Address</button>
          </div>
        </form>
      </section>
    </div>
  );
}
