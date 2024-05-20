const mongoose = require('mongoose')
const moment = require('moment')  
const orderSchema = mongoose.Schema({

    trackingId:{
        type:String,
        default:function(){
           return Math.floor(100000 + Math.random() * 900000).toString();
        },
        unique:true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                require: true
            },
            price: {
                type: Number,
                default: 0,                
            },
            quantity: {
                type: Number,
                required: true,
            },
            status: {
                type: String,
                enum: ["Pending", "Shipped", "Delivered", "Cancelled", "Returned"],
                default: "Pending",
            },
        }
    ],
    totalprice: {
        type: Number,
        default: 0
    },
    billingdetails:{
        name: String,
        buildingname:String,
        city: String,
        street: String,
        state: String,
        country: String,
        postalCode: String,
        phone: String,
        email: String,
    },
    amount: {
        type: Number
    },
    paymentMethod: {
    type: String,
    required: true,
    },
    paymentStatus: {
        type: String,
        required: true,
        default: 'pending'
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    orderDate: {
        type: Date,
        default: Date.now,
        get: function(val){
            return moment(val).format('DD-MM-YYYY')
        }
    },

})



module.exports= mongoose.model('Order',orderSchema)