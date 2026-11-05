import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import MetaData from '../Layout/MetaData'
import { useDispatch, useSelector } from 'react-redux'
import { newOffer, clearErrors } from '../../actions/productActions'
import { NEW_OFFER_RESET } from '../../constants/productConstants'

const conditions = ['New', 'Good', 'Fair']

const NewOffer = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { user } = useSelector(state => state.auth)
    const { loading, error, success } = useSelector(state => state.newOffer)

    const [listingType, setListingType] = useState('sale')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [condition, setCondition] = useState('Good')
    const [sizeLabel, setSizeLabel] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [seller, setSeller] = useState('')
    const [price, setPrice] = useState('')
    const [offerNote, setOfferNote] = useState('')
    const [images, setImages] = useState([])
    const [imagesPreview, setImagesPreview] = useState([])

    useEffect(() => {
        if (user?.name) {
            setSeller(current => current || user.name)
        }
    }, [user])

    useEffect(() => {
        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
        if (success) {
            toast.success('Offer sent. An admin still has to approve it.', { position: 'bottom-right' })
            dispatch({ type: NEW_OFFER_RESET })
            navigate('/offers/me')
        }
    }, [error, success, dispatch, navigate])

    const onChange = e => {
        const files = Array.from(e.target.files || [])
        e.target.value = ''
        if (!files.length) return
        const room = 6 - images.length
        if (room <= 0) {
            toast.error('You can add up to 6 photos', { position: 'bottom-right' })
            return
        }
        files.slice(0, room).forEach(file => {
            const reader = new FileReader()
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagesPreview(oldArray => [...oldArray, reader.result])
                    setImages(oldArray => [...oldArray, reader.result])
                }
            }
            reader.readAsDataURL(file)
        })
        if (files.length > room) {
            toast.error('You can add up to 6 photos', { position: 'bottom-right' })
        }
    }

    const removeImage = (index) => {
        setImages(oldArray => oldArray.filter((_, i) => i !== index))
        setImagesPreview(oldArray => oldArray.filter((_, i) => i !== index))
    }

    const submitHandler = (e) => {
        e.preventDefault()
        const priceNumber = listingType === 'trade' ? Number(price || 0) : Number(price)
        const stock = Number(quantity)
        if (!name.trim() || !description.trim() || !seller.trim()) {
            toast.error('Fill in the name, description, and your name', { position: 'bottom-right' })
            return
        }
        if (!sizeLabel.trim() || !Number.isFinite(stock) || stock < 1) {
            toast.error('Enter the size and how many you have', { position: 'bottom-right' })
            return
        }
        if (listingType === 'sale' && (!Number.isFinite(priceNumber) || priceNumber <= 0)) {
            toast.error('Sale price has to be more than 0', { position: 'bottom-right' })
            return
        }
        if (listingType === 'trade' && !offerNote.trim()) {
            toast.error('Tell buyers what you want in trade', { position: 'bottom-right' })
            return
        }
        if (listingType === 'trade' && (!Number.isFinite(priceNumber) || priceNumber < 0)) {
            toast.error('Suggested value has to be a number', { position: 'bottom-right' })
            return
        }
        if (!images.length) {
            toast.error('Add at least one photo', { position: 'bottom-right' })
            return
        }
        dispatch(newOffer({
            listingType,
            name: name.trim(),
            description: description.trim(),
            condition,
            category: 'Shoes',
            seller: seller.trim(),
            price: priceNumber,
            offerNote: offerNote.trim(),
            sizes: [{ label: sizeLabel.trim(), stock }],
            stock,
            images
        }))
    }

    return (
        <>
            <MetaData title={'Sell or trade'} />
            <div className="wrapper my-5">
                <form className="shadow-lg" id="offer_form" onSubmit={submitHandler}>
                    <p className="eyebrow">Customer offer</p>
                    <h1 className="mb-2">Sell or trade</h1>
                    <p className="photo-note">Shoes only. An admin approves the listing before it shows in the shop. <Link to="/offers/me">My offers</Link></p>

                    <div className="offer-types">
                        <button type="button" id="offer_sale" className={listingType === 'sale' ? 'active' : ''} onClick={() => setListingType('sale')}>For sale</button>
                        <button type="button" id="offer_trade" className={listingType === 'trade' ? 'active' : ''} onClick={() => setListingType('trade')}>For trade</button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="offer_name">Name</label>
                        <input type="text" id="offer_name" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="offer_description">Description</label>
                        <textarea id="offer_description" className="form-control" rows="4" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="offer_condition">Condition</label>
                        <select id="offer_condition" className="form-control" value={condition} onChange={(e) => setCondition(e.target.value)}>
                            {conditions.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="offer_size">Size and how many</label>
                        <div className="size-stock-row">
                            <input type="text" id="offer_size" className="form-control" placeholder="Size, like US 9" value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value)} />
                            <input type="number" id="offer_qty" className="form-control" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                            <span></span>
                        </div>
                    </div>

                    {listingType === 'sale' ? (
                        <div className="form-group">
                            <label htmlFor="offer_price">Price (₱)</label>
                            <input type="number" id="offer_price" className="form-control" min="1" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                    ) : (
                        <>
                            <div className="form-group">
                                <label htmlFor="offer_note">What you want in return</label>
                                <textarea id="offer_note" className="form-control" rows="3" value={offerNote} onChange={(e) => setOfferNote(e.target.value)}></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="offer_value">Suggested value (₱), optional</label>
                                <input type="number" id="offer_value" className="form-control" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="offer_seller">{listingType === 'sale' ? 'Your name (previous owner)' : 'Your name'}</label>
                        <input type="text" id="offer_seller" className="form-control" value={seller} onChange={(e) => setSeller(e.target.value)} />
                        {listingType === 'sale' && (
                            <p className="photo-note">For sale items are sold by J-Trade. Your name shows as the previous owner.</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="offer_photos">Photos</label>
                        <input id="offer_photos" type="file" name="images" accept="image/*" onChange={onChange} multiple />
                        <p className="photo-note">Add at least one photo, up to 6.</p>
                        <div className="photo-row">
                            {imagesPreview.map((img, index) => (
                                <div className="photo-tile" key={`${index}-${img.slice(0, 32)}`}>
                                    <img src={img} alt="Preview" />
                                    <button type="button" onClick={() => removeImage(index)} aria-label="Remove photo">x</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button id="offer_submit" type="submit" className="btn btn-block py-3" disabled={loading}>
                        {loading ? 'SENDING...' : 'SEND OFFER'}
                    </button>
                </form>
            </div>
        </>
    )
}

export default NewOffer
