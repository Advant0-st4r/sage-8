# Security notes for WCAG Marketing Generator

This repository has been hardened with short-term mitigations and a roadmap for permanent fixes.

Short-term mitigations applied
- Dependency overrides in `package.json` to pin transitive packages with known fixes.
- Production-only audit job (CI) that fails on high-severity issues. A stricter job for moderate severity is included in `prod-audit-strict`.
- Removed committed `.env` from the repository. Ensure you rotate any leaked keys immediately.

Next steps / owner actions
1. Rotate any leaked keys and set new keys in Vercel environment variables.
2. Monitor Dependabot PRs (configured weekly) and merge safe upgrades.
3. Replace in-memory rate limiter with Redis (already implemented toggle via `REDIS_URL`).
4. Remove overrides once upstream maintainers release fixed versions and tests pass.

Contact: repo maintainers for urgent security issues.
