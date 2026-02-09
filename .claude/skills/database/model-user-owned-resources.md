# Skill: Model User-Owned Resources

## Purpose
Design database schemas that properly represent user ownership of resources, ensuring data isolation and supporting authorization requirements.

## When to Use
- Designing multi-user application schemas
- Establishing ownership patterns for resources
- Planning user data isolation at database level
- Creating schemas for user-centric applications

## Instruction

### User-Owned Resource Principles

Resources owned by users MUST:

1. **Have explicit owner reference**: Foreign key to users table
2. **Support isolation queries**: Easy to filter by owner
3. **Cascade appropriately**: Handle user deletion
4. **Enable authorization**: Support ownership checks

### Ownership Pattern Types

#### Pattern 1: Direct Ownership

The resource belongs to exactly one user.

```yaml
pattern: Direct Ownership
use_case: Personal resources (tasks, notes, settings)

schema_design:
  table: tasks
  ownership_column: user_id
  relationship: Many tasks belong to one user

characteristics:
  - user_id is NOT NULL
  - user_id is foreign key to users(id)
  - user_id is indexed for query performance
  - ON DELETE CASCADE or RESTRICT based on requirements
```

```sql
-- Direct ownership schema
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ownership queries
CREATE INDEX ix_tasks_user_id ON tasks(user_id);
```

#### Pattern 2: Hierarchical Ownership

Resource ownership is inherited through a parent.

```yaml
pattern: Hierarchical Ownership
use_case: Nested resources (tasks in projects, items in lists)

schema_design:
  parent_table: projects
  parent_ownership: projects.user_id
  child_table: tasks
  child_reference: tasks.project_id
  inherited_ownership: Through project

characteristics:
  - Child does not have direct user_id
  - Ownership determined by following parent chain
  - Queries join to parent for ownership check
```

```sql
-- Hierarchical ownership schema
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    -- No user_id, ownership through project
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ownership query requires join
-- SELECT t.* FROM tasks t
-- JOIN projects p ON t.project_id = p.id
-- WHERE p.user_id = :user_id AND t.id = :task_id
```

#### Pattern 3: Shared Ownership

Resource can be owned by one user but shared with others.

```yaml
pattern: Shared Ownership
use_case: Collaborative resources (shared documents, team projects)

schema_design:
  resource_table: documents
  owner_column: owner_id (primary owner)
  permissions_table: document_shares
  permission_columns: [document_id, user_id, permission_level]

characteristics:
  - Primary owner has full control
  - Additional users granted specific permissions
  - Permission levels define access (read, write, admin)
```

```sql
-- Shared ownership schema
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE document_shares (
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_level VARCHAR(20) NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (document_id, user_id),
    CHECK (permission_level IN ('read', 'write', 'admin'))
);

-- Access query checks ownership OR permission
-- SELECT d.* FROM documents d
-- WHERE d.id = :document_id
-- AND (d.owner_id = :user_id OR EXISTS (
--     SELECT 1 FROM document_shares ds
--     WHERE ds.document_id = d.id
--     AND ds.user_id = :user_id
-- ))
```

### Ownership Design Template

```markdown
## Resource: [Resource Name]

### Ownership Model
- **Pattern**: [Direct/Hierarchical/Shared]
- **Owner Reference**: [Column or path to owner]
- **Cascade Behavior**: [CASCADE/RESTRICT/SET NULL]

### Schema Definition
| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID NOT NULL | Owner reference |
| ... | ... | ... |

### Ownership Queries

**List user's resources:**
```sql
SELECT * FROM [table] WHERE user_id = :user_id
```

**Verify ownership:**
```sql
SELECT * FROM [table] WHERE id = :id AND user_id = :user_id
```

### Authorization Integration
- Create: Assign user_id from authenticated user
- Read: Filter by user_id
- Update: Verify user_id matches before update
- Delete: Verify user_id matches before delete
```

### Deletion Cascade Strategies

```yaml
cascade_options:

  CASCADE:
    behavior: Delete child records when parent deleted
    use_when: Child records have no meaning without parent
    example: Tasks deleted when user deleted

  RESTRICT:
    behavior: Prevent parent deletion if children exist
    use_when: Deletion should be explicit decision
    example: Prevent user deletion if has active subscriptions

  SET_NULL:
    behavior: Set foreign key to NULL when parent deleted
    use_when: Child records should persist but lose reference
    example: Keep audit logs but remove user reference

  NO_ACTION:
    behavior: Similar to RESTRICT, checked at end of transaction
    use_when: Triggers or other logic handles deletion
```

### Multi-Tenant Considerations

For applications with team/organization ownership:

```yaml
tenant_ownership:
  levels:
    - user: Individual resources
    - team: Team-shared resources
    - organization: Organization-wide resources

  schema_approach:
    user_resources:
      ownership: user_id
    team_resources:
      ownership: team_id
      membership: team_members(team_id, user_id)
    organization_resources:
      ownership: organization_id
      membership: organization_members(org_id, user_id, role)
```

### Query Patterns for Ownership

```yaml
common_queries:

  list_owned:
    purpose: Get all resources owned by user
    pattern: SELECT * FROM resources WHERE user_id = :user_id

  get_owned:
    purpose: Get specific resource if owned
    pattern: SELECT * FROM resources WHERE id = :id AND user_id = :user_id

  count_owned:
    purpose: Count user's resources
    pattern: SELECT COUNT(*) FROM resources WHERE user_id = :user_id

  update_owned:
    purpose: Update resource if owned
    pattern: UPDATE resources SET ... WHERE id = :id AND user_id = :user_id

  delete_owned:
    purpose: Delete resource if owned
    pattern: DELETE FROM resources WHERE id = :id AND user_id = :user_id
```

### Ownership Checklist

- [ ] Every user-owned resource has user_id column
- [ ] user_id is NOT NULL (unless shared ownership pattern)
- [ ] user_id has foreign key constraint to users table
- [ ] user_id is indexed for query performance
- [ ] ON DELETE behavior is explicitly defined
- [ ] Application queries filter by user_id
- [ ] user_id is never accepted from API request body

## Output Format
User ownership schema documentation suitable for database design or plan.md.

## Related Skills
- relational-schema-design
- multi-user-data-isolation
- design-indexes-performance
