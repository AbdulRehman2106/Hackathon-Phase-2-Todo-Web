# Skill: Secure Handling of Shared Secrets via Environment Variables

## Purpose
Establish secure practices for managing secrets (API keys, JWT secrets, database credentials) using environment variables across development and production environments.

## When to Use
- Setting up new projects with secrets
- Reviewing secret management practices
- Designing deployment configurations
- Auditing security of secret handling

## Instruction

### Principles of Secret Management

Every application handling secrets MUST follow these principles:

1. **Never in Code**: Secrets never appear in source code
2. **Never in Logs**: Secrets never appear in application logs
3. **Never in Repos**: Secrets never committed to version control
4. **Environment Isolation**: Different secrets per environment
5. **Least Privilege**: Access only to secrets needed

### Environment Variable Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECRET MANAGEMENT LAYERS                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Development │     │   Staging    │     │  Production  │
├──────────────┤     ├──────────────┤     ├──────────────┤
│ .env.local   │     │ .env.staging │     │ Vault/KMS    │
│ (gitignored) │     │ (encrypted)  │     │ (managed)    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────────────┼────────────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │   Application    │
                   │ process.env.*    │
                   │ os.environ[*]    │
                   └──────────────────┘
```

### Required Secrets for This Stack

```yaml
jwt_authentication:
  BETTER_AUTH_SECRET:
    description: Shared secret for JWT signing
    generation: openssl rand -base64 32
    usage: Both frontend (Better Auth) and backend (FastAPI)
    minimum_length: 32 characters
    rotation: Quarterly recommended

database:
  DATABASE_URL:
    description: PostgreSQL connection string
    format: postgresql://user:password@host:port/database
    usage: Backend (SQLModel/SQLAlchemy)
    contains: Credentials, host, database name

  NEON_API_KEY:
    description: Neon serverless API key (if using API)
    usage: Database management operations
    rotation: As needed

external_services:
  API_SECRET_KEY:
    description: Application-level API key for internal use
    generation: openssl rand -hex 32
    usage: Internal service authentication
```

### File Structure

```
project-root/
├── .env.example           # Template (committed, no real values)
├── .env.local             # Local development (gitignored)
├── .env.development       # Development defaults (gitignored)
├── .env.staging           # Staging (encrypted or gitignored)
├── .env.production        # NEVER exists locally
├── .gitignore             # Must include .env* patterns
│
├── apps/
│   ├── frontend/
│   │   └── .env.local     # Frontend-specific (gitignored)
│   └── backend/
│       └── .env           # Backend-specific (gitignored)
```

### .env.example Template

This file IS committed and serves as documentation:

```bash
# =============================================================================
# ENVIRONMENT CONFIGURATION TEMPLATE
# =============================================================================
# Copy this file to .env.local and fill in actual values
# NEVER commit actual secrets to version control
# =============================================================================

# -----------------------------------------------------------------------------
# Authentication
# -----------------------------------------------------------------------------
# JWT secret shared between frontend (Better Auth) and backend (FastAPI)
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-here-min-32-chars

# -----------------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------------
# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:5432/database

# -----------------------------------------------------------------------------
# Application
# -----------------------------------------------------------------------------
# Node environment
NODE_ENV=development

# API URL for frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# -----------------------------------------------------------------------------
# Optional: External Services
# -----------------------------------------------------------------------------
# Add other service credentials as needed
# STRIPE_SECRET_KEY=
# SENDGRID_API_KEY=
```

### .gitignore Requirements

```gitignore
# Environment files - CRITICAL
.env
.env.*
!.env.example

# Local overrides
*.local

# IDE files that might cache env
.idea/
.vscode/settings.json
```

### Secret Generation Guidelines

| Secret Type | Command | Length | Format |
|-------------|---------|--------|--------|
| JWT Secret | `openssl rand -base64 32` | 32+ bytes | Base64 |
| API Key | `openssl rand -hex 32` | 64 chars | Hex |
| Password | `openssl rand -base64 24` | 24+ bytes | Base64 |
| Session Secret | `openssl rand -hex 16` | 32 chars | Hex |

### Access Patterns by Language

#### Python (FastAPI/Backend)
```yaml
access_pattern:
  library: os.environ or pydantic Settings
  validation: Required at startup
  default_values: Only for non-secrets

design_requirements:
  - Validate secrets exist at app startup
  - Fail fast if required secrets missing
  - Never log secret values
  - Use type-safe settings classes
```

#### TypeScript (Next.js/Frontend)
```yaml
access_pattern:
  server_side: process.env.SECRET_NAME
  client_side: process.env.NEXT_PUBLIC_* only

design_requirements:
  - Only NEXT_PUBLIC_* exposed to browser
  - Server secrets in API routes only
  - Validate at build time where possible
  - Never expose secrets to client bundle
```

### Security Checklist

#### Repository
- [ ] .env* in .gitignore
- [ ] .env.example committed (no real values)
- [ ] No secrets in commit history
- [ ] Pre-commit hooks check for secrets

#### Development
- [ ] Different secrets per developer
- [ ] Secrets not shared via chat/email
- [ ] Local .env files not backed up to cloud
- [ ] IDE not syncing settings with secrets

#### Deployment
- [ ] Secrets injected via CI/CD
- [ ] Production secrets in secret manager
- [ ] No secrets in container images
- [ ] Secrets rotated on schedule

#### Runtime
- [ ] Secrets not logged
- [ ] Secrets not in error messages
- [ ] Secrets not exposed in API responses
- [ ] Memory cleared after secret use (where applicable)

### Rotation Strategy

```yaml
rotation_schedule:
  jwt_secrets:
    frequency: Quarterly
    process:
      1. Generate new secret
      2. Deploy to backend with both old+new
      3. Deploy to frontend with new
      4. Remove old secret from backend
    downtime: Zero (dual-secret period)

  database_credentials:
    frequency: Quarterly or on suspected breach
    process:
      1. Create new credentials in database
      2. Update secret manager
      3. Rolling restart of services
      4. Remove old credentials
    downtime: Zero (with proper connection handling)

  api_keys:
    frequency: Annually or on suspected breach
    process:
      1. Generate new key
      2. Update all consumers
      3. Revoke old key
    downtime: Possible brief window
```

### Troubleshooting Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Secret undefined | Not loaded | Check file exists and is loaded |
| Different in prod/dev | Wrong file | Verify environment-specific files |
| Exposed in logs | Console logging | Audit all log statements |
| In git history | Accidental commit | Rotate secret immediately |

## Output Format
Secret management guidelines and configuration templates suitable for project setup documentation.

## Related Skills
- jwt-structure-lifecycle
- design-jwt-verification
- identify-auth-security-risks
