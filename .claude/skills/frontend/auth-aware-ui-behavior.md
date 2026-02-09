# Skill: Auth-Aware UI Behavior

## Purpose
Design UI patterns that appropriately respond to authentication state, ensuring users see relevant content and actions based on their auth status.

## When to Use
- Designing UI for authenticated applications
- Planning protected route behavior
- Creating conditional UI based on auth
- Handling auth state transitions

## Instruction

### Auth States in UI

```yaml
authentication_states:
  loading:
    description: Auth state being determined
    ui_behavior: Show loading indicator, prevent navigation decisions

  authenticated:
    description: User is logged in with valid session
    ui_behavior: Show protected content, user info, logout option

  unauthenticated:
    description: No user session
    ui_behavior: Show login/register options, redirect from protected routes

  expired:
    description: Session has expired
    ui_behavior: Prompt re-authentication, handle gracefully
```

### UI Patterns by Auth State

#### Navigation UI

```yaml
header_authenticated:
  show:
    - User avatar/name
    - Notification bell
    - Settings link
    - Logout button
    - Protected nav items (Dashboard, Tasks)
  hide:
    - Login button
    - Register button

header_unauthenticated:
  show:
    - Login button
    - Register button
    - Public nav items (Home, Features, Pricing)
  hide:
    - User avatar
    - Protected nav items
    - Logout button

header_loading:
  show:
    - Skeleton placeholder for auth section
  behavior:
    - Don't flash wrong UI
    - Minimal layout shift
```

#### Protected Content

```yaml
protected_page:
  authenticated:
    display: Full page content
    actions: All available actions

  unauthenticated:
    display: Redirect to login
    preserve: Return URL for post-login redirect

  loading:
    display: Page skeleton
    behavior: Don't show content until auth confirmed
```

#### Conditional Components

```yaml
auth_conditional_ui:
  task_actions:
    owner:
      show: Edit, Delete, Share buttons
    non_owner:
      show: View only
      hide: Mutation actions

  admin_features:
    admin:
      show: Admin panel link, user management
    non_admin:
      hide: Admin features completely (not disabled, hidden)
```

### Route Protection Patterns

#### Redirect-Based Protection

```yaml
pattern: Server-side auth check and redirect
location: Layout or middleware

behavior:
  check: Session validity
  if_invalid: Redirect to /login?returnTo={currentPath}
  if_valid: Render protected content

advantages:
  - No flash of protected content
  - SEO-friendly
  - Server-validated
```

#### Client-Side Guard

```yaml
pattern: Client component checks auth
use_case: Additional layer or client-only apps

behavior:
  initial: Show loading state
  check: Auth context/hook
  if_invalid: Redirect or show login prompt
  if_valid: Render content

considerations:
  - Brief loading flash possible
  - Good for SPAs
  - Combine with server check for security
```

### Auth State Transitions

#### Login Flow

```yaml
transition: Unauthenticated → Authenticated

ui_steps:
  1. User on login page
  2. Submit credentials
  3. Show loading state
  4. On success:
     - Update auth context
     - Redirect to returnTo or dashboard
     - Update navigation UI
  5. On failure:
     - Show error message
     - Keep form populated
     - Allow retry
```

#### Logout Flow

```yaml
transition: Authenticated → Unauthenticated

ui_steps:
  1. User clicks logout
  2. Show confirmation (optional for quick action)
  3. Clear auth state
  4. Clear any cached user data
  5. Redirect to public page or login
  6. Update navigation UI

considerations:
  - Clear sensitive data from memory
  - Invalidate any active requests
  - Handle logout from protected page
```

#### Session Expiry

```yaml
transition: Authenticated → Expired → Unauthenticated

detection_points:
  - API returns 401
  - Token check fails
  - Background session check

ui_handling:
  graceful:
    - Show "Session expired" message
    - Offer to re-authenticate
    - Preserve user's work if possible

  abrupt:
    - Clear state immediately
    - Redirect to login
    - Show explanation
```

### Loading State During Auth Check

```yaml
problem: Flash of wrong content during auth determination

solutions:
  server_components:
    approach: Check auth server-side
    benefit: No client-side loading state needed

  client_components:
    approach: Show skeleton until auth resolved
    implementation:
      initial_state: isLoading=true
      check_auth: useEffect or auth hook
      render:
        if_loading: Skeleton
        if_authenticated: Protected content
        if_unauthenticated: Redirect

  css_approach:
    approach: Hide auth-dependent UI until ready
    benefit: Prevents flash
    drawback: May feel slower
```

### Handling Permissions in UI

```yaml
permission_types:
  authentication:
    check: Is user logged in?
    affects: Route access, showing login buttons

  authorization:
    check: Can user perform this action?
    affects: Action buttons, edit capabilities

  ownership:
    check: Does user own this resource?
    affects: Edit/delete buttons, sensitive info display

ui_patterns:
  hide_vs_disable:
    hide:
      use_when: User shouldn't know action exists
      example: Admin features for non-admins
    disable:
      use_when: User knows action exists but can't use
      example: Edit button on non-owned resource
      provide: Tooltip explaining why disabled

  error_prevention:
    approach: Don't show actions user can't perform
    benefit: Better UX than showing then rejecting
```

### Design Checklist

```yaml
navigation:
  - [ ] Auth-appropriate menu items
  - [ ] User info displayed when logged in
  - [ ] Login/register when logged out
  - [ ] No flash during auth check

protected_routes:
  - [ ] Redirect when unauthenticated
  - [ ] Return URL preserved
  - [ ] Loading state during check
  - [ ] No protected content flash

conditional_actions:
  - [ ] Owner-only actions for owners
  - [ ] Role-based actions by role
  - [ ] Appropriate hide/disable strategy
  - [ ] Helpful disabled state messaging

state_transitions:
  - [ ] Smooth login transition
  - [ ] Clean logout flow
  - [ ] Graceful session expiry handling
  - [ ] No orphaned state after auth change
```

### Auth UI Component Patterns

```yaml
auth_guard_component:
  purpose: Wrap protected content
  behavior:
    authenticated: Render children
    loading: Render fallback
    unauthenticated: Redirect or render alternative

user_menu_component:
  purpose: User-specific actions
  states:
    authenticated: Avatar, name, dropdown with settings/logout
    unauthenticated: Login/register buttons
    loading: Skeleton placeholder

protected_action_component:
  purpose: Conditionally show/enable actions
  props:
    requiresAuth: boolean
    requiresOwnership: boolean
    resource: object with owner info
  behavior: Hide, disable, or show based on auth
```

## Output Format
Auth-aware UI design patterns suitable for frontend implementation planning and UX specifications.

## Related Skills
- design-page-component-structure
- handle-loading-error-states
- integrate-authenticated-apis
