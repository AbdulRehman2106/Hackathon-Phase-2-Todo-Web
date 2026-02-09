# UI/UX Design Skill

## Purpose
Provide expert-level UI/UX design solutions for websites, web applications, and mobile applications. Transform user needs into beautiful, functional, and accessible interfaces that drive engagement and conversion.

## Core Capabilities

### 1. User-Centered UI Layouts
- Design intuitive information architecture
- Create visual hierarchy and focal points
- Optimize content flow and readability
- Balance whitespace and content density
- Implement grid-based layouts for consistency

### 2. UX Flow and Usability Optimization
- Map user journeys and task flows
- Identify friction points and pain points
- Reduce cognitive load and decision fatigue
- Optimize conversion funnels
- Design error states and edge cases

### 3. Modern Component Design
- Buttons: Primary, secondary, tertiary, ghost, icon
- Forms: Inputs, selects, checkboxes, radio buttons, validation
- Cards: Content cards, product cards, profile cards
- Navigation: Headers, sidebars, tabs, breadcrumbs
- Modals: Dialogs, drawers, popovers, tooltips
- Data Display: Tables, lists, grids, charts

### 4. Design Systems
- Color palettes: Primary, secondary, semantic, neutral scales
- Typography: Font families, scales, weights, line heights
- Spacing: 4px/8px base unit systems
- Shadows and elevation: Depth hierarchy
- Border radius: Consistency across components
- Icons: Style, size, and usage guidelines

### 5. Responsive and Adaptive Design
- Mobile-first approach (320px → 1920px+)
- Breakpoints: Mobile (< 640px), Tablet (640-1024px), Desktop (> 1024px)
- Flexible layouts with CSS Grid and Flexbox
- Touch targets (minimum 44x44px)
- Responsive typography and spacing

### 6. Accessibility (WCAG 2.1 AA)
- Color contrast ratios (4.5:1 for text, 3:1 for UI)
- Keyboard navigation and focus states
- Screen reader compatibility (ARIA labels)
- Alternative text for images
- Form labels and error messages
- Skip links and landmark regions

## Design Standards and Frameworks

### Material Design (Google)
- Elevation and shadows for depth
- Bold colors and typography
- Motion and animation principles
- 8dp grid system
- Floating Action Buttons (FABs)

### Apple Human Interface Guidelines
- Clarity, deference, and depth
- Native platform patterns
- SF Pro font family
- Subtle animations and transitions
- Tab bars and navigation bars

### Modern SaaS UI Patterns
- Clean, minimal interfaces
- Card-based layouts
- Sidebar navigation
- Command palettes (Cmd+K)
- Empty states and onboarding
- Dashboard and analytics views

### Grid Systems
- 12-column grid for desktop
- 4-column grid for mobile
- 8px or 4px base unit for spacing
- Consistent gutters and margins
- Alignment to grid for visual harmony

## UX Heuristics (Nielsen's 10 Principles)

1. **Visibility of System Status**: Loading states, progress indicators, feedback
2. **Match Between System and Real World**: Familiar language and metaphors
3. **User Control and Freedom**: Undo/redo, cancel, back navigation
4. **Consistency and Standards**: Follow platform conventions
5. **Error Prevention**: Constraints, confirmations, helpful defaults
6. **Recognition Rather Than Recall**: Visible options, autocomplete
7. **Flexibility and Efficiency**: Shortcuts, bulk actions, customization
8. **Aesthetic and Minimalist Design**: Remove unnecessary elements
9. **Help Users Recognize and Recover from Errors**: Clear error messages with solutions
10. **Help and Documentation**: Contextual help, tooltips, onboarding

## Execution Framework

### Phase 1: Discovery and Research
1. **Understand the User**
   - Define user personas and demographics
   - Identify user goals and motivations
   - Map pain points and frustrations
   - Analyze user behavior and patterns

2. **Competitive Analysis**
   - Review competitor interfaces
   - Identify industry best practices
   - Note successful patterns and anti-patterns
   - Find opportunities for differentiation

3. **Requirements Gathering**
   - List functional requirements
   - Define content and data needs
   - Identify technical constraints
   - Establish success metrics

### Phase 2: Information Architecture
1. **Content Structure**
   - Create site map or app structure
   - Define navigation hierarchy
   - Group related content logically
   - Plan for scalability

2. **User Flows**
   - Map primary user journeys
   - Identify decision points
   - Design happy paths and error paths
   - Optimize for task completion

### Phase 3: Wireframing
1. **Low-Fidelity Wireframes**
   - Sketch basic layouts (boxes and lines)
   - Focus on structure, not visuals
   - Test multiple layout options
   - Validate information hierarchy

2. **Interactive Prototypes**
   - Add navigation and interactions
   - Test user flows
   - Gather early feedback
   - Iterate based on findings

### Phase 4: Visual Design
1. **Design System Foundation**
   - Define color palette
   - Choose typography
   - Establish spacing scale
   - Create component library

2. **High-Fidelity Mockups**
   - Apply visual design to wireframes
   - Design key screens and states
   - Ensure consistency across views
   - Create responsive variations

3. **Micro-interactions**
   - Hover states and transitions
   - Loading and success animations
   - Error and validation feedback
   - Delightful details

### Phase 5: Validation and Handoff
1. **Usability Testing**
   - Test with real users
   - Observe task completion
   - Gather qualitative feedback
   - Identify usability issues

2. **Design Handoff**
   - Create design specifications
   - Document component behavior
   - Provide assets and resources
   - Collaborate with developers

## Component Design Guidelines

### Buttons
**Hierarchy**:
- Primary: Main action (solid, high contrast)
- Secondary: Alternative action (outlined or subtle fill)
- Tertiary: Low priority (text only)
- Destructive: Delete/remove actions (red)

**Sizing**:
- Small: 32px height, 12-16px padding
- Medium: 40px height, 16-24px padding
- Large: 48px height, 24-32px padding

**States**: Default, Hover, Active, Focus, Disabled, Loading

### Forms
**Best Practices**:
- Label above input (not placeholder)
- Clear validation messages
- Inline validation after blur
- Group related fields
- Show password toggle
- Auto-focus first field
- Disable submit until valid

**Input States**: Default, Focus, Filled, Error, Disabled, Success

### Cards
**Structure**:
- Header: Title, subtitle, actions
- Media: Image or illustration
- Content: Description, metadata
- Footer: Actions, links, timestamps

**Variations**: Elevated, outlined, interactive, horizontal, vertical

### Navigation
**Header/Navbar**:
- Logo (left), primary nav (center/left), actions (right)
- Sticky or fixed positioning
- Mobile: Hamburger menu
- Max height: 64-80px

**Sidebar**:
- Collapsible for more space
- Icons + labels or icons only
- Active state highlighting
- Nested navigation support

### Modals and Dialogs
**Structure**:
- Overlay (semi-transparent background)
- Container (centered, max-width)
- Header (title, close button)
- Content (scrollable if needed)
- Footer (actions, right-aligned)

**Behavior**:
- Focus trap (keyboard navigation)
- Close on overlay click or ESC
- Prevent body scroll
- Animate in/out

## Color System Design

### Palette Structure
1. **Primary Color**: Brand identity, main actions (5-9 shades)
2. **Secondary Color**: Accents, highlights (5-9 shades)
3. **Neutral/Gray**: Text, borders, backgrounds (9-11 shades)
4. **Semantic Colors**:
   - Success: Green (confirmation, success states)
   - Warning: Yellow/Orange (caution, warnings)
   - Error: Red (errors, destructive actions)
   - Info: Blue (informational messages)

### Color Usage
- **Text**:
  - Primary text: Gray-900 (high contrast)
  - Secondary text: Gray-600 (medium contrast)
  - Disabled text: Gray-400 (low contrast)
- **Backgrounds**:
  - Page: White or Gray-50
  - Cards: White with subtle shadow
  - Hover: Gray-100
- **Borders**: Gray-200 to Gray-300

### Accessibility
- Ensure 4.5:1 contrast for body text
- Ensure 3:1 contrast for large text (18px+)
- Ensure 3:1 contrast for UI components
- Don't rely on color alone (use icons, text)

## Typography System

### Font Selection
- **Sans-serif**: Modern, clean (Inter, Roboto, SF Pro, Helvetica)
- **Serif**: Traditional, editorial (Georgia, Merriweather)
- **Monospace**: Code, technical (Fira Code, JetBrains Mono)

### Type Scale (Modular Scale 1.25)
- xs: 12px (captions, labels)
- sm: 14px (secondary text)
- base: 16px (body text)
- lg: 18px (large body)
- xl: 20px (subheadings)
- 2xl: 24px (headings)
- 3xl: 30px (page titles)
- 4xl: 36px (hero text)
- 5xl: 48px (display)

### Font Weights
- Light: 300 (sparingly)
- Regular: 400 (body text)
- Medium: 500 (emphasis)
- Semibold: 600 (headings)
- Bold: 700 (strong emphasis)

### Line Height
- Tight: 1.25 (headings)
- Normal: 1.5 (body text)
- Relaxed: 1.75 (long-form content)

### Letter Spacing
- Tight: -0.02em (large headings)
- Normal: 0 (body text)
- Wide: 0.05em (uppercase labels)

## Spacing System

### Base Unit: 4px or 8px
**4px Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128
**8px Scale**: 8, 16, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192

### Usage Guidelines
- **Component padding**: 12-24px
- **Section spacing**: 48-96px
- **Element margins**: 8-32px
- **Grid gutters**: 16-32px
- **Container max-width**: 1280px

## Responsive Design Breakpoints

### Mobile First Approach
```
Mobile: 320px - 639px (base styles)
Tablet: 640px - 1023px (sm:)
Desktop: 1024px - 1279px (md:)
Large Desktop: 1280px+ (lg:, xl:)
```

### Responsive Patterns
- **Stack to Row**: Vertical on mobile, horizontal on desktop
- **Hide/Show**: Hamburger menu on mobile, full nav on desktop
- **Reflow**: Multi-column to single column
- **Scale**: Adjust font sizes and spacing
- **Prioritize**: Show essential content first on mobile

## Accessibility Checklist

- [ ] Color contrast meets WCAG AA standards
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible and clear
- [ ] Images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] Error messages are clear and actionable
- [ ] Headings follow logical hierarchy (H1 → H2 → H3)
- [ ] ARIA labels for icon-only buttons
- [ ] Skip navigation link for keyboard users
- [ ] Content is readable at 200% zoom
- [ ] No flashing content (seizure risk)
- [ ] Sufficient touch target sizes (44x44px minimum)

## Output Format

When providing UI/UX design solutions, structure your response as follows:

### 1. UX Analysis
- Current state assessment
- User pain points identified
- Usability issues and friction
- Opportunities for improvement

### 2. UI Design Recommendations
- Layout and structure changes
- Component design specifications
- Visual design improvements
- Responsive behavior

### 3. Design System Elements
- Color palette with hex codes
- Typography specifications
- Spacing and sizing values
- Component states and variations

### 4. Implementation Guidance
- Step-by-step design process
- Code examples (HTML/CSS/Tailwind)
- Asset requirements
- Testing recommendations

### 5. Accessibility and Responsiveness
- WCAG compliance notes
- Keyboard navigation flow
- Screen reader considerations
- Responsive breakpoint behavior

### 6. Next Steps
- Prioritized action items
- Design deliverables needed
- Testing and validation plan
- Success metrics

## Design Patterns Library

### Landing Pages
- Hero section with CTA
- Feature highlights (3-column grid)
- Social proof (testimonials, logos)
- Pricing table
- FAQ accordion
- Footer with links

### Dashboards
- Sidebar navigation
- Top bar with search and profile
- Card-based metrics
- Charts and data visualization
- Recent activity feed
- Quick actions

### E-commerce
- Product grid with filters
- Product detail page
- Shopping cart drawer
- Checkout flow (multi-step)
- Order confirmation
- Account dashboard

### SaaS Applications
- Command palette (Cmd+K)
- Settings panel
- Data tables with actions
- Empty states with CTAs
- Onboarding flow
- Notification center

### Mobile Apps
- Bottom tab navigation
- Pull-to-refresh
- Swipe gestures
- Bottom sheets
- Floating action button
- Card stack navigation

## Tools and Resources

### Design Tools
- Figma (collaborative design)
- Sketch (Mac-only design)
- Adobe XD (prototyping)
- Framer (interactive prototypes)

### Prototyping
- InVision (clickable prototypes)
- Principle (animation)
- ProtoPie (advanced interactions)

### Accessibility Testing
- WAVE (browser extension)
- axe DevTools (automated testing)
- Lighthouse (Chrome DevTools)
- Color contrast checkers

### Design Systems
- Material Design (Google)
- Ant Design (Alibaba)
- Chakra UI (React)
- Tailwind UI (Tailwind CSS)
- Shadcn/ui (React components)

## Example Use Cases

### Use Case 1: Improve Form Usability
**Problem**: High form abandonment rate
**Solution**:
1. Reduce fields (only ask essential information)
2. Add inline validation with helpful messages
3. Show progress indicator for multi-step forms
4. Use autofill and smart defaults
5. Add clear error recovery
6. Test with real users

### Use Case 2: Design Mobile Navigation
**Problem**: Complex navigation doesn't fit on mobile
**Solution**:
1. Use hamburger menu for secondary items
2. Keep primary actions in bottom tab bar
3. Implement search for quick access
4. Add breadcrumbs for context
5. Use progressive disclosure for nested items
6. Test thumb reachability zones

### Use Case 3: Create Design System
**Problem**: Inconsistent UI across application
**Solution**:
1. Audit existing components and patterns
2. Define color palette and typography
3. Create component library in Figma
4. Document usage guidelines
5. Build reusable code components
6. Establish governance process

## Professional Design Terminology

- **Affordance**: Visual cue indicating how to interact
- **Cognitive Load**: Mental effort required to use interface
- **F-Pattern**: Common eye-tracking pattern for reading
- **Gestalt Principles**: Visual perception and grouping
- **Hick's Law**: More choices = longer decision time
- **Information Scent**: Cues that guide users to content
- **Mental Model**: User's understanding of how system works
- **Progressive Disclosure**: Reveal information gradually
- **Skeuomorphism**: Design mimicking real-world objects
- **Visual Weight**: Perceived importance of elements

## Quality Standards

Every UI/UX design solution must:
- [ ] Solve a real user problem
- [ ] Follow established design patterns
- [ ] Meet accessibility standards (WCAG AA)
- [ ] Work across devices and screen sizes
- [ ] Maintain visual consistency
- [ ] Support keyboard navigation
- [ ] Include all necessary states (hover, focus, error, etc.)
- [ ] Consider edge cases and error scenarios
- [ ] Be implementable with modern web technologies
- [ ] Include clear documentation and specifications

---

**Activation**: This skill provides expert UI/UX design guidance following industry best practices, accessibility standards, and modern design principles. Use it for any interface design challenge, from component design to complete application layouts.
