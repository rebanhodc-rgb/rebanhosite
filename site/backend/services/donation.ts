import { Prisma } from "@prisma/client";
import { prisma } from "@/backend/db/prisma";
import {
  DEFAULT_DONATION_PARAMS,
  DonationBreakdown,
  DonationParams,
  calculateDonationBreakdown
} from "@/shared/donation";

const SETTINGS_ID = "singleton";

/**
 * Le os parametros de doacao do banco (singleton). Se ainda nao existirem,
 * retorna os valores padrao para que o site funcione sem configuracao previa.
 */
export async function getDonationParams(): Promise<DonationParams> {
  try {
    const settings = await prisma.donationSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (!settings) return DEFAULT_DONATION_PARAMS;

    return {
      unitCost: Number(settings.unitCost),
      taxRate: Number(settings.taxRate),
      feeRate: Number(settings.feeRate),
      fixedFee: Number(settings.fixedFee),
      donationRate: Number(settings.donationRate)
    };
  } catch {
    return DEFAULT_DONATION_PARAMS;
  }
}

/** Persiste novos parametros de doacao (upsert do singleton). */
export async function saveDonationParams(params: DonationParams): Promise<void> {
  const data = {
    unitCost: new Prisma.Decimal(params.unitCost.toFixed(2)),
    taxRate: new Prisma.Decimal(params.taxRate.toFixed(4)),
    feeRate: new Prisma.Decimal(params.feeRate.toFixed(4)),
    fixedFee: new Prisma.Decimal(params.fixedFee.toFixed(2)),
    donationRate: new Prisma.Decimal(params.donationRate.toFixed(4))
  };

  await prisma.donationSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data }
  });
}

/** Calcula o detalhamento da doacao de um pedido usando os parametros salvos. */
export async function calculateOrderDonation(revenue: number, quantity: number): Promise<DonationBreakdown> {
  const params = await getDonationParams();
  return calculateDonationBreakdown(revenue, quantity, params);
}
