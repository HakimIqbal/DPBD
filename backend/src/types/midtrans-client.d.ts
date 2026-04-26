declare module 'midtrans-client' {
  export interface SnapConfig {
    isProduction: boolean;
    serverKey?: string;
    clientKey?: string;
  }

  export interface CoreApiConfig {
    isProduction: boolean;
    serverKey?: string;
    clientKey?: string;
  }

  export interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface CustomerDetails {
    first_name: string;
    email: string;
    phone?: string;
  }

  export interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  export interface SnapParameter {
    transaction_details: TransactionDetails;
    customer_details: CustomerDetails;
    item_details: ItemDetail[];
    enabled_payments?: string[];
    callbacks?: {
      finish: string;
      error: string;
      pending: string;
    };
    expiry?: {
      unit: string;
      duration: number;
    };
  }

  export interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(config: SnapConfig);
    createTransaction(
      parameter: SnapParameter,
    ): Promise<SnapTransactionResponse>;
  }

  export interface CoreApiTransaction {
    status(orderId: string): Promise<any>;
  }

  export class CoreApi {
    transaction: CoreApiTransaction;
    constructor(config: CoreApiConfig);
  }
}
