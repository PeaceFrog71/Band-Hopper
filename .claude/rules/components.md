---
paths: src/components/**/*.tsx
---

# React Component Rules

## Structure
- Use functional components with hooks - no class components
- Define Props interface directly above the component
- Export component as default at the bottom of the file

```tsx
interface MyComponentProps {
  value: number;
  onChange: (value: number) => void;
}

function MyComponent({ value, onChange }: MyComponentProps) {
  // Component logic
}

export default MyComponent;
```

## State Management
- Use `useState` for local component state
- Use `useMemo` for expensive calculations
- Use `useEffect` sparingly - prefer derived state where possible
- Avoid prop drilling - consider lifting state to App.tsx

## Styling
- Component styles can go in `App.css` (global styles) or in component-specific CSS files
- Use descriptive class names: `.location-selector`, `.band-map`
- Star Citizen theme: dark backgrounds, cyan/gold accents

## Component Responsibilities
- **LocationSelector**: Dropdown for selecting start/destination locations
- **BandDisplay**: Show individual band information
- **RouteResult**: Display exit distances for selected route
- **ShipSelector**: Ship selection for travel time calculations
- **ExitCalculator**: Main exit distance display
- **WhereAmI**: Enter distance → find current band
- **RefineryFinder**: Find best refinery for material
- **MaterialSelector**: Select mined material
- **BandMap**: Interactive visual density chart

## Mobile-First Design
- Touch-friendly controls (minimum 44px tap targets)
- Large, readable exit distance displays
- Horizontal scrolling for tab navigation on mobile
- Support both portrait and landscape orientations

## Imports
- Import types from `../types`
- Import utilities from `../utils/`
- Import assets with proper file extensions
