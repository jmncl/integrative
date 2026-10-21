const Product = require('../models/product')
const { nextNumber } = require('../models/counter')
const Order = require('../models/order')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary')
const APIFeatures = require('../utils/apiFeatures');
const Filter = require('bad-words');
const { paidAtMatch } = require('../utils/dateRange');
const wordFilter = new Filter();

const shopVisible = {
    $or: [
        { status: 'approved' },
        { status: { $exists: false } },
        { status: null }
    ]
}

const viewerFromCookie = async (req) => {
    try {
        const token = req.cookies && req.cookies.token
        if (!token) return null
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        return await User.findById(decoded.id)
    } catch (error) {
        return null
    }
}

const uploadImages = async (images) => {
    const links = []
    const list = Array.isArray(images) ? images : (images ? [images] : [])
    for (const item of list) {
        if (!item) continue
        if (typeof item === 'object' && item.url && item.public_id) {
            links.push({ public_id: item.public_id, url: item.url })
            continue
        }
        const result = await cloudinary.v2.uploader.upload(item, {
            folder: 'products',
            width: 800,
            crop: "scale",
        })
        links.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }
    return links
}

const cleanSizes = (sizes, fallbackStock) => {
    const list = Array.isArray(sizes) ? sizes : []
    const cleaned = list.map(size => ({
        label: String(size.label || '').trim(),
        stock: Number(size.stock)
    })).filter(size => size.label && Number.isFinite(size.stock) && size.stock >= 0)
    if (cleaned.length) return cleaned
    return [{ label: 'One size', stock: Number.isFinite(fallbackStock) ? fallbackStock : 0 }]
}

const productError = (error) => {
    if (error.name === 'ValidationError') {
        return Object.values(error.errors).map(item => item.message).join(' ')
    }
    return error.message || 'Could not save the product'
}

exports.newProduct = async (req, res) => {
    try {
        const price = Number(req.body.price)
        const stock = Number(req.body.stock)
        if (!Number.isFinite(price) || price <= 0) {
            return res.status(400).json({ success: false, message: 'Price has to be a number' })
        }
        if (!Number.isFinite(stock) || stock < 0) {
            return res.status(400).json({ success: false, message: 'Stock has to be a number' })
        }
        const images = await uploadImages(req.body.images)
        if (!images.length) {
            return res.status(400).json({ success: false, message: 'Please add at least one photo' })
        }
        const sizes = cleanSizes(req.body.sizes, stock)
        req.body.price = price
        req.body.stock = sizes.reduce((sum, size) => sum + size.stock, 0)
        req.body.sizes = sizes
        req.body.images = images
        req.body.user = req.user.id
        req.body.listingType = 'shop'
        req.body.status = 'approved'
        req.body.offerNote = ''
        req.body.condition = ''
        delete req.body.offeredBy
        const product = await Product.create(req.body)
        return res.status(201).json({
            success: true,
            product
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: productError(error)
        })
    }
}

exports.getProducts = async (req, res) => {

    const resPerPage = 8;
    const productsCount = await Product.countDocuments(shopVisible);

    // const products = await Product.find()
    const apiFeatures = new APIFeatures(Product.find(shopVisible), req.query).search().filter()
    const filteredProductsCount = await apiFeatures.query.clone().countDocuments()
    apiFeatures.pagination(resPerPage);
    const products = await apiFeatures.query;

    if (!products)
        return res.status(400).json({ message: 'error loading products' })
    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        resPerPage,
        productsCount,

    })
    // if (!products)
    //     return res.status(400).json({ message: 'error loading products' })

    // return res.status(200).json({
    //     success: true,
    //     products,
    //     resPerPage,
    //     productsCount,

    // })
}

exports.getSingleProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    if (product.status !== 'approved') {
        const viewer = await viewerFromCookie(req)
        const isOwner = viewer && product.offeredBy != null && String(viewer._id) === String(product.offeredBy)
        const isAdmin = viewer && viewer.role === 'admin'
        if (!isOwner && !isAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }
    }
    const viewer = await viewerFromCookie(req)
    let canReview = false
    let myReview = null
    if (viewer && viewer.role !== 'admin') {
        const bought = await Order.findOne({
            user: viewer._id,
            orderStatus: 'Delivered',
            'orderItems.product': product._id
        })
        canReview = Boolean(bought)
        myReview = product.reviews.find(item => String(item.user) === String(viewer._id)) || null
    }
    return res.status(200).json({
        success: true,
        product,
        canReview,
        myReview
    })
}

exports.getAdminProducts = async (req, res, next) => {

    const products = await Product.find({
        $nor: [
            { listingType: { $in: ['sale', 'trade'] }, status: { $in: ['pending', 'rejected'] } }
        ]
    })
    if (!products) {
        return res.status(404).json({
            success: false,
            message: 'Products not found'
        })
    }
    return res.status(200).json({
        success: true,
        products
    })

}
exports.updateProduct = async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    // console.log(req.body)
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }
    try {
        if (req.body.images) {
            const images = await uploadImages(req.body.images)
            if (!images.length) {
                return res.status(400).json({ success: false, message: 'Please add at least one photo' })
            }
            req.body.images = images
        }
        if (req.body.price !== undefined) {
            const price = Number(req.body.price)
            const isTrade = product.listingType === 'trade'
            if (!Number.isFinite(price) || price < 0 || (!isTrade && price <= 0)) {
                return res.status(400).json({ success: false, message: 'Price has to be a number' })
            }
            req.body.price = price
        }
        delete req.body.listingType
        delete req.body.status
        delete req.body.offeredBy
        delete req.body.offerNote
        delete req.body.condition
        if (req.body.sizes || req.body.stock !== undefined) {
            const stock = Number(req.body.stock)
            const sizes = cleanSizes(req.body.sizes, Number.isFinite(stock) ? stock : product.stock)
            req.body.sizes = sizes
            req.body.stock = sizes.reduce((sum, size) => sum + size.stock, 0)
        }
        product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            useFindandModify: false
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: productError(error)
        })
    }
    // console.log(product)
    return res.status(200).json({
        success: true,
        product
    })
}

exports.deleteProducts = async (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Number.isFinite) : []
    if (!ids.length) {
        return res.status(400).json({ success: false, message: 'Select at least one product' })
    }
    await Product.deleteMany({ _id: { $in: ids } })
    return res.status(200).json({ success: true, message: 'Products deleted' })
}

exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        })
    }

    return res.status(200).json({
        success: true,
        message: 'Product deleted'
    })
}

exports.createProductReview = async (req, res) => {
    try {
        if (!req.user || req.user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Admins do not review as customers' })
        }
        const rating = Number(req.body.rating)
        const comment = String(req.body.comment || '').trim()
        const productId = Number(req.body.productId)
        if (!comment || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Choose 1 to 5 stars and write a review' })
        }
        const product = await Product.findById(productId)
        if (!product || product.status !== 'approved') {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }
        const bought = await Order.findOne({
            user: req.user._id,
            orderStatus: 'Delivered',
            'orderItems.product': productId
        })
        if (!bought) {
            return res.status(403).json({ success: false, message: 'You can review this after the order is delivered' })
        }
        const existing = product.reviews.find(item => String(item.user) === String(req.user._id))
        if (existing) {
            existing.comment = comment
            existing.rating = rating
            existing.name = req.user.name
        } else {
            product.reviews.push({
                _id: await nextNumber('review'),
                user: req.user._id,
                name: req.user.name,
                rating,
                comment
            })
        }
        product.numOfReviews = product.reviews.length
        product.ratings = product.reviews.reduce((sum, item) => sum + Number(item.rating), 0) / product.reviews.length
        await product.save({ validateBeforeSave: false })
        return res.status(200).json({ success: true })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Could not save the review' })
    }
}

exports.getProductReviews = async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' })
    }
    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
}

exports.getAdminReviews = async (req, res) => {
    const products = await Product.find({ 'reviews.0': { $exists: true } }).select('name code images reviews')
    const userIds = [...new Set(products.flatMap(product => product.reviews.map(review => review.user)))]
    const users = await User.find({ _id: { $in: userIds } }).select('name avatar')
    const byUser = Object.fromEntries(users.map(person => [String(person._id), person]))
    const reviews = products.flatMap(product => product.reviews.map(review => {
        const person = byUser[String(review.user)]
        return {
            _id: review._id,
            rating: review.rating,
            comment: review.comment,
            user: review.user,
            name: person?.name || review.name,
            avatar: person?.avatar?.url || '',
            product: product._id,
            productName: product.name,
            productCode: product.code || `JB${product._id}`,
            productImage: product.images?.[0]?.url || ''
        }
    }))
    res.status(200).json({ success: true, reviews })
}

exports.deleteReview = async (req, res, next) => {
    console.log(req.query)
    const product = await Product.findById(req.query.productId);
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());
    const numOfReviews = reviews.length;

    const ratings = numOfReviews
        ? reviews.reduce((acc, item) => acc + Number(item.rating), 0) / numOfReviews
        : 0

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    return res.status(200).json({
        success: true
    })
}

exports.productSales = async (req, res, next) => {
    // SELECT product.name,sum(price * quantity) as total
    // FROM order
    // GROUP BY product_id
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$itemsPrice" }

            },

        },
    ])
    // console.log(totalSales)
    const sales = await Order.aggregate([
        { $project: { _id: 0, "orderItems": 1, totalPrice: true } },
        { $unwind: "$orderItems" },

        {
            $group: {
                _id: { product: "$orderItems.name" },
                total: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
            },
        },
    ])
    console.log(sales)

    if (!totalSales.length || !totalSales[0].total) {
        return res.status(200).json({
            success: true,
            totalPercentage: [],
            sales: sales || [],
            totalSales
        })
    }

    let totalPercentage = {}
    totalPercentage = sales.map(item => {

        // console.log( ((item.total/totalSales[0].total) * 100).toFixed(2))
        percent = Number(((item.total / totalSales[0].total) * 100).toFixed(2))
        total = {
            name: item._id.product,
            percent
        }
        return total
    })
    console.log(totalPercentage)
    res.status(200).json({
        success: true,
        totalPercentage,
        sales,
        totalSales
    })

}

const offerConditions = ['New', 'Good', 'Fair']

exports.newOffer = async (req, res) => {
    try {
        if (!req.user || req.user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Admins do not sell as customers' })
        }
        const listingType = req.body.listingType === 'trade' ? 'trade' : (req.body.listingType === 'sale' ? 'sale' : '')
        if (!listingType) {
            return res.status(400).json({ success: false, message: 'Choose for sale or for trade' })
        }
        const name = String(req.body.name || '').trim()
        const description = String(req.body.description || '').trim()
        const condition = String(req.body.condition || '').trim()
        const seller = String(req.body.seller || req.user.name || '').trim()
        const offerNote = String(req.body.offerNote || '').trim()
        if (!name || !description) {
            return res.status(400).json({ success: false, message: 'Please enter a name and description' })
        }
        if (!offerConditions.includes(condition)) {
            return res.status(400).json({ success: false, message: 'Choose a condition: New, Good, or Fair' })
        }
        if (!seller) {
            return res.status(400).json({ success: false, message: 'Please enter your name' })
        }
        const price = Number(req.body.price)
        if (listingType === 'sale') {
            if (!Number.isFinite(price) || price <= 0) {
                return res.status(400).json({ success: false, message: 'Sale price has to be more than 0' })
            }
        } else {
            if (!offerNote) {
                return res.status(400).json({ success: false, message: 'Tell buyers what you want in trade' })
            }
            if (offerNote.length > 500) {
                return res.status(400).json({ success: false, message: 'Trade note is too long' })
            }
            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({ success: false, message: 'Suggested value has to be a number' })
            }
        }
        const incoming = Array.isArray(req.body.images) ? req.body.images.slice(0, 6) : req.body.images
        const images = await uploadImages(incoming)
        if (!images.length) {
            return res.status(400).json({ success: false, message: 'Please add at least one photo' })
        }
        const sizes = cleanSizes(req.body.sizes, 1)
        const stock = sizes.reduce((sum, size) => sum + size.stock, 0)
        if (!stock) {
            return res.status(400).json({ success: false, message: 'Enter how many you have' })
        }
        const product = await Product.create({
            name,
            price,
            description,
            category: 'Shoes',
            seller,
            sizes,
            stock,
            images,
            user: req.user._id,
            listingType,
            status: 'pending',
            offerNote: listingType === 'trade' ? offerNote : '',
            condition,
            offeredBy: req.user._id
        })
        return res.status(201).json({
            success: true,
            product
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: productError(error)
        })
    }
}

exports.myOffers = async (req, res) => {
    try {
        if (!req.user || req.user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Admins do not sell as customers' })
        }
        const offers = await Product.find({ offeredBy: req.user._id }).sort({ createdAt: -1 })
        return res.status(200).json({
            success: true,
            offers
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: productError(error)
        })
    }
}

exports.getPendingOffers = async (req, res) => {
    try {
        const offers = await Product.find({
            status: 'pending',
            listingType: { $in: ['sale', 'trade'] }
        }).populate('offeredBy', 'name email').sort({ createdAt: -1 })
        return res.status(200).json({
            success: true,
            offers
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: productError(error)
        })
    }
}

exports.reviewOffer = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if (!product || (product.listingType !== 'sale' && product.listingType !== 'trade')) {
            return res.status(404).json({ success: false, message: 'Offer not found' })
        }
        if (product.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'This offer is not waiting for review' })
        }
        const status = req.body.status
        if (status !== 'approved' && status !== 'rejected') {
            return res.status(400).json({ success: false, message: 'Choose approve or reject' })
        }
        product.status = status
        if (status === 'approved') {
            product.category = 'Shoes'
            if (!product.sizes || !product.sizes.length) {
                product.sizes = [{ label: 'One size', stock: Math.max(Number(product.stock) || 0, 1) }]
            }
            product.stock = product.sizes.reduce((sum, size) => sum + Number(size.stock || 0), 0)
        }
        await product.save()
        return res.status(200).json({
            success: true,
            product
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: productError(error)
        })
    }
}