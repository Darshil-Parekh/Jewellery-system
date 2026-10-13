import { useState } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  Gem,
  IndianRupee,
  Package,
  Plus,
  Scale,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import { DataTable } from '../../components/ui/DataTable'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorMessage } from '../../components/ui/ErrorMessage'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { MetricCard } from '../../components/ui/MetricCard'
import { useAuth } from '../../context/auth-context'
import { useApiData } from '../../hooks/useApiData'

const distributionColors = ['#a98b55', '#82918a', '#77668e', '#d2cdc2']

export function DashboardPage() {
  const { user } = useAuth()
  const [days, setDays] = useState(7)
  const summary = useApiData('/dashboard/summary')
  const sales = useApiData(`/dashboard/sales?days=${days}`)
  const distribution = useApiData('/dashboard/inventory-distribution')
  const movements = useApiData('/dashboard/recent-movements')
  const recentSales = useApiData('/dashboard/recent-sales')
  const alerts = useApiData('/dashboard/alerts')
  const metrics = summary.data

  return (
    <section className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <span className="eyebrow">YOUR BUSINESS AT A GLANCE</span>
          <h1>Good day{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.</h1>
          <p>Here is what is happening across your collection.</p>
        </div>
        <Link className="button-secondary dashboard-inventory-link" to="/inventory">
          View inventory <ArrowUpRight size={15} />
        </Link>
      </div>

      <div className="metric-grid">
        {summary.loading ? (
          <div className="metric-loading"><LoadingSpinner label="Loading live inventory metrics" /></div>
        ) : summary.error ? (
          <div className="metric-loading"><ErrorMessage message={summary.error} onRetry={summary.reload} /></div>
        ) : (
          <>
            <MetricCard label="AVAILABLE PIECES" value={formatCount(metrics.availablePieces)} detail="Individually tagged pieces" icon={Package} tone="gold" />
            <MetricCard label="GOLD ON HAND" value={`${formatWeight(metrics.goldNetWeightGrams)} g`} detail="Net gold weight · available" icon={Scale} tone="green" />
            <MetricCard label="SILVER ON HAND" value={`${formatWeight(metrics.silverNetWeightGrams)} g`} detail="Net silver weight · available" icon={Coins} tone="blue" />
            <MetricCard label="INVENTORY COST VALUE" value={formatCurrency(metrics.inventoryCostValueInr)} detail="Recorded purchase cost · INR" icon={IndianRupee} tone="gold" />
            <MetricCard label="TODAY'S SALES" value={formatCurrency(metrics.todaysSalesInr)} detail="Recorded today · INR" icon={Gem} tone="green" />
            <MetricCard label="NEEDS ATTENTION" value={formatCount(metrics.inspectionItems)} detail="Pieces marked for inspection" icon={AlertTriangle} tone="rose" />
          </>
        )}
      </div>

      <div className="dashboard-chart-grid">
        <section className="content-card chart-card">
          <div className="card-heading">
            <div>
              <span className="card-overline">SALES ACTIVITY</span>
              <h2>Sales over time</h2>
            </div>
            <label className="period-select">
              <span className="sr-only">Sales chart date range</span>
              <select value={days} onChange={(event) => setDays(Number(event.target.value))}>
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
              </select>
            </label>
          </div>
          <div className="chart-body">
            {sales.loading ? <LoadingSpinner label="Loading sales" />
              : sales.error ? <ErrorMessage message={sales.error} onRetry={sales.reload} />
                : !sales.data?.hasSales ? <EmptyState title="No sales recorded yet" description="Sales will appear here as soon as they are recorded." />
                  : <SalesChart data={sales.data.series} />}
          </div>
        </section>

        <section className="content-card distribution-card">
          <div className="card-heading">
            <div>
              <span className="card-overline">AVAILABLE STOCK</span>
              <h2>Collection mix</h2>
            </div>
            <span className="chart-caption">Unique pieces</span>
          </div>
          <div className="distribution-body">
            {distribution.loading ? <LoadingSpinner label="Loading collection mix" />
              : distribution.error ? <ErrorMessage message={distribution.error} onRetry={distribution.reload} />
                : distribution.data?.every((row) => row.pieces === 0)
                  ? <EmptyState title="No available pieces yet" description="Your collection mix will take shape as you add stock." />
                  : <DistributionChart data={distribution.data} />}
          </div>
        </section>
      </div>

      <div className="dashboard-table-grid">
        <section className="content-card data-card">
          <div className="card-heading">
            <div>
              <span className="card-overline">LATEST ACTIVITY</span>
              <h2>Recent stock movements</h2>
            </div>
            <Link to="/inventory" className="subtle-link">Inventory <ArrowUpRight size={14} /></Link>
          </div>
          <SectionContent {...movements} emptyTitle="No stock movements yet" emptyDescription="Receiving and other stock activity will appear here." />
          {!movements.loading && !movements.error && movements.data?.length > 0 && (
            <DataTable
              columns={[
                { key: 'tagCode', label: 'TAG' },
                { key: 'itemName', label: 'PIECE' },
                { key: 'type', label: 'MOVEMENT', render: (row) => <span className="movement-label">{formatMovement(row.type)}</span> },
                { key: 'weightGrams', label: 'WEIGHT', render: (row) => row.weightGrams ? `${formatWeight(row.weightGrams)} g` : '—' },
                { key: 'reference', label: 'REFERENCE', render: (row) => row.reference || '—' },
                { key: 'staffName', label: 'STAFF' },
                { key: 'createdAt', label: 'WHEN', render: (row) => formatDate(row.createdAt, true) },
              ]}
              rows={movements.data}
            />
          )}
        </section>

        <section className="content-card data-card">
          <div className="card-heading">
            <div>
              <span className="card-overline">RECENT TRANSACTIONS</span>
              <h2>Recent sales</h2>
            </div>
            <Link to="/sales" className="subtle-link">All sales <ArrowUpRight size={14} /></Link>
          </div>
          <SectionContent {...recentSales} emptyTitle="No sales recorded yet" emptyDescription="Once a sale is recorded, its invoice and payment status will appear here." />
          {!recentSales.loading && !recentSales.error && recentSales.data?.length > 0 && (
            <DataTable
              columns={[
                { key: 'invoiceNo', label: 'INVOICE', render: (row) => <Link className="table-link" to={`/sales/${row.id}`}>{row.invoiceNo}</Link> },
                { key: 'customerName', label: 'CUSTOMER' },
                { key: 'totalAmountInr', label: 'AMOUNT', render: (row) => formatCurrency(row.totalAmountInr) },
                { key: 'status', label: 'PAYMENT', render: (row) => <span className={`status-pill status-${row.status.toLowerCase()}`}>{formatStatus(row.status)}</span> },
                { key: 'soldAt', label: 'DATE', render: (row) => formatDate(row.soldAt) },
              ]}
              rows={recentSales.data}
            />
          )}
        </section>
      </div>

      <section className="content-card alert-card">
        <div className="card-heading">
          <div>
            <span className="card-overline">A LITTLE ATTENTION</span>
            <h2>Things to look at</h2>
          </div>
          <span className="alert-count">{alerts.loading ? '—' : alerts.data?.total ?? 0}</span>
        </div>
        {alerts.loading ? <LoadingSpinner label="Checking for alerts" />
          : alerts.error ? <ErrorMessage message={alerts.error} onRetry={alerts.reload} />
            : alerts.data.items.length === 0
              ? <EmptyState title="All clear for now" description="Inspection flags and other recorded attention items will show up here." />
              : <div className="alert-list">{alerts.data.items.map((alert) => (
                <div className="alert-row" key={alert.id}>
                  <span className="alert-icon"><AlertTriangle size={17} /></span>
                  <div><strong>{alert.itemName} <span className="alert-tag">· {alert.tagCode}</span></strong><p>{alert.message}</p></div>
                  <time>{formatDate(alert.updatedAt)}</time>
                </div>
              ))}</div>}
      </section>

      <Link to="/inventory" className="dashboard-quick-link">
        <span><Plus size={17} /></span>
        <div><strong>Keep your collection up to date</strong><small>Review individually tagged pieces and their recorded status.</small></div>
        <ArrowDownRight size={16} />
      </Link>
    </section>
  )
}

function SalesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#efede7" strokeDasharray="3 5" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8e8c82', fontSize: 11 }} tickFormatter={formatShortDate} dy={8} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8e8c82', fontSize: 11 }} tickFormatter={formatCompactCurrency} />
        <Tooltip cursor={{ fill: '#f8f6f1' }} formatter={(value) => [formatCurrency(value), 'Sales']} labelFormatter={(date) => formatDate(`${date}T12:00:00Z`)} contentStyle={{ border: '1px solid #eeece6', borderRadius: 10, boxShadow: '0 8px 24px rgba(39,37,28,.08)' }} />
        <Bar dataKey="salesInr" fill="#a98b55" radius={[4, 4, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function DistributionChart({ data }) {
  return (
    <div className="distribution-layout">
      <div className="distribution-donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="pieces" nameKey="name" innerRadius="68%" outerRadius="92%" paddingAngle={3} stroke="none">
              {data.map((entry, index) => <Cell key={entry.name} fill={distributionColors[index]} />)}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} ${value === 1 ? 'piece' : 'pieces'}`, name]} contentStyle={{ border: '1px solid #eeece6', borderRadius: 10 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-total"><strong>{formatCount(data.reduce((sum, row) => sum + row.pieces, 0))}</strong><span>pieces</span></div>
      </div>
      <ul className="distribution-legend">
        {data.map((row, index) => (
          <li key={row.name}>
            <span className="legend-label"><span style={{ backgroundColor: distributionColors[index] }} />{row.name}</span>
            <strong>{formatCount(row.pieces)}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionContent({ loading, error, data, emptyTitle, emptyDescription, reload }) {
  if (loading) return <LoadingSpinner label="Loading recent activity" />
  if (error) return <ErrorMessage message={error} onRetry={reload} />
  if (!data?.length) return <EmptyState title={emptyTitle} description={emptyDescription} />
  return null
}

function formatCount(value) {
  return Number(value ?? 0).toLocaleString('en-IN')
}

function formatWeight(value) {
  return Number(value ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 3 })
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function formatDate(value, includeTime = false) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(new Date(value))
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${value}T12:00:00Z`))
}

function formatMovement(value) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())
}

function formatStatus(value) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase())
}
