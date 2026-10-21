import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'
// import { getToken } from '../../Utils/helpers'
// import axios from 'axios'

import { useDispatch, useSelector } from 'react-redux'
import { allOrders, clearErrors, deleteOrder } from '../../actions/orderActions'
import { DELETE_ORDER_RESET } from '../../constants/orderConstants'
import { peso } from '../../Utils/money'
import { orderCode } from '../../Utils/codes'
import TableFace from './TableFace'

const OrdersList = () => {
    let navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error, orders } = useSelector(state => state.allOrders);
    const { isDeleted } = useSelector(state => state.order)
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
        dispatch(allOrders())
        if (error) {
            errMsg(error)
            dispatch(clearErrors())

        }
        if (isDeleted) {
            successMsg('Order deleted successfully');
            dispatch({ type: DELETE_ORDER_RESET })
            // navigate('/admin/orders');
        }
    }, [error, isDeleted])
    const deleteOrderHandler = (id) => {
        dispatch(deleteOrder(id))
    }

    const columns = [
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
            headerAlign: 'right'
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },

        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (

                <>
                    <Link to={`/admin/order/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-eye"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteOrderHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];
    const rows = orders.map(order => ({
        id: order._id,
        code: orderCode(order),
        image: order.orderItems?.[0]?.image || '',
        numofItems: order.orderItems.length,
        amount: peso(order.totalPrice),
        status: order.orderStatus,
    }));

    return (
        <>
            <MetaData title={'All Orders'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <>
                        <h1 className="page-title">All Orders</h1>
                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}

                                    rowHeight={72}
                                    pageSize={10}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    disableSelectionOnClick
                                    getRowId={(row) => row.id}
                                    showToolbar
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