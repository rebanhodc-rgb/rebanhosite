import { brl } from "@/shared/utils";

export type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
};

export type OrderEmailData = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  donationAmount: number;
  parishName: string;
  items: OrderEmailItem[];
};

function itemsList(items: OrderEmailItem[]) {
  return items.map((item) => `<li>${item.quantity}x ${item.name} - ${brl(item.price * item.quantity)}</li>`).join("");
}

export function orderConfirmationHtml(order: OrderEmailData) {
  return `
    <div style="font-family: Georgia, serif; color: #0f1a17; line-height: 1.6;">
      <h1>Pedido recebido pela REBANHO</h1>
      <p>Ola, ${order.customerName}. Recebemos seu pedido <strong>${order.orderId}</strong>.</p>
      <ul>${itemsList(order.items)}</ul>
      <p><strong>Total:</strong> ${brl(order.total)}</p>
      <p><strong>Doacao reservada:</strong> ${brl(order.donationAmount)} para ${order.parishName}.</p>
      <p>Voce recebera novas atualizacoes quando o pagamento e envio forem confirmados.</p>
    </div>
  `;
}

export function adminOrderNotificationHtml(order: OrderEmailData) {
  return `
    <div style="font-family: Arial, sans-serif; color: #0f1a17; line-height: 1.6;">
      <h1>Novo pedido REBANHO</h1>
      <p><strong>Pedido:</strong> ${order.orderId}</p>
      <p><strong>Cliente:</strong> ${order.customerName} (${order.customerEmail})</p>
      <ul>${itemsList(order.items)}</ul>
      <p><strong>Total:</strong> ${brl(order.total)}</p>
      <p><strong>Doacao:</strong> ${brl(order.donationAmount)} para ${order.parishName}</p>
    </div>
  `;
}
