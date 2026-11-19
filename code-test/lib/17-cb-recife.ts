export namespace cbRecife {
    // 01e8d0c0-677f-49b8-9976-3d23315471e7
    export const adega = {};

    // acec867f-8fb6-49b1-a648-f709be981adf
    export const burger = {};

    // 14baa9b6-5c6c-429b-8a5e-cc4092c098c6
    export const coco = {
        "page": 1,
        "size": 20,
        "beginSalesDate": "2026-11-08",
        "endSalesDate": "2026-11-08",
        "sales": [
            {
                "id": "a5117c85-b419-4302-942b-c713e020a936",
                "shortId": "5499",
                "createdAt": "2026-11-09T00:20:08.254Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 113.8,
                    "deliveryFee": 13.99,
                    "serviceFee": -2.07
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 10.29,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.3
                                }
                            ]
                        },
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                }
                            ]
                        }
                    ],
                    "totalValue": 24.28
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 105.58,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "527896",
                                "nsu": "504246013"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 104.24,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 12.31
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.07
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 105.58
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -8.11
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.47
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "4fe2fc42-31d6-4f6f-b68b-ca539c222630",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-09T00:20:13.133Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "383b2f67-e32a-4476-80f1-75a86132eb89",
                                    "nsu": "504246013",
                                    "authCode": "527896"
                                }
                            ]
                        }
                    },
                    {
                        "id": "205876cd-9497-4340-91c0-c06a58b2561a",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-09T00:20:14.314Z"
                    },
                    {
                        "id": "60b0c8b8-bb68-4e6d-8112-65194c8b395c",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-09T00:20:35.426Z"
                    },
                    {
                        "id": "0eb8b8ef-8ca6-4ebf-85bd-882a33ddfcd3",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-09T00:20:35.809360118Z"
                    },
                    {
                        "id": "df364df4-58f5-418e-9a50-1cc73cf6513e",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-09T00:31:46.361Z"
                    },
                    {
                        "id": "a2e8995c-55e5-49d0-9b8f-4c29408769c1",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-09T00:44:29.472Z"
                    },
                    {
                        "id": "2bce6f6f-8b56-4acc-863a-32fbe5800c59",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-09T00:56:47.571450185Z"
                    },
                    {
                        "id": "7156ca32-1c1f-49e9-8247-a543436db174",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-09T00:56:48.082542342Z"
                    },
                    {
                        "id": "66d95875-50b1-42c6-9c4b-2ddcbd12f9bf",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T07:32:13.563216224Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:56:48.210245Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:56:48.210245Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.3,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:56:48.210245Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.07,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:56:48.210245Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 105.58,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:56:48.210245Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:56:48.210245Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -8.11,
                                    "feePercentage": "7",
                                    "feeBaseValue": "115.82",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:56:48.210245Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.47,
                                    "feePercentage": "3",
                                    "feeBaseValue": "115.82",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:56:48.210245Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "87262b05-441f-4db8-8740-ce6fac27013f",
                "shortId": "1627",
                "createdAt": "2026-11-08T23:19:39.196Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 113.8,
                    "deliveryFee": 13.99,
                    "serviceFee": -2.59
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 10.29,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.3
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 24.28
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "BANK_PAY",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 106.1,
                            "card": {
                                "brand": "NUBANK"
                            },
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 104.24,
                    "billingEntries": [
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.47
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.59
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 12.31
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 106.1
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -8.11
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "7946a286-9cf9-4586-ae72-8a08c8fc74ba",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T23:19:59.013Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "52efddac-ed53-431a-8568-3c59ed5b7173",
                                    "nsu": null,
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "9e991d13-aef3-4174-8664-c726453f11eb",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T23:20:00.394Z"
                    },
                    {
                        "id": "eabdaa66-4bce-4b35-8679-2daf3c1c6ce9",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T23:20:27.077Z"
                    },
                    {
                        "id": "650649e8-30fc-4818-911d-4d162f09e31d",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T23:20:27.476577762Z"
                    },
                    {
                        "id": "2635f672-b534-43ea-a6ce-86ed7cf7a323",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T23:33:04.707Z"
                    },
                    {
                        "id": "13bae6fd-cab6-442c-bc47-c9422e1c2402",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T23:59:14.800Z"
                    },
                    {
                        "id": "d1440df0-841c-47fd-bcaa-b8b303b748f6",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-09T00:05:19.001622897Z"
                    },
                    {
                        "id": "bfc8c4c4-71f0-4e9c-9f18-348117e02ff4",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-09T00:05:19.514597829Z"
                    },
                    {
                        "id": "d95d690c-7cf2-4976-a90d-89192c09f5da",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T05:33:44.141308868Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.47,
                                    "feePercentage": "3",
                                    "feeBaseValue": "115.82",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:05:19.628691Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:05:19.628691Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.59,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:05:19.628691Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.3,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:05:19.628691Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 106.1,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:05:19.628691Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -8.11,
                                    "feePercentage": "7",
                                    "feeBaseValue": "115.82",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:05:19.628691Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:05:19.628691Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:05:19.628691Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "641a7e78-7fcc-4c77-87ba-ef463fa94594",
                "shortId": "1477",
                "createdAt": "2026-11-08T23:08:40.932Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 410.91,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                }
                            ]
                        }
                    ],
                    "totalValue": 13.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 414.9,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "265163",
                                "nsu": "14970937"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 376.13,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.01
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -12.54
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -29.25
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 414.9
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "19ae6c8b-5ae6-48a5-a599-7095f961a71c",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T23:08:45.443Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "83268cdc-e330-4f11-aabb-2808a158bb14",
                                    "nsu": "14970937",
                                    "authCode": "265163"
                                }
                            ]
                        }
                    },
                    {
                        "id": "988c4e00-0ef1-4ce0-b524-c506ba53c638",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T23:08:46.510Z"
                    },
                    {
                        "id": "be0e9cd5-e1d2-4be6-b964-85fd1f0b5c83",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T23:08:57.726Z"
                    },
                    {
                        "id": "e287eea3-523b-4015-85d6-2e415a6b8c15",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T23:08:58.069263501Z"
                    },
                    {
                        "id": "b5e291d3-389c-427f-9464-2a784823da42",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T23:28:55.019Z"
                    },
                    {
                        "id": "a32b1d61-863e-4f4b-b63c-c76cd1a754b5",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T23:45:50.497874405Z"
                    },
                    {
                        "id": "64a9daf9-2b0c-4216-9daa-7d34fabcaa6d",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T23:45:51.009644418Z"
                    },
                    {
                        "id": "8769f520-add8-4e99-973b-320027837d2f",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T04:47:45.291119594Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:45:51.104277Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:45:51.104277Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -12.54,
                                    "feePercentage": "3",
                                    "feeBaseValue": "417.92",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:45:51.104277Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -29.25,
                                    "feePercentage": "7",
                                    "feeBaseValue": "417.92",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:45:51.104277Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 414.9,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:45:51.104277Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:45:51.104277Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "ab1c5442-6916-468f-90f4-e366c74f1f96",
                "shortId": "5853",
                "createdAt": "2026-11-08T23:06:06.298Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 273,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 15,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 10
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 28.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 261.99,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "670089",
                                "nsu": "000609809434"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 247.51,
                    "billingEntries": [
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 261.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -19.25
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 17.01
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -8.25
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "8ee70ed7-0d22-437f-ab10-c52abe03d96f",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T23:06:10.774Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "31db4efd-dcf5-4154-84a4-d42fb6ec8fde",
                                    "nsu": "000609809434",
                                    "authCode": "670089"
                                }
                            ]
                        }
                    },
                    {
                        "id": "aa380c7e-63e8-4b46-bca1-4edc4ef82c08",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T23:06:12.047Z"
                    },
                    {
                        "id": "78e5aa82-2903-45e8-b9c4-7f75a749dba6",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T23:06:26.550Z"
                    },
                    {
                        "id": "f1b151b4-9c7f-4f69-9e54-748f859f7102",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T23:06:26.866498967Z"
                    },
                    {
                        "id": "184fffdb-dbaf-4e93-a53e-f8206050444b",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T23:38:25.843Z"
                    },
                    {
                        "id": "1ad836e7-c9f7-4477-b46f-212aa7be6d14",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T23:46:41.489Z"
                    },
                    {
                        "id": "92f9de77-2dcd-417e-b2fe-16f8c17e5556",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T23:58:08.955144981Z"
                    },
                    {
                        "id": "396db2c7-956d-4438-87b2-73732e457e1a",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T23:58:09.466844304Z"
                    },
                    {
                        "id": "7e9b9ab6-085b-46ca-ba10-d9b4c1837d35",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T05:19:38.167495049Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:58:09.698274Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 261.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:58:09.698274Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -19.25,
                                    "feePercentage": "7",
                                    "feeBaseValue": "275.01",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:58:09.698274Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:58:09.698274Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:58:09.698274Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:58:09.698274Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -8.25,
                                    "feePercentage": "3",
                                    "feeBaseValue": "275.01",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:58:09.698274Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:58:09.698274Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "e3e979dd-bd45-4cb5-8d75-e0668a49e663",
                "shortId": "3758",
                "createdAt": "2026-11-08T22:49:15.252Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 213.9,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                }
                            ]
                        }
                    ],
                    "totalValue": 13.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "PIX",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 217.89,
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 198.82,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.01
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -6.63
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 217.89
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -15.46
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "9e6b8654-b94d-4b5d-bc08-658a24aa25f5",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T22:50:32.111Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "6543c289-b3d2-41e3-a5d3-45804ccdac88",
                                    "nsu": "CONCLUIDA",
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "5aca5917-3972-4fea-a2bf-acdf8e878c19",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T22:50:33.470Z"
                    },
                    {
                        "id": "2f71a752-9a34-4ca5-9a64-ff9192115ea4",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T22:50:59.873Z"
                    },
                    {
                        "id": "a3117130-cd7c-49b1-abae-4cd3d765d30f",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T22:51:00.276569896Z"
                    },
                    {
                        "id": "e7f23797-bfe5-44a1-b148-f3da9d7c1757",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T23:00:54.828Z"
                    },
                    {
                        "id": "218f60eb-08d4-4ab7-a752-cb3322f2fb26",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T23:12:43.406Z"
                    },
                    {
                        "id": "1e0688e9-4feb-4369-81a8-524f7d42fe9c",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T23:27:50.727195070Z"
                    },
                    {
                        "id": "ce361fb3-0870-40be-b520-3abbe2945828",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T23:27:51.238462701Z"
                    },
                    {
                        "id": "27649f24-cbec-496e-b6ac-7e32e771e14a",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T04:04:46.758491412Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:27:51.431551Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -6.63,
                                    "feePercentage": "3",
                                    "feeBaseValue": "220.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:27:51.431551Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 217.89,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:27:51.431551Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -15.46,
                                    "feePercentage": "7",
                                    "feeBaseValue": "220.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:27:51.431551Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:27:51.431551Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:27:51.431551Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "64ea5cf0-9d48-463e-9d51-10a1900a493d",
                "shortId": "8272",
                "createdAt": "2026-11-08T22:26:12.295Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 174.8,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 23.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 179.95,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "installment": {
                                "maxInstallments": 3,
                                "installmentDetail": [
                                    {
                                        "reference": "1",
                                        "amount": 59.99
                                    },
                                    {
                                        "reference": "2",
                                        "amount": 59.98
                                    },
                                    {
                                        "reference": "3",
                                        "amount": 59.98
                                    }
                                ]
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "054320",
                                "nsu": "054320"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 159.13,
                    "billingEntries": [
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 12.01
                        },
                        {
                            "name": "CONVENIENCE_FEE",
                            "value": -11.16
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 179.95
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -12.38
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -5.3
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "e3ce389a-9fc4-4800-83c9-b69181912ade",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T22:26:15.328Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "351ff771-9e8f-4b98-8248-9122bbadd374",
                                    "nsu": "054320",
                                    "authCode": "054320"
                                }
                            ]
                        }
                    },
                    {
                        "id": "366dfba0-5998-40df-9afa-6073f369d746",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T22:26:16.459Z"
                    },
                    {
                        "id": "da6f9607-80ee-43b1-a718-f5834c6bf708",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T22:26:26.219Z"
                    },
                    {
                        "id": "e0f5ba61-8c3f-4732-91f0-6ce8c927b207",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T22:26:26.570988971Z"
                    },
                    {
                        "id": "ff9350a0-4cc5-47d5-8905-c39422e96945",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T22:36:18.237Z"
                    },
                    {
                        "id": "add21815-9b5f-4190-9168-e2d764e0f799",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T23:05:30.176Z"
                    },
                    {
                        "id": "c1c31975-6ba9-4ff8-8d1b-8de63595ec69",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T23:35:05.090561444Z"
                    },
                    {
                        "id": "c0c97145-6e5b-4dcc-a48c-b83531c0c7a8",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T23:35:05.605576327Z"
                    },
                    {
                        "id": "c131a066-b7d5-43e6-b8dc-11aedc6c8d3c",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T04:14:36.309203424Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:35:05.722075Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:35:05.722075Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:35:05.722075Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:35:05.722075Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:35:05.722075Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "CONVENIENCE_FEE",
                                    "amount": -11.16,
                                    "feeBaseValue": "11.16",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:35:05.722075Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "CONVENIENCE_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 179.95,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:35:05.722075Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -12.38,
                                    "feePercentage": "7",
                                    "feeBaseValue": "176.81",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:35:05.722075Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -5.3,
                                    "feePercentage": "3",
                                    "feeBaseValue": "176.81",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:35:05.722075Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "29086fd6-26ef-413c-a9b0-4c1cf680f16e",
                "shortId": "4490",
                "createdAt": "2026-11-08T21:54:02.876Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 194.01,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                }
                            ]
                        }
                    ],
                    "totalValue": 13.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 198,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "178180",
                                "nsu": "14387527"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 180.92,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.01
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -14.07
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 198
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -6.03
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "58de9c96-440d-4185-b471-1e9204763a44",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T21:54:08.224Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "0cb0bea2-451f-4835-b8c1-c4c253cd1592",
                                    "nsu": "14387527",
                                    "authCode": "178180"
                                }
                            ]
                        }
                    },
                    {
                        "id": "55c05826-4b63-4cc6-ae6b-c4ce27d6c3c5",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T21:54:09.301Z"
                    },
                    {
                        "id": "07c3f306-d53f-4961-ab29-3da27f67e0f5",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T21:54:25.989Z"
                    },
                    {
                        "id": "10503a34-655a-4d4b-8f29-4fc5f343e948",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T21:54:26.372797300Z"
                    },
                    {
                        "id": "285c5ea0-178f-4ee2-bb42-9504731126b5",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T22:05:08.183Z"
                    },
                    {
                        "id": "f401696b-ca8e-4ebb-9ef6-9eb939ea92eb",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T22:27:53.513Z"
                    },
                    {
                        "id": "93a6c530-d48f-4c53-9bf4-8cecc05f8f33",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T22:47:55.042702381Z"
                    },
                    {
                        "id": "938787de-bc41-49c7-8b1b-5b988ba7c730",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T22:47:55.553378875Z"
                    },
                    {
                        "id": "a608fe5d-89ea-4752-b2e0-dab8d3314abb",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T02:14:32.136186770Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:47:55.710597Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:47:55.710597Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:47:55.710597Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -14.07,
                                    "feePercentage": "7",
                                    "feeBaseValue": "201.02",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:47:55.710597Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 198,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:47:55.710597Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -6.03,
                                    "feePercentage": "3",
                                    "feeBaseValue": "201.02",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:47:55.710597Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "cc1ea96b-63e7-4d68-86c8-86495dd86f30",
                "shortId": "4921",
                "createdAt": "2026-11-08T21:41:01.848Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 205.8,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 10.29,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.3
                                }
                            ]
                        },
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                }
                            ]
                        }
                    ],
                    "totalValue": 24.28
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "BANK_PAY",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 199.5,
                            "card": {
                                "brand": "NUBANK"
                            },
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 187.04,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 12.31
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 199.5
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -14.55
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -6.23
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "6172703a-9f89-4062-a556-57b4e83ab408",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T21:41:24.038Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "ffcb8ff4-cb2f-46dd-980b-1a2280752211",
                                    "nsu": null,
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "518baf01-56ed-421c-8e23-1cbf6adebb5c",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T21:41:25.372Z"
                    },
                    {
                        "id": "f7b61272-9d66-4a56-83fc-a0059ba99f25",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T21:41:56.903Z"
                    },
                    {
                        "id": "7163cdf1-fe20-4038-ba4b-55946fefc7c0",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T21:41:57.329563332Z"
                    },
                    {
                        "id": "cf555dba-5a59-4f8a-aeff-805c15fdf40e",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T21:50:43.587Z"
                    },
                    {
                        "id": "380fd757-ea5e-41f4-a3ce-cb6597980d7c",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T21:56:30.943Z"
                    },
                    {
                        "id": "9d85970a-1404-492b-8d36-752ea6fa670c",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T22:42:30.870428078Z"
                    },
                    {
                        "id": "448c1207-83cf-4c3e-83a3-6fa45fe17927",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T22:42:31.381232762Z"
                    },
                    {
                        "id": "20d78dcf-6b2e-4786-ad7b-81d1052308e0",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T02:00:05.462003075Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:42:31.638790Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:42:31.638790Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:42:31.638790Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:42:31.638790Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.3,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:42:31.638790Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 199.5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:42:31.638790Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -14.55,
                                    "feePercentage": "7",
                                    "feeBaseValue": "207.82",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:42:31.638790Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -6.23,
                                    "feePercentage": "3",
                                    "feeBaseValue": "207.82",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:42:31.638790Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "ba5ab9a8-68c5-400c-a4d7-8c5555eb9a27",
                "shortId": "0718",
                "createdAt": "2026-11-08T21:36:45.385Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 219.9,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                }
                            ]
                        }
                    ],
                    "totalValue": 13.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 223.89,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "364765",
                                "nsu": "000646769007"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 204.22,
                    "billingEntries": [
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -15.88
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 223.89
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.01
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -6.81
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "4d4ac1ad-606d-41e4-8dfe-5b9ae5c024c1",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T21:36:48.020Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "a071aa9b-1380-44a9-9e88-b1481577c8f8",
                                    "nsu": "000646769007",
                                    "authCode": "364765"
                                }
                            ]
                        }
                    },
                    {
                        "id": "d5de8fac-adae-43e1-b85b-cdf5a670b892",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T21:36:49.158Z"
                    },
                    {
                        "id": "b6419d71-4771-4a9c-8799-6627a98a68c5",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T21:36:56.776Z"
                    },
                    {
                        "id": "54ba082c-b098-4790-ad73-a22eef72e604",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T21:36:57.102835963Z"
                    },
                    {
                        "id": "9ff722cd-c95b-478d-9e7e-a3cd066020d7",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T21:50:41.469Z"
                    },
                    {
                        "id": "8b97b19c-9e87-4c4a-b7ec-be3d249d0437",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T21:56:25.394Z"
                    },
                    {
                        "id": "d8d16d7a-fcac-4737-8e98-7370a3a3a8b9",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T22:36:52.312013719Z"
                    },
                    {
                        "id": "ec4931a3-1466-46f3-a2d4-0d927d3f7424",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T22:36:52.824356348Z"
                    },
                    {
                        "id": "f697a38a-8ba2-4de6-b230-2dd5e1d8e6d6",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T01:52:53.412514721Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -15.88,
                                    "feePercentage": "7",
                                    "feeBaseValue": "226.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:36:52.997983Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 223.89,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:36:52.997983Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:36:52.997983Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -6.81,
                                    "feePercentage": "3",
                                    "feeBaseValue": "226.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:36:52.997983Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:36:52.997983Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:36:52.997983Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "1621cbe7-0685-40d8-81c6-a60bdc2b05c1",
                "shortId": "7867",
                "createdAt": "2026-11-08T21:17:48.350Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 144.9,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.62
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 5,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 18.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "wallet": {
                                "name": "APPLE_PAY"
                            },
                            "method": "DIGITAL_WALLET",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 143.52,
                            "card": {
                                "brand": "ELO"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "675008",
                                "nsu": "675008"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 132.22,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.01
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -10.28
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.62
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 143.52
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -4.41
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "2648f48f-238b-4f0f-a319-dc2e66cf1a8d",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T21:17:50.645Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "9978773c-cd7b-48d3-8c06-d0cfe8a69d6a",
                                    "nsu": "675008",
                                    "authCode": "675008"
                                }
                            ]
                        }
                    },
                    {
                        "id": "738ad787-ecbc-40ea-8c8d-d764c594da4a",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T21:17:51.673Z"
                    },
                    {
                        "id": "3fd9cf35-59dc-43b4-90dc-09371862bb36",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T21:18:00.353Z"
                    },
                    {
                        "id": "0715a289-3298-43b7-afd9-ddf73fa8b411",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T21:18:00.762650577Z"
                    },
                    {
                        "id": "2b0a9948-e223-4722-ab10-c3f0488f9103",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T21:31:37.905Z"
                    },
                    {
                        "id": "aa6ddb41-acf1-4460-a0d5-c997d2969a9f",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T21:35:50.695Z"
                    },
                    {
                        "id": "0db896db-215e-4cd8-9e82-1f33775146f1",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T22:00:46.026236441Z"
                    },
                    {
                        "id": "e1a14f2f-4d69-41c8-aa2a-96ec8b850a1d",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T22:00:46.539451189Z"
                    },
                    {
                        "id": "e5efe152-5c3d-42f1-bc3d-eb772abda5e3",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T00:38:27.490692661Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:00:46.665404Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -10.28,
                                    "feePercentage": "7",
                                    "feeBaseValue": "146.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:00:46.665404Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:00:46.665404Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.62,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:00:46.665404Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 143.52,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:00:46.665404Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.41,
                                    "feePercentage": "3",
                                    "feeBaseValue": "146.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:00:46.665404Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:00:46.665404Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "f1f4d3f2-5b1c-4e80-a1e9-3056b0cf5018",
                "shortId": "8258",
                "createdAt": "2026-11-08T20:56:07.970Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 144.9,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.62
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 13.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 148.52,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "661262",
                                "nsu": "877938893"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 136.72,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.01
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -10.63
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -4.56
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 148.52
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.62
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "475fd65d-7f4f-4c7a-9cf7-3a79d59ce99a",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T20:56:13.391Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "ccaadde9-82d0-4a55-9195-80f0fd215838",
                                    "nsu": "877938893",
                                    "authCode": "661262"
                                }
                            ]
                        }
                    },
                    {
                        "id": "c9b60aa3-a320-4b34-a7ee-4d3e389cb132",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T20:56:14.503Z"
                    },
                    {
                        "id": "7a724131-c9b1-4767-8611-39df1e9eb18b",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T20:56:30.273Z"
                    },
                    {
                        "id": "ac16560e-2a40-44f4-b035-2c2744271b29",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T20:56:30.637454433Z"
                    },
                    {
                        "id": "e366534b-46a1-4694-9832-9e3e8a0ecf24",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T21:19:30.889Z"
                    },
                    {
                        "id": "014a0663-331d-4e3a-9826-a2b309f9aac3",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T21:28:58.878Z"
                    },
                    {
                        "id": "5c73e438-b627-4a51-b587-fd13052e9645",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T21:32:56.966897469Z"
                    },
                    {
                        "id": "26cbdcf1-8275-42a0-b4cd-ae061d3464b3",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T21:32:57.500899627Z"
                    },
                    {
                        "id": "796662dd-73fb-462d-95a6-b949eace1a1a",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T00:13:39.518945549Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:32:57.604836Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -10.63,
                                    "feePercentage": "7",
                                    "feeBaseValue": "151.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:32:57.604836Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.56,
                                    "feePercentage": "3",
                                    "feeBaseValue": "151.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:32:57.604836Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 148.52,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:32:57.604836Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:32:57.604836Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.62,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:32:57.604836Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "76f6986b-632c-4c4a-8459-3bb64c0602a4",
                "shortId": "8108",
                "createdAt": "2026-11-08T19:46:16.941Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 277.9,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 13.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "wallet": {
                                "name": "APPLE_PAY"
                            },
                            "method": "DIGITAL_WALLET",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 281.89,
                            "card": {
                                "brand": "VISA_ELECTRON"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "74V3MF",
                                "nsu": "74V3MF"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 256.42,
                    "billingEntries": [
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.01
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 281.89
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -8.55
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -19.94
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "968aebd7-a346-4331-931b-322a5d44eb43",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T19:46:19.229Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "4bc4752e-eb6c-4b92-80ef-54dff9cecefa",
                                    "nsu": "74V3MF",
                                    "authCode": "74V3MF"
                                }
                            ]
                        }
                    },
                    {
                        "id": "227b598b-d77b-4550-bcc3-a45d684a3cd5",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T19:46:20.272Z"
                    },
                    {
                        "id": "e5e2f3b1-85e5-4401-8ce6-903522ff3eb2",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T19:46:51.274Z"
                    },
                    {
                        "id": "495bb5ea-8891-4f43-9d06-0a58d6b60fbe",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T19:46:51.671398877Z"
                    },
                    {
                        "id": "825ff558-4d95-4ed7-a277-04960449df6e",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T19:59:55.457Z"
                    },
                    {
                        "id": "0d576765-edda-4d7c-9216-177f13e60e7d",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T20:20:12.480Z"
                    },
                    {
                        "id": "0d8926c4-9534-4495-8dfc-1088a90b9737",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T21:09:03.359388482Z"
                    },
                    {
                        "id": "a9ee81ef-59e7-429e-86df-1f0beb30c3fd",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T23:49:50.401686793Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:09:03.528762Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:09:03.528762Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:09:03.528762Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 281.89,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:09:03.528762Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -8.55,
                                    "feePercentage": "3",
                                    "feeBaseValue": "284.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:09:03.528762Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -19.94,
                                    "feePercentage": "7",
                                    "feeBaseValue": "284.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:09:03.528762Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "8844c39f-b481-4cb9-bdd5-4e3bf4014e35",
                "shortId": "8630",
                "createdAt": "2026-11-08T19:14:59.189Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 290.71,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                }
                            ]
                        }
                    ],
                    "totalValue": 13.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 294.7,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "928634",
                                "nsu": "000500724584"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 267.95,
                    "billingEntries": [
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -8.93
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 294.7
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -20.84
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.01
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "8939f117-6a8e-42f9-9935-7eb7587de2f9",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T19:15:01.856Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "b632facd-e208-4497-b029-07656cb84c99",
                                    "nsu": "000500724584",
                                    "authCode": "928634"
                                }
                            ]
                        }
                    },
                    {
                        "id": "9202518c-5994-4a79-948d-01a6a408d7ed",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T19:15:03.014Z"
                    },
                    {
                        "id": "db5fb9a0-9709-40de-baae-4474cf1e8960",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T19:15:19.043Z"
                    },
                    {
                        "id": "52a0c0c2-714d-466b-a366-f6df2c4a2c70",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T19:15:19.499349870Z"
                    },
                    {
                        "id": "b9638f03-d2c1-48ea-a27d-58e17eba4ae5",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T19:32:29.360Z"
                    },
                    {
                        "id": "6f36a7a4-38cc-402e-affb-f665bc772631",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T19:45:19.149Z"
                    },
                    {
                        "id": "71e6966b-09fe-4ebf-be8f-4f0e4e174891",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T20:06:28.339701462Z"
                    },
                    {
                        "id": "c6a2b3d8-a36f-4a4d-845f-0b448e87594a",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T20:06:28.859621680Z"
                    },
                    {
                        "id": "8ee7cc34-2db5-4f96-9e26-1dd080af84d3",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T22:15:57.501841992Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:06:29.422020Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -8.93,
                                    "feePercentage": "3",
                                    "feeBaseValue": "297.72",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:06:29.422020Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:06:29.422020Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 294.7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:06:29.422020Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -20.84,
                                    "feePercentage": "7",
                                    "feeBaseValue": "297.72",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:06:29.422020Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:06:29.422020Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "e2fb5d89-5522-4dce-8152-9534de74bd99",
                "shortId": "9551",
                "createdAt": "2026-11-08T18:45:50.694Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 154.9,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.87
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 23.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 148.77,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "455363",
                                "nsu": "752300239"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 141.22,
                    "billingEntries": [
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.87
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -10.98
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 12.01
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -4.71
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 148.77
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "793dcc6a-0ded-4762-8b62-74c809cd8dea",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T18:45:54.442Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "d0859913-3d44-4d4d-acbd-73c351a5747b",
                                    "nsu": "752300239",
                                    "authCode": "455363"
                                }
                            ]
                        }
                    },
                    {
                        "id": "7b357328-b94a-4742-86b1-3d9cf3a94a11",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T18:45:55.532Z"
                    },
                    {
                        "id": "b7d82ce7-838c-4c31-bd10-1f2e95e4fb42",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T18:46:18.955Z"
                    },
                    {
                        "id": "876d2cb4-173d-4575-88ed-9e24a84166fb",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T18:46:19.411966465Z"
                    },
                    {
                        "id": "ec8b938d-04f8-4311-bb5b-7bd820f1a629",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T19:00:48.976Z"
                    },
                    {
                        "id": "a959e65a-6a0b-4435-beab-72195e127433",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T19:03:04.294Z"
                    },
                    {
                        "id": "44d13dce-b197-43b3-87a6-e64442cf4fa5",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T19:54:52.906686696Z"
                    },
                    {
                        "id": "9faee313-b67a-423a-b7f1-350816e8d3de",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T19:54:53.417116778Z"
                    },
                    {
                        "id": "2c1040ba-3f83-4509-8059-ec0b8e730d8d",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T22:08:45.510284573Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.87,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:54:53.495967Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -10.98,
                                    "feePercentage": "7",
                                    "feeBaseValue": "156.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:54:53.495967Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:54:53.495967Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:54:53.495967Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:54:53.495967Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.71,
                                    "feePercentage": "3",
                                    "feeBaseValue": "156.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:54:53.495967Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:54:53.495967Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 148.77,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:54:53.495967Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "1bfcdab4-4dc8-429a-bfbf-42809573bb02",
                "shortId": "9556",
                "createdAt": "2026-11-08T18:44:14.488Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 192.8,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 10.29,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.3
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 24.28
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "wallet": {
                                "name": "APPLE_PAY"
                            },
                            "method": "DIGITAL_WALLET",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 186.5,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "830738",
                                "nsu": "830738"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 175.34,
                    "billingEntries": [
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 186.5
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 12.31
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -5.84
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -13.64
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "30d35d9e-19f8-45e4-bfe7-ead624d23679",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T18:44:16.576Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "b3004e22-81a4-4d85-83e5-db0016ae22a4",
                                    "nsu": "830738",
                                    "authCode": "830738"
                                }
                            ]
                        }
                    },
                    {
                        "id": "0e5e076c-8742-4043-98cf-bf062471f20a",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T18:44:17.608Z"
                    },
                    {
                        "id": "b2d93f3d-6536-4aee-91d0-1d81f0187aae",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T18:44:50.413Z"
                    },
                    {
                        "id": "67ce7239-a838-471f-95ae-80fa915e4fb0",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T18:44:50.856382235Z"
                    },
                    {
                        "id": "d395af74-70e3-46df-bb41-8b621e2440d0",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T19:02:32.471Z"
                    },
                    {
                        "id": "a8463d22-9cd9-4ee6-8be9-d7f3da7570fa",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T19:15:43.819795193Z"
                    },
                    {
                        "id": "29931d40-d4fa-4944-bcc0-2f0e16cf9837",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T19:15:44.332486144Z"
                    },
                    {
                        "id": "04c1cbba-55f5-45be-a661-dcdf08be5fec",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T21:22:54.470845834Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:15:44.405539Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 186.5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:15:44.405539Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:15:44.405539Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:15:44.405539Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.3,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:15:44.405539Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:15:44.405539Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -5.84,
                                    "feePercentage": "3",
                                    "feeBaseValue": "194.82",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:15:44.405539Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -13.64,
                                    "feePercentage": "7",
                                    "feeBaseValue": "194.82",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:15:44.405539Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "b10b10e1-8014-4146-983f-2f8ed687bce2",
                "shortId": "6666",
                "createdAt": "2026-11-08T18:39:45.316Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 84.9,
                    "deliveryFee": 13.99,
                    "serviceFee": -2.12
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 23.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "BANK_PAY",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 77.02,
                            "card": {
                                "brand": "NUBANK"
                            },
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 78.22,
                    "billingEntries": [
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 77.02
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 12.01
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -2.61
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -6.08
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.12
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "95b2ca7c-fd69-45ed-9fa4-a41e1691866e",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T18:40:17.784Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "54ff9f35-b237-4bde-83ef-b128fbc23c18",
                                    "nsu": null,
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "4ce37dd1-81ec-4c6b-bbec-2b8146170257",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T18:40:19.288Z"
                    },
                    {
                        "id": "0ecde87f-5ba1-49bc-8552-135efbfaed5f",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T18:40:49.481Z"
                    },
                    {
                        "id": "eb19d0fd-96d1-4d0f-b92c-abc8af1b76a1",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T18:40:49.899711554Z"
                    },
                    {
                        "id": "106588df-5c25-494e-9a2d-3c3745fe1089",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T18:50:43.523Z"
                    },
                    {
                        "id": "4a796453-0f57-4953-bec0-acf6f3b41c0e",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T19:03:33.142Z"
                    },
                    {
                        "id": "ed860e29-4466-49cf-9e50-ffac7bc6eece",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T19:58:14.113840616Z"
                    },
                    {
                        "id": "4a666704-ab57-4a2b-9086-edc0dcd9c8a0",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T19:58:14.625792829Z"
                    },
                    {
                        "id": "f842a2f5-0a07-455f-9b12-d0e6f2bd7475",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T22:06:53.021298762Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 77.02,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:58:14.774332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:58:14.774332Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:58:14.774332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:58:14.774332Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:58:14.774332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -2.61,
                                    "feePercentage": "3",
                                    "feeBaseValue": "86.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:58:14.774332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -6.08,
                                    "feePercentage": "7",
                                    "feeBaseValue": "86.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:58:14.774332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.12,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:58:14.774332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "7f800244-7f72-49ae-8662-b61d17b80911",
                "shortId": "4176",
                "createdAt": "2026-11-08T18:26:30.968Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 317,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 110.95,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 110.95
                                }
                            ]
                        },
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                }
                            ]
                        }
                    ],
                    "totalValue": 124.94
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 210.04,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "F83763",
                                "nsu": "13362969"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 191.76,
                    "billingEntries": [
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -6.39
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.01
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -14.91
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 210.04
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "e7c767e5-37b0-440c-88a7-b8e449f780cb",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T18:26:33.717Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "69d3a296-08a1-4af9-9e52-c0e85ce8f685",
                                    "nsu": "13362969",
                                    "authCode": "F83763"
                                }
                            ]
                        }
                    },
                    {
                        "id": "24418d6a-fe04-4eef-9258-1e514daf6a50",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T18:26:34.897Z"
                    },
                    {
                        "id": "532ffbf0-b277-4d3c-b7c0-3e968846db04",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T18:26:48.999Z"
                    },
                    {
                        "id": "c3caf13b-7c86-41fc-bfdc-7fda170e2ece",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T18:26:49.431387701Z"
                    },
                    {
                        "id": "7c4e8dd8-cfe9-4db5-8727-e36e21e86584",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T18:39:12.174Z"
                    },
                    {
                        "id": "af126b66-7cde-4637-b0e1-e74873ad50b9",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T18:43:53.911Z"
                    },
                    {
                        "id": "9f923eed-e7e9-4e95-90ac-17072644307d",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T18:58:00.273156316Z"
                    },
                    {
                        "id": "ee62da25-0d0b-4880-b8c7-2133240b67a8",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T18:58:00.785590905Z"
                    },
                    {
                        "id": "5053ddda-c1bb-4131-846e-df0f206cd93c",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T21:04:24.374689682Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:58:00.900839Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -110.95,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:58:00.900839Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:58:00.900839Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -6.39,
                                    "feePercentage": "3",
                                    "feeBaseValue": "213.06",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:58:00.900839Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:58:00.900839Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -14.91,
                                    "feePercentage": "7",
                                    "feeBaseValue": "213.06",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:58:00.900839Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 210.04,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:58:00.900839Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "5f5ca6d4-4475-4997-8abc-37c829344112",
                "shortId": "3590",
                "createdAt": "2026-11-08T18:20:03.740Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 168.9,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.59
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 25.33,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 20.33
                                }
                            ]
                        },
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                }
                            ]
                        }
                    ],
                    "totalValue": 39.32
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "PIX",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 147.16,
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 153.82,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 27.34
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -11.96
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 147.16
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.59
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -5.13
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "f8777124-2cad-43b1-8313-d02f4988a8bc",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T18:21:05.259Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "646dfcf2-b403-42d7-911a-0f7d80e31b20",
                                    "nsu": "CONCLUIDA",
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "5bdd165c-5df4-426a-93d1-acdd8eca46cc",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T18:21:06.758Z"
                    },
                    {
                        "id": "10785666-63f4-47aa-a335-e03226213d47",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T18:21:18.636Z"
                    },
                    {
                        "id": "f64bb5be-1fd6-489d-8e33-60fea49bc6e9",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T18:21:19.060856604Z"
                    },
                    {
                        "id": "5516c9de-4dc9-483a-972d-d8147e641a46",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T18:42:31.393Z"
                    },
                    {
                        "id": "6c97e765-4644-40dc-8512-08e7f22b2ba9",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T18:46:59.545Z"
                    },
                    {
                        "id": "e5939d63-5829-411e-a75c-49eb3cd355c0",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T18:54:28.018447854Z"
                    },
                    {
                        "id": "f6b164a9-db3b-4c25-af76-f8e2e3100ee7",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T18:54:28.530047146Z"
                    },
                    {
                        "id": "c506c446-1fe8-4cde-8bbb-ff80b8e37155",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T21:01:55.721991850Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:54:28.602187Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -11.96,
                                    "feePercentage": "7",
                                    "feeBaseValue": "170.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:54:28.602187Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:54:28.602187Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 20.33,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:54:28.602187Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:54:28.602187Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 147.16,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:54:28.602187Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.59,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:54:28.602187Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -5.13,
                                    "feePercentage": "3",
                                    "feeBaseValue": "170.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:54:28.602187Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "8381cf9e-d664-48f4-bce7-9fb15dbb3a00",
                "shortId": "2957",
                "createdAt": "2026-11-08T17:47:30.621Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 272,
                    "deliveryFee": 13.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 68,
                            "sponsorships": [
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 68
                                }
                            ]
                        },
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                }
                            ]
                        }
                    ],
                    "totalValue": 81.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "wallet": {
                                "name": "APPLE_PAY"
                            },
                            "method": "DIGITAL_WALLET",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 207.99,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "473264",
                                "nsu": "473264"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 189.91,
                    "billingEntries": [
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -6.33
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -14.77
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.01
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 207.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "bcec3418-5b35-4f7e-a1ea-dcefb6f2145f",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T17:47:33.110Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "dc3a3d80-fd24-4ccd-b398-9148736e293e",
                                    "nsu": "473264",
                                    "authCode": "473264"
                                }
                            ]
                        }
                    },
                    {
                        "id": "6deba5fd-7243-4aeb-8ea2-d77c0f6f407a",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T17:47:34.567Z"
                    },
                    {
                        "id": "fbd97377-36eb-49e1-b5d4-5f62df6a50e2",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T17:47:48.337Z"
                    },
                    {
                        "id": "a9cd2b34-8d61-42bc-aa61-727a05529efc",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T17:47:48.715862585Z"
                    },
                    {
                        "id": "8398369b-0138-4d0d-a55c-581f2bc07a5e",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T18:04:59.760Z"
                    },
                    {
                        "id": "4a8c3a1a-1936-44ad-820a-6740c3714c62",
                        "fullCode": "DISPATCHED",
                        "code": "DCL",
                        "createdAt": "2026-11-08T18:17:17.834Z"
                    },
                    {
                        "id": "ea0a7d06-ad62-4d5d-a0b8-ce37498f0e1f",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T18:25:57.258858366Z"
                    },
                    {
                        "id": "e6ecad05-6c89-4bd9-91ed-7a27055d75c0",
                        "fullCode": "CONCLUDED",
                        "code": "CON",
                        "createdAt": "2026-11-08T18:25:57.772709943Z"
                    },
                    {
                        "id": "2578816c-c4aa-496f-b839-7021cef0ea3a",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T20:35:40.466636062Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:25:57.860317Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -6.33,
                                    "feePercentage": "3",
                                    "feeBaseValue": "211.01",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:25:57.860317Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -14.77,
                                    "feePercentage": "7",
                                    "feeBaseValue": "211.01",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:25:57.860317Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:25:57.860317Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -68,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:25:57.860317Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:25:57.860317Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 207.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:25:57.860317Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "fe7c236b-f589-4294-8194-a7265bd7b637",
                "shortId": "4661",
                "createdAt": "2026-11-08T17:35:43.852Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CANCELLED",
                "merchant": {
                    "id": "14baa9b6-5c6c-429b-8a5e-cc4092c098c6",
                    "shortId": 51472,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 144.9,
                    "deliveryFee": 13.99,
                    "serviceFee": 0.00
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 6.98
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7.01
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 23.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "MERCHANT",
                        "deliveryProduct": "SELF_DELIVERY",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "PIX",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 138.52,
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 0.00,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 0.00
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": 0.00
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": 0.00
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 0.00
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": 0.00
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "13d3fff7-f7ce-4056-97e0-600575d1ccb9",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T17:36:25.509Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "d23e8ecf-8272-4926-b057-26d01b4cbb9f",
                                    "nsu": "CONCLUIDA",
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "de3f3f1b-1574-4105-a084-8ebb561066ef",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T17:36:26.945Z"
                    },
                    {
                        "id": "e4d0a74a-3d00-4c0b-ad13-f7f8a4254f3c",
                        "fullCode": "CANCEL",
                        "code": "CANC",
                        "createdAt": "2026-11-08T17:36:44.847642657Z"
                    },
                    {
                        "id": "e50d39de-6bb6-4520-bc88-cc6d7b075cdf",
                        "fullCode": "CANCELLED",
                        "code": "CAN",
                        "createdAt": "2026-11-08T17:36:44.869927761Z"
                    },
                    {
                        "id": "bf96b24b-6495-4bb7-bbbe-ad1216538e6a",
                        "fullCode": "REFUND",
                        "code": "RF",
                        "createdAt": "2026-11-08T17:36:44.921571642Z",
                        "metadata": {
                            "refund": {
                                "amount": 0,
                                "currency": "BRL",
                                "deadlineInMinutes": 0,
                                "category": "NO_REFUND_MERCHANT"
                            },
                            "payout": {
                                "id": "6c1cee03-a04d-43a7-b503-70fc4d01069b",
                                "type": "CREDIT",
                                "compensate": false,
                                "chargeback": true,
                                "category": "NO_REFUND_MERCHANT",
                                "amount": 138.52,
                                "currency": "BRL",
                                "creditType": "NA"
                            }
                        }
                    },
                    {
                        "id": "f86e368e-e68c-4817-8232-a4f27a0cc579",
                        "fullCode": "REFUND",
                        "code": "RF",
                        "createdAt": "2026-11-08T17:36:44.986730829Z",
                        "metadata": {
                            "refund": {
                                "amount": 138.52,
                                "originalAmount": 144.9,
                                "currency": "BRL",
                                "deadlineInMinutes": 0,
                                "category": "FULL_REFUND"
                            },
                            "cancelCode": 407
                        }
                    },
                    {
                        "id": "b6bb16c1-1a4a-453b-ad35-0c0cc553a161",
                        "fullCode": "REFUND_SUCCEEDED",
                        "code": "RFS",
                        "createdAt": "2026-11-08T17:42:26.949339065Z",
                        "metadata": {
                            "refundSource": "PAYMENT_SOURCE"
                        }
                    },
                    {
                        "id": "39c22cb7-662e-4a9d-a666-015f69b985a2",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T19:43:12.660223110Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CANCELLED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": 5,
                                    "cancellationCode": "407",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CANCELLED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": 6.98,
                                    "cancellationCode": "407",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CANCELLED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": -7.01,
                                    "cancellationCode": "407",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "NO_CONCLUDED_STATUS",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -10.28,
                                    "feePercentage": "7",
                                    "feeBaseValue": "146.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CANCELLED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": 3.62,
                                    "cancellationCode": "407",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CANCELLED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": 10.28,
                                    "feePercentage": "7",
                                    "feeBaseValue": "146.91",
                                    "cancellationCode": "407",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "NO_CONCLUDED_STATUS",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CANCELLED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": -5,
                                    "cancellationCode": "407",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "NO_CONCLUDED_STATUS",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "NO_CONCLUDED_STATUS",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CANCELLED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": -138.52,
                                    "cancellationCode": "407",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "NO_CONCLUDED_STATUS",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.41,
                                    "feePercentage": "3",
                                    "feeBaseValue": "146.91",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CANCELLED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": 4.41,
                                    "feePercentage": "3",
                                    "feeBaseValue": "146.91",
                                    "cancellationCode": "407",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "NO_CONCLUDED_STATUS",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.62,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "NO_CONCLUDED_STATUS",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -6.98,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "NO_CONCLUDED_STATUS",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 138.52,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:36:44.964706Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            }
        ],
        "total": 89,
        "pageCount": 5
    };

    // ceed5df7-a242-4f55-b893-9212a65716eb
    export const express = {
        "page": 1,
        "size": 20,
        "beginSalesDate": "2026-11-08",
        "endSalesDate": "2026-11-08",
        "sales": [
            {
                "id": "19313fef-ec35-4d78-a0c4-976446ecd93d",
                "shortId": "6700",
                "createdAt": "2026-11-08T23:45:26.706Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 82.9,
                    "deliveryFee": 11.99,
                    "serviceFee": -2.07
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 11.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 10
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 21.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 11.99,
                        "discount": 11.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "wallet": {
                                "name": "APPLE_PAY"
                            },
                            "method": "DIGITAL_WALLET",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 74.97,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "452868",
                                "nsu": "452868"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 64.08,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 17
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -1.87
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.07
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 74.97
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -11.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -4.97
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "c909fe7d-e03b-48b9-8509-4f4c0b564a61",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T23:45:28.968Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "6173d82a-4be1-43de-b9b0-42a76e5bf301",
                                    "nsu": "452868",
                                    "authCode": "452868"
                                }
                            ]
                        }
                    },
                    {
                        "id": "cfff02b3-c479-4ab7-9907-2b0b4118a816",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T23:45:30.286Z"
                    },
                    {
                        "id": "495abd00-fe4a-4ea2-bfd8-c0271bed438f",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T23:45:43Z"
                    },
                    {
                        "id": "3251bcaf-a2bf-4c7b-8921-a416f93a21ef",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T23:45:43.229Z"
                    },
                    {
                        "id": "12299e66-41d6-42d9-803e-c73b11945776",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T23:54:22.148294Z"
                    },
                    {
                        "id": "f4e9030b-9601-4004-8cb7-187f9589d2b2",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T23:54:22.150296Z"
                    },
                    {
                        "id": "e0ff884f-1919-4d91-b3fb-a091199d643e",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T23:54:23.228456413Z"
                    },
                    {
                        "id": "28b4077d-90e8-48b1-8a11-c1eb8b079406",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T23:54:23.242759655Z"
                    },
                    {
                        "id": "0f8e9db4-f64d-4020-966c-8d00a0f6e42a",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T23:58:58.877064Z"
                    },
                    {
                        "id": "4d6e5b74-7eab-4dc6-b55e-84a7815f6520",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-09T00:10:40.535Z"
                    },
                    {
                        "id": "1126caa5-c124-4665-a908-53db53df9c70",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-09T00:11:34.135162Z"
                    },
                    {
                        "id": "37e6fed8-ba33-474a-ba55-3f8a668773aa",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-09T00:16:28.720630Z"
                    },
                    {
                        "id": "0de59187-554e-4967-8a6e-dafcb6024ee1",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-09T00:18:55.596744841Z"
                    },
                    {
                        "id": "00f69feb-37a7-4860-8e44-e4a6335df670",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T06:10:27.821824678Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:19:57.118740Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -1.87,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "82.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:19:57.118740Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:19:57.118740Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.07,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:19:57.118740Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 74.97,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:19:57.118740Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -11.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:19:57.118740Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -4.97,
                                    "feePercentage": "6",
                                    "feeBaseValue": "82.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:19:57.118740Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "82.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:19:57.118740Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:19:57.118740Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "4867cc61-adcf-40a7-bb63-4a1370333397",
                "shortId": "7520",
                "createdAt": "2026-11-08T22:59:26.515Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 129.79,
                    "deliveryFee": 11.99,
                    "serviceFee": -2.49
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 11.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 7
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 11.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 11.99,
                        "discount": 11.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 132.28,
                            "card": {
                                "brand": "AMEX"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "692895",
                                "nsu": "254546285"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 107.10,
                    "billingEntries": [
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 132.28
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.49
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -2.92
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -11.99
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -7.79
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "8e0349a1-5e8d-45db-9f7c-e9669353cd12",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T22:59:29.493Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "372a17b4-cce4-4c83-90b4-c034370f0351",
                                    "nsu": "254546285",
                                    "authCode": "692895"
                                }
                            ]
                        }
                    },
                    {
                        "id": "d57f4cfa-c042-4f45-a65b-0c906c38b798",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T22:59:30.820Z"
                    },
                    {
                        "id": "e76ad519-abc4-43c3-be7c-5fa993fa3431",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T22:59:42Z"
                    },
                    {
                        "id": "e1fc3dfb-e611-43f1-8e84-f85b98190863",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T22:59:42.376Z"
                    },
                    {
                        "id": "6ba3886d-3447-4004-8341-50db321ee669",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T23:09:37.866532Z"
                    },
                    {
                        "id": "563642af-2d65-4bdb-9899-d8ee25cdaf7a",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T23:09:37.868534Z"
                    },
                    {
                        "id": "ca0ec815-f906-468a-87ed-f6f3ab2f5dd8",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T23:09:38.985959926Z"
                    },
                    {
                        "id": "8006e7f3-903d-422c-8dca-78c93e7107d3",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T23:09:38.999021358Z"
                    },
                    {
                        "id": "a64fa704-dbb6-453e-801a-7812639c07db",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T23:12:56.124454Z"
                    },
                    {
                        "id": "f69d6acf-4628-4df6-8013-49887ae5a889",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T23:21:50.599Z"
                    },
                    {
                        "id": "62a6e0a9-cb4f-4dc0-a3a9-9b426fb99468",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T23:24:28.068906Z"
                    },
                    {
                        "id": "a1f0bc75-3844-499a-bf09-1b2c0ab381d4",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T23:31:19.234832Z"
                    },
                    {
                        "id": "72773c9e-74f3-42d6-afdd-8a5b40b35cd1",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T23:32:01.287689223Z"
                    },
                    {
                        "id": "077c6b9c-3909-4a9e-be45-5716319cbd9e",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T04:10:51.493792957Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:32:05.384050Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 132.28,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:32:05.384050Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.49,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:32:05.384050Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -2.92,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "129.79",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:32:05.384050Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -11.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:32:05.384050Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "129.79",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:32:05.384050Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:32:05.384050Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -7.79,
                                    "feePercentage": "6",
                                    "feeBaseValue": "129.79",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:32:05.384050Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "112e163b-b372-47aa-9d5c-761ed48c2b22",
                "shortId": "3195",
                "createdAt": "2026-11-08T22:23:48.174Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 144.9,
                    "deliveryFee": 15.99,
                    "serviceFee": -3.62
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 15.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 9
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 6.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 10
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 25.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 15.99,
                        "discount": 15.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 138.52,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "635201",
                                "nsu": "878398519"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 114.96,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 16.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.26
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.62
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -8.69
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -15.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 138.52
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -8.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "c86b5c25-6a31-411f-bb32-75a1a687a40a",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T22:23:52.655Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "75c13221-e42d-43f0-80c2-ed4d6e5eab63",
                                    "nsu": "878398519",
                                    "authCode": "635201"
                                }
                            ]
                        }
                    },
                    {
                        "id": "4fb4658c-1127-4ec6-bc43-e1d8f2204a9b",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T22:23:53.776Z"
                    },
                    {
                        "id": "d679cea1-3917-4424-897e-e8ea63fda14f",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T22:24:10.794Z"
                    },
                    {
                        "id": "ac9c1b91-b724-4e89-a624-131009026073",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T22:24:11Z"
                    },
                    {
                        "id": "cf1e8e6b-7dfa-4c33-beed-1639d06c4735",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T22:33:32.005809Z"
                    },
                    {
                        "id": "c9ed0473-391a-4d60-87d6-e02ee662715e",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T22:33:32.007811Z"
                    },
                    {
                        "id": "851cb379-7dcf-4435-93b1-4dc3a28e6866",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T22:33:36.479113233Z"
                    },
                    {
                        "id": "d752688c-43d3-42cb-a257-c82f7f617800",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T22:33:36.493145837Z"
                    },
                    {
                        "id": "2a637a35-47d5-4ac6-9e4a-9b5a08e7f3d7",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T22:36:08.372Z"
                    },
                    {
                        "id": "5c740f2d-5d2f-4749-8e76-21f7f7ae22bb",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T22:49:32.335261Z"
                    },
                    {
                        "id": "7d4c1eb9-4d8f-431b-ad4f-3023ec5a6bb4",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T22:49:48.350313Z"
                    },
                    {
                        "id": "b03e664d-5313-4c36-a0aa-06ee1cab812f",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T22:57:40.707697Z"
                    },
                    {
                        "id": "8de631c0-7f8a-4e29-b2d9-658ab1d856b9",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T22:58:14.509527262Z"
                    },
                    {
                        "id": "2a7f8871-65e4-40f9-be0a-78f4c6afdce8",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T02:36:09.528856290Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:58:17.955193Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 6.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:58:17.955193Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -9,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:58:17.955193Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.26,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:58:17.955193Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.62,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:58:17.955193Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -8.69,
                                    "feePercentage": "6",
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:58:17.955193Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -15.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:58:17.955193Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 138.52,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:58:17.955193Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -8.99,
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T22:58:17.955193Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "7bd1eee3-02d3-47b2-bbf1-0e3914986f93",
                "shortId": "1907",
                "createdAt": "2026-11-08T21:03:42.983Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 175.9,
                    "deliveryFee": 8.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 8.99,
                            "sponsorships": [
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 3.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                }
                            ]
                        }
                    ],
                    "totalValue": 8.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 8.99,
                        "discount": 8.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "PIX",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 179.89,
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 150.40,
                    "billingEntries": [
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.96
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 3.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -10.55
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -8.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 179.89
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -5.99
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "24e1c3ee-6082-4090-beb2-988f4a4998c8",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T21:04:40.694Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "b4a2ff81-ee12-4d67-815c-7f23afff5067",
                                    "nsu": "CONCLUIDA",
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "cd76ccd6-295c-483b-8741-0f4c52854335",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T21:04:41.916Z"
                    },
                    {
                        "id": "2ff55c20-f880-405a-b192-db4bd4c7122f",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T21:05:16Z"
                    },
                    {
                        "id": "93cce935-518f-49fb-80ba-a5b5abb29a82",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T21:05:16.043Z"
                    },
                    {
                        "id": "4d96445c-dd3e-4600-a80a-7cf8f8879f43",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T21:13:30.195761Z"
                    },
                    {
                        "id": "c03750c8-9792-4775-a2f8-260005b29544",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T21:13:30.197763Z"
                    },
                    {
                        "id": "740f700f-32c5-4c36-8042-d6607b4a1c92",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T21:13:31.260320912Z"
                    },
                    {
                        "id": "4e258de5-9451-4add-9eae-6de118ecce86",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T21:13:31.277932555Z"
                    },
                    {
                        "id": "692c2f0e-0db8-4ad3-a36f-1e196a37ee4d",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T21:17:52.566370Z"
                    },
                    {
                        "id": "a443b0ac-e0e6-42f5-a18d-96309840e1eb",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T21:19:32.826Z"
                    },
                    {
                        "id": "536eb600-3d38-4924-be8a-91c5c9545d90",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T21:26:15.679964Z"
                    },
                    {
                        "id": "c5c7bff2-85ef-46c7-9acb-290e493a8090",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T21:29:32.493802Z"
                    },
                    {
                        "id": "147e3897-da95-4b53-bb1e-71259513a03c",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T21:33:04.568029699Z"
                    },
                    {
                        "id": "d8fc52fa-1d2f-4b35-abd4-8d88f87ee0de",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T00:10:32.478945293Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.96,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "175.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:33:23.391998Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:33:23.391998Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:33:23.391998Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -10.55,
                                    "feePercentage": "6",
                                    "feeBaseValue": "175.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:33:23.391998Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -8.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:33:23.391998Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 179.89,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:33:23.391998Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -5.99,
                                    "feeBaseValue": "175.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:33:23.391998Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:33:23.391998Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "b5ab551c-21d9-43bc-9aa7-d7484c9ffe6b",
                "shortId": "4747",
                "createdAt": "2026-11-08T19:59:21.129Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 144.9,
                    "deliveryFee": 10.99,
                    "serviceFee": -3.62
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 10
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 20.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "BANK_PAY",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 138.52,
                            "card": {
                                "brand": "NUBANK"
                            },
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 121.96,
                    "billingEntries": [
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 15.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -8.69
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 138.52
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.62
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -5.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.26
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "318d8e83-4006-46d3-ac15-967b211a3ffc",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T19:59:53.100Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "73705f71-9ef9-45c8-81d7-6fbf48a20a72",
                                    "nsu": null,
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "7a22a0fe-b141-4d9d-a6b1-d46339afa00b",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T19:59:54.553Z"
                    },
                    {
                        "id": "50774208-6178-4454-9c95-0a9954ec68d7",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T20:00:11.494Z"
                    },
                    {
                        "id": "5f0fcfa2-3a0d-4170-89aa-0547bbb66e28",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T20:00:12Z"
                    },
                    {
                        "id": "adc5b722-2e6b-4736-ab53-c97fc0895a78",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T20:03:56.182365Z"
                    },
                    {
                        "id": "b0285e6f-2c09-49fe-a0b4-78b3abba6ad6",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T20:03:56.184367Z"
                    },
                    {
                        "id": "ea6f6c48-fe5a-45bd-b491-b491504bdd61",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T20:03:57.396283815Z"
                    },
                    {
                        "id": "edc38be2-a0bd-491f-9d3e-bd81916d39bb",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T20:03:57.412766467Z"
                    },
                    {
                        "id": "0691a596-0352-473e-a301-9f044ceba86d",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T20:09:31.005947Z"
                    },
                    {
                        "id": "d709cf94-82c5-4673-a751-d759b936ef7c",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T20:21:05.403Z"
                    },
                    {
                        "id": "d15d2385-b87f-4e7c-9997-0b7793caac9c",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T20:24:02.531771Z"
                    },
                    {
                        "id": "d5b47aa7-65d4-4579-9a6b-930e861f26e7",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T20:29:35.349879Z"
                    },
                    {
                        "id": "ea6562d9-dad5-4527-b798-2c1b9a2f3d75",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T20:30:39.181694546Z"
                    },
                    {
                        "id": "011911a2-907c-42e2-b2c5-cb5263695cbe",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T22:42:52.060872875Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:30:44.794386Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:30:44.794386Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:30:44.794386Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:30:44.794386Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -8.69,
                                    "feePercentage": "6",
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:30:44.794386Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 138.52,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:30:44.794386Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.62,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:30:44.794386Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -5.99,
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:30:44.794386Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.26,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T20:30:44.794386Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "421e7f8e-0575-4adb-940b-f78a41114586",
                "shortId": "7762",
                "createdAt": "2026-11-08T17:58:06.825Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 203.4,
                    "deliveryFee": 11.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 11.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                }
                            ]
                        }
                    ],
                    "totalValue": 11.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 11.99,
                        "discount": 11.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 207.39,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "56LTUY",
                                "nsu": "502243103"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 174.64,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 207.39
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -4.58
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -11.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -12.2
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "3842a4e0-af83-4e65-aaa8-8d4801038da5",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T17:58:10.490Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "e48c526b-3c97-44f1-b5be-869415afaf8c",
                                    "nsu": "502243103",
                                    "authCode": "56LTUY"
                                }
                            ]
                        }
                    },
                    {
                        "id": "8ac9eaae-52be-4443-bec8-ef71dfb368b2",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T17:58:11.464Z"
                    },
                    {
                        "id": "a1410030-1636-418e-8575-ec24fc595d53",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T17:58:40.431Z"
                    },
                    {
                        "id": "9a36c93e-609e-4530-ac2d-18876f02c60f",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T17:58:41Z"
                    },
                    {
                        "id": "6782af3c-ba4f-4929-803b-bc24d11d2e62",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T18:06:14.202373Z"
                    },
                    {
                        "id": "6aa10aaa-3635-43cf-9a83-75ba19a568f4",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T18:06:14.204374Z"
                    },
                    {
                        "id": "86267ac6-d605-4d41-82d0-33cb8ba5b94d",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T18:06:15.569010999Z"
                    },
                    {
                        "id": "a06c32f0-63d9-4764-9943-ae9b3248ffd6",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T18:06:15.591367387Z"
                    },
                    {
                        "id": "2ec9ef0e-2111-4e42-a481-a215557efed9",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T18:07:21.839Z"
                    },
                    {
                        "id": "5b8368a8-842c-4a35-980d-136ce1a2e916",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T18:09:48.268972Z"
                    },
                    {
                        "id": "36206846-03b0-4402-9613-d51d4764cd7f",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T18:09:56.225200Z"
                    },
                    {
                        "id": "2adc74de-3d95-4758-ad03-65f845e39914",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T18:21:56.698390Z"
                    },
                    {
                        "id": "157722b6-c4d0-46e3-b52f-85beff69f626",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T18:23:25.610649994Z"
                    },
                    {
                        "id": "ee4b3be3-2f44-4baf-9fc7-4be3cc07d0e5",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T20:34:34.604582684Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:23:35.684579Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:23:35.684579Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 207.39,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:23:35.684579Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:23:35.684579Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.58,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "203.4",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:23:35.684579Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "203.4",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:23:35.684579Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -11.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:23:35.684579Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -12.2,
                                    "feePercentage": "6",
                                    "feeBaseValue": "203.4",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:23:35.684579Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "d220eff7-6155-4bca-88a9-f0976fe1462d",
                "shortId": "8799",
                "createdAt": "2026-11-08T17:33:58.003Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 150.9,
                    "deliveryFee": 10.99,
                    "serviceFee": -3.77
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "ITEM",
                            "value": 0,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 10.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "PIX",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 154.67,
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 127.46,
                    "billingEntries": [
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -9.05
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.4
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -5.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 5.99
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.77
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 154.67
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "bde91fe5-2689-4bc1-96b1-7ab2d7165770",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T17:34:30.722Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "552b2936-3d7c-452d-bfbd-be5b2778da83",
                                    "nsu": "CONCLUIDA",
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "1555dcfa-f93c-435c-912d-5522897c73d1",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T17:34:32.154Z"
                    },
                    {
                        "id": "f2ca27a3-3be4-4993-b01c-196fe04af93a",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T17:34:39.703Z"
                    },
                    {
                        "id": "0cd79cc6-9aec-47eb-89bf-7331f7da9b2f",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T17:34:40Z"
                    },
                    {
                        "id": "4bbe02a9-dfce-4538-a7f0-9d33df620b0c",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T17:43:18.777226Z"
                    },
                    {
                        "id": "b360f8f5-4ae7-4b49-85ff-1890ee293a24",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T17:43:18.779229Z"
                    },
                    {
                        "id": "27a387a3-3d80-48de-bbb0-f54f74b565e4",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T17:43:19.837050914Z"
                    },
                    {
                        "id": "fee7050c-6c83-4ee8-aa51-6db7f9da503a",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T17:43:19.850021356Z"
                    },
                    {
                        "id": "fc135fee-c308-4186-b813-3e95fd7cb4cf",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T17:43:59.220032Z"
                    },
                    {
                        "id": "dd7b3328-d206-4709-8e5c-8392a4f5f237",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T17:45:32.393Z"
                    },
                    {
                        "id": "164e4a15-9ff9-46bc-a5c0-05bf027da38b",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T17:47:38.930672Z"
                    },
                    {
                        "id": "e7363f0c-0379-47d9-83c4-87e767cccebd",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T17:53:35.819259Z"
                    },
                    {
                        "id": "da5c2a19-4d37-49ce-9ba0-2c2312810b4f",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T17:54:32.638184537Z"
                    },
                    {
                        "id": "e3b4c5bb-3245-413a-927a-cfd27c507869",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T19:58:56.081197737Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -9.05,
                                    "feePercentage": "6",
                                    "feeBaseValue": "150.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:54:37.357895Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.4,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "150.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:54:37.357895Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:54:37.357895Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -5.99,
                                    "feeBaseValue": "150.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:54:37.357895Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:54:37.357895Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.77,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:54:37.357895Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:54:37.357895Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 154.67,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:54:37.357895Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "bcb88e59-776d-4ac9-ba08-9383b38161c1",
                "shortId": "3660",
                "createdAt": "2026-11-08T17:28:25.632Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 144.9,
                    "deliveryFee": 10.99,
                    "serviceFee": -3.62
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 10.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "PIX",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 148.52,
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "",
                                "nsu": ""
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 120.96,
                    "billingEntries": [
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.62
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 148.52
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 5.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -8.69
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.26
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "b62e99cd-177f-4d76-bcc1-85499012b8b3",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T17:31:22.455Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "4a463687-57bd-4d39-9e54-6042019dad14",
                                    "nsu": "",
                                    "authCode": ""
                                }
                            ]
                        }
                    },
                    {
                        "id": "6775d917-2aa6-4939-a4ed-b82e8ca3487f",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T17:31:23.834Z"
                    },
                    {
                        "id": "ea88ed90-06c6-4d0b-ac06-b90fdad6a81a",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T17:31:39.883Z"
                    },
                    {
                        "id": "2d7f2ebc-b443-4acc-9dfc-b3cfb7946ce0",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T17:31:40Z"
                    },
                    {
                        "id": "ea82495f-9b27-4cec-848d-1d9e8588ee11",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T17:35:55.003851Z"
                    },
                    {
                        "id": "99cc5749-cf9d-47d6-ac59-be444f9cd406",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T17:35:55.005853Z"
                    },
                    {
                        "id": "d1bd4b9d-8872-4450-9dce-2d7954418cc8",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T17:35:56.150554138Z"
                    },
                    {
                        "id": "ff927046-fd58-4d01-a2c2-b9a79efa5554",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T17:35:56.163628276Z"
                    },
                    {
                        "id": "a58aa418-e16a-415d-857f-628be1539ff3",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T17:38:20.563355Z"
                    },
                    {
                        "id": "d1b93526-898b-40f9-a3d5-1a5a3e4a1792",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T17:43:06.709Z"
                    },
                    {
                        "id": "6cf511c4-c7d8-42fd-a61d-2aa2d4895ffd",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T17:47:31.289884Z"
                    },
                    {
                        "id": "d49c8575-7e58-417a-abde-755c3d0ee1d8",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T17:55:25.453894Z"
                    },
                    {
                        "id": "c23ed6f6-5783-4992-b60d-ee6b0dca9378",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T17:56:38.350790333Z"
                    },
                    {
                        "id": "18bbc15e-75c7-44df-8689-97a732205dfc",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T20:08:15.817391445Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.62,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:56:42.084981Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 148.52,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:56:42.084981Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:56:42.084981Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:56:42.084981Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:56:42.084981Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -8.69,
                                    "feePercentage": "6",
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:56:42.084981Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.26,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:56:42.084981Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:56:42.084981Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "51322049-b516-440a-9fb7-82d71ae6cd08",
                "shortId": "2637",
                "createdAt": "2026-11-08T16:59:58.814Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 289.8,
                    "deliveryFee": 11.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 11.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 11.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 11.99,
                        "discount": 11.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 293.79,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "9Q3LL6",
                                "nsu": "000000655858"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 253.91,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -6.52
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 293.79
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -17.39
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -11.99
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "f2cea037-33b1-4645-b038-a571b5a6aff4",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T17:00:01.584Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "b031980f-a431-4b38-9e19-49d930885286",
                                    "nsu": "000000655858",
                                    "authCode": "9Q3LL6"
                                }
                            ]
                        }
                    },
                    {
                        "id": "8a452ab0-dd9e-4c2d-bc9c-5fa4a6d6b529",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T17:00:02.947Z"
                    },
                    {
                        "id": "13f9f4e6-4de4-4b63-8f53-9ad9469802be",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T17:00:19.374Z"
                    },
                    {
                        "id": "7445dd43-1de6-4485-b94a-7d5e5fe2bff2",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T17:00:20Z"
                    },
                    {
                        "id": "e8c36648-fe37-4950-871f-ba9e90895462",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T17:15:27.561623Z"
                    },
                    {
                        "id": "fd2edae8-d42f-4810-a332-b626bee4b511",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T17:15:27.563626Z"
                    },
                    {
                        "id": "30b085cc-c405-44b7-81ba-ba9e9530a912",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T17:15:28.612530955Z"
                    },
                    {
                        "id": "65ea0d1a-8ede-4b96-9694-f1aea12a4794",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T17:15:28.628144206Z"
                    },
                    {
                        "id": "18381a73-e997-4298-af7b-3e7635bd9f1e",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T17:16:36.894Z"
                    },
                    {
                        "id": "bd6d5d26-b7b6-49a1-9272-c8cffe66688a",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T17:17:51.920542Z"
                    },
                    {
                        "id": "07b76336-0b21-4ef4-ac8f-36028879b61e",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T17:18:24.296673Z"
                    },
                    {
                        "id": "d124ed11-a125-416c-a1e4-d29ff5dd2572",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T17:31:42.136985Z"
                    },
                    {
                        "id": "fb5ee4b1-fd3c-4b94-b1d3-80dfa96d5bcd",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T17:34:46.325951953Z"
                    },
                    {
                        "id": "6a1fef4f-926d-4a57-b1c6-1c679f71407f",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T19:34:44.083958551Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:35:46.110554Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:35:46.110554Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -6.52,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "289.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:35:46.110554Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:35:46.110554Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 293.79,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:35:46.110554Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -17.39,
                                    "feePercentage": "6",
                                    "feeBaseValue": "289.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:35:46.110554Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -11.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:35:46.110554Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "289.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:35:46.110554Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "b6ddd83a-840e-4545-b8b3-4f92505fb671",
                "shortId": "7679",
                "createdAt": "2026-11-08T16:41:13.111Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 186.9,
                    "deliveryFee": 11.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 11.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 11.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 11.99,
                        "discount": 11.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 190.89,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "611486",
                                "nsu": "000114431756"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 159.50,
                    "billingEntries": [
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -11.21
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -11.99
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -4.21
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 190.89
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "0a20d428-b4d7-400a-8d71-1d044a6a1dfd",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T16:41:15.360Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "90f7dbd1-fe7f-47c7-a350-b862fe1fdc5a",
                                    "nsu": "000114431756",
                                    "authCode": "611486"
                                }
                            ]
                        }
                    },
                    {
                        "id": "2596a5d0-b885-469e-a535-37a3af68c28d",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T16:41:16.453Z"
                    },
                    {
                        "id": "a70ea04e-6835-4f6c-807f-56499994d052",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T16:41:40Z"
                    },
                    {
                        "id": "dc187da4-4f35-463c-9179-137a21280cd3",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T16:41:40.030Z"
                    },
                    {
                        "id": "0d23e0bf-a466-48ea-a9ea-1e084cf2ae7c",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T16:46:34.751330Z"
                    },
                    {
                        "id": "3b5ebd4d-fd5b-4750-ab33-a357c781104b",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T16:46:34.753332Z"
                    },
                    {
                        "id": "6b86bd57-6306-4064-a96e-a087e29b2bd4",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T16:46:36.052945990Z"
                    },
                    {
                        "id": "4b7b5dbe-9d1c-4a99-9229-4c478a32d329",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T16:46:36.070962226Z"
                    },
                    {
                        "id": "ae6ec148-ff28-4699-be5e-37dfd532bd4c",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:52:45.417500Z"
                    },
                    {
                        "id": "f96c60f4-d884-4495-a96a-4ff5e8078419",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T17:00:54.825Z"
                    },
                    {
                        "id": "ed2672ff-7ead-4140-831e-3209b1b6ddd6",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T17:03:44.526633Z"
                    },
                    {
                        "id": "362317d6-56dc-4b0c-8d00-7d3e60afa686",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T17:12:48.727851Z"
                    },
                    {
                        "id": "6dfba8e8-9dae-4611-b012-9dceb0168be1",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T17:13:41.678070197Z"
                    },
                    {
                        "id": "62b8c107-f042-42da-a4aa-440966a0be14",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T19:07:15.509530590Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -11.21,
                                    "feePercentage": "6",
                                    "feeBaseValue": "186.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:13:46.343608Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -11.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:13:46.343608Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:13:46.343608Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:13:46.343608Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:13:46.343608Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.21,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "186.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:13:46.343608Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "186.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:13:46.343608Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 190.89,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:13:46.343608Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "9dc04a77-5758-4f37-a3ec-b7f42c12e9c5",
                "shortId": "4184",
                "createdAt": "2026-11-08T16:36:01.379Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 89.9,
                    "deliveryFee": 10.99,
                    "serviceFee": -2.25
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 10.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "wallet": {
                                "name": "APPLE_PAY"
                            },
                            "method": "DIGITAL_WALLET",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 92.15,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "5YD6A4",
                                "nsu": "5YD6A4"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 71.50,
                    "billingEntries": [
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -5.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -2.02
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.25
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -5.39
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 5.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 92.15
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "0c2f6d88-5be3-4d62-9993-a00a5309868e",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T16:36:04.324Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "545ab8d2-816f-428c-bfd8-84613eb1bb81",
                                    "nsu": "5YD6A4",
                                    "authCode": "5YD6A4"
                                }
                            ]
                        }
                    },
                    {
                        "id": "1818aa9e-4314-469d-b01b-20cba45f3bad",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T16:36:05.297Z"
                    },
                    {
                        "id": "a40ea958-ce93-4a25-8174-b50aa903703f",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T16:36:39.601Z"
                    },
                    {
                        "id": "0c121173-17f9-4ecc-9131-d97388e51aeb",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T16:36:40Z"
                    },
                    {
                        "id": "839eec37-fa57-434a-8401-3df09f990c41",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T16:42:25.197982Z"
                    },
                    {
                        "id": "d068237f-7fe5-470f-a5dc-4ca1cd33746f",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T16:42:25.199983Z"
                    },
                    {
                        "id": "1373b4ce-aa45-4c9c-8de4-08c6363f681d",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T16:42:26.362592200Z"
                    },
                    {
                        "id": "e8244268-1d23-4184-93b1-4b9422a0d6e3",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T16:42:26.375229014Z"
                    },
                    {
                        "id": "4b8e5d67-0a4c-475b-808f-015f81fc4514",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:45:07.720698Z"
                    },
                    {
                        "id": "591ff4f5-91dc-4906-91b6-23ed36a4b48b",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T16:49:31.748Z"
                    },
                    {
                        "id": "843ca351-70e9-4fb9-9630-08bba7f69d95",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:50:27.195297Z"
                    },
                    {
                        "id": "ad300fb3-d40e-48e3-825c-03ad787c5e66",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T17:02:12.477702Z"
                    },
                    {
                        "id": "4c77defc-8b29-4bf8-a713-9655d5b65f25",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T17:02:59.094023757Z"
                    },
                    {
                        "id": "1f11fc1c-ea3b-4125-937e-54b79c698abd",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T18:46:13.749601751Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -5.99,
                                    "feeBaseValue": "89.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:03:03.000770Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -2.02,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "89.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:03:03.000770Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.25,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:03:03.000770Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -5.39,
                                    "feePercentage": "6",
                                    "feeBaseValue": "89.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:03:03.000770Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:03:03.000770Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:03:03.000770Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:03:03.000770Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 92.15,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:03:03.000770Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "8422ff1c-4afb-42b6-a3ac-8dcc4975e98f",
                "shortId": "4794",
                "createdAt": "2026-11-08T16:20:12.470Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 82.9,
                    "deliveryFee": 10.99,
                    "serviceFee": -2.07
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 10
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 20.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 74.97,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "201463",
                                "nsu": "000014664704"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 64.07,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 15.99
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.07
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -1.87
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 74.97
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -4.97
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "31ef82c7-bf02-4486-be5a-29ab4a939cae",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T16:20:15.022Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "4c39c027-d857-42a0-87c8-d8e5fe7db2cc",
                                    "nsu": "000014664704",
                                    "authCode": "201463"
                                }
                            ]
                        }
                    },
                    {
                        "id": "0815a0e6-96e9-4dd3-a535-7508a73f85cd",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T16:20:16.184Z"
                    },
                    {
                        "id": "3be0cd94-8c5b-4173-8dad-46159900d0d8",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T16:20:40.790Z"
                    },
                    {
                        "id": "1a64537f-7f42-4824-9895-dcabab5d79d2",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T16:20:41Z"
                    },
                    {
                        "id": "24e05c48-423c-4572-9ff5-f4342e87b861",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T16:28:13.957476Z"
                    },
                    {
                        "id": "074aee31-faa3-4c66-85c2-e11bc95c63d6",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T16:28:13.959477Z"
                    },
                    {
                        "id": "2aff04c5-23f6-45d4-b480-295413b0eeb2",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T16:28:15.035841545Z"
                    },
                    {
                        "id": "ecfe9499-28ce-48b0-bb0d-735c0ae9a2d3",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T16:28:15.064085059Z"
                    },
                    {
                        "id": "3086d044-4a05-4ec8-9218-f494d86b88fe",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:30:58.411813Z"
                    },
                    {
                        "id": "9e383556-66ed-402a-b62d-5f0b750c1430",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T16:41:59.797Z"
                    },
                    {
                        "id": "930ee0a7-c476-4f58-ae14-a12e51081ec2",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:43:27.772357Z"
                    },
                    {
                        "id": "7a53c241-8095-49df-8ca9-65c72031a5a3",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:55:48.884305Z"
                    },
                    {
                        "id": "bb68a2ab-c634-424e-adba-2f59ad387a72",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:56:14.398606209Z"
                    },
                    {
                        "id": "6042d7f0-ad4b-460f-996d-d86739b707b7",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T18:36:23.020932149Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:32.858380Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:32.858380Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.07,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:32.858380Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -1.87,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "82.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:32.858380Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 74.97,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:32.858380Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:32.858380Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:32.858380Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "82.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:32.858380Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -4.97,
                                    "feePercentage": "6",
                                    "feeBaseValue": "82.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:32.858380Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "383d12aa-2f43-4e82-a735-295911458d54",
                "shortId": "6029",
                "createdAt": "2026-11-08T16:15:45.296Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 82.9,
                    "deliveryFee": 10.99,
                    "serviceFee": -2.07
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 12,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 12
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 22.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 72.97,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "264493",
                                "nsu": "000546668912"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 64.07,
                    "billingEntries": [
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -1.87
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 17.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -4.97
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 72.97
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.07
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "3d3551b9-c46e-4c35-b6bb-47e8ae105c39",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T16:15:48.240Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "4aa89268-1ed7-4eab-a7e9-0019fb15e643",
                                    "nsu": "000546668912",
                                    "authCode": "264493"
                                }
                            ]
                        }
                    },
                    {
                        "id": "f81b8a33-cf68-42ec-b2d2-818a595ff1d2",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T16:15:49.463Z"
                    },
                    {
                        "id": "d78994a8-ad7d-4eb4-8b7e-adea191527b6",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T16:16:08Z"
                    },
                    {
                        "id": "c42299b7-705a-4374-9699-5e3caed6a8a7",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T16:16:08.058Z"
                    },
                    {
                        "id": "40ea3e8c-20fb-4d7f-9737-93cdf523683f",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T16:25:23.288315Z"
                    },
                    {
                        "id": "85e53c92-0842-4f70-94d0-54e2764610d5",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T16:25:23.290317Z"
                    },
                    {
                        "id": "a952a6b0-b3a6-46ba-bce3-b0eec1438453",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T16:25:24.455731179Z"
                    },
                    {
                        "id": "11fcdbd8-4090-48e1-899a-caa1a1ef74d8",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T16:25:24.480033945Z"
                    },
                    {
                        "id": "5a191018-316e-49ff-8814-eaba813bb8fc",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:28:46.641711Z"
                    },
                    {
                        "id": "4bc03c24-2644-4150-bf88-a7edd69ba1d9",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T16:41:30.390Z"
                    },
                    {
                        "id": "7feae6d2-b456-414c-b795-be1025cc8b46",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:43:54.553944Z"
                    },
                    {
                        "id": "e7a18fd4-836e-41fa-9774-e84669161284",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:55:14.121835Z"
                    },
                    {
                        "id": "39986f55-ad67-4100-a628-1432566ebfdb",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:56:20.340408266Z"
                    },
                    {
                        "id": "8791e030-f5fb-43e1-83e7-97c418469963",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T18:35:09.347569120Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -1.87,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "82.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:24.797405Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "82.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:24.797405Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:24.797405Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:24.797405Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -4.97,
                                    "feePercentage": "6",
                                    "feeBaseValue": "82.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:24.797405Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 72.97,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:24.797405Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:24.797405Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.07,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:24.797405Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 12,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:24.797405Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "445e4a44-1250-4414-bd44-1c95d119d087",
                "shortId": "9306",
                "createdAt": "2026-11-08T16:10:56.078Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 220.8,
                    "deliveryFee": 12.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 12.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 8
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 12.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 12.99,
                        "discount": 12.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 224.79,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 190.60,
                    "billingEntries": [
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 224.79
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 8
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -4.97
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -12.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -13.25
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "ecea9c88-b5e5-49bc-ae30-c6863e688329",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T16:10:57.664Z"
                    },
                    {
                        "id": "0ad41c0d-d6a4-46f1-8a7c-1d9ebf27c00b",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T16:11:08.701Z"
                    },
                    {
                        "id": "76f06da3-97bf-4874-b305-c555209a2de9",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T16:11:09Z"
                    },
                    {
                        "id": "f1be4f09-4872-4af7-aa29-745ab53710cc",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T16:25:29.749621Z"
                    },
                    {
                        "id": "28c17090-0fe4-49bd-9036-7e0c18c5ef8d",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T16:25:29.751622Z"
                    },
                    {
                        "id": "40d22331-42e6-4070-9b36-9ca132eb9847",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T16:25:30.872837494Z"
                    },
                    {
                        "id": "36819c73-8791-41f3-a557-16605afdb75e",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T16:25:30.884205864Z"
                    },
                    {
                        "id": "8b2e0c8e-6fd7-46f0-a7fc-316fe01c1af3",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T16:37:37.034Z"
                    },
                    {
                        "id": "79f458b2-3e08-4f3b-a7fc-a73d29d9210e",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:38:21.031130Z"
                    },
                    {
                        "id": "ed2c664b-5016-4b35-8b33-cf672f69c230",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:43:37.202857Z"
                    },
                    {
                        "id": "2370fd56-97ed-4c86-b040-4e1ba5c0bf58",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:55:45.814509Z"
                    },
                    {
                        "id": "29d128a8-e10d-4ef3-afda-620a2d0c814a",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:57:13.553263891Z"
                    },
                    {
                        "id": "3e32cbc1-3972-47ba-94b4-7fd42e5814a0",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T18:39:16.455381647Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:57:17.326660Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 224.79,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:57:17.326660Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:57:17.326660Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 8,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:57:17.326660Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "220.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:57:17.326660Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.97,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "220.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:57:17.326660Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -12.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:57:17.326660Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -13.25,
                                    "feePercentage": "6",
                                    "feeBaseValue": "220.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:57:17.326660Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "06d90956-ab95-4668-a37c-f52fed9a3ebb",
                "shortId": "8488",
                "createdAt": "2026-11-08T16:04:41.032Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 89.9,
                    "deliveryFee": 10.99,
                    "serviceFee": -2.25
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 15,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 15
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 25.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 77.15,
                            "card": {
                                "brand": "ELO"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "143080",
                                "nsu": "501647397"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 71.50,
                    "billingEntries": [
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -2.02
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 20.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 77.15
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.25
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -5.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -5.39
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "67d436fe-3a6d-499c-95b1-e30323d82887",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T16:04:43.572Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "170ddd21-b752-4ccf-90cb-4673d9b09365",
                                    "nsu": "501647397",
                                    "authCode": "143080"
                                }
                            ]
                        }
                    },
                    {
                        "id": "4751d127-d326-4ddb-9020-2d3e04ca5cf2",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T16:04:44.532Z"
                    },
                    {
                        "id": "c568de04-8696-4641-935c-e60ed226549f",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T16:05:05.370Z"
                    },
                    {
                        "id": "846417ff-7b03-424f-8732-bb1a7eaac9d3",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T16:05:06Z"
                    },
                    {
                        "id": "4c552f17-d7d1-486d-8971-a99de5db6a47",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T16:14:24.147730Z"
                    },
                    {
                        "id": "d209eb20-7e79-4f7c-9e25-148eca021875",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T16:14:24.149731Z"
                    },
                    {
                        "id": "a099ec7d-11f4-4133-acaa-bca3ee3bf21f",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T16:14:25.333130020Z"
                    },
                    {
                        "id": "068e6c0e-d681-4251-b9af-71696f92d630",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T16:14:25.363230830Z"
                    },
                    {
                        "id": "3f45b45c-d1f9-4e9e-86ba-d08fb972ebc5",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:16:50.543402Z"
                    },
                    {
                        "id": "2351b737-2ddf-47f9-8f64-f7da12b66498",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T16:21:53.575034Z"
                    },
                    {
                        "id": "096b9f98-3f38-47ef-b5c1-fbb030a420e1",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T16:21:53.577036Z"
                    },
                    {
                        "id": "53410a41-c7cc-4bb4-9ea9-623bedcb9883",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T16:23:56.074Z"
                    },
                    {
                        "id": "a1a7c05f-216d-4666-ab1b-56db12b3aa8a",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:30:02.898226Z"
                    },
                    {
                        "id": "08d7b653-4cbe-4000-98e6-51eb40c48d32",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:30:08.594742Z"
                    },
                    {
                        "id": "9914807a-1476-4970-aa44-cdd62bb428f5",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:36:00.110210Z"
                    },
                    {
                        "id": "8304e5c7-4f2e-408e-ad52-ede7d039b131",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:38:24.540754422Z"
                    },
                    {
                        "id": "5cc0edce-d7bd-4970-b058-1d9787424337",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T18:10:57.113582156Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -2.02,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "89.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:38:28.899801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 15,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:38:28.899801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:38:28.899801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 77.15,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:38:28.899801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:38:28.899801Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.25,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:38:28.899801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -5.99,
                                    "feeBaseValue": "89.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:38:28.899801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:38:28.899801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -5.39,
                                    "feePercentage": "6",
                                    "feeBaseValue": "89.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:38:28.899801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "9627d73d-6653-4129-b34d-53d6e4a583d8",
                "shortId": "0508",
                "createdAt": "2026-11-08T16:02:21.502Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 150.9,
                    "deliveryFee": 12.99,
                    "serviceFee": -3.77
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 12.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 8
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "ITEM",
                            "value": 0,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 10
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 22.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 12.99,
                        "discount": 12.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "BANK_PAY",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 144.67,
                            "card": {
                                "brand": "NUBANK"
                            },
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 126.47,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 18
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 144.67
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.77
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.4
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -9.05
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -12.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "c9382b13-ca66-489c-94e2-4bad99f9e523",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T16:02:40.882Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "d818611c-7e3e-44d7-943f-7187b1b6f899",
                                    "nsu": null,
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "e4c73250-8356-4885-a788-f58332633210",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T16:02:42.237Z"
                    },
                    {
                        "id": "8b9f305a-aec4-4a3f-8026-110792352a53",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T16:03:08Z"
                    },
                    {
                        "id": "b65f31fd-9101-4e3b-8297-748268f60a3a",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T16:03:08.140Z"
                    },
                    {
                        "id": "15091085-2c55-4b75-8adb-31fcd660d83e",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T16:19:59.565Z"
                    },
                    {
                        "id": "26ac4b3f-cc70-441a-91a5-7c7eafd2902a",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T16:23:19.810128Z"
                    },
                    {
                        "id": "4811ef09-a0e3-4c85-865f-9e8462a9796e",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T16:23:19.812130Z"
                    },
                    {
                        "id": "124a6493-4e6b-444d-a67a-03c43511338b",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T16:23:20.914435677Z"
                    },
                    {
                        "id": "68b828aa-9c81-49fd-abbc-07d64e4e886a",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T16:23:20.928514272Z"
                    },
                    {
                        "id": "742a4907-f891-48ae-b82c-80b364c7376c",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:27:27.585421Z"
                    },
                    {
                        "id": "ee5f0eec-9dfa-4577-9257-1988ce692ace",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:27:47.122516Z"
                    },
                    {
                        "id": "161270b5-20a4-4e81-a446-6fd9732a5402",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:34:39.028081Z"
                    },
                    {
                        "id": "849bdd45-3fde-4a09-8e57-5e3d2b782d63",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:35:49.401845409Z"
                    },
                    {
                        "id": "64770030-3021-4a55-b41d-6d71f5f2ee3e",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T18:07:59.513816180Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 8,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:35:53.132046Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:35:53.132046Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 144.67,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:35:53.132046Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.77,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:35:53.132046Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:35:53.132046Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.4,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "150.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:35:53.132046Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -9.05,
                                    "feePercentage": "6",
                                    "feeBaseValue": "150.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:35:53.132046Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "150.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:35:53.132046Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -12.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:35:53.132046Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "4d673c9f-271d-47fc-89e7-c18d36a63a21",
                "shortId": "4362",
                "createdAt": "2026-11-08T15:38:30.447Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 174.8,
                    "deliveryFee": 8.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 8.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 3.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 10
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 18.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 8.99,
                        "discount": 8.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "MEAL_VOUCHER",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 168.79,
                            "card": {
                                "brand": "IFOOD_MEAL_VOUCHER"
                            },
                            "liability": "MERCHANT_IFOOD_BENEFICIOS"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 149.39,
                    "billingEntries": [
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -5.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 13.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.93
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -10.49
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 168.79
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -8.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "96a4ea1a-edda-4ef0-a486-4bade195d37b",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T15:38:31.348Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "4c6a49a5-ee5e-499b-adf2-ab6972e7edd2",
                                    "nsu": null,
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "5fd84453-2558-4ef7-9e94-0d256eae7fd2",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T15:38:32.552Z"
                    },
                    {
                        "id": "24762e8e-b6b3-4327-ad77-4588d81865f2",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T15:38:38.516Z"
                    },
                    {
                        "id": "d9368401-245f-419a-89a0-c42cd74f5bf3",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T15:38:39Z"
                    },
                    {
                        "id": "85794ca0-5d30-4308-9596-b50d3cb800b4",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T15:45:08.307570Z"
                    },
                    {
                        "id": "d2f90d9c-90b3-4133-b857-b18154e4ea4e",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T15:45:08.309571Z"
                    },
                    {
                        "id": "d3ca476f-8fdd-4962-a957-6c37ed3441c1",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T15:45:09.522038897Z"
                    },
                    {
                        "id": "bb67e4db-24cf-4321-8f9c-733080a50ddf",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T15:45:09.536960498Z"
                    },
                    {
                        "id": "10129912-2f34-4fbc-bc96-b923309ca49b",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T15:47:18.688612Z"
                    },
                    {
                        "id": "aede3bc1-0f5c-4af1-97f3-a19668cbfeca",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T16:03:29.259Z"
                    },
                    {
                        "id": "67c60d0b-f5d4-46e3-b8cf-096428f1ae97",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:05:49.349740Z"
                    },
                    {
                        "id": "d544d065-2968-45a8-ab65-dfd58d078363",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:09:23.275876Z"
                    },
                    {
                        "id": "8e19acf4-a0dc-454f-ab0d-c153fe4276a9",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:11:46.126153398Z"
                    },
                    {
                        "id": "1a5abe15-b933-4249-8741-f3f7760c0887",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T17:34:22.777629946Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -5.99,
                                    "feeBaseValue": "174.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:11:52.088853Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:11:52.088853Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.93,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "174.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:11:52.088853Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -10.49,
                                    "feePercentage": "6",
                                    "feeBaseValue": "174.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:11:52.088853Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:11:52.088853Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:11:52.088853Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 168.79,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:11:52.088853Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:11:52.088853Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -8.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:11:52.088853Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "e285300b-96a3-473a-9ca5-4522ece6b1ce",
                "shortId": "2990",
                "createdAt": "2026-11-08T15:35:20.434Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 144.9,
                    "deliveryFee": 11.99,
                    "serviceFee": -3.62
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 11.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7
                                }
                            ]
                        }
                    ],
                    "totalValue": 11.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 11.99,
                        "discount": 11.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "wallet": {
                                "name": "MOVILE_PAY"
                            },
                            "method": "DIGITAL_WALLET",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 42.7,
                            "card": {
                                "brand": "MOVILE_PAY"
                            },
                            "liability": "MOVILE_PAY"
                        },
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 105.82,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "041011",
                                "nsu": "751457573"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 120.97,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.62
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 148.52
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -8.69
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.26
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -11.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "49e158e6-e950-4a30-9e4f-cb460743a083",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T15:35:26.417Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "4b9d285c-2c70-462e-86fe-26ca33d57d26",
                                    "nsu": null,
                                    "authCode": null
                                },
                                {
                                    "paymentId": "37bc2449-ddb8-4839-a893-15d2c9aff099",
                                    "nsu": "751457573",
                                    "authCode": "041011"
                                }
                            ]
                        }
                    },
                    {
                        "id": "eb8a73f9-f5e5-486d-a5cb-c9f287ceb359",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T15:35:27.793Z"
                    },
                    {
                        "id": "08100205-1b8d-4f0d-8052-d5c46585db9d",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T15:35:39Z"
                    },
                    {
                        "id": "0bef31b0-1a09-4ed3-8f7c-97acf636af96",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T15:35:39.060Z"
                    },
                    {
                        "id": "09b3726f-be70-4fbe-9dde-0c9a7e181f94",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T15:43:18.853134Z"
                    },
                    {
                        "id": "40153d7f-7598-44c6-8508-5ea14f0fbb5d",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T15:43:18.855136Z"
                    },
                    {
                        "id": "c4b2686e-7335-476d-8b86-039a05facc2d",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T15:43:20.002606834Z"
                    },
                    {
                        "id": "1bba9117-fe02-47f7-91bf-e0988cecba36",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T15:43:20.016381675Z"
                    },
                    {
                        "id": "a66c3a62-709e-40e8-a5f2-bcff68c3bbc1",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T15:45:48.295273Z"
                    },
                    {
                        "id": "efcbf9a6-5467-4287-bb5b-0bc915d9b67a",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T15:45:48.297275Z"
                    },
                    {
                        "id": "3cda20b1-2e37-48b8-be23-9cc51c9781fa",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T15:51:45.494Z"
                    },
                    {
                        "id": "72e4e268-c9d5-4d83-9a8e-a22bcc2d4e91",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T15:52:34.334793Z"
                    },
                    {
                        "id": "509a9dd0-2fe2-4f6e-a361-0e45f555d671",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T15:59:45.052438Z"
                    },
                    {
                        "id": "56c93e96-e947-4c7b-b42b-809746b9ce08",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:06:33.573138Z"
                    },
                    {
                        "id": "580559fb-883c-495c-bbd0-4c99c1684aa3",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:07:21.075342813Z"
                    },
                    {
                        "id": "c15e79c0-4aa4-4d45-bc0d-a70e7ab9d246",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T17:33:00.759491291Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:07:26.116644Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.62,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:07:26.116644Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:07:26.116644Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 105.82,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:07:26.116644Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -8.69,
                                    "feePercentage": "6",
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:07:26.116644Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.26,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:07:26.116644Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "144.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:07:26.116644Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -11.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:07:26.116644Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 42.7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:07:26.116644Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "7a12c082-37b8-42bb-8914-a056c57b8688",
                "shortId": "8723",
                "createdAt": "2026-11-08T15:31:34.214Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 242.6,
                    "deliveryFee": 12.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 12.99,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 8
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 12.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 12.99,
                        "discount": 12.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 246.59,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "313669",
                                "nsu": "000135650512"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 210.60,
                    "billingEntries": [
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -14.56
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 8
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 246.59
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -5.46
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -12.99
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "16cc19db-bb83-4ec6-9afd-90e85f31e1e3",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T15:31:36.779Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "9a1f24a4-a778-462d-9b2f-eac2625bfd6e",
                                    "nsu": "000135650512",
                                    "authCode": "313669"
                                }
                            ]
                        }
                    },
                    {
                        "id": "016e6804-7311-4af2-a8db-ed435913cc6d",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T15:31:38.018Z"
                    },
                    {
                        "id": "5cb86289-3daf-4614-9c1d-54565262029e",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T15:32:07.836Z"
                    },
                    {
                        "id": "1653adf2-c1ce-46e1-8f98-9825ae3f6a57",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T15:32:08Z"
                    },
                    {
                        "id": "a23d92cb-f22d-467d-a4db-b79d8b81a60a",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T15:50:38.746Z"
                    },
                    {
                        "id": "3e2984ab-b31f-49a8-8161-b4ffa6f040d3",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T15:56:51.513872Z"
                    },
                    {
                        "id": "3177e545-71c4-47ff-b351-7ba85e88d7e4",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T15:56:51.515874Z"
                    },
                    {
                        "id": "5b6898f8-cbd3-4eb7-afb4-f7efdffb179a",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T15:56:52.548236504Z"
                    },
                    {
                        "id": "9fa79719-7878-43cd-a993-1b180fcc677e",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T15:56:52.563567552Z"
                    },
                    {
                        "id": "079fd500-2836-4972-b486-890ff7035868",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:04:19.958007Z"
                    },
                    {
                        "id": "a4296675-a02a-47ec-b124-6fec0051c871",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:04:40.006427Z"
                    },
                    {
                        "id": "7fcb685f-fc7c-41bf-9f4c-936e28941e20",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:14:54.763781Z"
                    },
                    {
                        "id": "75134b54-adf7-4ae6-b437-297101cc467a",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:16:25.733757294Z"
                    },
                    {
                        "id": "f4ed6fd4-396e-4023-931f-a456d631216d",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T17:43:16.377174264Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -14.56,
                                    "feePercentage": "6",
                                    "feeBaseValue": "242.6",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:16:29.787801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 8,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:16:29.787801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:16:29.787801Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:16:29.787801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 246.59,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:16:29.787801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -5.46,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "242.6",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:16:29.787801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -12.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:16:29.787801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "242.6",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:16:29.787801Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "66f6d82d-bb83-4f34-9bb2-ff8046f1cfeb",
                "shortId": "3193",
                "createdAt": "2026-11-08T15:25:45.020Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "ceed5df7-a242-4f55-b893-9212a65716eb",
                    "shortId": 3172935,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Coco Bambu Express - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 354.58,
                    "deliveryFee": 17.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 11.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 7
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "ITEM",
                            "value": 0,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 11.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "PRIORITY",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 17.99,
                        "discount": 11.99,
                        "netValue": 6
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 364.57,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "727146",
                                "nsu": "751445055"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 313.35,
                    "billingEntries": [
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -21.27
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 364.57
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -17.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -7.98
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "54709830-2889-47e2-be58-ca5c573f173b",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T15:25:48.545Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "9ecf7480-93bb-4f07-a4fa-2240eb0ea55d",
                                    "nsu": "751445055",
                                    "authCode": "727146"
                                }
                            ]
                        }
                    },
                    {
                        "id": "6810fbea-c09d-48cd-be31-b5f4f464432c",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T15:25:49.537Z"
                    },
                    {
                        "id": "5d2dfde9-fd8e-49be-a6bd-65d7ce49c95d",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T15:26:07.927Z"
                    },
                    {
                        "id": "233a58a7-0dd4-4cde-a615-67c8cc2eb7ea",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T15:26:08Z"
                    },
                    {
                        "id": "694f7fd5-2875-4e6f-bf79-88c05030e25d",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T15:28:47.816590Z"
                    },
                    {
                        "id": "b046795e-898c-4152-990a-a17fa76f4318",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T15:28:47.818593Z"
                    },
                    {
                        "id": "a551cd0b-e3c4-4fb6-a537-9ec6a30b0641",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T15:28:48.927265427Z"
                    },
                    {
                        "id": "27e84b20-92a6-4899-8d23-a498c463ca41",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T15:28:48.944641619Z"
                    },
                    {
                        "id": "c00661cf-1de8-45ac-97ee-c055348d85ae",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T15:40:39.517505Z"
                    },
                    {
                        "id": "844a9924-0dd1-4f8a-ba34-1dfc14c9f8a5",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T15:42:53.523Z"
                    },
                    {
                        "id": "ca27773d-ff61-4102-92d9-729bf64a1399",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T15:50:30.547610Z"
                    },
                    {
                        "id": "38c8f26e-8ef2-4358-81bb-1126b39c5eb0",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:00:52.578128Z"
                    },
                    {
                        "id": "893ed2b1-c378-4a4a-adad-55791fc02d1e",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:01:27.111267160Z"
                    },
                    {
                        "id": "7848fde4-bbe4-4bd9-b60c-1fafb86b2911",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T17:24:22.466201982Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -21.27,
                                    "feePercentage": "6",
                                    "feeBaseValue": "354.58",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:01:51.115641Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 364.57,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:01:51.115641Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:01:51.115641Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -17.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:01:51.115641Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:01:51.115641Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -7.98,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "354.58",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:01:51.115641Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "354.58",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:01:51.115641Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:01:51.115641Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            }
        ],
        "total": 29,
        "pageCount": 2
    };

    // 6802ef48-dec5-426e-81d6-a6f654100f0a
    export const confeitaria = {};

    // 0c781bcf-a53b-4d05-8881-f74476abae96
    export const daniCozinha = {
        "page": 1,
        "size": 1,
        "beginSalesDate": "2026-11-08",
        "endSalesDate": "2026-11-08",
        "sales": [
            {
                "id": "005fe505-1115-4251-b109-bd96f62539cf",
                "shortId": "4371",
                "createdAt": "2026-11-08T17:19:00.756Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "0c781bcf-a53b-4d05-8881-f74476abae96",
                    "shortId": 3273868,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        }
                    ],
                    "name": "Dani Cozinha Brasileira - Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 35.8,
                    "deliveryFee": 13.99,
                    "serviceFee": -0.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 13.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 8.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 30,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 30
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 43.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 13.99,
                        "discount": 13.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 6.79,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "224246",
                                "nsu": "876944541"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 15.86,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 35
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -0.81
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -13.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 6.79
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -7.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -2.15
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -0.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "ee3135cf-950a-4bb0-ae78-95d762b9bd6f",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T17:19:06.354Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "ea0273fb-e867-4df0-82fa-e92de7e329b1",
                                    "nsu": "876944541",
                                    "authCode": "224246"
                                }
                            ]
                        }
                    },
                    {
                        "id": "3307b140-5e5f-4035-b5fb-f017a4a0a905",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T17:19:07.563Z"
                    },
                    {
                        "id": "c86bbc18-69b1-4301-ac1d-affaecedb393",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T17:19:41.100Z"
                    },
                    {
                        "id": "9952a703-8a0a-4102-8b64-dae4fd23b027",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T17:28:05.176Z"
                    },
                    {
                        "id": "4167fced-a877-42cb-b156-ac3d7854f8ab",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T17:28:59.333556Z"
                    },
                    {
                        "id": "40d270fa-07cf-4400-aee1-c25c6a6bb1ba",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T17:28:59.335559Z"
                    },
                    {
                        "id": "39f8b3cf-de03-4a0c-b41e-ee1de2ff18be",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T17:29:00.411208845Z"
                    },
                    {
                        "id": "1fcd1d85-3649-42fc-a2e9-001f70dd2ca1",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T17:29:00.423762265Z"
                    },
                    {
                        "id": "2c8de52e-bb9e-4d1f-81d9-49b29e3acb1a",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T17:45:08.501860Z"
                    },
                    {
                        "id": "fc88000a-cedc-46bf-af8f-65a7c3cb19a8",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T17:45:08.503861Z"
                    },
                    {
                        "id": "3a73a87f-6fb6-4821-a153-15faf50c1c02",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T17:53:09.436875Z"
                    },
                    {
                        "id": "a4cf055a-3227-4de7-be00-17c5e10e07ae",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T17:53:33.594573Z"
                    },
                    {
                        "id": "d432dfcf-c03e-4569-ad16-5192f1626fa2",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T18:05:25.210471Z"
                    },
                    {
                        "id": "374e51c1-83ff-41a7-9c3c-336af827722d",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T18:06:55.476628081Z"
                    },
                    {
                        "id": "6e91e7d0-dbd2-44f2-ae21-b6b0a96dcfa9",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T20:12:36.758836227Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:07:00.252535Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 30,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:07:00.252535Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -8.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:07:00.252535Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -0.81,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "35.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:07:00.252535Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -13.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:07:00.252535Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 6.79,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:07:00.252535Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -7.99,
                                    "feeBaseValue": "35.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:07:00.252535Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -2.15,
                                    "feePercentage": "6",
                                    "feeBaseValue": "35.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:07:00.252535Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -0.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:07:00.252535Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            }
        ],
        "total": 1,
        "pageCount": 1
    };

    // 196290ea-537b-4caf-938d-c2f57e68011d
    export const pizzariaExpress = {};

    // aa5dcb37-dfaf-4442-b5dc-ef69637f73ad
    export const vasto = {
        "page": 1,
        "size": 11,
        "beginSalesDate": "2026-11-08",
        "endSalesDate": "2026-11-08",
        "sales": [
            {
                "id": "40a53227-7aa9-4c4a-a966-64910a43a22e",
                "shortId": "3770",
                "createdAt": "2026-11-09T00:23:00.536Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 108.01,
                    "deliveryFee": 10.99,
                    "serviceFee": -2.7
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 12,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 2
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 10
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 22.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 98.71,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "006543",
                                "nsu": "000302813836"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 77.93,
                    "billingEntries": [
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.7
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -2.21
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 98.71
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -5.88
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "a879a38f-7872-4ed3-8f26-520aaf5fccf3",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-09T00:23:03.613Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "6e8b2eab-c739-4a29-b079-9b0b691a964f",
                                    "nsu": "000302813836",
                                    "authCode": "006543"
                                }
                            ]
                        }
                    },
                    {
                        "id": "4ef5f5e0-d15a-4e0f-8760-0ad9866681de",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-09T00:23:04.664Z"
                    },
                    {
                        "id": "0e5e6042-8fc1-4c40-b670-f98d64675561",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-09T00:23:21.906Z"
                    },
                    {
                        "id": "e00a7dba-1408-420b-9037-4b9d58b241fb",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-09T00:23:22Z"
                    },
                    {
                        "id": "8a310396-d31a-4a18-903b-90fcedc01d6f",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-09T00:35:47.417808Z"
                    },
                    {
                        "id": "7e86c3c1-48cb-44d1-ba29-341c53394ed8",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-09T00:35:47.419811Z"
                    },
                    {
                        "id": "c545816e-47f5-43c9-9d93-a139a31d8986",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-09T00:35:48.554527584Z"
                    },
                    {
                        "id": "75ca6bcd-2c33-45aa-ab37-ef34f57bf93c",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-09T00:35:48.568996384Z"
                    },
                    {
                        "id": "186c0c1e-0bdc-492a-95aa-c5e8fc1275e3",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-09T00:38:28.498466Z"
                    },
                    {
                        "id": "e214ce62-aefe-4a02-87bc-8b9dd5a9e502",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-09T00:42:45.677Z"
                    },
                    {
                        "id": "031ffcd8-3d34-44c2-a203-a355032937de",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-09T00:43:50.952684Z"
                    },
                    {
                        "id": "898e2b8a-1086-42a4-8726-a926d4503f20",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-09T00:51:19.785015Z"
                    },
                    {
                        "id": "538d9b6c-172d-49c5-bea0-4cc856a1b2ef",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-09T00:51:35.193232783Z"
                    },
                    {
                        "id": "23980c6b-c744-48f6-8f41-5d2d8db4fd98",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T07:14:27.778823365Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:51:44.550410Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:51:44.550410Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "98.01",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:51:44.550410Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -2.21,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "98.01",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:51:44.550410Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 98.71,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:51:44.550410Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 2,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:51:44.550410Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:51:44.550410Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:51:44.550410Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:51:44.550410Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -5.88,
                                    "feePercentage": "6",
                                    "feeBaseValue": "98.01",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-09T00:51:44.550410Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "408176c6-a106-441d-8b03-6fa9c6471b30",
                "shortId": "8354",
                "createdAt": "2026-11-08T22:19:17.430Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 128.9,
                    "deliveryFee": 21.99,
                    "serviceFee": -2.72
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 20.1,
                            "sponsorships": [
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 15.1
                                }
                            ]
                        }
                    ],
                    "totalValue": 20.1
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 21.99,
                        "discount": 0,
                        "netValue": 21.99
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 133.51,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "883959",
                                "nsu": "000919764022"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 104.69,
                    "billingEntries": [
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -21.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 133.51
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -7.43
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -2.79
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 15.1
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -8.99
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.72
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "e3ab338a-fcc4-49e0-91a7-b8ee1c7d6f31",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T22:19:20.732Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "c0f72b31-445c-4371-9116-8c5a0dcf2f25",
                                    "nsu": "000919764022",
                                    "authCode": "883959"
                                }
                            ]
                        }
                    },
                    {
                        "id": "8312ab70-9ca3-46b2-ad39-0c030d420da4",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T22:19:21.881Z"
                    },
                    {
                        "id": "baa766fc-16d7-49d3-bef4-80b4b52865ec",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T22:19:46.354Z"
                    },
                    {
                        "id": "0cc4c05d-3a2c-4b86-99d9-0b7a7fabce33",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T22:19:47Z"
                    },
                    {
                        "id": "3251bebd-398b-4e35-892f-59effd768058",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T22:36:06.053Z"
                    },
                    {
                        "id": "dc9abbd3-ad82-45a6-acaa-48f2829891a9",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T22:53:40.749316Z"
                    },
                    {
                        "id": "1fc11206-991c-40b1-81bb-dbd60198fcb9",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T22:53:40.751317Z"
                    },
                    {
                        "id": "38ea1417-a7dc-4e24-bab7-3e07830d106d",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T22:53:41.956525319Z"
                    },
                    {
                        "id": "2185aa08-1d48-48a6-a774-a68668aa0c22",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T22:53:41.986199092Z"
                    },
                    {
                        "id": "3a72f953-662c-4614-8beb-5aad6b6afbe9",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T22:57:54.945318Z"
                    },
                    {
                        "id": "3778e21c-abfd-470d-8cc8-29344602ad9b",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T22:58:05.964685Z"
                    },
                    {
                        "id": "b5490828-b8ef-4d89-aa77-3ff491caf9eb",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T23:11:25.465536Z"
                    },
                    {
                        "id": "3d278426-8cc4-45c0-8e83-f571a09e841f",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T23:13:23.461346642Z"
                    },
                    {
                        "id": "1a2b2b5a-a724-4273-9576-6ca78bb56773",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T03:18:02.948290940Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -21.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:13:30.444976Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:13:30.444976Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 133.51,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:13:30.444976Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -7.43,
                                    "feePercentage": "6",
                                    "feeBaseValue": "123.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:13:30.444976Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -2.79,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "123.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:13:30.444976Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 15.1,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:13:30.444976Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -8.99,
                                    "feeBaseValue": "123.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:13:30.444976Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.72,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:13:30.444976Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "8ad259a4-97ad-4503-bd26-0d0140f05a3b",
                "shortId": "1636",
                "createdAt": "2026-11-08T18:41:45.066Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 117,
                    "deliveryFee": 8.99,
                    "serviceFee": -2.93
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 8.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 8.99
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 10,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 10
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 18.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 8.99,
                        "discount": 8.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 109.93,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "C3MVBG",
                                "nsu": "877285671"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 83.19,
                    "billingEntries": [
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -2.41
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.93
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 109.93
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -5.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -6.42
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -8.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "5f19ce3e-d86b-42f9-9c62-53dcac46a5e1",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T18:41:51.348Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "535af03e-63b5-4b52-966d-06a0f46dd289",
                                    "nsu": "877285671",
                                    "authCode": "C3MVBG"
                                }
                            ]
                        }
                    },
                    {
                        "id": "7da520b1-3ca8-4771-9129-f7f591e493ce",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T18:41:52.471Z"
                    },
                    {
                        "id": "8e7b7231-7e31-464d-b4e9-cb23bc933415",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T18:42:10.692Z"
                    },
                    {
                        "id": "dec3ee5d-005a-4ba7-8225-96258139261b",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T18:42:11Z"
                    },
                    {
                        "id": "29e70ade-9b85-446a-ae21-4380675fbe25",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T18:53:15.375Z"
                    },
                    {
                        "id": "9ba9d8d2-f5c7-43c4-817c-9c25aa19ace5",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T18:54:24.214192Z"
                    },
                    {
                        "id": "84df0ac5-9dd2-4a3a-8a75-b63344a6887e",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T18:54:24.216195Z"
                    },
                    {
                        "id": "1b120584-aac8-42e0-9653-2632804969df",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T18:54:25.352356035Z"
                    },
                    {
                        "id": "4b0d0150-5161-4de3-aba9-33eebb704f5f",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T18:54:25.366883775Z"
                    },
                    {
                        "id": "e6ece9c8-0cee-4fc4-86b3-b75e8a6304d4",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T19:01:43.470853Z"
                    },
                    {
                        "id": "7f71c715-3924-463e-96e8-43123040320f",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T19:03:15.705720Z"
                    },
                    {
                        "id": "60866eea-7365-40a7-8e60-3eac3afe2e13",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T19:07:40.384030Z"
                    },
                    {
                        "id": "5f1b7a55-8ab3-427d-869f-bdbeec74c0c4",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T19:08:16.681225463Z"
                    },
                    {
                        "id": "02ceb4c7-7509-4896-87f1-8a2d0ad72d99",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T21:19:56.327881138Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -2.41,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "107",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:08:20.129915Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.93,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:08:20.129915Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 109.93,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:08:20.129915Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -8.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:08:20.129915Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -5.99,
                                    "feeBaseValue": "107",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:08:20.129915Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -6.42,
                                    "feePercentage": "6",
                                    "feeBaseValue": "107",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:08:20.129915Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -8.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:08:20.129915Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T19:08:20.129915Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "5a30a76f-2318-4c52-b6f4-2aa709e4f028",
                "shortId": "5083",
                "createdAt": "2026-11-08T17:36:55.964Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 69.8,
                    "deliveryFee": 10.99,
                    "serviceFee": -1.75
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 12,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 2
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 10
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 22.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 59.55,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "960034",
                                "nsu": "000657451771"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 43.87,
                    "billingEntries": [
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -5.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -3.59
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -1.35
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 59.55
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -1.75
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "d8591fdf-bb9e-40c9-9aa8-a6a9f25ddeaa",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T17:36:58.808Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "fe20e54d-619b-4f72-9a16-0c60f5d23ae6",
                                    "nsu": "000657451771",
                                    "authCode": "960034"
                                }
                            ]
                        }
                    },
                    {
                        "id": "e76eac68-f161-4da4-929e-51a1e64d0e6a",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T17:37:00.176Z"
                    },
                    {
                        "id": "7a6b65e5-03a4-4495-82af-1e76bc08aa73",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T17:37:13Z"
                    },
                    {
                        "id": "cc7b7150-a52e-4b94-aaae-2224fff2ef63",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T17:37:13.180Z"
                    },
                    {
                        "id": "45304a19-24ed-41bf-bb56-cc1fd9280678",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T17:44:20.688226Z"
                    },
                    {
                        "id": "e6597403-b4c3-438f-8fa0-de182cab615e",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T17:44:20.690227Z"
                    },
                    {
                        "id": "3f240706-872a-4700-b03d-f3cb5f96e951",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T17:44:21.734312033Z"
                    },
                    {
                        "id": "f407f2a1-bb53-4d57-a4cb-22e2b34779d9",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T17:44:21.746417267Z"
                    },
                    {
                        "id": "e2ef58b1-244b-45fa-b354-45f2bca5f7d9",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T17:46:36.397199Z"
                    },
                    {
                        "id": "acedf08a-aa72-45c0-b9e3-afe007acc841",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T18:02:26.341Z"
                    },
                    {
                        "id": "6a21554f-abdc-4775-980e-b1fd5e9e6f06",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T18:08:21.683882Z"
                    },
                    {
                        "id": "dbf91de3-a1f7-425b-abfc-76456f19dfcb",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T18:13:51.545022Z"
                    },
                    {
                        "id": "a2a14529-3272-4284-8b42-1362a7b55949",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T18:15:03.899684149Z"
                    },
                    {
                        "id": "2a026a43-26df-4ffa-8be0-343bfb9fc4fb",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T20:28:12.626943977Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -5.99,
                                    "feeBaseValue": "59.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:15:07.493177Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:15:07.493177Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:15:07.493177Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -3.59,
                                    "feePercentage": "6",
                                    "feeBaseValue": "59.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:15:07.493177Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:15:07.493177Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:15:07.493177Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 2,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:15:07.493177Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -1.35,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "59.8",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:15:07.493177Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 59.55,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:15:07.493177Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -1.75,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T18:15:07.493177Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "028f5e1b-b475-4044-a731-66d9bd92a9e7",
                "shortId": "5080",
                "createdAt": "2026-11-08T16:53:34.430Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 143.8,
                    "deliveryFee": 10.99,
                    "serviceFee": -3.33
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 10.78,
                            "sponsorships": [
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.79
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                }
                            ]
                        },
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                }
                            ]
                        }
                    ],
                    "totalValue": 21.77
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "wallet": {
                                "name": "APPLE_PAY"
                            },
                            "method": "DIGITAL_WALLET",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 136.35,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "633575",
                                "nsu": "633575"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 115.37,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 11.78
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.12
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 136.35
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.33
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -8.33
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "3aa50689-238b-453f-bbcc-1d8b7dfdfad2",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T16:53:36.436Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "1e949bb0-4bfd-4b15-95d3-0944a18b87f0",
                                    "nsu": "633575",
                                    "authCode": "633575"
                                }
                            ]
                        }
                    },
                    {
                        "id": "edb37dfa-0369-4f79-95ff-ca431c7f9404",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T16:53:37.749Z"
                    },
                    {
                        "id": "7ed3bd70-f9e4-4c25-9f2f-250580fc732f",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T16:54:08Z"
                    },
                    {
                        "id": "f2ea5368-ef01-43f3-ac20-255e50857bfc",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T16:54:08.178Z"
                    },
                    {
                        "id": "08f0ee6d-6209-4e68-a6f4-cf41ef1c8b36",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T17:06:07.810613Z"
                    },
                    {
                        "id": "3f899a3d-4417-4185-a9fe-08724ccdf7c1",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T17:06:07.812614Z"
                    },
                    {
                        "id": "c40b8222-8568-4e61-92ab-67a1d4bf5cfb",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T17:06:08.976797389Z"
                    },
                    {
                        "id": "72ba1ad7-e2c9-4314-8f25-e0249abd0804",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T17:06:08.992400404Z"
                    },
                    {
                        "id": "0a585785-4975-4991-bfa8-287ab18839b3",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T17:08:43.645692Z"
                    },
                    {
                        "id": "45a52509-583c-4675-95c3-47e4573051db",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T17:09:02.841Z"
                    },
                    {
                        "id": "221cfc25-0005-4b21-9259-96d529116534",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T17:11:23.447955Z"
                    },
                    {
                        "id": "db08d1a2-f699-4f79-8e69-ded949cf7941",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T17:17:18.194761Z"
                    },
                    {
                        "id": "fd3092ba-e469-48d3-b919-faf046cc18c4",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T17:18:10.163241645Z"
                    },
                    {
                        "id": "c6bf8646-5a62-473b-bcd3-2ce30f5b576e",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T19:10:12.141208233Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:18:13.760880Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.12,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "138.81",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:18:13.760880Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:18:13.760880Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.79,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:18:13.760880Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 136.35,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:18:13.760880Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:18:13.760880Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "138.81",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:18:13.760880Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:18:13.760880Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.33,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:18:13.760880Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -8.33,
                                    "feePercentage": "6",
                                    "feeBaseValue": "138.81",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:18:13.760880Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "29a929bf-4e33-4c6a-81a9-5d3d02bf46ec",
                "shortId": "3538",
                "createdAt": "2026-11-08T16:30:11.914Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 117,
                    "deliveryFee": 17.99,
                    "serviceFee": -2.93
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 11.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 7
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 12,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 12
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 23.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "PRIORITY",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 17.99,
                        "discount": 11.99,
                        "netValue": 6
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "MEAL_VOUCHER",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 113.93,
                            "card": {
                                "brand": "TICKET"
                            },
                            "liability": "MERCHANT",
                            "transaction": {
                                "authCode": "bae05070-a25c-4e09-b565-7c519e9f0ecd",
                                "nsu": "482934"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": -27.14,
                    "billingEntries": [
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -6.3
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.93
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 7
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -17.99
                        },
                        {
                            "name": "REFUND_SERVICE_FEE",
                            "value": 0.07
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "23cbbc7e-a25c-4d25-bd6e-65934ae1a71d",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T16:30:14.076Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "765c827d-b99a-4b43-a5e2-cd2a7c294718",
                                    "nsu": "482934",
                                    "authCode": "bae05070-a25c-4e09-b565-7c519e9f0ecd"
                                }
                            ]
                        }
                    },
                    {
                        "id": "a03a5622-5173-47e4-b0cb-1a974a85e608",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T16:30:15.189Z"
                    },
                    {
                        "id": "9873ca3f-cf3e-4456-b02a-4e828fb8e4d2",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T16:30:41.870Z"
                    },
                    {
                        "id": "3db95232-21ea-4964-9073-5c9ee90ca682",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T16:30:42Z"
                    },
                    {
                        "id": "0f109844-72d7-4dd4-8c63-4eb9ddba45a4",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T16:39:17.343551Z"
                    },
                    {
                        "id": "d00779e8-3104-4557-a71d-ab695f65ac56",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T16:39:17.345553Z"
                    },
                    {
                        "id": "b485b646-97b9-445f-b101-ed1f9539e6d4",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T16:39:18.431260272Z"
                    },
                    {
                        "id": "80663142-fd4a-4dab-8943-e1345435a767",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T16:39:18.527360677Z"
                    },
                    {
                        "id": "c96bea51-8b6e-4603-89ac-ac47d602c429",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:39:32.881709Z"
                    },
                    {
                        "id": "5a0fc21c-cefe-48a9-bce3-bbd7df7b3f47",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T16:48:39.669Z"
                    },
                    {
                        "id": "cc874c7b-af27-410a-a879-fc02c56a2fb7",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T17:06:04.191089Z"
                    },
                    {
                        "id": "55cce054-e375-454d-bd0b-be1f5cec1018",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T17:15:57.611974Z"
                    },
                    {
                        "id": "d3cee85c-11c5-42d6-ba6c-31b1bd94d454",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T17:16:57.098642694Z"
                    },
                    {
                        "id": "c328f602-6a29-49f7-8a8c-09fd8053de45",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T19:11:50.667944014Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -12,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:17:05.451913Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "EXTERNAL",
                                    "paymentLiability": "OFFLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -6.3,
                                    "feePercentage": "6",
                                    "feeBaseValue": "105",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:17:05.451913Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "EXTERNAL",
                                    "paymentLiability": "OFFLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.93,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:17:05.451913Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "EXTERNAL",
                                    "paymentLiability": "OFFLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "105",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:17:05.451913Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "EXTERNAL",
                                    "paymentLiability": "OFFLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:17:05.451913Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "EXTERNAL",
                                    "paymentLiability": "OFFLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:17:05.451913Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "EXTERNAL",
                                    "paymentLiability": "OFFLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -17.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:17:05.451913Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "EXTERNAL",
                                    "paymentLiability": "OFFLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "REFUND_SERVICE_FEE",
                                    "amount": 0.07,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:17:05.451913Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "REFUND_SERVICE_FEE",
                                    "liability": "EXTERNAL",
                                    "paymentLiability": "OFFLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 113.93,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T17:17:05.451913Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "EXTERNAL_PAYMENT",
                                    "liability": "EXTERNAL",
                                    "paymentLiability": "OFFLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "8328b618-3e18-46b1-b1f2-07b443ae27e7",
                "shortId": "3193",
                "createdAt": "2026-11-08T16:13:52.406Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 106,
                    "deliveryFee": 10.99,
                    "serviceFee": -2.41
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 9.46,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 4.47
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                }
                            ]
                        },
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                }
                            ]
                        }
                    ],
                    "totalValue": 20.45
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 98.95,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "RLSR7H",
                                "nsu": "626592529"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 80.69,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 10.46
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -6.06
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.41
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 98.95
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -2.27
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "a8c97c75-6123-428a-911f-6844f6a115b5",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T16:13:58.105Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "4aa27501-2838-485c-a320-26e84ee26f78",
                                    "nsu": "626592529",
                                    "authCode": "RLSR7H"
                                }
                            ]
                        }
                    },
                    {
                        "id": "c1d8d35b-cb0e-442e-a817-a7abd12ce96a",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T16:13:59.332Z"
                    },
                    {
                        "id": "0135023a-b22d-4aa9-9af4-cf895096079a",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T16:14:08Z"
                    },
                    {
                        "id": "749a8796-da25-464c-b2cc-25d6ca56a9ec",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T16:14:08.321Z"
                    },
                    {
                        "id": "f23aff6b-c9c4-435f-b290-b632723953aa",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T16:24:23.782741Z"
                    },
                    {
                        "id": "fd163a9b-3c7e-4914-b305-79c53f299058",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T16:24:23.784742Z"
                    },
                    {
                        "id": "9e830077-0cf5-4f75-a56e-614c9b077f97",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T16:24:25.120751626Z"
                    },
                    {
                        "id": "6e07483f-f3dc-4e01-8fc0-aa50fb741d14",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T16:24:25.136902812Z"
                    },
                    {
                        "id": "6486e1c2-b8d3-490a-9498-fd5cdc5eb73c",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:29:49.681553Z"
                    },
                    {
                        "id": "3973bccc-c257-4ac9-a7cd-e960358c06ff",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T16:36:23.703Z"
                    },
                    {
                        "id": "9770c91d-e43c-4154-af30-e5776170f87c",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:43:47.765432Z"
                    },
                    {
                        "id": "f7499c14-b895-4002-9273-e282f702e389",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:54:20.128769Z"
                    },
                    {
                        "id": "0a2caec4-2de3-4dac-80d5-96704cbbdece",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:56:07.484693332Z"
                    },
                    {
                        "id": "69cf1f38-e2d2-43db-9344-0aa0dfec7dfd",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T18:40:02.140825616Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:10.707113Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 4.47,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:10.707113Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -6.06,
                                    "feePercentage": "6",
                                    "feeBaseValue": "101.01",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:10.707113Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "101.01",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:10.707113Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:10.707113Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:10.707113Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:10.707113Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.41,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:10.707113Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 98.95,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:10.707113Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -2.27,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "101.01",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:56:10.707113Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "4cf4fb46-2485-406b-bcda-ebbbf5964edc",
                "shortId": "4264",
                "createdAt": "2026-11-08T15:43:25.130Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 216.02,
                    "deliveryFee": 16.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                }
                            ]
                        }
                    ],
                    "totalValue": 10.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "PRIORITY",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 16.99,
                        "discount": 10.99,
                        "netValue": 6
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "PIX",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 226.01,
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 187.21,
                    "billingEntries": [
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -4.86
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -12.96
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 226.01
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 5.99
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -5.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -16.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "032e974d-28fc-48b4-954d-08d00cbf7ced",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T15:44:02.158Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "59ab73c8-31e2-4447-ae9a-f0b524f5cd22",
                                    "nsu": "CONCLUIDA",
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "9b8e12f3-c6ef-4684-a91a-4c507b83da5d",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T15:44:03.578Z"
                    },
                    {
                        "id": "91aa8962-db98-4da7-94c9-c3f5e3ca9f00",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T15:44:13Z"
                    },
                    {
                        "id": "05944ab2-fe21-4e97-b4b8-41d501d88ec7",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T15:44:13.187Z"
                    },
                    {
                        "id": "eee595a3-eaff-4821-9f6f-297dff35ca5d",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T15:55:07.249085Z"
                    },
                    {
                        "id": "27e66ccb-c34f-4ab3-8bfd-ebad2c6f414e",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T15:55:07.251087Z"
                    },
                    {
                        "id": "8581fa32-02d5-4c0c-9fe7-8e087afb51fe",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T15:55:08.407360260Z"
                    },
                    {
                        "id": "864f8347-383c-4a83-a4bd-ea23a71b1a77",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T15:55:08.421174606Z"
                    },
                    {
                        "id": "576250c4-3b74-47f1-885c-0fb712941299",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T15:58:27.737052Z"
                    },
                    {
                        "id": "09c86df7-a5d0-424d-83dc-413387ec1b31",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T15:58:56.882Z"
                    },
                    {
                        "id": "5541db52-c01d-4d42-a34f-11ae9cbe792f",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:03:52.418447Z"
                    },
                    {
                        "id": "9fe2a966-362d-4d57-8ec5-8e9b816093cb",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:06:58.217804Z"
                    },
                    {
                        "id": "b117e455-824f-4fcd-9a62-c5cf0d59e1ca",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:09:03.333378598Z"
                    },
                    {
                        "id": "7b1438af-c9ba-4732-bcb6-10ae533671ff",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T17:31:05.818951349Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:09:06.680387Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.86,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "216.02",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:09:06.680387Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:09:06.680387Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -12.96,
                                    "feePercentage": "6",
                                    "feeBaseValue": "216.02",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:09:06.680387Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 226.01,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:09:06.680387Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:09:06.680387Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -5.99,
                                    "feeBaseValue": "216.02",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:09:06.680387Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -16.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:09:06.680387Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "1261cdb3-84ea-451a-b086-1bc41d9f185a",
                "shortId": "5191",
                "createdAt": "2026-11-08T15:28:38.637Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 208,
                    "deliveryFee": 11.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 11.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 7
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 12,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 2
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 10
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 23.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 11.99,
                        "discount": 11.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 199.99,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "071821",
                                "nsu": "000840617770"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 169.68,
                    "billingEntries": [
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -11.99
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -4.46
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 9
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -11.88
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 199.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "8abd0b85-202e-4bb9-96f0-8d8302a5727f",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T15:28:43.372Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "94c6c4cf-2ae6-4f2b-a836-38fe417a1a66",
                                    "nsu": "000840617770",
                                    "authCode": "071821"
                                }
                            ]
                        }
                    },
                    {
                        "id": "48257516-68a3-4a98-b412-c35f7a1f0101",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T15:28:44.593Z"
                    },
                    {
                        "id": "7d47478b-df9d-49c5-a255-11d8bac591be",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T15:29:07Z"
                    },
                    {
                        "id": "0e1a983c-862f-45fa-9726-06d8833f639a",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T15:29:07.083Z"
                    },
                    {
                        "id": "ffd13761-3675-47f7-9e7c-3a8a6af3de86",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T15:50:55.432Z"
                    },
                    {
                        "id": "e3430989-cee0-491c-91f4-5e1fad7b9a35",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T15:59:56.096208Z"
                    },
                    {
                        "id": "4becd15e-2904-434c-8c3e-4ee90af0b573",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T15:59:56.098210Z"
                    },
                    {
                        "id": "2c054d50-4a46-4260-99e7-e4a9057595d9",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T15:59:57.227829450Z"
                    },
                    {
                        "id": "5db47ecc-1435-4cee-847b-1a165a2863b5",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T15:59:57.241862004Z"
                    },
                    {
                        "id": "5d4542e8-5548-47d9-8420-aa5becff0c0b",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T16:02:42.464639Z"
                    },
                    {
                        "id": "f4e64017-bf53-40e3-916b-fa9ede9cbf15",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T16:09:22.839778Z"
                    },
                    {
                        "id": "cfff95fa-227f-48d2-9610-73e16146962e",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T16:27:28.896677Z"
                    },
                    {
                        "id": "93d70276-c0e3-4cf5-9a82-1dd369e5e0df",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T16:28:54.718506786Z"
                    },
                    {
                        "id": "b4a40e50-b73b-4ac3-997b-7b3f83dea287",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T17:58:18.700613230Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:29:02.648371Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:29:02.648371Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -11.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:29:02.648371Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:29:02.648371Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.46,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "198",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:29:02.648371Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 2,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:29:02.648371Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -11.88,
                                    "feePercentage": "6",
                                    "feeBaseValue": "198",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:29:02.648371Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "198",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:29:02.648371Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 7,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:29:02.648371Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 199.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T16:29:02.648371Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "60226a11-a3c7-428a-969e-63b08e04e6c1",
                "shortId": "9250",
                "createdAt": "2026-11-08T14:17:21.155Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 200.9,
                    "deliveryFee": 19.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "CART",
                            "value": 12,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 2
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 10
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 12
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 19.99,
                        "discount": 0,
                        "netValue": 19.99
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 212.88,
                            "card": {
                                "brand": "VISA"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "DBV8FQ",
                                "nsu": "876113419"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 166.16,
                    "billingEntries": [
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 2
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -4.3
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -8.99
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -19.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -11.45
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 212.88
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "0407a5dc-c0a4-40d0-9223-4df42b126cf4",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T14:17:27.430Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "fb751d76-8206-4b65-9d2c-0506453ab850",
                                    "nsu": "876113419",
                                    "authCode": "DBV8FQ"
                                }
                            ]
                        }
                    },
                    {
                        "id": "80508766-2041-4809-9e1d-b22d776312be",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T14:17:28.508Z"
                    },
                    {
                        "id": "ce6102f2-5474-4d1c-a574-3c88cdb329f1",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T14:17:39Z"
                    },
                    {
                        "id": "f430bb27-9f24-4f7f-93f4-26f73c570807",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T14:17:39.300Z"
                    },
                    {
                        "id": "d8367093-c2b9-4f71-84a4-54246752a7a6",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T14:30:37.677879Z"
                    },
                    {
                        "id": "62c7c55a-8014-4846-937d-19e064f98bd4",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T14:30:37.679882Z"
                    },
                    {
                        "id": "030aa81f-d8c5-4366-ba18-14df5e1f0f63",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T14:30:38.788334863Z"
                    },
                    {
                        "id": "a112039a-38f3-4acf-b404-4650e8fc310d",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T14:30:38.801684955Z"
                    },
                    {
                        "id": "ca40caa2-1ad1-42ed-a931-20b3412ab413",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T14:36:14.722Z"
                    },
                    {
                        "id": "9443ffd9-534f-4bd2-8790-05467380ae61",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T14:39:10.767908Z"
                    },
                    {
                        "id": "45f52066-0dfc-412d-a4e5-91f2fc447194",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T14:40:45.896429Z"
                    },
                    {
                        "id": "3088daec-b464-4bf0-b708-4ad83fcadade",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T14:57:28.705145Z"
                    },
                    {
                        "id": "744857da-60d4-4b07-aeb2-a0b2c135029a",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T14:57:47.796202534Z"
                    },
                    {
                        "id": "6e9af62b-fcc4-4e6d-a1f0-181ff9ba2161",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T16:00:54.937686858Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:58:03.021896Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 2,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:58:03.021896Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:58:03.021896Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.3,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "190.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:58:03.021896Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -8.99,
                                    "feeBaseValue": "190.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:58:03.021896Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -19.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:58:03.021896Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -11.45,
                                    "feePercentage": "6",
                                    "feeBaseValue": "190.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:58:03.021896Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 212.88,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:58:03.021896Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "83c6fd7c-cdfe-48a5-9637-9c5d2126884a",
                "shortId": "9593",
                "createdAt": "2026-11-08T13:46:33.299Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "aa5dcb37-dfaf-4442-b5dc-ef69637f73ad",
                    "shortId": 1666697,
                    "documents": [
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        },
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        }
                    ],
                    "name": "Vasto Recife",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 212,
                    "deliveryFee": 18.99,
                    "serviceFee": -3.99
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 12.99,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 8
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                }
                            ]
                        },
                        {
                            "target": "CART",
                            "value": 12,
                            "sponsorships": [
                                {
                                    "name": "IFOOD",
                                    "value": 2
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 10
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 24.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "PRIORITY",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 18.99,
                        "discount": 12.99,
                        "netValue": 6
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "PIX",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 209.99,
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 173.36,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 10
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 209.99
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -12.12
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -4.54
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -18.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "50535766-3869-4fd7-9f52-81af1c3a59d6",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T13:47:22.769Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "3f9565b8-acc0-4f6c-9cd2-169c2da93000",
                                    "nsu": "CONCLUIDA",
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "510ad9aa-8bee-4e18-a402-d16312ec1a47",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T13:47:24.282Z"
                    },
                    {
                        "id": "2bd8b224-03d1-4d30-88f5-fe283c8e5ce6",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T13:47:37Z"
                    },
                    {
                        "id": "47ec7a75-9d76-4781-90c2-331f3952d2df",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T13:47:37.223Z"
                    },
                    {
                        "id": "77d13cb2-2c89-4bd2-8eb6-7b95de557a4a",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T14:05:41.598755Z"
                    },
                    {
                        "id": "f82eaf22-aaa7-40cb-9b28-44af8141a6fe",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T14:05:41.600757Z"
                    },
                    {
                        "id": "01d6de41-40ac-4178-a3fb-b99a40ee6bfc",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T14:05:42.635623155Z"
                    },
                    {
                        "id": "ece64ec9-046c-40d7-9ae8-ecec48b0bef0",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T14:05:42.652224445Z"
                    },
                    {
                        "id": "d79894a8-1bb8-4638-9f18-c262da65d3eb",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T14:09:44.263Z"
                    },
                    {
                        "id": "1eb4bc12-b910-44eb-8f64-91a96374499d",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T14:11:25.381756Z"
                    },
                    {
                        "id": "7c6d4b51-1c68-45f4-9eef-348c34116cc6",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T14:13:18.352250Z"
                    },
                    {
                        "id": "32ba072a-dd5c-4bed-b8a0-9db16dcc8f01",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T14:21:49.047888Z"
                    },
                    {
                        "id": "e79ed4de-d072-49b2-8e05-79831ebe627d",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T14:22:31.992621381Z"
                    },
                    {
                        "id": "0e5dfd50-38de-4579-8b6a-251482a6cbb0",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-08T15:23:32.700591608Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 2,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:22:40.553332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:22:40.553332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 209.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:22:40.553332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -10,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:22:40.553332Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_CART",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "202",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:22:40.553332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -12.12,
                                    "feePercentage": "6",
                                    "feeBaseValue": "202",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:22:40.553332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -4.54,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "202",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:22:40.553332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -18.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:22:40.553332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 8,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:22:40.553332Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T14:22:40.553332Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            }
        ],
        "total": 11,
        "pageCount": 1
    };

    // e717a3d0-6e30-46f1-a259-9fcc13db206f
    export const vastoSushi = {
        "page": 1,
        "size": 2,
        "beginSalesDate": "2026-11-08",
        "endSalesDate": "2026-11-08",
        "sales": [
            {
                "id": "c52021de-28ce-4a83-8da8-1a4804ae6002",
                "shortId": "0997",
                "createdAt": "2026-11-08T22:33:29.502Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "e717a3d0-6e30-46f1-a259-9fcc13db206f",
                    "shortId": 1914536,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Vasto Sushi",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 143,
                    "deliveryFee": 12.99,
                    "serviceFee": -3.32
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "ITEM",
                            "value": 10.2,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.2
                                }
                            ]
                        },
                        {
                            "target": "DELIVERY_FEE",
                            "value": 12.99,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 4.99
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 8
                                }
                            ]
                        },
                        {
                            "target": "ITEM",
                            "value": 0,
                            "sponsorships": [
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                },
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 23.19
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 12.99,
                        "discount": 12.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "PIX",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 136.12,
                            "liability": "IFOOD"
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 114.64,
                    "billingEntries": [
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 13.2
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -3.1
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -8.28
                        },
                        {
                            "name": "SERVICE_FEE",
                            "value": -3.32
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -6.99
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 136.12
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -12.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "31f8f2d4-3255-486a-b23b-b42aabdba823",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T22:37:15.593Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "a54d99f6-1cc4-4136-a859-0f88fb77f37e",
                                    "nsu": "CONCLUIDA",
                                    "authCode": null
                                }
                            ]
                        }
                    },
                    {
                        "id": "3b45c825-9eca-4808-8e22-a750e2661bc7",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T22:37:16.941Z"
                    },
                    {
                        "id": "f3628818-be11-4e66-8c41-0ea895211ac4",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T22:37:21.330Z"
                    },
                    {
                        "id": "3cafe906-6521-416a-b896-e56f159936dd",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T22:37:22Z"
                    },
                    {
                        "id": "6c5ef8a8-4957-4f75-ada4-4da283e71450",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T22:48:58.550Z"
                    },
                    {
                        "id": "898199f3-7475-409e-977f-f57d219e70ec",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T22:53:33.663847Z"
                    },
                    {
                        "id": "8bb123d5-c03b-4799-9520-cec02bee47c5",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T22:53:33.665848Z"
                    },
                    {
                        "id": "0349c0aa-6396-4f39-8f44-39792121e8e9",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T22:53:34.789287747Z"
                    },
                    {
                        "id": "ea8d054c-c93f-41c9-b41f-d82abe4dfcad",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T22:53:34.806278633Z"
                    },
                    {
                        "id": "5a290ae3-e0f4-45f8-a4d6-00454a969b25",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T22:58:10.630988Z"
                    },
                    {
                        "id": "f68b210d-13fc-42e0-83e1-eb73bb6dc549",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T22:58:21.096412Z"
                    },
                    {
                        "id": "bed1791a-3f35-4b2c-8406-e68ebc6869f1",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T23:09:01.930824Z"
                    },
                    {
                        "id": "fd4a1987-2c6d-4d02-ba1c-a76dc17fe6e9",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T23:09:27.126267269Z"
                    },
                    {
                        "id": "19615243-05c2-429c-82c2-92fb1012fd41",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T03:10:31.040723814Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 8,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:09:30.888068Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -3.1,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "138",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:09:30.888068Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:09:30.888068Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -4.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:09:30.888068Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -8.28,
                                    "feePercentage": "6",
                                    "feeBaseValue": "138",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:09:30.888068Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -3.32,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:09:30.888068Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -6.99,
                                    "feeBaseValue": "138",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:09:30.888068Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 136.12,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:09:30.888068Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.2,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:09:30.888068Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_ITEM",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -12.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T23:09:30.888068Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "df1512ce-aa5a-4abb-aba4-d06e8853030e",
                "shortId": "3285",
                "createdAt": "2026-11-08T21:05:57.907Z",
                "type": "ORDER",
                "category": "FOOD",
                "salesChannel": "IFOOD",
                "currentStatus": "CONCLUDED",
                "merchant": {
                    "id": "e717a3d0-6e30-46f1-a259-9fcc13db206f",
                    "shortId": 1914536,
                    "documents": [
                        {
                            "value": "5812",
                            "type": "MCC"
                        },
                        {
                            "value": "24167658000150",
                            "type": "CNPJ"
                        },
                        {
                            "value": "82194823387",
                            "type": "CPF"
                        }
                    ],
                    "name": "Vasto Sushi",
                    "type": "RESTAURANT",
                    "timezone": "Etc/GMT+3"
                },
                "saleGrossValue": {
                    "bag": 117.9,
                    "deliveryFee": 10.99,
                    "serviceFee": -2.95
                },
                "benefits": {
                    "benefits": [
                        {
                            "target": "DELIVERY_FEE",
                            "value": 10.99,
                            "sponsorships": [
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 5.99
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 5
                                }
                            ]
                        },
                        {
                            "target": "ITEM",
                            "value": 0,
                            "sponsorships": [
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                }
                            ]
                        },
                        {
                            "target": "ITEM",
                            "value": 0,
                            "sponsorships": [
                                {
                                    "name": "EXTERNAL",
                                    "value": 0
                                },
                                {
                                    "name": "IFOOD",
                                    "value": 0
                                },
                                {
                                    "name": "CHAIN",
                                    "value": 0
                                },
                                {
                                    "name": "MERCHANT",
                                    "value": 0
                                }
                            ]
                        }
                    ],
                    "totalValue": 10.99
                },
                "delivery": {
                    "informationProvider": {
                        "name": "DELIVERY_OFFER"
                    },
                    "type": "DELIVERY",
                    "deliveryParameters": {
                        "logisticProvider": "IFOOD_LOGISTICS",
                        "deliveryProduct": "FULL_SERVICE_COMPLETE_AREA",
                        "code": "DEFAULT",
                        "schedulingType": "IMMEDIATE"
                    },
                    "prices": {
                        "grossValue": 10.99,
                        "discount": 10.99,
                        "netValue": 0
                    }
                },
                "payments": {
                    "methods": [
                        {
                            "method": "CREDIT",
                            "currency": "BRL",
                            "type": "ONLINE",
                            "value": 120.85,
                            "card": {
                                "brand": "MASTERCARD"
                            },
                            "liability": "IFOOD",
                            "transaction": {
                                "authCode": "6RKGFJ",
                                "nsu": "000559769970"
                            }
                        }
                    ]
                },
                "orderStatusHistory": [],
                "billingSummary": {
                    "saleBalance": 97.19,
                    "billingEntries": [
                        {
                            "name": "SERVICE_FEE",
                            "value": -2.95
                        },
                        {
                            "name": "IFOOD_SUBSIDY",
                            "value": 5.99
                        },
                        {
                            "name": "ORDER_COMMISSION",
                            "value": -7.07
                        },
                        {
                            "name": "ORDER_PAYMENT",
                            "value": 120.85
                        },
                        {
                            "name": "DELIVERY_FEE_IFOOD",
                            "value": -10.99
                        },
                        {
                            "name": "PAYMENT_TRANSACTION_FEE",
                            "value": -2.65
                        },
                        {
                            "name": "DELIVERY_COMMISSION",
                            "value": -5.99
                        }
                    ]
                },
                "orderEvents": [
                    {
                        "id": "34c71654-15dd-4919-a9bd-e4334087ea6f",
                        "fullCode": "PAYMENT_APPROVED",
                        "code": "PA",
                        "createdAt": "2026-11-08T21:06:01.165Z",
                        "metadata": {
                            "authorizedPayments": [
                                {
                                    "paymentId": "4552174a-2838-4996-b880-23eb0130b4ba",
                                    "nsu": "000559769970",
                                    "authCode": "6RKGFJ"
                                }
                            ]
                        }
                    },
                    {
                        "id": "47089fba-6378-40e8-9ba1-ebe8b4d1d6e7",
                        "fullCode": "RECEIVED",
                        "code": "RC",
                        "createdAt": "2026-11-08T21:06:02.203Z"
                    },
                    {
                        "id": "b0871652-c5af-4987-b53c-b1f7c9e77cf1",
                        "fullCode": "CONFIRMED",
                        "code": "CFM",
                        "createdAt": "2026-11-08T21:06:20.822Z"
                    },
                    {
                        "id": "1d344a35-0d63-4996-bb18-2d462832dc9d",
                        "fullCode": "CHANGE_PREPARATION_TIME",
                        "code": "CPT",
                        "createdAt": "2026-11-08T21:06:21Z"
                    },
                    {
                        "id": "00892b98-bceb-45a0-a280-be242d939d5d",
                        "fullCode": "DELIVERY_ACCEPTED",
                        "code": "DADR",
                        "createdAt": "2026-11-08T21:17:34.628913Z"
                    },
                    {
                        "id": "7d65eb6a-82d3-4a0b-a99f-d75743a9a63f",
                        "fullCode": "DELIVERY_GOING_TO_ORIGIN",
                        "code": "DGTO",
                        "createdAt": "2026-11-08T21:17:34.630915Z"
                    },
                    {
                        "id": "6a6539dc-c066-49c5-aaec-81674cede838",
                        "fullCode": "DELIVERY_PICKUP_CODE_REQUESTED",
                        "code": "DPCR",
                        "createdAt": "2026-11-08T21:17:35.804581997Z"
                    },
                    {
                        "id": "0e6c9a72-3b12-45e0-b3aa-ed1323a99282",
                        "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                        "code": "DDCR",
                        "createdAt": "2026-11-08T21:17:35.818546545Z"
                    },
                    {
                        "id": "a4b4cf89-a1bc-4f53-a719-fbf89fa1bc8c",
                        "fullCode": "DELIVERY_ARRIVED_AT_ORIGIN",
                        "code": "DAAO",
                        "createdAt": "2026-11-08T21:19:39.862928Z"
                    },
                    {
                        "id": "d3dc869c-4a98-4971-96fd-02a9f7c10c78",
                        "fullCode": "READY_TO_DELIVER",
                        "code": "RTD",
                        "createdAt": "2026-11-08T21:23:27.955Z"
                    },
                    {
                        "id": "8a5f74ca-3993-40a2-a96d-6527490a48e5",
                        "fullCode": "DELIVERY_COLLECTED",
                        "code": "DCLT",
                        "createdAt": "2026-11-08T21:26:46.736875Z"
                    },
                    {
                        "id": "e3c46caf-e18f-48d5-bc2f-1753343a9c49",
                        "fullCode": "DELIVERY_ARRIVED_AT_DESTINATION",
                        "code": "DAAD",
                        "createdAt": "2026-11-08T21:35:42.567695Z"
                    },
                    {
                        "id": "450f3e4f-9871-4ed4-8c3d-3ce837a7e9e3",
                        "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                        "code": "DDCS",
                        "createdAt": "2026-11-08T21:38:51.808308882Z"
                    },
                    {
                        "id": "d3764084-e44c-490d-9e81-f53121fe9b17",
                        "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                        "code": "FBOE",
                        "createdAt": "2026-11-09T00:18:31.110229939Z",
                        "metadata": {
                            "entries": [
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "SERVICE_FEE",
                                    "amount": -2.95,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:38:57.971825Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "SERVICE_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "IFOOD_SUBSIDY",
                                    "amount": 5.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:38:57.971825Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IFOOD_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "STORE_SUBSIDY",
                                    "amount": -5,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:38:57.971825Z",
                                    "hasTransferImpact": false,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "STORE_SUBSIDY_TARGET_DELIVERY_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_COMMISSION",
                                    "amount": -7.07,
                                    "feePercentage": "6",
                                    "feeBaseValue": "117.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:38:57.971825Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DEDUCTION_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "ORDER_PAYMENT",
                                    "amount": 120.85,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:38:57.971825Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "IN_APP_PAYMENT_CREDIT",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_FEE_IFOOD",
                                    "amount": -10.99,
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:38:57.971825Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DELIVERY_FEE_IFOOD",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                    "amount": -2.65,
                                    "feePercentage": "2.25",
                                    "feeBaseValue": "117.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:38:57.971825Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "PAYMENT_TRANSACTION_FEE",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                },
                                {
                                    "triggerEventName": "ORDER_CONCLUDED",
                                    "financialEntryName": "DELIVERY_COMMISSION",
                                    "amount": -5.99,
                                    "feeBaseValue": "117.9",
                                    "expectedPaymentDate": "2026-12-02",
                                    "billedDate": "2026-11-08T21:38:57.971825Z",
                                    "hasTransferImpact": true,
                                    "period": {
                                        "beginDate": "2026-11-02",
                                        "endDate": "2026-11-08"
                                    },
                                    "description": "DISTANCE_COMMISSION",
                                    "liability": "INTERNAL",
                                    "paymentLiability": "ONLINE"
                                }
                            ]
                        }
                    }
                ]
            }
        ],
        "total": 2,
        "pageCount": 1
    };
}