const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    productname: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    // categoryDiscount: {
    //     type: Number,
    // },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true 
    },
    movementType: {
        type: String
    },
    bandColour: {
        type: String
    },
    caseDiameter: {
        type: Number
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    oldprice: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0,
        required: true
    },
    images: [{
        type: String
    }],
    
    ispublished: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        required: true,
        default: Date.now
    },
    
});

// productSchema.pre('save', async function(next) {
//     try {
//         const category = await mongoose.model('Category').findById(this.category);
//         if (category) {
//             this.categoryDiscount = category.discount;
//         }
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = mongoose.model('Product', productSchema); 
