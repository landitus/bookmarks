import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: ".",
  manifest: {
    name: "Portable",
    description: "Save links to your Portable pocket",
    version: "0.0.1",
    permissions: ["activeTab", "storage"],
    icons: {
      "16": "icon-16.png",
      "48": "icon-48.png",
      "128": "icon-128.png",
    },
    action: {
      default_title: "Save to Portable",
      default_icon: {
        "16": "icon-16.png",
        "48": "icon-48.png",
        "128": "icon-128.png",
      },
    },
    commands: {
      _execute_action: {
        suggested_key: {
          default: "Ctrl+Shift+S",
          mac: "Command+Shift+S",
        },
        description: "Save current page to Portable",
      },
    },
  },
});

