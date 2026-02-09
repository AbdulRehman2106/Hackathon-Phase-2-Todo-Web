# Skill: Handle Loading, Error, and Empty States

## Purpose
Design comprehensive UI state handling patterns for asynchronous operations, ensuring users always understand the current state of the application.

## When to Use
- Designing data-fetching UI components
- Planning user feedback patterns
- Creating consistent state handling across the app
- Reviewing UI completeness

## Instruction

### State Hierarchy

Every component that fetches data MUST handle these states:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATA FETCHING STATES                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   LOADING   │────▶│   SUCCESS   │     │    ERROR    │
│  (pending)  │     │  (data)     │     │  (failed)   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    EMPTY    │
                    │  (no data)  │
                    └─────────────┘
```

### Loading States

#### Initial Loading

```yaml
state: First data fetch
display: Loading skeleton or spinner
duration: Until data arrives or error

design_requirements:
  - Show immediately (no flash of empty content)
  - Use skeletons that match content shape
  - Maintain layout stability
  - Consider accessibility (announce loading)
```

#### Background Loading (Refetching)

```yaml
state: Refreshing existing data
display: Subtle indicator (not full skeleton)
keep_showing: Previous data while loading

design_requirements:
  - Don't remove existing content
  - Small spinner or progress indicator
  - Update silently on success
```

#### Action Loading (Mutations)

```yaml
state: User action in progress (create/update/delete)
display: Button loading state, disabled inputs

design_requirements:
  - Disable form during submission
  - Show loading state on submit button
  - Prevent double submission
  - Allow cancellation if long-running
```

### Loading UI Patterns

#### Skeleton Screens

```yaml
pattern: Content-shaped placeholders
use_case: List or detail views loading

design:
  shape: Match content layout
  animation: Subtle pulse or shimmer
  benefits:
    - Perceived faster loading
    - Maintains layout stability
    - Better than blank screen
```

#### Spinner/Progress

```yaml
pattern: Generic loading indicator
use_case: Actions, overlays, small areas

design:
  placement: Center of loading area
  size: Appropriate to context
  accessibility: aria-label="Loading"
```

#### Loading Overlays

```yaml
pattern: Overlay on existing content
use_case: Updating existing data, modal actions

design:
  opacity: Semi-transparent background
  indicator: Centered spinner
  interaction: Prevent clicks through overlay
```

### Error States

#### Error Categories and Handling

```yaml
network_error:
  display: "Unable to connect. Check your internet connection."
  actions:
    - Retry button
    - Offline mode (if available)
  icon: Network/wifi error icon

authentication_error:
  display: "Your session has expired. Please log in again."
  actions:
    - Redirect to login
    - Auto-redirect after delay
  icon: Lock icon

authorization_error:
  display: "You don't have permission to view this content."
  actions:
    - Go back button
    - Contact support link
  icon: Shield/forbidden icon

not_found_error:
  display: "The requested content could not be found."
  actions:
    - Go to home/list button
    - Search suggestion
  icon: Search/question icon

server_error:
  display: "Something went wrong. Please try again."
  actions:
    - Retry button
    - Report issue link
  icon: Alert/warning icon

validation_error:
  display: Field-specific error messages
  actions:
    - Highlight invalid fields
    - Show inline error text
  placement: Below relevant field
```

#### Error UI Patterns

```yaml
inline_error:
  use_case: Form validation errors
  display: Below the field
  style: Red/warning color, small text

page_error:
  use_case: Full page load failure
  display: Centered error card
  includes: Icon, message, action buttons

toast_error:
  use_case: Action failures (save, delete)
  display: Corner toast notification
  duration: Persists until dismissed for errors

boundary_error:
  use_case: Unexpected component errors
  display: Fallback UI with retry
  mechanism: React Error Boundary
```

### Empty States

#### Empty State Types

```yaml
no_data:
  condition: User has no items
  message: "You don't have any tasks yet"
  call_to_action: "Create your first task"
  illustration: Optional helpful graphic

no_results:
  condition: Search/filter returns nothing
  message: "No tasks match your search"
  call_to_action: "Clear filters" or "Try different terms"
  preserve: Show current filter state

no_permission:
  condition: User can't access but page is valid
  message: "You can't view this content"
  call_to_action: Request access or go back
```

#### Empty State Design

```yaml
components:
  illustration: Visual element (icon or graphic)
  headline: Brief statement of the situation
  description: Helpful context
  action: Primary action button

placement:
  center: Both horizontally and vertically
  size: Appropriate for the container
  spacing: Generous whitespace

tone:
  positive: Encouraging, not negative
  helpful: Guide user to next step
  on_brand: Match application voice
```

### State Composition Pattern

```yaml
rendering_logic:
  priority_order:
    1. Error state (if error)
    2. Loading state (if loading && no data)
    3. Empty state (if success && no data)
    4. Data state (if success && has data)

  with_background_loading:
    show: Data (stale) + loading indicator
    message: "Updating..." (subtle)
```

### Accessibility Requirements

```yaml
loading_states:
  - aria-busy="true" on loading container
  - aria-live="polite" for status updates
  - Announce loading to screen readers

error_states:
  - aria-live="assertive" for errors
  - role="alert" for error messages
  - Focus management to error

empty_states:
  - Clear heading structure
  - Actionable button is focusable
```

### State Design Template

```markdown
## Component: TaskList

### States

**Loading (Initial)**
- Display: 5 skeleton cards matching TaskCard shape
- Duration: Until data fetches

**Loading (Refetch)**
- Display: Show current tasks + subtle spinner in header
- Duration: Until data updates

**Error (Network)**
- Display: Error card with retry button
- Message: "Unable to load tasks. Check your connection."

**Error (Auth)**
- Display: Redirect to login
- Message: "Session expired" toast

**Empty (No Tasks)**
- Display: Illustration + create prompt
- Message: "No tasks yet. Create your first task!"
- Action: "Create Task" button

**Success**
- Display: Grid of TaskCard components
- Features: Pagination, filtering
```

### Checklist for State Handling

- [ ] Initial loading state designed
- [ ] Background loading indicator
- [ ] Action loading on buttons
- [ ] Error state for each error type
- [ ] Empty state with call-to-action
- [ ] Accessibility attributes added
- [ ] Consistent styling with app
- [ ] User can recover from errors

## Output Format
State handling design patterns suitable for frontend implementation planning and UI specifications.

## Related Skills
- design-page-component-structure
- integrate-authenticated-apis
- auth-aware-ui-behavior
