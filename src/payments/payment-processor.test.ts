import { PaymentProcessor } from './payment-processor';

describe('PaymentProcessor', () => {
  it('should process payment with idempotency key without timeout', async () => {
    const processor = new PaymentProcessor();
    const res = await processor.processPayment({
      id: 'req_123',
      amount: 4999,
      currency: 'INR',
      idempotencyKey: 'idem_key_999'
    });
    expect(res.success).toBe(true);
  });
});
