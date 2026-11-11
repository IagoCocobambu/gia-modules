// const arrNum: number[] = [ // 02/11/2026
//     241.02, // PLUXEE - PRE PAGO (241.02)
//     109.92, // VR Refeição (109.92)
//     140.90, // MEAL_VOUCHER ONLINE TICKET - PRE PAGO (140.9), BENEFICIO IFOOD - PRE PAGO (10.0), BENEFICIO IFOOD ENTREGA - PRE PAGO (6.99)
//     278.90, // BENEFICIO IFOOD - PRE PAGO (10.0), MEAL_VOUCHER ONLINE ALELO - PRE PAGO (278.9)
// ];
// const valorFerramenta: number = 660.82;

const arrNum: number[] = [ // 31/10/2026
    150.9, // MEAL_VOUCHER ONLINE ALELO - PRE PAGO (150.9)
    119.92, // VR Refeição (119.92)
    86.01, // MEAL_VOUCHER ONLINE TICKET - PRE PAGO (86.01), PIX ONLINE PIX - PRE PAGO (88.87), BENEFICIO IFOOD - PRE PAGO (10.0)
    104.92, // PLUXEE - PRE PAGO (104.92)
    193.88, // MEAL_VOUCHER ONLINE VR - PRE PAGO (193.88)
];
const valorFerramenta: number = 535.71;


const sum: number = Number(arrNum.reduce((acc, val) => acc + val, 0).toFixed(2));
console.log(sum);

const diff: number = Number(Math.abs(valorFerramenta - sum).toFixed(2));
console.log(diff);

/**
 * Strings provavelmente rejeitada
 * VR Refeição
 * 
 */