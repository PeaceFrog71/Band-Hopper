# Band Hopper - Project Memory

This document provides Claude with persistent context about the Band Hopper project.

## Project Overview

**Band Hopper** is a Star Citizen navigation tool that helps miners and travelers reach specific locations in the Aaron Halo asteroid belt.

- **Version**: See `package.json` for current version
- **Tech Stack**: React 19 + TypeScript + Vite
- **Repository**: PeaceFrog71/Aaron-Halo-Guide

## Quick Commands

```bash
npm run dev      # Start dev server (port 5174)
npm run build    # TypeScript check + Vite build
npm run test     # Run Vitest in watch mode
npm run test:run # Run tests once
npm run lint     # ESLint check
npm run deploy   # Build and deploy to GitHub Pages
```

## Architecture

### Directory Structure
```
src/
├── components/     # React components
├── types/          # TypeScript types + data
├── utils/          # Calculations, formatters, helpers
├── assets/         # Images, icons
├── App.tsx         # Main application component
└── App.css         # Styling
```

### Key Files
- `src/types/bands.ts` - Aaron Halo band data (10 bands, distances, density)
- `src/types/locations.ts` - Stanton system locations (stations, L-points)
- `src/types/routes.ts` - Pre-calculated route database
- `src/types/refineries.ts` - Refinery data and material bonuses
- `src/types/materials.ts` - Minable materials database
- `src/types/ships.ts` - Ship and QT drive data
- `src/utils/calculator.ts` - Core navigation calculations

## Core Features

### 1. Route Calculator
User selects Start → Destination → Shows exit distances for each band
- Uses destination distance method (remaining distance to destination)
- All routes pre-calculated for instant lookup

### 2. "Where Am I?"
Reference tool: Enter a distance from Stanton to see which band it corresponds to

### 3. Smart Refinery Finder
- Find closest refinery from current position
- Material-aware: Select what you mined → Get optimal refinery

### 4. Visual Band Map
Interactive visualization of the 10 bands with density curve

## Aaron Halo Data

### Band Distances (from Stanton marker)
| Band | Inner (km) | Peak Density (km) | Outer (km) |
|------|------------|-------------------|------------|
| 1 | 19,673,000 | 19,702,000 | 19,715,000 |
| 2/3 | 19,815,000 | 19,887,000 | 19,995,000 |
| 4 | 20,071,000 | 20,179,000 | 20,230,000 |
| 5/6 | 20,230,000 | 20,320,000 | 20,540,000 |
| 7 | 20,540,000 | 20,750,000 | 20,881,000 |
| 8 | 20,881,000 | 20,968,000 | 21,046,000 |
| 9 | 21,046,000 | 21,062,000 | 21,132,000 |
| 10 | 21,132,000 | 21,207,000 | 21,298,000 |

Data source: CaptSheppard's Aaron Halo Travel Routes (cstone.space)

## Navigation Method

### Destination Distance Method
1. Select your start location and destination in Band Hopper
2. Note the exit distance for your target band
3. Start quantum travel toward your destination
4. Watch the remaining distance to destination
5. Exit QT when it matches your target band's exit distance

**Note:** The Stanton marker method (monitoring distance to Stanton star) is not available in-game. The destination cannot be selected during quantum travel, and routing to Stanton shows "blocked by navpoint".

## Version Control

**CRITICAL**: Always use `/vc` (Victor) for all git operations. Victor enforces:
- Issue-based workflow ("If it's not in an issue, it doesn't exist")
- Branch naming: `feat/<issue#>-<desc>`, `fix/<issue#>-<desc>`, `chore/<issue#>-<desc>`
- Semantic versioning (patch for fixes, minor for features)
- PR workflow: feature → dev → main
- **NEVER push directly to main**

## Coding Standards

### TypeScript
- Strict mode enabled
- Prefer `type` over `interface` for object shapes
- Export types from `src/types/`

### React Components
- Functional components with hooks only
- Props interface defined above component
- Mobile-first responsive design
- Touch-friendly (44px minimum tap targets)

### Testing
- Use Vitest for unit tests
- Test files co-located: `calculator.test.ts` next to `calculator.ts`
- Focus on calculation accuracy

## Data Sources

- Aaron Halo data: CaptSheppard's research (cstone.space)
- Ship data: Star Citizen community databases
- Refinery bonuses: In-game testing and community resources

## References

- @package.json - Version and scripts
- @src/types/ - All data and types
- @src/utils/calculator.ts - Calculation formulas
- @.claude/commands/vc.md - Victor (version control)
- @docs/foundation/ - Reference materials
