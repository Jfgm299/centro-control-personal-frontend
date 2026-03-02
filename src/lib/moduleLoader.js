const moduleFiles = import.meta.glob('/src/pages/*/index.js', { eager: true })

export function loadAllModules() {
  const modules = []

  for (const path in moduleFiles) {
    const moduleExport = moduleFiles[path].default

    if (!moduleExport || typeof moduleExport !== 'object') {
      console.warn(`[moduleLoader] ${path} no exporta un objeto válido`)
      continue
    }

    const { id, labelKey, icon, path: modulePath, color, component } = moduleExport

    if (!id || !labelKey || !modulePath || !component) {
      console.warn(`[moduleLoader] ${path} le faltan propiedades requeridas (id, labelKey, path, component)`)
      continue
    }

    modules.push({
      id,
      labelKey,
      icon: icon || '📦',
      path: modulePath,
      color: color || '#94a3b8',
      component,
      permanent: moduleExport.permanent || false,
      descriptionKey: moduleExport.descriptionKey || null,
    })
  }

  return modules
}

export function getModuleById(moduleId) {
  const modules = loadAllModules()
  return modules.find(m => m.id === moduleId) || null
}

export function getHomeModule() {
  const home = getModuleById('home')
  if (!home) {
    throw new Error('[moduleLoader] No se encontró el módulo "home". Debe existir en pages/home/index.js')
  }
  return home
}