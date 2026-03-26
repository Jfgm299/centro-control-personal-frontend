/**
 * Feature flags for the automations n8n-style redesign.
 * These are hardcoded — not read from env vars.
 * To disable a feature, change the value here and redeploy.
 */

export const FEATURES = {
  /** Floating panels for NodePicker and NDV */
  N8N_PANELS: true,

  /** n8n-style node visual redesign (N8nBaseNode with shapes per category) */
  N8N_NODES: true,

  /** Inline editor layout — editor renders inside page layout, tabs visible */
  N8N_LAYOUT: true,

  /** Animated edges and execution-aware edge states */
  N8N_ANIMATIONS: false,

  /** Master switch — enables all N8N_* features when true */
  N8N_STYLE: true,
}

/**
 * Check if a feature is enabled.
 * Master switch (N8N_STYLE) enables all related features.
 */
export function isFeatureEnabled(feature) {
  if (FEATURES.N8N_STYLE && feature.startsWith('N8N_')) {
    return true
  }
  return FEATURES[feature] ?? false
}
