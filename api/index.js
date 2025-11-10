import 'dotenv/config';
import { validateInput } from '../utils/validate.js';
import { generateMarketingContent } from '../tools/marketing_gen.js';
import { generateRequestId, createLogger } from '../utils/logging.js';

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
    
    // Check for dry run mode (explicit) or run in dry-run automatically if no API key
    const isDryRun = req.query?.dry_run === 'true' || !process.env.OPENAI_API_KEY;
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