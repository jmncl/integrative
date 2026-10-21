const path = require('path')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

const User = require('./models/user')
const Product = require('./models/product')
const Order = require('./models/order')
const { Counter } = require('./models/counter')

dotenv.config({ path: path.join(__dirname, 'config', '.env') })

const avatar = (name) => ({
    public_id: `seed-avatar-${name}`,
    url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111111&color=ffffff&size=256`
})

const photo = (file) => ({
    public_id: file,
    url: `/images/products/${file}.png`
})

const shoppers = [
    'Jerome Aguila', 'Marcus Aristain', 'Regan Asino', 'Kyla Baguis', 'Vincent Barliso',
    'Nico Barredo', 'Emman Bayani', 'Alwin Benitez', 'Ericksson Brutas', 'Jonel Caisip',
    'Ybrahim Calvo', 'Miguel Co', 'Joseph Coronado', 'Julia Datang', 'Benjamin De Leon',
    'Ronzhem Dioso', 'Charlie Estanes', 'Lance Haboc', 'John Lleagado', 'Mervin Maik',
    'Yunice Matabile', 'Trisha Morales', 'Sedriel Navasca', 'Allysa Ocampo', 'Ardee Orlanda',
    'Rick Pabalan', 'Sherwin Padilla', 'Ayessa Pili', 'Joshua Pitogo', 'Kim Rebamba',
    'Kelly Roduta', 'Tim Tan', 'JM Tianzon', 'Gean Valdez'
]

const admins = [
    'Tim Tan', 'JM Tianzon'
]

const sellerNames = [
    'Nico Barredo', 'Jerome Aguila', 'Jonel Caisip', 'Marcus Aristain',
    'Miguel Co', 'Joseph Coronado', 'Regan Asino', 'User'
]

const mail = (name) => `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@jtrade.com`

const restShoppers = shoppers.filter(name => !admins.includes(name))

const users = [
    { name: 'J Trade Admin', email: 'admin@jtrade.com', password: 'admin123', role: 'admin', avatar: avatar('Admin') },
    { name: 'User', email: 'user@jtrade.com', password: 'user123', role: 'user', avatar: avatar('User') },
    ...admins.map(name => ({
        name,
        email: mail(name),
        password: 'admin123',
        role: 'admin',
        avatar: avatar(name)
    })),
    ...restShoppers.map(name => ({
        name,
        email: mail(name),
        password: 'user123',
        role: 'user',
        avatar: avatar(name)
    }))
].map((person, index) => ({ ...person, _id: index + 1 }))

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

const morePlaces = [
    ['88 Ayala Avenue', 'Makati', '1226'],
    ['15 Session Road', 'Baguio City', '2600'],
    ['6 Lacson Street', 'Bacolod', '6100'],
    ['33 J.P. Rizal', 'Marikina', '1800'],
    ['21 Magallanes Street', 'Cebu City', '6000'],
    ['54 Commonwealth Avenue', 'Quezon City', '1121'],
    ['7 P. Burgos Street', 'Iloilo City', '5000'],
    ['19 Quirino Avenue', 'Davao City', '8000'],
    ['40 Taft Avenue', 'Manila', '1004'],
    ['11 Gorordo Avenue', 'Cebu City', '6000']
]

const reviewVoice = {
    shoes: {
        5: {
            lead: ['True to size.', 'Exactly like the photos.', 'Best pair I have ordered here.', 'Wore these straight out of the box.', 'The color is better in person.', 'Light on foot and easy to walk in.'],
            note: ['Leather looks clean and the stitching is even.', 'No break-in, and they stayed comfortable all day.', 'Grip is solid and the tongue stays put.', 'The shape matches the listing.', 'Laces and eyelets feel sturdy.', 'They work on the court and with jeans.'],
            end: ['Would buy this colorway again.', 'The box arrived in good shape.', 'Shipping was faster than I expected.', 'Already recommending this pair.']
        },
        4: {
            lead: ['Good pair for the price.', 'Fits my usual size.', 'Looks close to the photos.', 'Comfortable after a short walk.', 'Clean shape and a solid daily shoe.', 'Happy with the order.'],
            note: ['The heel is a little stiff on the first day.', 'Laces are slightly short, but they work.', 'Color is a bit darker than the photos.', 'Insole is thin, and the upper is nice.', 'Took one afternoon to soften up.', 'Grip is decent on tile and court.'],
            end: ['Still a pair I would order again.', 'Packaging was fine.', 'Worth it once they break in.', 'Would get another color.']
        },
        3: {
            lead: ['They are fine, nothing special.', 'Average pair for the price.', 'Looks okay once they are on.', 'Usable, but not my favorite.', 'The photos set a higher bar.', 'Decent beater shoes.'],
            note: ['The sole is stiffer than I wanted.', 'They squeak a little on tile.', 'The insole feels thin after a few hours.', 'Fit is acceptable in my normal size.', 'Materials are plain up close.', 'Comfort is average for all-day wear.'],
            end: ['I will keep them, but I would not rush to reorder.', 'Shipping was on time.', 'Okay if you just need a clean pair.', 'Expected a bit more at this price.']
        },
        2: {
            lead: ['The fit was off for me.', 'Heavier than the listing suggested.', 'Not as described.', 'Disappointed with the feel.', 'Color is off compared with the photos.', 'They run narrow.'],
            note: ['The tongue slides when I walk.', 'Even my usual size felt tight.', 'The sole is stiff and loud.', 'Stitching looks uneven near the toe.', 'They creased hard on the first wear.', 'The insole flattened quickly.'],
            end: ['I would size up or skip this one.', 'The box was a little crushed.', 'Not ordering this colorway again.', 'Quality is below what I hoped.']
        },
        1: {
            lead: ['Too small even in my normal size.', 'Would not order this pair again.', 'Arrived with a problem.', 'Not worth the price for me.', 'The pair did not match the listing.', 'Uncomfortable from the first step.'],
            note: ['One eyelet was loose.', 'The sole started to separate at the toe.', 'They pinched across the top.', 'Color and shape both looked wrong.', 'The insole bunched up.', 'They hurt after a short walk.'],
            end: ['I am sending this feedback so the size notes are clearer.', 'Packaging did not protect the box.', 'I expected a wearable pair.', 'This one missed.']
        }
    },
    shorts: {
        5: {
            lead: ['Shorts fit the way the photos show.', 'Waistband stays put.', 'Light and easy to move in.', 'True to size.', 'Best shorts I have from this shop.', 'Wore them the day they arrived.'],
            note: ['Fabric is soft and it dries fast.', 'Pockets are actually useful.', 'No loose threads.', 'The liner is comfortable.', 'Color matches the photo.', 'They do not ride up when I run.'],
            end: ['Ordering another color.', 'Great for training.', 'Would buy these again.', 'Shipping was quick.']
        },
        4: {
            lead: ['Good training shorts.', 'Comfortable and well made.', 'Close to the photos.', 'Fine for everyday wear.', 'Happy with the fit.', 'Breathable in the heat.'],
            note: ['A little long on me, still usable.', 'The waistband is snug at first.', 'Drawcord is a bit short.', 'Fabric feels light but not cheap.', 'They softened after one wash.', 'Color is slightly darker than the listing.'],
            end: ['Still a solid buy.', 'No shrinking after a wash.', 'I would get them again in another size.', 'Good for the price.']
        },
        3: {
            lead: ['They are okay.', 'Average shorts.', 'Wearable, not exciting.', 'Fit is acceptable.', 'Nothing wrong, nothing great.', 'Fine as a backup pair.'],
            note: ['The fabric is thinner than I expected.', 'Waistband rolls a little.', 'Length is longer than the photo.', 'They cling when I sweat.', 'Stitching is plain.', 'Color faded slightly after one wash.'],
            end: ['I will use them for the gym.', 'Shipping was fine.', 'I expected a bit more.', 'Okay if they are on sale.']
        },
        2: {
            lead: ['The fit was off.', 'Not as described.', 'Shorter than the photos.', 'Disappointed with the fabric.', 'They run small.', 'Uncomfortable at the waist.'],
            note: ['The liner bunches.', 'A seam felt scratchy.', 'They lost shape after one wash.', 'The drawcord slipped out.', 'Color looked dull in person.', 'They ride up when I walk.'],
            end: ['I should have checked the size notes.', 'Not ordering this cut again.', 'Quality is below what I hoped.', 'Would size up next time.']
        },
        1: {
            lead: ['Seam came loose after the first wear.', 'Would not order these again.', 'Arrived with a loose thread that kept going.', 'Not worth the price.', 'The shorts did not survive one workout.', 'Fit was unusable for me.'],
            note: ['The waistband twisted.', 'A pocket seam opened.', 'Fabric pilled immediately.', 'They were see-through in the light.', 'The size was far from the chart.', 'Color bled on the first rinse.'],
            end: ['I expected them to last.', 'Packaging was fine, the shorts were not.', 'Skip this one.', 'This missed badly.']
        }
    },
    jackets: {
        5: {
            lead: ['Jacket looks sharp.', 'Zipper is solid.', 'Best jacket I have from this shop.', 'Fits the photos.', 'Warm without feeling heavy.', 'Sleeves are the right length.'],
            note: ['Pockets sit where I want them.', 'The lining is soft.', 'It layers well over a tee.', 'Stitching is clean.', 'The hood stays in place.', 'Color is rich in person.'],
            end: ['Would buy this again.', 'Arrived ready to wear.', 'Already using it on cool nights.', 'Shipping was careful.']
        },
        4: {
            lead: ['Good jacket.', 'Comfortable and well made.', 'Looks close to the listing.', 'Nice for a cold room.', 'Happy with the cut.', 'Solid everyday layer.'],
            note: ['Sleeves are a touch long.', 'The zipper pull is small.', 'It runs slightly roomy.', 'Fabric is smooth and quiet.', 'Warm enough for air-conditioned rooms.', 'Color is a shade darker than the photo.'],
            end: ['Still recommend it.', 'No loose threads.', 'Worth the price.', 'I would order another color.']
        },
        3: {
            lead: ['It is fine.', 'Average jacket.', 'Wearable, not special.', 'Looks okay on.', 'Nothing to complain about loudly.', 'Decent layer.'],
            note: ['The lining feels thin.', 'Sleeves bunch at the wrist.', 'It wrinkles easily.', 'Pockets are shallow.', 'Not as warm as I hoped.', 'The fit is boxy.'],
            end: ['I will keep it for light weather.', 'Shipping was on time.', 'Expected a bit more.', 'Okay for the price.']
        },
        2: {
            lead: ['Runs large.', 'Not as described.', 'The fit was off.', 'Disappointed with the material.', 'Lighter than the photos suggested.', 'Sleeves are the wrong length.'],
            note: ['I should have checked the size notes.', 'The zipper catches.', 'Seams feel cheap.', 'Color looks flat indoors.', 'The hood is too small.', 'It pilled after one week.'],
            end: ['Not ordering this cut again.', 'Quality is below what I hoped.', 'Would size down.', 'I expected a warmer jacket.']
        },
        1: {
            lead: ['Zipper failed on the second wear.', 'Would not order this jacket again.', 'Arrived with a snag.', 'Not worth the price.', 'The jacket looked used.', 'Fit was unusable.'],
            note: ['A seam opened at the pocket.', 'The lining tore near the arm.', 'Buttons were loose.', 'Color did not match at all.', 'It smelled strongly out of the bag.', 'The size chart was wrong for me.'],
            end: ['I expected it to last the season.', 'Packaging was okay.', 'Skip this one.', 'This one missed.']
        }
    },
    tops: {
        5: {
            lead: ['The top is soft and light.', 'Fits the way the photos show.', 'Would buy this again.', 'True to size.', 'Comfortable all day.', 'Color matches the listing.'],
            note: ['Fabric breathes in the heat.', 'No loose threads.', 'The collar sits right.', 'It did not shrink in the wash.', 'Shoulders fit my usual size.', 'It layers cleanly under a jacket.'],
            end: ['Wore it the day it arrived.', 'Shipping was fast.', 'Already a regular shirt.', 'Great quality.']
        },
        4: {
            lead: ['Good top.', 'Fine for everyday.', 'Happy with this order.', 'Close to the photos.', 'Soft after one wash.', 'Comfortable and well made.'],
            note: ['The collar is a little high.', 'Sleeves are slightly long.', 'Fabric is lighter than I expected.', 'It fits well through the chest.', 'Color is a bit brighter in person.', 'Hem sits where it should.'],
            end: ['Still a good buy.', 'No shrinking.', 'I would get another.', 'Worth the price.']
        },
        3: {
            lead: ['It is okay.', 'Average top.', 'Wearable, nothing special.', 'Fit is acceptable.', 'Fine as a spare shirt.', 'Looks plain up close.'],
            note: ['The collar sits a little high.', 'Fabric feels thinner than the price.', 'It wrinkles fast.', 'Sleeves are tight when I lift my arms.', 'Color faded a little after one wash.', 'Length is shorter than the photo.'],
            end: ['I will wear it around the house.', 'Shipping was fine.', 'Expected a bit more.', 'Okay on sale.']
        },
        2: {
            lead: ['The fit was off.', 'Not as described.', 'Fabric feels thin.', 'Disappointed.', 'It runs small.', 'The cut is odd on me.'],
            note: ['Seam rubbed at the shoulder.', 'The neckline stretched out.', 'It shrank in a cold wash.', 'Color looked gray, not like the photo.', 'Stitching puckered at the hem.', 'It clung in the heat.'],
            end: ['Not ordering this top again.', 'Quality is below what I hoped.', 'I should have sized up.', 'Would skip this one.']
        },
        1: {
            lead: ['A seam opened after the first wear.', 'Would not order this again.', 'Arrived with a hole near the hem.', 'Not worth the price.', 'The shirt did not match the listing.', 'Unwearable for me.'],
            note: ['The collar was twisted.', 'Color bled onto another shirt.', 'Fabric pilled immediately.', 'The size was far off the chart.', 'A print cracked when I unfolded it.', 'It smelled strong out of the pack.'],
            end: ['I expected a basic wearable top.', 'Packaging was fine.', 'Skip this one.', 'This missed.']
        }
    },
    slides: {
        5: {
            lead: ['Comfortable slides.', 'My everyday pair now.', 'Easy to wear around the house.', 'Strap does not dig in.', 'Better than I expected.', 'True to the photos.'],
            note: ['The footbed is soft.', 'Good grip on wet tile.', 'They do not pinch my toes.', 'The strap stays put.', 'Light enough for errands.', 'Color looks clean in person.'],
            end: ['Would buy another pair.', 'Shipping was quick.', 'Already living in these.', 'Great for the price.']
        },
        4: {
            lead: ['Good slides.', 'Comfortable after a day.', 'Close to the photos.', 'Happy with the order.', 'Easy house pair.', 'Solid grip.'],
            note: ['Slightly tight at first.', 'The strap softened after a few wears.', 'Footbed is firmer than I like, still fine.', 'They run a touch small.', 'Color is a bit darker than the photo.', 'They stay on when I walk fast.'],
            end: ['Still recommend them.', 'Size up if you are between sizes.', 'Good buy.', 'I would get them again.']
        },
        3: {
            lead: ['They are okay.', 'Average slides.', 'Fine for quick errands.', 'Nothing special.', 'Usable around the house.', 'Acceptable for the price.'],
            note: ['A little tight across the toes.', 'The strap rubs on long walks.', 'Grip is average on wet tile.', 'Footbed is flat.', 'They look plainer than the photos.', 'They slap when I walk.'],
            end: ['I will keep them as backups.', 'Shipping was on time.', 'Expected a bit more cushion.', 'Okay if you need a spare pair.']
        },
        2: {
            lead: ['Pinched my toes.', 'Not as described.', 'The fit was off.', 'Disappointed.', 'They run small.', 'Uncomfortable past the door.'],
            note: ['Size up if you can.', 'The strap digs in.', 'Footbed is hard.', 'They slip on tile.', 'Color looked cheap in person.', 'One strap sits crooked.'],
            end: ['Not my everyday slides.', 'Quality is below what I hoped.', 'I would not reorder this style.', 'Skip if you need all-day comfort.']
        },
        1: {
            lead: ['The strap broke after two weeks.', 'Would not order these again.', 'Arrived with a split strap.', 'Not worth the price.', 'They hurt immediately.', 'Unusable for me.'],
            note: ['The footbed peeled at the heel.', 'They smelled strong.', 'Sizing was way off.', 'The sole cracked at the ball of the foot.', 'Color rubbed off.', 'They offered no grip in the shower.'],
            end: ['I expected them to last.', 'Packaging was fine.', 'Skip this pair.', 'This one missed.']
        }
    },
    socks: {
        5: {
            lead: ['Socks are soft and they stay up.', 'No slipping inside the shoe.', 'Exactly what I wanted with my pair.', 'Thick in a good way.', 'True to size.', 'Comfortable all day.'],
            note: ['The cuff does not cut in.', 'They did not pill in the wash.', 'Cushion sits under the heel.', 'Color matches the photo.', 'They breathe with the shoes I bought.', 'Pairs stayed matched in the laundry.'],
            end: ['Buying another pack.', 'Great with Jordans.', 'Shipping was fast.', 'Would order these again.']
        },
        4: {
            lead: ['Good socks.', 'Comfortable and well made.', 'Happy with the pack.', 'Close to the photos.', 'They stay up.', 'Nice with the shoes I ordered.'],
            note: ['A little warm for midday.', 'The cuff is snug at first.', 'Cushion is thinner than I expected.', 'They softened after one wash.', 'Length is right at the ankle.', 'Color is slightly brighter in person.'],
            end: ['Still a good buy.', 'No holes after a few washes.', 'I would get them again.', 'Worth it.']
        },
        3: {
            lead: ['They are fine.', 'Average socks.', 'They work.', 'Nothing special.', 'Okay for the gym.', 'Usable, not plush.'],
            note: ['They slip a little in the heel.', 'The cuff rolls down.', 'Thinner than the photo suggests.', 'One pair was shorter than the others.', 'They warm up fast.', 'Cushion is flat.'],
            end: ['I will wear them as backups.', 'Shipping was fine.', 'Expected a bit more.', 'Okay in a multi-pack.']
        },
        2: {
            lead: ['Socks ran small.', 'Not as described.', 'The fit was off.', 'Disappointed.', 'Ankle opening is tight.', 'They do not stay up.'],
            note: ['The cuff left a mark.', 'They bunched under my heel.', 'Fabric feels scratchy.', 'They shrank in the wash.', 'Color looked gray.', 'Cushion disappeared after one run.'],
            end: ['Not ordering this pack again.', 'Quality is below what I hoped.', 'Size up if you try them.', 'I expected them to stay put.']
        },
        1: {
            lead: ['A hole showed up on the first wear.', 'Would not order these again.', 'Arrived with a pulled thread.', 'Not worth the price.', 'Unwearable with my shoes.', 'The pack was inconsistent.'],
            note: ['One sock was already thin at the toe.', 'They smelled strong.', 'The size was far off.', 'Color bled in the wash.', 'The cuff unraveled.', 'They slipped off my heel immediately.'],
            end: ['I expected a basic wearable pack.', 'Packaging was fine.', 'Skip these.', 'This missed.']
        }
    },
    caps: {
        5: {
            lead: ['Cap fits well.', 'The brim keeps its shape.', 'Exactly the cap I was looking for.', 'Sits right on my head.', 'Color is clean in person.', 'True to the photos.'],
            note: ['The strap adjusts easily.', 'Sweatband is comfortable.', 'Embroidery is neat.', 'It does not sit too high.', 'Crown is structured.', 'It matches the shoes I bought.'],
            end: ['Would buy another color.', 'Shipping was careful.', 'Already wearing it out.', 'Great quality.']
        },
        4: {
            lead: ['Good cap.', 'Nice color.', 'Happy with it.', 'Close to the listing.', 'Fits after I set the strap.', 'Looks sharp.'],
            note: ['The brim is stiff at first.', 'Sweatband is a little thin.', 'It runs slightly large.', 'Embroidery is clean.', 'Color is a shade darker than the photo.', 'The strap hardware is solid.'],
            end: ['Still recommend it.', 'No loose stitches.', 'I would get another.', 'Worth the price.']
        },
        3: {
            lead: ['The cap is alright.', 'Average.', 'Wearable.', 'Looks clean, nothing more.', 'Fine for the sun.', 'Okay for the price.'],
            note: ['The brim is stiff.', 'Sweatband is thin.', 'It sits higher than I like.', 'The strap is fiddly.', 'Color is flatter in person.', 'Crown is softer than the photo.'],
            end: ['I will wear it on errands.', 'Shipping was on time.', 'Expected a bit more structure.', 'Okay as a spare.']
        },
        2: {
            lead: ['The fit was off.', 'Not as described.', 'Disappointed.', 'It looks cheaper in person.', 'The brim wilted.', 'Strap is awkward.'],
            note: ['Sweatband itches.', 'Embroidery is crooked.', 'It slips on my head.', 'Color does not match the photo.', 'The crown collapsed.', 'Stitching is loose at the panel.'],
            end: ['Not ordering this cap again.', 'Quality is below what I hoped.', 'I expected it to hold its shape.', 'Would skip this one.']
        },
        1: {
            lead: ['The strap broke after two weeks.', 'Would not order this again.', 'Arrived misshapen.', 'Not worth the price.', 'Unwearable for me.', 'It did not match the listing.'],
            note: ['A panel seam opened.', 'The brim cracked.', 'Hardware snapped.', 'Color rubbed off on my hands.', 'It smelled strong.', 'The size was nowhere near a normal fit.'],
            end: ['I expected a basic cap to last.', 'Packaging was fine.', 'Skip this one.', 'This missed.']
        }
    }
}

const ratingLadder = [5, 5, 5, 4, 5, 4, 5, 4, 3, 5, 4, 5, 2, 4, 5, 3, 5, 4, 1, 5, 4, 5]

const reviewCountFor = (kind, index) => {
    const base = { shoes: 18, jackets: 14, slides: 13, shorts: 12, tops: 11, caps: 10, socks: 8 }[kind] || 10
    return base + ((index * 5) % 11)
}

const voiceKind = (kind, name) => {
    const label = String(name || '').toLowerCase()
    if (label.includes('sock')) return 'socks'
    if (label.includes('cap') || label.includes('hat')) return 'caps'
    if (label.includes('slide') || label.includes('mule')) return 'slides'
    if (label.includes('hoodie') || label.includes('jacket') || label.includes('fleece') || label.includes('1/4-zip')) return 'jackets'
    if (label.includes('top') || label.includes('shirt') || label.includes('tank') || label.includes('tee')) return 'tops'
    if (label.includes('short')) return 'shorts'
    return reviewVoice[kind] ? kind : 'tops'
}

const reviewComment = (kind, rating, product, n) => {
    const bank = (reviewVoice[kind] || reviewVoice.tops)[rating]
    const lead = bank.lead[n % bank.lead.length]
    const note = bank.note[(n * 3) % bank.note.length]
    const end = bank.end[(n * 5) % bank.end.length]
    const sizes = product.sizes || []
    const size = sizes.length && n % 3 === 0 ? ` Went with ${sizes[n % sizes.length].label}.` : ''
    return `${lead} ${note} ${end}${size}`
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
    await Counter.findOneAndUpdate({ _id: 'User' }, { seq: users.length }, { upsert: true })
    const admin = createdUsers.find(person => person.email === 'admin@jtrade.com')
    const people = Object.fromEntries(createdUsers.map(person => [person.name, person]))
    const traders = {
        nico: people['Nico Barredo'],
        jerome: people['Jerome Aguila'],
        jonel: people['Jonel Caisip'],
        marcus: people['Marcus Aristain'],
        miguel: people['Miguel Co'],
        joseph: people['Joseph Coronado'],
        regan: people['Regan Asino'],
        user: people['User']
    }

    const createdProducts = await Product.create(
        products.map((item, index) => ({
            ...item,
            seller: sellerNames[index % sellerNames.length],
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

    const buyers = createdUsers.filter(user => user.role === 'user')
    const addressFor = (index) => {
        const place = morePlaces[index % morePlaces.length]
        return {
            address: place[0],
            city: place[1],
            phoneNo: `0917${String(index).padStart(7, '0')}`,
            postalCode: place[2],
            country: 'Philippines'
        }
    }

    const makeOrder = (person, address, lines, status, paidAt) => {
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
            shippingInfo: address,
            user: person._id,
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

    const reviewLines = []
    createdProducts.forEach((product, index) => {
        const kind = voiceKind(catalog[index].kind, product.name)
        const count = Math.min(reviewCountFor(kind, index), buyers.length)
        const start = (index * 3) % buyers.length
        const used = new Set()
        for (let offset = 0; offset < count; offset += 1) {
            const person = buyers[(start + offset) % buyers.length]
            const rating = ratingLadder[(index * 3 + offset) % ratingLadder.length]
            let comment = ''
            let attempt = offset
            do {
                comment = reviewComment(kind, rating, product, index + attempt)
                if (used.has(comment)) comment = `${comment} (${attempt + 1})`
                attempt += 1
            } while (used.has(comment))
            used.add(comment)
            reviewLines.push([person, product, rating, comment])
        }
    })

    const purchases = new Map()
    reviewLines.forEach(([person, product]) => {
        const names = purchases.get(person._id) || []
        names.push(product.name)
        purchases.set(person._id, names)
    })

    const deliveredOrders = []
    buyers.forEach((person, index) => {
        const names = purchases.get(person._id) || []
        for (let start = 0; start < names.length; start += 3) {
            const paidAt = new Date(2025, 5, 4)
            paidAt.setDate(paidAt.getDate() + ((index * 11 + start) % 460))
            deliveredOrders.push(makeOrder(
                person,
                addressFor(index),
                names.slice(start, start + 3).map(name => [name, 1]),
                'Delivered',
                paidAt
            ))
        }
    })

    const buyerAt = (name) => {
        const person = people[name]
        return { person, address: addressFor(buyers.findIndex(item => item._id === person._id)) }
    }
    const kyla = buyerAt('Kyla Baguis')
    const vincent = buyerAt('Vincent Barliso')
    const emman = buyerAt('Emman Bayani')
    const julia = buyerAt('Julia Datang')

    await Order.create([
        ...deliveredOrders,
        makeOrder(kyla.person, kyla.address, [[shoes[2].name, 1], [accessories[1].name, 1]], 'Shipped', new Date('2026-06-16')),
        makeOrder(vincent.person, vincent.address, [[clothes[2].name, 1]], 'Shipped', new Date('2026-07-08')),
        makeOrder(emman.person, emman.address, [[shoes[3].name, 1]], 'Shipped', new Date('2026-08-19')),
        makeOrder(julia.person, julia.address, [[accessories[2].name, 1]], 'Processing', new Date('2026-09-11')),
        makeOrder(kyla.person, kyla.address, [[clothes[3].name, 1]], 'Processing', new Date('2026-10-02'))
    ])

    const reviewCounter = await Counter.findOneAndUpdate(
        { _id: 'review' },
        { $inc: { seq: reviewLines.length } },
        { returnDocument: 'after', upsert: true }
    )
    const firstReviewId = reviewCounter.seq - reviewLines.length + 1

    reviewLines.forEach(([person, product, rating, comment], index) => {
        product.reviews.push({
            _id: firstReviewId + index,
            user: person._id,
            name: person.name,
            rating,
            comment
        })
    })

    const reviewedProducts = [...new Set(reviewLines.map(([, product]) => product))]
    for (const product of reviewedProducts) {
        product.numOfReviews = product.reviews.length
        product.ratings = Number((product.reviews.reduce((sum, item) => sum + item.rating, 0) / product.reviews.length).toFixed(1))
        await product.save()
    }

    const shoePhotos = catalog.filter(item => item.category === 'Shoes')
    const offer = (photoIndex, shopperKey, fields) => {
        const person = traders[shopperKey]
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

    const createdOffers = await Product.create(['nico', 'jerome', 'jonel', 'marcus', 'miguel', 'joseph', 'regan', 'user'].flatMap((key, index) => {
        const person = traders[key]
        const condition = ['Good', 'New', 'Fair'][index % 3]
        const saleStatus = ['pending', 'approved', 'rejected'][index % 3]
        const tradeStatus = ['approved', 'pending', 'rejected'][index % 3]
        return [
            offer(index, key, {
                name: `${person.name} Air Jordan Sale`,
                price: 4200 + index * 450,
                description: `${person.name} is selling this pair. ${condition} condition.`,
            listingType: 'sale',
                status: saleStatus,
                condition,
                sizes: [{ label: `US ${7 + (index % 5)}`, stock: 1 }]
            }),
            offer(index + 8, key, {
                name: `${person.name} Jordan Trade`,
            price: 0,
                description: `${person.name} wants to trade this pair. ${condition} condition.`,
            listingType: 'trade',
                status: tradeStatus,
                condition,
                offerNote: 'Open to a clean Jordan in the same size.',
                sizes: [{ label: `US ${8 + (index % 4)}`, stock: 1 }]
            })
        ]
    }))

    console.log('Sample data added.')
    console.log(`${createdProducts.length} products, ${createdOffers.length} offers, ${createdUsers.length} users, ${deliveredOrders.length + 5} orders, ${reviewLines.length} reviews.`)
    console.log('Admins use password admin123: admin@jtrade.com, tim.tan@jtrade.com, jm.tianzon@jtrade.com')
    console.log('Users use password user123, including user@jtrade.com')
    console.log(`Sellers and traders: ${sellerNames.join(', ')}`)
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
