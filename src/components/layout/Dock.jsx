import { useState } from 'react'
import { useMotionValue } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useModuleStore } from '../../store/moduleStore'
import DockIcon from './DockIcon'
import './Dock.css'

export default function Dock() {
  const { modules, openTabs, activeTabId, openModule } = useModuleStore()
  const navigate  = useNavigate()

  // Shared motion value — set to Infinity when mouse is outside dock
  const mouseX = useMotionValue(Infinity)

  // Track which icon is bouncing after click
  const [bouncing, setBouncing] = useState(null)

  const handleClick = (module, idx) => {
    // Trigger bounce
    setBouncing(idx)
    setTimeout(() => setBouncing(null), 700)
    // Navigate
    openModule(module.id)
    navigate(module.path)
  }

  return (
    <div className="dock-wrapper">
      <div
        className="dock-container"
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {modules.map((module, idx) => (
          <DockIcon
            key={module.id}
            module={module}
            mouseX={mouseX}
            isActive={activeTabId === module.id}
            isOpen={openTabs.some((t) => t.id === module.id)}
            isBouncing={bouncing === idx}
            onClick={() => handleClick(module, idx)}
          />
        ))}
      </div>
    </div>
  )
}