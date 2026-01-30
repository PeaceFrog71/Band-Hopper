---
description: Run tests and fix any failures
allowed-tools: Bash(npm test:*), Bash(npm run test:*)
---

# Run Tests

Run the test suite and help fix any failures.

## Process

1. **Run tests once**
   ```bash
   npm run test:run
   ```

2. **Analyze results**
   - If all pass: Report success with summary
   - If failures: List each failing test with details

3. **For failures, offer to fix**
   - Read the failing test to understand expected behavior
   - Read the source code being tested
   - Determine if it's a test bug or implementation bug
   - Propose a fix

## Output Format

### On Success
```
All tests passed!

Summary:
- 15 tests in 2 files
- Route calculations: 10 passed
- Formatter functions: 5 passed
```

### On Failure
```
Test Failures Found: 2

1. calculateBandExit > should calculate exit distance correctly
   Expected: 14292609
   Received: 14300000
   File: src/utils/calculator.test.ts:45

2. findClosestRefinery > should handle empty material
   Expected: null
   Received: undefined
   File: src/utils/calculator.test.ts:78

Would you like me to investigate and fix these?
```

## Notes

- Tests must pass before committing (Victor will check)
- If fixing tests, ensure the fix matches intended game behavior
- Add new tests when adding calculation logic

User request: $ARGUMENTS
