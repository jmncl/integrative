import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import MetaData from '../Layout/MetaData'
import axios from '../../Utils/api'
import { saveToken } from '../../Utils/authToken'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


const registerSchema = yup.object({
    name: yup.string().trim().required('Name is required').max(30, 'Name cannot exceed 30 characters'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
})

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(registerSchema)
    })
    const [avatar, setAvatar] = useState('')
    const [avatarPreview, setAvatarPreview] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)


    let navigate = useNavigate()
    // useEffect(() => {
    //     if (isAuthenticated) {
    //         navigate('/')
    //     }

    //     if (error) {
    //         console.log(error)
    //         dispatch(clearErrors());

    //     }

    // }, [error, navigate, isAuthenticated])

    const submitHandler = (values) => {
        if (!avatar) {
            toast.error('Choose a profile photo first', { position: 'bottom-right' })
            return
        }
        createAccount({ ...values, avatar })
    }

    const onChange = e => {
        if (e.target.name === 'avatar') {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setAvatarPreview(reader.result)
                    setAvatar(reader.result)
                }
            }
            reader.readAsDataURL(e.target.files[0])
        }
    }

    const createAccount = async (userData) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }

            const { data } = await axios.post(`/register`, userData, config)
            saveToken(data.token)
            localStorage.removeItem('cartItems')
            localStorage.removeItem('shippingInfo')
            sessionStorage.removeItem('orderInfo')
            sessionStorage.removeItem('paymentMethod')
            window.location.href = '/'
        } catch (error) {
            const message = error.response?.data?.message || 'Could not register'
            setError(message)
            toast.error(message, { position: 'bottom-right' })
        }
    }




    return (
        <>

            <MetaData title={'Register User'} />

            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={handleSubmit(submitHandler)} encType='multipart/form-data'>
                        <h1 className="mb-3">Register</h1>

                        <div className="form-group">
                            <label htmlFor="email_field">Name</label>
                            <input type="text" id="name_field" className="form-control" {...register('name')} />
                            {errors.name && <p className="text-danger mt-2 mb-0">{errors.name.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email_field">Email</label>
                            <input type="email" id="email_field" className="form-control" {...register('email')} />
                            {errors.email && <p className="text-danger mt-2 mb-0">{errors.email.message}</p>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password_field">Password</label>
                            <input type="password" id="password_field" className="form-control" {...register('password')} />
                            {errors.password && <p className="text-danger mt-2 mb-0">{errors.password.message}</p>}
                        </div>

                        <div className='form-group'>
                            <label htmlFor='avatar_upload'>Profile photo</label>
                            <div className='d-flex align-items-center'>
                                <figure className='avatar mr-3'>
                                    {avatarPreview ? (
                                        <img src={avatarPreview} className='rounded-circle' alt='Avatar Preview' />
                                    ) : (
                                        <span className="avatar-fallback">J</span>
                                    )}
                                </figure>
                                <input
                                    type='file'
                                    name='avatar'
                                    id='customFile'
                                    accept="image/*"
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        <button
                            id="register_button"
                            type="submit"
                            className="btn btn-block py-3"
                        >
                            Create account
                        </button>
                        {error && <p className="text-danger mt-3 mb-0">{error}</p>}
                        <div className="form-links">
                            <Link to="/login">Already have an account? Log in</Link>
                        </div>
                    </form>
                </div>
            </div>

        </>
    )
}

export default Register