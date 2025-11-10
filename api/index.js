import 'dotenv/config';
import { validateInput } from '../utils/validate.js';
import { generateMarketingContent } from '../tools/marketing_gen.js';
import { generateRequestId, createLogger } from '../utils/logging.js';
import { rateLimit } from '../utils/rate_limiter.js';
import { verifyHmacSignature } from '../utils/security.js';

export default async function handler(req, res) {
  const requestId = generateRequestId();
  
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tenant_id, audit_results, patches } = req.body;
    
    // Create logger instance
    const logger = createLogger(requestId, tenant_id);
    logger.info('request_received', { body: req.body });
    
    // Validate input
    validateInput(req.body);

    // Optional: basic rate limiting per tenant
    try {
      const limiterKey = tenant_id || req.ip || req.socket?.remoteAddress || requestId;
      const rl = rateLimit(limiterKey, { tokens: process.env.MAX_REQUESTS_PER_MINUTE ? Number(process.env.MAX_REQUESTS_PER_MINUTE) : 60 });
      if (!rl.allowed) {
        logger.info('rate_limited', { remaining: rl.remaining });
        return res.status(429).json({ error: 'Rate limit exceeded', request_id: requestId });
      }
    } catch (e) {
      // rate limiter should never block the request path on errors
      logger.error('rate_limiter_error', e);
    }

    // Optional: verify HMAC if a secret is provided
    if (process.env.AGENTKIT_HMAC_SECRET) {
      const sig = req.headers['x-signature'] || req.headers['x-hub-signature'];
      const ok = verifyHmacSignature(process.env.AGENTKIT_HMAC_SECRET, JSON.stringify(req.body), sig);
      if (!ok) return res.status(401).json({ error: 'Invalid signature', request_id: requestId });
    }
    
  // Check for dry run mode (explicit), test environment, or run in dry-run automatically if no API key
  // This ensures tests and local development without keys won't call external APIs.
  const isDryRun = req.query?.dry_run === 'true' || !process.env.OPENAI_API_KEY || process.env.NODE_ENV === 'test';
    if (isDryRun) {
      logger.info('dry_run_mode', { reason: process.env.OPENAI_API_KEY ? 'explicit' : 'no_api_key' });
      return res.status(200).json({
        roi_summary: "This is a dry run ROI summary placeholder",
        pr_copy: "This is a dry run PR copy placeholder",
        social_post: "This is a dry run social post placeholder"
      });
    }
    
    // Generate marketing content
    const result = await generateMarketingContent(
      tenant_id,
      audit_results,
      patches,
      logger
    );
    
    logger.info('request_completed');
    return res.status(200).json(result);
    
  } catch (error) {
    const status = error.status || 500;
    const errorResponse = {
      error: error.message,
      request_id: requestId
    };
    
    if (error.details) {
      errorResponse.details = error.details;
    }
    
    return res.status(status).json(errorResponse);
  }
}