const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    category: {
        type: String,
        required: true 
    },
    isListed: {
        type: Boolean,
        default: true 
    },
    description: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    time: {
        type: Date,
        default: Date.now
    }
});

categorySchema.post('findOneAndUpdate', async function(doc) {
    try {
        // Ensure the updated document is retrieved
        const category = await this.model.findOne(this.getQuery());
        if (category) {
            const Product = mongoose.model('Product');
            const products = await Product.find({ category: category._id });

            // const productOffer = products.productOffer

            for (let product of products) {
                await product.updatePriceBasedOnCategory();
                await product.save();
            }
        }
    } catch (error) {
        console.error('Error in category post-update middleware:', error);
    }
});




module.exports = mongoose.model('Category', categorySchema);
