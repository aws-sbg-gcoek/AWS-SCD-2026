import { createHmac, timingSafeEqual } from 'node:crypto';

function constantTimeHexEqual(received: string, expected: string): boolean {
  if (!/^[0-9a-f]+$/i.test(received) || received.length !== expected.length || received.length % 2 !== 0) {
    return false;
  }
  const receivedBuffer = Buffer.from(received, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return constantTimeHexEqual(signature, expected);
}

export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  const expected = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET ?? '').update(rawBody).digest('hex');
  return constantTimeHexEqual(signature, expected);
}
