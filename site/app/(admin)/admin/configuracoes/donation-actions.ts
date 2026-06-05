"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/backend/lib/auth";
import { isAdmin } from "@/backend/services/permissions";
import { saveDonationParams } from "@/backend/services/donation";

const settingsSchema = z.object({
  unitCost: z.coerce.number().min(0).max(100000),
  taxPercent: z.coerce.number().min(0).max(100),
  feePercent: z.coerce.number().min(0).max(100),
  fixedFee: z.coerce.number().min(0).max(100000),
  donationPercent: z.coerce.number().min(0).max(100)
});

export type DonationSettingsState = { ok: boolean; message: string };

export async function updateDonationSettings(
  _prev: DonationSettingsState,
  formData: FormData
): Promise<DonationSettingsState> {
  const session = await getServerSession(authOptions);
  if (!isAdmin((session?.user as { role?: string } | undefined)?.role)) {
    return { ok: false, message: "Acesso negado." };
  }

  const parsed = settingsSchema.safeParse({
    unitCost: formData.get("unitCost"),
    taxPercent: formData.get("taxPercent"),
    feePercent: formData.get("feePercent"),
    fixedFee: formData.get("fixedFee"),
    donationPercent: formData.get("donationPercent")
  });

  if (!parsed.success) {
    return { ok: false, message: "Valores invalidos. Revise os campos." };
  }

  const { unitCost, taxPercent, feePercent, fixedFee, donationPercent } = parsed.data;

  try {
    await saveDonationParams({
      unitCost,
      taxRate: taxPercent / 100,
      feeRate: feePercent / 100,
      fixedFee,
      donationRate: donationPercent / 100
    });
    revalidatePath("/admin/configuracoes");
    revalidatePath("/admin");
    return { ok: true, message: "Parametros de doacao atualizados." };
  } catch {
    return { ok: false, message: "Nao foi possivel salvar. Verifique a conexao com o banco." };
  }
}
