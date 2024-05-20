const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true  // Corrected typo: changed 'require' to 'required'
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',  // Corrected typo: changed 'product' to 'Product'
            required: true
        },
        price: {
            type: Number,
            ref: 'Product',
            required: true
        },
        // price: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: 'Product',
        //     required: true
        // },
        quantity: {
            type: Number,
            required: true
        }
    }],
    totalprice: {
        type: Number,
        default: 0
    },
    time: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', cartSchema);
