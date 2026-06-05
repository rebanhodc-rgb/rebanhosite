import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Admin@123", 10);

  await prisma.user.upsert({
    where: { email: "admin@rebanho.com" },
    update: {},
    create: { name: "Admin REBANHO", email: "admin@rebanho.com", password, role: "ADMIN" }
  });

  const products = [
    {
      id: "camiseta-cordis",
      name: "Camiseta Cordis",
      slug: "camiseta-cordis",
      description: "Algodao premium em preto profundo, detalhe minimalista em dourado envelhecido.",
      symbolicMeaning: "Cordis remete ao coracao como lugar de conversao, memoria e entrega.",
      price: new Prisma.Decimal("149.00"),
      images: ["https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=85"],
      category: "Camisetas"
    },
    {
      id: "camiseta-agnus",
      name: "Camiseta Agnus",
      slug: "camiseta-agnus",
      description: "Malha cru com estampa discreta do cordeiro, feita para um visual leve e contemplativo.",
      symbolicMeaning: "Agnus aponta para mansidao e sacrificio, em uma leitura sutil e elegante.",
      price: new Prisma.Decimal("149.00"),
      images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=85"],
      category: "Camisetas"
    },
    {
      id: "camiseta-fides",
      name: "Camiseta Fides",
      slug: "camiseta-fides",
      description: "Verde profundo, acabamento lavado e simbolo tonal com leitura de brasao.",
      symbolicMeaning: "Fides celebra a fe como movimento silencioso, constancia e coragem.",
      price: new Prisma.Decimal("149.00"),
      images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85"],
      category: "Camisetas"
    },
    {
      id: "camiseta-veritas",
      name: "Camiseta Veritas",
      slug: "camiseta-veritas",
      description: "Preto premium com lettering serifado, cruz discreta e caimento contemporaneo.",
      symbolicMeaning: "Veritas lembra a verdade que liberta sem precisar gritar para ser reconhecida.",
      price: new Prisma.Decimal("149.00"),
      images: ["https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1200&q=85"],
      category: "Camisetas"
    }
  ];

  for (const item of products) {
    const product = await prisma.product.upsert({ where: { slug: item.slug }, update: {}, create: item });
    for (const size of ["P", "M", "G", "GG"]) {
      await prisma.productVariant.upsert({
        where: { id: `${product.id}-${size}` },
        update: {},
        create: { id: `${product.id}-${size}`, productId: product.id, size, color: "Ivory", stock: 20 }
      });
    }
  }

  await prisma.donationSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      unitCost: new Prisma.Decimal("49.00"),
      taxRate: new Prisma.Decimal("0.0600"),
      feeRate: new Prisma.Decimal("0.0399"),
      fixedFee: new Prisma.Decimal("0.39"),
      donationRate: new Prisma.Decimal("0.1000")
    }
  });
}

main()
  .then(() => console.log("Seed concluido."))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
