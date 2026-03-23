import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Importar todos los namespaces
import esCommon from './locales/es/common.json'
import esAuth from './locales/es/auth.json'
import esHome from './locales/es/home.json'
import esGym from './locales/es/gym.json'
import esExpenses from './locales/es/expenses.json'
import esFlights from './locales/es/flights.json'
import esMacro from './locales/es/macro.json'
import esTrip from './locales/es/travels.json'
import esCalendar from './locales/es/calendar.json'
import esAutomations from './locales/es/automations.json'

import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enHome from './locales/en/home.json'
import enGym from './locales/en/gym.json'
import enExpenses from './locales/en/expenses.json'
import enFlights from './locales/en/flights.json'
import enMacro from './locales/en/macro.json'
import enTrip from './locales/en/travels.json'
import enCalendar from './locales/en/calendar.json'
import enAutomations from './locales/en/automations.json'

i18n.use(initReactI18next).init({
  resources: {
    es: {
      common:   esCommon,
      auth:     esAuth,
      home:     esHome,
      gym:      esGym,
      expenses: esExpenses,
      flights:  esFlights,
      macro:    esMacro,
      travels:  esTrip,
      calendar: esCalendar,
      automations: esAutomations,
    },
    en: {
      common:   enCommon,
      auth:     enAuth,
      home:     enHome,
      gym:      enGym,
      expenses: enExpenses,
      flights:  enFlights,
      macro:    enMacro,
      travels:  enTrip,
      calendar: enCalendar,
      automations: enAutomations,
    },
  },
  lng: localStorage.getItem('language') || 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n