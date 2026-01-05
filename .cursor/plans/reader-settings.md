# Reader Settings Panel

## Overview
Customizable reader experience with typography themes and display modes for the article reader view.

## Status: ✅ Completed

## Features Implemented

### Display Modes
Three display modes that affect only the article content area (not the app chrome):

| Mode | Background | Text Color | Use Case |
|------|------------|------------|----------|
| **Light** | White | Dark gray | Default, bright environments |
| **Amber** | Warm cream | Brown | E-reader style, reduced eye strain |
| **Dark** | Dark gray | Light gray | Low-light reading |

### Typography Themes
Three paired font themes:

| Theme | Text Font | Code Font | Description |
|-------|-----------|-----------|-------------|
| **Modern** | Inter | IBM Plex Mono | Clean, minimal sans-serif |
| **Editorial** | Literata | Fira Code | Classic serif for long-form reading |
| **Terminal** | IBM Plex Mono | IBM Plex Mono | Code editor style (1rem font size) |

### UI Components

1. **ReaderSettingsPopover** (`src/components/reader/reader-settings-popover.tsx`)
   - Gear icon button in reader header
   - Horizontal grid of display mode options with icons
   - Horizontal grid of typography options with "Abc" font previews
   - Settings persist in localStorage

2. **ReaderSettingsProvider** (`src/components/reader/reader-settings-provider.tsx`)
   - React Context for reader settings state
   - `useReaderSettings()` hook for consuming settings
   - localStorage persistence with `portable:reader-settings` key

3. **ReaderPane** (in `item-reader-view.tsx`)
   - Wrapper component that applies `data-reader-theme` and `data-reader-display` attributes
   - CSS variables control colors and fonts based on attributes

### CSS Architecture

Display mode CSS variables (in `globals.css`):
- `--reader-bg` - Background color
- `--reader-fg` - Text color
- `--reader-fg-muted` - Muted text color
- `--reader-border` - Border color
- `--reader-code-bg` - Code block background

Typography applied via CSS selectors:
```css
.reader-pane[data-reader-theme="modern"] .prose-reader { ... }
.reader-pane[data-reader-theme="editorial"] .prose-reader { ... }
.reader-pane[data-reader-theme="terminal"] .prose-reader { ... }
```

## App Font Changes

Replaced default app fonts:
- **Sans-serif**: Geist → **Inter**
- **Monospace**: Geist Mono → **IBM Plex Mono**

## Other Changes

- Removed theme toggle (light/dark/system) from user dropdown menu
- Reader display modes are independent of app system theme

## Files Modified

- `src/app/layout.tsx` - Font imports and CSS variables
- `src/app/globals.css` - Reader display and typography CSS
- `src/app/(reader)/items/[id]/item-reader-view.tsx` - ReaderPane wrapper
- `src/components/reader/reader-settings-provider.tsx` - Settings context
- `src/components/reader/reader-settings-popover.tsx` - Settings UI
- `src/components/reader/index.ts` - Exports
- `src/components/layout/user-menu.tsx` - Removed theme toggle

## Dev Tools

**Font Playground** (`/dev/fonts`) - Development tool for experimenting with font pairings:
- Side-by-side comparison of two font pairings
- Select dropdowns with curated lists (20 body fonts, 10 code fonts)
- Display mode toggle matching reader colors
- Live Google Fonts loading
- Copy config button

## Branch
`feature/reader-settings`

