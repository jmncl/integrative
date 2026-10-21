import { useEffect, useState } from 'react'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import Swal from 'sweetalert2'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DataGrid } from '@mui/x-data-grid'
import TableFace from './TableFace'

const ProductReviews = () => {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')

    const loadReviews = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API}/admin/reviews`, { withCredentials: true })
            setReviews(data.reviews || [])
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not load reviews', { position: 'bottom-right' })
        }
        setLoading(false)
    }

    useEffect(() => {
        loadReviews()
    }, [])

    const deleteReview = async (id, productId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API}/reviews?id=${id}&productId=${productId}`, { withCredentials: true })
            setReviews(current => current.filter(review => String(review._id) !== String(id)))
            toast.success('Review deleted', { position: 'bottom-right' })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not delete the review', { position: 'bottom-right' })
        }
    }

    const deleteReviewHandler = (id, productId) => {
        Swal.fire({
            title: 'Delete Review',
            icon: 'info',
            text: 'Do you want to delete this review',
            confirmButtonText: 'Delete',
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) deleteReview(id, productId)
        })
    }

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
            field: 'actions',
            headerName: 'Actions',
            width: 110,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <button className="btn btn-danger py-1 px-2" type="button" onClick={() => deleteReviewHandler(params.row.id, params.row.product)}>
                    <i className="fa fa-trash"></i>
                </button>
            )
        }
    ]

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
                        <input
                            className="form-control review-search"
                            type="text"
                            placeholder="Search product or user"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                    {loading ? <Loader /> : rows.length ? (
                        <div style={{ width: '100%' }}>
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                autoHeight
                                rowHeight={72}
                                pageSizeOptions={[10, 25, 50]}
                                sortingOrder={['desc', 'asc']}
                                initialState={{
                                    pagination: { paginationModel: { pageSize: 10 } },
                                    sorting: { sortModel: [{ field: 'id', sort: 'desc' }] }
                                }}
                                disableRowSelectionOnClick
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
