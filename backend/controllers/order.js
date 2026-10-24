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

    res.status(200).json({
        success: true,
        order
    })
}

exports.myOrders = async (req, res, next) => {
    const orders = await Order.find({ user: req.user.id })
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
        for (const item of order.orderItems) {
            await updateStock(item.product, item.quantity)
        }
        order.deliveredAt = Date.now()
    }

    order.orderStatus = status
    await order.save()

    let emailSent = false
    const customer = order.user
    if (customer && customer.email && process.env.SMTP_HOST) {
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
            console.log(error.message)
        }
    }

    res.status(200).json({
        success: true,
        emailSent
    })
}

async function updateStock(id, quantity) {
    const product = await Product.findById(id);
    product.stock = product.stock - quantity;

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