const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

const User = require('./models/user')
const Product = require('./models/product')
const Order = require('./models/order')
const { Counter, nextNumber } = require('./models/counter')

dotenv.config({ path: path.join(__dirname, 'config', '.env') })

const avatar = (name) => ({
    public_id: `seed-avatar-${name}`,
    url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111111&color=ffffff&size=256`
})

const photo = (file) => ({
    public_id: file,
    url: `/images/products/${file}.png`
})

const users = [
    { name: 'J Trade Admin', email: 'admin@jtrade.com', password: 'admin123', role: 'admin', avatar: avatar('Admin') },
    { name: 'Maya Cruz', email: 'maya@jtrade.com', password: 'user123', role: 'user', avatar: avatar('Maya Cruz') },
    { name: 'Paolo Reyes', email: 'paolo@jtrade.com', password: 'user123', role: 'user', avatar: avatar('Paolo Reyes') },
    { name: 'Ana Santos', email: 'ana@jtrade.com', password: 'user123', role: 'user', avatar: avatar('Ana Santos') },
    { name: 'Miguel Dela Cruz', email: 'miguel@jtrade.com', password: 'user123', role: 'user', avatar: avatar('Miguel Cruz') }
]

const catalog = require('./catalog.json')

const products = catalog.map(item => ({
    name: item.name,
    price: item.price,
    description: item.description,
    category: item.category,
    seller: item.seller,
    stock: item.stock,
    sizes: item.sizes,
    images: item.images.map(file => photo(file))
}))

const addresses = {
    maya: { address: '18 Mabini Street', city: 'Manila', phoneNo: '09171234567', postalCode: '1000', country: 'Philippines' },
    paolo: { address: '42 Katipunan Avenue', city: 'Quezon City', phoneNo: '09181234567', postalCode: '1108', country: 'Philippines' },
    ana: { address: '9 Colon Street', city: 'Cebu City', phoneNo: '09191234567', postalCode: '6000', country: 'Philippines' },
    miguel: { address: '27 Roxas Avenue', city: 'Davao City', phoneNo: '09201234567', postalCode: '8000', country: 'Philippines' }
}

const connectDatabase = async () => {
    if (!process.env.DB_URI) {
        console.log('Could not find DB_URI.')
        console.log('Create backend/config/.env first, then run this again.')
        process.exit(1)
    }
    await mongoose.connect(process.env.DB_URI)
}

const importData = async () => {
    await connectDatabase()

    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()
    await Counter.deleteMany()

    const createdUsers = await User.create(users)
    const admin = createdUsers[0]
    const shoppers = {
        maya: createdUsers[1],
        paolo: createdUsers[2],
        ana: createdUsers[3],
        miguel: createdUsers[4]
    }

    const createdProducts = await Product.create(
        products.map(item => ({
            ...item,
            user: admin._id,
            listingType: 'shop',
            status: 'approved',
            ratings: 0,
            numOfReviews: 0,
            reviews: []
        }))
    )

    const byName = Object.fromEntries(createdProducts.map(item => [item.name, item]))
    const taxRate = 0.12

    const makeOrder = (shopperKey, lines, status, paidAt) => {
        const orderItems = lines.map(([name, quantity]) => {
            const item = byName[name]
            return {
                name: item.name,
                quantity,
                image: item.images[0].url,
                price: item.price,
                product: item._id
            }
        })
        const itemsPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const taxPrice = Number((itemsPrice * taxRate).toFixed(2))
        const shipping = itemsPrice > 1000 ? 0 : 80
        const totalPrice = Number((itemsPrice + taxPrice + shipping).toFixed(2))

        return {
            shippingInfo: addresses[shopperKey],
            user: shoppers[shopperKey]._id,
            orderItems,
            paymentInfo: { id: 'seed-payment', status: 'succeeded' },
            paidAt,
            itemsPrice,
            taxPrice,
            shippingPrice: shipping,
            totalPrice,
            orderStatus: status,
            deliveredAt: status === 'Delivered' ? paidAt : undefined,
            createdAt: paidAt
        }
    }

    const shoes = createdProducts.filter(item => item.category === 'Shoes')
    const clothes = createdProducts.filter(item => item.category === 'Clothes')
    const accessories = createdProducts.filter(item => item.category === 'Accessories')

    const reviewLines = [
        ['maya', shoes[0], 5, 'Delivered and looks good. True to size.'],
        ['paolo', shoes[0], 4, 'Nice pair. The color is a bit darker than the photos.'],
        ['ana', shoes[0], 5, 'Wore these all day. No break-in needed.'],
        ['miguel', shoes[0], 3, 'Looks clean, but the sole is stiffer than I wanted.'],
        ['maya', shoes[4], 5, 'Best shoes I ordered here. Leather looks better in person.'],
        ['paolo', shoes[4], 4, 'Fits my usual size. Laces are a little short.'],
        ['ana', shoes[4], 5, 'Exactly like the photos. Will order again.'],
        ['miguel', shoes[4], 2, 'Runs narrow. Had to return the feeling, not the pair.'],
        ['maya', shoes[6], 4, 'Light on foot. Good for walking around.'],
        ['paolo', shoes[6], 5, 'Court shoes, very light. My new daily pair.'],
        ['ana', shoes[6], 2, 'Heavier than I thought and the tongue slides.'],
        ['miguel', shoes[7], 5, 'Better than the pair I tried in the store.'],
        ['maya', shoes[7], 4, 'Comfortable, but the box arrived a little crushed.'],
        ['paolo', shoes[9], 3, 'Squeaks on tile. Still looks good.'],
        ['ana', shoes[9], 4, 'Nice daily pair. Took two days to soften up.'],
        ['miguel', shoes[9], 5, 'Color is loud in a good way.'],
        ['maya', shoes[10], 5, 'True to the photos and the size chart.'],
        ['paolo', shoes[11], 1, 'Too small even in my normal size.'],
        ['ana', shoes[11], 4, 'Fits well once I went with my usual size.'],
        ['miguel', shoes[12], 3, 'Average. Nothing special, but it is fine.'],
        ['maya', shoes[14], 5, 'Exactly the Jordan look I wanted.'],
        ['paolo', shoes[14], 4, 'Solid pair. Heel is a bit stiff at first.'],
        ['ana', shoes[16], 5, 'Comfortable from morning until evening.'],
        ['miguel', shoes[16], 4, 'Looks good with jeans. Grip is decent.'],
        ['maya', shoes[18], 2, 'Color is off compared with the listing.'],
        ['paolo', shoes[19], 4, 'Clean shape. Would recommend for the price.'],
        ['ana', shoes[20], 3, 'Okay shoes. The insole is thin.'],
        ['miguel', shoes[22], 5, 'Favorite pair in my orders so far.'],
        ['maya', clothes[0], 4, 'Good quality. Shipping was fast.'],
        ['paolo', clothes[0], 5, 'Fabric is soft and it did not shrink.'],
        ['ana', clothes[0], 5, 'Fits well and the fabric is comfortable.'],
        ['miguel', clothes[0], 4, 'True to size. Wore it the day it arrived.'],
        ['maya', clothes[1], 5, 'Shorts fit perfectly. Waistband stays put.'],
        ['paolo', clothes[1], 3, 'A bit long on me, still usable.'],
        ['ana', clothes[4], 4, 'Nice shorts for training. Dries fast.'],
        ['miguel', clothes[4], 5, 'Shorts fit true. Ordering another color.'],
        ['maya', clothes[4], 5, 'Lightweight and the pockets are useful.'],
        ['paolo', clothes[5], 4, 'Breathable. Color matches the photo.'],
        ['ana', clothes[6], 5, 'Love this jacket. Zipper is solid.'],
        ['miguel', clothes[6], 4, 'Warm enough for a cold room.'],
        ['maya', clothes[8], 4, 'Jacket looks sharp. Sleeves are the right length.'],
        ['paolo', clothes[8], 5, 'Best jacket I have from this shop.'],
        ['ana', clothes[8], 2, 'Runs large. I should have checked the size notes.'],
        ['miguel', clothes[9], 3, 'Color faded a little after one wash.'],
        ['maya', clothes[11], 4, 'Top is soft and light.'],
        ['paolo', clothes[12], 2, 'Fabric feels thinner than the price.'],
        ['ana', clothes[14], 5, 'Would buy this top again.'],
        ['miguel', clothes[15], 4, 'Good for training. No loose threads.'],
        ['maya', clothes[18], 5, 'Fits the way the photos show.'],
        ['paolo', clothes[20], 4, 'Fine for everyday. Nothing to complain about.'],
        ['ana', clothes[22], 3, 'Okay top. The collar sits a little high.'],
        ['miguel', clothes[24], 1, 'Seam came loose after the first wear.'],
        ['maya', accessories[0], 4, 'Slides are easy to wear around the house.'],
        ['paolo', accessories[0], 2, 'Pinched my toes. Size up if you can.'],
        ['ana', accessories[0], 5, 'Comfortable slides. Strap does not dig in.'],
        ['miguel', accessories[0], 3, 'Okay for the price. A little tight.'],
        ['maya', accessories[4], 5, 'My everyday slides now.'],
        ['paolo', accessories[5], 4, 'Good grip on wet tile.'],
        ['ana', accessories[6], 4, 'Socks are soft and they stay up.'],
        ['miguel', accessories[6], 2, 'Socks ran small. Ankle opening is tight.'],
        ['maya', accessories[8], 4, 'Thick socks. Good with the shoes I bought.'],
        ['paolo', accessories[8], 5, 'No slipping inside the shoe.'],
        ['ana', accessories[10], 5, 'Cap fits well and the brim keeps its shape.'],
        ['miguel', accessories[10], 4, 'Cap is alright. Brim is stiff at first.'],
        ['maya', accessories[12], 3, 'Cap looks clean. Sweatband is thin.'],
        ['paolo', accessories[14], 5, 'Exactly the cap I was looking for.'],
        ['ana', accessories[16], 4, 'Nice color. Sits well on my head.'],
        ['miguel', accessories[18], 1, 'Strap broke after two weeks.']
    ]

    const deliveredDates = {
        maya: '2026-01-18',
        paolo: '2026-02-09',
        ana: '2026-03-12',
        miguel: '2026-04-04'
    }

    const deliveredOrders = ['maya', 'paolo', 'ana', 'miguel'].map(shopper => makeOrder(
        shopper,
        reviewLines.filter(line => line[0] === shopper).map(([, product]) => [product.name, 1]),
        'Delivered',
        new Date(deliveredDates[shopper])
    ))

    await Order.create([
        ...deliveredOrders,
        makeOrder('paolo', [[shoes[2].name, 1], [accessories[1].name, 1]], 'Shipped', new Date('2026-06-16')),
        makeOrder('ana', [[clothes[2].name, 1]], 'Shipped', new Date('2026-07-08')),
        makeOrder('miguel', [[shoes[3].name, 1]], 'Shipped', new Date('2026-08-19')),
        makeOrder('maya', [[accessories[2].name, 1]], 'Processing', new Date('2026-09-11')),
        makeOrder('paolo', [[clothes[3].name, 1]], 'Processing', new Date('2026-10-02'))
    ])

    for (const [shopperKey, product, rating, comment] of reviewLines) {
        const person = shoppers[shopperKey]
        product.reviews.push({
            _id: await nextNumber('review'),
            user: person._id,
            name: person.name,
            rating,
            comment
        })
    }

    const reviewedProducts = [...new Set(reviewLines.map(([, product]) => product))]
    for (const product of reviewedProducts) {
        product.numOfReviews = product.reviews.length
        product.ratings = product.reviews.reduce((sum, item) => sum + item.rating, 0) / product.reviews.length
        await product.save()
    }

    const shoePhotos = catalog.filter(item => item.category === 'Shoes')
    const offer = (photoIndex, shopperKey, fields) => {
        const person = shoppers[shopperKey]
        const source = shoePhotos[photoIndex]
        const sizes = fields.sizes
        return {
            name: fields.name,
            price: fields.price,
            description: fields.description,
            category: 'Shoes',
            seller: person.name,
            stock: sizes.reduce((sum, size) => sum + size.stock, 0),
            sizes,
            images: source.images.slice(0, 3).map(file => photo(file)),
            user: person._id,
            listingType: fields.listingType,
            status: fields.status,
            offerNote: fields.offerNote || '',
            condition: fields.condition,
            offeredBy: person._id
        }
    }

    const createdOffers = await Product.create([
        offer(4, 'maya', {
            name: 'Maya Cruz Air Jordan 1 Low',
            price: 4500,
            description: 'Lightly worn Air Jordan 1 Low. Good condition, size US 8.',
            listingType: 'sale',
            status: 'pending',
            condition: 'Good',
            sizes: [{ label: 'US 8', stock: 1 }]
        }),
        offer(6, 'paolo', {
            name: 'Paolo Reyes Jordan Spizike',
            price: 0,
            description: 'Used Jordan Spizike, fair condition. Open to a trade.',
            listingType: 'trade',
            status: 'pending',
            condition: 'Fair',
            offerNote: 'Looking for a black Air Jordan 4 in US 9.',
            sizes: [{ label: 'US 9', stock: 1 }]
        }),
        offer(8, 'ana', {
            name: 'Ana Santos Air Jordan 3',
            price: 6200,
            description: 'New Air Jordan 3, still in the box. Size US 7.',
            listingType: 'sale',
            status: 'pending',
            condition: 'New',
            sizes: [{ label: 'US 7', stock: 1 }]
        }),
        offer(10, 'miguel', {
            name: 'Miguel Dela Cruz Jordan 4',
            price: 0,
            description: 'Good Jordan 4. Willing to trade for another pair.',
            listingType: 'trade',
            status: 'pending',
            condition: 'Good',
            offerNote: 'Want a white Air Jordan 1 Low in US 10.',
            sizes: [{ label: 'US 10', stock: 1 }]
        }),
        offer(12, 'maya', {
            name: 'Maya Cruz Air Jordan 4 Retro',
            price: 7800,
            description: 'Approved pair for sale. Good condition, size US 7.5.',
            listingType: 'sale',
            status: 'approved',
            condition: 'Good',
            sizes: [{ label: 'US 7.5', stock: 1 }]
        }),
        offer(14, 'paolo', {
            name: 'Paolo Reyes Air Jordan 1 Mid',
            price: 0,
            description: 'Approved trade offer. Size US 9.',
            listingType: 'trade',
            status: 'approved',
            condition: 'Good',
            offerNote: 'Trade for any clean Jordan slides, US 9.',
            sizes: [{ label: 'US 9', stock: 1 }]
        }),
        offer(16, 'ana', {
            name: 'Ana Santos Jordan Low',
            price: 3000,
            description: 'This sale offer was rejected.',
            listingType: 'sale',
            status: 'rejected',
            condition: 'Fair',
            sizes: [{ label: 'US 6', stock: 1 }]
        }),
        offer(18, 'miguel', {
            name: 'Miguel Dela Cruz Jordan Trade',
            price: 0,
            description: 'This trade offer was rejected.',
            listingType: 'trade',
            status: 'rejected',
            condition: 'Fair',
            offerNote: 'Trade for a club cap.',
            sizes: [{ label: 'US 11', stock: 1 }]
        })
    ])

    console.log('Sample data added.')
    console.log(`${createdProducts.length} products, ${createdOffers.length} offers, ${createdUsers.length} users, ${deliveredOrders.length + 5} orders, ${reviewLines.length} reviews.`)
    console.log('Admin login: admin@jtrade.com / admin123')
    console.log('Shopper logins use password user123')
    console.log('maya@jtrade.com, paolo@jtrade.com, ana@jtrade.com, miguel@jtrade.com')
    process.exit()
}

const destroyData = async () => {
    await connectDatabase()
    await Order.deleteMany()
    await Product.deleteMany()
    await User.deleteMany()
    await Counter.deleteMany()
    console.log('Sample data removed.')
    process.exit()
}

const run = process.argv.includes('-d') ? destroyData : importData

run().catch(error => {
    console.log(error.message)
    process.exit(1)
})
