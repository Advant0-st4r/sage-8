import OpenAI from 'openai';

function createClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Wrap the OpenAI chat completion call and translate parameters when
// needed (older SDKs/models accept `max_tokens`, newer ones may
// expect `max_completion_tokens`). We retry once with a translated
// payload on a known unsupported-parameter error.
export async function createChatCompletion(params) {
  const client = createClient();

  try {
    // Preferred shape for many SDKs
    return await client.chat.completions.create(params);
  } catch (err) {
    // If the model rejects `max_tokens`, retry with `max_completion_tokens`.
    const msg = String(err?.message || '');
    if (msg.includes("Unsupported parameter: 'max_tokens'") && params.max_tokens) {
      const retryParams = { ...params };
      retryParams.max_completion_tokens = retryParams.max_tokens;
      delete retryParams.max_tokens;
      return await client.chat.completions.create(retryParams);
    }
    throw err;
  }
}

// Export a small helper that can be mocked in tests
export function __createClientForTest(client) {
  // Allows tests to inject a fake client
  return client;
}
