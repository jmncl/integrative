const nodemailer = require('nodemailer');

const sendWithMailtrapApi = async (options) => {
    const inboxId = process.env.MAILTRAP_INBOX_ID
    const url = inboxId
        ? `https://sandbox.api.mailtrap.io/api/send/${inboxId}`
        : 'https://send.api.mailtrap.io/api/send'

    const attachmentList = (options.attachments || []).map((file) => ({
        filename: file.filename || 'attachment.pdf',
        content: Buffer.isBuffer(file.content)
            ? file.content.toString('base64')
            : Buffer.from(file.content || '').toString('base64'),
        type: file.contentType || 'application/pdf',
        disposition: 'attachment'
    }))

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.MAILTRAP_API_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: {
                email: process.env.MAILTRAP_FROM_EMAIL || 'noreply@jtrade.test',
                name: process.env.SMTP_FROM_NAME || 'J-Trade'
            },
            to: [{ email: options.email }],
            subject: options.subject,
            html: options.html || `<p>${options.message || ''}</p>`,
            attachments: attachmentList.length ? attachmentList : undefined
        })
    })

    if (!response.ok) {
        const body = await response.text()
        throw new Error(body || `Mailtrap API error ${response.status}`)
    }
}

const sendWithMailtrapSmtp = async (options) => {
    // Port 2525 works on Render free; 587/465 are blocked there
    const port = Number(process.env.MAILTRAP_PORT || 2525)
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
        port,
        secure: false,
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    })

    await transporter.sendMail({
        from: `${process.env.SMTP_FROM_NAME || 'J-Trade'} <${process.env.MAILTRAP_FROM_EMAIL || 'noreply@jtrade.test'}>`,
        to: options.email,
        subject: options.subject,
        html: options.html || `<p>${options.message || ''}</p>`,
        attachments: options.attachments || []
    })
}

const sendEmail = async (options) => {
    if (process.env.MAILTRAP_API_TOKEN) {
        return sendWithMailtrapApi(options)
    }

    if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
        throw new Error('Mailtrap is not configured. Add MAILTRAP_USER and MAILTRAP_PASS (or MAILTRAP_API_TOKEN).')
    }

    try {
        await sendWithMailtrapSmtp(options)
    } catch (error) {
        const msg = String(error.message || error)
        if (/timeout|timed out|ETIMEDOUT|ECONNREFUSED/i.test(msg)) {
            throw new Error('Mailtrap SMTP timed out. Use MAILTRAP_PORT=2525 or MAILTRAP_API_TOKEN.')
        }
        throw error
    }
}

module.exports = sendEmail;
