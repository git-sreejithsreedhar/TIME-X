// const mongoose = require('mongoose');

// const productSchema = mongoose.Schema({
//     productname: {
//         type: String,
//         required: true
//     },
//     category: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Category',
//         required: true
//     },
//     categoryDiscount: {
//         type: Number,
//     },
//     brand: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Brand',
//         required: true 
//     },
//     movementType: {
//         type: String
//     },
//     bandColour: {
//         type: String
//     },
//     caseDiameter: {
//         type: Number
//     },
//     description: {
//         type: String
//     },
//     price: {
//         type: Number,
//         required: true
//     },
//     oldprice: {
//         type: Number,
//         required: true
//     },
//     stock: {
//         type: Number,
//         default: 0,
//         required: true
//     },
//     images: [{
//         type: String
//     }],
    
//     ispublished: {
//         type: Boolean,
//         default: true
//     },
//     created: {
//         type: Date,
//         required: true,
//         default: Date.now
//     },
    
// });

// productSchema.pre('save', async function(next) {
//     try {
//         const category = await mongoose.model('Category').findById(this.category);
//         if (category) {
//             this.categoryDiscount = category.discount;
//         }

//         let disc = Math.floor((category.discount * this.oldprice) / 100);
//         consle.log(his.oldprice - disc)
//         if (disc === 0 || this.price > this.oldprice - disc) {
//             this.price = this.oldprice - disc
//             console.log(this.price)
//         }
//         next();
//     } catch (error) {
//         next('error in productSchema :', error);
//     }
// });

    

// module.exports = mongoose.model('Product', productSchema); 

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
    categoryDiscount: {
        type: Number,
    },
    productDiscount: {
        type: Number,
        required: true
    },
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

// Method to update price based on category discount
productSchema.methods.updatePriceBasedOnCategory = async function() {

   
    const category = await mongoose.model('Category').findById(this.category);
    if (category && typeof category.discount === 'number') {
        this.categoryDiscount = category.discount;
        
            
        if (category.discount === 0 ||  category.discount < this.productDiscount) {
            const discount = Math.floor((this.productDiscount * this.oldprice) / 100);
            this.price = this.oldprice - discount;

        } else {

            const discount = Math.floor((category.discount * this.oldprice) / 100);
            this.price = this.oldprice - discount;
        }
    }
};

productSchema.pre('save', async function(next) {
    try {
        await this.updatePriceBasedOnCategory();
        next();
    } catch (error) {
        next(new Error('Error in productSchema pre-save middleware: ' + error.message));
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
