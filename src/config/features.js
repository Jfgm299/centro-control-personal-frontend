/**
 * Feature flags for gradual rollout and A/B testing.
 * Read from environment variables with sensible defaults.
 */

export const FEATURES = {
  /**
   * Enable n8n-style floating panels for automations editor.
   * When true: NodePicker and NDV render as floating panels.
   * When false: Original fixed sidebar/full-screen NDV.
   */
  N8N_PANELS: import.meta.env.VITE_ENABLE_N8N_PANELS === 'true',

  /**
   * Enable n8n-style node visual redesign.
   * When true: Use N8nBaseNode with new shapes and styles.
   * When false: Use legacy BaseNode components.
   */
  N8N_NODES: import.meta.env.VITE_ENABLE_N8N_NODES === 'true',

  /**
   * Enable inline editor layout (not fullscreen overlay).
   * When true: Editor renders inside page layout, tabs visible.
   * When false: Editor is fullscreen overlay.
   */
  N8N_LAYOUT: import.meta.env.VITE_ENABLE_N8N_LAYOUT === 'true',

  /**
   * Enable animated edges and execution-aware edge states.
   */
  N8N_ANIMATIONS: import.meta.env.VITE_ENABLE_N8N_ANIMATIONS === 'true',

  /**
   * Master kill switch for all n8n-style features.
   * When true: All n8n features enabled (overrides individual flags).
   * When false: Respects individual feature flags.
   * Supports VITE_ENABLE_N8N_GLASS as compatibility alias.
   */
  N8N_STYLE:
    import.meta.env.VITE_ENABLE_N8N_STYLE === 'true'
    || import.meta.env.VITE_ENABLE_N8N_GLASS === 'true',
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
