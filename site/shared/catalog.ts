export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  description: string;
  symbolicMeaning: string;
  images: string[];
  sizes: string[];
  line: string;
  colors: string[];
};

export const products: Product[] = [
  {
    id: "camiseta-cordis",
    name: "Camiseta Cordis",
    slug: "camiseta-cordis",
    price: 149,
    category: "Camisetas",
    line: "Fé que transforma",
    description: "Algodão premium em preto profundo, detalhe minimalista em dourado envelhecido.",
    symbolicMeaning: "Cordis remete ao coração como lugar de conversão, memória e entrega.",
    images: [
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["P", "M", "G", "GG"],
    colors: ["#090a08", "#b49b73", "#7b8065"]
  },
  {
    id: "camiseta-agnus",
    name: "Camiseta Agnus",
    slug: "camiseta-agnus",
    price: 149,
    category: "Camisetas",
    line: "O cordeiro de Deus",
    description: "Malha cru com estampa discreta do cordeiro, feita para um visual leve e contemplativo.",
    symbolicMeaning: "Agnus aponta para mansidão e sacrifício, em uma leitura sutil e elegante.",
    images: [
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["P", "M", "G", "GG"],
    colors: ["#c6b798", "#6d705d", "#090a08"]
  },
  {
    id: "camiseta-fides",
    name: "Camiseta Fides",
    slug: "camiseta-fides",
    price: 149,
    category: "Camisetas",
    line: "Fé que move montanhas",
    description: "Verde profundo, acabamento lavado e símbolo tonal com leitura de brasão.",
    symbolicMeaning: "Fides celebra a fé como movimento silencioso, constância e coragem.",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["P", "M", "G", "GG"],
    colors: ["#13251b", "#b49b73", "#090a08"]
  },
  {
    id: "camiseta-veritas",
    name: "Camiseta Veritas",
    slug: "camiseta-veritas",
    price: 149,
    category: "Camisetas",
    line: "A verdade liberta",
    description: "Preto premium com lettering serifado, cruz discreta e caimento contemporâneo.",
    symbolicMeaning: "Veritas lembra a verdade que liberta sem precisar gritar para ser reconhecida.",
    images: [
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1506629905607-d9b297d7ba26?auto=format&fit=crop&w=1200&q=85"
    ],
    sizes: ["P", "M", "G", "GG"],
    colors: ["#090a08", "#c6b798", "#77715c"]
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}
