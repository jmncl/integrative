import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'


import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { getToken } from '../../Utils/helpers';
import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollTable from './ScrollTable'
import { useDispatch, useSelector } from 'react-redux'
import {
    getAdminProducts,
    deleteProducts,
    clearErrors,
} from '../../actions/productActions'
import { DELETE_PRODUCT_RESET } from '../../constants/productConstants'
import { peso } from '../../Utils/money'
import { productCode } from '../../Utils/codes'
import TableFace from './TableFace'
import TableBar from './TableBar'
import RowAction from './RowAction'
import { askConfirm } from '../../Utils/confirm'

const ProductsList = () => {
    const dispatch = useDispatch();
    const { loading, error, products } = useSelector(state => state.products)
    const { error: deleteError, isDeleted } = useSelector(state => state.product)
    const [selection, setSelection] = useState({ type: 'include', ids: new Set() })
    const [query, setQuery] = useState('')
    const [showDeleted, setShowDeleted] = useState(false)

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
        dispatch(getAdminProducts(showDeleted))

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

    }, [error, deleteError, isDeleted, showDeleted])

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
    const selectedIds = selection?.type === 'exclude'
        ? (products || []).map(product => product._id).filter(id => !selection.ids.has(id))
        : [...(selection?.ids || [])]

    const deleteSelected = async () => {
        if (!selectedIds.length) return
        const ok = await askConfirm('Delete selected products?', 'They will be hidden from new sales. Older orders stay as they are.')
        if (!ok) return
        dispatch(deleteProducts(selectedIds))
    }

    const restoreIds = async (ids) => {
        if (!ids.length) return
        const ok = await askConfirm(ids.length > 1 ? 'Restore selected products?' : 'Restore this product?', 'They will show in the shop again.')
        if (!ok) return
        try {
            await axios.put(`${import.meta.env.VITE_API}/admin/products/restore`, { ids }, { withCredentials: true })
            setSelection({ type: 'include', ids: new Set() })
            toast.success(ids.length > 1 ? 'Products restored' : 'Product restored', { position: 'bottom-right' })
            dispatch(getAdminProducts(showDeleted))
        } catch (restoreError) {
            toast.error(restoreError.response?.data?.message || 'Could not restore those products', { position: 'bottom-right' })
        }
    }

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 90,
            sortingOrder: ['desc', 'asc']
        },
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
            headerAlign: 'right',
            sortable: false
        },
        {
            field: 'stock',
            headerName: 'Left',
            width: 110,
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
                <RowAction showDeleted={showDeleted} to={`/product/${params.id}`} onRestore={() => restoreIds([params.id])} />
            )
        }
    ];

    const needle = query.trim().toLowerCase()
    const rows = (products || []).map(product => ({
        id: product._id,
        code: productCode(product),
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: peso(product.price),
        stock: `${product.stock} left`,
    })).filter(row => !needle || [row.code, row.name, row.price, row.stock].join(' ').toLowerCase().includes(needle))

    return (
        <>
            <MetaData title={'All Products'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <>
                        <div className="page-head">
                            <h1 className="page-title">All Products</h1>
                            <div className="head-actions">
                                <TableBar
                                    query={query}
                                    onQuery={setQuery}
                                    placeholder="Search products"
                                    showDeleted={showDeleted}
                                    onToggleDeleted={() => { setSelection({ type: 'include', ids: new Set() }); setShowDeleted(value => !value) }}
                                />
                                <Link to="/admin/product" className="add-product">Add product</Link>
                            </div>
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
                </div>
            </div>

        </>
    )
}

export default ProductsList