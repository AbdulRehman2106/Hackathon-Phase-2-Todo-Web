# Skill: Integrate Authenticated APIs from Frontend

## Purpose
Design patterns for consuming authenticated REST APIs from Next.js frontend applications, including token handling, request interceptors, and error handling.

## When to Use
- Setting up API client for authenticated endpoints
- Planning data fetching strategies
- Handling authentication in API calls
- Designing error handling for API responses

## Instruction

### API Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 FRONTEND API INTEGRATION                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Component  │────▶│  API Hook   │────▶│ API Client  │
│             │◀────│  (useTasks) │◀────│ (fetch)     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Backend   │
                                        │   (FastAPI) │
                                        └─────────────┘

Token Flow:
┌─────────────┐
│ Better Auth │ Stores token
│   (Auth)    │────────────────┐
└─────────────┘                │
                               ▼
                        ┌─────────────┐
                        │ API Client  │ Reads token
                        │ Adds header │
                        └─────────────┘
```

### API Client Design

#### Base Configuration

```yaml
api_client_design:
  location: src/lib/api.ts
  responsibilities:
    - Base URL configuration
    - Token injection
    - Error standardization
    - Request/response interceptors

  configuration:
    base_url: Environment variable (NEXT_PUBLIC_API_URL)
    default_headers:
      Content-Type: application/json
    timeout: 30 seconds
```

#### Token Injection Pattern

```yaml
token_injection:
  source: Better Auth session
  header: Authorization: Bearer {token}

  design_pattern:
    1. Check if session exists
    2. Extract access token from session
    3. Add to request headers
    4. Handle expired tokens

  considerations:
    - Token refresh handled by Better Auth
    - API client reads current token
    - No manual refresh logic needed
```

### Request Patterns

#### GET Request (Fetch Data)

```yaml
pattern: Fetch authenticated data
use_case: Get user's tasks

design:
  endpoint: GET /api/tasks
  authentication: Required
  response: List of tasks

  hook_design:
    name: useTasks
    returns:
      data: Task[] | undefined
      isLoading: boolean
      error: Error | null
      refetch: () => void

  error_handling:
    401: Redirect to login
    403: Show forbidden message
    404: Show not found
    500: Show generic error
```

#### POST Request (Create Data)

```yaml
pattern: Create authenticated resource
use_case: Create new task

design:
  endpoint: POST /api/tasks
  authentication: Required
  request: { title, description }
  response: Created task

  hook_design:
    name: useCreateTask
    returns:
      mutate: (data) => Promise
      isLoading: boolean
      error: Error | null

  optimistic_update:
    option: Add to cache before server confirms
    rollback: Remove on error
```

#### PUT/PATCH Request (Update Data)

```yaml
pattern: Update authenticated resource
use_case: Update task details

design:
  endpoint: PUT /api/tasks/{id}
  authentication: Required
  request: { title, description, status }
  response: Updated task

  hook_design:
    name: useUpdateTask
    returns:
      mutate: (id, data) => Promise
      isLoading: boolean
      error: Error | null
```

#### DELETE Request (Remove Data)

```yaml
pattern: Delete authenticated resource
use_case: Delete task

design:
  endpoint: DELETE /api/tasks/{id}
  authentication: Required
  response: 204 No Content

  hook_design:
    name: useDeleteTask
    returns:
      mutate: (id) => Promise
      isLoading: boolean
      error: Error | null

  confirmation:
    pattern: Show confirmation dialog before delete
```

### Error Handling Patterns

```yaml
error_categories:

  authentication_errors:
    status: 401
    handling:
      - Clear local auth state
      - Redirect to login page
      - Show "Session expired" message

  authorization_errors:
    status: 403
    handling:
      - Show "Access denied" message
      - Don't redirect (user is authenticated)
      - Log for debugging

  not_found_errors:
    status: 404
    handling:
      - Show "Not found" message
      - Offer navigation to list page

  validation_errors:
    status: 422
    handling:
      - Parse error details
      - Show field-specific errors
      - Keep form state for correction

  server_errors:
    status: 500
    handling:
      - Show generic error message
      - Offer retry option
      - Log for debugging
```

### State Management for API Data

```yaml
options:

  react_query:
    purpose: Server state management
    features:
      - Automatic caching
      - Background refetching
      - Optimistic updates
      - Error retry
    best_for: Most data fetching needs

  swr:
    purpose: Data fetching with caching
    features:
      - Stale-while-revalidate
      - Focus revalidation
      - Interval revalidation
    best_for: Real-time data needs

  zustand_with_fetch:
    purpose: Client state with API integration
    features:
      - Fine-grained control
      - Minimal boilerplate
      - TypeScript friendly
    best_for: Complex state requirements
```

### API Call Patterns in Components

#### Page Level Fetching

```yaml
pattern: Fetch data at page level, pass down
use_case: Task list page fetches all tasks

design:
  page_component: Fetches data, handles loading/error
  child_components: Receive data as props
  benefits:
    - Single source of truth
    - Easy to manage loading states
    - Clear data flow
```

#### Component Level Fetching

```yaml
pattern: Component fetches its own data
use_case: User avatar component fetches user data

design:
  component: Contains its own data fetch
  independence: Works anywhere without props
  considerations:
    - May cause waterfall requests
    - Good for truly independent data
```

### Caching Strategy

```yaml
cache_configuration:

  list_queries:
    key: ["tasks", filters]
    stale_time: 30 seconds
    cache_time: 5 minutes
    refetch_on_focus: true

  detail_queries:
    key: ["task", id]
    stale_time: 60 seconds
    cache_time: 10 minutes

  mutation_effects:
    on_create: Invalidate list cache
    on_update: Update item in cache
    on_delete: Remove from cache
```

### TypeScript Integration

```yaml
type_design:

  api_response_types:
    location: src/types/api.ts
    pattern: Match backend schemas exactly

  task_types:
    Task: Full task object
    TaskCreate: Create request body
    TaskUpdate: Update request body
    TaskListResponse: List endpoint response

  error_types:
    ApiError: Standard error format
    ValidationError: Field-level errors
```

### Integration Checklist

- [ ] API client configured with base URL
- [ ] Token injection implemented
- [ ] Error handling standardized
- [ ] Loading states handled
- [ ] Cache strategy defined
- [ ] TypeScript types match backend
- [ ] 401 errors trigger re-auth
- [ ] Retry logic implemented

## Output Format
API integration design documentation suitable for frontend implementation planning.

## Related Skills
- design-page-component-structure
- handle-loading-error-states
- auth-aware-ui-behavior
