export type DonationProject = {
  id: string;
  name: string;
  org: string;
  city: string;
  state: string;
  cause: string;
  description: string;
  accent: string;
};

/**
 * Os tres projetos sociais que recebem a doacao da REBANHO.
 * Fonte unica de verdade, usada pelo checkout, paginas publicas e admin.
 */
export const donationProjects: DonationProject[] = [
  {
    id: "vicentinos-frei-galvao",
    name: "Vicentinos",
    org: "SSVP — Paroquia Sao Frei Galvao",
    city: "Lago Norte, Brasilia",
    state: "DF",
    cause: "Familias em vulnerabilidade",
    description:
      "A Sociedade de Sao Vicente de Paulo da comunidade Frei Galvao leva alimento, escuta e amparo a familias do Taquari, no Lago Norte.",
    accent: "#6E8D81"
  },
  {
    id: "abrace",
    name: "ABRACE",
    org: "Assistencia a familias de criancas com cancer",
    city: "Brasilia",
    state: "DF",
    cause: "Criancas com cancer",
    description:
      "A ABRACE acolhe criancas e adolescentes em tratamento de cancer e doencas do sangue, sustentando tambem suas familias durante o cuidado.",
    accent: "#8B3E2F"
  },
  {
    id: "lar-dos-idosos",
    name: "Crevin Lar dos Idosos",
    org: "Acolhimento de longa permanencia",
    city: "Brasilia",
    state: "DF",
    cause: "Dignidade na terceira idade",
    description:
      "Um lar que oferece moradia, cuidado e companhia a idosos sem rede de apoio, garantindo dignidade em cada etapa da vida.",
    accent: "#B49B73"
  }
];

export function getProject(id: string): DonationProject | undefined {
  return donationProjects.find((project) => project.id === id);
}

export const DEFAULT_PROJECT_ID = donationProjects[0].id;
