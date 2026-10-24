import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import ScrollTable from '../Admin/ScrollTable'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import TableFace from '../Admin/TableFace'
import TableBar from '../Admin/TableBar'
import RowAction from '../Admin/RowAction'
import { askConfirm } from '../../Utils/confirm'
import { useDispatch, useSelector } from 'react-redux'
import { getMyOffers, clearErrors } from '../../actions/productActions'
import { peso } from '../../Utils/money'

const statusLabel = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected'
}

const MyOffers = () => {
    const dispatch = useDispatch()
    const { loading, offers, error } = useSelector(state => state.myOffers)
    const [selection, setSelection] = useState({ type: 'include', ids: new Set() })
    const [query, setQuery] = useState('')
    const [showDeleted, setShowDeleted] = useState(false)

    useEffect(() => {
        dispatch(getMyOffers(showDeleted))
    }, [dispatch, showDeleted])

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
    }, [error, dispatch])

    const selectedIds = selection?.type === 'exclude'
        ? (offers || []).map(offer => offer._id).filter(id => !selection.ids.has(id))
        : [...(selection?.ids || [])]

    const deleteSelected = async () => {
        if (!selectedIds.length) return
        const ok = await askConfirm('Delete selected offers?', 'They will be hidden from the shop.')
        if (!ok) return
        try {
            await axios.delete(`${import.meta.env.VITE_API}/offers/me`, {
                data: { ids: selectedIds },
                withCredentials: true
            })
            setSelection({ type: 'include', ids: new Set() })
            toast.success('Offers removed', { position: 'bottom-right' })
            dispatch(getMyOffers(showDeleted))
        } catch (deleteError) {
            toast.error(deleteError.response?.data?.message || 'Could not delete those offers', { position: 'bottom-right' })
        }
    }

    const restoreIds = async (ids) => {
        if (!ids.length) return
        const ok = await askConfirm(ids.length > 1 ? 'Restore selected offers?' : 'Restore this offer?', 'They will show in your offers again.')
        if (!ok) return
        try {
            await axios.put(`${import.meta.env.VITE_API}/offers/me/restore`, { ids }, { withCredentials: true })
            setSelection({ type: 'include', ids: new Set() })
            toast.success(ids.length > 1 ? 'Offers restored' : 'Offer restored', { position: 'bottom-right' })
            dispatch(getMyOffers(showDeleted))
        } catch (restoreError) {
            toast.error(restoreError.response?.data?.message || 'Could not restore those offers', { position: 'bottom-right' })
        }
    }

    const needle = query.trim().toLowerCase()
    const rows = (offers || []).map(offer => ({
        id: offer._id,
        name: offer.name,
        image: offer.images?.[0]?.url || '',
        note: `${offer.condition || 'Used'} · ${offer.sizes?.[0]?.label || 'One size'}`,
        kind: offer.listingType === 'trade' ? 'For trade' : 'For sale',
        detail: offer.listingType === 'trade' ? (offer.offerNote || 'For trade') : peso(offer.price),
        status: statusLabel[offer.status] || offer.status || 'Pending',
        approved: offer.status === 'approved'
    })).filter(row => !needle || [row.name, row.kind, row.detail, row.status].join(' ').toLowerCase().includes(needle))

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 90,
            sortingOrder: ['desc', 'asc']
        },
        {
            field: 'name',
            headerName: 'Product',
            flex: 1.4,
            minWidth: 240,
            sortable: false,
            renderCell: (params) => <TableFace image={params.row.image} title={params.row.name} note={params.row.note} />
        },
        {
            field: 'kind',
            headerName: 'Offer',
            flex: 1,
            minWidth: 160,
            sortable: false,
            renderCell: (params) => (
                <div>
                    <strong>{params.row.kind}</strong>
                    <p className="photo-note">{params.row.detail}</p>
                </div>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 160,
            sortable: false,
            renderCell: (params) => <span>{params.row.status}</span>
        },
        {
            field: 'view',
            headerName: '',
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <RowAction showDeleted={showDeleted} to={`/product/${params.row.id}`} onRestore={() => restoreIds([params.row.id])} />
            )
        }
    ]

    return (
        <>
            <MetaData title={'My offers'} />
            <div className="page-head mt-4">
                <div className="table-side">
                    <p className="eyebrow">Customer</p>
                    <h1 className="page-title">My offers</h1>
                    <Link to="/offer" className="add-product">Offer another pair</Link>
                </div>
                <TableBar
                    query={query}
                    onQuery={setQuery}
                    placeholder="Search offers"
                    showDeleted={showDeleted}
                    onToggleDeleted={() => { setSelection({ type: 'include', ids: new Set() }); setShowDeleted(value => !value) }}
                />
            </div>
            {selectedIds.length > 0 && (
                <div className="delete-row">
                    {showDeleted
                        ? <button type="button" className="catalog-edit" onClick={() => restoreIds(selectedIds)}>Restore selected</button>
                        : <button type="button" className="bulk-delete" onClick={deleteSelected}>Delete selected</button>}
                </div>
            )}
            {loading && !offers.length ? <Loader /> : (
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
            )}
        </>
    )
}

export default MyOffers
