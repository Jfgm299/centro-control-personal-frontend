import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react'

const STATUS_CLASS = {
  running: 'edge-path--executing',
  success: 'edge-path--success',
  error: 'edge-path--error',
}

export default function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data = {},
}) {
  const status = data?.executionStatus ?? data?.status ?? 'default'
  const condition = data?.when
  const label = data?.label ?? condition
  const showLabel = Boolean(data?.showLabel ?? condition)
  const isAnimating = Boolean(data?.isAnimating ?? status === 'running')

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  })

  const classes = ['edge-path']
  if (STATUS_CLASS[status]) classes.push(STATUS_CLASS[status])
  if (condition === 'true') classes.push('edge-path--true')
  if (condition === 'false') classes.push('edge-path--false')
  if (isAnimating) classes.push('edge-path--animating', 'edge-path--pulse')

  const labelClasses = ['edge-label']
  if (condition === 'true') labelClasses.push('edge-label--true')
  else if (condition === 'false') labelClasses.push('edge-label--false')
  else labelClasses.push('edge-label--default')

  return (
    <>
      {isAnimating && (
        <BaseEdge
          id={`${id}-glow`}
          path={edgePath}
          className="edge-glow"
          markerEnd={markerEnd}
        />
      )}

      <BaseEdge
        id={id}
        path={edgePath}
        className={classes.join(' ')}
        markerEnd={markerEnd}
      />

      {showLabel && (
        <EdgeLabelRenderer>
          <div
            className={labelClasses.join(' ')}
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
