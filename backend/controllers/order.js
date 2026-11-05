const Order = require('../models/order');
const Product = require('../models/product');
const sendEmail = require('../utils/sendEmail');
const { buildReceipt, receiptHtml } = require('../utils/receipt');
const { paidAtMatch } = require('../utils/dateRange');



// Create a new order   =>  /api/v1/order/new
exports.newOrder = async (req, res, next) => {
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo

    } = req.body;

    const items = Array.isArray(orderItems) ? orderItems : []
    for (const item of items) {
        const product = await Product.findById(item.product)
        if (!product || product.deletedAt || product.status !== 'approved' || product.listingType === 'trade') {
            return res.status(400).json({
                success: false,
                message: 'That item is not for sale'
            })
        }
        const qty = Number(item.quantity) || 0
        if (qty < 1) {
            return res.status(400).json({ success: false, message: 'Quantity has to be at least 1' })
        }
        if (item.size && product.sizes?.length) {
            const size = product.sizes.find(entry => entry.label === item.size)
            if (!size || Number(size.stock) < qty) {
                return res.status(400).json({
                    success: false,
                    message: `${product.name} does not have enough left in that size`
                })
            }
        } else if (Number(product.stock) < qty) {
            return res.status(400).json({
                success: false,
                message: `${product.name} does not have enough left`
            })
        }
    }

    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentInfo,
        paidAt: Date.now(),
        user: req.user._id
    })

    for (const item of items) {
        await updateStock(item.product, item.quantity, item.size)
    }

    res.status(200).json({
        success: true,
        order
    })
}

exports.myOrders = async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1, _id: -1 })
    // console.log(req.user)
    res.status(200).json({
        success: true,
        orders
    })
}

exports.getSingleOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
        res.status(404).json({
            message: 'No Order found with this ID',

        })
    }
    res.status(200).json({
        success: true,
        order
    })
}

exports.allOrders = async (req, res, next) => {
    const orders = await Order.find({
        deletedAt: req.query.deleted === '1' ? { $ne: null } : null
    }).sort({ createdAt: -1, _id: -1 })
    // console.log(orders)
    let totalAmount = 0;

    orders.forEach(order => {

        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
}

exports.deleteOrder = async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, deletedAt: null })
    if (!order) {
        return res.status(400).json({ message: 'No Order found with this ID' })
    }
    order.deletedAt = new Date()
    await order.save()
    return res.status(200).json({ success: true })
}

exports.restoreOrders = async (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Number.isFinite) : []
    if (!ids.length) return res.status(400).json({ success: false, message: 'Select at least one order' })
    await Order.updateMany({ _id: { $in: ids }, deletedAt: { $ne: null } }, { deletedAt: null })
    return res.status(200).json({ success: true })
}

exports.deleteOrders = async (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Number.isFinite) : []
    if (!ids.length) return res.status(400).json({ success: false, message: 'Select at least one order' })
    await Order.updateMany({ _id: { $in: ids }, deletedAt: null }, { deletedAt: new Date() })
    return res.status(200).json({ success: true })
}

exports.updateOrder = async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email')
    if (!order) {
        return res.status(404).json({ message: 'No Order found with this ID' })
    }
    if (order.orderStatus === 'Delivered') {
        return res.status(400).json({
            message: 'You have already delivered this order',
        })
    }

    const status = req.body.status
    if (!status) {
        return res.status(400).json({ message: 'Choose an order status' })
    }
    if (status === 'Delivered') {
        order.deliveredAt = Date.now()
    }

    order.orderStatus = status
    await order.save()

    let emailSent = false
    let emailError = ''
    const customer = order.user
    if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        emailError = 'SMTP is not configured on the server'
    } else if (!customer || !customer.email) {
        emailError = 'Order has no customer email'
    } else {
        try {
            const pdf = await buildReceipt(order)
            await sendEmail({
                email: customer.email,
                subject: `J-Trade order ${order.code || `JO${order._id}`} is ${order.orderStatus}`,
                html: receiptHtml(order),
                attachments: [{
                    filename: `${order.code || `JO${order._id}`}-receipt.pdf`,
                    content: pdf,
                    contentType: 'application/pdf'
                }]
            })
            emailSent = true
        } catch (error) {
            emailError = error.message || 'Email failed'
            console.log('Order email failed:', emailError)
        }
    }

    res.status(200).json({
        success: true,
        emailSent,
        emailError: emailSent ? '' : emailError
    })
}

async function updateStock(id, quantity, sizeLabel) {
    const product = await Product.findById(id)
    if (!product) return
    const qty = Number(quantity) || 0
    if (qty < 1) return
    if (sizeLabel && product.sizes?.length) {
        const size = product.sizes.find(entry => entry.label === sizeLabel)
        if (size) {
            size.stock = Math.max(0, Number(size.stock || 0) - qty)
            product.markModified('sizes')
        }
        product.stock = product.sizes.reduce((sum, entry) => sum + Number(entry.stock || 0), 0)
    } else {
        product.stock = Math.max(0, Number(product.stock || 0) - qty)
    }
    await product.save({ validateBeforeSave: false })
}

exports.totalOrders = async (req, res, next) => {
    const totalOrders = await Order.aggregate([
        {
            $group: {
                _id: null,
                count: { $sum: 1 }
            }
        }
    ])
    if (!totalOrders) {
        return res.status(404).json({
            message: 'error total orders',
        })
    }
    res.status(200).json({
        success: true,
        totalOrders
    })

}

exports.totalSales = async (req, res, next) => {
    const totalSales = await Order.aggregate([
        {
            $group: {
                _id: null,
                totalSales: { $sum: "$totalPrice" }
            }
        }
    ])
    if (!totalSales) {
        return res.status(404).json({
            message: 'error total sales',
        })
    }
    res.status(200).json({
        success: true,
        totalSales
    })
}

exports.customerSales = async (req, res, next) => {
    const match = paidAtMatch(req.query)
    const customerSales = await Order.aggregate([
        ...(match ? [match] : []),
        {
            $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userDetails'
            },
        },
        // {
        //     $group: {
        //         _id: "$user",
        //         total: { $sum: "$totalPrice" },
        //     }
        // },

        { $unwind: "$userDetails" },
        {
            $group: {
                _id: "$user",
                total: { $sum: "$totalPrice" },
                doc: { "$first": "$$ROOT" },

            }
        },

        {
            $replaceRoot: {
                newRoot: { $mergeObjects: [{ total: '$total' }, '$doc'] },
            },
        },
        // {
        //     $group: {
        //         _id: "$userDetails.name",
        //         total: { $sum: "$totalPrice" }
        //     }
        // },
        {
            $project: {
                _id: 0,
                "userDetails.name": 1,
                total: 1,
            }
        },
        { $sort: { total: -1 } },

    ])
    if (!customerSales) {
        return res.status(404).json({
            message: 'error customer sales',
        })


    }
    // return console.log(customerSales)
    res.status(200).json({
        success: true,
        customerSales
    })

}

exports.salesPerMonth = async (req, res) => {
    const match = paidAtMatch(req.query)
    const grouped = await Order.aggregate([
        ...(match ? [match] : []),
        {
            $group: {
                _id: {
                    year: { $year: '$paidAt' },
                    month: { $month: '$paidAt' }
                },
                total: { $sum: '$totalPrice' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    if (!grouped.length) {
        return res.status(200).json({ success: true, salesPerMonth: [] })
    }
    const start = req.query.start ? new Date(req.query.start) : new Date(grouped[0]._id.year, grouped[0]._id.month - 1, 1)
    const end = req.query.end ? new Date(req.query.end) : new Date()
    const totals = new Map(grouped.map(item => [`${item._id.year}-${item._id.month}`, item.total]))
    const salesPerMonth = []
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
    const last = new Date(end.getFullYear(), end.getMonth(), 1)
    while (cursor <= last) {
        const key = `${cursor.getFullYear()}-${cursor.getMonth() + 1}`
        salesPerMonth.push({
            month: `${names[cursor.getMonth()]} ${cursor.getFullYear()}`,
            total: totals.get(key) || 0
        })
        cursor.setMonth(cursor.getMonth() + 1)
    }
    return res.status(200).json({ success: true, salesPerMonth })
}