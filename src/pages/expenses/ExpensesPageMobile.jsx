import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { useExpenses, aggregateExpenses } from './hooks/useExpenses'
import { useExpenseMutations } from './hooks/useExpenseMutations'
import KPICard from './components/KPICard'
import FilterBar from './components/FilterBar'
import SpendingChart from './components/SpendingChart'
import AccountBreakdown from './components/AccountBreakdown'
import RecentExpensesMobile from './components/RecentExpensesMobile'
import SubscriptionsTabMobile from './components/SubscriptionsTabMobile'
import { useAuth } from '../../context/AuthContext'

const fmt = (v) => `€${Number(v).toFixed(2)}`
const TABS = ['expenses', 'subscriptions']

export default function ExpensesPageMobile() {
  const { t } = useTranslation('expenses')
  const { user } = useAuth()
  const { expenses, isLoading, error } = useExpenses()
  const { create, update, remove } = useExpenseMutations()

  const [tab, setTab] = useState('expenses')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [drilldownWeek, setDrilldownWeek] = useState(null)

  const analytics = useMemo(() => aggregateExpenses(expenses), [expenses])

  const selectedMonthData = useMemo(
    () => analytics?.monthlyData.find((m) => m.monthKey === selectedMonth) ?? null,
    [analytics, selectedMonth]
  )

  const kpiSource = selectedMonthData ?? {
    total: analytics?.monthlyData.reduce((s, m) => s + m.total, 0) ?? 0,
    avgPerDay: analytics?.monthlyData.reduce((s, m) => s + m.avgPerDay, 0) /
      (analytics?.monthlyData.length || 1),
    count: expenses.length,
    byAccount: analytics?.accounts.reduce((acc, a) => {
      acc[a] = analytics.monthlyData.reduce((s, m) => s + (m.byAccount[a] ?? 0), 0)
      return acc
    }, {}) ?? {},
  }

  const filteredExpenses = useMemo(() => {
    if (!selectedMonth) return expenses
    return expenses.filter((e) => e.created_at.startsWith(selectedMonth))
  }, [expenses, selectedMonth])

  const handleSelectMonth = (key) => {
    setSelectedMonth((prev) => (prev === key ? null : key))
    setDrilldownWeek(null)
  }

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message={error} t={t} />

  return (
    <div className="min-h-full text-white">
      <div className="p-4 md:p-6 pb-20 max-w-3xl mx-auto space-y-4">

        <header className="pt-4">
          <h1 className="text-3xl font-bold text-white">
            {t('title')}
          </h1>
          <p className="text-white/60 text-sm mt-0.5">
            {t('subtitle')} {user?.name}
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-full bg-black/20 backdrop-blur-sm">
          {TABS.map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setTab(tabKey)}
              className="relative flex-1 py-2 rounded-full text-sm font-semibold transition-colors text-white/80 hover:text-white"
            >
              {tab === tabKey && (
                <motion.div
                  layoutId="active-tab-indicator-expenses-mobile"
                  className="absolute inset-0 bg-white/10 rounded-full shadow-md"
                />
              )}
              <span className="relative z-10">{t(`tabs.${tabKey}`)}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            {/* Tab: Gastos */}
            {tab === 'expenses' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <KPICard compact label={t('kpi.totalSpend')} value={fmt(kpiSource.total)}
                    sub={selectedMonth ? selectedMonthData?.label : t('kpi.allTime')} />
                  <KPICard compact label={t('kpi.avgPerDay')} value={fmt(kpiSource.avgPerDay ?? 0)}
                    sub={t('kpi.avgPerDaySub')} />
                  <KPICard compact label={t('kpi.transactions')} value={kpiSource.count}
                    sub={t('kpi.transactionsSub')} />
                  <KPICard compact label={t('kpi.topAccount')}
                    value={Object.entries(kpiSource.byAccount ?? {}).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—'}
                    sub={t('kpi.topAccountSub')} />
                </div>

                <RecentExpensesMobile expenses={filteredExpenses}
                  onCreate={create.mutateAsync}
                  onUpdate={update.mutateAsync}
                  onRemove={remove.mutateAsync} />

                {analytics && (
                  <FilterBar months={analytics.monthlyData} selectedMonth={selectedMonth}
                    drilldownWeek={drilldownWeek} onSelectMonth={handleSelectMonth}
                    onClearDrilldown={() => setDrilldownWeek(null)} />
                )}

                {analytics && (
                  <div style={{ height: 280 }}>
                    <SpendingChart monthlyData={analytics.monthlyData}
                      selectedMonthData={drilldownWeek ? null : selectedMonthData}
                      drilldownWeek={drilldownWeek}
                      onDrilldown={(key) => setSelectedMonth(key)}
                      accounts={analytics.accounts} />
                  </div>
                )}

                {analytics && (
                  <AccountBreakdown byAccount={kpiSource.byAccount}
                    title={selectedMonth ? t('chart.accountBreakdownMonth') : t('chart.accountBreakdown')} />
                )}
              </div>
            )}

            {/* Tab: Suscripciones */}
            {tab === 'subscriptions' && <SubscriptionsTabMobile />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        <span className="text-sm">Loading expenses…</span>
      </div>
    </div>
  )
}

function ErrorState({ message, t }) {
  return (
    <div className="rounded-2xl bg-red-50/10 border border-red-500/20 p-4 text-red-400">
      <p className="font-semibold">{t('error.title')}</p>
      <p className="text-sm mt-1 text-red-400/80">{message}</p>
    </div>
  )
}
