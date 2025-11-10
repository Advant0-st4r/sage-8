import crypto from 'crypto';

export function generateRequestId() {
  return crypto.randomBytes(16).toString('hex');
}

export function createLogger(requestId, tenantId) {
  return {
    info: (step, data = {}) => {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        request_id: requestId,
        tenant_id: tenantId,
        step,
        ...data
      }));
    },
    
    error: (step, error, data = {}) => {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        request_id: requestId,
        tenant_id: tenantId,
        step,
        error: error.message,
        stack: error.stack,
        ...data
      }));
    }
  };
}