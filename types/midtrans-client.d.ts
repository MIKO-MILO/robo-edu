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

  class CoreApi {
    constructor(config: SnapConfig);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    charge(payload: unknown): Promise<any>;
    transaction: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cancel: (orderId: string) => Promise<any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refund: (transactionId: string, payload: unknown) => Promise<any>;
    };
  }

  const midtransClient: { Snap: typeof Snap; CoreApi: typeof CoreApi };
  export default midtransClient;
}
