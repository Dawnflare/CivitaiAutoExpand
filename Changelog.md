# Changelog

All notable changes to this project will be documented in this file.

The format is:
- `Added` for new features
- `Changed` for changes in existing behavior
- `Fixed` for bug fixes
- `Removed` for features removed
- `Security` for security-related changes

## [1.0.0] - 2025-10-28
### Added
- Initial version of the "Civitai Auto Expand Prompts" extension.
- Manifest V3 `manifest.json` targeting `*://civitai.com/*`.
- `content.js` that:
  - Finds the right-side prompt / negative prompt metadata panel on Civitai image pages.
  - Locates "Show more" style expansion controls within that panel.
  - Clicks those controls automatically so the full prompt text is visible without manual interaction.
  - Avoids unrelated "Show more comments" / replies in discussion threads.
  - Uses a `MutationObserver` with debounce to re-run expansion when Civitai dynamically swaps content (SPA navigation).
  - Marks clicked elements to prevent infinite loops / spam clicking.

- `PRD.md` defining scope, requirements, non-goals, and roadmap.
- `README.md` with installation instructions for loading the extension in Brave / Chrome via "Load unpacked."
- `LICENSE.md` (MIT).
- Placeholder `icons/` directory with `icon32.png` and `icon128.png`.

### Notes
- This release focuses on one job: auto-expanding the prompt text and negative prompt text for easier reading and manual copying.
- No data collection, export, storage, or UI surface is included yet.
