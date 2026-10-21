import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'


import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { getToken } from '../../Utils/helpers';
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, } from '@mui/x-data-grid'
import { useDispatch, useSelector } from 'react-redux'
import {
    getAdminProducts,
    deleteProduct,
    deleteProducts,
    clearErrors,
} from '../../actions/productActions'
import { DELETE_PRODUCT_RESET } from '../../constants/productConstants'
import { peso } from '../../Utils/money'
import { productCode } from '../../Utils/codes'
import TableFace from './TableFace'

const ProductsList = () => {
    const dispatch = useDispatch();
    const { loading, error, products } = useSelector(state => state.products)
    const { error: deleteError, isDeleted } = useSelector(state => state.product)
    const [selection, setSelection] = useState({ type: 'include', ids: new Set() })

    // const [products, setProducts] = useState([])
    // const [error, setError] = useState('')
    // const [deleteError, setDeleteError] = useState('')

    // const [loading, setLoading] = useState(true)
    // const [isDeleted, setIsDeleted] = useState(false)

    let navigate = useNavigate()
    // const getAdminProducts = async () => {
    //     try {

    //         const config = {
    //             headers: {

    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }

    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/products`, config)
    //         console.log(data)
    //         setProducts(data.products)
    //         setLoading(false)
    //     } catch (error) {

    //         setError(error.response.data.message)

    //     }
    // }
    useEffect(() => {
        dispatch(getAdminProducts())

        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            dispatch(clearErrors())
        }

        if (deleteError) {
            toast.error(deleteError, {
                position: 'bottom-right'
            });
            dispatch(clearErrors())
        }

        if (isDeleted) {
            toast.success('Product deleted successfully', {
                position: 'bottom-right'
            })
            setSelection({ type: 'include', ids: new Set() })
            dispatch({ type: DELETE_PRODUCT_RESET })

        }

    }, [error, deleteError, isDeleted,])

    // const deleteProduct = async (id) => {
    //     try {
    //         const config = {
    //             headers: {

    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.delete(`${import.meta.env.VITE_API}/admin/product/${id}`, config)

    //         setIsDeleted(data.success)
    //         setLoading(false)
    //     } catch (error) {
    //         setDeleteError(error.response.data.message)

    //     }
    // }
    const deleteProductHandler = (id) => {
        dispatch(deleteProduct(id))
    }

    const selectedIds = selection?.type === 'exclude'
        ? (products || []).map(product => product._id).filter(id => !selection.ids.has(id))
        : [...(selection?.ids || [])]

    const deleteSelected = () => {
        if (!selectedIds.length) return
        dispatch(deleteProducts(selectedIds))
    }

    const columns = [
        {
            field: 'product',
            headerName: 'Product',
            flex: 1.6,
            minWidth: 280,
            sortable: false,
            renderCell: (params) => <TableFace image={params.row.image} title={params.row.code} note={params.row.name} />
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'stock',
            headerName: 'Left',
            width: 110,
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
                    <Link to={`/admin/product/${params.id}`} className="btn btn-primary py-1 px-2">
                        <i className="fa fa-pencil"></i>
                    </Link>
                    <button className="btn btn-danger py-1 px-2 ml-2" onClick={() => deleteProductHandler(params.id)}>
                        <i className="fa fa-trash"></i>
                    </button>
                </>
            )
        }
    ];

    const rows = products.map(product => ({
        id: product._id,
        code: productCode(product),
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: peso(product.price),
        stock: `${product.stock} left`,
    }));

    return (
        <>
            <MetaData title={'All Products'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <>
                        <div className="page-head">
                            <h1 className="page-title">All Products</h1>
                            <div className="page-actions">
                                <button type="button" className="bulk-delete" disabled={!selectedIds.length} onClick={deleteSelected}>Delete selected</button>
                                <Link to="/admin/product" className="add-product">Add product</Link>
                            </div>
                        </div>

                        {loading ? <Loader /> : (
                            <div style={{ width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}

                                    rowHeight={72}
                                    pageSize={10}
                                    rowsPerPageOptions={[5, 10, 25]}
                                    checkboxSelection
                                    disableRowSelectionOnClick
                                    rowSelectionModel={selection}
                                    onRowSelectionModelChange={(model) => setSelection(model)}
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

export default ProductsList