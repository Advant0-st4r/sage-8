import OpenAI from 'openai';
import { parseJsonFromLLMOutput } from '../utils/parse_json.js';
import { validateOutput } from '../utils/validate.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const systemPrompt = `You are a professional marketing content generator specialized in web accessibility improvements. Your task is to generate three marketing assets based on WCAG audit results and applied fixes:

1. ROI Summary: Focus on business impact and measurable benefits
2. PR Copy: Professional announcement highlighting accessibility leadership
3. Social Post: Concise, shareable message about the improvements

Respond ONLY with a JSON object containing exactly these fields:
{
  "roi_summary": "...",
  "pr_copy": "...",
  "social_post": "..."
}

Keep the tone professional, ethical, and inclusive. Emphasize measurable improvements and commitment to accessibility.`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateMarketingContent(tenantId, auditResults, patches, logger) {
  // Lazily instantiate OpenAI client to avoid throwing at module import time
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const start = Date.now();
      
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: JSON.stringify({
              tenant_id: tenantId,
              audit_summary: {
                compliance_score: auditResults.compliance_score,
                issues_fixed: {
                  critical: auditResults.severity_critical,
                  high: auditResults.severity_high,
                  medium: auditResults.severity_medium,
                  low: auditResults.severity_low
                }
              },
              sample_improvements: patches.slice(0, 3)
            })
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
        top_p: 0.9
      });

      const content = response.choices[0].message.content;
      const parsedOutput = parseJsonFromLLMOutput(content);
      
      // Validate against our schema
      validateOutput(parsedOutput);
      
      logger.info('llm_response', {
        latency_ms: Date.now() - start,
        attempt,
        tokens_used: response.usage.total_tokens
      });
      
      return parsedOutput;
      
    } catch (error) {
      lastError = error;
      logger.error('llm_error', error, { attempt });
      
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}