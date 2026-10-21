import { useEffect } from 'react'
import { toast } from 'react-toastify'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { useDispatch, useSelector } from 'react-redux'
import { getAdminOffers, reviewOffer, clearErrors } from '../../actions/productActions'
import { REVIEW_OFFER_RESET } from '../../constants/productConstants'
import { peso } from '../../Utils/money'

const OfferQueue = () => {
    const dispatch = useDispatch()
    const { loading, offers, error } = useSelector(state => state.adminOffers)
    const { loading: reviewing, error: reviewError, success } = useSelector(state => state.offerReview)

    useEffect(() => {
        dispatch(getAdminOffers())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
        if (reviewError) {
            toast.error(reviewError, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
        if (success) {
            toast.success('Offer updated', { position: 'bottom-right' })
            dispatch({ type: REVIEW_OFFER_RESET })
            dispatch(getAdminOffers())
        }
    }, [error, reviewError, success, dispatch])

    const decide = (id, status) => {
        dispatch(reviewOffer(id, status))
    }

    return (
        <>
            <MetaData title={'Offers'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <h1 className="page-title">Offers waiting</h1>
                    {loading && !offers.length ? <Loader /> : !offers.length ? (
                        <p className="empty-note">No offers waiting.</p>
                    ) : (
                        <div className="table-wrap">
                            <table className="offer-table">
                                <thead>
                                    <tr>
                                        <th>Shoe</th>
                                        <th>Offer</th>
                                        <th>From</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...offers].sort((a, b) => Number(b._id) - Number(a._id)).map(offer => {
                                        const person = offer.offeredBy && typeof offer.offeredBy === 'object' ? offer.offeredBy : null
                                        return (
                                            <tr key={offer._id}>
                                                <td>
                                                    <div className="offer-shoe">
                                                        {offer.images?.[0] && <img className="offer-thumb" src={offer.images[0].url} alt="" />}
                                                        <div>
                                                            <strong>{offer.name}</strong>
                                                            <p className="photo-note">{offer.condition} · {offer.sizes?.[0]?.label || 'One size'} · {offer.stock} left</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {offer.listingType === 'trade' ? (
                                                        <>
                                                            <strong>For trade</strong>
                                                            <p className="photo-note">{offer.offerNote}</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <strong>For sale</strong>
                                                            <p className="photo-note">{peso(offer.price)}</p>
                                                        </>
                                                    )}
                                                </td>
                                                <td>{person?.name || offer.seller}</td>
                                                <td>
                                                    <div className="queue-actions">
                                                        <button type="button" className="offer-approve" id={`approve-${offer._id}`} disabled={reviewing} onClick={() => decide(offer._id, 'approved')}>Approve</button>
                                                        <button type="button" className="offer-reject" id={`reject-${offer._id}`} disabled={reviewing} onClick={() => decide(offer._id, 'rejected')}>Reject</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default OfferQueue
