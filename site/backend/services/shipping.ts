export type ShippingOption = {
  id: number;
  name: string;
  carrier: string;
  price: number;
  days: number;
  logoUrl: string;
};

type ShippingParams = {
  fromCep: string;
  toCep: string;
  quantity: number;
};

function buildPackage(quantity: number) {
  const weightG = Number(process.env.STORE_WEIGHT_GRAMS ?? 350);
  return {
    height: Number(process.env.STORE_HEIGHT_CM ?? 5),
    width: Number(process.env.STORE_WIDTH_CM ?? 25),
    length: Number(process.env.STORE_LENGTH_CM ?? 35),
    weight: (weightG * quantity) / 1000,
  };
}

export async function calculateShipping(params: ShippingParams): Promise<ShippingOption[]> {
  const baseUrl =
    process.env.MELHOR_ENVIO_SANDBOX === "true"
      ? "https://sandbox.melhorenvio.com.br"
      : "https://melhorenvio.com.br";

  const body = {
    from: { postal_code: params.fromCep.replace(/\D/g, "") },
    to: { postal_code: params.toCep.replace(/\D/g, "") },
    package: buildPackage(params.quantity),
    options: { receipt: false, own_hand: false },
  };

  try {
    const res = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        "User-Agent": "REBANHO/1.0 (andrebomdesouza6@gmail.com)",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) return [];

    const data: Array<{
      id: number;
      name: string;
      company: { name: string; picture: string };
      price: string;
      delivery_time: number;
      error?: string;
    }> = await res.json();

    return data
      .filter((opt) => !opt.error && opt.price)
      .map((opt) => ({
        id: opt.id,
        name: opt.name,
        carrier: opt.company.name,
        price: Number(opt.price),
        days: opt.delivery_time,
        logoUrl: opt.company.picture,
      }))
      .sort((a, b) => a.price - b.price);
  } catch {
    return [];
  }
}
