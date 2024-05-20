const mongoose = require('mongoose')


const ratingschema = mongoose.scheema ({

    ratings: {
        type: {
            '1': { type: Number, default: 0 },
            '2': { type: Number, default: 0 },
            '3': { type: Number, default: 0 },
            '4': { type: Number, default: 0 },
            '5': { type: Number, default: 0 }
        },
        default: {
            '1': 0,
            '2': 0,
            '3': 0,
            '4': 0,
            '5': 0
        }
        },
    reviews: {
        type: String
    },

    ispublished: {
        type: Boolean,
        default: true
    },

    created: {
        type: Date,
        required: true,
        default: Date.now
    }


});

model.exports = moongose.model('rating', ratingschema)
