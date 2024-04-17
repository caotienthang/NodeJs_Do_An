const mongoose = require('mongoose');

var productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    year: Number,
    price: Number,
    image: String,
    isDeleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })
module.exports = new mongoose.model('product', productSchema)