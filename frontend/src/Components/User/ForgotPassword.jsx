import { Link } from 'react-router-dom'
import MetaData from '../Layout/MetaData'

const ForgotPassword = () => {
    return (
        <>
            <MetaData title={'Forgot Password'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg">
                        <h1 className="mb-3">Forgot Password</h1>
                        <p>Email reset is not set up on this shop. Log in with your account, or ask an admin to change the password.</p>
                        <Link to="/login" className="btn btn-block py-3">Back to login</Link>
                    </form>
                </div>
            </div>
        </>
    )
}

export default ForgotPassword
