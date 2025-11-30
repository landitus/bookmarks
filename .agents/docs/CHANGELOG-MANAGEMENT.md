# Changelog Management Guide

**Purpose:** This document describes how to maintain changelogs for the Portable project.

**Last Updated:** 2025-11-30

---

## Overview

We maintain separate changelogs for:
- **Webapp:** `CHANGELOG.md` in the root directory
- **Extension:** `extension/CHANGELOG.md`

Both follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format and use [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## Workflow

### Before Every Commit

1. **Review your changes** - What files did you modify?
2. **Determine scope** - Webapp only, extension only, or both?
3. **Update appropriate changelog(s)** - Add entry under `[Unreleased]`
4. **Commit changelog with code** - Include changelog updates in the same commit

### Changelog Entry Format

```markdown
## [Unreleased]

### Added
- New feature description

### Changed
- What was modified and why

### Deprecated
- What will be removed in future versions

### Removed
- What was removed

### Fixed
- Bug fix description

### Security
- Security vulnerability fixes
```

### Categorization Guidelines

- **Added:** New features, endpoints, UI components, functionality
- **Changed:** Modifications to existing features, API changes, UI updates
- **Deprecated:** Features that will be removed in future versions
- **Removed:** Features that were removed
- **Fixed:** Bug fixes, error corrections
- **Security:** Security patches and vulnerability fixes

### Writing Good Entries

- **Be specific:** "Added bookmark pre-check" not "Added stuff"
- **Be user-focused:** Describe what users will see/experience
- **Be concise:** One line per change, use bullet points
- **Reference code:** Link to relevant files/PRs when helpful
- **Group related changes:** Multiple related changes can be grouped

### Examples

**Good:**
```markdown
### Added
- Bookmark pre-check: Automatically checks if bookmark exists before showing save view
- "Already Saved" celebratory view when bookmark already exists
- Version display in settings view with update check functionality
```

**Bad:**
```markdown
### Added
- Stuff
- Things
- More stuff
```

---

## Versioning

### Semantic Versioning

We use [Semantic Versioning](https://semver.org/spec/v2.0.0.html):
- **MAJOR:** Breaking changes (e.g., 1.0.0 → 2.0.0)
- **MINOR:** New features, backwards compatible (e.g., 1.0.0 → 1.1.0)
- **PATCH:** Bug fixes, backwards compatible (e.g., 1.0.0 → 1.0.1)

### Release Process

1. **Move `[Unreleased]` to versioned section:**
   ```markdown
   ## [1.0.1] - 2025-11-30
   
   ### Added
   - Previous unreleased entries...
   ```

2. **Update version numbers:**
   - `package.json` (webapp)
   - `extension/package.json` (extension)
   - `extension/wxt.config.ts` (extension manifest)
   - `src/app/api/extension/version/route.ts` (latest version endpoint)

3. **Create git tag:**
   ```bash
   git tag -a v1.0.1 -m "Release version 1.0.1"
   ```

---

## File Locations

- **Webapp changelog:** `/CHANGELOG.md`
- **Extension changelog:** `/extension/CHANGELOG.md`
- **Version endpoint:** `/src/app/api/extension/version/route.ts`

---

## Integration with Git Workflow

### Standard Commit Flow

```bash
# 1. Make code changes
# 2. Update changelog(s)
# 3. Stage all changes including changelogs
git add -A

# 4. Commit with descriptive message
git commit -m "Add bookmark pre-check and version display

- Add GET /api/items endpoint to check if bookmark exists
- Add 'Already Saved' celebratory view
- Add version display and update check functionality"

# 5. Push
git push
```

### Commit Message Format

- First line: Brief summary (50 chars or less)
- Blank line
- Detailed description with changelog entries
- Reference issues/PRs if applicable

---

## Best Practices

1. **Update changelogs immediately** - Don't wait until release
2. **Be consistent** - Use same format and style throughout
3. **Be honest** - Document breaking changes clearly
4. **Group logically** - Related changes together
5. **Review before release** - Ensure all changes are documented

---

## Common Scenarios

### New Feature Affecting Both

Update both changelogs:
```markdown
# CHANGELOG.md
## [Unreleased]
### Added
- New feature description

# extension/CHANGELOG.md
## [Unreleased]
### Added
- Extension support for new feature
```

### Bug Fix in Extension Only

Update only extension changelog:
```markdown
# extension/CHANGELOG.md
## [Unreleased]
### Fixed
- Fixed issue where duplicate bookmarks would show error
```

### API Change

Update webapp changelog:
```markdown
# CHANGELOG.md
## [Unreleased]
### Added
- GET /api/items endpoint to check if bookmark exists

### Changed
- POST /api/items now returns 409 for duplicates instead of error message
```

---

## Questions?

- **When in doubt, add an entry** - Better to document too much than too little
- **Check existing entries** - Follow the same style and format
- **Group related changes** - Multiple related changes can share one entry
- **Be user-focused** - Describe what users will experience

---

**Remember:** Changelogs are for users and developers to understand what changed. Keep them clear, accurate, and up-to-date.

