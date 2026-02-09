# Skill: Next.js App Router Mental Models

## Purpose
Establish clear mental models for Next.js App Router architecture, helping developers understand routing, rendering, and data fetching patterns.

## When to Use
- Learning Next.js App Router concepts
- Planning page and layout structure
- Deciding between rendering strategies
- Troubleshooting App Router behavior

## Instruction

### App Router Core Concepts

#### File-System Routing

```yaml
mental_model: Folders = Routes, Files = UI

structure:
  folder: Creates route segment
  page.tsx: Makes folder publicly accessible
  layout.tsx: Shared UI wrapper
  loading.tsx: Loading UI
  error.tsx: Error boundary
  not-found.tsx: 404 page

example:
  folder: app/tasks/[id]/
  url: /tasks/123
  files:
    page.tsx: Main content
    layout.tsx: Task detail layout
    loading.tsx: Loading skeleton
    error.tsx: Error boundary
```

#### Route Groups

```yaml
mental_model: Organize without affecting URL

syntax: (groupName)
purpose:
  - Logical organization
  - Different layouts per group
  - Keep URL clean

example:
  structure:
    app/(auth)/login/page.tsx      # URL: /login
    app/(auth)/register/page.tsx   # URL: /register
    app/(dashboard)/tasks/page.tsx # URL: /tasks

  use_case: |
    Auth pages use simple layout
    Dashboard pages use complex layout with sidebar
    URLs don't include group name
```

#### Dynamic Segments

```yaml
mental_model: Brackets = Variable

patterns:
  single_param:
    syntax: [id]
    example: /tasks/[id] → /tasks/123
    access: params.id

  catch_all:
    syntax: [...slug]
    example: /docs/[...slug] → /docs/a/b/c
    access: params.slug = ['a', 'b', 'c']

  optional_catch_all:
    syntax: [[...slug]]
    example: /shop/[[...slug]] → /shop or /shop/a/b
```

### Server vs Client Components

```yaml
mental_model: Server by default, Client when needed

server_components:
  default: true
  can_do:
    - Fetch data directly
    - Access backend resources
    - Keep secrets secure
    - Reduce client bundle
  cannot_do:
    - Use hooks (useState, useEffect)
    - Use browser APIs
    - Handle user events

client_components:
  marker: "use client" at top of file
  can_do:
    - Use React hooks
    - Handle user events
    - Access browser APIs
    - Use client libraries
  cannot_do:
    - Directly fetch with backend secrets

decision_tree: |
  Need interactivity? → Client
  Need browser APIs? → Client
  Need hooks? → Client
  Data fetch only? → Server
  Static display? → Server
```

### Layouts and Templates

```yaml
layouts:
  mental_model: Persistent wrapper that doesn't re-render

  behavior:
    - Wraps child pages
    - Persists across navigation
    - State preserved
    - Shared UI (nav, footer)

  nesting:
    root: app/layout.tsx (required, wraps all)
    segment: app/dashboard/layout.tsx (wraps dashboard pages)

templates:
  mental_model: Wrapper that re-renders on navigation

  behavior:
    - Same wrapping as layout
    - Re-mounts on navigation
    - State reset
    - Good for enter/exit animations

  use_case: When you need fresh state per page
```

### Data Fetching Patterns

```yaml
server_components:
  pattern: Async component with direct fetch

  mental_model: |
    Component IS the data fetcher.
    No useEffect, no loading hooks.
    Just async/await.

  benefits:
    - No loading states to manage
    - Data ready when component renders
    - Automatic deduplication
    - Caching built-in

client_components:
  pattern: useEffect or data fetching library

  mental_model: |
    Traditional React pattern.
    Fetch on mount, handle states.
    Use libraries for caching.

  when_needed:
    - Real-time updates
    - User-triggered fetches
    - Depends on client state
```

### Streaming and Suspense

```yaml
mental_model: Show UI progressively as it's ready

suspense:
  purpose: Show fallback while async component loads
  usage: Wrap async components in <Suspense>
  fallback: Loading UI shown during fetch

loading.tsx:
  purpose: Automatic Suspense boundary
  behavior: Wraps page.tsx content automatically
  shows: Loading UI for entire page segment

streaming:
  mental_model: |
    Send HTML as it's ready, not all at once.
    User sees layout immediately.
    Content fills in as it loads.
```

### Navigation

```yaml
link_component:
  purpose: Client-side navigation
  prefetching: Automatic for visible links
  mental_model: Like <a> but faster (no full page reload)

router_hooks:
  useRouter: Programmatic navigation
  usePathname: Current path
  useSearchParams: Query params
  useParams: Dynamic route params

navigation_types:
  soft: Client-side (Link, router.push)
  hard: Full page reload (window.location)
```

### Route Handlers (API Routes)

```yaml
mental_model: API endpoints in the app folder

location: app/api/[route]/route.ts
exports: GET, POST, PUT, DELETE, PATCH functions

use_cases:
  - Webhooks
  - Server actions proxy
  - Third-party integrations

note: |
  For most cases, prefer Server Components for data fetching
  and Server Actions for mutations over API routes.
```

### Common Patterns

#### Protected Routes

```yaml
pattern: Auth check in layout
location: (dashboard)/layout.tsx

mental_model: |
  Layout checks auth before rendering children.
  Redirects if not authenticated.
  All child pages are protected.
```

#### Parallel Routes

```yaml
pattern: Multiple pages in same layout
syntax: @folderName

mental_model: |
  Named slots that render independently.
  Good for dashboards with multiple panels.
  Each slot can have own loading/error states.
```

#### Intercepting Routes

```yaml
pattern: Show route in different context
syntax: (.)folder, (..)folder, (...)folder

mental_model: |
  Intercept navigation to show modal/dialog.
  URL changes but context preserved.
  Direct access shows full page.

example: |
  Click task → Modal with task details
  Direct URL → Full task page
```

### Mental Model Summary

```yaml
key_concepts:
  1_routing: Folder structure = URL structure
  2_rendering: Server default, Client when interactive
  3_layouts: Persistent wrappers, nest freely
  4_loading: Suspense + loading.tsx for async UI
  5_data: Server components fetch directly
  6_navigation: Link for client-side, prefetched automatically
  7_groups: Organize without affecting URLs

remember:
  - "use client" opts into client rendering
  - Layouts don't re-render on navigation
  - loading.tsx = automatic Suspense
  - error.tsx = automatic Error Boundary
  - page.tsx makes route accessible
```

## Output Format
Educational mental models for Next.js App Router suitable for team onboarding or architecture documentation.

## Related Skills
- design-page-component-structure
- integrate-authenticated-apis
- auth-aware-ui-behavior
