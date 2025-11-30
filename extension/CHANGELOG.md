# Extension Changelog

All notable changes to the Portable browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2025-11-30

### Added
- Bookmark pre-check: Automatically checks if bookmark exists before showing save view
- "Already Saved" celebratory view when bookmark already exists
- Relative save date display (e.g., "Saved 3 days ago")
- Version display in settings view
- Update check functionality with "Check for updates" button
- Fallback handling: Shows "already saved" view if save fails with duplicate error
- "Open in Portable" button in already saved view
- WXT browser extension with popup UI and keyboard shortcut (Cmd+Shift+S)
- Environment switching (Local/Production) with separate API keys
- Status indicators for credential configuration

### Changed
- Removed description text from settings view
- Improved error handling and logging for bookmark checks

### Fixed
- Fixed issue where duplicate bookmarks would show error instead of celebratory view

