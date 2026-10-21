const PDFDocument = require('pdfkit')

const money = (value) => `PHP ${Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const buildReceipt = (order) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 })
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const code = order.code || `JO${order._id}`
    const customer = order.user && order.user.name ? order.user.name : 'Customer'
    const email = order.user && order.user.email ? order.user.email : ''

    doc.fontSize(20).text('J-Trade receipt')
    doc.moveDown(0.4)
    doc.fontSize(12).text(`Order ${code}`)
    doc.text(`Status: ${order.orderStatus}`)
    doc.text(`Customer: ${customer}`)
    if (email) doc.text(`Email: ${email}`)
    doc.moveDown()
    doc.fontSize(13).text('Items')
    doc.moveDown(0.4)

    ;(order.orderItems || []).forEach((item) => {
        const subtotal = Number(item.price) * Number(item.quantity)
        doc.fontSize(11).text(`${item.name}${item.size ? ` (${item.size})` : ''}`)
        doc.text(`${item.quantity} x ${money(item.price)} = ${money(subtotal)}`)
        doc.moveDown(0.3)
    })

    doc.moveDown(0.4)
    doc.text(`Items subtotal: ${money(order.itemsPrice)}`)
    doc.text(`Shipping: ${money(order.shippingPrice)}`)
    doc.text(`VAT: ${money(order.taxPrice)}`)
    doc.fontSize(13).text(`Grand total: ${money(order.totalPrice)}`)
    doc.end()
})

const receiptHtml = (order) => {
    const code = order.code || `JO${order._id}`
    const rows = (order.orderItems || []).map((item) => {
        const subtotal = Number(item.price) * Number(item.quantity)
        return `<tr><td>${item.name}${item.size ? ` (${item.size})` : ''}</td><td>${item.quantity}</td><td>${money(item.price)}</td><td>${money(subtotal)}</td></tr>`
    }).join('')
    return `
        <h2>J-Trade order ${code}</h2>
        <p>Status: <strong>${order.orderStatus}</strong></p>
        <table cellpadding="6" cellspacing="0" border="1">
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
            ${rows}
        </table>
        <p>Items subtotal: ${money(order.itemsPrice)}</p>
        <p>Shipping: ${money(order.shippingPrice)}</p>
        <p>VAT: ${money(order.taxPrice)}</p>
        <p><strong>Grand total: ${money(order.totalPrice)}</strong></p>
        <p>The PDF receipt is attached.</p>
    `
}

module.exports = { buildReceipt, receiptHtml }
