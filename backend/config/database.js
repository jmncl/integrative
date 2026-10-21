const mongoose = require('mongoose');

mongoose.set('bufferCommands', false)

let connecting = false

const connectDatabase = () => {
    if (connecting || mongoose.connection.readyState === 1) return
    connecting = true
    mongoose.connect(process.env.DB_URI, {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000,
        socketTimeoutMS: 8000
    }).then(con => {
        connecting = false
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`)
    }).catch(error => {
        connecting = false
        console.log('Could not connect to the database.')
        console.log(error.message)
        setTimeout(connectDatabase, 8000)
    })
}

module.exports = connectDatabase