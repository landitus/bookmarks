export default defineBackground(() => {
  console.log("Portable extension loaded");

  // The keyboard shortcut opens the popup by default via _execute_action
  // This background script is available for future enhancements like:
  // - Quick save without popup
  // - Context menu integration
  // - Badge updates
});

