# Design Indexes for Performance

## Purpose
Guide the design and implementation of database indexes to optimize query performance while managing trade-offs.

## Skill Description
This skill provides knowledge for creating effective database indexes that speed up queries without excessive overhead on writes and storage.

## Index Fundamentals

### What is an Index?
A data structure that improves the speed of data retrieval operations on a database table.

**Analogy**: Like a book index - instead of reading every page to find a topic, you look it up in the index and jump to the right page.

### How Indexes Work

**Without Index**:
```
Query: SELECT * FROM tasks WHERE user_id = 123

Database scans every row (Sequential Scan):
Row 1: user_id = 456 ❌
Row 2: user_id = 123 ✓
Row 3: user_id = 789 ❌
...
Row 10000: user_id = 123 ✓

Time: O(n) - proportional to table size
```

**With Index**:
```
Query: SELECT * FROM tasks WHERE user_id = 123

Database uses index (Index Scan):
Index lookup: user_id = 123 → [Row 2, Row 10000]
Fetch only matching rows

Time: O(log n) - logarithmic lookup
```

### Index Trade-offs

**Benefits**:
- Faster SELECT queries
- Faster WHERE filtering
- Faster JOIN operations
- Faster ORDER BY sorting

**Costs**:
- Slower INSERT operations
- Slower UPDATE operations
- Slower DELETE operations
- Additional storage space
- Index maintenance overhead

## When to Create Indexes

### Always Index

**Primary Keys**:
- Automatically indexed
- Unique identifier for rows

**Foreign Keys**:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```
- Used in JOINs
- Used in WHERE clauses
- Critical for referential integrity

**Unique Constraints**:
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```
- Enforce uniqueness
- Speed up lookups

### Frequently Index

**WHERE Clause Columns**:
```sql
-- Query: SELECT * FROM tasks WHERE status = 'pending'
CREATE INDEX idx_tasks_status ON tasks(status);
```

**JOIN Columns**:
```sql
-- Query: SELECT * FROM tasks t JOIN users u ON t.user_id = u.id
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**ORDER BY Columns**:
```sql
-- Query: SELECT * FROM tasks ORDER BY created_at DESC
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
```

**GROUP BY Columns**:
```sql
-- Query: SELECT user_id, COUNT(*) FROM tasks GROUP BY user_id
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

### Consider Carefully

**Low Cardinality Columns**:
```sql
-- status has only 3 values: pending, in_progress, completed
-- Index may not be beneficial for full table scans
CREATE INDEX idx_tasks_status ON tasks(status);
```

**Frequently Updated Columns**:
- Index maintenance overhead on every update
- Consider if read performance gain worth write cost

**Large Text Columns**:
- Full-text search indexes instead
- Partial indexes on prefixes

## Index Types

### B-Tree Index (Default)

**Best For**:
- Equality comparisons (=)
- Range queries (<, >, <=, >=, BETWEEN)
- Sorting (ORDER BY)
- Pattern matching (LIKE 'prefix%')

**Syntax**:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**Use Cases**:
- Primary keys
- Foreign keys
- Numeric columns
- Date/time columns
- Text columns (exact match)

### Unique Index

**Purpose**: Enforce uniqueness and speed up lookups

**Syntax**:
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Use Cases**:
- Email addresses
- Usernames
- External IDs
- Any unique identifier

### Composite Index (Multi-Column)

**Purpose**: Index multiple columns together

**Syntax**:
```sql
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
```

**Column Order Matters**:
```sql
-- Index: (user_id, status)

-- ✓ Can use index
SELECT * FROM tasks WHERE user_id = 123;
SELECT * FROM tasks WHERE user_id = 123 AND status = 'pending';

-- ❌ Cannot use index efficiently
SELECT * FROM tasks WHERE status = 'pending';
```

**Rule**: Most selective column first, or most frequently queried column first

### Partial Index

**Purpose**: Index subset of rows

**Syntax**:
```sql
CREATE INDEX idx_active_tasks ON tasks(user_id)
WHERE deleted_at IS NULL;
```

**Benefits**:
- Smaller index size
- Faster index operations
- Targets specific queries

**Use Cases**:
```sql
-- Index only pending tasks
CREATE INDEX idx_pending_tasks ON tasks(user_id, created_at)
WHERE status = 'pending';

-- Index only recent records
CREATE INDEX idx_recent_tasks ON tasks(user_id)
WHERE created_at > NOW() - INTERVAL '30 days';
```

### Expression Index

**Purpose**: Index computed values

**Syntax**:
```sql
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
```

**Use Cases**:
```sql
-- Case-insensitive search
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
SELECT * FROM users WHERE LOWER(email) = 'user@example.com';

-- Date part extraction
CREATE INDEX idx_tasks_year ON tasks(EXTRACT(YEAR FROM created_at));
SELECT * FROM tasks WHERE EXTRACT(YEAR FROM created_at) = 2024;
```

### Full-Text Index (PostgreSQL)

**Purpose**: Text search

**Syntax**:
```sql
CREATE INDEX idx_tasks_search ON tasks
USING GIN(to_tsvector('english', title || ' ' || description));
```

**Use Cases**:
- Search functionality
- Document search
- Content search

## Composite Index Design

### Column Order Strategy

**Most Selective First**:
```sql
-- user_id is more selective than status
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
```

**Most Frequently Queried First**:
```sql
-- If always filtering by user_id, sometimes by status
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
```

### Covering Index

**Concept**: Index contains all columns needed for query

**Example**:
```sql
-- Query needs: user_id, status, title
CREATE INDEX idx_tasks_covering ON tasks(user_id, status, title);

-- Query can be satisfied entirely from index (Index-Only Scan)
SELECT title FROM tasks WHERE user_id = 123 AND status = 'pending';
```

**Benefits**:
- No table access needed
- Faster query execution
- Reduced I/O

**Trade-off**:
- Larger index size
- Slower writes

## Index Maintenance

### Analyze Index Usage

**PostgreSQL**:
```sql
-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

**Identify Unused Indexes**:
```sql
-- Indexes with zero scans
SELECT
    schemaname,
    tablename,
    indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE 'pg_%';
```

### Remove Unused Indexes

**Drop Index**:
```sql
DROP INDEX idx_unused_index;
```

**Considerations**:
- Monitor for period before dropping
- Check if used in specific scenarios
- Document reason for removal

### Rebuild Indexes

**When to Rebuild**:
- After bulk data changes
- Index bloat
- Performance degradation

**PostgreSQL**:
```sql
REINDEX INDEX idx_tasks_user_id;
REINDEX TABLE tasks;
```

## Query Optimization with Indexes

### Explain Plan Analysis

**Check Query Plan**:
```sql
EXPLAIN ANALYZE
SELECT * FROM tasks WHERE user_id = 123;
```

**Look For**:
- Seq Scan (bad for large tables)
- Index Scan (good)
- Index Only Scan (best)
- Bitmap Index Scan (good for multiple conditions)

**Example Output**:
```
Index Scan using idx_tasks_user_id on tasks
  (cost=0.29..8.31 rows=1 width=100)
  Index Cond: (user_id = 123)
```

### Index Hints

**Force Index Usage** (if needed):
```sql
-- PostgreSQL doesn't have index hints
-- But you can influence planner with:
SET enable_seqscan = off;
```

**Better Approach**: Fix statistics or query

## Common Index Patterns

### User-Owned Resources

```sql
-- Always filter by user_id
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Filter by user and status
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);

-- Filter by user and sort by date
CREATE INDEX idx_tasks_user_date ON tasks(user_id, created_at DESC);
```

### Time-Series Data

```sql
-- Recent data queries
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- User's recent data
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);

-- Partial index for recent data only
CREATE INDEX idx_recent_tasks ON tasks(created_at DESC)
WHERE created_at > NOW() - INTERVAL '90 days';
```

### Soft Delete Pattern

```sql
-- Index only non-deleted records
CREATE INDEX idx_active_tasks ON tasks(user_id)
WHERE deleted_at IS NULL;

-- Composite with status
CREATE INDEX idx_active_tasks_status ON tasks(user_id, status)
WHERE deleted_at IS NULL;
```

### Search Functionality

```sql
-- Prefix search
CREATE INDEX idx_tasks_title_prefix ON tasks(title text_pattern_ops);
SELECT * FROM tasks WHERE title LIKE 'prefix%';

-- Full-text search
CREATE INDEX idx_tasks_fulltext ON tasks
USING GIN(to_tsvector('english', title || ' ' || description));
SELECT * FROM tasks
WHERE to_tsvector('english', title || ' ' || description) @@ to_tsquery('search');
```

## Index Anti-Patterns

### 1. Over-Indexing

**Problem**: Too many indexes

**Issues**:
- Slow writes
- Wasted storage
- Maintenance overhead

**Solution**: Index only what's needed

### 2. Redundant Indexes

**Problem**: Multiple indexes covering same columns

**Example**:
```sql
-- Redundant
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);

-- The second index can handle queries on user_id alone
-- First index is redundant
```

**Solution**: Remove redundant indexes

### 3. Wrong Column Order

**Problem**: Composite index with wrong order

**Example**:
```sql
-- Wrong order for query
CREATE INDEX idx_tasks_status_user ON tasks(status, user_id);

-- Query always filters by user_id first
SELECT * FROM tasks WHERE user_id = 123 AND status = 'pending';

-- Better
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
```

### 4. Indexing Low Cardinality Columns

**Problem**: Index on column with few distinct values

**Example**:
```sql
-- Boolean column (only 2 values)
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- May not be beneficial
```

**Solution**: Use partial index or composite index

### 5. Not Indexing Foreign Keys

**Problem**: Missing indexes on foreign keys

**Impact**: Slow JOINs

**Solution**: Always index foreign keys

## Performance Testing

### Benchmark Queries

**Before Index**:
```sql
EXPLAIN ANALYZE
SELECT * FROM tasks WHERE user_id = 123;

-- Seq Scan on tasks (cost=0.00..1000.00 rows=100)
-- Execution time: 50.123 ms
```

**Create Index**:
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**After Index**:
```sql
EXPLAIN ANALYZE
SELECT * FROM tasks WHERE user_id = 123;

-- Index Scan using idx_tasks_user_id (cost=0.29..8.31 rows=100)
-- Execution time: 0.234 ms
```

### Load Testing

**Test Write Performance**:
```sql
-- Measure INSERT time with and without indexes
\timing on
INSERT INTO tasks (title, user_id) VALUES ('Test', 123);
```

**Test Read Performance**:
```sql
-- Measure SELECT time
\timing on
SELECT * FROM tasks WHERE user_id = 123;
```

## Best Practices

1. **Index Foreign Keys**: Always index columns used in JOINs

2. **Index WHERE Clauses**: Index columns frequently filtered

3. **Composite Indexes**: Order columns by selectivity

4. **Partial Indexes**: For subset queries

5. **Monitor Usage**: Remove unused indexes

6. **Analyze Queries**: Use EXPLAIN ANALYZE

7. **Test Impact**: Measure before and after

8. **Consider Trade-offs**: Balance read vs write performance

9. **Regular Maintenance**: Rebuild bloated indexes

10. **Document Decisions**: Why each index exists

## Index Checklist

For each table:
- [ ] Primary key indexed (automatic)
- [ ] Foreign keys indexed
- [ ] Unique constraints indexed
- [ ] Common WHERE columns indexed
- [ ] JOIN columns indexed
- [ ] ORDER BY columns considered
- [ ] Composite indexes for common queries
- [ ] Partial indexes for subset queries
- [ ] No redundant indexes
- [ ] Index usage monitored

## Success Criteria

Well-designed indexes provide:
- Fast query performance
- Acceptable write performance
- Efficient storage usage
- Maintainable index set
- Documented rationale
- Regular monitoring

---

**Application**: Use this skill when optimizing database performance, designing schemas, or troubleshooting slow queries.
