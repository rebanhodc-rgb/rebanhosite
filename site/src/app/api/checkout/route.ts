import { NextRequest, NextResponse } from "next/server";

interface CheckoutItem {
  productId: string;
  name: string;
  priceCents: number;
  qty: number;
  size: string;
  color: string;
}

const ABACATEPAY_ENDPOINT = "https://api.abacatepay.com/v1/billing/create";

export async function POST(req: NextRequest) {
  try {
    const { items } = (await req.json()) as { items?: CheckoutItem[] };

    if (!items?.length) {
      return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
    }

    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "ABACATEPAY_API_KEY ausente. Crie um .env.local com a chave do Abacate Pay para ativar o Pix.",
          mode: "missing_env",
        },
        { status: 501 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    // IMPORTANTE: confirmar campos/endpoints na documentação oficial do Abacate Pay
    // antes de ir para produção. Este payload segue o fluxo documentado em docs/ABACATE_PAY.md.
    const payload = {
      frequency: "ONE_TIME",
      methods: ["PIX"],
      products: items.map((item) => ({
        externalId: `${item.productId}-${item.size}-${item.color}`,
        name: `${item.name} · ${item.color} · ${item.size}`,
        quantity: item.qty,
        price: item.priceCents,
      })),
      returnUrl: `${siteUrl}/checkout`,
      completionUrl: `${siteUrl}/pedido/concluido`,
    };

    const res = await fetch(ABACATEPAY_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(
        { error: "Falha ao criar cobrança Pix no Abacate Pay.", details: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno no checkout.", details: String(error) },
      { status: 500 }
    );
  }
}
