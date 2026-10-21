import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Box from '@mui/material/Box'
import Slider from '@mui/material/Slider'
import { peso } from '../../Utils/money'

const Search = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const min = Number(params.get('min') || 1)
    const max = Number(params.get('max') || 25000)
    const rating = Number(params.get('rating') || 0)
    const reviews = params.get('reviews') || ''
    const routeKeyword = location.pathname.startsWith('/search/')
        ? decodeURIComponent(location.pathname.slice('/search/'.length))
        : ''
    const [keyword, setKeyword] = useState(routeKeyword)
    const [suggestions, setSuggestions] = useState([])
    const [open, setOpen] = useState(false)
    const [price, setPrice] = useState([min, max])
    const formRef = useRef(null)

    useEffect(() => {
        setPrice([min, max])
    }, [min, max])

    useEffect(() => {
        setKeyword(routeKeyword)
    }, [routeKeyword])

    useEffect(() => {
        const text = keyword.trim()
        if (text.length < 2) {
            setSuggestions([])
            return
        }
        const timer = setTimeout(async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API}/products?keyword=${encodeURIComponent(text)}&page=1`)
                const names = (data.products || []).map(item => item.name)
                const words = []
                names.forEach(name => {
                    name.split(/\s+/).forEach(word => {
                        const clean = word.replace(/[^a-z0-9]/gi, '')
                        if (clean.length > text.length && clean.toLowerCase().startsWith(text.toLowerCase()) && !words.some(item => item.toLowerCase() === clean.toLowerCase())) {
                            words.push(clean)
                        }
                    })
                })
                const picks = [...words.slice(0, 4), ...names.filter(name => !words.some(word => name.toLowerCase() === word.toLowerCase())).slice(0, 5)]
                setSuggestions(picks)
            } catch (error) {
                setSuggestions([])
            }
        }, 180)
        return () => clearTimeout(timer)
    }, [keyword])

    useEffect(() => {
        const close = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) {
                setOpen(false)
                setSuggestions([])
            }
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [])

    const writeFilters = (patch) => {
        const next = new URLSearchParams(location.search)
        Object.entries(patch).forEach(([key, value]) => {
            if (value === '' || value === 0 || value === null || value === undefined) next.delete(key)
            else next.set(key, String(value))
        })
        const query = next.toString()
        const path = location.pathname.startsWith('/search/') ? location.pathname : '/'
        navigate(`${path}${query ? `?${query}` : ''}`)
    }

    const goSearch = (value) => {
        const query = location.search
        const text = String(value || '').trim()
        setKeyword(text)
        setSuggestions([])
        setOpen(false)
        if (text) navigate(`/search/${encodeURIComponent(text)}${query}`)
        else navigate(`/${query}`)
    }

    const searchHandler = (event) => {
        event.preventDefault()
        goSearch(keyword)
    }

    const filtering = min > 1 || max < 25000 || rating || reviews

    return (
        <form className="search-form" onSubmit={searchHandler} ref={formRef}>
            <div className="input-group">
                <input
                    type="text"
                    id="search_field"
                    className="form-control"
                    placeholder="Search products"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    autoComplete="off"
                />
                <div className="input-group-append">
                    <button
                        id="filter_btn"
                        className={open || filtering ? 'on' : ''}
                        type="button"
                        aria-label="Filters"
                        onClick={() => setOpen(value => !value)}
                    >
                        <i className="fa fa-filter" aria-hidden="true"></i>
                    </button>
                    <button id="search_btn" className="btn" type="submit" aria-label="Search">
                        <i className="fa fa-search" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
            {suggestions.length > 0 && (
                <ul className="search-suggest">
                    {suggestions.map(item => (
                        <li key={item}>
                            <button type="button" onClick={() => goSearch(item)}>{item}</button>
                        </li>
                    ))}
                </ul>
            )}
            {open && (
                <div className="filter-panel search-filters">
                    <h4>Price</h4>
                    <Box sx={{ width: '100%', px: 1 }}>
                        <Slider
                            value={price}
                            onChange={(event, value) => setPrice(value)}
                            onChangeCommitted={(event, value) => writeFilters({
                                min: value[0] > 1 ? value[0] : '',
                                max: value[1] < 25000 ? value[1] : ''
                            })}
                            valueLabelDisplay="auto"
                            getAriaValueText={(value) => peso(value)}
                            min={1}
                            max={25000}
                            step={100}
                            sx={{ color: '#c8102e' }}
                        />
                    </Box>
                    <p className="photo-note">{peso(price[0])} to {peso(price[1])}</p>
                    <h4>Ratings</h4>
                    <div className="filter-choices">
                        <button type="button" className={!rating ? 'active' : ''} onClick={() => writeFilters({ rating: '' })}>All</button>
                        {[4, 3, 2, 1].map(stars => (
                            <button key={stars} type="button" className={rating === stars ? 'active' : ''} onClick={() => writeFilters({ rating: stars })}>{stars} stars & up</button>
                        ))}
                    </div>
                    <h4>Reviews</h4>
                    <div className="filter-choices">
                        <button type="button" className={!reviews ? 'active' : ''} onClick={() => writeFilters({ reviews: '' })}>All</button>
                        <button type="button" className={reviews === 'yes' ? 'active' : ''} onClick={() => writeFilters({ reviews: 'yes' })}>Has reviews</button>
                        <button type="button" className={reviews === 'no' ? 'active' : ''} onClick={() => writeFilters({ reviews: 'no' })}>No reviews</button>
                    </div>
                </div>
            )}
        </form>
    )
}

export default Search
