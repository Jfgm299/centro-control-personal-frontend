import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Importar todos los namespaces
import esCommon from './locales/es/common.json'
import esHome from './locales/es/home.json'
import esGym from './locales/es/gym.json'
import esExpenses from './locales/es/expenses.json'
import esFlights from './locales/es/flights.json'
import esMacro from './locales/es/macro.json'

import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enGym from './locales/en/gym.json'
import enExpenses from './locales/en/expenses.json'
import enFlights from './locales/en/flights.json'
import enMacro from './locales/en/macro.json'

i18n.use(initReactI18next).init({
  resources: {
    es: {
      common:   esCommon,
      home:     esHome,
      gym:      esGym,
      expenses: esExpenses,
      flights:  esFlights,
      macro:    esMacro,
    },
    en: {
      common:   enCommon,
      home:     enHome,
      gym:      enGym,
      expenses: enExpenses,
      flights:  enFlights,
      macro:    enMacro,
    },
  },
  lng: localStorage.getItem('language') || 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false, // React ya escapa por defecto
  },
})

export default i18n