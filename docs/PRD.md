# Civitai Auto Expand Prompts
Version: 1.0  
Status: Draft  
Owner: (you)

## 1. Problem Statement
When viewing an image on Civitai.com, the right-side metadata panel shows fields such as:
- "Prompt"
- "Negative prompt"
- "Generation data"

These fields are often truncated behind a "Show more" control. The user must manually click "Show more" to reveal the full text every time, for every image.

This creates friction for workflows such as:
- Reading full prompts for study, inspiration, or replication.
- Copying prompts into local archives or model training sets.
- Quickly scanning multiple images in sequence.

We want that expansion to happen automatically.

## 2. Goal
Automatically expand all truncated prompt text on any Civitai image page, with zero user interaction.

More specifically:
- When landing on, or navigating within, civitai.com image pages, any "Show more" link/button in the prompt metadata panel should be auto-clicked.
- The user should always see the fully expanded text without needing to click.
- Behavior should persist even when Civitai dynamically swaps content without a full page reload (single-page-app navigation).

This should happen quietly in the background and never interfere with normal browsing.

## 3. Non-Goals / Out of Scope
- We are NOT modifying, restyling, or reformatting Civitai UI.
- We are NOT auto-clicking unrelated "Show more" or "Load more comments" in the discussion/comments section.
- We are NOT scraping, exporting, or saving the prompt text yet.
- We are NOT adding UI in the browser toolbar (no popup, no options page in v1).
- We are NOT supporting non-Chromium browsers in v1 (tested on Brave / Chrome desktop only).

Future versions might do these things, but v1 is laser-focused on auto-expanding prompts.

## 4. Users / Use Cases
Primary user: Someone browsing Civitai images in Brave/Chrome who wants to see the full prompt immediately, every time, without clicking.

Key use cases:
1. Browsing inspiration  
   User opens many Civitai tabs and wants to see the entire prompt block at a glance.

2. Prompt study / reverse engineering  
   User is studying specific techniques in the prompt ("iridescent subsurface scattering,", etc.) and doesn't want that hidden behind an extra click.

3. Archival / manual copy  
   User copies the expanded prompt text into a local note or database. Having it already expanded lowers friction.

## 5. Requirements

### 5.1 Functional Requirements
FR-1. The extension must run automatically on any page under `https://civitai.com/*`.

FR-2. The extension must attempt to locate all "Show more" controls in sections related to prompt metadata and click them.

FR-3. The extension must avoid mass-clicking other "Show more" elements that are not prompt-related (for example: "Show more comments").

FR-4. The extension must continue to work when the site updates content dynamically without a hard reload.  
  - Example: clicking from one image to another inside Civitai’s SPA router.
  - Implementation detail: use a `MutationObserver` to re-run expansion on DOM changes.

FR-5. The extension must guard against infinite loops:
  - Each button should only be clicked once per appearance.
  - We should mark elements we’ve already clicked.

FR-6. The extension must not require any UI from the user. No popup, no toolbar button.

FR-7. The extension must run at `document_idle` or later, so the DOM is present.

FR-8. The extension should behave even if multiple "Show more" buttons appear in the same panel (for example: Prompt vs Negative Prompt).

### 5.2 Non-Functional Requirements
NFR-1. Stability: The extension should fail quietly if the DOM layout changes in the future. It should never throw blocking exceptions that would interrupt browsing.

NFR-2. Performance: The observer should be lightweight. We should debounce so we don’t re-scan 60 times/second while the page streams comments.

NFR-3. Maintainability: Logic for finding and clicking "Show more" should live in a single helper function in `content.js`, so we can tweak heuristics easily.

NFR-4. Privacy/Security:  
  - We do not send data anywhere.  
  - We do not store or exfiltrate prompts.  
  - We do not request privileged permissions beyond default content script injection on civitai.com.

NFR-5. Portability: The code should work in Brave and Chrome without modification. (Edge is a maybe, but not a guarantee we test in v1.)

## 6. Technical Design

### 6.1 High-Level Behavior
1. `content.js` runs on any `civitai.com/*` URL.
2. On load:
   - Scan the DOM for likely "prompt metadata" panels. Heuristic: containers whose text includes "Prompt" plus either "Generation data" or "Negative prompt."
   - Within those containers, find clickable elements whose visible text is "Show more" or starts with "Show more".
   - Exclude anything that mentions "comments" or "replies" to reduce false positives.
   - Click those buttons programmatically.
   - Mark clicked elements with a flag (e.g. `el.__civitaiExpanded = true`) so we don’t re-click.

3. Also set up a `MutationObserver` on `document.documentElement`. Whenever new nodes are injected:
   - Wait ~200 ms (debounce).
   - Run the same expansion logic again.
   - This covers single-page navigation and lazy loading.

4. Also run expansion again after fixed timeouts (e.g. 1s, 3s after load) to catch late-rendered panels.

### 6.2 manifest.json (Manifest V3)
- `manifest_version: 3`
- `content_scripts` with:
  - `matches: ["*://civitai.com/*"]`
  - `js: ["content.js"]`
  - `run_at: "document_idle"`
- basic icons (32px, 128px)
- no background service worker in v1

No special host permissions needed beyond the default for `civitai.com`.

### 6.3 content.js Core Logic
Core pieces:
- A guard so it only initializes once per page.
- `findShowMoreButtons()`:
  - Identify candidate info panels via fuzzy innerText matching.
  - From those panels, collect elements that look clickable and whose text is "Show more".
- `expandAll()`:
  - Loop through those candidates.
  - If not already clicked, click and mark them.
- `MutationObserver` with debounce to re-run `expandAll()` as the DOM changes.

### 6.4 Error Handling
- Wrap clicks in try/catch. A failed click shouldn’t break anything.
- If nothing matches, silently do nothing.

### 6.5 Versioning
- Start at version `1.0.0` in both manifest.json and PRD.
- Increment patch for bugfixes, minor heuristic changes.
- Increment minor for new behavior like prompt scraping/export.
- Major reserved for breaking changes or manifest permission changes.

## 7. Edge Cases & Open Questions
1. Text change: If Civitai renames "Show more" to "Expand" or "More...", the heuristic will miss. We’ll address that in a later revision if it happens.

2. Localization: If the site localizes UI text (e.g. "Afficher plus"), v1 won't detect. Non-goal in 1.0.

3. Multiple panels: Some pages may have multiple prompt-like sections (e.g. a "Workflow prompt" panel plus "Negative prompt"). We want to expand all of them. The current approach does so.

4. Comments section "Show more":  
   We explicitly try not to click "Show more comments". Our heuristic excludes text containing "comment" or "reply". We may need more filters later if we see accidental spam-clicking.

5. SPA route changes without full reload:  
   MutationObserver + debounced `expandAll()` is expected to handle this. If Civitai moves to shadow DOM or aggressively virtualizes, we may need to adapt.

## 8. Roadmap / Future Enhancements
Future v1.x ideas:
- Auto-copy prompt + negative prompt into `localStorage` or IndexedDB for later export.
- Add a small popup action (browserAction) with "Copy prompt now" / "Download prompt as .txt".
- Add an options page to toggle behaviors:
  - Auto-expand only Prompt
  - Auto-expand Prompt + Negative Prompt
  - Also expand other metadata like model, steps, sampler, CFG, seed, etc.

Future v2+:
- Automatic export of prompt metadata to a local text file or JSON file when a new image loads.
- Bulk extraction across multiple open tabs.

## 9. Definition of Done (DoD) for v1.0
- A working Manifest V3 extension folder with:
  - `manifest.json`
  - `content.js`
  - icons (placeholder PNGs)
  - `PRD.md`

- When the extension is loaded unpacked in Brave, navigating to a Civitai image page results in:
  - The "Prompt" field fully expanded without manual clicking.
  - The "Negative Prompt" fully expanded (if truncated).
  - No obvious spam-clicking of unrelated UI elements.

- No console errors thrown repeatedly (minor warnings are OK).

- Code reviewed (self-review is fine for v1) and pushed to GitHub main branch.

