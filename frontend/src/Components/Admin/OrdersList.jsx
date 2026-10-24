import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollTable from './ScrollTable'
import axios from 'axios'

import { useDispatch, useSelector } from 'react-redux'
import { allOrders, clearErrors, deleteOrders } from '../../actions/orderActions'
import { DELETE_ORDER_RESET } from '../../constants/orderConstants'
import { peso } from '../../Utils/money'
import { orderCode } from '../../Utils/codes'
import TableFace from './TableFace'
import TableBar from './TableBar'
import RowAction from './RowAction'
import { askConfirm } from '../../Utils/confirm'

const OrdersList = () => {
    let navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error, orders } = useSelector(state => state.allOrders);
    const { isDeleted } = useSelector(state => state.order)
    const [selection, setSelection] = useState({ type: 'include', ids: new Set() })
    const [query, setQuery] = useState('')
    const [showDeleted, setShowDeleted] = useState(false)
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')
    // const [allOrders, setAllOrders] = useState([])
    // const [isDeleted, setIsDeleted] = useState(false)
    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });

    // const listOrders = async () => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/orders`, config)
    //         setAllOrders(data.orders)
    //         setLoading(false)
    //     } catch (error) {
    //         setError(error.response.data.message)
    //     }
    // }
    // const deleteOrder = async (id) => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/order/${id}`, config)
    //         setIsDeleted(data.success)
    //         setLoading(false)
    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }
    useEffect(() => {
        dispatch(allOrders(showDeleted))
        if (error) {
            errMsg(error)
            dispatch(clearErrors())

        }
        if (isDeleted) {
            successMsg('Order deleted successfully');
            dispatch({ type: DELETE_ORDER_RESET })
            // navigate('/admin/orders');
        }
    }, [error, isDeleted, showDeleted])
    const selectedIds = selection?.type === 'exclude'
        ? (orders || []).map(order => order._id).filter(id => !selection.ids.has(id))
        : [...(selection?.ids || [])]

    const deleteSelected = async () => {
        if (!selectedIds.length) return
        const ok = await askConfirm('Delete selected orders?', 'They leave this list. The sales chart still counts them.')
        if (!ok) return
        dispatch(deleteOrders([...selectedIds]))
        setSelection({ type: 'include', ids: new Set() })
    }

    const restoreIds = async (ids) => {
        if (!ids.length) return
        const ok = await askConfirm(ids.length > 1 ? 'Restore selected orders?' : 'Restore this order?', 'They will show in the orders list again.')
        if (!ok) return
        try {
            await axios.put(`${import.meta.env.VITE_API}/admin/orders/restore`, { ids }, { withCredentials: true })
            setSelection({ type: 'include', ids: new Set() })
            successMsg(ids.length > 1 ? 'Orders restored' : 'Order restored')
            dispatch(allOrders(showDeleted))
        } catch (restoreError) {
            errMsg(restoreError.response?.data?.message || 'Could not restore those orders')
        }
    }

    const columns = [
        {
            field: 'created',
            headerName: 'Placed',
            width: 130,
            valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : ''
        },
        {
            field: 'order',
            headerName: 'Order',
            flex: 1.4,
            minWidth: 220,
            sortable: false,
            renderCell: (params) => <TableFace image={params.row.image} title={params.row.code} note={`${params.row.numofItems} items`} />
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 120,
            align: 'right',
            headerAlign: 'right',
            sortable: false
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            align: 'right',
            headerAlign: 'right',
            sortable: false
        },

        {
            field: 'view',
            headerName: '',
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <RowAction showDeleted={showDeleted} to={`/admin/order/${params.id}`} onRestore={() => restoreIds([params.id])} />
            )
        }
    ];
    const needle = query.trim().toLowerCase()
    const rows = (orders || []).map(order => ({
        id: order._id,
        code: orderCode(order),
        image: order.orderItems?.[0]?.image || '',
        numofItems: order.orderItems.length,
        amount: peso(order.totalPrice),
        status: order.orderStatus,
        created: new Date(order.createdAt || 0).getTime()
    })).filter(row => !needle || [row.code, row.status, row.amount].join(' ').toLowerCase().includes(needle))

    return (
        <>
            <MetaData title={'All Orders'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <>
                        <div className="page-head">
                            <h1 className="page-title">All Orders</h1>
                            <TableBar
                                query={query}
                                onQuery={setQuery}
                                placeholder="Search orders"
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
                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <ScrollTable
                                    rows={rows}
                                    columns={columns}
                                    resetKey={`${query}-${showDeleted}`}
                                    rowHeight={72}
                                    sortingOrder={['desc', 'asc']}
                                    initialState={{
                                        sorting: { sortModel: [{ field: 'created', sort: 'desc' }] }
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
                </div>
            </div>
        </>
    )
}

export default OrdersList