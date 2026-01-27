# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Femiora seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to:
- **Security Team Email**: [security@your-domain.com] (update this with your actual email)

### What to Include

Please include the following information in your report:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours of submission
- **Status Update**: Within 7 days with an assessment of the report
- **Resolution Timeline**: Varies based on severity and complexity
  - Critical: 7-14 days
  - High: 14-30 days
  - Medium: 30-90 days
  - Low: Best effort basis

### What to Expect

1. We will acknowledge receipt of your vulnerability report
2. We will investigate and validate the vulnerability
3. We will work on a fix and prepare a security advisory
4. We will notify you when the fix is released
5. We may credit you in our security advisory (if you wish)

## Security Best Practices

When using Femiora:

- Keep your dependencies up to date
- Never commit sensitive information (API keys, passwords, tokens) to the repository
- Use environment variables for configuration secrets
- Review the `.env.example` file for required environment variables
- Enable two-factor authentication on your GitHub account
- Use HTTPS for all API communications

## Known Security Considerations

- **API Keys**: Store all API keys (Supabase, OpenRouter, Google GenAI, Stripe) in environment variables
- **JWT Tokens**: Ensure proper token expiration and validation
- **Rate Limiting**: Express rate limiting is configured; adjust based on your needs
- **CORS**: CORS is configured; review settings for your deployment environment
- **Helmet**: Security headers are configured via Helmet middleware

## Disclosure Policy

- We will coordinate public disclosure of the vulnerability with you
- We ask that you do not publicly disclose the vulnerability until we have released a fix
- We will credit security researchers who responsibly disclose vulnerabilities (unless they prefer to remain anonymous)

## Security Updates

Security updates will be released as patch versions. Subscribe to:
- GitHub Security Advisories for this repository
- GitHub Watch notifications
- Release notifications

## Contact

For general security questions or concerns, please open a GitHub discussion or contact the maintainers.
