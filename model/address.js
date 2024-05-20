const mongoose = require('mongoose')
const addressSchema = mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    addresses: [
        {
            buildingname: {
                type: String,
                required: true
            },
            pincode: {
                type: Number,
                required: true
            },
            street: {
                type: String,
                required: true
            },
            city: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            },

        }
    ]
})

module.exports= mongoose.model('Address',addressSchema)