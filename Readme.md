# Civitai Auto Expand Prompts

Automatically expands truncated prompt text on Civitai image pages so you never have to click "Show more" again.

## What this extension does

When you open an image page on [civitai.com](https://civitai.com), the right-side panel shows useful generation metadata:
- Prompt
- Negative prompt
- Sampler / Steps / CFG / etc.

Those fields are often collapsed behind a little "Show more" element.  
This extension finds those "Show more" controls and clicks them for you.

So:
- You always see the full prompt immediately.
- You don't have to manually expand it.
- You can copy/paste the full text right away.

It also keeps working as you move between images within Civitai (which behaves like a single-page app). No reload required.

## Status

- Version: `1.0.0`
- Manifest: v3
- Browsers: Tested on Brave / Chrome desktop
- Scope: Only runs on `https://civitai.com/*`

This is an early utility release, focused on one job: auto-expand the prompt panel.

## How it works (high level)

1. A content script (`content.js`) runs on any `civitai.com/*` page.
2. It looks for the metadata panel that contains `Prompt`, `Negative prompt`, etc.
3. Inside that panel, it searches for clickable elements whose text is "Show more".
4. It clicks those elements automatically and marks them so it doesn’t click them over and over.
5. It also installs a `MutationObserver` to handle dynamic navigation inside Civitai.  
   If Civitai swaps in new content without a full page reload, the script expands again.

The script intentionally tries to ignore "Show more comments" or "Show more replies" in the discussion thread, because we only care about the prompt.

No data is collected, stored, or sent anywhere.

## Installation (unpacked / developer mode)

This is how to load the extension locally in Brave or Chrome:

1. Clone or download this repo.

2. Open `brave://extensions` (or `chrome://extensions`).

3. In the top-right, enable **Developer mode**.

4. Click **Load unpacked**.

5. Select the folder containing:
   - `manifest.json`
   - `content.js`
   - `PRD.md`
   - `icons/icon32.png`
   - `icons/icon128.png`
   - (and this `README.md`)

6. Navigate to a Civitai image page.  
   You should see the "Prompt" and "Negative prompt" sections already fully expanded without clicking "Show more."

If it doesn’t work at first:
- Try refreshing the page once.
- Open DevTools (F12) → Console tab and check for errors from `content.js`.

## Files in this repo

- `manifest.json`  
  Chrome/Brave extension manifest (Manifest V3). Declares this as a content script that runs on `civitai.com/*`.

- `content.js`  
  The logic that:
  - Finds the prompt panel
  - Finds "Show more"
  - Clicks it
  - Watches for Civitai’s dynamic content changes

- `PRD.md`  
  Product Requirements Document. Defines the problem, scope, non-goals, and future roadmap.

- `README.md`  
  You're reading it.

- `icons/`  
  Placeholder icons so the browser doesn't complain. These can be any PNGs at the appropriate size.

## Privacy & permissions

- This extension does not make network requests.
- It does not send data off your machine.
- It does not add UI, context menus, or hotkeys.
- It does not require broad host permissions.  
  It only runs on pages that match `*://civitai.com/*`.

## Roadmap / future ideas

These are out of scope for v1.0.0 but likely future enhancements:

- Capture the expanded prompt (including negative prompt and generation settings) and store it in `localStorage` so you can export everything later.
- Add a small popup with "Copy prompt" / "Download metadata".
- Add options to enable/disable certain behaviors:
  - Expand Prompt only
  - Expand Prompt + Negative Prompt
  - Also expand metadata like sampler/seed/etc.

- Export to a structured JSON blob for training/reference.

If you have feature requests or you break the heuristic because Civitai changed their DOM, feel free to open an issue.

## License

MIT License. See `LICENSE` for details.

## Disclaimer

This project is not affiliated with Civitai.  
It just saves your wrists from 10,000 tiny "Show more" clicks.
