# Skill: Design Indexes for Performance

## Purpose
Create effective database indexes that optimize query performance while minimizing overhead from index maintenance.

## When to Use
- Designing database schemas
- Optimizing slow queries
- Planning for scale
- Reviewing index strategies

## Instruction

### Index Fundamentals

Indexes improve query performance by:
- Reducing disk I/O for data retrieval
- Enabling efficient sorting operations
- Supporting unique constraints efficiently
- Accelerating join operations

### Index Types in PostgreSQL

```yaml
btree:
  description: Default index type, balanced tree structure
  best_for:
    - Equality comparisons (=)
    - Range queries (<, >, BETWEEN)
    - Sorting (ORDER BY)
    - Pattern matching (LIKE 'prefix%')
  example: CREATE INDEX ix_tasks_status ON tasks(status);

hash:
  description: Hash table structure
  best_for:
    - Equality comparisons only (=)
  limitations:
    - No range queries
    - Not crash-safe in older versions
  example: CREATE INDEX ix_tasks_status ON tasks USING hash(status);

gin:
  description: Generalized Inverted Index
  best_for:
    - Array containment (@>, <@)
    - JSONB queries
    - Full-text search
  example: CREATE INDEX ix_tasks_tags ON tasks USING gin(tags);

gist:
  description: Generalized Search Tree
  best_for:
    - Geometric data
    - Range types
    - Full-text search
  example: CREATE INDEX ix_locations_coords ON locations USING gist(coordinates);
```

### Indexing Strategies

#### Strategy 1: Foreign Key Indexes

Foreign keys should always be indexed for join performance.

```yaml
rule: Index all foreign key columns
reason: JOINs and cascading deletes use these columns

examples:
  - column: tasks.user_id
    index: CREATE INDEX ix_tasks_user_id ON tasks(user_id);
    benefit: Fast user task lookups, fast user deletion cascades

  - column: tasks.project_id
    index: CREATE INDEX ix_tasks_project_id ON tasks(project_id);
    benefit: Fast project task queries
```

#### Strategy 2: Frequently Filtered Columns

Columns used in WHERE clauses should be indexed.

```yaml
rule: Index columns frequently used in WHERE clauses
analysis: Review query patterns, check EXPLAIN output

examples:
  - column: tasks.status
    queries: WHERE status = 'pending'
    index: CREATE INDEX ix_tasks_status ON tasks(status);

  - column: tasks.due_date
    queries: WHERE due_date < NOW()
    index: CREATE INDEX ix_tasks_due_date ON tasks(due_date);
```

#### Strategy 3: Composite Indexes

Multiple columns queried together benefit from composite indexes.

```yaml
rule: Create composite indexes for common multi-column queries
order: Most selective column first, or match query pattern

examples:
  - query: WHERE user_id = ? AND status = ?
    index: CREATE INDEX ix_tasks_user_status ON tasks(user_id, status);
    note: Can also serve queries on user_id alone

  - query: WHERE user_id = ? ORDER BY created_at DESC
    index: CREATE INDEX ix_tasks_user_created ON tasks(user_id, created_at DESC);
```

#### Strategy 4: Covering Indexes

Include all columns needed by query to avoid table lookup.

```yaml
rule: Include frequently selected columns in index
benefit: Index-only scans (no table access)

example:
  query: SELECT id, title, status FROM tasks WHERE user_id = ?
  index: CREATE INDEX ix_tasks_user_covering ON tasks(user_id) INCLUDE (id, title, status);
  result: Entire query served from index
```

### Index Design for Common Patterns

```yaml
user_owned_resources:
  table: tasks
  indexes:
    - ix_tasks_user_id: (user_id)
      purpose: Filter by owner
    - ix_tasks_user_status: (user_id, status)
      purpose: Filter user's tasks by status
    - ix_tasks_user_due: (user_id, due_date)
      purpose: Sort user's tasks by due date

time_series_data:
  table: activity_logs
  indexes:
    - ix_logs_created: (created_at DESC)
      purpose: Recent activity queries
    - ix_logs_user_created: (user_id, created_at DESC)
      purpose: User's recent activity

searchable_content:
  table: documents
  indexes:
    - ix_docs_title_gin: USING gin(to_tsvector('english', title))
      purpose: Full-text title search
    - ix_docs_tags_gin: USING gin(tags)
      purpose: Tag array queries
```

### Index Maintenance Considerations

```yaml
write_overhead:
  issue: Each index slows INSERT/UPDATE/DELETE
  guidance:
    - Only create indexes that are used
    - Remove unused indexes
    - Monitor index usage statistics

storage_overhead:
  issue: Indexes consume disk space
  guidance:
    - Consider partial indexes for large tables
    - Use appropriate index types
    - Monitor index sizes

maintenance:
  reindex: Periodically rebuild fragmented indexes
  vacuum: Keep statistics current for query planner
  analyze: Update statistics after bulk operations
```

### Index Documentation Template

```markdown
## Table: tasks

### Index Strategy
This table supports a multi-user task management system where most queries
filter by user_id and frequently sort by status or due date.

### Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| pk_tasks | id | B-tree (unique) | Primary key |
| ix_tasks_user_id | user_id | B-tree | Ownership queries |
| ix_tasks_user_status | user_id, status | B-tree | Status filtering |
| ix_tasks_user_due | user_id, due_date | B-tree | Due date sorting |
| uq_tasks_user_title | user_id, title | B-tree (unique) | Prevent duplicate titles per user |

### Query Coverage

| Query Pattern | Index Used |
|---------------|------------|
| WHERE user_id = ? | ix_tasks_user_id |
| WHERE user_id = ? AND status = ? | ix_tasks_user_status |
| WHERE user_id = ? ORDER BY due_date | ix_tasks_user_due |
| WHERE id = ? | pk_tasks |

### Performance Notes
- Foreign key user_id indexed for fast user deletion cascades
- Composite indexes ordered user_id first for ownership queries
- No full-text indexes (simple LIKE queries on title acceptable)
```

### Index Checklist

#### Required Indexes
- [ ] Primary key index (automatic)
- [ ] Foreign key columns indexed
- [ ] Unique constraint columns indexed

#### Performance Indexes
- [ ] Frequently filtered columns indexed
- [ ] Frequently sorted columns indexed
- [ ] Common query combinations have composite indexes
- [ ] Full-text search columns have GIN index (if needed)

#### Verification
- [ ] EXPLAIN ANALYZE shows index usage
- [ ] No unused indexes
- [ ] Index sizes are reasonable
- [ ] Write performance acceptable

### Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Index every column | High write overhead | Only index as needed |
| No foreign key indexes | Slow JOINs | Always index FKs |
| Wrong column order in composite | Index not used | Order by selectivity |
| Duplicate indexes | Wasted space | Audit and remove |
| Missing partial indexes | Large index for rare cases | Use WHERE clause in index |

## Output Format
Index strategy documentation suitable for database design or plan.md.

## Related Skills
- relational-schema-design
- model-user-owned-resources
- orm-friendly-schema-planning
