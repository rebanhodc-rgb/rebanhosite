import { Receipt, HandHeart, BarChart3 } from "lucide-react";

const PILLARS = [
  {
    icon: Receipt,
    title: "10% do lucro liquido",
    text: "Calculamos sobre o lucro real do pedido — depois de custos de producao, impostos e taxas."
  },
  {
    icon: HandHeart,
    title: "Voce escolhe o projeto",
    text: "No checkout, sua compra apoia os Vicentinos, a ABRACE ou o Crevin Lar dos Idosos."
  },
  {
    icon: BarChart3,
    title: "Repasse rastreavel",
    text: "Cada doacao e registrada e acompanhada por projeto: reservado, pendente e repassado."
  }
] as const;

export function DonationCard() {
  return (
    <div className="grid gap-4 rounded-[2rem] border border-ink/10 bg-white/45 p-6 md:grid-cols-3 md:p-8">
      {PILLARS.map((item) => (
        <div key={item.title}>
          <item.icon className="mb-4 text-copper" size={22} strokeWidth={1.5} />
          <h3 className="serif text-xl">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/65">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
