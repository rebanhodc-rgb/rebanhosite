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
 * Os três projetos sociais que recebem a doação da REBANHO.
 * Fonte única de verdade, usada pelo checkout, páginas públicas e admin.
 */
export const donationProjects: DonationProject[] = [
  {
    id: "vicentinos-frei-galvao",
    name: "Vicentinos",
    org: "SSVP — Paróquia São Frei Galvão",
    city: "Lago Norte, Brasília",
    state: "DF",
    cause: "Famílias em vulnerabilidade",
    description:
      "A Sociedade de São Vicente de Paulo da comunidade Frei Galvão leva alimento, escuta e amparo a famílias do Taquari, no Lago Norte.",
    accent: "#6E8D81"
  },
  {
    id: "abrace",
    name: "ABRACE",
    org: "Assistência a famílias de crianças com câncer",
    city: "Brasília",
    state: "DF",
    cause: "Crianças com câncer",
    description:
      "A ABRACE acolhe crianças e adolescentes em tratamento de câncer e doenças do sangue, sustentando também suas famílias durante o cuidado.",
    accent: "#8B3E2F"
  },
  {
    id: "lar-dos-idosos",
    name: "Crevin Lar dos Idosos",
    org: "Acolhimento de longa permanência",
    city: "Brasília",
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
