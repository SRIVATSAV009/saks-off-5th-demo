import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const db = new PrismaClient({ adapter });

function img(seed: string, w = 700, h = 900) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

const products = [
  {
    slug: "isla-silk-wrap-dress",
    name: "Silk Wrap Midi Dress",
    brand: "Isla Rae",
    department: "Women",
    category: "Dresses",
    description:
      "A fluid silk-blend wrap dress with a self-tie waist and bias-cut skirt that moves with every step. Fully lined.",
    price: 398,
    salePrice: 179,
    images: [img("isla-dress-1"), img("isla-dress-2"), img("isla-dress-3")],
    colors: ["Emerald", "Black", "Ivory"],
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: true,
  },
  {
    slug: "marchetti-leather-tote",
    name: "Marchetti Structured Leather Tote",
    brand: "Marchetti Milano",
    department: "Handbags",
    category: "Totes",
    description:
      "Italian pebbled-leather tote with a structured silhouette, protective feet, and a detachable zip pouch.",
    price: 895,
    salePrice: 349,
    images: [img("tote-1"), img("tote-2"), img("tote-3")],
    colors: ["Cognac", "Black", "Taupe"],
    sizes: ["One Size"],
    featured: true,
  },
  {
    slug: "renna-cashmere-crewneck",
    name: "Cashmere Crewneck Sweater",
    brand: "Renna",
    department: "Women",
    category: "Sweaters",
    description:
      "Two-ply cashmere knit with ribbed trim at the cuffs and hem. A closet staple that layers effortlessly.",
    price: 328,
    salePrice: 129,
    images: [img("sweater-1"), img("sweater-2")],
    colors: ["Camel", "Charcoal", "Blush"],
    sizes: ["XS", "S", "M", "L"],
    featured: false,
  },
  {
    slug: "dario-suede-chelsea-boot",
    name: "Suede Chelsea Boot",
    brand: "Dario Conti",
    department: "Shoes",
    category: "Boots",
    description:
      "Hand-finished suede Chelsea boot on a stacked leather heel with elastic side gussets for an easy fit.",
    price: 495,
    salePrice: 219,
    images: [img("boot-1"), img("boot-2")],
    colors: ["Chestnut", "Black"],
    sizes: ["6", "7", "8", "9", "10", "11"],
    featured: true,
  },
  {
    slug: "carraway-wool-blazer",
    name: "Tailored Wool Blazer",
    brand: "Carraway & Co.",
    department: "Men",
    category: "Blazers",
    description:
      "A modern-fit blazer cut from Italian wool with a half-canvas construction that holds its shape all day.",
    price: 695,
    salePrice: 289,
    images: [img("blazer-1"), img("blazer-2")],
    colors: ["Navy", "Charcoal"],
    sizes: ["38R", "40R", "42R", "44R", "46R"],
    featured: false,
  },
  {
    slug: "hollis-oxford-shirt",
    name: "Slim Oxford Dress Shirt",
    brand: "Hollis Brothers",
    department: "Men",
    category: "Shirts",
    description:
      "Crisp cotton oxford with a spread collar and mother-of-pearl buttons. Wrinkle-resistant finish.",
    price: 128,
    salePrice: 59,
    images: [img("oxford-1"), img("oxford-2")],
    colors: ["White", "Light Blue", "Pink"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    featured: false,
  },
  {
    slug: "vionnet-pleated-skirt",
    name: "Pleated Midi Skirt",
    brand: "Vionnet Studio",
    department: "Women",
    category: "Skirts",
    description:
      "Accordion-pleated midi skirt in a fluid satin-back crepe. Elastic waistband for a comfortable, flattering fit.",
    price: 248,
    salePrice: 99,
    images: [img("skirt-1"), img("skirt-2")],
    colors: ["Champagne", "Black", "Cobalt"],
    sizes: ["XS", "S", "M", "L"],
    featured: false,
  },
  {
    slug: "amara-strap-sandal",
    name: "Crisscross Strap Heeled Sandal",
    brand: "Amara Rossi",
    department: "Shoes",
    category: "Sandals",
    description:
      "Metallic leather sandal with crisscross straps and a padded footbed on a comfortable 75mm heel.",
    price: 350,
    salePrice: 149,
    images: [img("sandal-1"), img("sandal-2")],
    colors: ["Gold", "Silver", "Black"],
    sizes: ["6", "7", "8", "9", "10"],
    featured: true,
  },
  {
    slug: "nordvik-quilted-jacket",
    name: "Quilted Puffer Jacket",
    brand: "Nordvik",
    department: "Men",
    category: "Outerwear",
    description:
      "Lightweight down-fill puffer with a quilted diamond pattern, zip pockets, and a packable hood.",
    price: 425,
    salePrice: 189,
    images: [img("puffer-1"), img("puffer-2")],
    colors: ["Black", "Olive", "Navy"],
    sizes: ["S", "M", "L", "XL"],
    featured: false,
  },
  {
    slug: "linden-linen-throw",
    name: "Washed Linen Throw Blanket",
    brand: "Linden Home",
    department: "Home",
    category: "Bedding & Bath",
    description:
      "Stonewashed pure linen throw with a relaxed drape, mitered corners, and a fringed edge.",
    price: 168,
    salePrice: 79,
    images: [img("throw-1"), img("throw-2")],
    colors: ["Natural", "Sage", "Terracotta"],
    sizes: ["50x60"],
    featured: false,
  },
  {
    slug: "petrov-porcelain-dinnerware",
    name: "12-Piece Porcelain Dinnerware Set",
    brand: "Petrov & Kin",
    department: "Home",
    category: "Tabletop",
    description:
      "Glazed porcelain dinnerware set for four — dinner plates, salad plates, and bowls. Dishwasher and microwave safe.",
    price: 240,
    salePrice: 109,
    images: [img("dinnerware-1"), img("dinnerware-2")],
    colors: ["White", "Slate Blue"],
    sizes: ["Set of 12"],
    featured: false,
  },
  {
    slug: "isla-poplin-blouse",
    name: "Cotton Poplin Tie-Neck Blouse",
    brand: "Isla Rae",
    department: "Women",
    category: "Tops",
    description:
      "Crisp poplin blouse with a tie neck and gathered sleeves. Effortlessly pairs with tailored trousers or denim.",
    price: 158,
    salePrice: 69,
    images: [img("blouse-1"), img("blouse-2")],
    colors: ["White", "Stripe", "Sky"],
    sizes: ["XS", "S", "M", "L", "XL"],
    featured: false,
  },
  {
    slug: "marchetti-card-holder",
    name: "Marchetti Leather Card Holder",
    brand: "Marchetti Milano",
    department: "Handbags",
    category: "Small Leather Goods",
    description:
      "Slim pebbled-leather card holder with four card slots and a central pocket for folded bills.",
    price: 145,
    salePrice: 65,
    images: [img("cardholder-1"), img("cardholder-2")],
    colors: ["Black", "Cognac"],
    sizes: ["One Size"],
    featured: false,
  },
  {
    slug: "dario-leather-sneaker",
    name: "Minimalist Leather Sneaker",
    brand: "Dario Conti",
    department: "Shoes",
    category: "Sneakers",
    description:
      "Clean-lined leather sneaker with a cupsole and perforated toe cap for breathability.",
    price: 275,
    salePrice: 129,
    images: [img("sneaker-1"), img("sneaker-2")],
    colors: ["White", "Black"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    featured: true,
  },
  {
    slug: "carraway-chino-trouser",
    name: "Slim Stretch Chino Trouser",
    brand: "Carraway & Co.",
    department: "Men",
    category: "Pants",
    description:
      "Stretch cotton chino with a slim, tapered leg and a flat front for a clean, tailored line.",
    price: 148,
    salePrice: 62,
    images: [img("chino-1"), img("chino-2")],
    colors: ["Khaki", "Navy", "Olive"],
    sizes: ["30", "32", "34", "36", "38"],
    featured: false,
  },
  {
    slug: "vionnet-satin-slip-dress",
    name: "Bias-Cut Satin Slip Dress",
    brand: "Vionnet Studio",
    department: "Women",
    category: "Dresses",
    description:
      "Liquid satin slip dress cut on the bias for a sculpted, fluid drape. Adjustable straps.",
    price: 298,
    salePrice: 139,
    images: [img("slipdress-1"), img("slipdress-2")],
    colors: ["Champagne", "Black", "Merlot"],
    sizes: ["XS", "S", "M", "L"],
    featured: true,
  },
];

const promotions = [
  {
    code: "WELCOME15",
    name: "New Customer Welcome",
    description: "15% off your first order sitewide.",
    discountType: "percent",
    discountValue: 15,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    enabled: true,
  },
  {
    code: "FREESHIP",
    name: "Free Standard Shipping",
    description: "Waive standard shipping on any order.",
    discountType: "free_shipping",
    discountValue: 0,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31"),
    enabled: true,
  },
  {
    code: "SAVE25",
    name: "Extra $25 Off",
    description: "$25 off orders when you use code SAVE25.",
    discountType: "fixed",
    discountValue: 25,
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-08-31"),
    enabled: true,
  },
  {
    code: "SUMMERSALE",
    name: "Summer Clearance",
    description: "Expired promotion kept for demo of BM enable/disable + date ranges.",
    discountType: "percent",
    discountValue: 30,
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-08-31"),
    enabled: false,
  },
];

const contentAssets = [
  {
    assetId: "home-hero-banner",
    name: "Homepage Hero Banner",
    body: "Up to 70% Off Designer Brands — New Markdowns Added Daily",
    status: "online",
  },
  {
    assetId: "plp-promo-banner",
    name: "PLP Promo Strip",
    body: "Extra 20% Off Clearance — Applied at Checkout, No Code Needed",
    status: "online",
  },
  {
    assetId: "checkout-reassurance",
    name: "Checkout Trust Banner",
    body: "Free Returns Within 30 Days · Secure Checkout · Ships in 1-2 Business Days",
    status: "online",
  },
  {
    assetId: "holiday-banner-archived",
    name: "Holiday Gifting Banner (offline)",
    body: "The Gift Shop Is Open — Free Gift Wrap on All Orders",
    status: "offline",
  },
];

const contentSlots = [
  { slotId: "home-top-banner", page: "Homepage", contentAssetId: "home-hero-banner" },
  { slotId: "plp-banner", page: "Product Listing", contentAssetId: "plp-promo-banner" },
  { slotId: "checkout-banner", page: "Checkout", contentAssetId: "checkout-reassurance" },
];

const jobs = [
  {
    name: "Export Orders to Fulfillment",
    description: "Exports newly placed orders as a feed for the warehouse management system.",
    schedule: "Every 15 minutes",
  },
  {
    name: "Rebuild Product Search Index",
    description: "Reindexes the product catalog for search and PLP faceting after catalog edits.",
    schedule: "Daily @ 2:00 AM",
  },
  {
    name: "Send Abandoned Cart Emails",
    description: "Sends a reminder email to customers who left items in their cart for 24+ hours.",
    schedule: "Daily @ 9:00 AM",
  },
  {
    name: "Expire Outdated Promotions",
    description: "Disables promotions whose end date has passed.",
    schedule: "Daily @ 12:00 AM",
  },
];

async function main() {
  console.log("Seeding database...");

  for (const p of products) {
    await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        department: p.department,
        category: p.category,
        description: p.description,
        price: p.price,
        salePrice: p.salePrice,
        images: JSON.stringify(p.images),
        colors: JSON.stringify(p.colors),
        sizes: JSON.stringify(p.sizes),
        featured: p.featured,
      },
    });
  }

  for (const promo of promotions) {
    await db.promotion.upsert({
      where: { code: promo.code },
      update: {},
      create: promo,
    });
  }

  for (const asset of contentAssets) {
    await db.contentAsset.upsert({
      where: { assetId: asset.assetId },
      update: {},
      create: asset,
    });
  }

  for (const slot of contentSlots) {
    await db.contentSlot.upsert({
      where: { slotId: slot.slotId },
      update: {},
      create: slot,
    });
  }

  for (const job of jobs) {
    await db.job.upsert({
      where: { name: job.name },
      update: {},
      create: job,
    });
  }

  const demoEmail = "jane.doe@example.com";
  const existing = await db.user.findUnique({ where: { email: demoEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await db.user.create({
      data: {
        email: demoEmail,
        passwordHash,
        firstName: "Jane",
        lastName: "Doe",
        cart: { create: {} },
        wishlist: { create: {} },
        addresses: {
          create: [
            {
              label: "Home",
              line1: "425 Fifth Avenue",
              line2: "Apt 12B",
              city: "New York",
              state: "NY",
              zip: "10016",
              country: "US",
              isDefault: true,
            },
          ],
        },
      },
    });
    console.log(`Created demo user: ${demoEmail} / password123 (id ${user.id})`);
  } else {
    console.log(`Demo user ${demoEmail} already exists`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
