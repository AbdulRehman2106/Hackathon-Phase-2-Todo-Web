# Research & Technology Decisions: Todo Frontend Application

**Feature**: 001-todo-frontend
**Date**: 2026-02-05
**Phase**: Phase 0 - Research & Technology Selection

## Overview

This document captures the research findings and technology decisions made for the Todo frontend application. All decisions align with the project constitution and specification requirements.

## Technology Stack Decisions

### 1. Frontend Framework: Next.js 16+ (App Router)

**Decision**: Use Next.js 16+ with App Router architecture

**Research Findings**:
- **App Router Benefits**: Server Components by default, improved performance, better data fetching patterns
- **TypeScript Support**: First-class TypeScript support with excellent type inference
- **Routing**: File-system based routing simplifies navigation structure
- **Performance**: Automatic code splitting, optimized bundle sizes
- **SEO**: Server-side rendering capabilities (though not critical for authenticated app)

**Alternatives Considered**:
- **Create React App**: Deprecated, no longer recommended by React team
- **Vite + React**: Good performance but requires more manual configuration for routing, SSR
- **Remix**: Strong alternative but less ecosystem maturity than Next.js

**Rationale**: Next.js App Router provides the best balance of developer experience, performance, and modern React patterns. Server Components reduce client bundle size for static layouts.

### 2. Styling: Tailwind CSS 3.x

**Decision**: Tailwind CSS with custom design tokens, no external component library

**Research Findings**:
- **Utility-First**: Rapid development with utility classes
- **Customization**: Easy to define custom colors, spacing, typography via config
- **Bundle Size**: PurgeCSS removes unused styles, minimal production bundle
- **Design System**: Can enforce consistency through Tailwind config
- **No Component Library Needed**: For 8 components, building custom is more efficient than learning/customizing MUI/Chakra

**Alternatives Considered**:
- **Material-UI (MUI)**: Large bundle size (~300KB), harder to customize to exact design specs
- **Chakra UI**: Better than MUI but still adds ~150KB, opinionated design system
- **CSS Modules**: More verbose, harder to maintain consistency
- **Styled Components**: Runtime CSS-in-JS has performance overhead

**Rationale**: Tailwind provides maximum control over design system while keeping bundle size minimal. Building 8 custom components is faster than fighting with a component library's opinions.

### 3. Authentication: Better Auth (JWT-based)

**Decision**: Better Auth for JWT token management with httpOnly cookies

**Research Findings**:
- **Security**: httpOnly cookies prevent XSS attacks on token storage
- **Integration**: Works seamlessly with Next.js App Router
- **JWT Management**: Handles token refresh, expiration, storage automatically
- **Backend Agnostic**: Works with any backend that issues JWTs (FastAPI in our case)
- **Developer Experience**: Simple API, minimal configuration

**Alternatives Considered**:
- **NextAuth.js**: More feature-rich but overkill for simple email/password auth
- **Manual JWT Storage**: localStorage vulnerable to XSS, sessionStorage lost on tab close
- **Auth0/Clerk**: Third-party services add cost and external dependency

**Rationale**: Better Auth provides the security of httpOnly cookies with minimal complexity. Perfect fit for JWT-based authentication with FastAPI backend.

### 4. State Management: React State + Server Components

**Decision**: Use React useState/useReducer for client state, no external state library

**Research Findings**:
- **Scope**: Application state is simple (task list, form inputs, loading states)
- **Server Components**: Can fetch data server-side, reducing client state needs
- **Prop Drilling**: Only 2-3 component levels deep, not a problem
- **Performance**: No external library overhead, React 18 concurrent features sufficient

**Alternatives Considered**:
- **Redux Toolkit**: Overkill for this scope, adds ~50KB and boilerplate
- **Zustand**: Lightweight (3KB) but unnecessary for simple state
- **Jotai/Recoil**: Atomic state management not needed for linear task list
- **React Context**: Could use for auth state, but Better Auth handles this

**Rationale**: React's built-in state management is sufficient for this application's scope. Adding a state library would be premature optimization.

### 5. API Client: Centralized Axios-based Client

**Decision**: Custom API client wrapper around axios with interceptors

**Research Findings**:
- **Interceptors**: Axios interceptors perfect for JWT attachment and 401 handling
- **Error Handling**: Centralized error transformation to user-friendly messages
- **TypeScript**: Excellent TypeScript support with typed responses
- **Bundle Size**: Axios is 13KB minified+gzipped (acceptable)
- **Optimistic Updates**: Easy to implement with axios + React state

**Alternatives Considered**:
- **Fetch API**: Native but lacks interceptors, requires manual wrapper
- **React Query**: Powerful but adds complexity and 40KB for features we don't need (caching, background refetch)
- **SWR**: Similar to React Query, optimized for data fetching but overkill for our needs
- **tRPC**: Requires TypeScript on backend, FastAPI uses Python

**Rationale**: Axios provides the right balance of features (interceptors) and simplicity. React Query/SWR are excellent but unnecessary for this scope.

### 6. Testing: Jest + React Testing Library + Playwright

**Decision**: Jest for unit tests, React Testing Library for component tests, Playwright for E2E

**Research Findings**:
- **Jest**: Industry standard for JavaScript testing, great Next.js integration
- **React Testing Library**: Encourages testing user behavior, not implementation details
- **Playwright**: Modern E2E framework, better than Cypress for cross-browser testing
- **Coverage**: Can achieve >80% coverage with this stack

**Alternatives Considered**:
- **Vitest**: Faster than Jest but less mature Next.js integration
- **Cypress**: Popular but Playwright has better API and cross-browser support
- **Testing Library alternatives**: Enzyme (deprecated), React Test Renderer (low-level)

**Rationale**: This stack is battle-tested, well-documented, and has excellent Next.js support.

## Architecture Decisions

### 7. Optimistic Updates with Rollback

**Decision**: Implement optimistic UI updates for create/toggle/edit operations

**Research Findings**:
- **UX Requirement**: Spec requires <100ms visual feedback
- **Network Latency**: Typical API round-trip is 200-500ms
- **User Perception**: Optimistic updates feel instant, improve perceived performance
- **Complexity**: Manageable with proper error handling and rollback logic

**Implementation Pattern**:
```typescript
async function toggleTask(taskId: string) {
  // 1. Optimistic update (immediate UI change)
  setTasks(prev => prev.map(t =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  ));

  try {
    // 2. API call
    await api.put(`/tasks/${taskId}`, { completed: !task.completed });
  } catch (error) {
    // 3. Rollback on failure
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
    showError('Failed to update task');
  }
}
```

**Rationale**: Optimistic updates are essential for meeting the <100ms feedback requirement while maintaining data consistency.

### 8. JWT User Derivation (Backend Enforced)

**Decision**: Backend extracts user_id from JWT claims, never from URL/body

**Research Findings**:
- **Security**: URL parameters can be manipulated (IDOR vulnerability)
- **Trust Boundary**: JWT is cryptographically signed, URL is not
- **Middleware Pattern**: Extract user_id once in middleware, available to all endpoints
- **Simplicity**: Endpoints don't need to verify user_id, it's guaranteed correct

**Implementation Pattern**:
```python
# Backend middleware
def jwt_middleware(request):
    token = request.headers.get('Authorization').split('Bearer ')[1]
    payload = jwt.decode(token, SECRET_KEY)
    request.state.user_id = payload['user_id']  # Attach to request

# Endpoint uses request.state.user_id (trusted)
def get_tasks(request):
    user_id = request.state.user_id  # From JWT, not URL
    return db.query(Task).filter(Task.user_id == user_id).all()
```

**Rationale**: This pattern eliminates entire classes of authorization vulnerabilities and simplifies endpoint logic.

### 9. Server Components for Static, Client for Interactive

**Decision**: Use Server Components for layouts, Client Components for interactive UI

**Research Findings**:
- **Server Components**: Zero JavaScript sent to client, faster initial load
- **Client Components**: Required for useState, event handlers, browser APIs
- **Boundary**: Clear separation - static = server, interactive = client
- **Performance**: Server Components reduce bundle size by ~30% for layouts

**Component Classification**:
- **Server**: Root layout, auth page layouts, static headers
- **Client**: Dashboard, task list, forms, modals, buttons with onClick

**Rationale**: Maximizes performance benefits of Server Components while keeping interactive UI on client where it belongs.

### 10. Modal-Based Edit/Delete Confirmations

**Decision**: Use modals for edit and delete operations

**Research Findings**:
- **Focus**: Modal provides dedicated space without cluttering task list
- **Mobile UX**: Better experience on small screens than inline editing
- **Validation**: Easier to display validation errors in modal context
- **Consistency**: Delete confirmation already requires modal, edit should match
- **Accessibility**: Modals can trap focus, improving keyboard navigation

**Rationale**: Modals provide better UX for focused operations, especially on mobile devices.

## Design System Decisions

### 11. Typography Scale

**Decision**: 6-point scale based on 4px base unit

**Scale**: 12px, 14px, 16px, 20px, 24px, 32px

**Usage**:
- 32px: Page titles (h1)
- 24px: Section headers (h2)
- 20px: Subsection headers (h3)
- 16px: Body text, buttons
- 14px: Secondary text, labels
- 12px: Metadata, timestamps

**Rationale**: Provides clear hierarchy while maintaining readability. Based on common web typography patterns.

### 12. Spacing Scale

**Decision**: 8-point scale based on 4px base unit

**Scale**: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

**Usage**:
- 4px: Tight spacing (icon-text gap)
- 8px: Component internal padding
- 12px: Small gaps between related elements
- 16px: Standard spacing between elements
- 24px: Section spacing
- 32px: Large section spacing
- 48px: Page section dividers
- 64px: Major layout spacing

**Rationale**: 4px base unit provides flexibility while maintaining consistency. Aligns with Tailwind's default spacing scale.

### 13. Color Palette

**Decision**: Neutral base with single primary accent

**Palette**:
- **Primary**: Blue (#3B82F6) - buttons, links, focus states
- **Success**: Green (#10B981) - success messages
- **Error**: Red (#EF4444) - error messages, delete actions
- **Warning**: Yellow (#F59E0B) - warnings (if needed)
- **Neutral**: Gray scale (#F9FAFB to #111827) - text, backgrounds, borders

**Rationale**: Simple, professional palette that meets WCAG 2.1 AA contrast requirements. Blue is universally understood for interactive elements.

## Performance Targets

### 14. Performance Budgets

**Targets** (from spec):
- Initial load: <3 seconds
- UI feedback: <100ms
- Task operations: <5 seconds
- Frame rate: 60fps during interactions

**Strategies**:
- Code splitting by route (Next.js automatic)
- Lazy load modals (React.lazy)
- Optimize re-renders (React.memo for TaskItem)
- Debounce search/filter inputs (if added)
- Image optimization (next/image if images added)

**Rationale**: These targets ensure the application feels fast and responsive, meeting user expectations for modern web apps.

## Security Considerations

### 15. XSS Prevention

**Strategies**:
- React escapes all rendered content by default
- httpOnly cookies for JWT (not accessible to JavaScript)
- Content Security Policy headers (if needed)
- Sanitize user input on backend (FastAPI validation)

### 16. CSRF Protection

**Strategies**:
- SameSite cookie attribute for JWT
- CORS configuration on backend (whitelist frontend origin)
- No state-changing GET requests

### 17. Authorization

**Strategies**:
- Backend enforces user_id from JWT (never trust frontend)
- Frontend hides UI for unauthorized actions (UX only, not security)
- 401 errors trigger re-authentication
- 403 errors show "access denied" message

## Accessibility Decisions

### 18. WCAG 2.1 AA Compliance

**Requirements**:
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation: All interactive elements accessible via keyboard
- Focus indicators: Visible focus states (2px outline)
- Semantic HTML: Proper heading hierarchy, lists, buttons
- ARIA labels: Only where semantic HTML insufficient

**Testing**:
- Automated: axe-core via Playwright
- Manual: Keyboard navigation testing
- Tools: Chrome DevTools Lighthouse, WAVE browser extension

## Open Questions & Future Considerations

### Deferred Decisions (Out of Scope for MVP)

1. **Dark Mode**: Not in scope, but Tailwind makes it easy to add later
2. **Internationalization**: English-only for MVP, but Next.js i18n ready
3. **Offline Support**: Not required, but Service Workers could enable
4. **Real-time Sync**: Not needed for single-device usage, but WebSockets possible
5. **Task Search/Filter**: Not in spec, but easy to add with client-side filtering

### Monitoring & Observability (Future)

- Error tracking: Sentry or similar
- Analytics: PostHog or Plausible (privacy-friendly)
- Performance monitoring: Vercel Analytics or Web Vitals
- User feedback: In-app feedback widget

## Summary

All technology decisions align with:
- ✅ Constitution principles (Spec-Driven, Separation of Concerns, Security by Design, UI/UX Excellence)
- ✅ Specification requirements (40 functional requirements, 12 success criteria)
- ✅ Performance targets (<3s load, <100ms feedback, 60fps)
- ✅ Accessibility standards (WCAG 2.1 AA)
- ✅ Security requirements (JWT verification, user isolation)

**Next Phase**: Create data models, API contracts, and quickstart guide (Phase 1).
