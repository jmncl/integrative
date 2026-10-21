import { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { login, loginWithGoogle, clearErrors } from '../../actions/userActions'

const loginSchema = yup.object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
})

const Login = () => {
    const { isAuthenticated, error, loading, user } = useSelector(state => state.auth)
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(loginSchema)
    })
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const submitHandler = (values) => {
        dispatch(login(values.email, values.password))
    }

    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : ''
    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/dashboard')
        }
        else if (isAuthenticated && redirect === 'shipping') {
            navigate(`/${redirect}`)
        }
        else if (isAuthenticated)
            navigate('/')
        if (error && error !== 'Login first to access this resource') {
            toast.error(error, {
                position: 'bottom-right'
            })
        }
        if (error) {
            dispatch(clearErrors());
        }
    }, [error, isAuthenticated, user, dispatch, navigate, redirect])

    return (
        <>
            <MetaData title={'Login'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={handleSubmit(submitHandler)}>
                        <h1 className="mb-3">Login</h1>
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

                        <button id="login_button" type="submit" className="btn btn-block py-3" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        <button type="button" className="btn btn-block py-3 mt-3" onClick={() => dispatch(loginWithGoogle())} disabled={loading}>
                            Continue with Google
                        </button>

                        <div className="form-links">
                            <Link to="/password/forgot">Forgot password?</Link>
                            <Link to="/register">Create an account</Link>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
export default Login
