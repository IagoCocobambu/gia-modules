import fs from 'node:fs';
import { cbRecife } from "./lib/17-cb-recife";
import { joinSales } from "./modules/join-sales";

let sales = joinSales(
    cbRecife.adega,
    cbRecife.burger,
    cbRecife.coco,
    cbRecife.confeitaria,
    cbRecife.daniCozinha,
    cbRecife.express,
    cbRecife.pizzariaExpress,
    cbRecife.vasto,
    cbRecife.vastoSushi,
)
    .filter((sale: any) => sale.currentStatus === 'CONCLUDED');

    for (const sale of sales) {
        sale.payments.methods.filter((method: any) => method.type.toLowerCase() === 'online')
    }

    sales = sales
        .filter((sale: any) => sale.payments.methods.length > 0)
        .map((sale: any) => sale.payments.methods);

    const newSales = [];
    for (const sale of sales) {
        newSales.push(...sale);
    }
    sales = newSales
        .map(s => s.value)
        .reduce((acc: number, curr: number) => acc + curr, 0);

console.log('sales >>', sales);
console.log('sales.length >>', sales.length);


fs.writeFileSync('\\wsl.localhost\\Ubuntu\\home\\cb_tech\\modules-gia\\code-test\\file.json', JSON.stringify([
    cbRecife.adega,
    cbRecife.burger,
    cbRecife.coco,
    cbRecife.confeitaria,
    cbRecife.daniCozinha,
    cbRecife.express,
    cbRecife.pizzariaExpress,
    cbRecife.vasto,
    cbRecife.vastoSushi,
], null, 2), 'utf-8')