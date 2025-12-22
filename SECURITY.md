# Security Policy

## 🔒 Supported Versions

This project is actively maintained. Security updates will be applied to the latest version.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## 🚨 Reporting a Vulnerability

We take the security of this project seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please report security issues via email to:

📧 **brindatommy@gmail.com**

### What to Include

Please include the following information in your report:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up questions

### Response Timeline

- **Initial Response**: Within 48 hours of receiving your report
- **Status Update**: Within 7 days with an assessment of the issue
- **Resolution**: We aim to release a fix within 30 days for confirmed vulnerabilities

### Security Best Practices

When using this project, please ensure:

1. **Environment Variables**: Never commit `.env` files or expose sensitive credentials
2. **Dependencies**: Keep all npm packages up to date (`npm audit` regularly)
3. **API Keys**: Rotate API keys and secrets periodically
4. **Production Deployment**: Use different credentials for development and production
5. **HTTPS**: Always use HTTPS in production environments

## 🛡️ Security Measures

This project implements the following security measures:

- ✅ NextAuth.js for secure authentication
- ✅ Environment variable configuration for sensitive data
- ✅ Input validation and sanitization
- ✅ Secure payment processing via Stripe
- ✅ CSRF protection
- ✅ SQL injection prevention via Prisma ORM
- ✅ Secure session management

## 📝 Security Updates

Security updates and patches will be documented in the project's release notes and changelog.

## 🙏 Acknowledgments

We appreciate the security research community's efforts in keeping our project secure. Responsible disclosure is greatly appreciated.

---

**Thank you for helping keep Antichità Barbaglia secure!**
