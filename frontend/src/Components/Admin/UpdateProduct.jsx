import { useState, useEffect } from 'react'
import * as yup from 'yup'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'

import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios';
// import { getToken } from '../../Utils/helpers';
import { useDispatch, useSelector } from 'react-redux'
import { updateProduct, getProductDetails, clearErrors } from '../../actions/productActions'
import { UPDATE_PRODUCT_RESET } from '../../constants/productConstants'
import { askConfirm } from '../../Utils/confirm'


const UpdateProduct = () => {
    const dispatch = useDispatch()
    const { error, product } = useSelector(state => state.productDetails);
    const { loading, error: updateError, isUpdated } = useSelector(state => state.product);

    // console.log(product)
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Shoes');
    const [stock, setStock] = useState(0);
    const [seller, setSeller] = useState('');
    const [sizes, setSizes] = useState([{ label: 'One size', stock: '1' }]);
    const [images, setImages] = useState([]);
    const [oldImages, setOldImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([])
    const [people, setPeople] = useState([])
    // const [error, setError] = useState('')
    // const [product, setProduct] = useState({})
    // const [loading, setLoading] = useState(true)
    // const [updateError, setUpdateError] = useState('')
    // const [isUpdated, setIsUpdated] = useState(false)

    const categories = [
        ['Shoes', 'Shoes'],
        ['Clothes', 'Clothes'],
        ['Accessories', 'Accessories'],
        ['sale', 'For sale'],
        ['trade', 'For trade']
    ]
    const hand = category === 'sale' || category === 'trade'
    let { id } = useParams();
    let navigate = useNavigate();

    const errMsg = (message = '') => toast.error(message, {
        position: 'bottom-right'
    });
    const successMsg = (message = '') => toast.success(message, {
        position: 'bottom-right'
    });

    // const getProductDetails = async (id) => {
    //     try {
    //         const { data } = await axios.get(`${import.meta.env.VITE_API}/product/${id}`)
    //         setProduct(data.product)
    //         setLoading(false)

    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }

    // const updateProduct = async (id, productData) => {
    //     try {

    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${getToken()}`
    //             }
    //         }
    //         const { data } = await axios.put(`${import.meta.env.VITE_API}/admin/product/${id}`, productData, config)
    //         setIsUpdated(data.success)

    //     } catch (error) {
    //         setUpdateError(error.response.data.message)

    //     }
    // }
    useEffect(() => {
        if (!product || String(product._id) !== String(id)) {
            dispatch(getProductDetails(id))
        } else {
            const hand = product.listingType === 'sale' || product.listingType === 'trade'
            setName(product.name);
            setPrice(product.price);
            setDescription(product.description);
            setCategory(hand ? product.listingType : product.category);
            setSeller(product.seller || '');
            setStock(product.stock)
            setSizes(product.sizes?.length ? product.sizes.map(size => ({ label: size.label, stock: size.stock })) : [{ label: 'One size', stock: product.stock }])
            setOldImages(product.images || [])
        }
        if (error) {
            errMsg(error)
            dispatch(clearErrors())

        }
        if (updateError) {
            errMsg(updateError);
            dispatch(clearErrors())

        }
        if (isUpdated) {
            navigate('/admin/products');
            successMsg('Product updated successfully');
            dispatch({ type: UPDATE_PRODUCT_RESET })

        }
    }, [error, updateError, product, id, isUpdated])

    useEffect(() => {
        if (!hand) return
        axios.get(`${import.meta.env.VITE_API}/admin/users`, { withCredentials: true })
            .then(({ data }) => setPeople(data.users || []))
            .catch(() => setPeople([]))
    }, [hand])

    const submitHandler = async (e) => {
        e.preventDefault();
        const priceNumber = Number(price)
        const cleanedSizes = sizes
            .map(size => ({ label: String(size.label || '').trim(), stock: Number(size.stock) }))
            .filter(size => size.label)
        const isTrade = product.listingType === 'trade'
        try {
            await yup.object({
                name: yup.string().trim().required('Name is required'),
                description: yup.string().trim().required('Description is required'),
                seller: yup.string().trim(),
                category: yup.string().oneOf(['Shoes', 'Clothes', 'Accessories', 'sale', 'trade']).required('Category is required'),
                price: yup.number().typeError('Price has to be a number').min(0, 'Price cannot be negative').required('Price is required')
            }).validate({ name, description, seller, category, price: priceNumber })
        } catch (validationError) {
            toast.error(validationError.message, { position: 'bottom-right' })
            return
        }
        if (!Number.isFinite(priceNumber) || priceNumber < 0 || (!isTrade && priceNumber <= 0)) {
            toast.error('Price has to be a number, like 1596', { position: 'bottom-right' })
            return
        }
        if (!cleanedSizes.length || cleanedSizes.some(size => !Number.isFinite(size.stock) || size.stock < 0)) {
            toast.error('Each size needs a name and how many are left', { position: 'bottom-right' })
            return
        }
        if (oldImages.length + images.length === 0) {
            toast.error('Add at least one photo', { position: 'bottom-right' })
            return
        }
        const selling = category === 'sale' || category === 'trade'
        const person = people.find(item => item.name.toLowerCase() === seller.trim().toLowerCase())
        if (selling && !person) {
            toast.error('Choose a seller from the list', { position: 'bottom-right' })
            return
        }
        const ok = await askConfirm('Save these changes?', 'This updates the product in the shop.')
        if (!ok) return
        dispatch(updateProduct(product._id, {
            name: name.trim(),
            price: priceNumber,
            description: description.trim(),
            category: selling ? 'Shoes' : category,
            listingType: selling ? category : 'shop',
            offeredBy: person?._id,
            stock: cleanedSizes.reduce((sum, size) => sum + size.stock, 0),
            sizes: cleanedSizes,
            seller: seller.trim(),
            images: [...oldImages, ...images]
        }))
    }

    const changeSize = (index, field, value) => {
        setSizes(old => old.map((size, i) => i === index ? { ...size, [field]: value } : size))
    }

    const onChange = e => {
        const files = Array.from(e.target.files || [])
        e.target.value = ''
        if (!files.length) return
        const room = 6 - (oldImages.length + images.length)
        if (room <= 0) {
            toast.error('You can add up to 6 photos', { position: 'bottom-right' })
            return
        }
        files.slice(0, room).forEach(file => {
            const reader = new FileReader();
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

    const removeOldImage = (index) => {
        setOldImages(oldArray => oldArray.filter((_, i) => i !== index))
    }

    const removeImage = (index) => {
        setImages(oldArray => oldArray.filter((_, i) => i !== index))
        setImagesPreview(oldArray => oldArray.filter((_, i) => i !== index))
    }
    return (
        <>
            <MetaData title={'Update Product'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <>
                        <div className="wrapper my-5">
                            <form className="shadow-lg" onSubmit={submitHandler} encType='multipart/form-data'>
                                <h1 className="mb-4">Update Product</h1>
                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <input
                                        type="text"
                                        id="name_field"
                                        className="form-control"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price_field">Price (₱)</label>
                                    <input
                                        type="number"
                                        id="price_field"
                                        className="form-control"
                                        value={price}
                                        min="1"
                                        onChange={(e) => setPrice(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description_field">Description</label>
                                    <textarea className="form-control" id="description_field" rows="8" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category_field">Category</label>
                                    <select className="form-control" id="category_field" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        {categories.map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Sizes and stock left</label>
                                    {sizes.map((size, index) => (
                                        <div className="size-stock-row" key={index}>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Size, like US 9 or M"
                                                value={size.label}
                                                onChange={(e) => changeSize(index, 'label', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="0"
                                                value={size.stock}
                                                onChange={(e) => changeSize(index, 'stock', e.target.value)}
                                            />
                                            <button type="button" className="btn" onClick={() => setSizes(old => old.filter((_, i) => i !== index))}>x</button>
                                        </div>
                                    ))}
                                    <button type="button" className="btn" onClick={() => setSizes(old => [...old, { label: '', stock: '1' }])}>Add size</button>
                                    <p className="photo-note">{sizes.reduce((sum, size) => sum + (Number(size.stock) || 0), 0)} left in total</p>
                                </div>
                                {hand && (
                                    <div className="form-group">
                                        <label htmlFor="seller_field">Who is selling</label>
                                        <input
                                            type="text"
                                            id="seller_field"
                                            className="form-control"
                                            placeholder="Type a name from the list"
                                            value={seller}
                                            onChange={(e) => setSeller(e.target.value)}
                                        />
                                        {seller.trim() && (
                                        <ul className="seller-list">
                                            {people.filter(person => person.name.toLowerCase().includes(seller.trim().toLowerCase())).slice(0, 6).map(person => (
                                                <li key={person._id}>
                                                    <button type="button" onClick={() => setSeller(person.name)}>{person.name}</button>
                                                </li>
                                            ))}
                                            {seller.trim() && !people.some(person => person.name.toLowerCase().includes(seller.trim().toLowerCase())) && (
                                                <li className="photo-note">No one with that name</li>
                                            )}
                                        </ul>
                                        )}
                                    </div>
                                )}
                                <div className='form-group'>
                                    <label htmlFor="product_photos">Photos</label>
                                    <input id="product_photos" type='file' name='images' accept='image/*' onChange={onChange} multiple />
                                    <p className="photo-note">You can add more than one photo. Pick them together, or choose again to add another. Up to 6.</p>
                                    <div className="photo-row">
                                        {oldImages && oldImages.map((img, index) => (
                                            <div className="photo-tile" key={img.url || index}>
                                                <img src={img.url} alt="" />
                                                <button type="button" onClick={() => removeOldImage(index)} aria-label="Remove photo">x</button>
                                            </div>
                                        ))}
                                        {imagesPreview.map((img, index) => (
                                            <div className="photo-tile" key={`${index}-${img.slice(0, 32)}`}>
                                                <img src={img} alt="Preview" />
                                                <button type="button" onClick={() => removeImage(index)} aria-label="Remove photo">x</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    id="login_button"
                                    type="submit"
                                    className="btn btn-block py-3"
                                    disabled={loading ? true : false}
                                >
                                    UPDATE
                                </button>
                            </form>
                        </div>
                    </>
                </div>
            </div>
        </>
    )
}

export default UpdateProduct