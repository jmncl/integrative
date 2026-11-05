const User = require('../models/user');
const crypto = require('crypto')
const cloudinary = require('cloudinary')
const sendToken = require('../utils/jwtToken');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, avatar } = req.body || {}

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter your name, email, and password' })
        }
        if (!avatar) {
            return res.status(400).json({ message: 'Please choose a profile photo' })
        }
        if (String(password).length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }

        const result = await cloudinary.v2.uploader.upload(avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        });
        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: result.public_id,
                url: result.secure_url
            }
        })
        user.password = undefined
        sendToken(user, 201, res)
    } catch (error) {
        const message = error.code === 11000
            ? 'That email is already registered'
            : (error.message || 'Could not register')
        return res.status(400).json({ message })
    }
}

exports.firebaseLogin = async (req, res) => {
    try {
        const idToken = req.body && req.body.idToken
        if (!idToken || !process.env.FIREBASE_API_KEY) {
            return res.status(400).json({ message: 'Google login is not configured yet. Add the Firebase web API key.' })
        }
        const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
        })
        const data = await lookup.json()
        const person = data.users && data.users[0]
        if (!lookup.ok || !person || !person.email) {
            return res.status(401).json({ message: 'Google login failed' })
        }
        const provider = (person.providerUserInfo || []).find(item => item.photoUrl || item.displayName) || {}
        const sentPhoto = String(req.body.photoURL || '')
        const photo = [person.photoUrl, provider.photoUrl, sentPhoto].find(url => String(url || '').startsWith('https://')) || ''
        const name = String(person.displayName || provider.displayName || 'Google User').slice(0, 30)
        let user = await User.findOne({ email: person.email })
        if (user && user.deletedAt) {
            return res.status(401).json({ message: 'Google login failed' })
        }
        const avatar = {
            public_id: `google-${person.localId}`,
            url: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111111&color=ffffff`
        }
        if (!user) {
            user = await User.create({
                name,
                email: person.email,
                password: crypto.randomBytes(18).toString('hex'),
                avatar
            })
        } else if (photo && String(user.avatar?.public_id || '').startsWith('google-') && user.avatar?.url !== photo) {
            user.avatar = avatar
            await user.save({ validateBeforeSave: false })
        }
        sendToken(user, 200, res)
    } catch (error) {
        return res.status(400).json({ message: error.message || 'Google login failed' })
    }
}

exports.loginUser = async (req, res, next) => {
    console.log(req.body)
    const { email, password } = req.body;

    // Checks if email and password is entered by user
    if (!email || !password) {
        return res.status(400).json({ error: 'Please enter email & password' })
    }


    // Finding user in database

    let user = await User.findOne({ email }).select('+password')
    if (!user || user.deletedAt) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }


    // Checks if password is correct or not
    const isPasswordMatched = await user.comparePassword(password);


    if (!isPasswordMatched) {
        return res.status(401).json({ message: 'Invalid Email or Password' })
    }
    // const token = user.getJwtToken();

    // res.status(201).json({
    //     success: true,
    //     token,
    //     user
    // });
    user = await User.findOne({ email })
    sendToken(user, 200, res)
}

exports.forgotPassword = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Password email is turned off for now.'
    })
}

exports.resetPassword = async (req, res, next) => {
    console.log(req.params.token)
    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })
    console.log(user)

    if (!user) {
        return res.status(400).json({ message: 'Password reset token is invalid or has been expired' })

    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({ message: 'Password does not match' })

    }

    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    const token = user.getJwtToken();
    return res.status(201).json({
        success: true,
        token,
        user
    });

}

exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    console.log(user)

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updateProfile = async (req, res, next) => {

    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    if (req.body.avatar && req.body.avatar !== '') {
        const currentUser = await User.findById(req.user.id)
        if (currentUser.avatar && currentUser.avatar.public_id && currentUser.avatar.public_id !== 'no-photo') {
            await cloudinary.v2.uploader.destroy(currentUser.avatar.public_id)
        }
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: "scale"
        })
        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
    })
    if (!user) {
        return res.status(401).json({ message: 'User Not Updated' })
    }

    return res.status(200).json({
        success: true,
        user
    })
}

exports.updatePassword = async (req, res, next) => {
    console.log(req.body.password)
    const user = await User.findById(req.user.id).select('+password');
    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return res.status(400).json({ message: 'Old password is incorrect' })
    }
    user.password = req.body.password;
    await user.save();
    const token = user.getJwtToken();

    return res.status(201).json({
        success: true,
        user,
        token
    });

}

exports.allUsers = async (req, res, next) => {
    const users = await User.find({
        deletedAt: req.query.deleted === '1' ? { $ne: null } : null
    });
    res.status(200).json({
        success: true,
        users
    })
}

exports.deleteUser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id, deletedAt: null })
    if (!user) {
        return res.status(401).json({ message: `User does not found with id: ${req.params.id}` })
    }
    if (String(user._id) === String(req.user._id)) {
        return res.status(400).json({ message: 'You cannot delete your own account' })
    }
    user.deletedAt = new Date()
    await user.save({ validateBeforeSave: false })
    return res.status(200).json({ success: true })
}

exports.restoreUsers = async (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Number.isFinite) : []
    if (!ids.length) return res.status(400).json({ success: false, message: 'Select at least one user' })
    await User.updateMany({ _id: { $in: ids }, deletedAt: { $ne: null } }, { deletedAt: null })
    return res.status(200).json({ success: true })
}

exports.deleteUsers = async (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Number.isFinite) : []
    const chosen = ids.filter(id => String(id) !== String(req.user._id))
    if (!chosen.length) return res.status(400).json({ success: false, message: 'Select at least one user' })
    await User.updateMany({ _id: { $in: chosen }, deletedAt: null }, { deletedAt: new Date() })
    return res.status(200).json({ success: true })
}

exports.getUserDetails = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(400).json({ message: `User does not found with id: ${req.params.id}` })
        // return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
}

exports.updateUser = async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        // useFindAndModify: false
    })

    return res.status(200).json({
        success: true
    })
}

exports.logout = async (req, res, next) => {
    res.cookie('token', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    })

    return res.status(200).json({
        success: true,
        message: 'Logged out'
    })
}