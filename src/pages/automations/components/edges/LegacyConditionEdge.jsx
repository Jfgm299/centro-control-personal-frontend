import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react'

export default function LegacyConditionEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data = {},
  markerEnd,
}) {
  const when = data?.when

  const color = when === 'true' ? '#22c55e'
    : when === 'false' ? '#ef4444'
      : '#94a3b8'

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
    borderRadius: 8,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: color, strokeWidth: 2 }}
      />

      {when && (
        <EdgeLabelRenderer>
          <div style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'none',
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
            background: color,
            padding: '1px 6px',
            borderRadius: 6,
          }}>
            {when}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
