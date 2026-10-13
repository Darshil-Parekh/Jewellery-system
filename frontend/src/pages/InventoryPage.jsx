import { useMemo, useState } from 'react'
import { CircleAlert } from 'lucide-react'
import { DataTable } from '../components/ui/DataTable'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { SearchInput } from '../components/ui/SearchInput'
import { useApiData } from '../hooks/useApiData'

const columns = [
  {
    key: 'tagCode',
    label: 'TAG / SKU',
    render: (item) => <div className="item-identity"><strong>{item.tagCode}</strong><span>{item.sku}</span></div>,
  },
  {
    key: 'productName',
    label: 'PIECE',
    render: (item) => <div className="item-identity"><strong>{item.productName}</strong><span>{item.category}</span></div>,
  },
  { key: 'metalType', label: 'METAL' },
  { key: 'purityLabel', label: 'PURITY', render: (item) => item.purityLabel || '—' },
  {
    key: 'netWeightGrams',
    label: 'NET WEIGHT',
    render: (item) => `${formatWeight(item.netWeightGrams)} g`,
  },
  {
    key: 'status',
    label: 'STATUS',
    render: (item) => <span className={`status-pill status-${item.status.toLowerCase()}`}>{formatStatus(item.status)}</span>,
  },
]

export function InventoryPage() {
  const { data, loading, error, reload } = useApiData('/inventory')
  const [search, setSearch] = useState('')
  const items = useMemo(() => {
    if (!data) return []
    const query = search.trim().toLowerCase()
    if (!query) return data
    return data.filter((item) =>
      [item.tagCode, item.sku, item.productName, item.category, item.metalType]
        .some((value) => value?.toLowerCase().includes(query)),
    )
  }, [data, search])

  return (
    <section className="inventory-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR COLLECTION</span>
          <h1>Inventory</h1>
          <p className="page-subtitle">Each tagged piece, in one considered view.</p>
        </div>
        <span className="read-only-badge"><CircleAlert size={14} /> READ ONLY</span>
      </div>

      <section className="content-card inventory-card">
        <div className="card-heading inventory-toolbar">
          <div>
            <h2>Tagged pieces</h2>
            <p>Showing the latest 100 individually tracked items.</p>
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by tag, name or metal" />
        </div>
        {loading ? (
          <LoadingSpinner label="Loading inventory" />
        ) : error ? (
          <ErrorMessage message={error} onRetry={reload} />
        ) : items.length === 0 ? (
          search ? (
            <EmptyState title="No matching pieces" description="Try another tag number, name or metal." />
          ) : (
            <EmptyState
              title="Your inventory is ready for its first piece"
              description="Items will appear here after they have been recorded through a stock-receiving workflow."
            />
          )
        ) : (
          <DataTable
            columns={columns}
            rows={items}
            emptyTitle="No matching pieces"
          />
        )}
      </section>
    </section>
  )
}

function formatWeight(value) {
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: 3 })
}

function formatStatus(value) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}
