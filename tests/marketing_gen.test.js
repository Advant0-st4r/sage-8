import { jest } from '@jest/globals';

describe('marketing_gen unit', () => {
  test('parses LLM JSON and returns structured output', async () => {
    const fakeResponse = {
      choices: [
        { message: { content: JSON.stringify({ roi_summary: 'ROI', pr_copy: 'PR', social_post: 'SOC' }) } }
      ],
      usage: { total_tokens: 123 }
    };

    // Use the ESM mock API to replace the module before importing the module under test
    await jest.unstable_mockModule('../utils/openai_client.js', () => ({
      createChatCompletion: jest.fn().mockResolvedValue(fakeResponse)
    }));

    const { generateMarketingContent } = await import('../tools/marketing_gen.js');

    const logger = { info: () => {}, error: () => {} };

    const out = await generateMarketingContent('t', { compliance_score: 90, severity_critical: 0, severity_high: 1, severity_medium:2, severity_low:3, metadata: [] }, [], logger);

    expect(out).toEqual({ roi_summary: 'ROI', pr_copy: 'PR', social_post: 'SOC' });
  });
});
