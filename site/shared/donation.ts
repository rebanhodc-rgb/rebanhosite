/**
 * Modelo de doacao da REBANHO: 10% do LUCRO LIQUIDO de cada pedido.
 *
 * lucro liquido = receita - custo de producao - impostos - taxas de pagamento
 * doacao        = lucro liquido * donationRate (10%)
 *
 * Os parametros sao editaveis pelo admin; os valores abaixo sao apenas
 * pontos de partida e devem ser ajustados para a realidade do negocio.
 */
export type DonationParams = {
  /** Custo de producao por camiseta (R$). */
  unitCost: number;
  /** Aliquota de impostos sobre a receita (fracao, ex.: 0.06 = 6%). */
  taxRate: number;
  /** Taxa percentual do gateway de pagamento (fracao, ex.: 0.0399). */
  feeRate: number;
  /** Taxa fixa por transacao (R$). */
  fixedFee: number;
  /** Fracao do lucro liquido destinada a doacao (fracao, ex.: 0.10). */
  donationRate: number;
};

export const DEFAULT_DONATION_PARAMS: DonationParams = {
  unitCost: 49,
  taxRate: 0.06,
  feeRate: 0.0399,
  fixedFee: 0.39,
  donationRate: 0.1
};

export type DonationBreakdown = {
  revenue: number;
  cogs: number;
  taxes: number;
  fees: number;
  netProfit: number;
  donation: number;
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calcula a doacao gerada por uma venda a partir da receita e da quantidade
 * de pecas. Retorna o detalhamento completo para exibicao transparente.
 */
export function calculateDonationBreakdown(
  revenue: number,
  quantity: number,
  params: DonationParams = DEFAULT_DONATION_PARAMS
): DonationBreakdown {
  const safeRevenue = Math.max(0, revenue);
  const safeQuantity = Math.max(0, quantity);

  const cogs = round(params.unitCost * safeQuantity);
  const taxes = round(safeRevenue * params.taxRate);
  const fees = safeRevenue > 0 ? round(safeRevenue * params.feeRate + params.fixedFee) : 0;
  const netProfit = round(safeRevenue - cogs - taxes - fees);
  const donation = round(Math.max(0, netProfit) * params.donationRate);

  return { revenue: round(safeRevenue), cogs, taxes, fees, netProfit, donation };
}

/** Atalho que retorna apenas o valor da doacao. */
export function calculateDonation(
  revenue: number,
  quantity: number,
  params: DonationParams = DEFAULT_DONATION_PARAMS
): number {
  return calculateDonationBreakdown(revenue, quantity, params).donation;
}
