import crypto from 'crypto';

// Simple HMAC verification helper. AgentKit/webhook callers can
// sign request bodies with an HMAC using a shared secret. This
// helper verifies the signature header: e.g. 'sha256=...'

export function verifyHmacSignature(secret, payload, signatureHeader) {
  if (!secret || !signatureHeader) return false;
  const [algo, sig] = signatureHeader.split('=');
  const h = crypto.createHmac(algo || 'sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(sig, 'hex'));
}
