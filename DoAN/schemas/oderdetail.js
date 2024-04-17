const mongoose = require('mongoose');

var oderdetailSchema = mongoose.Schema({
    nameproduct: {
        type: String,
        required: true,
        unique: true
    },
    image:String,
    price:Number,
    quantity: Number,
    oder: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'oder'
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })

module.exports = new mongoose.model('oderdetail', oderdetailSchema)