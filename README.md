# WCAG Marketing Generator

A production-ready MCP server that generates marketing assets from WCAG audit results, deployable on Vercel and integrated with OpenAI's AgentKit.

## Features

- Generate ROI summaries, PR copy, and social posts from WCAG audit data
- Strict schema validation using AJV
- Robust error handling and retries
- Structured logging with request tracking
- Contract tests for API validation
- Ready for AgentKit tool registration

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your keys:
   ```bash
   cp .env.example .env
   ```

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Deployment to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy:
   ```bash
   vercel
   ```

## AgentKit Tool Registration

Register this tool in your AgentKit configuration:

```json
{
  "id": "wcag_marketing_generator",
  "name": "WCAG Marketing Generator",
  "description": "Generates ROI summary, PR copy, and social post from WCAG audit+patch data.",
  "url": "https://<your-vercel-project>.vercel.app/api",
  "method": "POST",
  "input_schema": {
    "type": "object",
    "required": ["tenant_id", "audit_results", "patches"],
    "properties": {
      "tenant_id": { "type": "string" },
      "audit_results": {
        "type": "object",
        "required": ["compliance_score", "severity_critical", "severity_high", "severity_medium", "severity_low", "metadata"],
        "properties": {
          "compliance_score": { "type": "number" },
          "severity_critical": { "type": "number" },
          "severity_high": { "type": "number" },
          "severity_medium": { "type": "number" },
          "severity_low": { "type": "number" },
          "metadata": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["file", "line", "issue", "suggestion"],
              "properties": {
                "file": { "type": "string" },
                "line": { "type": "number" },
                "issue": { "type": "string" },
                "suggestion": { "type": "string" }
              }
            }
          }
        }
      },
      "patches": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["file", "line", "patch"],
          "properties": {
            "file": { "type": "string" },
            "line": { "type": "number" },
            "patch": { "type": "string" }
          }
        }
      }
    }
  },
  "output_schema": {
    "type": "object",
    "required": ["roi_summary", "pr_copy", "social_post"],
    "properties": {
      "roi_summary": { "type": "string" },
      "pr_copy": { "type": "string" },
      "social_post": { "type": "string" }
    }
  },
  "auth": { "type": "none" }
}
```

## Example Usage

```bash
curl -X POST https://<your-vercel-project>.vercel.app/api \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "example_corp",
    "audit_results": {
      "compliance_score": 85.5,
      "severity_critical": 0,
      "severity_high": 3,
      "severity_medium": 7,
      "severity_low": 12,
      "metadata": [
        {
          "file": "index.html",
          "line": 45,
          "issue": "Missing alt text on image",
          "suggestion": "Add descriptive alt text"
        }
      ]
    },
    "patches": [
      {
        "file": "index.html",
        "line": 45,
        "patch": "<img src=\"logo.png\" alt=\"Company logo\">"
      }
    ]
  }'
```

## Environment Variables

Required environment variables (see `.env.example`):
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-4)
- `AGENTKIT_TOOL_ID`: Tool ID for AgentKit registration

## Security

For production deployments:
1. Enable Vercel Protected Routes
2. Consider implementing mutual TLS or HMAC verification
3. Set up proper rate limiting
4. Use IP allowlisting for AgentKit calls

## Observability

The service emits structured logs with:
- request_id
- tenant_id
- step
- latency_ms
- status

To set up monitoring:
1. Configure Vercel project with your preferred logging service
2. Set up alerts on error rates and latency
3. Monitor rate limits and quota usage

## Contributing

1. Fork the repository
2. Create your feature branch
3. Run tests: `npm test`
4. Submit a pull request

## License

MIT