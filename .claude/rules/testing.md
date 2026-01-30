---
paths: src/**/*.test.ts, src/**/*.spec.ts
---

# Testing Rules

## Framework
- **Vitest** for unit testing
- Run with `npm test` (watch mode) or `npm run test:run` (single run)

## Test Organization
- Co-locate test files with source: `calculator.test.ts` next to `calculator.ts`
- Group related tests with `describe` blocks
- Use clear, descriptive test names

```typescript
describe('calculateBandExit', () => {
  it('should return correct exit distance for Band 5', () => {
    // Test implementation
  });

  it('should return null when route does not cross halo', () => {
    // Test implementation
  });
});
```

## What to Test
- **Route calculations**: All distance calculations
- **Band detection**: "Where Am I?" functionality
- **Refinery finder**: Material-aware refinery selection
- **Edge cases**: Invalid inputs, boundary conditions

## Test Patterns
```typescript
// Arrange
const route = getRoute('arc-l1', 'cru-l4');

// Act
const result = getBandExitDistance(route, 5);

// Assert
expect(result.distanceToDestination).toBe(14_292_609);
```

## Running Tests
```bash
npm test          # Watch mode - rerun on changes
npm run test:run  # Single run - for CI/pre-commit
npm run test:ui   # Visual UI dashboard
```

## Before Committing
- All tests must pass
- Add tests for new calculation logic
- Update existing tests if behavior changes intentionally
