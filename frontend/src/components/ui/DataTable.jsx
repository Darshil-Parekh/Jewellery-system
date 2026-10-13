export function DataTable({ columns, rows, emptyTitle, emptyDescription }) {
  if (rows.length === 0) {
    return (
      <div className="table-empty">
        <strong>{emptyTitle}</strong>
        {emptyDescription && <span>{emptyDescription}</span>}
      </div>
    )
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
