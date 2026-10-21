const mongoose = require('mongoose')
const { assignNumber } = require('./counter')

const productSchema = new mongoose.Schema({
    _id: Number,
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Please enter product description'],
    },
    ratings: {
        type: Number,
        default: 0
    },

    images: [
        {
            _id: false,
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
        enum: {
            values: [
                'Shoes',
                'Clothes',
                'Accessories'
            ],
            message: 'Please select correct category for product'
        }
    },
    seller: {
        type: String,
        required: [true, 'Please enter product seller']
    },
    stock: {
        type: Number,
        required: [true, 'Please enter product stock'],
        default: 0
    },
    sizes: [
        {
            _id: false,
            label: {
                type: String,
                required: true
            },
            stock: {
                type: Number,
                required: true,
                default: 0
            }
        }
    ],
    listingType: {
        type: String,
        enum: {
            values: ['shop', 'sale', 'trade'],
            message: 'Please select a listing type'
        },
        default: 'shop'
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'approved', 'rejected'],
            message: 'Please select a listing status'
        },
        default: 'approved'
    },
    offerNote: {
        type: String,
        default: ''
    },
    condition: {
        type: String,
        default: ''
    },
    offeredBy: {
        type: Number,
        ref: 'User'
    },
    user: {
        type: Number,
        ref: 'User',

    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            _id: Number,
            user: {
                type: Number,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: Number,
        ref: 'User',

    },
    code: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

productSchema.pre('save', async function () {
    await assignNumber('Product').call(this)
    if (!this.code && typeof this._id === 'number') {
        this.code = `JB${this._id}`
    }
})

module.exports = mongoose.model('Product', productSchema);