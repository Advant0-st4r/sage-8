export function parseJsonFromLLMOutput(text) {
  try {
    // First try direct JSON parse
    return JSON.parse(text);
  } catch (e) {
    // Strip code blocks
    const withoutCodeBlocks = text.replace(/```json\n|\n```/g, '');
    
    try {
      return JSON.parse(withoutCodeBlocks);
    } catch (e) {
      // Find first { to last }
      const match = withoutCodeBlocks.match(/{[\s\S]*}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (e) {
          throw new Error('Failed to parse JSON from LLM output');
        }
      }
      throw new Error('No JSON object found in LLM output');
    }
  }
}