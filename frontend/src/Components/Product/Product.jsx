import { Link } from 'react-router-dom';
import { peso } from '../../Utils/money';

const Product = ({ product }) => {
    return (
        <div className="col-sm-12 col-md-6 col-lg-3 my-3">
            <div className="card p-0">
                <img
                    className="card-img-top mx-auto"
                    src={product.images?.[0]?.url || ''}
                    alt={product.name}
                />
                <div className="card-body d-flex flex-column">
                    {product.listingType === 'sale' && <p className="card-category">For sale</p>}
                    {product.listingType === 'trade' && <p className="card-category">For trade</p>}
                    <h5 className="card-title">
                        <Link to={`/product/${product._id}`}>{product.name}</Link>
                    </h5>
                    <p className="card-stars">{'★★★★★'.slice(0, Math.round(product.ratings || 0))}{'☆☆☆☆☆'.slice(0, 5 - Math.round(product.ratings || 0))} <span>{product.numOfReviews || 0} reviews</span></p>
                    <p className="card-text">{product.listingType === 'trade' ? 'For trade' : peso(product.price)}</p>
                    <Link to={`/product/${product._id}`} id="view_btn" className="btn btn-block">View Details</Link>
                </div>
            </div>
        </div>
    )
}

export default Product
