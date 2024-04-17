const mongoose = require('mongoose');

var oderSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    SDT:String,
    email:String,
    price: Number,
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    address: String,
    isDeleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })
oderSchema.virtual('published', {
    ref: 'oderdetail',
    localField: '_id',
    foreignField: 'oder'
})
oderSchema.set('toObject', { virtuals: true })
oderSchema.set('toJSON', { virtuals: true })
module.exports = new mongoose.model('oder', oderSchema)