import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

export default function SelectInput({
  options, // [{value: 'id', label: 'Display', color?: '#HEX', icon?: '📅'}]
  value, 
  onChange, 
  placeholder, 
  className,
  labelKey, // If options are objects and you want to use i18n for labels
  optionIconKey, // If options have icons
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedOption = options.find(option => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full px-5 py-2.5 text-sm bg-black/20 border border-white/10 rounded-xl text-white text-left transition-all shadow-inner relative overflow-hidden flex items-center gap-3 group",
          isOpen ? "border-white/30 ring-1 ring-white/30" : "hover:border-white/20",
          className
        )}
      >
        {/* Accent bar for color */}
        {selectedOption?.color && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-2.5 opacity-100 rounded-l-xl transition-all duration-300 group-hover:w-3.5"
            style={{ 
              backgroundColor: selectedOption.color,
              boxShadow: `inset -1px 0 3px rgba(0,0,0,0.1), 2px 0 15px ${selectedOption.color}40`
            }}
          />
        )}
        
        <div 
          className={clsx(
            "flex-1 flex items-center gap-3 truncate transition-all duration-300",
            selectedOption?.color ? "pl-4" : "pl-0"
          )}
        >
          {selectedOption?.[optionIconKey || 'icon'] && (
             <span className="text-xl leading-none drop-shadow-md">{selectedOption[optionIconKey || 'icon']}</span>
          )}
          <span className="truncate font-black tracking-tight uppercase text-[11px] opacity-90">
            {selectedOption 
              ? selectedOption[labelKey || 'label']
              : placeholder
            }
          </span>
        </div>
        
        <svg className={clsx("w-4 h-4 text-white/30 transition-transform", isOpen && "rotate-180")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[10001] w-full mt-2 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-64 overflow-y-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => { onChange(''); setIsOpen(false) }}
              className="w-full px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 text-left transition-colors flex items-center gap-4"
            >
              <div className="w-2 h-2 rounded-full bg-white/10 border border-white/10" />
              {placeholder}
            </button>
            
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setIsOpen(false) }}
                className="w-full px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white hover:bg-white/10 text-left transition-colors flex items-center gap-4 relative group"
              >
                {option.color && (
                  <div 
                    className="absolute left-0 top-2 bottom-2 w-1 opacity-60 rounded-r-full transition-all group-hover:w-2"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span className="text-xl shrink-0 group-hover:scale-110 transition-transform drop-shadow-md">{option[optionIconKey || 'icon']}</span>
                <span className="flex-1 truncate">
                  {option[labelKey || 'label']}
                </span>
                {value === option.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/50 shadow-[0_0_8px_white]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
