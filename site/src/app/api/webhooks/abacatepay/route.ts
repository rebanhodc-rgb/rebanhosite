import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-abacatepay-signature");
    const secret = process.env.ABACATEPAY_WEBHOOK_SECRET;
    const payload = await req.text();

    // TODO: confirmar header/algoritmo exato na documentação oficial do Abacate Pay.
    // Quando tiver o segredo, validar a assinatura antes de processar.
    if (secret && !signature) {
      return NextResponse.json(
        { error: "Webhook sem assinatura." },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload || "{}");

    // Fase 2: persistir pedidos no banco e atualizar status aqui.
    // Exemplos de eventos esperados: billing.paid, charge.paid, pix.paid (confirmar nomes).
    console.log("[abacatepay:webhook]", event);

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro no webhook Abacate Pay.", details: String(error) },
      { status: 500 }
    );
  }
}
