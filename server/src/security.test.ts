import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyCheckoutSignature, verifyWebhookSignature } from './security.js';

// Security helper tests use placeholder secrets only; never use these in production.
process.env.RAZORPAY_KEY_SECRET ??= 'replace_me';
process.env.RAZORPAY_WEBHOOK_SECRET ??= 'replace_me';

test('checkout HMAC accepts the correct order/payment pair and rejects tampering', () => {
  const key = process.env.RAZORPAY_KEY_SECRET ?? 'replace_me';
  const orderId = 'order_test_123456';
  const paymentId = 'pay_test_123456';
  const signature = createHmac('sha256', key).update(`${orderId}|${paymentId}`).digest('hex');
  assert.equal(verifyCheckoutSignature(orderId, paymentId, signature), true);
  assert.equal(verifyCheckoutSignature(orderId, 'pay_test_other', signature), false);
  assert.equal(verifyCheckoutSignature(orderId, paymentId, 'not-a-signature'), false);
});

test('webhook HMAC validates raw bytes and rejects changed payloads', () => {
  const key = process.env.RAZORPAY_WEBHOOK_SECRET ?? 'replace_me';
  const body = Buffer.from('{"event":"payment.captured"}');
  const signature = createHmac('sha256', key).update(body).digest('hex');
  assert.equal(verifyWebhookSignature(body, signature), true);
  assert.equal(verifyWebhookSignature(Buffer.from('{"event":"payment.failed"}'), signature), false);
});
