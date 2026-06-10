"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/backend/lib/auth";
import { prisma } from "@/backend/db/prisma";
import { isAdmin } from "@/backend/services/permissions";

export type ActionResult = { ok: boolean; message: string };

async function requireAdmin(): Promise<ActionResult | null> {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as { role?: string } | undefined)?.role)) {
    return { ok: false, message: "Acesso negado." };
  }
  return null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  price: z.coerce.number().min(0.01).max(100000),
  category: z.string().trim().min(2).max(60),
  description: z.string().trim().min(10),
  symbolicMeaning: z.string().trim().min(5),
  imageUrl: z.string().trim().url(),
  sizes: z.string().trim().min(1),
  initialStock: z.coerce.number().int().min(0).max(100000)
});

export async function createProduct(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    category: formData.get("category"),
    description: formData.get("description"),
    symbolicMeaning: formData.get("symbolicMeaning"),
    imageUrl: formData.get("imageUrl"),
    sizes: formData.get("sizes"),
    initialStock: formData.get("initialStock")
  });
  if (!parsed.success) return { ok: false, message: "Dados inválidos. Revise os campos." };

  const { name, price, category, description, symbolicMeaning, imageUrl, sizes, initialStock } = parsed.data;
  const slug = slugify(name);
  const sizeList = Array.from(new Set(sizes.split(",").map((size) => size.trim().toUpperCase()).filter(Boolean)));
  if (sizeList.length === 0) return { ok: false, message: "Informe ao menos um tamanho." };

  try {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) return { ok: false, message: `Já existe um produto com o slug "${slug}".` };

    await prisma.product.create({
      data: {
        id: slug,
        name,
        slug,
        price: new Prisma.Decimal(price.toFixed(2)),
        category,
        description,
        symbolicMeaning,
        images: [imageUrl],
        variants: {
          create: sizeList.map((size) => ({
            id: `${slug}-${size}`,
            size,
            color: "Padrão",
            stock: initialStock
          }))
        }
      }
    });
    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    return { ok: true, message: `Produto "${name}" criado com ${sizeList.length} variação(ões).` };
  } catch {
    return { ok: false, message: "Não foi possível criar o produto. Verifique a conexão com o banco." };
  }
}

const updateProductSchema = z.object({
  productId: z.string().min(1),
  price: z.coerce.number().min(0.01).max(100000)
});

export async function updateProductPrice(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = updateProductSchema.safeParse({
    productId: formData.get("productId"),
    price: formData.get("price")
  });
  if (!parsed.success) return { ok: false, message: "Preço inválido." };

  try {
    await prisma.product.update({
      where: { id: parsed.data.productId },
      data: { price: new Prisma.Decimal(parsed.data.price.toFixed(2)) }
    });
    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    return { ok: true, message: "Preço atualizado." };
  } catch {
    return { ok: false, message: "Não foi possível atualizar o preço." };
  }
}

export async function toggleProductActive(productId: string): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { ok: false, message: "Produto não encontrado." };

    await prisma.product.update({ where: { id: productId }, data: { active: !product.active } });
    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    return { ok: true, message: product.active ? "Produto desativado." : "Produto ativado." };
  } catch {
    return { ok: false, message: "Não foi possível alterar o status do produto." };
  }
}

const stockSchema = z.object({
  variantId: z.string().min(1),
  stock: z.coerce.number().int().min(0).max(100000)
});

export async function updateVariantStock(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = stockSchema.safeParse({
    variantId: formData.get("variantId"),
    stock: formData.get("stock")
  });
  if (!parsed.success) return { ok: false, message: "Estoque inválido." };

  try {
    await prisma.productVariant.update({
      where: { id: parsed.data.variantId },
      data: { stock: parsed.data.stock }
    });
    revalidatePath("/admin/produtos");
    revalidatePath("/loja");
    return { ok: true, message: "Estoque atualizado." };
  } catch {
    return { ok: false, message: "Não foi possível atualizar o estoque." };
  }
}
