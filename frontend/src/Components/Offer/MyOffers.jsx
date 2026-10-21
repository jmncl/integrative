import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
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

    useEffect(() => {
        dispatch(getMyOffers())
    }, [dispatch])

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
    }, [error, dispatch])

    return (
        <>
            <MetaData title={'My offers'} />
            <p className="eyebrow mt-4">Customer</p>
            <h1 className="page-title">My offers</h1>
            <p className="photo-note"><Link to="/offer">Offer another pair</Link></p>
            {loading && !offers.length ? <Loader /> : !offers.length ? (
                <p className="empty-note">You have not offered any shoes yet.</p>
            ) : (
                <div className="table-wrap">
                    <table className="offer-table">
                        <thead>
                            <tr>
                                <th>Shoe</th>
                                <th>Offer</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map(offer => {
                                const status = offer.status || 'pending'
                                return (
                                    <tr key={offer._id}>
                                        <td>
                                            <div className="offer-shoe">
                                                {offer.images?.[0] && <img className="offer-thumb" src={offer.images[0].url} alt="" />}
                                                <div>
                                                    <strong>{offer.name}</strong>
                                                    <p className="photo-note">{offer.condition} · {offer.sizes?.[0]?.label || 'One size'}</p>
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
                                        <td>
                                            <span className={`status-pill status-${status}`}>{statusLabel[status] || status}</span>
                                            {status === 'approved' && (
                                                <p className="photo-note"><Link to={`/product/${offer._id}`}>View in shop</Link></p>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    )
}

export default MyOffers
