import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import MetaData from '../Layout/MetaData'
import Sidebar from './SideBar'
// import { getToken } from '../../Utils/helpers';
// import axios from 'axios'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { newProduct, clearErrors } from '../../actions/productActions'
import { NEW_PRODUCT_RESET } from '../../constants/productConstants'

const productSchema = yup.object({
    name: yup.string().trim().required('Name is required').max(100, 'Name cannot exceed 100 characters'),
    price: yup.number().typeError('Price has to be a number').min(0, 'Price cannot be negative').required('Price is required')
        .when('category', {
            is: (value) => value !== 'trade',
            then: (schema) => schema.moreThan(0, 'Price has to be greater than 0')
        }),
    description: yup.string().trim().required('Description is required'),
    category: yup.string().oneOf(['Shoes', 'Clothes', 'Accessories', 'sale', 'trade']).required('Category is required'),
    offerNote: yup.string().trim()
})

const NewProduct = () => {
    const dispatch = useDispatch()
    const { loading, error, success } = useSelector(state => state.newProduct)
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: yupResolver(productSchema),
        defaultValues: { category: 'Shoes', price: '', offerNote: '' }
    })
    const category = watch('category')
    const hand = category === 'sale' || category === 'trade'
    const forTrade = category === 'trade'
    const [people, setPeople] = useState([])
    const [sellerName, setSellerName] = useState('')

    const [sizes, setSizes] = useState([{ label: 'One size', stock: '1' }]);
    const [images, setImages] = useState([]);
    const [imagesPreview, setImagesPreview] = useState([])
    // const [error, setError] = useState('')
    // const [loading, setLoading] = useState(true)
    // const [success, setSuccess] = useState('')
    // const [product, setProduct] = useState({})

    const categories = [
        ['Shoes', 'Shoes'],
        ['Clothes', 'Clothes'],
        ['Accessories', 'Accessories'],
        ['sale', 'For sale'],
        ['trade', 'For trade']
    ]

    let navigate = useNavigate()

    const submitHandler = (values) => {
        const cleanedSizes = sizes
            .map(size => ({ label: size.label.trim(), stock: Number(size.stock) }))
            .filter(size => size.label)
        if (!cleanedSizes.length || cleanedSizes.some(size => !Number.isFinite(size.stock) || size.stock < 0)) {
            toast.error('Each size needs a name and how many are left', { position: 'bottom-right' })
            return
        }
        if (images.length === 0) {
            toast.error('Add at least one photo', { position: 'bottom-right' })
            return
        }
        const selling = values.category === 'sale' || values.category === 'trade'
        const person = people.find(item => item.name.toLowerCase() === sellerName.trim().toLowerCase())
        if (selling && !person) {
            toast.error('Choose a seller from the list', { position: 'bottom-right' })
            return
        }
        dispatch(newProduct({
            name: values.name.trim(),
            price: Number(values.price),
            description: values.description.trim(),
            category: selling ? 'Shoes' : values.category,
            listingType: selling ? values.category : 'shop',
            offeredBy: person?._id,
            offerNote: values.category === 'trade' ? String(values.offerNote || '').trim() : '',
            stock: cleanedSizes.reduce((sum, size) => sum + size.stock, 0),
            sizes: cleanedSizes,
            seller: selling ? person.name : 'J-Trade',
            images
        }))
    }

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

    const changeSize = (index, field, value) => {
        setSizes(old => old.map((size, i) => i === index ? { ...size, [field]: value } : size))
    }

    const removeImage = (index) => {
        setImages(oldArray => oldArray.filter((_, i) => i !== index))
        setImagesPreview(oldArray => oldArray.filter((_, i) => i !== index))
    }

    // const newProduct = async (formData) => {

    //     try {
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',

    //             },
    //             withCredentials: true
    //         }

    //         const { data } = await axios.post(`${import.meta.env.VITE_API}/admin/product/new`, formData, config)
    //         setLoading(false)
    //         setSuccess(data.success)
    //         setProduct(data.product)
    //     } catch (error) {
    //         setError(error.response.data.message)

    //     }
    // }
    // useEffect(() => {

    //     if (error) {
    //         toast.error(error, {
    //             position: 'bottom-right'
    //         });
    //     }

    //     if (success) {
    //         navigate('/admin/products');
    //         toast.success('Product created successfully', {
    //             position: 'bottom-right'
    //         })

    //     }

    // }, [error, success,])
    useEffect(() => {
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
            dispatch(clearErrors())
        }

        if (success) {
            navigate('/admin/products');
            toast.success('Product created successfully', {
                position: 'bottom-right'
            })
            dispatch({ type: NEW_PRODUCT_RESET })

        }

    }, [error, dispatch, navigate, success])

    useEffect(() => {
        if (!hand) return
        axios.get(`${import.meta.env.VITE_API}/admin/users`, { withCredentials: true })
            .then(({ data }) => setPeople(data.users || []))
            .catch(() => setPeople([]))
    }, [hand])

    return (
        <>
            <MetaData title={'New Product'} />
            <div className="admin-shell">
                <Sidebar />
                <div className="admin-main">
                    <>
                        <div className="wrapper my-5">
                            <form className="shadow-lg" onSubmit={handleSubmit(submitHandler)} encType='multipart/form-data'>
                                <h1 className="mb-4">New Product</h1>

                                <div className="form-group">
                                    <label htmlFor="name_field">Name</label>
                                    <input type="text" id="name_field" className="form-control" {...register('name')} />
                                    {errors.name && <p className="text-danger mt-2 mb-0">{errors.name.message}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="price_field">Price (₱)</label>
                                    <input type="number" id="price_field" className="form-control" min={forTrade ? '0' : '1'} {...register('price')} />
                                    {forTrade && <p className="photo-note">Trade can use 0 if there is no cash amount.</p>}
                                    {errors.price && <p className="text-danger mt-2 mb-0">{errors.price.message}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="description_field">Description</label>
                                    <textarea className="form-control" id="description_field" rows="8" {...register('description')}></textarea>
                                    {errors.description && <p className="text-danger mt-2 mb-0">{errors.description.message}</p>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="category_field">Category</label>
                                    <select className="form-control" id="category_field" {...register('category')}>
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
                                            value={sellerName}
                                            onChange={(event) => setSellerName(event.target.value)}
                                        />
                                        {sellerName.trim() && (
                                        <ul className="seller-list">
                                            {people.filter(person => person.name.toLowerCase().includes(sellerName.trim().toLowerCase())).slice(0, 6).map(person => (
                                                <li key={person._id}>
                                                    <button type="button" onClick={() => setSellerName(person.name)}>{person.name}</button>
                                                </li>
                                            ))}
                                            {sellerName.trim() && !people.some(person => person.name.toLowerCase().includes(sellerName.trim().toLowerCase())) && (
                                                <li className="photo-note">No one with that name</li>
                                            )}
                                        </ul>
                                        )}
                                    </div>
                                )}

                                {forTrade && (
                                    <div className="form-group">
                                        <label htmlFor="offer_note_field">Trade note</label>
                                        <textarea
                                            id="offer_note_field"
                                            className="form-control"
                                            rows="3"
                                            placeholder="What they want in return"
                                            {...register('offerNote')}
                                        />
                                    </div>
                                )}

                                <div className='form-group'>
                                    <label htmlFor="product_photos">Photos</label>
                                    <input id="product_photos" type='file' name='images' accept='image/*' onChange={onChange} multiple />
                                    <p className="photo-note">You can add more than one photo. Pick them together, or choose again to add another. Up to 6.</p>
                                    <div className="photo-row">
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
                                    {loading ? 'CREATING...' : 'CREATE'}
                                </button>

                            </form>
                        </div>
                    </>
                </div>
            </div>

        </>
    )
}
export default NewProduct
