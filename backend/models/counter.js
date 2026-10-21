const mongoose = require('mongoose')

const counterSchema = new mongoose.Schema({
    _id: String,
    seq: { type: Number, default: 0 }
})

const Counter = mongoose.model('Counter', counterSchema)

const nextNumber = async (name) => {
    const counter = await Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { seq: 1 } },
        { returnDocument: 'after', upsert: true }
    )
    return counter.seq
}

const assignNumber = (name) => async function () {
    if (this.isNew && typeof this._id !== 'number') {
        this._id = await nextNumber(name)
    }
}

module.exports = { Counter, nextNumber, assignNumber }
