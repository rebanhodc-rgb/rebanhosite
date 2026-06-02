import { prisma } from "@/backend/db/prisma";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export async function findParishByCep(cep: string) {
  const cleanCep = onlyDigits(cep);
  const parishes = await prisma.parish.findMany({ where: { active: true } });
  const found = parishes.find((parish) => cleanCep >= onlyDigits(parish.cepRangeStart) && cleanCep <= onlyDigits(parish.cepRangeEnd));

  return (
    found ?? {
      id: "fallback",
      name: "Comunidade cadastrada REBANHO",
      city: "Sao Paulo",
      state: "SP",
      cepRangeStart: "00000000",
      cepRangeEnd: "99999999",
      active: true
    }
  );
}
