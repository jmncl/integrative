const TableBar = ({ query, onQuery, placeholder, showDeleted, onToggleDeleted, toggleLabel = 'Deleted' }) => (
    <div className="table-bar">
        {onToggleDeleted && (
            <button
                type="button"
                className={showDeleted ? 'deleted-toggle on' : 'deleted-toggle'}
                aria-pressed={showDeleted}
                onClick={onToggleDeleted}
            >
                {toggleLabel}
            </button>
        )}
        <input
            className="form-control review-search"
            type="text"
            placeholder={placeholder || 'Search'}
            value={query}
            onChange={(event) => onQuery(event.target.value)}
        />
    </div>
)

export default TableBar
