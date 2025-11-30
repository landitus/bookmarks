# Changelog

All notable changes to the Portable webapp will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GET `/api/items` endpoint to check if a bookmark exists before saving
- `/api/extension/version` endpoint for extension version checking

### Changed
- Improved duplicate bookmark handling in POST `/api/items` endpoint

### Fixed
- Fixed layout shift in sign-in form when clicking submit button

## [0.0.1] - 2025-11-30

### Added
- Link capture system with API endpoint (`/api/items`) and Bearer token authentication
- API key management UI in user menu (view, copy, regenerate)
- YouTube/Vimeo oEmbed support for proper metadata extraction
- Real-time sync via Supabase Realtime
- PWA manifest with share_target for mobile
- Serwist service worker for offline support

### Fixed
- Fixed Next.js redirect error flash in auth form
- Fixed localhost IPv6 issues (use 127.0.0.1)
- Fixed server action sync issues in production

