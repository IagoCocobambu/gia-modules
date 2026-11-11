import { deliveriesDw } from "./lib/deliveries-dw";
import { salesIfood } from "./lib/sales-ifood";

const todosStatusSalesIfood = Array.from(
    new Set(
        salesIfood.sales
            .map(sale => sale.currentStatus)
    )
);
console.log('todosStatusSalesIfood >>', todosStatusSalesIfood);

const todosAsOrigensDoDw = Array.from(new Set(deliveriesDw.data.map(d => d.origem)))
console.log('todosAsOrigensDoDw >>', todosAsOrigensDoDw);

const numerosPedidosDw = Array.from(
    new Set(
        deliveriesDw.data
            .filter(delivery => delivery.origem.toLowerCase().trim() === 'ifood')
            .map(delivery => delivery.n_pedido)
    )
);
console.log('numerosPedidosDw >>', numerosPedidosDw);

const numerosPedidosIfood = Array.from(new Set(salesIfood.sales.map(sale => sale.shortId)));
console.log('numerosPedidosIfood >>', numerosPedidosIfood);

const numerosQueConcidem = [];
for (const numero of numerosPedidosIfood) {
    if (!numerosPedidosDw.includes(numero)) continue;
    numerosQueConcidem.push(numero);
}
console.log('numerosQueConcidem >>', numerosQueConcidem);



