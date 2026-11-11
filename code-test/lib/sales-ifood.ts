const salesIfood = {
    "page": 1,
    "size": 20,
    "beginSalesDate": "2026-11-08",
    "endSalesDate": "2026-11-08",
    "sales": [
        {
            "id": "7439a340-2dc3-4c18-bc3c-b0d9a7d1148f",
            "shortId": "6321",
            "createdAt": "2026-11-09T00:16:34.330Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 89.9,
                "deliveryFee": 13.9,
                "serviceFee": -1.8
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
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
                "totalValue": 23.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
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
                        "value": 81.7,
                        "card": {
                            "brand": "MASTERCARD"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "731498",
                            "nsu": "731498"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 87.16,
                "billingEntries": [
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 81.7
                    },
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 16.95
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -6.78
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -2.91
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -1.8
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "4ec5d0ab-8b52-4126-a1f5-fb328491d3e0",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-09T00:16:37.082Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "79c2fa38-5611-47b2-87ca-c321b8863620",
                                "nsu": "731498",
                                "authCode": "731498"
                            }
                        ]
                    }
                },
                {
                    "id": "4cd883c5-15f3-4664-ac3f-bab3d0c4d3f8",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-09T00:16:38.526Z"
                },
                {
                    "id": "cd89b2d0-91fe-45a0-861b-852c41d87a20",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-09T00:16:39.084767031Z"
                },
                {
                    "id": "13c288c1-bb74-4332-8708-a26998d4487d",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-09T00:16:39.340231034Z"
                },
                {
                    "id": "d0010ba9-17ed-4446-a807-bf914abb0aac",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-09T01:01:15.529Z"
                },
                {
                    "id": "e6688a39-e314-44f0-8d80-ceb282056432",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-09T01:01:44.947Z"
                },
                {
                    "id": "67d5ac45-038d-4751-9636-c0c477c8d9a3",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-09T01:31:46.360660174Z"
                },
                {
                    "id": "59dc413e-2b3b-4440-9a8d-228d37ca7c6a",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-09T01:31:46.873386852Z"
                },
                {
                    "id": "e67556d8-1d67-4ed1-9a28-374b641ad0f3",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T08:30:56.309541459Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "ORDER_PAYMENT",
                                "amount": 81.7,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:31:47.014970Z",
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
                                "amount": 10,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:31:47.014970Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:31:47.014970Z",
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
                                "amount": -6.78,
                                "feePercentage": "7",
                                "feeBaseValue": "96.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:31:47.014970Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:31:47.014970Z",
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
                                "amount": -2.91,
                                "feePercentage": "3",
                                "feeBaseValue": "96.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:31:47.014970Z",
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
                                "amount": -1.8,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:31:47.014970Z",
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
            "id": "db505872-1563-464d-97a5-c518f2fb0510",
            "shortId": "8894",
            "createdAt": "2026-11-09T00:10:14.957Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 76.9,
                "deliveryFee": 13.9,
                "serviceFee": -1.92
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "MERCHANT",
                                "value": 6.95
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
                                "value": 6.95
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
                "totalValue": 23.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "CREDIT",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 68.82,
                        "card": {
                            "brand": "VISA"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "601895",
                            "nsu": "504127273"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 75.46,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 16.95
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -1.92
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -5.87
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -2.52
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 68.82
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "407914ac-547d-44ff-8a62-134d3f57e22e",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-09T00:10:19.684Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "184cf60d-f162-4993-9b91-38574127e518",
                                "nsu": "504127273",
                                "authCode": "601895"
                            }
                        ]
                    }
                },
                {
                    "id": "2e016272-361b-4869-982a-d8d8ea9a4963",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-09T00:10:20.900Z"
                },
                {
                    "id": "5da48043-3f6a-4cab-9f28-292b47416bec",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-09T00:10:21.315411830Z"
                },
                {
                    "id": "9f9606a0-bd48-4935-ab47-89db063550b8",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-09T00:10:21.708114047Z"
                },
                {
                    "id": "2d727951-39b8-49f4-b83d-ce6ad693a3b8",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-09T01:01:13.324Z"
                },
                {
                    "id": "5dc65fd5-fbf4-40cb-a84e-c31316ec6787",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-09T01:01:41.334Z"
                },
                {
                    "id": "d3f11d73-ea0b-4477-aaa9-9905d265a90b",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-09T06:00:40.270957014Z"
                },
                {
                    "id": "e0ebd293-29cb-45b1-941e-a162f3d9cea9",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T11:32:43.466835717Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "STORE_SUBSIDY",
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T06:00:40.462111Z",
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
                                "amount": 10,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T06:00:40.462111Z",
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
                                "amount": -1.92,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T06:00:40.462111Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T06:00:40.462111Z",
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
                                "amount": -5.87,
                                "feePercentage": "7",
                                "feeBaseValue": "83.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T06:00:40.462111Z",
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
                                "amount": -2.52,
                                "feePercentage": "3",
                                "feeBaseValue": "83.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T06:00:40.462111Z",
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
                                "amount": 68.82,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T06:00:40.462111Z",
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
            "id": "46a1ac3d-f943-46b3-bd46-9e02ef3beb89",
            "shortId": "1100",
            "createdAt": "2026-11-08T23:46:33.543Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 89.9,
                "deliveryFee": 13.9,
                "serviceFee": -2.25
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            },
                            {
                                "name": "EXTERNAL",
                                "value": 0
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
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
                "totalValue": 25.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
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
                        "value": 80.15,
                        "card": {
                            "brand": "ELO"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "450203",
                            "nsu": "450203"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 87.16,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 18.95
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -2.91
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 80.15
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -2.25
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -6.78
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "99e174d6-a5a2-4fad-99dc-8627600334cf",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T23:46:36.561Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "138ff53c-95fc-4428-b6fb-e6cf0e9b990d",
                                "nsu": "450203",
                                "authCode": "450203"
                            }
                        ]
                    }
                },
                {
                    "id": "465bdfe4-b0f3-49f3-ad24-b97a9d2b8988",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T23:46:37.845Z"
                },
                {
                    "id": "d7e00717-1fca-4f1b-be72-77e2f1052379",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T23:46:38.353272282Z"
                },
                {
                    "id": "7d76c718-a962-4246-8c10-06f42c928f31",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T23:46:38.587740041Z"
                },
                {
                    "id": "098c9a6b-d2ea-4276-882f-afe1b74efd36",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-09T00:38:53.235Z"
                },
                {
                    "id": "1b35e3e9-fd3d-4ab1-94b9-c898dec6610b",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-09T00:42:35.854Z"
                },
                {
                    "id": "a59a9bb6-fc88-423b-ab81-2c8d93f1624b",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-09T01:05:51.605397465Z"
                },
                {
                    "id": "8b878dbc-a519-4ea3-9fb2-918ac7d64ac5",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-09T01:05:52.119240285Z"
                },
                {
                    "id": "a06372b1-6c81-4b01-ae5a-34ed553afce7",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T07:51:48.816051551Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:05:52.326239Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:05:52.326239Z",
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
                                "amount": -2.91,
                                "feePercentage": "3",
                                "feeBaseValue": "96.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:05:52.326239Z",
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
                                "amount": 12,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:05:52.326239Z",
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
                                "amount": 80.15,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:05:52.326239Z",
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
                                "amount": -2.25,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:05:52.326239Z",
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
                                "amount": -6.78,
                                "feePercentage": "7",
                                "feeBaseValue": "96.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:05:52.326239Z",
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
            "id": "0a1dec4c-e259-4c2a-8327-6979e657d0d6",
            "shortId": "3372",
            "createdAt": "2026-11-08T23:39:58.487Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 82.9,
                "deliveryFee": 13.9,
                "serviceFee": -2.07
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            },
                            {
                                "name": "EXTERNAL",
                                "value": 0
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
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
                "totalValue": 23.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
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
                            "brand": "MASTERCARD"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "935359",
                            "nsu": "935359"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 80.86,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 16.95
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 74.97
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -2.7
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -2.07
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -6.29
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "86b648c8-51ad-40c3-87a9-06c9460d42d4",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T23:40:01.223Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "1816d500-92e6-431d-87f5-82d6b27cc110",
                                "nsu": "935359",
                                "authCode": "935359"
                            }
                        ]
                    }
                },
                {
                    "id": "402c6848-bf6c-4d4f-bcc5-ee1651ce8a77",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T23:40:02.657Z"
                },
                {
                    "id": "b79ccf13-ecfe-4c22-8c1c-208ebde98efa",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T23:40:03.085867405Z"
                },
                {
                    "id": "a4271883-e079-4467-b5ad-d7989a3bfc8f",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T23:40:03.518918163Z"
                },
                {
                    "id": "fb1b77e4-79de-493a-9009-bce1b40339bd",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-09T00:38:51.171Z"
                },
                {
                    "id": "9b714b2c-1618-4fbf-bd7c-b6898f5155ee",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-09T00:51:04.373Z"
                },
                {
                    "id": "1b0dc3ed-899a-4633-a77b-0c2701f209df",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-09T00:56:35.829397740Z"
                },
                {
                    "id": "fb62090b-fcd0-489a-a871-1613cd0c83de",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-09T00:56:36.339314234Z"
                },
                {
                    "id": "081dd932-dc0e-47d1-9215-5363f0bcc8a9",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T07:30:14.176456955Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 10,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:56:36.508Z",
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
                                "amount": 74.97,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:56:36.508Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:56:36.508Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:56:36.508Z",
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
                                "amount": -2.7,
                                "feePercentage": "3",
                                "feeBaseValue": "89.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:56:36.508Z",
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
                                "amount": -2.07,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:56:36.508Z",
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
                                "amount": -6.29,
                                "feePercentage": "7",
                                "feeBaseValue": "89.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:56:36.508Z",
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
            "id": "d4a26fe9-2417-4a1a-aecd-5f746165eab8",
            "shortId": "7196",
            "createdAt": "2026-11-08T23:37:15.308Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 161.8,
                "deliveryFee": 13.9,
                "serviceFee": -3.99
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "IFOOD",
                                "value": 6.95
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
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
                        "value": 13,
                        "sponsorships": [
                            {
                                "name": "IFOOD",
                                "value": 13
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
                "totalValue": 26.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "CREDIT",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 152.79,
                        "card": {
                            "brand": "ELO"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "671768",
                            "nsu": "000716583461"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 151.88,
                "billingEntries": [
                    {
                        "name": "SERVICE_FEE",
                        "value": -3.99
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 152.79
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -5.06
                    },
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 19.95
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -11.81
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "36d42b95-11f1-440e-bf63-f92d7325d115",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T23:37:18.079Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "c02e6ee0-3fda-477e-ab97-f7f0d240527f",
                                "nsu": "000716583461",
                                "authCode": "671768"
                            }
                        ]
                    }
                },
                {
                    "id": "0f3703a4-d74e-49c8-be6a-d64ad965e308",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T23:37:19.437Z"
                },
                {
                    "id": "7524c1db-556e-4bbb-8624-2631dc5b20bb",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T23:37:19.949547884Z"
                },
                {
                    "id": "cd66b5ab-d8d9-4571-8e1c-adec2d28a04c",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T23:37:20.180236849Z"
                },
                {
                    "id": "482090ca-a820-4171-94ce-02c923553371",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-09T00:37:19.107018403Z"
                },
                {
                    "id": "21ba7e62-8d90-4909-89aa-640c480e52fc",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-09T00:37:19.620435363Z"
                },
                {
                    "id": "73a9cd5f-6582-4a60-b158-eeff9cfd4af2",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T06:42:24.671484356Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "SERVICE_FEE",
                                "amount": -3.99,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:37:19.848410Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:37:19.848410Z",
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
                                "amount": 152.79,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:37:19.848410Z",
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
                                "amount": -5.06,
                                "feePercentage": "3",
                                "feeBaseValue": "168.75",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:37:19.848410Z",
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
                                "amount": 13,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:37:19.848410Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:37:19.848410Z",
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
                                "amount": -11.81,
                                "feePercentage": "7",
                                "feeBaseValue": "168.75",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:37:19.848410Z",
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
            "id": "ec4d3e8a-68c5-4b05-acdc-028445473126",
            "shortId": "8399",
            "createdAt": "2026-11-08T23:22:55.155Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 144.9,
                "deliveryFee": 13.9,
                "serviceFee": -3.62
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            },
                            {
                                "name": "EXTERNAL",
                                "value": 0
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
                            }
                        ]
                    }
                ],
                "totalValue": 13.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
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
                            "brand": "MASTERCARD"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "076571",
                            "nsu": "000257810955"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 136.66,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -4.56
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -10.63
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
                    "id": "de498c5f-e05a-4615-9e69-f0786c96ce90",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T23:22:59.050Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "fc4c174b-4951-4811-8613-a915361a9bdd",
                                "nsu": "000257810955",
                                "authCode": "076571"
                            }
                        ]
                    }
                },
                {
                    "id": "f3aaca55-303e-45f1-bcac-362819305b06",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T23:23:00.401Z"
                },
                {
                    "id": "b659c752-c2ff-47ba-a89f-0f42fddadfd5",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T23:23:00.835169889Z"
                },
                {
                    "id": "dc1dbbc6-e6b3-48ad-8694-e1ecb6598744",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T23:23:01.242112065Z"
                },
                {
                    "id": "e95d96e2-5386-4775-bacb-987ab55453e2",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-09T00:38:45.062Z"
                },
                {
                    "id": "7d5438bb-4fb9-4a02-b954-c27431fcf28d",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-09T01:01:33.746Z"
                },
                {
                    "id": "bea963c5-fac0-4fd9-a748-7056332b82d1",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-09T01:13:02.707018274Z"
                },
                {
                    "id": "674f1cee-c5ff-425d-a88e-49239f65b6d9",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T08:12:40.624790849Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "STORE_SUBSIDY",
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:13:02.831730Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:13:02.831730Z",
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
                                "amount": -4.56,
                                "feePercentage": "3",
                                "feeBaseValue": "151.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:13:02.831730Z",
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
                                "amount": -10.63,
                                "feePercentage": "7",
                                "feeBaseValue": "151.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:13:02.831730Z",
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
                                "amount": 148.52,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T01:13:02.831730Z",
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
                                "billedDate": "2026-11-09T01:13:02.831730Z",
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
            "id": "9432bbc6-b7f6-4db3-bf35-01ade7702cbc",
            "shortId": "3113",
            "createdAt": "2026-11-08T23:11:18.361Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 82.9,
                "deliveryFee": 13.9,
                "serviceFee": -2.07
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "IFOOD",
                                "value": 6.95
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
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
                "totalValue": 13.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "CREDIT",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 84.97,
                        "card": {
                            "brand": "MASTERCARD"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "635150",
                            "nsu": "000119790907"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 80.86,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -2.7
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -2.07
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 84.97
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -6.29
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "3750ca6a-14c1-46c5-9e8b-8af829789e32",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T23:11:21.121Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "9dbb0caf-13b2-45a9-a191-51387ad08030",
                                "nsu": "000119790907",
                                "authCode": "635150"
                            }
                        ]
                    }
                },
                {
                    "id": "2c571797-09bd-4611-b991-49f3f109a3ec",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T23:11:22.181Z"
                },
                {
                    "id": "621e7fb1-a16b-4b33-943d-0f91079af19f",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T23:11:22.832235372Z"
                },
                {
                    "id": "09cecc7b-63de-4ee2-aac5-c77b7f9ae5f8",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T23:11:23.012432809Z"
                },
                {
                    "id": "2bd8756b-3841-4fbb-9d5a-ea8fb209eb96",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-09T00:00:03.060593837Z"
                },
                {
                    "id": "5fd1f979-7706-4e93-beb5-0150723267b5",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-09T00:00:03.571609728Z"
                },
                {
                    "id": "dbedf161-af1c-4cb4-91b2-aa30e1aa1118",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T05:23:53.765920596Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:00:03.677346Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:00:03.677346Z",
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
                                "amount": -2.7,
                                "feePercentage": "3",
                                "feeBaseValue": "89.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:00:03.677346Z",
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
                                "amount": -2.07,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:00:03.677346Z",
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
                                "amount": 84.97,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:00:03.677346Z",
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
                                "amount": -6.29,
                                "feePercentage": "7",
                                "feeBaseValue": "89.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:00:03.677346Z",
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
            "id": "d5c0bc91-fdb6-4336-8a5d-8a7e6238d7e3",
            "shortId": "5232",
            "createdAt": "2026-11-08T23:10:08.772Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 225.9,
                "deliveryFee": 13.9,
                "serviceFee": -3.99
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            },
                            {
                                "name": "EXTERNAL",
                                "value": 0
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
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
                "totalValue": 23.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "MEAL_VOUCHER",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 219.89,
                        "card": {
                            "brand": "ALELO"
                        },
                        "liability": "MERCHANT",
                        "transaction": {
                            "authCode": "515386",
                            "nsu": "003570001650"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": -3.22,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 16.95
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -16.3
                    },
                    {
                        "name": "REFUND_SERVICE_FEE",
                        "value": 0.12
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -3.99
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "c2ec4fb6-7146-4110-bcf5-94481b0c5507",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T23:10:11.156Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "4343bb89-e0f9-4d06-8dac-c649fe48c455",
                                "nsu": "003570001650",
                                "authCode": "515386"
                            }
                        ]
                    }
                },
                {
                    "id": "618faf59-161b-4ae1-b8c2-ce3f1d5b0dda",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T23:10:12.530Z"
                },
                {
                    "id": "5881d815-4677-405a-a3e2-ee0904348329",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T23:10:13.232284365Z"
                },
                {
                    "id": "e97a468f-fa40-4b27-8698-aa377871f484",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T23:10:13.665864999Z"
                },
                {
                    "id": "cea64681-9660-476c-957f-afa90eade123",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-09T00:10:25.572984338Z"
                },
                {
                    "id": "f64dc070-62b4-49bb-8b8b-f76b57f9ebd2",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-09T00:10:26.084718858Z"
                },
                {
                    "id": "0f82ef68-4f82-481b-a941-01320469c025",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T05:56:35.979937165Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 10,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:10:26.413981Z",
                                "hasTransferImpact": true,
                                "period": {
                                    "beginDate": "2026-11-02",
                                    "endDate": "2026-11-08"
                                },
                                "description": "IFOOD_SUBSIDY_TARGET_CART",
                                "liability": "EXTERNAL",
                                "paymentLiability": "OFFLINE"
                            },
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "ORDER_COMMISSION",
                                "amount": -16.3,
                                "feePercentage": "7",
                                "feeBaseValue": "232.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:10:26.413981Z",
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
                                "financialEntryName": "STORE_SUBSIDY",
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:10:26.413981Z",
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
                                "financialEntryName": "REFUND_SERVICE_FEE",
                                "amount": 0.12,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:10:26.413981Z",
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
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:10:26.413981Z",
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
                                "financialEntryName": "SERVICE_FEE",
                                "amount": -3.99,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:10:26.413981Z",
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
                                "financialEntryName": "ORDER_PAYMENT",
                                "amount": 219.89,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:10:26.413981Z",
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
            "id": "640ca323-03bd-46d2-8f18-df4e953dbd1a",
            "shortId": "4705",
            "createdAt": "2026-11-08T22:55:35.292Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 76.9,
                "deliveryFee": 13.9,
                "serviceFee": -1.92
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            },
                            {
                                "name": "EXTERNAL",
                                "value": 0
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
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
                "totalValue": 23.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
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
                        "value": 68.82,
                        "card": {
                            "brand": "VISA"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "553663",
                            "nsu": "553663"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 75.46,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 16.95
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -2.52
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -1.92
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 68.82
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -5.87
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "85750068-aefd-4214-a8ba-f6f516bb2822",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T22:55:37.318Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "6236a680-739f-40f4-8842-1f09b0822da7",
                                "nsu": "553663",
                                "authCode": "553663"
                            }
                        ]
                    }
                },
                {
                    "id": "803b4555-2ad4-4d3a-82e7-f613f4712a59",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T22:55:38.515Z"
                },
                {
                    "id": "13277826-f94b-4c0b-b9fe-9efd0dfee4ff",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T22:55:39.069264207Z"
                },
                {
                    "id": "1e8da3c7-e3de-40ae-a2b7-afbb1af0d0fa",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T22:55:39.330278303Z"
                },
                {
                    "id": "80f1b09c-1c3d-4cc9-b49d-3e892f5299d2",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-08T23:32:32.353Z"
                },
                {
                    "id": "6309d4f8-9687-4bbe-8a16-dcc0eddfa66f",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-08T23:40:16.966Z"
                },
                {
                    "id": "fd4500e6-ad58-4177-aa70-b231d6a1e6b9",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-08T23:49:59.061118341Z"
                },
                {
                    "id": "1286524f-b46d-46e2-996d-6a24b84cc838",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T23:49:59.573144276Z"
                },
                {
                    "id": "2c8927dc-04a8-454f-8562-4fcc820f46d6",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T04:58:11.677967174Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 10,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:49:59.738473Z",
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
                                "amount": -2.52,
                                "feePercentage": "3",
                                "feeBaseValue": "83.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:49:59.738473Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:49:59.738473Z",
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
                                "amount": -1.92,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:49:59.738473Z",
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
                                "amount": 68.82,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:49:59.738473Z",
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
                                "amount": -5.87,
                                "feePercentage": "7",
                                "feeBaseValue": "83.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:49:59.738473Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:49:59.738473Z",
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
            "id": "06ea998f-f989-4350-ac63-277a497130de",
            "shortId": "6538",
            "createdAt": "2026-11-08T22:30:36.484Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 131.8,
                "deliveryFee": 13.9,
                "serviceFee": -3.3
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "IFOOD",
                                "value": 6.95
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
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
                "totalValue": 13.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "PIX",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 135.1,
                        "liability": "IFOOD"
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 124.88,
                "billingEntries": [
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -9.71
                    },
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -3.3
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -4.16
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 135.1
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "77ee368f-5ee6-413d-af79-adacb89bd44d",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T22:31:17.245Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "ec54945c-5e78-4ff9-b537-be1bb84a41ff",
                                "nsu": "CONCLUIDA",
                                "authCode": null
                            }
                        ]
                    }
                },
                {
                    "id": "ce0ed4f6-1970-4d01-8fed-e9a8d8bfe18d",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T22:31:18.760Z"
                },
                {
                    "id": "9f7600a8-8126-49af-b822-ad06f0349b4d",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T22:31:19.475585367Z"
                },
                {
                    "id": "9f527268-2f03-4128-a54d-061e0d1b342c",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T22:31:19.713672806Z"
                },
                {
                    "id": "20d2ca31-5ea6-49d8-b503-5b4e8764e809",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-08T23:32:30.658Z"
                },
                {
                    "id": "4ab8f1b1-9509-491a-ae21-c1c65bdf3eb4",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-08T23:41:05.423Z"
                },
                {
                    "id": "817ee6ca-c99a-434e-89df-5b3d9466558c",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-09T00:05:39.000296684Z"
                },
                {
                    "id": "ab507ed3-6140-4730-80b6-64837fe73933",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-09T00:05:39.510529759Z"
                },
                {
                    "id": "c46e383c-22ce-42b6-9491-fc14dbfd9cfc",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T05:30:08.412825520Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "ORDER_COMMISSION",
                                "amount": -9.71,
                                "feePercentage": "7",
                                "feeBaseValue": "138.75",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:05:39.655281Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:05:39.655281Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:05:39.655281Z",
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
                                "amount": -3.3,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:05:39.655281Z",
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
                                "amount": -4.16,
                                "feePercentage": "3",
                                "feeBaseValue": "138.75",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:05:39.655281Z",
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
                                "amount": 135.1,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-09T00:05:39.655281Z",
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
            "id": "dde04513-c9cb-4e79-89c8-c38b4852b31c",
            "shortId": "1553",
            "createdAt": "2026-11-08T22:26:39.974Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 89.9,
                "deliveryFee": 13.9,
                "serviceFee": -2.25
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
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
                "totalValue": 23.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
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
                        "value": 82.15,
                        "card": {
                            "brand": "MASTERCARD"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "859980",
                            "nsu": "859980"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 87.16,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 16.95
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -2.25
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -6.78
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -2.91
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 82.15
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "d9f5d5dd-e8ab-49b8-a48f-fe8e50cc065b",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T22:26:42.938Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "16a0c75c-b5a1-4d8f-871a-a1bfa217aa2a",
                                "nsu": "859980",
                                "authCode": "859980"
                            }
                        ]
                    }
                },
                {
                    "id": "07df07a2-c399-4540-a82f-edb5e702faba",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T22:26:44.417Z"
                },
                {
                    "id": "f0019cc8-353b-4372-bbd2-8c3223cd8997",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T22:26:44.846671308Z"
                },
                {
                    "id": "3d1f5ba6-599e-4f61-afb2-ff3828eb3ce2",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T22:26:45.193261228Z"
                },
                {
                    "id": "63b8f070-ffe6-4491-ad87-d971bbe09abf",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-08T23:11:26.817491254Z"
                },
                {
                    "id": "1afa5770-3a24-4217-b4ed-17ab08ae3ba6",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T23:11:27.331371525Z"
                },
                {
                    "id": "f2bf32c0-19d0-4bb6-9711-a10abc885437",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T03:16:45.990423956Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "STORE_SUBSIDY",
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:11:27.483396Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:11:27.483396Z",
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
                                "amount": -2.25,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:11:27.483396Z",
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
                                "amount": -6.78,
                                "feePercentage": "7",
                                "feeBaseValue": "96.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:11:27.483396Z",
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
                                "amount": -2.91,
                                "feePercentage": "3",
                                "feeBaseValue": "96.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:11:27.483396Z",
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
                                "amount": 10,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:11:27.483396Z",
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
                                "amount": 82.15,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T23:11:27.483396Z",
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
            "id": "86920116-ea4b-494a-bcf1-e41a8a846312",
            "shortId": "0032",
            "createdAt": "2026-11-08T20:53:59.169Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 279,
                "deliveryFee": 13.9,
                "serviceFee": -3.99
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "ITEM",
                        "value": 69.75,
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
                                "value": 69.75
                            }
                        ]
                    },
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
                            },
                            {
                                "name": "EXTERNAL",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            }
                        ]
                    }
                ],
                "totalValue": 83.65
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "PIX",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 213.24,
                        "liability": "IFOOD"
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 194.58,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -6.49
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 213.24
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -3.99
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -15.13
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "876093e3-3898-47cb-ada9-03866a517802",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T20:54:29.278Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "2c032c28-7295-4308-95d7-d477d3a96041",
                                "nsu": "CONCLUIDA",
                                "authCode": null
                            }
                        ]
                    }
                },
                {
                    "id": "1aa2957f-813d-45f5-943b-5537a913d31a",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T20:54:30.736Z"
                },
                {
                    "id": "cf976354-e658-4682-a3fb-382cdb08680b",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T20:54:31.153066795Z"
                },
                {
                    "id": "111b067d-d796-4e7f-8ab5-2b4d8b482cf1",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T20:54:31.443782888Z"
                },
                {
                    "id": "6a74ae95-6ec0-4517-b4ae-71d83cf3be82",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-08T21:43:03.986Z"
                },
                {
                    "id": "84e0837b-4842-408c-96ba-491acc5acd1b",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-08T21:44:34.231Z"
                },
                {
                    "id": "ee545b1c-923d-4910-aa95-0c653b30bccb",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-08T22:15:15.823360284Z"
                },
                {
                    "id": "0e3aec15-55c8-45a5-9cd4-1146ad764662",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T22:15:16.337842774Z"
                },
                {
                    "id": "00d422f5-a730-44ca-8547-b4b8bd3e07c4",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T01:04:33.412968306Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:15:16.573563Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:15:16.573563Z",
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
                                "amount": -6.49,
                                "feePercentage": "3",
                                "feeBaseValue": "216.2",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:15:16.573563Z",
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
                                "amount": -69.75,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:15:16.573563Z",
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
                                "amount": 213.24,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:15:16.573563Z",
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
                                "billedDate": "2026-11-08T22:15:16.573563Z",
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
                                "amount": -15.13,
                                "feePercentage": "7",
                                "feeBaseValue": "216.2",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:15:16.573563Z",
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
            "id": "5aff3eb8-34c3-4dbb-87c7-21e6202c0624",
            "shortId": "7922",
            "createdAt": "2026-11-08T20:43:27.440Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 82.9,
                "deliveryFee": 13.9,
                "serviceFee": -2.07
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            },
                            {
                                "name": "EXTERNAL",
                                "value": 0
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
                            }
                        ]
                    }
                ],
                "totalValue": 13.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "MEAL_VOUCHER",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 84.97,
                        "card": {
                            "brand": "ALELO"
                        },
                        "liability": "MERCHANT",
                        "transaction": {
                            "authCode": "363737",
                            "nsu": "003569849232"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": -1.35,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -2.07
                    },
                    {
                        "name": "REFUND_SERVICE_FEE",
                        "value": 0.06
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -6.29
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "32e36ef5-d900-49b1-8c27-f40f5403e7ab",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T20:43:29.141Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "6ad7a4f1-0a97-4f62-bcd9-2eaa7e2d8f5e",
                                "nsu": "003569849232",
                                "authCode": "363737"
                            }
                        ]
                    }
                },
                {
                    "id": "7b5a3419-9228-4c86-b3e4-4b48a92e8e92",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T20:43:30.373Z"
                },
                {
                    "id": "f261ae46-d319-4e00-9288-5e19334be1f3",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T20:43:30.856331440Z"
                },
                {
                    "id": "fd6958a3-33c3-4504-8cb3-99aa9c4e3006",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T20:43:31.140327205Z"
                },
                {
                    "id": "99d8cf4f-b7db-4c03-87d8-c730cd609166",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-08T21:43:00.123Z"
                },
                {
                    "id": "43352001-5484-48bb-bd45-65eec91398cd",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-08T21:49:36.063Z"
                },
                {
                    "id": "9973e97b-6ad2-4bca-965e-8c5eca779ee2",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-08T21:59:48.630135242Z"
                },
                {
                    "id": "3f508da9-b552-4eda-a8d9-ef3241df961e",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T21:59:49.140793506Z"
                },
                {
                    "id": "9af3900f-4755-4e07-98b3-da4646ce306d",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T00:40:32.468082794Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:59:49.236100Z",
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
                                "financialEntryName": "ORDER_PAYMENT",
                                "amount": 84.97,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:59:49.236100Z",
                                "hasTransferImpact": false,
                                "period": {
                                    "beginDate": "2026-11-02",
                                    "endDate": "2026-11-08"
                                },
                                "description": "EXTERNAL_PAYMENT",
                                "liability": "EXTERNAL",
                                "paymentLiability": "OFFLINE"
                            },
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "SERVICE_FEE",
                                "amount": -2.07,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:59:49.236100Z",
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
                                "financialEntryName": "REFUND_SERVICE_FEE",
                                "amount": 0.06,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:59:49.236100Z",
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
                                "financialEntryName": "STORE_SUBSIDY",
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:59:49.236100Z",
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
                                "financialEntryName": "ORDER_COMMISSION",
                                "amount": -6.29,
                                "feePercentage": "7",
                                "feeBaseValue": "89.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:59:49.236100Z",
                                "hasTransferImpact": true,
                                "period": {
                                    "beginDate": "2026-11-02",
                                    "endDate": "2026-11-08"
                                },
                                "description": "DEDUCTION_COMMISSION",
                                "liability": "EXTERNAL",
                                "paymentLiability": "OFFLINE"
                            }
                        ]
                    }
                }
            ]
        },
        {
            "id": "f2360ca8-7f8a-411a-871f-6453c3631964",
            "shortId": "7878",
            "createdAt": "2026-11-08T20:40:21.712Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 255.9,
                "deliveryFee": 13.9,
                "serviceFee": -3.99
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "ITEM",
                        "value": 85.75,
                        "sponsorships": [
                            {
                                "name": "MERCHANT",
                                "value": 85.75
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
                                "value": 0
                            }
                        ]
                    },
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "MERCHANT",
                                "value": 6.95
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
                                "value": 6.95
                            }
                        ]
                    }
                ],
                "totalValue": 99.65
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "BANK_PAY",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 174.14,
                        "card": {
                            "brand": "NUBANK"
                        },
                        "liability": "IFOOD"
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 159.39,
                "billingEntries": [
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 174.14
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -12.4
                    },
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -3.99
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -5.31
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "e252cc62-6430-4efe-bea2-94e1302006ec",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T20:40:35.446Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "7bf0b03b-d8b2-4ae1-8c77-77457e61c108",
                                "nsu": null,
                                "authCode": null
                            }
                        ]
                    }
                },
                {
                    "id": "6134ecfb-e172-4c90-81b2-1eb6454f1e43",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T20:40:36.825Z"
                },
                {
                    "id": "d94f6a98-e235-4d84-a32a-4c29a69ad9df",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T20:40:37.251986174Z"
                },
                {
                    "id": "94a150cd-304e-4e53-a642-0a1c357145ca",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T20:40:37.478023571Z"
                },
                {
                    "id": "645f5012-b4b6-4ba2-b043-6d4825cde7ef",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-08T21:42:57.911Z"
                },
                {
                    "id": "7751694f-5377-4f85-81f5-a43a7fe28b38",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-08T21:49:07.011Z"
                },
                {
                    "id": "38ccf67a-5d35-4d21-81ef-3eefab5412f4",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-08T22:11:16.972899919Z"
                },
                {
                    "id": "d0c37272-c89b-40ec-ac08-54d75b96cf4f",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T22:11:17.485934315Z"
                },
                {
                    "id": "2708abac-b443-4c83-a376-4fbf865f427a",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T01:00:11.691261822Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "ORDER_PAYMENT",
                                "amount": 174.14,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:11:17.574875Z",
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
                                "amount": -85.75,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:11:17.574875Z",
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
                                "amount": -12.4,
                                "feePercentage": "7",
                                "feeBaseValue": "177.1",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:11:17.574875Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:11:17.574875Z",
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
                                "billedDate": "2026-11-08T22:11:17.574875Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:11:17.574875Z",
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
                                "amount": -5.31,
                                "feePercentage": "3",
                                "feeBaseValue": "177.1",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T22:11:17.574875Z",
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
            "id": "6aa47927-c1b2-4602-a5f6-851cfa9aab94",
            "shortId": "6022",
            "createdAt": "2026-11-08T20:31:00.323Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 349,
                "deliveryFee": 13.9,
                "serviceFee": -3.99
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "ITEM",
                        "value": 122.15,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 122.15
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
                    },
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            },
                            {
                                "name": "EXTERNAL",
                                "value": 0
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
                            }
                        ]
                    }
                ],
                "totalValue": 136.05
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "CREDIT",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 230.84,
                        "card": {
                            "brand": "VISA"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "549409",
                            "nsu": "000101756147"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 210.42,
                "billingEntries": [
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -16.37
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -7.01
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -3.99
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 230.84
                    },
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "210b6485-4c0e-4823-8c35-cb7071d5f3ef",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T20:31:02.852Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "e908bb63-d984-40f5-8b7b-febf4dbc52e2",
                                "nsu": "000101756147",
                                "authCode": "549409"
                            }
                        ]
                    }
                },
                {
                    "id": "ecb4a056-bc1e-4a61-9305-47b2e8cf2b9c",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T20:31:04.196Z"
                },
                {
                    "id": "f09a1836-abd6-4682-a4e1-371a5e3712d7",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T20:31:04.747667703Z"
                },
                {
                    "id": "2d14da08-3030-4f98-b8a5-fc976f26b334",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T20:31:05.029697228Z"
                },
                {
                    "id": "6a1e92eb-a042-4f2f-9d71-920af1943fef",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-08T21:41:44.183310902Z"
                },
                {
                    "id": "312a9b8f-2043-437f-9078-7f1b877c3d5a",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T21:41:44.695019567Z"
                },
                {
                    "id": "0b125120-37df-4216-9df5-cb863a5b84bb",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-09T00:20:54.552557484Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "STORE_SUBSIDY",
                                "amount": -122.15,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:41:44.817490Z",
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
                                "amount": -16.37,
                                "feePercentage": "7",
                                "feeBaseValue": "233.8",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:41:44.817490Z",
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
                                "amount": -7.01,
                                "feePercentage": "3",
                                "feeBaseValue": "233.8",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:41:44.817490Z",
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
                                "billedDate": "2026-11-08T21:41:44.817490Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:41:44.817490Z",
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
                                "amount": 230.84,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:41:44.817490Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T21:41:44.817490Z",
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
            "id": "ae4392da-f972-4272-a807-ea2a38c11ba8",
            "shortId": "1554",
            "createdAt": "2026-11-08T18:20:18.212Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 172.8,
                "deliveryFee": 13.9,
                "serviceFee": -3.99
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "MERCHANT",
                                "value": 6.95
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
                                "value": 6.95
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
                "totalValue": 23.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
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
                        "value": 166.79,
                        "card": {
                            "brand": "VISA_ELECTRON"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "EKDCFM",
                            "nsu": "EKDCFM"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 161.78,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 16.95
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -3.99
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -12.58
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -5.39
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 166.79
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "f7818446-a344-4da0-aa1d-caafa3bd8872",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T18:20:20.692Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "4f6a2e79-666d-4f05-aeeb-c41eddb22db0",
                                "nsu": "EKDCFM",
                                "authCode": "EKDCFM"
                            }
                        ]
                    }
                },
                {
                    "id": "3d042f73-a9ec-4919-8028-29f4c16a03fa",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T18:20:21.942Z"
                },
                {
                    "id": "2e3b5e02-b079-40fa-961e-134e6237e33a",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T18:20:22.442221108Z"
                },
                {
                    "id": "770e9b5e-3c70-4247-aa08-23f9108d93b0",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T18:20:22.708739202Z"
                },
                {
                    "id": "98a7cb89-b854-4042-8672-78677ac5cbeb",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-08T18:41:55.704Z"
                },
                {
                    "id": "ec787eba-dffe-4b6c-8679-78408182b066",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-08T18:59:11.015969267Z"
                },
                {
                    "id": "c61fc28f-5dec-410c-9fda-15805703c37b",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T18:59:11.527154430Z"
                },
                {
                    "id": "98cb236b-a666-46d2-a562-552e7b78bf15",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-08T21:06:10.470755740Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 10,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:59:11.647638Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:59:11.647638Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:59:11.647638Z",
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
                                "billedDate": "2026-11-08T18:59:11.647638Z",
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
                                "amount": -12.58,
                                "feePercentage": "7",
                                "feeBaseValue": "179.75",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:59:11.647638Z",
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
                                "amount": -5.39,
                                "feePercentage": "3",
                                "feeBaseValue": "179.75",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:59:11.647638Z",
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
                                "amount": 166.79,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:59:11.647638Z",
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
            "id": "4acdbb86-c1b5-4fa5-a43a-42a22a3703d5",
            "shortId": "3710",
            "createdAt": "2026-11-08T18:09:15.993Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 213.9,
                "deliveryFee": 13.9,
                "serviceFee": -3.99
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "MERCHANT",
                                "value": 6.95
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
                                "value": 6.95
                            }
                        ]
                    }
                ],
                "totalValue": 13.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
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
                        "value": 217.89,
                        "card": {
                            "brand": "MASTERCARD_MAESTRO"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "083197",
                            "nsu": "083197"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 198.76,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -3.99
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
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "2b2987a3-8770-42e7-868b-6f06bde054b4",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T18:09:19.095Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "55c6036a-518a-410c-98c3-ab942bede83c",
                                "nsu": "083197",
                                "authCode": "083197"
                            }
                        ]
                    }
                },
                {
                    "id": "c37cbd86-d201-41c6-9146-b7c62fccdeff",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T18:09:20.376Z"
                },
                {
                    "id": "bfee2c5c-6cb8-4ee2-abd7-b384c8620edc",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T18:09:20.973034725Z"
                },
                {
                    "id": "6ac566a7-1ce9-43bf-bb86-57ed9c40f7f8",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T18:09:21.276445769Z"
                },
                {
                    "id": "77e4a67a-1911-416a-bb18-aab6b999c1ba",
                    "fullCode": "HANDSHAKE_DISPUTE",
                    "code": "HSD",
                    "createdAt": "2026-11-08T18:11:55.487197472Z"
                },
                {
                    "id": "c662cfe5-d5a4-4ddf-80fd-edc624f35978",
                    "fullCode": "HANDSHAKE_SETTLEMENT",
                    "code": "HSS",
                    "createdAt": "2026-11-08T18:13:31.153740428Z"
                },
                {
                    "id": "f1552684-1216-4cf6-84cf-84b90d7ba7c1",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-08T18:41:53.422Z"
                },
                {
                    "id": "fa8c51ce-336e-4d98-8e70-247fb7c9bc44",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-08T18:43:03.497Z"
                },
                {
                    "id": "09fdef57-d6c0-48fb-92d8-8cd1c9e944be",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T19:12:19.742694705Z"
                },
                {
                    "id": "d82ae582-aace-4df5-81c8-4e7412bc21b9",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-08T21:19:18.958255010Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "STORE_SUBSIDY",
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T19:12:19.919105Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T19:12:19.919105Z",
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
                                "billedDate": "2026-11-08T19:12:19.919105Z",
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
                                "amount": -6.63,
                                "feePercentage": "3",
                                "feeBaseValue": "220.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T19:12:19.919105Z",
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
                                "billedDate": "2026-11-08T19:12:19.919105Z",
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
                                "feeBaseValue": "220.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T19:12:19.919105Z",
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
            "id": "d1e9f817-5b42-4a5e-ac58-9fe197905c61",
            "shortId": "8353",
            "createdAt": "2026-11-08T18:06:57.332Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 126.9,
                "deliveryFee": 13.9,
                "serviceFee": -3.17
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "IFOOD",
                                "value": 6.95
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
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
                "totalValue": 13.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "CREDIT",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 130.07,
                        "card": {
                            "brand": "VISA"
                        },
                        "liability": "IFOOD",
                        "transaction": {
                            "authCode": "VI2PHU",
                            "nsu": "128007471"
                        }
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 120.46,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 130.07
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -9.37
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -3.17
                    },
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -4.02
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "6de751b3-0311-4523-9b58-92580d0bbd73",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T18:07:04.086Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "b4c34b84-4663-4018-9b44-ae63dceb537e",
                                "nsu": "128007471",
                                "authCode": "VI2PHU"
                            }
                        ]
                    }
                },
                {
                    "id": "e0cecdba-8f1c-4db3-8273-b4622837774b",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T18:07:05.229Z"
                },
                {
                    "id": "a5741935-07fb-4ab7-9797-a8ead16df4b8",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T18:07:05.663000605Z"
                },
                {
                    "id": "0d3eb58d-78b4-4a0c-a91b-cffb75801b76",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T18:07:05.980137239Z"
                },
                {
                    "id": "17c9ce38-2f8d-4c95-b170-61a59cbe3605",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-08T18:18:20.152Z"
                },
                {
                    "id": "f5d1efb8-020e-487b-b943-f96a626c7d2e",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-08T18:18:26.585Z"
                },
                {
                    "id": "9b78ed66-6c79-45f3-9fbd-e8f65ff44afd",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-08T18:36:35.849495409Z"
                },
                {
                    "id": "35374b55-3046-4e70-80f5-4d8b1c7ea1d0",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T18:36:36.361283581Z"
                },
                {
                    "id": "d2cc9f07-a037-40f5-a411-dd61d0646d50",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-08T20:48:10.779170944Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:36:36.530250Z",
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
                                "amount": 130.07,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:36:36.530250Z",
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
                                "amount": -9.37,
                                "feePercentage": "7",
                                "feeBaseValue": "133.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:36:36.530250Z",
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
                                "amount": -3.17,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:36:36.530250Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:36:36.530250Z",
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
                                "amount": -4.02,
                                "feePercentage": "3",
                                "feeBaseValue": "133.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:36:36.530250Z",
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
            "id": "f353a3f7-b1a9-4c8d-9b17-137f4ecb5165",
            "shortId": "5609",
            "createdAt": "2026-11-08T18:02:09.313Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 92.9,
                "deliveryFee": 13.9,
                "serviceFee": -2.32
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            },
                            {
                                "name": "EXTERNAL",
                                "value": 0
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
                            }
                        ]
                    }
                ],
                "totalValue": 13.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "CREDIT",
                        "currency": "BRL",
                        "type": "OFFLINE",
                        "value": 95.22,
                        "card": {
                            "brand": "VISA"
                        },
                        "liability": "MERCHANT"
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": -2.29,
                "billingEntries": [
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -2.32
                    },
                    {
                        "name": "REFUND_SERVICE_FEE",
                        "value": 0.07
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -6.99
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "e4ab6760-eaf0-438e-baac-b262b1e6e36d",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T18:02:10.712Z"
                },
                {
                    "id": "ae082243-4154-46ae-bbb7-d62e309b58bf",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T18:02:11.230930914Z"
                },
                {
                    "id": "ee2bbfb8-a77f-4da9-bbc4-1a62722b946b",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T18:02:11.519673819Z"
                },
                {
                    "id": "94cb814b-b1e4-43fc-9793-214cc8753b64",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-08T18:23:05.852Z"
                },
                {
                    "id": "1a33c2c6-75d7-4989-908a-d887a6800933",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-08T18:23:20.126Z"
                },
                {
                    "id": "756e6801-bb29-41cb-98e9-b6edca3186b7",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T20:02:03.883744479Z"
                },
                {
                    "id": "686d087f-fa9e-4ecf-958f-71fb6455f38f",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-08T22:20:51.347284139Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "IFOOD_SUBSIDY",
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T20:02:04.058562Z",
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
                                "financialEntryName": "ORDER_PAYMENT",
                                "amount": 95.22,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T20:02:04.058562Z",
                                "hasTransferImpact": false,
                                "period": {
                                    "beginDate": "2026-11-02",
                                    "endDate": "2026-11-08"
                                },
                                "description": "EXTERNAL_PAYMENT",
                                "liability": "EXTERNAL",
                                "paymentLiability": "OFFLINE"
                            },
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "SERVICE_FEE",
                                "amount": -2.32,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T20:02:04.058562Z",
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
                                "financialEntryName": "REFUND_SERVICE_FEE",
                                "amount": 0.07,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T20:02:04.058562Z",
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
                                "financialEntryName": "STORE_SUBSIDY",
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T20:02:04.058562Z",
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
                                "financialEntryName": "ORDER_COMMISSION",
                                "amount": -6.99,
                                "feePercentage": "7",
                                "feeBaseValue": "99.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T20:02:04.058562Z",
                                "hasTransferImpact": true,
                                "period": {
                                    "beginDate": "2026-11-02",
                                    "endDate": "2026-11-08"
                                },
                                "description": "DEDUCTION_COMMISSION",
                                "liability": "EXTERNAL",
                                "paymentLiability": "OFFLINE"
                            }
                        ]
                    }
                }
            ]
        },
        {
            "id": "6efea832-f368-442a-b545-470eee74f1c2",
            "shortId": "6054",
            "createdAt": "2026-11-08T18:00:24.845Z",
            "type": "ORDER",
            "category": "FOOD",
            "salesChannel": "IFOOD",
            "currentStatus": "CONCLUDED",
            "merchant": {
                "id": "26d87001-a3d0-42f6-94e8-f5a1f90b1de0",
                "shortId": 1719263,
                "documents": [
                    {
                        "value": "5812",
                        "type": "MCC"
                    },
                    {
                        "value": "07698803635",
                        "type": "CPF"
                    },
                    {
                        "value": "42499502000159",
                        "type": "CNPJ"
                    }
                ],
                "name": "Coco Bambu Minas Shopping",
                "type": "RESTAURANT",
                "timezone": "Etc/GMT+3"
            },
            "saleGrossValue": {
                "bag": 225.9,
                "deliveryFee": 13.9,
                "serviceFee": -3.99
            },
            "benefits": {
                "benefits": [
                    {
                        "target": "DELIVERY_FEE",
                        "value": 13.9,
                        "sponsorships": [
                            {
                                "name": "CHAIN",
                                "value": 0
                            },
                            {
                                "name": "IFOOD",
                                "value": 6.95
                            },
                            {
                                "name": "EXTERNAL",
                                "value": 0
                            },
                            {
                                "name": "MERCHANT",
                                "value": 6.95
                            }
                        ]
                    }
                ],
                "totalValue": 13.9
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
                    "grossValue": 13.9,
                    "discount": 13.9,
                    "netValue": 0
                }
            },
            "payments": {
                "methods": [
                    {
                        "method": "PIX",
                        "currency": "BRL",
                        "type": "ONLINE",
                        "value": 229.89,
                        "liability": "IFOOD"
                    }
                ]
            },
            "orderStatusHistory": [],
            "billingSummary": {
                "saleBalance": 209.56,
                "billingEntries": [
                    {
                        "name": "PAYMENT_TRANSACTION_FEE",
                        "value": -6.99
                    },
                    {
                        "name": "IFOOD_SUBSIDY",
                        "value": 6.95
                    },
                    {
                        "name": "ORDER_PAYMENT",
                        "value": 229.89
                    },
                    {
                        "name": "ORDER_COMMISSION",
                        "value": -16.3
                    },
                    {
                        "name": "SERVICE_FEE",
                        "value": -3.99
                    }
                ]
            },
            "orderEvents": [
                {
                    "id": "e58da0da-a12b-448a-a55b-4e50144477eb",
                    "fullCode": "PAYMENT_APPROVED",
                    "code": "PA",
                    "createdAt": "2026-11-08T18:01:02.152Z",
                    "metadata": {
                        "authorizedPayments": [
                            {
                                "paymentId": "9d9016d3-a056-4e6f-b1d3-74ed077f1990",
                                "nsu": "CONCLUIDA",
                                "authCode": null
                            }
                        ]
                    }
                },
                {
                    "id": "331ef44f-4bd6-4e7f-b2d2-8e36e8f3c2b8",
                    "fullCode": "RECEIVED",
                    "code": "RC",
                    "createdAt": "2026-11-08T18:01:03.585Z"
                },
                {
                    "id": "429b0b09-8df4-4428-8b74-de2f5e980956",
                    "fullCode": "CONFIRMED",
                    "code": "CFM",
                    "createdAt": "2026-11-08T18:01:04.116882907Z"
                },
                {
                    "id": "ca52eb12-b036-4e00-8fc3-013ce7bb7f02",
                    "fullCode": "DELIVERY_DROP_CODE_REQUESTED",
                    "code": "DDCR",
                    "createdAt": "2026-11-08T18:01:04.361040610Z"
                },
                {
                    "id": "1dc507e8-697c-4d06-8525-a68411eca701",
                    "fullCode": "READY_TO_DELIVER",
                    "code": "RTD",
                    "createdAt": "2026-11-08T18:21:27.714Z"
                },
                {
                    "id": "2f584f9a-7fe7-4ac6-8d4d-6c187e4814eb",
                    "fullCode": "DISPATCHED",
                    "code": "DCL",
                    "createdAt": "2026-11-08T18:23:04.342Z"
                },
                {
                    "id": "1ae47774-d5a7-479b-bdf1-c231a965a860",
                    "fullCode": "DELIVERY_DROP_CODE_VALIDATION_SUCCESS",
                    "code": "DDCS",
                    "createdAt": "2026-11-08T18:46:36.950206553Z"
                },
                {
                    "id": "dcf419a5-92c0-4a01-98dd-64bc894bf3f0",
                    "fullCode": "CONCLUDED",
                    "code": "CON",
                    "createdAt": "2026-11-08T18:46:37.462874063Z"
                },
                {
                    "id": "599530d2-26db-4526-855b-d1edd1f1f5b4",
                    "fullCode": "FINANCIAL_BILLED_ORDER_ENTRY",
                    "code": "FBOE",
                    "createdAt": "2026-11-08T20:53:52.688654304Z",
                    "metadata": {
                        "entries": [
                            {
                                "triggerEventName": "ORDER_CONCLUDED",
                                "financialEntryName": "PAYMENT_TRANSACTION_FEE",
                                "amount": -6.99,
                                "feePercentage": "3",
                                "feeBaseValue": "232.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:46:37.555556Z",
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
                                "amount": -6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:46:37.555556Z",
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
                                "amount": 6.95,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:46:37.555556Z",
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
                                "amount": 229.89,
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:46:37.555556Z",
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
                                "amount": -16.3,
                                "feePercentage": "7",
                                "feeBaseValue": "232.85",
                                "expectedPaymentDate": "2026-12-02",
                                "billedDate": "2026-11-08T18:46:37.555556Z",
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
                                "billedDate": "2026-11-08T18:46:37.555556Z",
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
    "total": 71,
    "pageCount": 4
}

export { salesIfood }