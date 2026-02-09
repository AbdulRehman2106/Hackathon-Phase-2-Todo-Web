# Skill: Validate Monorepo Structure for Spec-Kit Usage

## Purpose
Verify that a monorepo follows Spec-Kit conventions and best practices, ensuring proper organization for spec-driven development workflows.

## When to Use
- Setting up a new monorepo project
- Auditing existing project structure
- Onboarding to Spec-Kit methodology
- Troubleshooting spec reference issues

## Instruction

### Expected Monorepo Structure

A Spec-Kit compliant monorepo MUST have this structure:

```
project-root/
│
├── .specify/                       # Spec-Kit configuration
│   ├── memory/
│   │   └── constitution.md         # Project principles
│   ├── templates/                  # Document templates
│   │   ├── spec-template.md
│   │   ├── plan-template.md
│   │   ├── tasks-template.md
│   │   └── phr-template.prompt.md
│   └── scripts/                    # Automation scripts
│
├── specs/                          # All specifications
│   ├── index.md                    # Navigation index
│   ├── _shared/                    # Cross-cutting specs
│   │   ├── authentication.md
│   │   └── error-handling.md
│   └── <feature-name>/             # Feature specs
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
│
├── history/                        # Development history
│   ├── prompts/                    # Prompt History Records
│   │   ├── constitution/
│   │   ├── general/
│   │   └── <feature-name>/
│   └── adr/                        # Architecture Decision Records
│
├── apps/                           # Applications
│   ├── frontend/                   # Next.js application
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   └── backend/                    # FastAPI application
│       ├── src/
│       ├── pyproject.toml
│       └── ...
│
├── packages/                       # Shared packages (optional)
│   └── shared-types/
│
├── .claude/                        # Claude Code configuration
│   ├── settings.json
│   └── skills/                     # Skill definitions
│
├── CLAUDE.md                       # Claude Code instructions
├── package.json                    # Root package.json (if using npm workspaces)
└── README.md
```

### Validation Checklist

#### Required Directories
- [ ] `.specify/` directory exists
- [ ] `.specify/memory/constitution.md` exists
- [ ] `specs/` directory exists
- [ ] `specs/index.md` exists
- [ ] `history/prompts/` directory exists
- [ ] `history/adr/` directory exists
- [ ] `apps/` directory exists (or equivalent)

#### Constitution File
- [ ] Contains project overview
- [ ] Defines code standards
- [ ] Lists technology choices
- [ ] Establishes team conventions
- [ ] Is version controlled

#### Spec Organization
- [ ] Each feature has dedicated folder in `specs/`
- [ ] Feature folders use kebab-case naming
- [ ] `spec.md` exists for defined features
- [ ] `plan.md` exists for planned features
- [ ] `tasks.md` exists for features in implementation
- [ ] Cross-cutting concerns in `specs/_shared/`

#### History Structure
- [ ] PHRs organized by category
- [ ] ADRs numbered sequentially
- [ ] No orphaned history files

#### Application Structure
- [ ] Frontend and backend clearly separated
- [ ] Each app has its own dependency management
- [ ] Shared code in `packages/` (if any)

### Common Structure Issues

| Issue | Problem | Solution |
|-------|---------|----------|
| Flat specs | All specs in root of specs/ | Create feature folders |
| Missing index | No specs/index.md | Create navigation index |
| Mixed concerns | Specs mixed with code | Separate into specs/ directory |
| No constitution | Missing project principles | Create constitution.md |
| Orphan PHRs | PHRs not in proper folders | Organize by category |

### Validation Commands

#### Check Directory Structure
```bash
# Verify required directories exist
ls -la .specify/ specs/ history/ apps/
```

#### Find Orphaned Specs
```bash
# Specs not in feature folders
find specs/ -maxdepth 1 -name "*.md" ! -name "index.md"
```

#### Validate Spec References
```bash
# Find broken @specs references
grep -r "@specs/" . --include="*.md" | grep -v "specs/"
```

### Monorepo Configuration

#### Package Manager Setup (if using workspaces)
```json
// package.json
{
  "name": "project-root",
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

#### Git Ignore Patterns
```gitignore
# Dependencies
node_modules/
.venv/
__pycache__/

# Build outputs
.next/
dist/

# Environment
.env
.env.local

# IDE
.idea/
.vscode/
```

### Recovery Actions

If validation fails:

1. **Missing .specify/**: Run Spec-Kit initialization
2. **Missing constitution**: Create from template
3. **Disorganized specs**: Restructure into feature folders
4. **Missing index**: Generate from existing specs
5. **Missing history dirs**: Create directory structure

## Output Format
Validation report with checklist results and remediation recommendations.

## Related Skills
- organize-monorepo-specs
- write-feature-specification
- design-fullstack-architecture
