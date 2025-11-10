import { jest } from '@jest/globals';
import handler from '../api/index.js';
import { validateOutput } from '../utils/validate.js';

const samplePayload = {
  tenant_id: "test_corp",
  audit_results: {
    compliance_score: 85.5,
    severity_critical: 0,
    severity_high: 3,
    severity_medium: 7,
    severity_low: 12,
    metadata: [
      {
        file: "index.html",
        line: 45,
        issue: "Missing alt text on image",
        suggestion: "Add descriptive alt text"
      }
    ]
  },
  patches: [
    {
      file: "index.html",
      line: 45,
      patch: "<img src=\"logo.png\" alt=\"Company logo\">"
    }
  ]
};

describe('WCAG Marketing Generator API', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      body: samplePayload
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('validates input schema', async () => {
    const invalidPayload = { ...samplePayload };
    delete invalidPayload.tenant_id;
    mockReq.body = invalidPayload;

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(422);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String),
        details: expect.any(Array)
      })
    );
  });

  test('handles dry run mode', async () => {
    mockReq.query = { dry_run: 'true' };

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      roi_summary: expect.any(String),
      pr_copy: expect.any(String),
      social_post: expect.any(String)
    });
  });

  test('generates valid marketing content', async () => {
    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    
    const response = mockRes.json.mock.calls[0][0];
    expect(() => validateOutput(response)).not.toThrow();
    
    expect(response).toEqual({
      roi_summary: expect.any(String),
      pr_copy: expect.any(String),
      social_post: expect.any(String)
    });
  });
});