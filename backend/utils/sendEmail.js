const nodemailer = require('nodemailer');

const sendWithBrevo = async (options) => {
    const attachmentList = (options.attachments || []).map((file) => ({
        name: file.filename || 'attachment.pdf',
        content: Buffer.isBuffer(file.content)
            ? file.content.toString('base64')
            : Buffer.from(file.content || '').toString('base64')
    }))

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
            sender: {
                name: process.env.SMTP_FROM_NAME || 'J-Trade',
                email: process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL
            },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.html || `<p>${options.message || ''}</p>`,
            attachment: attachmentList.length ? attachmentList : undefined
        })
    })

    if (!response.ok) {
        const body = await response.text()
        throw new Error(body || `Brevo error ${response.status}`)
    }
}

const sendWithResend = async (options) => {
    const attachmentList = (options.attachments || []).map((file) => ({
        filename: file.filename || 'attachment.pdf',
        content: Buffer.isBuffer(file.content)
            ? file.content.toString('base64')
            : Buffer.from(file.content || '').toString('base64')
    }))

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: `${process.env.SMTP_FROM_NAME || 'J-Trade'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL || 'onboarding@resend.dev'}>`,
            to: [options.email],
            subject: options.subject,
            html: options.html || `<p>${options.message || ''}</p>`,
            attachments: attachmentList.length ? attachmentList : undefined
        })
    })

    if (!response.ok) {
        const body = await response.text()
        throw new Error(body || `Resend error ${response.status}`)
    }
}

const sendWithSmtp = async (options) => {
    const port = Number(process.env.SMTP_PORT) || 587
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        requireTLS: port === 587,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })

    await transporter.sendMail({
        from: `${process.env.SMTP_FROM_NAME || 'J-Trade'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.html || `<p>${options.message || ''}</p>`,
        attachments: options.attachments || []
    })
}

const sendEmail = async (options) => {
    if (process.env.BREVO_API_KEY) {
        return sendWithBrevo(options)
    }
    if (process.env.RESEND_API_KEY) {
        return sendWithResend(options)
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
        throw new Error('No email provider configured. Add BREVO_API_KEY on Render (free SMTP is blocked).')
    }
    try {
        await sendWithSmtp(options)
    } catch (error) {
        const msg = String(error.message || error)
        if (/timeout|timed out|ETIMEDOUT|ECONNREFUSED|ENOTFOUND/i.test(msg)) {
            throw new Error('SMTP blocked on Render free plan. Add BREVO_API_KEY (HTTPS) or upgrade the web service.')
        }
        throw error
    }
}

module.exports = sendEmail;
