import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

export const inputSchema = {
  type: 'object',
  required: ['tenant_id', 'audit_results', 'patches'],
  properties: {
    tenant_id: { type: 'string' },
    audit_results: {
      type: 'object',
      required: ['compliance_score', 'severity_critical', 'severity_high', 'severity_medium', 'severity_low', 'metadata'],
      properties: {
        compliance_score: { type: 'number' },
        severity_critical: { type: 'number' },
        severity_high: { type: 'number' },
        severity_medium: { type: 'number' },
        severity_low: { type: 'number' },
        metadata: {
          type: 'array',
          maxItems: 200,
          items: {
            type: 'object',
            required: ['file', 'line', 'issue', 'suggestion'],
            properties: {
              file: { type: 'string' },
              line: { type: 'number' },
              issue: { type: 'string' },
              suggestion: { type: 'string' }
            }
          }
        }
      }
    },
    patches: {
      type: 'array',
      items: {
        type: 'object',
        required: ['file', 'line', 'patch'],
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          patch: { type: 'string' }
        }
      }
    }
  }
};

export const outputSchema = {
  type: 'object',
  required: ['roi_summary', 'pr_copy', 'social_post'],
  properties: {
    roi_summary: { type: 'string', maxLength: 2000 },
    pr_copy: { type: 'string', maxLength: 2000 },
    social_post: { type: 'string', maxLength: 280 }
  }
};

export const validateInput = (data) => {
  const validate = ajv.compile(inputSchema);
  const valid = validate(data);
  
  if (!valid) {
    const error = new Error('Invalid input data');
    error.status = 422;
    error.details = validate.errors;
    throw error;
  }
  
  return true;
};

export const validateOutput = (data) => {
  const validate = ajv.compile(outputSchema);
  const valid = validate(data);
  
  if (!valid) {
    const error = new Error('Invalid output data from LLM');
    error.status = 502;
    error.details = validate.errors;
    throw error;
  }
  
  return true;
};