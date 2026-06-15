# Contributing to Japan Otaku Map

Thank you for your interest in contributing to Japan Otaku Map! This document outlines the process for contributing to the project.

## Code of Conduct

Be respectful. Be constructive. This is a project made by otaku for otaku — keep the community welcoming.

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/9dk9jptv8h-hue/japan-otaku-map/issues) to avoid duplicates
2. Use the **Bug Report** template (if available)
3. Include:
   - Browser & OS version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Search [existing issues](https://github.com/9dk9jptv8h-hue/japan-otaku-map/issues) first
2. Open a new issue with the **Feature Request** label
3. Describe the use case and why it benefits the project

### Pull Requests

1. **Fork** the repository
2. **Create a branch**: `feature/your-feature-name` or `fix/your-bug-fix`
3. **Keep changes focused**: One feature or fix per PR
4. **Write clear commit messages** (preferably in English)
5. **Test your changes**: Run `npm run build` to ensure no broken builds
6. **Update documentation** if your change affects usage
7. **Open the PR** against the `main` branch with a clear description

### Development Workflow

```bash
# Fork & clone
git clone git@github.com:YOUR_USERNAME/japan-otaku-map.git
cd japan-otaku-map

# Install dependencies
npm install

# Create a branch
git checkout -b feature/my-feature

# Start dev server
npm run dev

# Before committing
npm run lint
npm run build

# Commit & push
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

### Code Style

- **TypeScript**: Strict mode enabled. No `any` unless absolutely necessary.
- **Formatting**: Follow the existing ESLint configuration
- **Components**: Use functional components with hooks. Keep files under 300 lines.
- **CSS**: Use TailwindCSS utility classes. Custom CSS goes in `index.css`.
- **State**: Use Zustand stores under `src/store/`. Avoid prop drilling.

### Project Conventions

| Convention | Detail |
|------------|--------|
| Branch naming | `feat/`, `fix/`, `docs/`, `refactor/` |
| Commit style | Conventional Commits (`feat:`, `fix:`, `docs:`, etc.) |
| File naming | `kebab-case` for files, `PascalCase` for components |
| Imports | Path alias `@/` maps to `src/` |

### Adding New Shop Data

To add a new shop location, edit `src/constants/mockData.ts`:

```typescript
{
  id: 'ani-xxx-N',                    // Unique ID
  name: 'animate〇〇',                 // 中文名称
  nameJa: 'アニメイト〇〇',           // 日文名称
  description: '...',                 // Short description
  category: 'animate',                // animate | melonbooks | mandarake
  latitude: 35.000,                   // Decimal degrees
  longitude: 139.000,                 // Decimal degrees
  imageUrl: IMG,                      // Use IMG constant
  address: '都道府県市区町村...',     // Japanese address
  tags: ['tag1', 'tag2'],             // Searchable tags
  rating: 4.0,                        // 0-5, based on Google Maps
  visitCount: 500,                    // Approximate reviews (thousands)
  updatedAt: '2025-01-01',            // YYYY-MM-DD
}
```

## Questions?

Open a [Discussion](https://github.com/9dk9jptv8h-hue/japan-otaku-map/discussions) or ask in an issue.

---

*Happy contributing — and may your journey be legendary.*
