import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { useDispatch, useSelector } from 'react-redux'
import { getProductDetails, newReview } from '../../actions/productActions'
import { NEW_REVIEW_RESET, CLEAR_ERRORS } from '../../constants/productConstants'
import { addItemToCart } from '../../actions/cartActions'
import { peso } from '../../Utils/money'
import { productCode } from '../../Utils/codes'

const ProductDetails = () => {
    const { product, canReview, myReview, loading: productLoading, error: productError } = useSelector(state => state.productDetails);
    const { success: reviewDone, error: reviewError } = useSelector(state => state.newReview)
    const { user, isAuthenticated, loading } = useSelector(state => state.auth)
    const [quantity, setQuantity] = useState(1)
    const [size, setSize] = useState('')
    const [photo, setPhoto] = useState(0)
    const [added, setAdded] = useState(false)
    const [adding, setAdding] = useState(false)
    const [sheet, setSheet] = useState(false)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState('')
    const [moreReviews, setMoreReviews] = useState(false)
    const [starFilter, setStarFilter] = useState(5)
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const loggedIn = Boolean(isAuthenticated && user?.name)
    const sizeRank = (label) => {
        const text = String(label || '')
        const number = text.match(/(\d+(?:\.\d+)?)/)
        if (number) return Number(number[1])
        const order = { XXS: 1, XS: 2, S: 3, M: 4, L: 5, XL: 6, XXL: 7, 'ONE SIZE': 8 }
        return order[text.trim().toUpperCase()] ?? 100
    }
    const sizes = [...(product.sizes || [])].sort((a, b) => sizeRank(a.label) - sizeRank(b.label) || String(a.label).localeCompare(String(b.label)))
    const selected = sizes.find(item => item.label === size)
    const sizeStock = selected ? selected.stock : (sizes.length ? 0 : product.stock)
    const listingType = product.listingType || 'shop'
    const status = product.status || 'approved'
    const forTrade = listingType === 'trade'
    const forSale = listingType === 'sale'
    const canBuy = Boolean(product._id) && status === 'approved' && !forTrade

    const increaseQty = () => {
        if (!sizeStock || quantity >= sizeStock) return;
        setQuantity(quantity + 1)
    }

    const decreaseQty = () => {
        if (quantity <= 1) return;
        setQuantity(quantity - 1)
    }

    const openSheet = () => {
        if (!loggedIn) {
            if (!loading) {
                toast.error('Please log in first', { position: 'bottom-right' })
                navigate('/login')
            }
            return
        }
        setSheet(true)
    }

    const addToCart = async () => {
        if (sizes.length && !size) {
            toast.error('Choose a size first', { position: 'bottom-right' })
            return
        }
        if (adding) return
        setAdding(true)
        try {
            await dispatch(addItemToCart(id, quantity, size))
            setAdded(true)
            setSheet(false)
            toast.success('Added to cart', { position: 'bottom-right' })
            window.setTimeout(() => setAdded(false), 2500)
        } catch (error) {
            toast.error(error?.message || 'Could not add to cart', { position: 'bottom-right' })
        } finally {
            setAdding(false)
        }
    }

    useEffect(() => {
        dispatch(getProductDetails(id))
        setQuantity(1)
        setSize('')
        setPhoto(0)
        setAdded(false)
        setSheet(false)
        setMoreReviews(false)
        setStarFilter(5)
    }, [dispatch, id]);

    useEffect(() => {
        if (myReview) {
            setReviewRating(myReview.rating || 5)
            setReviewComment(myReview.comment || '')
        } else {
            setReviewRating(5)
            setReviewComment('')
        }
    }, [myReview])

    useEffect(() => {
        if (reviewError) {
            toast.error(reviewError, { position: 'bottom-right' })
            dispatch({ type: CLEAR_ERRORS })
        }
        if (reviewDone) {
            toast.success(myReview ? 'Review updated' : 'Review posted', { position: 'bottom-right' })
            dispatch({ type: NEW_REVIEW_RESET })
            dispatch(getProductDetails(id))
        }
    }, [reviewDone, reviewError, dispatch, id, myReview])

    const ready = product && String(product._id) === String(id)

    const submitReview = (event) => {
        event.preventDefault()
        if (!loggedIn) {
            toast.error('Please log in first', { position: 'bottom-right' })
            navigate('/login')
            return
        }
        dispatch(newReview({ rating: Number(reviewRating), comment: reviewComment, productId: product._id }))
    }

    if (!ready) {
        return (
            <>
                <MetaData title={'Product'} />
                {productError && !productLoading ? <p className="empty-note">{productError}</p> : <Loader />}
            </>
        )
    }

    return (
        <>
            <MetaData title={product.name} />
            <div className="row d-flex justify-content-around align-items-start">
                <div className="col-12 col-lg-5" id="product_image">
                    {product.images && product.images[photo] && (
                        <img className="d-block w-100 product-hero" src={product.images[photo].url} alt={product.name} />
                    )}
                    {product.images && product.images.length > 1 && (
                        <div className="photo-thumbs">
                            {product.images.map((image, index) => (
                                <button
                                    type="button"
                                    key={image.public_id || image.url}
                                    className={index === photo ? 'active' : ''}
                                    onClick={() => setPhoto(index)}
                                >
                                    <img src={image.url} alt="" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-12 col-lg-5 mt-5">
                    <p className="eyebrow">J-Trade</p>
                    <h3 className="page-title">{product.name}</h3>
                    <p id="product_id">{productCode(product)}</p>
                    {forTrade ? (
                        <p id="product_price">For trade</p>
                    ) : (
                        <p id="product_price">{peso(product.price)}</p>
                    )}
                    {forSale && <p className="card-category">For sale</p>}
                    {product.category && <p className="card-category">{product.category}</p>}
                    {product.condition && <p className="photo-note">Condition: {product.condition}</p>}
                    {forTrade && status === 'approved' && (
                        <div className="trade-panel">
                            <p className="eyebrow">For trade</p>
                            <p>{product.offerNote}</p>
                            {sizes.length > 0 && <p>Size {sizes.map(item => item.label).join(', ')}</p>}
                            <p>The seller wants a trade, not a paid checkout.</p>
                        </div>
                    )}
                    {canBuy && (
                        <>
                            <button type="button" id="cart_btn" className="btn" onClick={openSheet}>{added ? 'Added to cart' : 'Add to Cart'}</button>
                            {added && <p className="added-note">Added to cart</p>}
                        </>
                    )}
                    <hr />
                    <h4 className="mt-4">Description</h4>
                    <p>{product.description}</p>
                </div>
            </div>
            {product._id && (
                <section className="review-box">
                    <h3>Reviews</h3>
                    <p className="card-stars">{'★★★★★'.slice(0, Math.round(product.ratings || 0))}{'☆☆☆☆☆'.slice(0, 5 - Math.round(product.ratings || 0))} <span>{product.numOfReviews || 0} reviews</span></p>
                    {canReview ? (
                        <form onSubmit={submitReview} className="review-form">
                            <label htmlFor="review_rating">Your rating</label>
                            <select id="review_rating" value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                                {[5, 4, 3, 2, 1].map(star => <option key={star} value={star}>{star} star{star > 1 ? 's' : ''}</option>)}
                            </select>
                            <label htmlFor="review_comment">{myReview ? 'Update your review' : 'Write a review'}</label>
                            <textarea id="review_comment" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} required />
                            <button type="submit" className="btn add-product">{myReview ? 'Update review' : 'Post review'}</button>
                        </form>
                    ) : (
                        <p className="photo-note">{loggedIn ? 'You can review this after a delivered order.' : 'Log in to review a product you already received.'}</p>
                    )}
                    {(() => {
                        const allReviews = [...(product.reviews || [])]
                        const preview = allReviews.filter(review => review.rating === 5).slice(0, 3)
                        const shown = moreReviews ? allReviews.filter(review => review.rating === starFilter) : preview
                        if (!allReviews.length) return <p className="empty-note">No reviews yet.</p>
                        const cards = (list) => list.map(review => (
                            <article key={review._id} className="review-card">
                                <p className="card-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                                <p className="review_user">{review.name}</p>
                                <p>{review.comment}</p>
                            </article>
                        ))
                        return (
                            <>
                                {!moreReviews && (preview.length ? cards(preview) : <p className="empty-note">No 5-star reviews yet.</p>)}
                                {!moreReviews && allReviews.length > preview.length && (
                                    <button type="button" className="btn review-more" onClick={() => setMoreReviews(true)}>View more reviews</button>
                                )}
                                {moreReviews && (
                                    <div className="filter-choices review-stars">
                                        {[5, 4, 3, 2, 1].map(stars => (
                                            <button
                                                key={stars}
                                                type="button"
                                                className={starFilter === stars ? 'active' : ''}
                                                onClick={() => setStarFilter(stars)}
                                            >
                                                {stars} star{stars > 1 ? 's' : ''}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {moreReviews && (shown.length ? cards(shown) : <p className="empty-note">No {starFilter}-star reviews.</p>)}
                            </>
                        )
                    })()}
                </section>
            )}
            {sheet && canBuy && createPortal(
                <div className="size-sheet-backdrop" onClick={() => setSheet(false)}>
                    <div className="size-sheet" role="dialog" aria-label="Choose a size" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="size-sheet-close" onClick={() => setSheet(false)}>x</button>
                        <div className="size-sheet-top">
                            {product.images?.[0] && <img src={product.images[0].url} alt="" />}
                            <div>
                                <p className="size-sheet-price">{peso(product.price)}</p>
                                <p className="photo-note">{selected ? `${selected.stock} left in ${selected.label}` : `${product.stock} left`}</p>
                            </div>
                        </div>
                        {sizes.length > 0 && (
                            <div className="size-picker">
                                <p className="size-label">Size</p>
                                <div className="size-grid">
                                    {sizes.map(item => (
                                        <button
                                            type="button"
                                            key={item.label}
                                            className={item.label === size ? 'active' : ''}
                                            disabled={item.stock === 0}
                                            onClick={() => { setSize(item.label); setQuantity(1) }}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="size-sheet-qty">
                            <p className="size-label">Quantity</p>
                            <div className="stockCounter">
                                <span className="btn minus" onClick={decreaseQty}>-</span>
                                <input type="number" className="form-control count" value={quantity} readOnly />
                                <span className="btn plus" onClick={increaseQty}>+</span>
                            </div>
                        </div>
                        <button type="button" className="btn size-sheet-confirm" disabled={!sizeStock || adding} onClick={addToCart}>
                            {adding ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

export default ProductDetails
