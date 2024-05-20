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

module.exports = mongoose.model('Category', categorySchema);
