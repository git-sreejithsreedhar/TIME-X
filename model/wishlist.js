const mongoose = require('mongoose')
const wishlistSchema = mongoose.Schema ({

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
            ref: 'Product',
            require: true                
        },
        stockStatus: {
            type: String,
            ref: 'Product',
            require: true
        },
        wishlistDate: {
            type: Date,
            default: Date.now
        }
    }
],


})

module.exports = mongoose.model('Wishlist', wishlistSchema);

