import { Search } from 'lucide-react'

export function SearchInput({ value, onChange, placeholder = 'Search' }) {
  return (
    <label className="search-input">
      <Search size={16} aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
      />
    </label>
  )
}
