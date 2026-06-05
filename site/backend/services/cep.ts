export type CepData = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

export async function lookupCep(cep: string): Promise<CepData | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;

    return {
      cep: data.cep,
      street: data.logradouro ?? "",
      neighborhood: data.bairro ?? "",
      city: data.localidade,
      state: data.uf,
    };
  } catch {
    return null;
  }
}
