import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import RowAction from './RowAction'
import { toast } from 'react-toastify'
import axios from 'axios'
import ScrollTable from './ScrollTable'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import TableFace from './TableFace'
import TableBar from './TableBar'
import { askConfirm } from '../../Utils/confirm'
import { useDispatch, useSelector } from 'react-redux'
import { getAdminOffers, reviewOffer, clearErrors } from '../../actions/productActions'
import { REVIEW_OFFER_RESET } from '../../constants/productConstants'
import { peso } from '../../Utils/money'

const OfferQueue = () => {
    const dispatch = useDispatch()
    const { loading, offers, error } = useSelector(state => state.adminOffers)
    const { success: offerDone, error: offerError, loading: reviewing } = useSelector(state => state.offerReview)
    const [selection, setSelection] = useState({ type: 'include', ids: new Set() })
    const [query, setQuery] = useState('')
    const [showDeleted, setShowDeleted] = useState(false)

    useEffect(() => {
        dispatch(getAdminOffers(showDeleted))
    }, [dispatch, showDeleted])

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
    }, [error, dispatch])

    useEffect(() => {
        if (offerError) {
            toast.error(offerError, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
        if (offerDone) {
            toast.success('Offer updated', { position: 'bottom-right' })
            dispatch({ type: REVIEW_OFFER_RESET })
            dispatch(getAdminOffers(showDeleted))
        }
    }, [offerDone, offerError, dispatch, showDeleted])

    const selectedIds = selection?.type === 'exclude'
        ? (offers || []).map(offer => offer._id).filter(id => !selection.ids.has(id))
        : [...(selection?.ids || [])]

    const deleteSelected = async () => {
        if (!selectedIds.length) return
        const ok = await askConfirm('Delete selected offers?', 'They will be hidden from the shop and from this list.')
        if (!ok) return
        try {
            await axios.delete(`${import.meta.env.VITE_API}/admin/products`, {
                data: { ids: selectedIds },
                withCredentials: true
            })
            setSelection({ type: 'include', ids: new Set() })
            toast.success('Offers removed', { position: 'bottom-right' })
            dispatch(getAdminOffers(showDeleted))
        } catch (deleteError) {
            toast.error(deleteError.response?.data?.message || 'Could not delete those offers', { position: 'bottom-right' })
        }
    }

    const restoreIds = async (ids) => {
        if (!ids.length) return
        const ok = await askConfirm(ids.length > 1 ? 'Restore selected offers?' : 'Restore this offer?', 'They will show in the shop again if they were approved.')
        if (!ok) return
        try {
            await axios.put(`${import.meta.env.VITE_API}/admin/products/restore`, { ids }, { withCredentials: true })
            setSelection({ type: 'include', ids: new Set() })
            toast.success(ids.length > 1 ? 'Offers restored' : 'Offer restored', { position: 'bottom-right' })
            dispatch(getAdminOffers(showDeleted))
        } catch (restoreError) {
            toast.error(restoreError.response?.data?.message || 'Could not restore those offers', { position: 'bottom-right' })
        }
    }

    const decide = async (id, status) => {
        const ok = await askConfirm(
            status === 'approved' ? 'Approve this offer?' : 'Reject this offer?',
            status === 'approved' ? 'It will show in Second Hand.' : 'It will stay hidden from the shop.'
        )
        if (!ok) return
        dispatch(reviewOffer(id, status))
    }

    const needle = query.trim().toLowerCase()
    const rows = (offers || []).map(offer => {
        const person = offer.offeredBy && typeof offer.offeredBy === 'object' ? offer.offeredBy : null
        return {
            id: offer._id,
            name: offer.name,
            image: offer.images?.[0]?.url || '',
            note: `${offer.condition || 'Used'} · ${offer.sizes?.[0]?.label || 'One size'}`,
            kind: offer.listingType === 'trade' ? 'For trade' : 'For sale',
            detail: offer.listingType === 'trade' ? (offer.offerNote || 'For trade') : peso(offer.price),
            from: person?.name || offer.seller
        }
    }).filter(row => !needle || [row.name, row.kind, row.detail, row.from].join(' ').toLowerCase().includes(needle))

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
        { field: 'from', headerName: 'From', flex: 1, minWidth: 140, sortable: false },
        {
            field: 'actions',
            headerName: '',
            width: showDeleted ? 70 : 210,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                showDeleted ? (
                    <RowAction showDeleted to={`/product/${params.row.id}`} onRestore={() => restoreIds([params.row.id])} />
                ) : (
                    <div className="queue-actions">
                        <button type="button" className="offer-approve" disabled={reviewing} onClick={() => decide(params.row.id, 'approved')}>Approve</button>
                        <button type="button" className="offer-reject" disabled={reviewing} onClick={() => decide(params.row.id, 'rejected')}>Reject</button>
                        <Link to={`/product/${params.row.id}`} className="table-view" aria-label="View">
                            <i className="fa fa-eye"></i>
                        </Link>
                    </div>
                )
            )
        }
    ]

    return (
        <>
            <MetaData title={'Offers'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <div className="page-head">
                        <h1 className="page-title">Offers waiting</h1>
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
                </div>
            </div>
        </>
    )
}

export default OfferQueue
