// Civitai Auto Expand Prompts
// Goal: whenever we're on a Civitai page with a prompt panel,
// click the 'Show more' button so the full text is visible.

(function () {
  // Safety valve so we don't run twice
  if (window.__civitaiAutoExpandLoaded) return;
  window.__civitaiAutoExpandLoaded = true;

  // Helper: get all candidate "Show more" buttons in the prompt/gen data panel
  function findShowMoreButtons(root = document) {
    // Step 1. Find likely "prompt metadata" panels.
    // We'll look for sections that mention "Generation data" or "Prompt" and "Negative prompt".
    // This is intentionally fuzzy instead of hardcoding class names,
    // because Civitai likes utility classes that change.
    const infoPanels = [...root.querySelectorAll("aside, section, div")].filter(panel => {
      const txt = panel.innerText || "";
      // Must have "Prompt" AND something like "Generation data"/"Negative prompt"
      return /Prompt/i.test(txt) && (/Generation data/i.test(txt) || /Negative prompt/i.test(txt));
    });

    // If we didn't find any panels (or SPA hasn't loaded yet), just fallback to whole document.
    const scopes = infoPanels.length ? infoPanels : [document];

    // Step 2. Within those scopes, look for "Show more" UI elements that are clickable.
    const candidates = [];
    for (const scope of scopes) {
      // Typical clickable elements
      const maybeButtons = scope.querySelectorAll(
        'button, a, [role="button"], .cursor-pointer, .underline, .text-primary, .text-accent'
      );

      for (const el of maybeButtons) {
        const label = (el.innerText || el.textContent || "").trim().toLowerCase();
        // We only want "show more", not "load more comments", etc.
        if (!label) continue;

        // Heuristic:
        // 1. starts with "show more"
        // 2. Not obviously "comments" or "replies"
        const isGenericShowMore = label.startsWith("show more");
        const isNumericShowMore = /^show\s+\d+\s+more\b/.test(label);

        if (
          (isGenericShowMore || isNumericShowMore) &&
          !label.includes("comment") &&
          !label.includes("reply")
        ) {
          candidates.push(el);
        }
      }
    }

    return candidates;
  }

  // Click all "Show more" buttons we find, but only once per element.
  function expandAll() {
    const btns = findShowMoreButtons();
    for (const btn of btns) {
      // avoid re-clicking same node forever
      if (!btn.__civitaiExpanded) {
        btn.__civitaiExpanded = true;
        // Click gently
        btn.click();
        // Sometimes Civitai replaces the button with new DOM and creates another "Show more".
        // We'll keep watching with MutationObserver anyway.
      }
    }
  }

  // Expand now after initial load.
  expandAll();

  // Watch for SPA navigation / DOM changes.
  // Any time new nodes are added, try again.
  const obs = new MutationObserver(muts => {
    // Lightweight debounce so we don't thrash
    // We attach a tiny timer that batches rapid mutations.
    if (window.__civitaiExpandTimer) {
      clearTimeout(window.__civitaiExpandTimer);
    }
    window.__civitaiExpandTimer = setTimeout(() => {
      expandAll();
    }, 200);
  });

  obs.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  // Optional: also expand after a short delay in case network-render finishes late.
  setTimeout(expandAll, 1000);
  setTimeout(expandAll, 3000);
})();
