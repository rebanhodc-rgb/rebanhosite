import { Church, MapPin, ReceiptText } from "lucide-react";

export function DonationCard() {
  return (
    <div className="grid gap-4 rounded-lg border border-ink/10 bg-white/45 p-6 md:grid-cols-3">
      {[
        { icon: ReceiptText, title: "10% reservado", text: "Cada pedido registra automaticamente o valor destinado." },
        { icon: MapPin, title: "CEP como sinal", text: "A localidade do cliente ajuda a direcionar a comunidade beneficiada." },
        { icon: Church, title: "Repasse rastreavel", text: "O painel admin acompanha status pendente, reservado e repassado." }
      ].map((item) => (
        <div key={item.title}>
          <item.icon className="mb-4 text-copper" size={22} />
          <h3 className="font-semibold">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-ink/65">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
