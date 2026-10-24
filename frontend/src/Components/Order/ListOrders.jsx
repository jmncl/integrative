import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { getToken } from '../../Utils/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { myOrders, clearErrors } from '../../actions/orderActions'
import { peso } from '../../Utils/money'
import { orderCode } from '../../Utils/codes'
import ScrollTable from '../Admin/ScrollTable'
import TableBar from '../Admin/TableBar'

const ListOrders = () => {
    // const [loading, setLoading] = useState(true)
    // const [error, setError] = useState('')
    const dispatch = useDispatch();
    const { loading, error, orders } = useSelector(state => state.myOrders);
    const [query, setQuery] = useState('')
    // const [myOrdersList, setMyOrdersList] = useState([])

    // const myOrders = async () => {
    //     try {
    //         const config = {
    //             headers: {
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/orders/me`, config)
    //         console.log(data)
    //         setMyOrdersList(data.orders)
    //         setLoading(false)

    //     } catch (error) {
    //         setError(error.response.data.message)
    //     }
    // }
    useEffect(() => {
        dispatch(myOrders());
        if (error) {
            toast.error(error, {
                position: toast.POSITION.BOTTOM_RIGHT
            });
        }
    }, [error])

    const columns = [
        {
            field: 'code',
            headerName: 'Order',
            flex: 1,
            minWidth: 120
        },
        {
            field: 'numOfItems',
            headerName: 'Num of Items',
            type: 'number',
            width: 130,
            align: 'right',
            headerAlign: 'right'
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
            width: 160,
            renderCell: (params) =>
                (params.value && String(params.value).includes('Delivered'))
                    ? <span style={{ color: 'green' }}>{params.value}</span>
                    : <span style={{ color: 'red' }}>{params.value}</span>
        },
        {
            field: 'view',
            headerName: '',
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Link to={`/order/${params.id}`} className="table-view" aria-label="View">
                    <i className="fa fa-eye"></i>
                </Link>
            )
        }
    ];

    const needle = query.trim().toLowerCase()
    const rows = (orders || []).map(order => ({
        id: order._id,
        code: orderCode(order),
        numOfItems: order.orderItems.length,
        amount: peso(order.totalPrice),
        status: order.orderStatus || ''
    })).filter(row => !needle || [row.code, row.amount, row.status].join(' ').toLowerCase().includes(needle));



    return (
        <>
            <MetaData title={'My Orders'} />
            <div className="page-head my-5">
                <h1 className="page-title">My Orders</h1>
                <TableBar query={query} onQuery={setQuery} placeholder="Search orders" />
            </div>
            {loading ? <Loader /> : (
                <div style={{ width: '100%' }}>
                    <ScrollTable
                        rows={rows}
                        columns={columns}
                        resetKey={query}
                        rowHeight={72}
                        disableColumnMenu
                        disableRowSelectionOnClick
                        getRowId={(row) => row.id}
                    />
                </div>
            )}
        </>
    )
}

export default ListOrders