import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import MetaData from './Layout/MetaData'
import Product from './Product/Product'
import Loader from './Layout/Loader'
import { useDispatch, useSelector } from 'react-redux'

import { getProducts } from '../actions/productActions'

const Home = () => {
    const { loading, products, error, productsCount, filteredProductsCount } = useSelector(state => state.products)
    const [searchParams, setSearchParams] = useSearchParams()
    const [page, setPage] = useState(1)
    const categories = ['Shoes', 'Clothes', 'Accessories']
    const { keyword } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const sentinel = useRef(null)
    const moreLock = useRef(false)
    const filterRef = useRef('')

    const priceMin = Number(searchParams.get('min') || 1)
    const priceMax = Number(searchParams.get('max') || 25000)
    const category = searchParams.get('category') || ''
    const rating = Number(searchParams.get('rating') || 0)
    const reviews = searchParams.get('reviews') || ''
    const filterKey = [keyword || '', category, rating, reviews, priceMin, priceMax].join('|')
    const priceFiltered = priceMin > 1 || priceMax < 25000
    const count = (keyword || category || rating || reviews || priceFiltered) ? filteredProductsCount : productsCount
    const browseClear = !keyword && !category && !rating && !reviews && !priceFiltered

    const chooseCategory = (value) => {
        const next = new URLSearchParams(searchParams)
        if (value) next.set('category', value)
        else next.delete('category')
        setSearchParams(next)
    }

    const showAll = () => {
        setPage(1)
        navigate('/')
    }

    useEffect(() => {
        if (!loading) moreLock.current = false
    }, [loading])

    useEffect(() => {
        const filtersChanged = filterRef.current !== filterKey
        if (filtersChanged) {
            filterRef.current = filterKey
            if (page !== 1) {
                setPage(1)
                return
            }
        }
        dispatch(getProducts(page, keyword, [priceMin, priceMax], category, rating, reviews, !filtersChanged && page > 1))
    }, [dispatch, page, filterKey, keyword, priceMin, priceMax, category, rating, reviews])

    useEffect(() => {
        if (loading || !sentinel.current) return
        if (!products.length || products.length >= count) return
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting || moreLock.current) return
            moreLock.current = true
            setPage(current => current + 1)
        })
        observer.observe(sentinel.current)
        return () => observer.disconnect()
    }, [loading, products.length, count])

    return (
        <>
            <MetaData title={'Shop'} />
            {!keyword && (
                <section className="hero">
                    <p className="eyebrow">Jordan Brand Buy and Sell</p>
                    <h1>J-TRADE</h1>
                    <p>Browse shoes, clothes, and accessories, then check out.</p>
                </section>
            )}
            <h1 id="products_heading">{keyword ? `Results for "${keyword}"` : 'Latest Products'}</h1>
            <div className="category-row">
                <button type="button" className={browseClear ? 'active' : ''} onClick={showAll}>All</button>
                {categories.map(item => (
                    <button
                        key={item}
                        type="button"
                        className={category === item ? 'active' : ''}
                        onClick={() => chooseCategory(item)}
                    >
                        {item}
                    </button>
                ))}
            </div>
            {loading && !products.length ? <Loader /> : error ? (
                <p className="empty-note">The product list is unavailable right now.</p>
            ) : (
                <section id="products">
                    <div className="row">
                        {(products || []).map(product => (
                            <Product key={product._id} product={product} />
                        ))}
                    </div>
                    {!products.length && <p className="empty-note">No products match these filters.</p>}
                    {products.length < count && <div className="load-more" ref={sentinel}>{loading ? 'Loading more...' : ''}</div>}
                </section>
            )}
        </>
    )
}

export default Home
