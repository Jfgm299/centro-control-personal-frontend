import { Minus, X, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * Standard panel header with title and action buttons (collapse, close).
 * Serves as the drag handle for FloatingPanel.
 */
export default function PanelHeader({
  title,
  collapsed = false,
  collapsible = true,
  onCollapse,
  onClose,
  className = '',
  children,
}) {
  return (
    <div className={`panel-header ${className}`}>
      <span className="panel-header__title">{title}</span>

      <div className="panel-header__actions">
        {children}
        
        {collapsible && onCollapse && (
          <button
            type="button"
            onClick={onCollapse}
            className="panel-header__btn"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown size={14} /> : <Minus size={14} />}
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="panel-header__btn panel-header__btn--close"
            title="Close"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
