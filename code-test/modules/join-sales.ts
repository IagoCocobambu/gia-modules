export function joinSales(...merchants: any) {
    const newSales = [];
    for (const merchant of merchants) {
        if (!merchant.sales) continue;
        for (const sale of merchant.sales) {
            newSales.push(sale);
        }
    }
    return newSales
}