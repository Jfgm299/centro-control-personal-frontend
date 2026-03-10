import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useExpenses, aggregateExpenses } from './hooks/useExpenses'
import { useExpenseMutations } from './hooks/useExpenseMutations'
import KPICard from './components/KPICard'
import FilterBar from './components/FilterBar'
import SpendingChart from './components/SpendingChart'
import AccountBreakdown from './components/AccountBreakdown'
import RecentExpenses from './components/RecentExpenses'
import ExpenseModal from './components/ExpenseModal'
import SubscriptionsTab from './components/SubscriptionsTab'

const fmt = (v) => `€${Number(v).toFixed(2)}`
const TABS = ['expenses', 'subscriptions']

export default function ExpensesPageDesktop() {
  const { t } = useTranslation('expenses')
  const { expenses, isLoading, error } = useExpenses()
  const { create, update, remove } = useExpenseMutations()

  const [tab, setTab] = useState('expenses')
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [drilldownWeek, setDrilldownWeek] = useState(null)
  const [modalExpense, setModalExpense] = useState(undefined) // undefined=closed, null=create

  const analytics = useMemo(() => aggregateExpenses(expenses), [expenses])

  const selectedMonthData = useMemo(
    () => analytics?.monthlyData.find((m) => m.monthKey === selectedMonth) ?? null,
    [analytics, selectedMonth]
  )

  const kpiSource = selectedMonthData ?? {
    total: analytics?.monthlyData.reduce((s, m) => s + m.total, 0) ?? 0,
    avgPerDay: analytics?.monthlyData.reduce((s, m) => s + m.avgPerDay, 0) / (analytics?.monthlyData.length || 1),
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="-mx-8 -mt-8 px-8 pt-8 pb-4 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
        <p className="text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Acciones principales (Tabs + Añadir) */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {TABS.map(tabKey => (
            <button key={tabKey} onClick={() => setTab(tabKey)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors
                ${tab === tabKey ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>
              {tabKey === 'expenses' ? '💸 ' + t('tabs.expenses') : '🔄 ' + t('tabs.subscriptions')}
            </button>
          ))}
        </div>
        
        {tab === 'expenses' && (
          <button 
            onClick={() => setModalExpense(null)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t('list.create')}
          </button>
        )}
      </div>

      {/* Tab: Gastos */}
      {tab === 'expenses' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label={t('kpi.totalSpend')} value={fmt(kpiSource.total)}
              sub={selectedMonth ? selectedMonthData?.label : t('kpi.allTime')} accent />
            <KPICard label={t('kpi.avgPerDay')} value={fmt(kpiSource.avgPerDay ?? 0)}
              sub={t('kpi.avgPerDaySub')} />
            <KPICard label={t('kpi.transactions')} value={kpiSource.count}
              sub={t('kpi.transactionsSub')} />
            <KPICard label={t('kpi.topAccount')}
              value={Object.entries(kpiSource.byAccount ?? {}).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '—'}
              sub={t('kpi.topAccountSub')} />
          </div>

          {analytics && (
            <FilterBar months={analytics.monthlyData} selectedMonth={selectedMonth}
              drilldownWeek={drilldownWeek} onSelectMonth={handleSelectMonth}
              onClearDrilldown={() => setDrilldownWeek(null)} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {analytics && (
                <SpendingChart monthlyData={analytics.monthlyData}
                  selectedMonthData={drilldownWeek ? null : selectedMonthData}
                  drilldownWeek={drilldownWeek}
                  onDrilldown={(key) => setSelectedMonth(key)}
                  accounts={analytics.accounts} />
              )}
            </div>
            <div>
              {analytics && (
                <AccountBreakdown byAccount={kpiSource.byAccount}
                  title={selectedMonth ? t('chart.accountBreakdownMonth') : t('chart.accountBreakdown')} />
              )}
            </div>
          </div>

          <RecentExpenses expenses={filteredExpenses}
            onCreate={create.mutateAsync}
            onUpdate={update.mutateAsync}
            onRemove={remove.mutateAsync} />
        </>
      )}

      {/* Tab: Suscripciones */}
      {tab === 'subscriptions' && <SubscriptionsTab />}

      {/* Modal create / edit */}
      {modalExpense !== undefined && (
        <ExpenseModal
          expense={modalExpense}
          onClose={() => setModalExpense(undefined)}
          onCreate={create.mutateAsync}
          onUpdate={update.mutateAsync}
        />
      )}
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
    <div className="rounded-2xl bg-red-50 border border-red-100 p-6 text-red-700">
      <p className="font-semibold">{t('error.title')}</p>
      <p className="text-sm mt-1 text-red-500">{message}</p>

    </div>
  )
}