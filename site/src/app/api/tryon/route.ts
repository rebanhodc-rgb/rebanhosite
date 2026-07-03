import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userPhoto?: string;
      garmentImage?: string;
      productName?: string;
    };

    if (!body.userPhoto || !body.garmentImage) {
      return NextResponse.json(
        { error: "Envie userPhoto e garmentImage." },
        { status: 400 }
      );
    }

    const provider = process.env.TRYON_PROVIDER ?? "mock";

    // Modo mock: mantém a UI funcionando sem chave externa.
    // Fase 3: trocar por Replicate/FASHN/FAL conforme docs/PROVADOR_VIRTUAL.md.
    if (provider === "mock" || !process.env.REPLICATE_API_TOKEN) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      return NextResponse.json({
        provider: "mock",
        resultImageUrl: body.garmentImage,
        note: "Resultado ilustrativo. Configure TRYON_PROVIDER + token para IA real.",
      });
    }

    return NextResponse.json(
      {
        error:
          "Provider de try-on ainda não implementado. Use docs/PROVADOR_VIRTUAL.md para plugar Replicate/FASHN/FAL.",
        provider,
      },
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno no provador virtual.", details: String(error) },
      { status: 500 }
    );
  }
}
