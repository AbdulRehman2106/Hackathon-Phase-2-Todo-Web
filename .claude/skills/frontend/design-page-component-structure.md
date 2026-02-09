# Skill: Design Frontend Page and Component Structure

## Purpose
Create well-organized page layouts and component hierarchies for Next.js applications using the App Router architecture.

## When to Use
- Planning new pages or features
- Organizing component structure
- Establishing UI architecture patterns
- Reviewing frontend organization

## Instruction

### Next.js App Router Structure

The App Router uses a file-system based routing:

```
apps/frontend/
├── src/
│   ├── app/                        # App Router pages
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page (/)
│   │   ├── globals.css             # Global styles
│   │   │
│   │   ├── (auth)/                 # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # /login
│   │   │   └── register/
│   │   │       └── page.tsx        # /register
│   │   │
│   │   ├── (dashboard)/            # Protected route group
│   │   │   ├── layout.tsx          # Dashboard layout (with nav)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # /dashboard
│   │   │   └── tasks/
│   │   │       ├── page.tsx        # /tasks
│   │   │       └── [id]/
│   │   │           └── page.tsx    # /tasks/:id
│   │   │
│   │   └── api/                    # API routes (if needed)
│   │
│   ├── components/                 # Shared components
│   │   ├── ui/                     # Base UI components
│   │   ├── forms/                  # Form components
│   │   ├── layout/                 # Layout components
│   │   └── features/               # Feature-specific components
│   │
│   ├── lib/                        # Utilities and configurations
│   │   ├── api.ts                  # API client
│   │   ├── auth.ts                 # Auth configuration
│   │   └── utils.ts                # Utility functions
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useTasks.ts
│   │
│   └── types/                      # TypeScript types
│       ├── api.ts
│       └── task.ts
```

### Component Hierarchy Design

#### Page Structure Pattern

```yaml
page_structure:
  level_1_route:
    type: Route segment (folder)
    contains: page.tsx, layout.tsx, loading.tsx, error.tsx

  level_2_layout:
    type: Layout wrapper
    contains: Common UI (nav, footer), auth protection

  level_3_page:
    type: Page component
    contains: Page-specific layout, data fetching

  level_4_sections:
    type: Major page sections
    contains: Grouped functionality

  level_5_components:
    type: Reusable components
    contains: UI elements, form fields
```

#### Example Component Tree

```
TasksPage
├── DashboardLayout          # Provides navigation, auth check
│   ├── Sidebar
│   └── Header
│
├── TaskListSection          # Main content area
│   ├── TaskFilters
│   │   ├── StatusFilter
│   │   └── SearchInput
│   │
│   ├── TaskList
│   │   └── TaskCard (repeated)
│   │       ├── TaskTitle
│   │       ├── TaskStatus
│   │       └── TaskActions
│   │
│   └── EmptyState           # When no tasks
│
└── CreateTaskDialog         # Modal for creation
    └── TaskForm
        ├── TitleInput
        ├── DescriptionInput
        └── SubmitButton
```

### Component Categories

#### 1. UI Components (components/ui/)

```yaml
purpose: Basic, reusable UI building blocks
characteristics:
  - No business logic
  - Highly reusable
  - Styled but not opinionated
  - Accessible

examples:
  - Button
  - Input
  - Card
  - Dialog
  - Select
  - Badge
```

#### 2. Layout Components (components/layout/)

```yaml
purpose: Page structure and navigation
characteristics:
  - Define page structure
  - Handle navigation
  - May include auth protection

examples:
  - Header
  - Sidebar
  - Footer
  - PageContainer
  - DashboardLayout
```

#### 3. Form Components (components/forms/)

```yaml
purpose: Form handling and validation
characteristics:
  - Integrate with form library
  - Handle validation display
  - Consistent styling

examples:
  - FormField
  - FormInput
  - FormSelect
  - FormSubmitButton
  - ValidationMessage
```

#### 4. Feature Components (components/features/)

```yaml
purpose: Feature-specific, composed components
characteristics:
  - Combine UI components
  - May contain business logic
  - Specific to features

examples:
  - TaskCard
  - TaskList
  - TaskFilters
  - UserAvatar
  - NotificationBell
```

### Design Principles

#### Component Responsibility

```yaml
single_responsibility:
  rule: Each component does one thing well
  examples:
    good: TaskCard displays a single task
    bad: TaskCard displays task AND handles editing AND manages state

composition_over_inheritance:
  rule: Build complex UIs from simple components
  example: |
    TaskCard = Card + TaskTitle + TaskStatus + TaskActions
    Not: TaskCard extends Card and adds everything

props_over_global_state:
  rule: Pass data via props when possible
  use_global_state_for:
    - Auth state
    - Theme preferences
    - Cross-cutting concerns
```

#### Naming Conventions

```yaml
files:
  components: PascalCase.tsx (TaskCard.tsx)
  hooks: camelCase with use prefix (useTasks.ts)
  utilities: camelCase (formatDate.ts)
  types: camelCase.ts (task.ts)

components:
  format: PascalCase
  descriptive: Describes what it renders
  examples:
    - TaskCard (not Task)
    - CreateTaskDialog (not CreateTask)
    - TaskStatusBadge (not StatusBadge if task-specific)

props:
  format: camelCase
  descriptive: Clear purpose
  examples:
    - onSubmit (not submit or handleSubmit)
    - isLoading (not loading)
    - taskData (not data if specific)
```

### Page Design Template

```markdown
## Page: Tasks List

### URL
/tasks

### Purpose
Display all tasks for the authenticated user with filtering and management.

### Layout
- Uses DashboardLayout (includes sidebar navigation)
- Protected route (requires authentication)

### Sections
1. **Header Section**
   - Page title: "My Tasks"
   - Create task button

2. **Filter Section**
   - Status filter dropdown
   - Search input
   - Clear filters button

3. **Content Section**
   - Task list (TaskCard components)
   - Loading skeleton during fetch
   - Empty state when no tasks

4. **Modals**
   - Create task dialog
   - Edit task dialog
   - Delete confirmation dialog

### Component Hierarchy
```
TasksPage
├── PageHeader
│   ├── Title
│   └── CreateButton
├── TaskFilters
│   ├── StatusFilter
│   └── SearchInput
├── TaskList
│   ├── TaskCard[]
│   ├── LoadingSkeleton
│   └── EmptyState
└── CreateTaskDialog
```

### Data Requirements
- List of tasks from API
- Current user (for ownership display)
- Filter state

### User Interactions
- Click task card → Navigate to task detail
- Click create → Open create dialog
- Click filter → Update filter state
- Scroll → Load more (if paginated)
```

### Component Design Checklist

- [ ] Clear purpose defined
- [ ] Props interface documented
- [ ] Follows naming conventions
- [ ] Accessibility considered
- [ ] Loading state handled
- [ ] Error state handled
- [ ] Empty state handled
- [ ] Mobile responsive

## Output Format
Page and component structure documentation suitable for frontend implementation planning.

## Related Skills
- integrate-authenticated-apis
- handle-loading-error-states
- nextjs-app-router-patterns
