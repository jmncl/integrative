import { useEffect, useState } from 'react'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import axios from 'axios'
import { toast } from 'react-toastify'
import ScrollTable from './ScrollTable'
import TableFace from './TableFace'
import TableBar from './TableBar'
import RowAction from './RowAction'
import { askConfirm } from '../../Utils/confirm'

const ProductReviews = () => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [selection, setSelection] = useState({ type: 'include', ids: new Set() })
    const [showDeleted, setShowDeleted] = useState(false)

    const loadReviews = async (deleted = showDeleted) => {
        setLoading(true)
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/reviews${deleted ? '?deleted=1' : ''}`, { withCredentials: true })
            setReviews(data.reviews || [])
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not load reviews', { position: 'bottom-right' })
        }
        setLoading(false)
    }

    useEffect(() => {
        loadReviews(showDeleted)
    }, [showDeleted])

    const needle = query.trim().toLowerCase()
    const shown = needle
        ? reviews.filter(review => [review.productCode, review.productName, review.name, review.comment]
            .join(' ')
            .toLowerCase()
            .includes(needle))
        : reviews

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 90
        },
        {
            field: 'productName',
            sortable: false,
            headerName: 'Product',
            flex: 1.3,
            minWidth: 260,
            renderCell: (params) => <TableFace image={params.row.productImage} title={params.row.productCode} note={params.row.productName} />
        },
        {
            field: 'name',
            headerName: 'User',
            flex: 1,
            minWidth: 180,
            sortable: false,
            renderCell: (params) => <TableFace image={params.row.avatar} title={params.row.name} />
        },
        { field: 'rating', headerName: 'Rating', width: 110, sortable: false },
        { field: 'comment', headerName: 'Comment', flex: 1.4, minWidth: 220, sortable: false },
        {
            field: 'view',
            headerName: '',
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <RowAction
                    showDeleted={showDeleted}
                    to={`/product/${params.row.product}?review=${params.row.id}`}
                    onRestore={() => restoreItems([{ id: params.row.id, productId: params.row.product }])}
                />
            )
        }
    ]

    const selectedIds = selection?.type === 'exclude'
        ? shown.map(review => review._id).filter(id => !selection.ids.has(id))
        : [...(selection?.ids || [])]

    const deleteSelected = async () => {
        const ok = await askConfirm('Delete selected reviews?', 'They will be hidden. The product rating uses the reviews that are still visible.')
        if (!ok) return
        const items = shown
            .filter(review => selectedIds.map(String).includes(String(review._id)))
            .map(review => ({ id: review._id, productId: review.product }))
        if (!items.length) return
        try {
            await axios.delete(`${import.meta.env.VITE_API}/admin/reviews`, {
                data: { items },
                withCredentials: true
            })
            const gone = new Set(items.map(item => String(item.id)))
            setReviews(current => current.filter(review => !gone.has(String(review._id))))
            setSelection({ type: 'include', ids: new Set() })
            toast.success('Reviews deleted', { position: 'bottom-right' })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not delete the reviews', { position: 'bottom-right' })
        }
    }

    const restoreItems = async (items) => {
        if (!items.length) return
        const ok = await askConfirm(items.length > 1 ? 'Restore selected reviews?' : 'Restore this review?', 'They will count toward the product rating again.')
        if (!ok) return
        try {
            await axios.put(`${import.meta.env.VITE_API}/admin/reviews/restore`, { items }, { withCredentials: true })
            const gone = new Set(items.map(item => String(item.id)))
            setReviews(current => current.filter(review => !gone.has(String(review._id))))
            setSelection({ type: 'include', ids: new Set() })
            toast.success(items.length > 1 ? 'Reviews restored' : 'Review restored', { position: 'bottom-right' })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not restore the reviews', { position: 'bottom-right' })
        }
    }

    const rows = shown.map(review => ({
        id: review._id,
        product: review.product,
        productCode: review.productCode,
        productName: review.productName,
        productImage: review.productImage,
        name: review.name,
        avatar: review.avatar,
        rating: review.rating,
        comment: review.comment
    }))

    return (
        <>
            <MetaData title={'Product Reviews'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <div className="page-head">
                        <h1 className="page-title">Reviews</h1>
                        <TableBar
                            query={query}
                            onQuery={setQuery}
                            placeholder="Search product or user"
                            showDeleted={showDeleted}
                            onToggleDeleted={() => { setSelection({ type: 'include', ids: new Set() }); setShowDeleted(value => !value) }}
                        />
                    </div>
                    {selectedIds.length > 0 && (
                        <div className="delete-row">
                            {showDeleted
                                ? <button type="button" className="catalog-edit" onClick={() => restoreItems(shown.filter(review => selectedIds.map(String).includes(String(review._id))).map(review => ({ id: review._id, productId: review.product })))}>Restore selected</button>
                                : <button type="button" className="bulk-delete" onClick={deleteSelected}>Delete selected</button>}
                        </div>
                    )}
                    {loading ? <Loader /> : rows.length ? (
                        <div style={{ width: '100%' }}>
                            <ScrollTable
                                rows={rows}
                                columns={columns}
                                resetKey={`${query}-${showDeleted}`}
                                rowHeight={72}
                                sortingOrder={['desc', 'asc']}
                                initialState={{
                                    sorting: { sortModel: [{ field: 'id', sort: 'desc' }] }
                                }}
                                checkboxSelection
                                disableColumnMenu
                                disableRowSelectionOnClick
                                rowSelectionModel={selection}
                                onRowSelectionModelChange={(model) => setSelection(model)}
                                getRowId={(row) => row.id}
                            />
                        </div>
                    ) : (
                        <p className="empty-note">No reviews.</p>
                    )}
                </div>
            </div>
        </>
    )
}

export default ProductReviews
