// Autonomously patched by Google Antigravity Coding Agent
export interface PaymentRequest {
  id: string;
  amount: number;
  currency: string;
  idempotencyKey: string;
}

export class PaymentProcessor {
  private timeoutMs = 15000;

  async processPayment(req: PaymentRequest): Promise<{ success: boolean; transactionId: string }> {
    if (!req.idempotencyKey) {
      throw new Error('Missing required idempotency key');
    }
    return {
      success: true,
      transactionId: 'txn_' + req.id + '_' + Date.now()
    };
  }
}
