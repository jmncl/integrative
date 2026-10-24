import { Link } from 'react-router-dom'

const RowAction = ({ showDeleted, to, onRestore, restoreLabel = 'Restore' }) => (
    showDeleted ? (
        <button type="button" className="table-view" aria-label={restoreLabel} onClick={onRestore}>
            <i className="fa fa-undo"></i>
        </button>
    ) : (
        <Link to={to} className="table-view" aria-label="View">
            <i className="fa fa-eye"></i>
        </Link>
    )
)

export default RowAction
