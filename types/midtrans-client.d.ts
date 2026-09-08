declare module "midtrans-client" {
  type SnapConfig = {
    isProduction: boolean;
    serverKey: string;
    clientKey?: string;
  };

  type SnapTransaction = {
    token: string;
    redirect_url: string;
  };

  class Snap {
    constructor(config: SnapConfig);
    createTransaction(parameter: {
      transaction_details: { order_id: string; gross_amount: number };
      item_details: Array<{ id: string; name: string; price: number; quantity: number }>;
    }): Promise<SnapTransaction>;
  }

  const midtransClient: { Snap: typeof Snap };
  export default midtransClient;
}
